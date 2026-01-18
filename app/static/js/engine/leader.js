export async function loadLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();

    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${row.position}</td>
            <td>${row.full_name}</td>
            <td>${row.rating}</td>
        `;

        tbody.appendChild(tr);
    });
}
