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

function loadProfile() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const error = document.getElementById("form-error");

    error.innerText = "";
    if (!email) {
        error.innerText = "Введите email";
        return;
    }

    fetch("/api/profile", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({full_name: name, email: email})
    })
    .then(r => r.json())
    .then(data => {
        currentEmail = email;

        document.getElementById("player-form").style.display = "none";
        document.getElementById("profile").style.display = "block";

        document.getElementById("p-name").innerText = data.profile.full_name;
        document.getElementById("p-email").innerText = data.profile.email;

        renderAttempts(data.profile.attempts);
    });
}

function renderAttempts(attempts) {
    const div = document.getElementById("attempts");
    div.innerHTML = "<h3>Прохождения:</h3>";

    if (attempts.length === 0) {
        div.innerHTML += "<p>Прохождений нет</p>";
        return;
    }

    let finished = false;

    attempts.forEach(a => {
        div.innerHTML += `
          <p>
            📅 ${new Date(a.started_at).toLocaleDateString()} —
            🎯 ${a.total_score} —
            📌 ${a.status}
          </p>
        `;
        if (a.status === "finished") finished = true;
    });

    if (finished) {
        document.getElementById("start-btn").style.display = "none";
    }
}

function startAttempt() {
    fetch(`/api/start_attempt?email=${currentEmail}`, {
        method: "POST"
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            attemptId = data.attempt_id;
            document.getElementById("profile").style.display = "none";
            document.getElementById("stage-container").style.display = "block";
            loadStage1();
        }
    });
}

