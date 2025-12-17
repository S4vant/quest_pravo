async function startAttempt() {
    const res = await fetch("/api/start_attempt", {
        method: "POST"
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    window.location.href = "/stage/1";
}

function startStage(num) {
    window.location.href = `/stage/${num}`;
}