import { shuffle, lockQuestionUI, unlockQuestionUi, applyPenalty, showError } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showResultOverlay } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';
import { progressStore } from '../engine/progress-store.js';

let pairs = [];

export function initQuestion4(wrapper, questionData) {
    console.log('INIT QUESTION 4', questionData);

    startLiveTimer();
    unlockQuestionUi(wrapper);

    pairs = questionData.definition;
    const distractors = questionData.distractors;

    const termsContainer = wrapper.querySelector('.terms-container');
    const bank = wrapper.querySelector('.situations-bank');

    termsContainer.innerHTML = '';
    bank.innerHTML = '';

    // Создаём слоты терминов
    pairs.forEach(p => {
        const slot = document.createElement('div');
        slot.className = 'drop-zone term-slot';
        slot.dataset.term = p.term;

        slot.innerHTML = `
            <strong>${p.term}</strong>
            <div class="drop-placeholder">→ выберите ситуацию</div>
        `;

        termsContainer.appendChild(slot);
    });

    // Формируем банк ситуаций
    let situations = [
        ...pairs.map(p => p.def),
        ...distractors
    ];

    situations = shuffle(situations);

    situations.forEach(text => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = text;
        block.draggable = !gameState.IS_MOBILE;

        block.addEventListener('click', () => {
            const parent = block.parentElement;

            if (parent === bank) {
                const emptySlot = [...termsContainer.children]
                    .find(s => !s.querySelector('.block'));

                if (emptySlot) emptySlot.appendChild(block);
            } else {
                bank.appendChild(block);
            }
        });

        bank.appendChild(block);
    });
}
export async function checkQuestion4(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const slots = wrapper.querySelectorAll('.term-slot');
    let errors = 0;

    slots.forEach(slot => {
        const term = slot.dataset.term;
        const expected = pairs.find(p => p.term === term).def;
        const block = slot.querySelector('.block');

        if (!block || block.textContent.trim() !== expected) {
            errors++;
            if (block) block.classList.add('incorrect');
        } else {
            block.classList.remove('incorrect');
            block.classList.add('correct');
        }
    });

    if (errors > 0) {
        applyPenalty(wrapper, 5);
        showError(wrapper, 'Есть ошибки в соотнесении');
        return;
    }

    // УСПЕХ
    const wastedTime = Math.floor((Date.now() - wrapper._startTime) / 1000);
    const prevBest = getBestTime(meta.stage, meta.question);
    const isNewBest = prevBest == null || wastedTime < prevBest;

    wrapper._state.completed = true;
    wrapper._state.locked = true;

    stopTaskTimer(wrapper);
    lockQuestionUI(wrapper);

    showResultOverlay(wrapper, {
        current: wastedTime,
        best: progressStore.getBest(meta.stage, meta.question)
    });

    if (isNewBest) {
        saveResult(true, meta.stage, meta.question, wastedTime);
    }
}
