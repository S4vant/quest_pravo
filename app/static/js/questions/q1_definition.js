import { shuffle, lockQuestionUI, unlockQuestionUi, applyPenalty, showError  } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showResultOverlay } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';
import { progressStore } from '../engine/progress-store.js';
import {initTaskHints } from '../engine/hints.js';

let definition = [];
export function initQuestion1(wrapper, questionData) {
    console.log('INIT QUESTION 1', questionData);
    startLiveTimer();
    unlockQuestionUi(wrapper);
    
    definition = questionData.definition; 
    const distractors = questionData.distractors;

    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');
    initTaskHints(wrapper, 'Правильный ответ: ' + definition.join(' '));
    const blocks = shuffle([...definition, ...distractors]);

    bank.innerHTML = '';
    drop.innerHTML = '';

    blocks.forEach(text => {
        const div = document.createElement('div');
        div.className = 'block';
        div.textContent = text;
        div.draggable = !gameState.IS_MOBILE;
        div.addEventListener('click', () => {
            div.parentElement === bank
                ? drop.appendChild(div)
                : bank.appendChild(div);
        });

        if (!gameState.IS_MOBILE) {
            div.draggable = true;
        }

        bank.appendChild(div);
    });
}

export async function checkQuestion1(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const drop = wrapper.querySelector('.definition-drop');
    const blocks = [...drop.children].map(b => b.textContent.trim());
    // Проверка на условие выполнение задания
    const correct =
        blocks.length === definition.length &&
        definition.every((p, i) => p === blocks[i]);
        
    const wastedTime = Math.floor((Date.now() - wrapper._startTime) / 1000);
    const prevBest = getBestTime(meta.stage, meta.question);
    const isNewBest = prevBest == null || wastedTime < prevBest;
    //Загрузка времени в клиент
    //Удачное завершение
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
    else {
    applyPenalty(wrapper, 5);
    
    showError(wrapper, 'Неправильный ответ');
    return;
}
    if (isNewBest) {
            saveResult(correct, meta.stage, meta.question, wastedTime);
            
        }
}
