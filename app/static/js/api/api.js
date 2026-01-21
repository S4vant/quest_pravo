// Имеющиеся запросы:

// /api/start_attempt
// /api/stage/{stage}/q/{question}
// /api/user/progress
// /api/profile
import { progressStore } from "../engine/progress-store.js";
import { stageDataStore } from '../engine/stage-data-store.js';
export async function startAttempt() {
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

export async function loadProfile() {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const rating = document.getElementById("rating")?.value.trim();

    if (!name || !email) {
        document.getElementById("form-error").innerText =
            "Заполните ФИО и email";
        return;
    }

    const res = await fetch("/api/profile", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ full_name: name, email, rating })
    });

    const data = await res.json();

    // ❌ ошибка валидации
    if (!res.ok) {
        document.getElementById("form-error").innerText =
            data.detail || "Ошибка профиля";
        return;
    }

    // дальше только если профиль ОК
    const attemptRes = await fetch("/api/start_attempt", {
        method: "POST"
    });

    const attemptData = await attemptRes.json();
    if (attemptData.error) {
        alert(attemptData.error);
        return;
    }

    window.location.href = "/api/profile";
}

export async function loadProfileFromServer() {
    const res = await fetch("/api/me");
    const data = await res.json();

    if (data.error) {
        console.error(data.error);
        return;
    }

    localStorage.setItem("user", JSON.stringify(data));

    const nameEl = document.querySelector(".profile-name");
    const emailEl = document.querySelector(".profile-email");
    const ratingEl = document.getElementById("profile-rating");
    if (nameEl) nameEl.textContent = data.full_name;
    if (emailEl) emailEl.textContent = data.email;
    if (ratingEl) ratingEl.textContent = data.rating;
}

export async function logout() {
    if (!confirm("Выйти из профиля?")) return;
    try {
        await fetch("/api/logout", { method: "POST" });
    } catch (e) {
        console.warn("Logout request failed", e);
    }

    // чистим клиентский кеш
    localStorage.clear();
    sessionStorage.clear();

    // редирект на логин / регистрацию
    window.location.href = "/quest";
}

export function getBestTime(stage, question) {
    return progressStore.getBest(stage, question);
}

export async function loadUserProgressOnce() {
    if (progressStore.isLoaded()) return;

    try {
        const res = await fetch('/api/user/progress');
        const data = await res.json();
        progressStore.loadFromServer(data);
    } catch (err) {
        console.error('Ошибка загрузки прогресса:', err);
    }
}

export async function loadStageOnce(stage) {
    if (stageDataStore.has(stage)) {
        return stageDataStore.getStage(stage);
    }

    const res = await fetch(`/static/data/stage_${stage}.json`);
    const data = await res.json();

    stageDataStore.set(stage, data);

    // прогресс тоже грузим один раз
    await loadUserProgressOnce();

    return data;
}


export async function loadProgress() {
    try {
        const res = await fetch("/api/user/progress");
        const data = await res.json();

        if (!data.stages || !Array.isArray(data.stages)) return;

        let totalRating = 0;

        data.stages.forEach(stageData => {
            const stageNumber = stageData.stage;
            const questions = stageData.questions || [];

            // === НАХОДИМ КАРТОЧКУ ЭТАПА ===
            const card = Array.from(document.querySelectorAll(".stage-card"))
                .find(card =>
                    card.querySelector(".stage-num")?.textContent == stageNumber
                );

            if (!card) {
                console.warn(`Stage card ${stageNumber} not found`);
                return;
            }

            // === ЗАВЕРШЁННЫЕ ВОПРОСЫ ===
            const completedQuestions = questions.filter(q => q.completed === true);

            const completed = new Set(
                completedQuestions.map(q => q.q)
            ).size;

            const total = 5;
            const percent = total === 0
                ? 0
                : Math.round((completed / total) * 100);

            // === ПРОГРЕСС-БАР ===
            const bar = document.querySelector(`#progress-stage-${stageNumber}`);
            if (bar) {
                bar.style.width = percent + "%";
                bar.textContent = percent + "%";
            }

            // === ОЧКИ ЭТАПА ===
            let stageScore = 0;
            completedQuestions.forEach(q => {
                stageScore += calcQuestionScore(q.wasted_time);
            });

            totalRating += stageScore;

            const scoreEl = card.querySelector(".stage-score");
            if (scoreEl) {
                scoreEl.textContent = `Очки: ${stageScore} `;

                // анимация обновления (если есть)
                const scoreBlock = scoreEl.closest(".score");
                if (scoreBlock) {
                    scoreBlock.classList.remove("updated");
                    void scoreBlock.offsetWidth;
                    scoreBlock.classList.add("updated");
                }
            }
        });

        // === ОБЩИЙ РЕЙТИНГ ===
        
        if (document.getElementById("profile-rating")) {
            const localdata = JSON.parse(localStorage.getItem("user"));
            localdata.rating = totalRating;
            localStorage.setItem("user", JSON.stringify(localdata));
        }

    } catch (err) {
        console.error("Ошибка загрузки прогресса:", err);
    }
}
function calcQuestionScore(wastedTime) {
    if (!wastedTime || wastedTime <= 0) return 0;
    return Math.floor(60 / wastedTime);
}
