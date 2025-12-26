const LABOUR_VIOLATIONS = [
    { term: "Незаконный отказ в приёме на работу", def: "Отказ в трудоустройстве из-за возраста" },
    { term: "Нарушение права на оплату труда", def: "Задержка выплаты заработной платы на месяц" },
    { term: "Привлечение к сверхурочной работе без согласия", def: "Обязательное привлечение к работе в выходной без письменного согласия" },
    { term: "Дискриминация в сфере труда", def: "Отказ в повышении по причине пола работника" }
];

const VIOLATION_DISTRACTORS = [
    "Запрет пить чай после 18:00",
    "Обязательное ношение галстука в выходной",
    "Требование улыбаться начальству"
];


function initStage4() {
    const violationsContainer = document.getElementById("violations-container");
    const bank = document.getElementById("situations-bank");

    violationsContainer.innerHTML = "";
    bank.innerHTML = "";

    LABOUR_VIOLATIONS.forEach(v => {
        const slot = document.createElement("div");
        slot.className = "drop-zone term-slot";
        slot.dataset.term = v.term;
        slot.innerHTML = `
            <strong>${v.term}</strong>
            <div class="drop-placeholder">→ перетащите ситуацию</div>
        `;
        violationsContainer.appendChild(slot);
    });

    let situations = [
        ...LABOUR_VIOLATIONS.map(v => v.def),
        ...VIOLATION_DISTRACTORS
    ].map((text, i) => ({ id: `sit-${i}`, text }));

    situations = shuffle(situations);

    situations.forEach(item => {
        const block = document.createElement("div");
        block.className = "block";
        block.draggable = true;
        block.textContent = item.text;
        block.dataset.text = item.text;
        bank.appendChild(block);
    });
}

function checkViolations() {
    const slots = document.querySelectorAll("#violations-container .term-slot");
    const feedback = document.getElementById("violations-feedback");
    let errors = [];

    slots.forEach(slot => {
        const term = slot.dataset.term;
        const expected = LABOUR_VIOLATIONS.find(v => v.term === term).def;
        const block = slot.querySelector(".block");

        if (!block) {
            errors.push(`${term}: не выбрана ситуация`);
            return;
        }

        if (block.textContent.trim() !== expected) {
            block.classList.add("incorrect");
            errors.push(`${term}: неверное соответствие`);
        } else {
            block.classList.add("correct");
            block.classList.remove("incorrect");
        }
    });

    if (errors.length === 0) {
        saveResult4(true);
        feedback.className = "feedback success";
        feedback.textContent = "✅ Все нарушения определены верно!";
        // тут можно saveResult(stage, q)
    } else {
        saveResult4(false);
        feedback.className = "feedback error";
        feedback.innerHTML = "❌ Ошибки:<br>" + errors.map(e => `• ${e}`).join("<br>");
    }
}



document.addEventListener('DOMContentLoaded', () => {
    initStage4();
});
function resetViolations() {
    initStage4();
}

async function saveResult4(isCorrect) {
    try {
        // const attemptId = window.attemptId; // или data-атрибут
        // if (!attemptId) throw new Error("Не найден attempt_id");

        const res = await fetch("/api/stage/1/q/4", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                attempt_id: attemptId,
                stage_number: 1,
                question_number: 4,
                correct: isCorrect
            })
        });

        const data = await res.json();
        if (!data.saved) console.error("Ошибка при сохранении результата");
    } catch (err) {
        console.error("Ошибка при сохранении результата:", err);
    }
}
