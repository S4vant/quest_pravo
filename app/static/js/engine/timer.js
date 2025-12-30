import { gameState } from './state.js';

export function startLiveTimer() {
    const timerEl = document.getElementById('task-timer');
    if (!timerEl) return;

    clearInterval(gameState.timerInterval);

    gameState.timerInterval = setInterval(() => {
        if (!gameState.taskStartedAt) return;

        const seconds = Math.floor((Date.now() - gameState.taskStartedAt) / 1000);
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;

        timerEl.textContent = `⏱ ${min}:${sec.toString().padStart(2, '0')}`;
    }, 500);
}

export function stopTimer() {
    clearInterval(gameState.timerInterval);
}
export let taskStartedAt = null;
export let taskUnlocked = false;

export function initTaskWrapper() {
    const startBtn = document.getElementById('start-task-btn');
    if (!startBtn) return; // защита

    const timerEl = document.getElementById('start-timer');
    const cover = document.getElementById('task-cover');
    const content = document.getElementById('task-content');

    startBtn.addEventListener('click', () => {
        startBtn.disabled = true;
        timerEl.classList.remove('hidden');

        let timeLeft = 3;
        timerEl.textContent = timeLeft;

        const interval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft === 0) {
                clearInterval(interval);

                cover.classList.add('hidden');
                content.classList.remove('hidden');

                gameState.taskStartedAt = Date.now();
                taskUnlocked = true;

                startLiveTimer();
            }
        }, 1000);
    });
}