const PRINCIPLES_CORRECT = [
    "Свобода труда",
    "Запрет принудительного труда",
    "Запрет дискриминации в сфере труда",
    "Равенство прав и возможностей работников",
    "Обеспечение права каждого на справедливые условия труда"
];

const PRINCIPLES_DISTRACTORS = [
    "Обязанность работать по настроению работодателя",
    "Принцип утреннего кофе на рабочем месте",
    "Свобода увольнения без объяснений",
    "Право работодателя кричать в понедельник",
    "Обязательный сверхурочный энтузиазм"
];


document.addEventListener('DOMContentLoaded', () => {
    initStage3();
});

function initStage3() {
    const bank = document.getElementById('principles-bank');
    const drop = document.getElementById('principles-drop');

    if (!bank || !drop) return;

    let all = shuffle([...PRINCIPLES_CORRECT, ...PRINCIPLES_DISTRACTORS]);
    bank.innerHTML = '';
    drop.innerHTML = '';

    all.forEach(text => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = text;
        block.dataset.correct = PRINCIPLES_CORRECT.includes(text) ? 'true' : 'false';

        // ТАП-КЛИК (мобилка)
        block.addEventListener('click', () => {
            if (block.parentElement === bank) {
                drop.appendChild(block);
            } else {
                bank.appendChild(block);
            }
            document.getElementById('check-principles-btn').disabled = drop.children.length === 0;
        });

        // DRAG (ПК)
        if (!IS_MOBILE) block.draggable = true;

        bank.appendChild(block);
    });
}
function checkPrinciples() {
    const drop = document.getElementById('principles-drop');
    const feedback = document.getElementById('principles-feedback');
    const blocks = Array.from(drop.querySelectorAll('.block')).map(b => b.textContent.trim());

    if (blocks.length !== PRINCIPLES_CORRECT.length) {
        feedback.className = 'feedback error';
        feedback.textContent =
            blocks.length < PRINCIPLES_CORRECT.length
                ? `❌ Недостаточно принципов (${blocks.length} из ${PRINCIPLES_CORRECT.length})`
                : `❌ Лишние элементы (${blocks.length} вместо ${PRINCIPLES_CORRECT.length})`;
        return;
    }

    const selected = new Set(blocks);
    const required = new Set(PRINCIPLES_CORRECT);

    const missing = [...required].filter(x => !selected.has(x));
    const extra = [...selected].filter(x => !required.has(x));

    if (missing.length || extra.length) {
        let msg = '❌ Ошибка:\n';
        if (missing.length) msg += `Отсутствуют: ${missing.join(', ')}\n`;
        if (extra.length) msg += `Лишние: ${extra.join(', ')}`;
        feedback.className = 'feedback error';
        feedback.textContent = msg;
        return;
    }
    saveResult3(true);
    feedback.className = 'feedback success';
    feedback.textContent = '✅ Все принципы трудового права выбраны верно!';
    document.getElementById('check-principles-btn').disabled = true;
    document.getElementById('stage-4').classList.add('completed');

    // тут можешь сохранить результат
}


async function saveResult3(isCorrect) {
    try {
        // const attemptId = window.attemptId; // или data-атрибут
        // if (!attemptId) throw new Error("Не найден attempt_id");

        const res = await fetch("/api/stage/1/q/3", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                attempt_id: attemptId,
                stage_number: 1,
                question_number: 3,
                correct: isCorrect
            })
        });

        const data = await res.json();
        if (!data.saved) console.error("Ошибка при сохранении результата");
    } catch (err) {
        console.error("Ошибка при сохранении результата:", err);
    }
}
