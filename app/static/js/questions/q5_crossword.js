import { shuffle, lockQuestionUI, unlockQuestionUi, applyPenalty, showError } from '../utils/utils.js';
import { gameState } from '../engine/state.js';
import { startLiveTimer, stopTimer, stopTaskTimer } from '../engine/timer.js';
import { saveResult, showResultOverlay } from '../engine/game-engine.js';
import { getBestTime } from '../api/api.js';
import { progressStore } from '../engine/progress-store.js';

const GRID_SIZE = 15;

let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('.'));
let selectedWords = [];
let ALL_WORDS = [];
let TARGET_WORDS = [];
let WORD_PLACEMENTS = []; // фиксированные позиции для текущей версии

// Фиксированные позиции слов (для безопасной работы)
const DEFAULT_PLACEMENTS = [
    { index: 0, row: 0, col: 0, dir: "h" },
    { index: 1, row: 2, col: 0, dir: "h" },
    { index: 2, row: 4, col: 0, dir: "h" },
    { index: 3, row: 6, col: 0, dir: "h" },
    { index: 4, row: 8, col: 0, dir: "h" }
];

export function initQuestion5(wrapper, questionData) {
    console.log('INIT QUESTION 5', questionData);
    startLiveTimer();
    unlockQuestionUi(wrapper);

    TARGET_WORDS = questionData.definition;
    ALL_WORDS = [...questionData.definition, ...questionData.distractors];

    WORD_PLACEMENTS = DEFAULT_PLACEMENTS;

    initGrid();
    renderGrid(wrapper);
    updateSelectionInfo();
}

function initGrid() {
    // очищаем сетку
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('.'));

    // размещаем слова по DEFAULT_PLACEMENTS
    WORD_PLACEMENTS.forEach(({ index, row, col, dir }) => {
        const word = ALL_WORDS[index];
        if (!word) return;

        for (let i = 0; i < word.length; i++) {
            const r = dir === 'h' ? row : row + i;
            const c = dir === 'h' ? col + i : col;
            if (r < GRID_SIZE && c < GRID_SIZE) {
                grid[r][c] = word[i];
            }
        }
    });

    // заполняем пустые клетки случайными буквами
    const RU = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '.') {
                grid[r][c] = RU[Math.floor(Math.random() * RU.length)];
            }
        }
    }

    selectedWords = [];
}

function renderGrid(wrapper) {
    const gridEl = wrapper.querySelector('.word-grid');
    gridEl.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = grid[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(r, c));
            gridEl.appendChild(cell);
        }
    }
}

function findWordAt(r, c) {
    for (const item of WORD_PLACEMENTS) {
        const { index, row, col, dir } = item;
        const word = ALL_WORDS[index];
        if (!word) continue;

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

function handleCellClick(r, c) {
    const wordInfo = findWordAt(r, c);
    if (!wordInfo) return;

    const { word, cells } = wordInfo;
    const lowerWord = word.toLowerCase();
    const isSelected = selectedWords.includes(lowerWord);

    cells.forEach(({ r, c }) => {
        const el = document.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
        if (el) {
            el.classList.toggle('selected', !isSelected);
            el.style.backgroundColor = !isSelected ? '#bee3f8' : 'white';
        }
    });

    if (isSelected) selectedWords = selectedWords.filter(w => w !== lowerWord);
    else selectedWords.push(lowerWord);

    updateSelectionInfo();
}

function updateSelectionInfo() {
    const countEl = document.getElementById('selected-count');
    const wordsEl = document.getElementById('selected-words');

    if (countEl) countEl.textContent = selectedWords.length;
    if (wordsEl) {
        wordsEl.textContent = selectedWords.length ? `(${selectedWords.join(', ')})` : '';
    }
}

export function checkQuestion5(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const required = new Set(TARGET_WORDS.map(w => w.toLowerCase()));
    const user = new Set(selectedWords);

    const missing = [...required].filter(w => !user.has(w));
    const extra = [...user].filter(w => !required.has(w));

    const feedback = wrapper.querySelector('.crossword-feedback');

    const correct = !missing.length && !extra.length;
    const wastedTime = Math.floor((Date.now() - wrapper._startTime) / 1000);
    const prevBest = getBestTime(meta.stage, meta.question);
    const isNewBest = prevBest == null || wastedTime < prevBest;
    if (correct) {
        feedback.className = 'crossword-feedback success';
        feedback.textContent = '✅ Все элементы найдены!';
        wrapper._state.completed = true;
        wrapper._state.locked = true;
        stopTaskTimer(wrapper);
        lockQuestionUI(wrapper);
        showSuccessOverlay(wrapper);
    } else {
        let msg = '❌ Ошибки:';
        if (missing.length) msg += ` Отсутствуют: ${missing.join(', ')}`;
        if (extra.length) msg += ` Лишние: ${extra.join(', ')}`;
        feedback.className = 'crossword-feedback error';
        feedback.textContent = msg;
        applyPenalty(wrapper, 5);
    }
    if (isNewBest) {
        saveResult(true, meta.stage, meta.question, wastedTime);
    }
}
