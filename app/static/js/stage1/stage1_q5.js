// Этап 5
const TARGET_WORDS_SOURCES = [
    "КОНСТИТУЦИЯРФ",
    "ФКЗ",
    "ТРУДОВОЙКОДЕКС",
    "УКАЗЫПРЕЗИДЕНТА",
    "ПОСТАНОВЛЕНИЯПРАВИТЕЛЬСТВА"
];

const DISTRACTOR_WORDS = [
    "МОРАЛЬ", "ДОБРО", "ВОЛЯ", "ШАРФ", "КНИГА"
];

let grid = Array.from({ length: 15 }, () => Array(15).fill('.')); // увеличим размер для длинных слов
let selectedWords = [];

const WORD_PLACEMENTS_SOURCES = [
    { word: "КОНСТИТУЦИЯРФ", row: 0, col: 0, dir: "h" },
    { word: "ФКЗ", row: 2, col: 5, dir: "h" },
    { word: "ТРУДОВОЙКОДЕКС", row: 4, col: 0, dir: "h" },
    { word: "УКАЗЫПРЕЗИДЕНТА", row: 6, col: 2, dir: "h" },
    { word: "ПОСТАНОВЛЕНИЯПРАВИТЕЛЬСТВА", row: 10, col: 0, dir: "h" },
    // дистракторы
    { word: "МОРАЛЬ", row: 1, col: 10, dir: "h" },
    { word: "ДОБРО", row: 8, col: 5, dir: "h" },
    { word: "ВОЛЯ", row: 12, col: 8, dir: "h" }
];

function initGridSources() {
    // очистка
    for (let r = 0; r < grid.length; r++)
        for (let c = 0; c < grid[r].length; c++)
            grid[r][c] = '.';

    // вставка слов
    WORD_PLACEMENTS_SOURCES.forEach(({ word, row, col, dir }) => {
        for (let i = 0; i < word.length; i++) {
            if (dir === "h") grid[row][col + i] = word[i].toUpperCase();
            else grid[row + i][col] = word[i].toUpperCase();
        }
    });

    // случайные буквы
    const RU = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    for (let r = 0; r < grid.length; r++)
        for (let c = 0; c < grid[r].length; c++)
            if (grid[r][c] === '.') grid[r][c] = RU[Math.floor(Math.random() * RU.length)];

    // отрисовка
    const gridEl = document.getElementById('word-grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = grid[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClickSources(r, c));
            gridEl.appendChild(cell);
        }
    }

    selectedWords = [];
    updateSelectionInfoSources();
    document.getElementById('check-grid-btn').disabled = false;
}

function findWordAtSources(r, c) {
    for (const item of WORD_PLACEMENTS_SOURCES) {
        const { word, row, col, dir } = item;
        if (dir === "h" && r === row && c >= col && c < col + word.length) {
            const cells = Array.from({ length: word.length }, (_, i) => ({ r: row, c: col + i }));
            return { word, cells };
        }
        if (dir === "v" && c === col && r >= row && r < row + word.length) {
            const cells = Array.from({ length: word.length }, (_, i) => ({ r: row + i, c: col }));
            return { word, cells };
        }
    }
    return null;
}

function handleCellClickSources(r, c) {
    const wordInfo = findWordAtSources(r, c);
    if (!wordInfo) return;

    const { word, cells } = wordInfo;
    const lowerWord = word.toLowerCase();
    const isSelected = selectedWords.includes(lowerWord);

    cells.forEach(({ r, c }) => {
        const el = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (el) {
            el.classList.toggle('selected', !isSelected);
            // el.style.backgroundColor = !isSelected ? '#bee3f8' : 'white';
        }
    });

    if (isSelected) selectedWords = selectedWords.filter(w => w !== lowerWord);
    else selectedWords.push(lowerWord);

    updateSelectionInfoSources();
}

function updateSelectionInfoSources() {
    document.getElementById('selected-count').textContent = selectedWords.length;
    document.getElementById('selected-words').textContent =
        selectedWords.length ? `(${selectedWords.join(', ')})` : '';
}

function clearGridSelectionSources() {
    document.querySelectorAll('.grid-cell.selected').forEach(el => {
        el.classList.remove('selected');
        el.style.backgroundColor = 'white';
    });
    selectedWords = [];
    updateSelectionInfoSources();
}

function checkGridSelectionSources() {
    const feedback = document.getElementById('crossword-feedback');
    const required = new Set(TARGET_WORDS_SOURCES.map(w => w.toLowerCase()));
    const user = new Set(selectedWords);

    const missing = [...required].filter(w => !user.has(w));
    const extra = [...user].filter(w => !required.has(w));

    if (!missing.length && !extra.length) {
        feedback.className = 'feedback success';
        feedback.textContent = '✅ Все источники трудового права найдены!';
        saveResult5(true);
        document.getElementById('stage-5').classList.add('completed');
        setTimeout(() => {
            document.getElementById('final-message').style.display = 'block';
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 500);
    } else {
        let msg = '❌ Ошибки:';
        if (missing.length) msg += `\nОтсутствуют: ${missing.join(', ')}`;
        if (extra.length) msg += `\nЛишние: ${extra.join(', ')}`;
        feedback.className = 'feedback error';
        feedback.textContent = msg;
        saveResult5(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initGridSources();
});
function resetViolations() {
    initGridSources();
}
async function saveResult5(isCorrect) {
    try {
        // const attemptId = window.attemptId; // или data-атрибут
        // if (!attemptId) throw new Error("Не найден attempt_id");

        const res = await fetch("/api/stage/1/q/5", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                attempt_id: attemptId,
                stage_number: 1,
                question_number: 5,
                correct: isCorrect
            })
        });

        const data = await res.json();
        if (!data.saved) console.error("Ошибка при сохранении результата");
    } catch (err) {
        console.error("Ошибка при сохранении результата:", err);
    }
}