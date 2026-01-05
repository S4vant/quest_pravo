import { shuffle  } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showRecordCelebration } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';

let definition = [];
export function initQuestion1(wrapper, questionData) {
    console.log('INIT QUESTION 1', questionData);
    startLiveTimer();

    definition = questionData.definition; 
    const distractors = questionData.distractors;

    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');

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


    // document.getElementById('check-definition-btn').disabled = true;
    stopTaskTimer(wrapper);
    // запись времени
    console.log(wrapper._startTime); // timestamp
    console.log(wrapper._endTime);   // timestamp
    console.log(wrapper._endTime - wrapper._startTime);
    

    const wastedTime = Math.floor((wrapper._endTime - wrapper._startTime) / 1000);
    console.log(wastedTime);
    const best = await getBestTime(meta.stage, meta.question);

    if (correct && best !== null && wastedTime < best) {
        showRecordCelebration(best, wastedTime);
    }

    await saveResult(correct, meta.stage, meta.question, wastedTime);
}
