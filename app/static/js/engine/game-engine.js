import { loadProgress } from '../api/api.js';
let currentEmail = null;
let attemptId = null;



export function showRecordCelebration(oldTime, newTime) {
    const el = document.getElementById('record-celebration');
    const text = el.querySelector('.record-time');

    text.textContent = `Было: ${oldTime}с → Стало: ${newTime}с`;

    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 3000);
}


document.addEventListener("DOMContentLoaded", loadProgress);

export async function saveResult(isCorrect, stage, question, taskStartedAt) {
    

    const wastedTime = Math.floor((Date.now() - taskStartedAt) / 1000); // в секундах
    console.log(wastedTime);
    try {
        const res = await fetch(`/api/stage/${stage}/q/${question}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                correct: isCorrect,
                stage_number: stage,
                question_number: question,
                correct: isCorrect,
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
