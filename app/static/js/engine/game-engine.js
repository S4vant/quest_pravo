import { getBestTime } from '../api/api.js';
import { formatTime } from './timer.js';
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

    currentEl.textContent = formatTime(current);

    
    if (best !== null && best !== undefined) {
        bestEl.textContent = formatTime(best);
        console.log(best, "-", current);
        const diff = best - current;
        if (diff > 0) {
            deltaEl.textContent = `Лучше на ${formatTime(diff)}`;
            deltaEl.className = 'delta-time better';
        } else if (diff < 0) {
            deltaEl.textContent = `Хуже на ${formatTime(Math.abs(diff))}`;
            deltaEl.className = 'delta-time worse';
        } else {
            deltaEl.textContent = 'Повтор рекорда';
        }
    } else {
        bestEl.textContent = '—';
        deltaEl.textContent = '';
    }

    if (message) {
        overlay.querySelector('.result-message').textContent = message;
    }

    overlay.classList.remove('hidden');
}

export async function showFailOverlay(wrapper, reason) {
    const elapsed =
        Math.floor((Date.now() - wrapper._startTime) / 1000) +
        (wrapper._penalty || 0);

    const besttime = await getBestTime(Number(wrapper.dataset.stage), Number(wrapper.dataset.question));
    await showResultOverlay(wrapper, {
        current: elapsed,
        best: besttime,
        message: reason
    });
}


