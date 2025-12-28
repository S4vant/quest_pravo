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
const wrapper = document.querySelector('.stage-content');

const stage = Number(wrapper.dataset.stage);
const question = Number(wrapper.dataset.question);
document.addEventListener('DOMContentLoaded', () => {
    initTaskWrapper();
    initStage1();
    setupDragAndDrop();
});



function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}



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

function initTaskWrapper() {
    const startBtn = document.getElementById('start-task-btn');
    const timerEl = document.getElementById('start-timer');
    const cover = document.getElementById('task-cover');
    const content = document.getElementById('task-content');

    startBtn.addEventListener('click', () => {
        startBtn.disabled = true;
        timerEl.classList.remove('hidden');

        let timeLeft = 3;
        timerEl.textContent = timeLeft;

        const interval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft === 0) {
                clearInterval(interval);

                cover.classList.add('hidden');
                content.classList.remove('hidden');

                taskStartedAt = Date.now();
                taskUnlocked = true;

                startLiveTimer(); 
            }
        }, 1000);
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
}

function clearDropZone(zoneId) {
    const zone = document.getElementById(zoneId);
    const bank = document.getElementById('definition-bank');

    Array.from(zone.children).forEach(block => bank.appendChild(block));
}
function startLiveTimer() {
    const timerEl = document.getElementById('task-timer');
    if (!timerEl) return;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!taskStartedAt) return;

        const seconds = Math.floor((Date.now() - taskStartedAt) / 1000);
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;

        timerEl.textContent = `⏱ ${min}:${sec.toString().padStart(2, '0')}`;
    }, 500);
}
async function getBestTime(stage, question) {
    try {
        const res = await fetch("/api/user/progress");
        const data = await res.json();

        const stageData = data.stages?.find(s => s.stage === stage);
        if (!stageData) return null;

        const qData = stageData.questions?.find(q => q.q === question);
        if (!qData || qData.wasted_time == null) return null;

        return qData.wasted_time;
    } catch {
        return null;
    }
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
