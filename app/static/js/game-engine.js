let stageData;
let gameIndex = 0;
let itemIndex = 0;
let score = 0;

fetch("/static/stages/stage1.json")
  .then(r => r.json())
  .then(data => {
    stageData = data;
    renderGame();
  });

function renderGame() {
  const game = stageData.games[gameIndex];
  const item = game.items[itemIndex];

  document.getElementById("title").innerText = game.title;
  document.getElementById("text").innerText = item.text;

  const area = document.getElementById("actions");
  area.innerHTML = "";

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

function finishStage() {
  alert(`Этап завершён. Баллы: ${score}`);
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
async function loadProgress() {
    try {
        // Очистка прогресса
        const progressBar = document.getElementById("progress-bar");
        const progressText = document.getElementById("progress-text");
        if (progressBar) progressBar.style.width = "0%";
        if (progressText) progressText.textContent = "0%";

        selectedWords = []; // для этапа 5, если был заполнен
        document.getElementById('selected-count').textContent = '0';
        document.getElementById('selected-words').textContent = '';

        // Запрос прогресса с сервера
        const res = await fetch("/api/user/progress");
        const data = await res.json();

        let totalQuestions = 0;
        let completedQuestions = 0;

        data.stages.forEach(stage => {
            stage.questions.forEach(q => {
                totalQuestions++;
                if (q.completed === true || q.completed === "True" || q.completed === "true") {
                    completedQuestions++;
                }
            });
        });

        const percent = totalQuestions === 0 ? 0 : Math.round((completedQuestions / totalQuestions) * 100);

        if (progressBar) progressBar.style.width = percent + "%";
        if (progressText) progressText.textContent = percent + "%";

    } catch (err) {
        console.error("Ошибка загрузки прогресса:", err);
    }
}


document.addEventListener("DOMContentLoaded", loadProgress);
