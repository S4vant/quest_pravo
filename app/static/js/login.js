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
    window.location.href = "/profile";
}
