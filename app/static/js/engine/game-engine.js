
export function showRecordCelebration(oldTime, newTime) {
    const el = document.getElementById('record-celebration');
    if (!el) return; // ← защита

    const text = el.querySelector('.record-time');
    if (!text) return;

    text.textContent = `Было: ${oldTime}с → Стало: ${newTime}с`;
    el.classList.remove('hidden');

    setTimeout(() => el.classList.add('hidden'), 3000);
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

        const data = await res.json();
        if (!data.saved) {
            console.error("Не удалось сохранить ответ");
        }
    } catch (err) {
        console.error("Ошибка сохранения:", err);
    }
}
