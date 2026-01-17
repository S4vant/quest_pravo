import { shuffle, lockQuestionUI, unlockQuestionUi, applyPenalty, showError } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showResultOverlay } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';
import { progressStore } from '../engine/progress-store.js';
import {initTaskHints } from '../engine/hints.js';
let principlesBlocks = [];

export function initQuestion3(wrapper, questionData) {
    console.log('INIT QUESTION 3', questionData);
    startLiveTimer();
    unlockQuestionUi(wrapper);

    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');

    principlesBlocks = questionData.definition;
    const distractors = questionData.distractors;
    initTaskHints(wrapper, 'Правильный ответ: ' + principlesBlocks.join(' '));
    const allBlocks = shuffle([...principlesBlocks, ...distractors]);

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

export async function checkQuestion3(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const drop = wrapper.querySelector('.definition-drop');
    const blocks = [...drop.children].map(b => b.textContent.trim());

    const wastedTime = Math.floor((Date.now() - wrapper._startTime) / 1000);

    if (blocks.length !== principlesBlocks.length) {
        applyPenalty(wrapper, 5);
        showError(wrapper, `Неверное количество выбранных принципов (${blocks.length} из ${principlesBlocks.length})`);
        return;
    }

    const selectedSet = new Set(blocks);
    const correctSet = new Set(principlesBlocks);

    const missing = [...correctSet].filter(x => !selectedSet.has(x));
    const extra = [...selectedSet].filter(x => !correctSet.has(x));

    const correct = missing.length === 0 && extra.length === 0;

    if (!correct) {
        applyPenalty(wrapper, 5);
        showError(wrapper, `Ошибка. Отсутствуют: ${missing.join(', ')}; Лишние: ${extra.join(', ')}`);
        return;
    }
    const prevBest = getBestTime(meta.stage, meta.question);
    const isNewBest = prevBest == null || wastedTime < prevBest;
    if (correct) {
        wrapper._state.completed = true;
        wrapper._state.locked = true;
        stopTaskTimer(wrapper);
        lockQuestionUI(wrapper);

        

        
        showResultOverlay(wrapper, {
            current: wastedTime,
            best: progressStore.getBest(meta.stage, meta.question)
        });
        
    }

    if (isNewBest) {
            saveResult(correct, meta.stage, meta.question, wastedTime);
        }
}
