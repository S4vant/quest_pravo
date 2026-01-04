import { shuffle  } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTimer } from '../engine/timer.js';
import { saveResult, showRecordCelebration } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';

let definition = [];
export function initQuestion1(wrapper, questionData) {

    startLiveTimer();

    const definition = questionData.definition;
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

    const correct =
        blocks.length === definition.length &&
        definition.every((p, i) => p === blocks[i]);

    stopTimer();

    const wastedTime = Math.floor(
        (Date.now() - gameState.taskStartedAt) / 1000
    );

    const best = await getBestTime(meta.stage, meta.question);

    if (correct && best !== null && wastedTime < best) {
        showRecordCelebration(best, wastedTime);
    }

    await saveResult(correct, meta.stage, meta.question, wastedTime);
}
