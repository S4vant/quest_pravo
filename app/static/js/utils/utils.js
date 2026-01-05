

let draggedBlock = null;
export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('block')) {
            draggedBlock = e.target;
            e.target.classList.add('dragging');
            

        }
    });

    document.addEventListener('dragend', (e) => {
        if (draggedBlock) {
            draggedBlock.classList.remove('dragging');
            draggedBlock = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('definition-bank') || e.target.classList.contains('definition-drop')) {
            e.preventDefault(); // очень важно для drop
            draggedBlock.classList.remove('dragging');
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
