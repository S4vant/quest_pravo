import { shuffle, lockQuestionUI, unlockQuestionUi, applyPenalty, showError } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showResultOverlay } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';

let blocksQ2 = [];

export function initQuestion2(wrapper, questionData) {
    console.log('INIT QUESTION 2', questionData);

    startLiveTimer();
    unlockQuestionUi(wrapper);

    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');

    blocksQ2 = questionData.definition;
    const distractors = questionData.distractors;

    const allBlocks = shuffle([...blocksQ2, ...distractors]);

    bank.innerHTML = '';
    drop.innerHTML = '';

    allBlocks.forEach(text => {
        const div = document.createElement('div');
        div.className = 'block';
        div.textContent = text;
        div.draggable = !gameState.IS_MOBILE;
        div.addEventListener('click', () => {
            if (div.parentElement === bank) {
                drop.appendChild(div);
            } else {
                bank.appendChild(div);
            }
        });

        bank.appendChild(div);
    });
}

export async function checkQuestion2(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const drop = wrapper.querySelector('.definition-drop');
    const blocks = [...drop.children].map(b => b.textContent.trim());

    const correct =
        blocks.length === blocksQ2.length &&
        blocksQ2.every((b, i) => b === blocks[i]);

    const wastedTime = Math.floor((Date.now() - wrapper._startTime) / 1000);

    if (correct) {
        wrapper._state.completed = true;
        wrapper._state.locked = true;
        stopTaskTimer(wrapper);
        lockQuestionUI(wrapper);

        showResultOverlay(wrapper, {
            current: wastedTime,
            best: await getBestTime(meta.stage, meta.question)
        });
    } else {
        applyPenalty(wrapper, 5);
        showError(wrapper, 'Неправильный ответ');
        return;
    }

    saveResult(correct, meta.stage, meta.question, wastedTime);
}
