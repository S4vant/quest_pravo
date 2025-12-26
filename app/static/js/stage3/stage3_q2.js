const TERMINATION_GROUNDS_CORRECT = [
    "Соглашение сторон",
    "Истечение срока трудового договора",
    "Инициатива работника",
    "Инициатива работодателя",
    "Обстоятельства, не зависящие от воли сторон"
];

const TERMINATION_GROUNDS_DISTRACTORS = [
    "Плохое настроение работодателя",
    "Личное неприязненное отношение",
    "Желание сменить коллектив без заявления"
];
// const IS_MOBILE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let draggedBlockQ2 = null;

document.addEventListener("DOMContentLoaded", () => {
    initStage2();
    setupDragAndDropQ2();

    document.getElementById("submit-q2").addEventListener("click", checkStage2);
});

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

// function initStage2() {
//     const bank = document.getElementById("blocks-container-q2");
//     const allBlocks = shuffle([...TERMINATION_GROUNDS_CORRECT, ...TERMINATION_GROUNDS_DISTRACTORS]);
//     bank.innerHTML = '';
//     allBlocks.forEach(text => {
//         const block = document.createElement("div");
//         block.className = "draggable block";
//         block.draggable = true;
//         block.textContent = text;
//         block.dataset.correct = TERMINATION_GROUNDS_CORRECT.includes(text) ? "true" : "false";
//         bank.appendChild(block);
//     });
// }

function initStage2() {
    const bank = document.getElementById("blocks-container-q2");
    const dropZone = document.getElementById("stage1-drop-q2");

    if (!bank || !dropZone) {
        console.error("❌ Не найден контейнер этапа 2");
        return;
    }

    let allBlocks = shuffle([...TERMINATION_GROUNDS_CORRECT, ...TERMINATION_GROUNDS_DISTRACTORS]);
    bank.innerHTML = '';
    dropZone.innerHTML = '';

    allBlocks.forEach(text => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = text;
        block.dataset.correct = TERMINATION_GROUNDS_CORRECT.includes(text) ? "true" : "false";

        block.addEventListener('click', () => {
            if (block.parentElement === bank) {
                dropZone.appendChild(block);
            } else {
                bank.appendChild(block);
            }
        });

        if (!IS_MOBILE) {
            block.draggable = true;
        }

        bank.appendChild(block);
    });
}



function setupDragAndDropQ2() {
    document.addEventListener("dragstart", e => {
        if (e.target.classList.contains("block")) {
            draggedBlockQ2 = e.target;
            e.target.classList.add("dragging");
            setTimeout(() => e.target.style.opacity = "0.5", 0);
        }
    });

    document.addEventListener("dragend", e => {
        if (draggedBlockQ2) {
            draggedBlockQ2.classList.remove("dragging");
            draggedBlockQ2.style.opacity = "1";
            draggedBlockQ2 = null;
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
        if (draggedBlockQ2 && (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone"))) {
            e.target.appendChild(draggedBlockQ2);
            draggedBlockQ2 = null;
            // e.target.style.backgroundColor = "#f8fafc";
        }
    });
}

function clearDropZoneQ2() {
    const dropZone = document.getElementById("stage1-drop-q2");
    const bank = document.getElementById("blocks-container-q2");
    Array.from(dropZone.querySelectorAll(".block")).forEach(block => bank.appendChild(block));
}

async function checkStage2() {
    const dropZone = document.getElementById("stage1-drop-q2");
    const blocks = Array.from(dropZone.children); // именно dropZone, а не банк
    const feedback = document.getElementById("feedback-q2");

    if (blocks.length === 0) {
        feedback.style.color = "red";
        feedback.textContent = "❌ Поле пусто. Расставьте блоки в последовательность.";
        saveResult2(false);
        return;
    }

    const arrangedBlocks = blocks.filter(b => b.dataset.correct === "true").map(b => b.textContent.trim());

    let isCorrect = arrangedBlocks.length === TERMINATION_GROUNDS_CORRECT.length;
    if (isCorrect) {
        for (let i = 0; i < TERMINATION_GROUNDS_CORRECT.length; i++) {
            if (arrangedBlocks[i] !== TERMINATION_GROUNDS_CORRECT[i]) {
                isCorrect = false;
                break;
            }
        }
    }

    feedback.style.color = isCorrect ? "green" : "red";
    feedback.textContent = isCorrect ? "✅ Последовательность составлена верно!" : "❌ Последовательность неверна.";

    await saveResult2(isCorrect);
}



async function saveResult2(isCorrect) {
    try {
        // const attemptId = window.attemptId; // или data-атрибут
        // if (!attemptId) throw new Error("Не найден attempt_id");

        const res = await fetch("/api/stage/3/q/2", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                attempt_id: attemptId,
                stage_number: 3,
                question_number: 2,
                correct: isCorrect
            })
        });

        const data = await res.json();
        if (!data.saved) console.error("Ошибка при сохранении результата");
    } catch (err) {
        console.error("Ошибка при сохранении результата:", err);
    }
}
