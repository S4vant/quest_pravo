

let draggedBlock = null;
export function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
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
     document.addEventListener("dragover", e => {
        e.preventDefault();
        if (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone")) {
            // e.target.style.backgroundColor = "#e0f0ff";
        }
    });

    document.addEventListener("dragleave", e => {
        if (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone")) {
            // e.target.style.backgroundColor = "#f8fafc";
        }
    });

    document.addEventListener("drop", e => {
        e.preventDefault();
        if (draggedBlock && (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone"))) {
            e.target.appendChild(draggedBlock);
            draggedBlock = null;
            // e.target.style.backgroundColor = "#f8fafc";
        }
    });
}


export function clearDropZone(zoneId) {
    const zone = document.getElementById(zoneId);
    const bank = document.getElementById('definition-bank');

    Array.from(zone.children).forEach(block => bank.appendChild(block));
}

export const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
