const LABOUR_LAW_DEFINITION = [
    "Трудовое право — это",
    "самостоятельная отрасль права,",
    "регулирующая общественные отношения,",
    "складывающиеся в процессе реализации",
    "гражданами своих способностей к труду,",
    "а также иные непосредственно связанные с ними отношения."
];

const LABOUR_LAW_DISTRACTORS = [
    "регулирующая имущественные отношения,",
    "складывающиеся между юридическими лицами",
    "установленная государственными органами",
    "и обеспечиваемая мерами принуждения",
    "в сфере управления трудовыми ресурсами",
    "возникающие в процессе производства"
];
const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


let draggedBlock = null;

document.addEventListener('DOMContentLoaded', () => {
    initStage1();
    setupDragAndDrop();
});

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

// function initStage1() {
//     const bank = document.getElementById('definition-bank');
//     let allBlocks = shuffle([...LABOUR_LAW_DEFINITION, ...LABOUR_LAW_DISTRACTORS]);
//     bank.innerHTML = '';
//     allBlocks.forEach((text, i) => {
//         const block = document.createElement('div');
//         block.className = 'block';
//         // block.draggable = true;
//         block.textContent = text;
//         block.addEventListener('click', () => {
//             if (block.parentElement.id === 'definition-bank') {
//                 drop.appendChild(block);
//             } else {
//                 bank.appendChild(block);
//             }
//         });
//         bank.appendChild(block);
//     });
// }

function initStage1() {
    const bank = document.getElementById('definition-bank');
    const dropZone = document.getElementById('definition-drop');

    let allBlocks = shuffle([...LABOUR_LAW_DEFINITION, ...LABOUR_LAW_DISTRACTORS]);
    bank.innerHTML = '';
    dropZone.innerHTML = '';

    allBlocks.forEach(text => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = text;

        block.addEventListener('click', () => {
            const bankEl = document.getElementById('definition-bank');
            const dropEl = document.getElementById('definition-drop');

            if (block.parentElement === bankEl) {
                dropEl.appendChild(block);
            } else {
                bankEl.appendChild(block);
            }
        });

        if (!IS_MOBILE) {
            block.draggable = true;
        }

        bank.appendChild(block);
    });
}

function moveBlock(block, dropId) {
    const dropZone = document.getElementById(dropId);
    dropZone.appendChild(block);
}
function setupDragAndDrop() {
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

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('drop-zone')) {
            e.target.style.backgroundColor = '#e0f0ff';
        }
    });

    document.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('drop-zone')) {
            e.target.style.backgroundColor = '#f8fafc';
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedBlock && e.target.classList.contains('drop-zone')) {
            e.target.appendChild(draggedBlock);
            draggedBlock = null;
            e.target.style.backgroundColor = '#f8fafc';
        }
    });
}

function clearDropZone(zoneId) {
    const zone = document.getElementById(zoneId);
    const bank = document.getElementById('definition-bank');

    Array.from(zone.children).forEach(block => bank.appendChild(block));
}

async function checkDefinition() {
    const dropZone = document.getElementById('definition-drop');
    const blocks = Array.from(dropZone.querySelectorAll('.block')).map(b => b.textContent.trim());
    const feedback = document.getElementById('definition-feedback');

    if (blocks.length === 0) {
        feedback.className = 'feedback error';
        feedback.textContent = '❌ Поле пусто. Соберите определение.';
        return;
    }

    if (blocks.length !== LABOUR_LAW_DEFINITION.length) {
        feedback.className = 'feedback error';
        feedback.textContent = blocks.length < LABOUR_LAW_DEFINITION.length
            ? `❌ Недостаточно фрагментов (${blocks.length} вместо ${LABOUR_LAW_DEFINITION.length}).`
            : `❌ Слишком много фрагментов (${blocks.length} вместо ${LABOUR_LAW_DEFINITION.length}).`;
        return;
    }

    const isCorrect = LABOUR_LAW_DEFINITION.every((part, i) => blocks[i] === part.trim());

    if (isCorrect) {
        feedback.className = 'feedback success';
        feedback.textContent = '✅ Определение составлено верно';
        document.getElementById('check-definition-btn').disabled = true;

        // Сохраняем результат на сервер
        await saveResult(true);

        // setTimeout(() => {
        //     window.location.href = "/stage/2"; // сервер сам определит attempt через сессию
        // }, 1000);
    } else {
        feedback.className = 'feedback error';
        feedback.textContent = '❌ Формулировка не совпадает с определением из лекции.';
        await saveResult(false);
    }
}

async function saveResult(isCorrect) {
    try {
        const res = await fetch("/api/stage/1/q/1", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({correct: isCorrect})
        });
        const data = await res.json();
        if (!data.saved) console.error("Ошибка при сохранении результата");
    } catch (err) {
        console.error("Ошибка при сохранении результата:", err);
    }
}
