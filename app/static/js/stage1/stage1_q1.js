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

let taskStartedAt = null;
let timerInterval = null;
let taskUnlocked = false;


document.addEventListener('DOMContentLoaded', () => {
    initTaskWrapper();
    initStage1();
    setupDragAndDrop();
});



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








// async function checkDefinition() {
//     const dropZone = document.getElementById('definition-drop');
//     const blocks = Array.from(dropZone.querySelectorAll('.block')).map(b => b.textContent.trim());
//     const feedback = document.getElementById('definition-feedback');

//     if (blocks.length === 0) {
//         feedback.className = 'feedback error';
//         feedback.textContent = '❌ Поле пусто. Соберите определение.';
//         await saveResult(false);
//         return;
//     }

//     if (blocks.length !== LABOUR_LAW_DEFINITION.length) {
//         feedback.className = 'feedback error';
//         feedback.textContent = blocks.length < LABOUR_LAW_DEFINITION.length
//             ? `❌ Недостаточно фрагментов (${blocks.length} вместо ${LABOUR_LAW_DEFINITION.length}).`
//             : `❌ Слишком много фрагментов (${blocks.length} вместо ${LABOUR_LAW_DEFINITION.length}).`;
//             await saveResult(false);
//         return;
//     }

//     const isCorrect = LABOUR_LAW_DEFINITION.every((part, i) => blocks[i] === part.trim());

//     if (isCorrect) {
//         feedback.className = 'feedback success';
//         feedback.textContent = '✅ Определение составлено верно';
//         document.getElementById('check-definition-btn').disabled = true;

//         // Сохраняем результат на сервер
//         await saveResult(true);

//         // setTimeout(() => {
//         //     window.location.href = "/stage/2"; // сервер сам определит attempt через сессию
//         // }, 1000);
//     } else {
//         feedback.className = 'feedback error';
//         feedback.textContent = '❌ Формулировка не совпадает с определением из лекции.';
//         await saveResult(false);
//     }
// }

async function checkDefinition() {
    if (!taskUnlocked || !taskStartedAt) return;
    const dropZone = document.getElementById('definition-drop');
    const blocks = Array.from(dropZone.querySelectorAll('.block')).map(b => b.textContent.trim());
    const feedback = document.getElementById('definition-feedback');
    const previousBest = await getBestTime(stage, question);
    let isCorrect = false;

    if (blocks.length === LABOUR_LAW_DEFINITION.length) {
        isCorrect = LABOUR_LAW_DEFINITION.every(
            (part, i) => blocks[i] === part.trim()
        );
    }

    feedback.className = `feedback ${isCorrect ? 'success' : 'error'}`;
    feedback.textContent = isCorrect
        ? '✅ Определение составлено верно'
        : '❌ Формулировка неверна';

    // document.getElementById('check-definition-btn').disabled = true;
    clearInterval(timerInterval);
    

    if (previousBest !== null && wastedTime < previousBest && isCorrect) {
        showRecordCelebration(previousBest, wastedTime);
        }

    await saveResult(isCorrect);
}
async function saveResult(isCorrect) {
    

    const wastedTime = Math.floor((Date.now() - taskStartedAt) / 1000); // в секундах
    console.log(wastedTime);
    try {
        const res = await fetch(`/api/stage/${stage}/q/${question}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                correct: isCorrect,
                stage_number: stage,
                question_number: question,
                correct: isCorrect,
                wasted_time: wastedTime
            })
        });
        
        const data = await res.json();
        if (!data.saved) {
            console.error("Не удалось сохранить ответ");
        }
    } catch (err) {
        console.error("Ошибка сохранения:", err);
    }
}
