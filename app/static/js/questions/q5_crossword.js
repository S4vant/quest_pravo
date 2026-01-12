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

    const { grid: generatedGrid, placements } =
    placeWordsWithWrap([...questionData.definition, ...questionData.distractors]);

    grid = generatedGrid;
    WORD_PLACEMENTS = placements;

    fillRandomLetters(grid);
    renderGrid(wrapper);
    updateSelectionInfo(wrapper);
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

function fillRandomLetters(grid, gridSize = 15) {
    const RU = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

    for (let r = 0; r < gridSize; r++)
        for (let c = 0; c < gridSize; c++)
            if (grid[r][c] === '.')
                grid[r][c] = RU[Math.floor(Math.random() * RU.length)];
}

function placeWordsWithWrap(words, gridSize = 15) {
    const totalCells = gridSize * gridSize;
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill('.'));
    const placements = [];

    let cursor = 0; // линейный указатель по сетке

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (!word) continue;

        // если слово не помещается целиком — пропускаем
        if (cursor + word.length > totalCells) {
            console.warn(`Сетка переполнена, слово пропущено: ${word}`);
            continue;
        }

        const cells = [];

        for (let j = 0; j < word.length; j++) {
            const linear = cursor + j;
            const row = Math.floor(linear / gridSize);
            const col = linear % gridSize;

            grid[row][col] = word[j];
            cells.push({ r: row, c: col });
        }

        placements.push({
            index: i,
            word,
            cells
        });

        cursor += word.length + 1; // +1 — небольшой отступ между словами
    }

    return { grid, placements };
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
            cell.addEventListener('click', () => handleCellClick(wrapper, r, c));
            gridEl.appendChild(cell);
        }
    }
}


function findWordAt(r, c) {
    return WORD_PLACEMENTS.find(p =>
        p.cells.some(cell => cell.r === r && cell.c === c)
    ) || null;
}

function handleCellClick(wrapper, r, c) {
    const info = findWordAt(r, c);
    if (!info) return;

    const wordKey = info.word.toLowerCase();
    const isSelected = selectedWords.includes(wordKey);

    // подсветка
    info.cells.forEach(({ r, c }) => {
        const el = wrapper.querySelector(
            `.grid-cell[data-row="${r}"][data-col="${c}"]`
        );
        if (el) el.classList.toggle('selected', !isSelected);
    });

    if (isSelected) {
        selectedWords = selectedWords.filter(w => w !== wordKey);
    } else {
        selectedWords.push(wordKey);
    }

    updateSelectionInfo(wrapper);
}

function updateSelectionInfo(wrapper) {
    const countEl = wrapper.querySelector('.selected-count');
    const wordsEl = wrapper.querySelector('.selected-words');

    if (countEl) countEl.textContent = selectedWords.length;
    if (wordsEl) {
        wordsEl.textContent = selectedWords.length
            ? `(${selectedWords.join(', ')})`
            : '';
    }
}

export function checkQuestion5(wrapper, meta) {
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return;

    const required = new Set(TARGET_WORDS.map(w => w.toLowerCase()));
    const user = new Set(selectedWords);

    const missing = [...required].filter(w => !user.has(w));
    const extra = [...user].filter(w => !required.has(w));

    const feedback = wrapper.querySelector('.crossword-feedback');
    if (!feedback) return;
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
        showResultOverlay(wrapper, {
            current: wastedTime,
            best: progressStore.getBest(meta.stage, meta.question)
        });
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
