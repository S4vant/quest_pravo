import { applyPenalty } from '../utils/utils.js';
import { gameState } from './state.js';

export function initTaskHints(taskWrapper, message="Правильный ответ:11 ") {
    const hintBtn = taskWrapper.querySelector('.hint-btn');
    const hintPopup = taskWrapper.querySelector('.hint-popup');

    if (!hintBtn || !hintPopup) return;

    let used = false;

    hintBtn.addEventListener('click', () => {
        if (used) return;
// <button class="hint-btn" data-hint="Правильный ответ">?</button>

        hintPopup.textContent = message;
        hintPopup.classList.add('visible');
        hintPopup.classList.remove('hidden');
        hintBtn._dataHint = message
        applyPenalty(taskWrapper, 10, "Подсказка. +10");

        used = true;
        hintBtn.disabled = true;
        hintBtn.style.opacity = '0.5';
        setTimeout(() => {
                hintPopup.classList.remove('visible');
            }, 5000);
    });
}
