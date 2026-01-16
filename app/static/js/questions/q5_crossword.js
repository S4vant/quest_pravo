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
}

function getSelectedWords(wrapper) {
    const el = wrapper.querySelector('.selected-words');
    if (!el || !el.dataset.words) return [];
    return el.dataset.words.split(',').filter(Boolean);
}

function setSelectedWords(wrapper, words) {
    const el = wrapper.querySelector('.selected-words');
    if (!el) return;

    el.dataset.words = words.join(',');
    wrapper.querySelector('.selected-count').textContent = words.length;
    el.textContent = words.length ? `(${words.join(', ')})` : '';
}

export function clearSelectedWords(wrapper) {
    const el = wrapper.querySelector('.selected-words');

    if (!el) return;

    el.dataset.words = '';
    el.textContent = '';
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

    const wordsCopy = shuffle([...words]);
    const sumLength = wordsCopy.reduce((a, w) => a + w.length, 0);

    let cursor = 0;
    let i =0;

    for (const word of wordsCopy) {
        i++;
        if (cursor + word.length > totalCells) {
            console.warn(`Сетка переполнена, слово пропущено: ${word}`);
            continue;
        }

        const cells = [];

        for (let j = 0; j < word.length; j++) {
            const linear = cursor + j;
            const r = Math.floor(linear / gridSize);
            const c = linear % gridSize;
            grid[r][c] = word[j];
            cells.push({ r, c });
        }

        placements.push({index: i, word, cells });

        const maxGap = Math.floor((totalCells - sumLength - cursor)/(words.length-i));
        const gap = maxGap > 0 ? getRandomInt(maxGap + 1) : 1;
        cursor += word.length + gap;
    }

    return { grid, placements };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
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
    const selected = getSelectedWords(wrapper);
    const isSelected = selected.includes(wordKey);

    info.cells.forEach(({ r, c }) => {
        const el = wrapper.querySelector(
            `.grid-cell[data-row="${r}"][data-col="${c}"]`
        );
        if (el) el.classList.toggle('selected', !isSelected);
    });

    const updated = isSelected
        ? selected.filter(w => w !== wordKey)
        : [...selected, wordKey];

    setSelectedWords(wrapper, updated);
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
    if (!gameState.taskUnlocked || !gameState.taskStartedAt) return(console.log("ошибка checkQuestion5"));

    const required = new Set(TARGET_WORDS.map(w => w.toLowerCase()));
    const user = new Set(getSelectedWords(wrapper));


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
    selectedWords = [];
}
