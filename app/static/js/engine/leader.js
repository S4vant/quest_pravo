export async function loadLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();

    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        const localdata = JSON.parse(localStorage.getItem("user"));
        if (localdata != null && row.full_name == localdata.full_name && row.rating == localdata.rating) {
            tr.innerHTML = `
            <td>${row.position}</td>
            <td style="font-weight: bold;">${row.full_name}</td>
            <td>${row.rating}</td>
        `;
        } else {
            tr.innerHTML = `
            <td>${row.position}</td>
            <td>${row.full_name}</td>
            <td>${row.rating}</td>
        `;
        }
        tbody.appendChild(tr);
    });
}
