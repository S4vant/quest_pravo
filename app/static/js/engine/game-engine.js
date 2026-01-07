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

export function showResultOverlay(wrapper, { current, best }) {

    const overlay = wrapper.querySelector('.task-result-overlay');
    const currentEl = overlay.querySelector('.current-time');
    const bestEl = overlay.querySelector('.best-time');
    const deltaEl = overlay.querySelector('.delta-time');

    currentEl.textContent = formatTime(current);
    bestEl.textContent = best ? formatTime(best) : '—';

    if (best) {
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
    }

    overlay.classList.remove('hidden');
}

export function showFailOverlay(wrapper, reason) {
    showResultOverlay(wrapper, {
        current: 60,
        best: null,
        message: reason
    });
}
