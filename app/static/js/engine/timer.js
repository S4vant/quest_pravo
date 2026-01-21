import { gameState } from './state.js';
import { } from '../utils/utils.js';
import { showFailOverlay} from './game-engine.js';
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

function runCountdown(timerEl, onFinish) {
    let timeLeft = 3;

    timerEl.textContent = timeLeft;
    timerEl.classList.remove('hidden');

    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        // лёгкий эффект вспышки
        timerEl.classList.add('flash');
        setTimeout(() => timerEl.classList.remove('flash'), 150);

        if (timeLeft === 0) {
            clearInterval(interval);
            timerEl.classList.add('hidden');
            onFinish?.();
        }
    }, 1000);
}

export function stopTimer() {
    clearInterval(gameState.timerInterval);
}
// export let taskStartedAt = null;
// export let taskUnlocked = false;

export function initTaskWrapper(wrapper) {
    const startBtn = wrapper.querySelector('.start-task-btn');
    if (!startBtn) return;
    const timerEl = wrapper.querySelector('.start-timer');
    const cover = wrapper.querySelector('.task-cover');
    const content = wrapper.querySelector('.task-content');
    
    // Раскрыть кнопку

    wrapper.querySelector('.start-task-btn').classList.remove('hidden');
    wrapper.querySelector('.start-task-btn').classList.remove('fade-out');
    wrapper.querySelector('.start-task-btn').disabled = false;
    wrapper.querySelector('.start-task-btn').style.display = 'block';
    startBtn.addEventListener('click', () => {
        // анимация кнопки
        startBtn.classList.add('fade-out');
        startBtn.disabled = true;
        wrapper._state = {
            completed: false,
            locked: false
        };
        setTimeout(() => {
            startBtn.style.display = 'none';
        }, 500);

        timerEl.classList.remove('hidden');

        let timeLeft = 3;

        const showNumber = (num) => {
            timerEl.textContent = num;
            timerEl.classList.remove('show');
            void timerEl.offsetWidth; // перезапуск анимации
            timerEl.classList.add('show');
        };

        showNumber(timeLeft);

        const interval = setInterval(() => {
            timeLeft--;

            if (timeLeft > 0) {
                showNumber(timeLeft);
            } else {
                clearInterval(interval);

                timerEl.classList.add('fade-out');

                setTimeout(() => {
                    cover.classList.add('hidden');
                    content.classList.remove('hidden');
                    timerEl.classList.add('hidden');
                }, 400);

                gameState.taskStartedAt = Date.now();
                gameState.taskUnlocked = true;

                // запуск общего таймера
                startLiveTimer();
            }
        }, 1000);


        runCountdown(timerEl, () => {
            startTaskTimer(wrapper); // ⬅️ вот тут
        });
    });
}

export function startTaskTimer(taskEl) {
    const timerEl = taskEl.querySelector('.task-live-timer');
    if (!timerEl) return;
    if (taskEl._timerInterval) return; // 🔒 защита от двойного старта

    taskEl._startTime = Date.now();
    taskEl._penalty = taskEl._penalty || 0;
    taskEl._state = taskEl._state || {};

    taskEl._timerInterval = setInterval(() => {
        // Если задача уже завершена или заблокирована — ничего не делаем
        if (taskEl._state.locked) return;

        const elapsed =
            Math.floor((Date.now() - taskEl._startTime) / 1000) +
            (taskEl._penalty || 0);
        
        updateTimerUI(taskEl, elapsed);

        if (elapsed >= 60) {
            taskEl._state.locked = true; // сразу блокируем задачу
            stopTaskTimer(taskEl);
            showFailOverlay(taskEl, 'Время вышло');
        }
    }, 500);

    timerEl.classList.remove('hidden');
}

export function stopTaskTimer(taskEl) {
    clearInterval(taskEl._timerInterval);
    taskEl._endTime = Date.now();
}

export function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateTimerUI(taskEl, elapsed) {
    const timerEl = taskEl.querySelector('.task-live-timer');
    if (!timerEl) return;

    timerEl.textContent = `⏱ ${elapsed} c`;
}