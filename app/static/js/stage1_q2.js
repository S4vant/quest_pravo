const METHOD_BLOCKS = [
    "Имеет смешанный характер",
    "Сочетание централизованного и локального регулирования",
    "Сочетание нормативного и договорного регулирования",
    "Договорный характер установления условий труда"
];

const DISTRACTORS_Q2 = [
    "Полное централизованное регулирование",
    "Полное локальное регулирование",
    "Только договорное регулирование"
];


let draggedBlockQ2 = null;

document.addEventListener("DOMContentLoaded", () => {
    initStage2();
    setupDragAndDropQ2();

    document.getElementById("submit-q2").addEventListener("click", checkStage2);
});

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function initStage2() {
    const bank = document.getElementById("blocks-container-q2");
    const allBlocks = shuffle([...METHOD_BLOCKS, ...DISTRACTORS_Q2]);
    bank.innerHTML = '';
    allBlocks.forEach(text => {
        const block = document.createElement("div");
        block.className = "draggable block";
        block.draggable = true;
        block.textContent = text;
        block.dataset.correct = METHOD_BLOCKS.includes(text) ? "true" : "false";
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
            e.target.style.backgroundColor = "#e0f0ff";
        }
    });

    document.addEventListener("dragleave", e => {
        if (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone")) {
            e.target.style.backgroundColor = "#f8fafc";
        }
    });

    document.addEventListener("drop", e => {
        e.preventDefault();
        if (draggedBlockQ2 && (e.target.classList.contains("blocks-container") || e.target.classList.contains("drop-zone"))) {
            e.target.appendChild(draggedBlockQ2);
            draggedBlockQ2 = null;
            e.target.style.backgroundColor = "#f8fafc";
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
        return;
    }

    const arrangedBlocks = blocks.filter(b => b.dataset.correct === "true").map(b => b.textContent.trim());

    let isCorrect = arrangedBlocks.length === METHOD_BLOCKS.length;
    if (isCorrect) {
        for (let i = 0; i < METHOD_BLOCKS.length; i++) {
            if (arrangedBlocks[i] !== METHOD_BLOCKS[i]) {
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

        const res = await fetch("/api/stage/1/q/2", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                attempt_id: attemptId,
                stage_number: 1,
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
