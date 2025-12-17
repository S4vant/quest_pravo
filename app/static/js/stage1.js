function startStage() {
    document.querySelector('.primary-btn').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';

    document.getElementById('game-area').innerHTML = `
        <h3>Мини-игра скоро начнётся</h3>
        <p>Подготовка задания...</p>
    `;
}
