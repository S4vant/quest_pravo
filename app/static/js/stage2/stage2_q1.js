const LABOUR_LAW_SUBJECT = [
    "Предметом трудового права является",
    "комплекс общественных отношений,",
    "возникающих между работником и работодателем,",
    "на основании трудового договора,",
    "а также отношений,",
    "непосредственно связанных с трудом."
];

const LABOUR_LAW_SUBJECT_DISTRACTORS = [
    "возникающих между государствами",
    "основанных на купле-продаже имущества",
    "регулирующих уголовную ответственность",
    "связанных исключительно с предпринимательством",
    "возникающих без участия человека"
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

function initStage1() {
    const bank = document.getElementById('definition-bank');
    const dropZone = document.getElementById('definition-drop');

    let allBlocks = shuffle([...LABOUR_LAW_SUBJECT, ...LABOUR_LAW_SUBJECT_DISTRACTORS]);
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



async function checkDefinition() {
    const dropZone = document.getElementById('definition-drop');
    const blocks = Array.from(dropZone.querySelectorAll('.block')).map(b => b.textContent.trim());
    const feedback = document.getElementById('definition-feedback');

    if (blocks.length === 0) {
        feedback.className = 'feedback error';
        feedback.textContent = '❌ Поле пусто. Соберите определение.';
        saveResult(false);
        return;
    }

    if (blocks.length !== LABOUR_LAW_SUBJECT.length) {
        feedback.className = 'feedback error';
        feedback.textContent = blocks.length < LABOUR_LAW_SUBJECT.length
            ? `❌ Недостаточно фрагментов (${blocks.length} вместо ${LABOUR_LAW_SUBJECT.length}).`
            : `❌ Слишком много фрагментов (${blocks.length} вместо ${LABOUR_LAW_SUBJECT.length}).`;
            saveResult(false);
        return;
    }

    const isCorrect = LABOUR_LAW_SUBJECT.every((part, i) => blocks[i] === part.trim());

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
        const res = await fetch("/api/stage/2/q/1", {
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
