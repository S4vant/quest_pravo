import { questionHandlers } from './questions/index.js';
import { setupDragAndDrop, clearDropZone} from './utils/utils.js';
import { initTaskWrapper } from './engine/timer.js';
import { loadProgress, loadProfile, loadUserProgressOnce,loadStageOnce } from './api/api.js';
import { resetQuestion } from './utils/utils.js';
import { stageDataStore } from './engine/stage-data-store.js';
// import { initQuestion1 } from './stage1/q1_definition.js';
// import { initStage2 } from './stage1/q2_method.js';
// import { initStage3 } from './stage1/q3_principles.js';
// import { initStage4 } from './stage1/q4_violations.js';
// import { initStage5 } from './stage1/q5_grid.js';
window.loadProfile = loadProfile;

document.addEventListener('DOMContentLoaded', async () => {

    await loadProgress();
    const wrappers = document.querySelectorAll(
        '.stage-content[data-stage][data-question]'
    );

    const stages = new Set(
        [...wrappers].map(w => Number(w.dataset.stage))
    );

    for (const stage of stages) {
        await loadStageOnce(stage);
    }

    for (const wrapper of wrappers) {
    window.clearDropZone = clearDropZone;
    initTaskWrapper(wrapper);
    setupDragAndDrop();

    const stage = Number(wrapper.dataset.stage);
    const question = Number(wrapper.dataset.question);

    const handler = questionHandlers[question];
    const startBtn = wrapper.querySelector('.start-task-btn');

    startBtn?.addEventListener('click', () => {
        setTimeout(() => {
            const questionData =
                stageDataStore.getQuestion(stage, question);
            handler.init(wrapper, questionData);
        }, 3100); // ⏱ чуть больше 3 секунд
    });

    const checkBtn = wrapper.querySelector('.check-btn');
    checkBtn?.addEventListener('click', () => {
        handler.check(wrapper, { stage, question });
    });
    wrapper.querySelector('.btn-restart')
    ?.addEventListener('click', () => {
        wrapper.querySelector('.task-result-overlay')
            .classList.add('hidden');
        resetQuestion(wrapper);
        initTaskWrapper(wrapper);
    });
}
});