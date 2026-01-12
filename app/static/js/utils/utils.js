
let draggedBlock = null;
export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function setupDragAndDrop() {
    const blocks = ["definition-bank", "definition-drop", "terms-container", "situations-bank", "drop-zone"];
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
        const isTargetValid = blocks.some(className => e.target.classList.contains(className));
        if (draggedBlock && isTargetValid) {
            e.preventDefault(); // очень важно для drop
        }
    });

    document.addEventListener('drop', (e) => {
        const isTargetValid = blocks.some(className => e.target.classList.contains(className));
        if (draggedBlock && isTargetValid) {
            e.preventDefault();
            
            e.target.appendChild(draggedBlock);
            
            draggedBlock = null;
        }
    });
}



export function clearDropZone(wrapper) {
    const zone = wrapper.querySelector('.definition-drop');
    const bank = wrapper.querySelector('.definition-bank');
    const terms = wrapper.querySelector('.drop-zone');
    const situations = wrapper.querySelector('.situations-bank');
    if (zone && bank){
        Array.from(zone.children).forEach(block => bank.appendChild(block));};

 // 2. Очистка ВСЕХ term-slot (.drop-zone)
    const termSlots = wrapper.querySelectorAll('.drop-zone');
    if (termSlots && situations) {
        termSlots.forEach(slot => {
            slot.querySelectorAll('.block').forEach(block => {
                situations.appendChild(block);
            });
        });
    }
}

export const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export function lockQuestionUI(wrapper) {
    if (!wrapper) return;

    const checkBtn = wrapper.querySelector('.check-btn');

    // ===== ЗАДАНИЕ: СООТВЕТСТВИЕ =====
    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');
    if (bank && drop) {
        bank.classList.add('disabled');
        drop.classList.add('disabled');
        if (checkBtn) checkBtn.disabled = true;
        return;
    }

    // ===== ЗАДАНИЕ: ТЕРМИНЫ / СИТУАЦИИ =====
    const terms = wrapper.querySelector('.terms-container');
    const situations = wrapper.querySelector('.situations-bank');
    if (terms && situations) {
        terms.classList.add('disabled');
        situations.classList.add('disabled');
        if (checkBtn) checkBtn.disabled = true;
        return;
    }

    // ===== ЗАДАНИЕ 5: КРОССВОРД =====
    const crossword = wrapper.querySelector('.crossword-grid');
    if (crossword) {
        crossword.classList.add('disabled');

        // блокируем клики по ячейкам
        crossword.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('disabled');
            cell.style.pointerEvents = 'none';
        });

        if (checkBtn) checkBtn.disabled = true;
        return;
    }

    // ===== FALLBACK =====
    if (checkBtn) checkBtn.disabled = true;
}


export function resetQuestion(wrapper) {

    // ===== ОСТАНОВИТЬ ТАЙМЕР =====
    if (wrapper._timerInterval) {
        clearInterval(wrapper._timerInterval);
        wrapper._timerInterval = null;
    }

    delete wrapper._startTime;
    delete wrapper._endTime;
    delete wrapper._timerInterval;

    wrapper._penalty = 0;
    wrapper._state = {
        completed: false,
        locked: false
    };

    // ===== СБРОС ТАЙМЕРА UI =====
    const timerEl = wrapper.querySelector('.task-live-timer');
    if (timerEl) {
        timerEl.textContent = '00:00';
        timerEl.classList.add('hidden');
    }

    const prestart = wrapper.querySelector('.start-timer');
    if (prestart) {
        prestart.classList.remove('fade-out');
        prestart.classList.add('hidden');
    }

    // ===== СБРОС КРОССВОРДА (ЗАДАНИЕ 5) =====
    const crossword = wrapper.querySelector('.crossword-grid');
    if (crossword) {
        crossword.classList.remove('disabled');

        crossword.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove(
                'selected',
                'found',
                'highlight',
                'disabled'
            );
            cell.style.pointerEvents = '';
        });

        // сброс внутреннего состояния
        delete wrapper._crosswordState;
        delete wrapper._selectedCells;
        delete wrapper._currentWord;
        
    }

    // ===== УДАЛЕНИЕ ДИНАМИЧЕСКИХ БЛОКОВ =====
    if (wrapper._blocks) {
        wrapper._blocks.forEach(block => block.remove());
        wrapper._blocks = null;
    }

    // ===== ВОЗВРАТ В COVER =====
    wrapper.querySelector('.task-content')?.classList.add('hidden');
    wrapper.querySelector('.task-cover')?.classList.remove('hidden');

    // ===== РАЗБЛОКИРОВКА КНОПКИ =====
    const checkBtn = wrapper.querySelector('.check-btn');
    if (checkBtn) {
        checkBtn.disabled = false;
    }
}


export async function unlockQuestionUi(wrapper) {
    const checkBtn = wrapper.querySelector('.check-btn');
    const bank = wrapper.querySelector('.definition-bank');
    const drop = wrapper.querySelector('.definition-drop');
    const terms = wrapper.querySelector('.terms-container');
    const situations = wrapper.querySelector('.situations-bank');
    checkBtn.disabled = false;
    checkBtn.classList.remove('hidden');
    if (bank && drop){
        bank.classList.remove('disabled');
        drop.classList.remove('disabled');
    }
    if (terms){
        terms.classList.remove('disabled');
    }
    if (situations){
        situations.classList.remove('disabled');
    }

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
    showPenalty(wrapper, "5");
}

export function showError(wrapper, text) {
    const el = wrapper.querySelector('.task-error');
    if (!el) return;

    el.textContent = text;
    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 2000);
}

export function showPenalty(taskEl, amount) {
    const timer = taskEl.querySelector('.task-live-timer');
    if (!timer) return;

    const container = timer.parentElement;

    const penaltyEl = document.createElement('div');
    penaltyEl.className = 'penalty-float';
    penaltyEl.textContent = `+${amount}`;

    container.appendChild(penaltyEl);

    penaltyEl.addEventListener('animationend', () => {
        penaltyEl.remove();
    });
}