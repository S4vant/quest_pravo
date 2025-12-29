import { questionHandlers } from './questions/index.js';
import { gameState } from './engine/state.js';
import { startLiveTimer } from './engine/timer.js';
import { IS_MOBILE } from './utils/utils.js';
import { initTaskWrapper } from './engine/timer.js';
// import { initQuestion1 } from './stage1/q1_definition.js';
// import { initStage2 } from './stage1/q2_method.js';
// import { initStage3 } from './stage1/q3_principles.js';
// import { initStage4 } from './stage1/q4_violations.js';
// import { initStage5 } from './stage1/q5_grid.js';



async function loadStage(stage) {
    const res = await fetch(`/static/data/stage_${stage}.json`);
    return await res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    const wrapper = document.querySelector('.stage-content');

    const stage = Number(wrapper.dataset.stage);
    const question = Number(wrapper.dataset.question);

    const data = await loadStage(stage);
    const questionData = data.questions[question];

    const handler = questionHandlers[question];

    handler.init(questionData);

    document
        .getElementById('check-definition-btn')
        .addEventListener('click', () =>
            handler.check({ stage, question })
        );

    gameState.taskStartedAt = Date.now();
    gameState.taskUnlocked = true;
    startLiveTimer();
});
