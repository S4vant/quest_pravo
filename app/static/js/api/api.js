// Имеющиеся запросы:

// /api/start_attempt
// /api/stage/{stage}/q/{question}
// /api/user/progress

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

export async function getBestTime(stage, question) {
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



export async function loadProgress() {
    try {
        const res = await fetch("/api/user/progress");
        const data = await res.json();

        if (!data.stages || !Array.isArray(data.stages)) return;

        data.stages.forEach(stageData => {
            const stageNumber = stageData.stage; // Например: 1, 2 или 3
            const questions = stageData.questions || [];
            // Подсчитываем количество завершенных уникальных вопросов
            const completed_array = questions.filter(q => q.completed === true);
            console.log(completed_array);
            const completed =  new Set(completed_array.map(q => q.q)).size;
            console.log(completed); 
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
            console.log(completed)
            // Если нужно менять цвет или логировать
            console.log(`Stage ${stageNumber}: ${percent}%`);
        });

    } catch (err) {
        console.error("Ошибка загрузки прогресса:", err);
    }
}