import { questionHandlers } from './questions/index.js';
import { gameState } from './engine/state.js';
import { startLiveTimer } from './engine/timer.js';
import { setupDragAndDrop, IS_MOBILE, clearDropZone} from './utils/utils.js';
import { initTaskWrapper } from './engine/timer.js';
import { loadProgress, loadProfile } from './api/api.js';


// import { initQuestion1 } from './stage1/q1_definition.js';
// import { initStage2 } from './stage1/q2_method.js';
// import { initStage3 } from './stage1/q3_principles.js';
// import { initStage4 } from './stage1/q4_violations.js';
// import { initStage5 } from './stage1/q5_grid.js';

window.clearDropZone = clearDropZone;
window.loadProfile = loadProfile;

async function loadStage(stage) {
    const res = await fetch(`/static/data/stage_${stage}.json`);

    return await res.json();
}
document.addEventListener('DOMContentLoaded', async () => {

    setupDragAndDrop();
    
    await loadProgress();

    const wrappers = document.querySelectorAll(
        '.stage-content[data-stage][data-question]'
    );

    for (const wrapper of wrappers) {
        initTaskWrapper(wrapper);
        const stage = Number(wrapper.dataset.stage);
        const question = Number(wrapper.dataset.question);

        const data = await loadStage(stage);
        const questionData = data.questions[question];

        if (!questionData) {
            console.warn(`Нет данных для вопроса ${question}`);
            continue;
        }

        const handler = questionHandlers[question];
        handler.init(wrapper, questionData);

        const startBtn = wrapper.querySelector('.start-task-btn');
        const checkBtn = wrapper.querySelector('.check-btn');

        startBtn?.addEventListener('click', () => {
            gameState.taskStartedAt = Date.now();
            gameState.taskUnlocked = true;
        });

        checkBtn?.addEventListener('click', () => {
            handler.check(wrapper, { stage, question });
        });
    }
});