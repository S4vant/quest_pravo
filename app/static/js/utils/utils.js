export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function moveBlock(block, dropId) {
    const dropZone = document.getElementById(dropId);
    dropZone.appendChild(block);
}
export function setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('block')) {
            draggedBlock = e.target;
            e.target.classList.add('dragging');
            setTimeout(() => e.target.style.opacity = '0.5', 0);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (draggedBlock) {
            draggedBlock.classList.remove('dragging');
            draggedBlock.style.opacity = '1';
            draggedBlock = null;
        }
    });
}


export function clearDropZone(zoneId) {
    const zone = document.getElementById(zoneId);
    const bank = document.getElementById('definition-bank');

    Array.from(zone.children).forEach(block => bank.appendChild(block));
}

export const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
