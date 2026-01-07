
let draggedBlock = null;
export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('block')) {
        draggedBlock = e.target;
    }
    });

    document.addEventListener('dragend', (e) => {
        if (draggedBlock) {
            draggedBlock = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('definition-bank') || e.target.classList.contains('definition-drop')) {
            e.preventDefault(); // очень важно для drop
        }
    });

    document.addEventListener('drop', (e) => {
        if (draggedBlock && (e.target.classList.contains('definition-bank') || e.target.classList.contains('definition-drop'))) {
            
            e.preventDefault();
            
            e.target.appendChild(draggedBlock);
            
            draggedBlock = null;
        }
    });
}



export function clearDropZone(wrapper) {
    const zone = wrapper.querySelector('.definition-drop');
    const bank = wrapper.querySelector('.definition-bank');

    if (!zone || !bank) return;

    Array.from(zone.children).forEach(block => bank.appendChild(block));
}

export const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export function lockQuestionUI(wrapper) {
    const checkBtn = wrapper.querySelector('.check-btn');
    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');
    checkBtn.disabled = true;

    bank.classList.add('disabled');
    drop.classList.add('disabled');
}

export function resetQuestion(wrapper) {

    // ❌ Остановить таймер
    if (wrapper._timerInterval) {
        clearInterval(wrapper._timerInterval);
    }

    // ❌ Очистить состояние
    delete wrapper._startTime;
    delete wrapper._endTime;
    delete wrapper._timerInterval;

    wrapper._state = {
        completed: false,
        locked: false
    };

    // ❌ Очистить DOM
    wrapper.querySelector('.definition-bank').innerHTML = '';
    wrapper.querySelector('.definition-drop').innerHTML = '';

    // ❌ Скрыть контент
    wrapper.querySelector('.task-content').classList.add('hidden');
    wrapper.querySelector('.task-cover').classList.remove('hidden');

    // ❌ Разблокировать кнопку
}

export async function unlockQuestionUi(wrapper) {
    const checkBtn = wrapper.querySelector('.check-btn');
    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');
    checkBtn.disabled = false;
    checkBtn.classList.remove('hidden');
    bank.classList.remove('disabled');
    drop.classList.remove('disabled');

    // Показать контент
    wrapper.querySelector('.task-content').classList.remove('hidden');
    wrapper.querySelector('.task-cover').classList.add('hidden');

    // Показать кнопку
    wrapper.querySelector('.start-task-btn').classList.add('hidden');
    
}

export function failTask(wrapper, reason) {
    lockQuestionUI(wrapper);
    showFailOverlay(wrapper, reason);
}

export function applyPenalty(wrapper, seconds) {
    wrapper._penalty = (wrapper._penalty || 0) + seconds;
}