let stageData;
let gameIndex = 0;
let itemIndex = 0;
let score = 0;


function renderGame() {
  const game = stageData.games[gameIndex];
  const item = game.items[itemIndex];

  document.getElementById("title").innerText = game.title;
  document.getElementById("text").innerText = item.text;
  
  const area = document.getElementById("actions");

  if (game.type === "yes_no") {
    ["Относится", "Не относится"].forEach(val => {
      const btn = button(val, () => {
        check(val === "Относится", item);
      });
      area.appendChild(btn);
    });
  }

  if (game.type === "choice") {
    item.options.forEach((opt, i) => {
      area.appendChild(button(opt, () => check(i, item)));
    });
  }
}

function check(answer, item) {
  if (answer === item.correct) score++;
  alert(item.hint);
  next();
}

function next() {
  const game = stageData.games[gameIndex];
  itemIndex++;

  if (itemIndex >= game.items.length) {
    itemIndex = 0;
    gameIndex++;
  }

  if (gameIndex < stageData.games.length) {
    renderGame();
  } else {
    finishStage();
  }
}

function button(text, handler) {
  const b = document.createElement("button");
  b.innerText = text;
  b.onclick = handler;
  return b;
}
function loadStage1() {
    fetch("/static/stages/stage1.json")
        .then(r => r.json())
        .then(data => {
            stageData = data;
            gameIndex = 0;
            itemIndex = 0;
            score = 0;
            renderGame();
        });
}

let currentEmail = null;
let attemptId = null;

async function loadProfile() {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
  
    if (!name || !email) {
        document.getElementById("form-error").innerText = "Заполните ФИО и email";
        return;
    }

    await fetch("/api/profile", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ full_name: name, email })
    });
    const res = await fetch("/api/start_attempt", {
        method: "POST"
    });  
    const data = await res.json();
    if (data.error) {
        alert(data.error);
    }
    // ⬅️ сразу в профиль
    window.location.href = "/api/profile";
}


async function startAttempt() {
    const nameElem = document.querySelector(".profile-name");
    const emailElem = document.querySelector(".profile-email");

    const name = nameElem?.innerText.trim();
    const email = emailElem?.innerText.trim();

    if (!name || !email) {
        alert("ФИО или email не указаны!");
        return;
    }

    await fetch("/api/profile", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ full_name: name, email })
    });

    const res = await fetch("/api/start_attempt", { method: "POST" });
    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    window.location.href = "/stage/1";
}


function completeStage(stageNumber) {
    fetch("/api/stage/complete", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            attempt_id: attemptId,
            stage_number: stageNumber
        })
    })
    .then(() => {
        window.location.href = "/stage/1/test";
    });
}
function logAnswer(questionNumber, isCorrect) {
    fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            attempt_id: ATTEMPT_ID,
            stage_number: STAGE_NUMBER,
            question_number: questionNumber,
            correct: isCorrect
        })
    });
}

// async function loadProgress() {
//     try {
        
//         const res = await fetch("/api/user/progress");
//         const data = await res.json();

//         if (!data.stages || !Array.isArray(data.stages)) return;

//         data.stages.forEach(stageData => {
//             const stageNumber = stageData.stage;
//             const questions = stageData.questions || [];
//             const completed = questions.filter(q => q.completed === true).length;
//             const total = 5;

//             const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

//             const bar = document.querySelector('.progress-bar');

//             console.log("Бар:", bar, "Процент:", percent);

//             if (!bar) {
//                 console.warn(`Progress bar for stage ${stageNumber} not found`);
//                 return;
//             }

//             bar.style.width = percent + "%";
//             bar.textContent = percent + "%";
//         });

//     } catch (err) {
//         console.error("Ошибка загрузки прогресса:", err);
//     }
// }
async function loadProgress() {
    try {
        const res = await fetch("/api/user/progress");
        const data = await res.json();

        if (!data.stages || !Array.isArray(data.stages)) return;

        data.stages.forEach(stageData => {
            const stageNumber = stageData.stage; // Например: 1, 2 или 3
            const questions = stageData.questions || [];
            const completed = questions.filter(q => q.completed === true).length;
            const total = 5;

            const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

            // Ищем бар конкретно для этого этапа. 
            // Используем шаблонную строку для поиска по ID (например, #progress-stage-1)
            const bar = document.querySelector(`#progress-stage-${stageNumber}`);

            if (!bar) {
                console.warn(`Прогресс-бар для этапа ${stageNumber} не найден (искал #progress-stage-${stageNumber})`);
                return;
            }

            bar.style.width = percent + "%";
            bar.textContent = percent + "%";
            
            // Если нужно менять цвет или логировать
            console.log(`Stage ${stageNumber}: ${percent}%`);
        });

    } catch (err) {
        console.error("Ошибка загрузки прогресса:", err);
    }
}
function showRecordCelebration(oldTime, newTime) {
    const el = document.getElementById('record-celebration');
    const text = el.querySelector('.record-time');

    text.textContent = `Было: ${oldTime}с → Стало: ${newTime}с`;

    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, 3000);
}


document.addEventListener("DOMContentLoaded", loadProgress);

