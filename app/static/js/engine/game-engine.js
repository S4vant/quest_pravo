import { getBestTime } from '../api/api.js';
import { formatTime } from './timer.js';
import { progressStore } from '../engine/progress-store.js';
export function showRecordCelebration(oldTime, newTime) {
    console.log(oldTime,'=>', newTime);
    // const el = document.getElementById('record-celebration');
    // if (!el) return; // ← защита

    // const text = el.querySelector('.record-time');
    // if (!text) return;

    // text.textContent = `Было: ${oldTime}с → Стало: ${newTime}с`;
    // el.classList.remove('hidden');

    // setTimeout(() => el.classList.add('hidden'), 3000);
}

export async function saveResult(isCorrect, stage, question, wastedTime) {
    try {
        const prev = progressStore.getBest(stage, question);
        const isBetter = prev == null || wastedTime < prev;

        if (!isBetter) return;

        progressStore.setBest(stage, question, wastedTime);

        const res = await fetch(`/api/stage/${stage}/q/${question}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correct: isCorrect,
                stage_number: stage,
                question_number: question,
                wasted_time: wastedTime
            })
        });
        console.log(res);
        const data = await res.json();
        if (!data.saved) {
            console.error("Не удалось сохранить ответ");
        }
    } catch (err) {
        console.error("Ошибка сохранения:", err);
    }
}

export async function showResultOverlay(wrapper, { current, best, message }) {
    const overlay = wrapper.querySelector('.task-result-overlay');
    const currentEl = overlay.querySelector('.current-time');
    const bestEl = overlay.querySelector('.best-time');
    const deltaEl = overlay.querySelector('.delta-time');
    const resultMsgEl = overlay.querySelector('.result-message');

    currentEl.textContent = formatTime(current);

    if (best !== null && best !== undefined) {
        // Уже было прохождение
        bestEl.textContent = formatTime(best);
        const diff = best - current;

        if (diff > 0) {
            deltaEl.textContent = `Лучше на ${formatTime(diff)}`;
            deltaEl.className = 'delta-time better';
        } else if (diff < 0) {
            deltaEl.textContent = `Хуже на ${formatTime(Math.abs(diff))}`;
            deltaEl.className = 'delta-time worse';
        } else {
            deltaEl.textContent = 'Повтор рекорда';
            deltaEl.className = 'delta-time';
        }

        if (!message) resultMsgEl.textContent = 'Вы прошли задание снова';
        else resultMsgEl.textContent = message;
    } else {
        // Первое прохождение
        bestEl.textContent = '—';
        deltaEl.textContent = '';
        deltaEl.className = 'delta-time';

        resultMsgEl.textContent = message ?? 'Поздравляем! Вы прошли задание впервые!';
        resultMsgEl.classList.add('first-time'); // можно добавить спец. стиль
        // Здесь можно триггерить бонус
        // giveReward(); // функция начисления награды
    }

    overlay.classList.remove('hidden');
}

export async function showFailOverlay(wrapper, reason) {
    const elapsed =
        Math.floor((Date.now() - wrapper._startTime) / 1000) +
        (wrapper._penalty || 0);

    const besttime = progressStore.getBest(Number(wrapper.dataset.stage), Number(wrapper.dataset.question));
    await showResultOverlay(wrapper, {
        current: elapsed,
        best: besttime,
        message: reason
    });
}

export function fillTaskIntro(wrapper, meta) {
    const map = {
        time: 'Время на прохождение — 1 минута',
        penalty: 'Неправильный ответ: +5 секунд',
        help: 'Подсказка: +10 секунд',
        score: 'Чем быстрее ответ — тем больше очков'
    };

    for (const [key, text] of Object.entries(map)) {
        const el = wrapper.querySelector(`[data-hint="${key}"]`);
        if (el) el.textContent = text;
    }

    const recordEl = wrapper.querySelector('[data-hint="record"]');
    const best = progressStore.getBest(meta.stage, meta.question);

    recordEl.textContent = best !== null
        ? `Лучший результат: ${formatTime(best)}`
        : 'Рекорд ещё не установлен';
}
