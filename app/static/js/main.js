import { questionHandlers } from './questions/index.js';
import { gameState } from './engine/state.js';
import { startLiveTimer, stopTaskTimer } from './engine/timer.js';
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

    await loadProgress();

    const wrappers = document.querySelectorAll(
        '.stage-content[data-stage][data-question]'
    );

    for (const wrapper of wrappers) {
    window.clearDropZone = clearDropZone;
    initTaskWrapper(wrapper);
    setupDragAndDrop();
    
    
    const stage = Number(wrapper.dataset.stage);
    const question = Number(wrapper.dataset.question);

    const data = await loadStage(stage);
    const questionData = data.questions[question];
    const handler = questionHandlers[question];

    const startBtn = wrapper.querySelector('.start-task-btn');

    startBtn?.addEventListener('click', () => {
        setTimeout(() => {
            handler.init(wrapper, questionData);
        }, 3100); // ⏱ чуть больше 3 секунд
    });

    const checkBtn = wrapper.querySelector('.check-btn');
    checkBtn?.addEventListener('click', () => {
        
        
        stopTaskTimer(wrapper);

        handler.check(wrapper, { stage, question });
        
    });
}
});