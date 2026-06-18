import { getCurrentUser, adjustSkillSparks, checkInToday } from '../auth.js';
import { showMentorMessage } from '../components/Mentor.js';
import confetti from 'canvas-confetti';

// -------------------------------------------------------------
// SEED & PRNG GENERATORS (Locked strictly to daily formula)
// -------------------------------------------------------------
export function getDailySeed() {
  const str = new Date().toDateString(); // e.g. "Thu Jun 18 2026"
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function lcg(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function deterministicShuffle(array, randFunc) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randFunc() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// -------------------------------------------------------------
// DYNAMIC DAILY CONFIGURATION SYSTEM
// -------------------------------------------------------------
export function getDailyPuzzleConfig() {
  const seed = getDailySeed();
  const rand = lcg(seed);

  // Pool of pre-checked adjacent 6-node path channels on a 4x4 coordinate system
  const codeZipPool = [
    [ {r: 0, c: 0}, {r: 0, c: 1}, {r: 1, c: 1}, {r: 1, c: 2}, {r: 2, c: 2}, {r: 3, c: 2} ],
    [ {r: 3, c: 0}, {r: 2, c: 0}, {r: 2, c: 1}, {r: 1, c: 1}, {r: 0, c: 1}, {r: 0, c: 2} ],
    [ {r: 1, c: 0}, {r: 1, c: 1}, {r: 1, c: 2}, {r: 2, c: 2}, {r: 3, c: 2}, {r: 3, c: 3} ],
    [ {r: 0, c: 3}, {r: 1, c: 3}, {r: 1, c: 2}, {r: 2, c: 2}, {r: 2, c: 1}, {r: 3, c: 1} ],
    [ {r: 2, c: 0}, {r: 2, c: 1}, {r: 1, c: 1}, {r: 0, c: 1}, {r: 0, c: 2}, {r: 0, c: 3} ],
    [ {r: 0, c: 0}, {r: 1, c: 0}, {r: 1, c: 1}, {r: 1, c: 2}, {r: 2, c: 2}, {r: 2, c: 3} ],
    [ {r: 3, c: 3}, {r: 3, c: 2}, {r: 2, c: 2}, {r: 2, c: 1}, {r: 1, c: 1}, {r: 1, c: 0} ]
  ];
  const zipIndex = Math.floor(rand() * codeZipPool.length);
  const correctZipPath = codeZipPool[zipIndex];

  // Pool of lightweight 4x4 clean sudoku boards and their fixed clue indexes
  const sudokuPool = [
    {
      grid: [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3]
      ],
      fixed: [
        [true, false, false, true],
        [false, true, true, false],
        [true, false, false, true],
        [false, true, true, false]
      ]
    },
    {
      grid: [
        [4, 3, 2, 1],
        [1, 2, 4, 3],
        [3, 4, 1, 2],
        [2, 1, 3, 4]
      ],
      fixed: [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, true, false],
        [false, true, false, true]
      ]
    },
    {
      grid: [
        [2, 4, 1, 3],
        [1, 3, 2, 4],
        [4, 2, 3, 1],
        [3, 1, 4, 2]
      ],
      fixed: [
        [false, true, true, false],
        [true, false, false, true],
        [false, true, true, false],
        [true, false, false, true]
      ]
    },
    {
      grid: [
        [3, 1, 4, 2],
        [4, 2, 3, 1],
        [1, 3, 2, 4],
        [2, 4, 1, 3]
      ],
      fixed: [
        [true, false, false, true],
        [false, true, true, false],
        [true, false, false, true],
        [false, true, true, false]
      ]
    }
  ];
  const sudokuIndex = Math.floor(rand() * sudokuPool.length);
  const selectedSudoku = sudokuPool[sudokuIndex];

  // Pool of developer keywords for WordLink spelling task
  const devWords = ['PYTHON', 'REACT', 'SCOPE', 'FLASK', 'DOCKER', 'GITHUB', 'REDUX', 'COOKIE', 'SVELTE', 'NEXTJS', 'JAVA'];
  const wordIndex = Math.floor(rand() * devWords.length);
  const targetWord = devWords[wordIndex];

  return {
    codeZip: correctZipPath,
    sudoku: selectedSudoku,
    wordLink: targetWord
  };
}

// -------------------------------------------------------------
// CORE MODAL CONTROLLER & VIEWS
// -------------------------------------------------------------
export function openBrainArenaModal(activeTab = 'codezip') {
  // Clear any existing duplicates
  let modal = document.getElementById('brain-workout-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'brain-workout-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(8, 8, 12, 0.92)';
  modal.style.backdropFilter = 'blur(10px)';
  modal.style.zIndex = '1000000';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.padding = '16px';
  modal.style.boxSizing = 'border-box';

  const card = document.createElement('div');
  card.className = 'glass-panel';
  card.style.maxWidth = '580px';
  card.style.width = '100%';
  card.style.maxHeight = '92vh';
  card.style.overflowY = 'auto';
  card.style.padding = '24px';
  card.style.position = 'relative';
  card.style.borderRadius = '16px';
  card.style.background = 'linear-gradient(180deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)';
  card.style.border = '1px solid rgba(0, 243, 255, 0.25)';
  card.style.boxShadow = '0 0 35px rgba(0, 243, 255, 0.15), inset 0 1px 1px rgba(255,255,255,0.1)';

  modal.appendChild(card);
  document.body.appendChild(modal);

  const todayStr = new Date().toDateString();
  const config = getDailyPuzzleConfig();

  // Load solve states
  let isZipSolved = localStorage.getItem(`brain_arena_solved_codezip_${todayStr}`) === 'true';
  let isSudokuSolved = localStorage.getItem(`brain_arena_solved_logicsudoku_${todayStr}`) === 'true';
  let isWordSolved = localStorage.getItem(`brain_arena_solved_wordlink_${todayStr}`) === 'true';

  let currentTab = activeTab;

  // CodeZip States
  let zipClicks = []; // [{r, c}, ...]
  let zipHintNodeIdx = -1;

  // LogicSudoku States
  let sudokuGrid = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (config.sudoku.fixed[r][c]) {
        sudokuGrid[r][c] = config.sudoku.grid[r][c];
      }
    }
  }
  let sudokuHintCell = null;

  // WordLink States
  const wordLinkTarget = config.wordLink;
  let wordLinkUsedTiles = []; // indices in wordLinkTiles
  let wordLinkHintIdx = -1;

  // Generate scrambled letter tiles deterministically
  const originalChars = wordLinkTarget.split('').map((char, index) => ({ char, id: index }));
  const lettersRandFunc = lcg(getDailySeed() + 54321);
  const wordLinkTiles = deterministicShuffle(originalChars, lettersRandFunc);

  function renderStatusBadge(solved) {
    return solved 
      ? `<span style="color: var(--success); font-weight: bold;">✓ Solved</span>` 
      : `<span style="color: #ff9f43; font-weight: bold;">Pending</span>`;
  }

  function renderCodeZip() {
    let cellsHtml = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const pathIdx = config.codeZip.findIndex(coord => coord.r === r && coord.c === c);
        const isClicked = zipClicks.some(coord => coord.r === r && coord.c === c);
        
        let label = '·';
        if (pathIdx !== -1) {
          label = `N-${pathIdx + 1}`;
        }

        const isHintNode = (zipHintNodeIdx !== -1 && pathIdx === zipHintNodeIdx);

        let style = `
          width: 58px; height: 58px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); 
          font-family: var(--font-code); font-size: 0.8rem; font-weight: bold; cursor: pointer;
          display: flex; align-items:center; justify-content:center; position: relative;
          background: rgba(0,0,0,0.45); color: rgba(255,255,255,0.2); transition: all 0.2s;
        `;

        if (isZipSolved) {
          if (pathIdx !== -1) {
            style += `background: rgba(0, 255, 136, 0.15); border-color: var(--success); color: var(--success); box-shadow: 0 0 10px rgba(0, 255, 136, 0.15);`;
          } else {
            style += `opacity: 0.35;`;
          }
        } else {
          if (isClicked) {
            style += `background: rgba(0, 243, 255, 0.2); border-color: var(--cyan); color: var(--cyan); box-shadow: 0 0 12px rgba(0, 243, 255, 0.25);`;
          } else if (pathIdx !== -1) {
            style += `border-color: rgba(176, 38, 255, 0.3); color: var(--purple); background: rgba(176, 38, 255, 0.05);`;
          }
          if (isHintNode) {
            style += `border: 2px solid #00ff88; box-shadow: 0 0 15px #00ff88; color: #00ff88; background: rgba(0, 255, 136, 0.1);`;
          }
        }

        cellsHtml += `
          <button class="zip-cell-btn" data-r="${r}" data-c="${c}" style="${style}">
            ${label}
          </button>
        `;
      }
    }

    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1rem; color: var(--cyan); font-weight: 700; font-family: var(--font-sans);">CodeZip Node Pipelines</h3>
          <p style="margin: 4px 0; font-size: 0.72rem; color: #a0a5c0; line-height: 1.4; font-family: var(--font-sans);">
            Objective: Click digital nodes sequentially <b>(N-1 ➔ N-2 ➔ N-3 ➔ N-4 ➔ N-5 ➔ N-6)</b> without intersecting or breaking adjacent paths.
          </p>
        </div>

        ${isZipSolved 
          ? `
            <div style="padding: 12px; background: rgba(0, 255, 136, 0.1); border: 1px dashed rgba(0, 255, 136, 0.25); border-radius: 8px; text-align: center; margin-bottom: 12px; max-width: 400px; width: 100%;">
              <span style="color: var(--success); font-weight: bold; font-size: 0.82rem; display: block;">✓ PIPELINE LOCKED & COMPILED SUCCESSFUL</span>
              <span style="color: #a0a5c0; font-size: 0.72rem; margin-top: 4px; display: block;">Today's seed solved. +25 Sparks reward claimed. Secure next lock tomorrow!</span>
            </div>
            `
          : `
            <!-- Drawing Board Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 16px;">
              ${cellsHtml}
            </div>

            <!-- Feedback Label & Controls -->
            <div id="zip-feedback" style="min-height: 20px; font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); text-align: center; margin-bottom: 12px;">
              ${zipClicks.length > 0 
                ? `Trace Path: ${zipClicks.map((coord, i) => `<span style="color: var(--cyan); font-weight: bold;">N-${config.codeZip.findIndex(it => it.r === coord.r && it.c === coord.c) + 1}</span>`).join(' ➔ ')}`
                : 'Pipeline status: Offline. Click N-1 to establish trace link.'
              }
            </div>

            <div id="game-action-btn-line" style="display: flex; gap: 10px; width: 100%; justify-content: center;">
              <button id="zip-hint-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--success); color: var(--success); background: transparent; cursor: pointer; font-weight: bold;">
                💡 Request System Hint
              </button>
              <button id="zip-reset-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--purple); color: var(--purple); background: transparent; cursor: pointer; font-weight: bold;">
                🔄 Reset Path
              </button>
            </div>
          `
        }
      </div>
    `;
  }

  function renderLogicSudoku() {
    let cellsHtml = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const isFixed = config.sudoku.fixed[r][c];
        const val = sudokuGrid[r][c];
        const dispVal = val === 0 ? '?' : val;

        const isHint = (sudokuHintCell && sudokuHintCell.r === r && sudokuHintCell.c === c);

        let style = `
          width: 58px; height: 58px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
          font-family: var(--font-code); font-size: 1rem; font-weight: bold; cursor: pointer;
          display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.2s;
        `;

        if (isFixed) {
          style += `background: rgba(0, 243, 255, 0.05); border-color: rgba(0, 243, 255, 0.15); color: var(--cyan);`;
        } else {
          style += `background: rgba(0,0,0,0.45); color: var(--text-main);`;
        }

        if (isSudokuSolved) {
          style += `background: rgba(0, 255, 136, 0.1); border-color: var(--success); color: var(--success); cursor: not-allowed;`;
        } else if (isHint) {
          style += `border: 2px solid #00ff88; box-shadow: 0 0 15px #00ff88; color: #00ff88; background: rgba(0, 255, 136, 0.1);`;
        }

        cellsHtml += `
          <button class="sudoku-cell-btn" data-r="${r}" data-c="${c}" ${isFixed || isSudokuSolved ? 'disabled' : ''} style="${style}">
            <span style="font-size: 1.1rem;">${dispVal}</span>
            ${isFixed ? '<span style="font-size: 0.5rem; position: absolute; bottom: 2px; color: var(--cyan); opacity: 0.6;">🔒</span>' : ''}
          </button>
        `;
      }
    }

    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1rem; color: var(--purple); font-weight: 700; font-family: var(--font-sans);">LogicSudoku Matrix Validator</h3>
          <p style="margin: 4px 0; font-size: 0.72rem; color: #a0a5c0; line-height: 1.4; font-family: var(--font-sans);">
            Objective: Complete the developer grid. Digits <b>1 to 4</b> must appear exactly once inside every horizontal row and vertical column! Click to cycle values.
          </p>
        </div>

        ${isSudokuSolved
          ? `
            <div style="padding: 12px; background: rgba(0, 255, 136, 0.1); border: 1px dashed rgba(0, 255, 136, 0.25); border-radius: 8px; text-align: center; margin-bottom: 12px; max-width: 400px; width: 100%;">
              <span style="color: var(--success); font-weight: bold; font-size: 0.82rem; display: block;">✓ GRID SOLVED & STABLE</span>
              <span style="color: #a0a5c0; font-size: 0.72rem; margin-top: 4px; display: block;">Matrix validation successful. +25 Sparks saved successfully inside localStorage.</span>
            </div>
            `
          : `
            <!-- Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 16px;">
              ${cellsHtml}
            </div>

            <!-- Validation Feedback -->
            <div id="sudoku-feedback" style="min-height: 20px; font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); text-align: center; margin-bottom: 12px;">
              Matrix state: Pending verification.
            </div>

            <div id="game-value-buttons" style="display: flex; gap: 10px; width: 100%; justify-content: center;">
              <button id="sudoku-validate-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--cyan); color: var(--cyan); background: transparent; cursor: pointer; font-weight: bold;">
                🛡️ Validate Matrix
              </button>
              <button id="sudoku-hint-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--success); color: var(--success); background: transparent; cursor: pointer; font-weight: bold;">
                💡 Request System Hint
              </button>
              <button id="sudoku-reset-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--purple); color: var(--purple); background: transparent; cursor: pointer; font-weight: bold;">
                🔄 Clear Custom Cells
              </button>
            </div>
          `
        }
      </div>
    `;
  }

  function renderWordLink() {
    let tilesHtml = '';
    wordLinkTiles.forEach((tile, index) => {
      const isUsed = wordLinkUsedTiles.includes(index);
      const isHint = (wordLinkHintIdx === index);

      let style = `
        padding: 12px 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
        font-family: var(--font-code); font-size: 1.1rem; font-weight: bold; cursor: pointer;
        background: rgba(0,0,0,0.45); color: var(--text-main); transition: all 0.2s;
        text-align: center; min-width: 44px;
      `;

      if (isWordSolved) {
        style += `background: rgba(0, 255, 136, 0.1); border-color: var(--success); color: var(--success); cursor: not-allowed;`;
      } else if (isUsed) {
        style += `opacity: 0.35; cursor: not-allowed; border-style: dashed; background: transparent; color: var(--text-muted);`;
      } else if (isHint) {
        style += `border: 2px solid #00ff88; box-shadow: 0 0 15px #00ff88; color: #00ff88; background: rgba(0, 255, 136, 0.1);`;
      }

      tilesHtml += `
        <button class="wordlink-tile-btn" data-idx="${index}" ${isUsed || isWordSolved ? 'disabled' : ''} style="${style}">
          ${tile.char}
        </button>
      `;
    });

    const placeholdersHtml = wordLinkTarget.split('').map((char, i) => {
      const charToShow = i < wordLinkUsedTiles.length ? wordLinkTarget[i] : '_';
      return `<span style="font-size: 1.3rem; font-family: var(--font-code); font-weight: bold; width: 30px; border-bottom: 2px solid ${i < wordLinkUsedTiles.length ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}; display: inline-block; text-align: center; padding-bottom: 4px; color: ${i < wordLinkUsedTiles.length ? 'var(--cyan)' : 'var(--text-muted)'}; text-shadow: ${i < wordLinkUsedTiles.length ? '0 0 8px rgba(0,243,255,0.4)' : 'none'};">${charToShow}</span>`;
    }).join(' ');

    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h3 style="margin: 0; font-size: 1rem; color: var(--cyan); font-weight: 700; font-family: var(--font-sans);">WordLink Syntax Keyword Spell</h3>
          <p style="margin: 4px 0; font-size: 0.72rem; color: #a0a5c0; line-height: 1.4; font-family: var(--font-sans);">
            Objective: Click characters sequentially to spell today's target coding keyword. Avoid syntax errors!
          </p>
        </div>

        ${isWordSolved 
          ? `
            <div style="padding: 12px; background: rgba(0, 255, 136, 0.1); border: 1px dashed rgba(0, 255, 136, 0.25); border-radius: 8px; text-align: center; margin-bottom: 12px; max-width: 400px; width: 100%;">
              <span style="color: var(--success); font-weight: bold; font-size: 0.82rem; display: block;">✓ KEYWORD LOCKED: "${wordLinkTarget}"</span>
              <span style="color: #a0a5c0; font-size: 0.72rem; margin-top: 4px; display: block;">Syntax compiled compiled successfully. +25 Sparks saved dynamically.</span>
            </div>
            `
          : `
            <!-- Word Placeholders -->
            <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; min-height: 38px;">
              ${placeholdersHtml}
            </div>

            <!-- Tiles Rows -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 12px; border: 1px solid rgba(255,255,255,0.04); background: rgba(0,0,0,0.25); border-radius: 12px; margin-bottom: 16px; max-width: 450px;">
              ${tilesHtml}
            </div>

            <!-- Feedback -->
            <div id="wordlink-feedback" style="min-height: 20px; font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); text-align: center; margin-bottom: 12px;">
              Spelled keyword length: ${wordLinkUsedTiles.length}/${wordLinkTarget.length} characters.
            </div>

            <div id="wordlink-buttons" style="display: flex; gap: 10px; width: 100%; justify-content: center;">
              <button id="wordlink-hint-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--success); color: var(--success); background: transparent; cursor: pointer; font-weight: bold;">
                💡 Request System Hint
              </button>
              <button id="wordlink-reset-btn" class="btn-neon" style="padding: 6px 14px; font-size: 0.72rem; border-color: var(--purple); color: var(--purple); background: transparent; cursor: pointer; font-weight: bold;">
                🔄 Clear Sequence
              </button>
            </div>
          `
        }
      </div>
    `;
  }

  function renderGameContent() {
    if (currentTab === 'codezip') {
      return renderCodeZip();
    } else if (currentTab === 'logicsudoku') {
      return renderLogicSudoku();
    } else if (currentTab === 'wordlink') {
      return renderWordLink();
    }
    return '';
  }

  function bindZipEvents() {
    const hintBtn = card.querySelector('#zip-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        const nextIdx = zipClicks.length;
        if (nextIdx >= 0 && nextIdx < 6) {
          zipHintNodeIdx = nextIdx;
          render();
          const fb = card.querySelector('#zip-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: var(--success); font-weight: bold;">💡 Hint activated: Click N-${nextIdx + 1} highlighted in sparkling green pulsing!</span>`;
          }
        }
      });
    }

    const resetBtn = card.querySelector('#zip-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        zipClicks = [];
        zipHintNodeIdx = -1;
        render();
      });
    }

    const cellBtns = card.querySelectorAll('.zip-cell-btn');
    cellBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        if (isZipSolved) return;
        const r = parseInt(this.getAttribute('data-r'));
        const c = parseInt(this.getAttribute('data-c'));

        const pathIdx = config.codeZip.findIndex(coord => coord.r === r && coord.c === c);
        const k = zipClicks.length;

        let isCorrect = false;
        if (pathIdx === k) {
          if (k === 0) {
            isCorrect = true;
          } else {
            const lastCoord = zipClicks[k - 1];
            const dist = Math.abs(r - lastCoord.r) + Math.abs(c - lastCoord.c);
            if (dist === 1) {
              isCorrect = true;
            }
          }
        }

        if (isCorrect) {
          zipClicks.push({ r, c });
          zipHintNodeIdx = -1;

          if (zipClicks.length === 6) {
            localStorage.setItem(`brain_arena_solved_codezip_${todayStr}`, 'true');
            adjustSkillSparks(25, 'CodeZip Daily Completion', btn);
            checkInToday();
            try {
              confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
            } catch (e) {}
            showMentorMessage("🚀 Perfect path established! Pipeline secure. +25 Sparks earned!", 5000);
          }
          render();
        } else {
          zipClicks = [];
          zipHintNodeIdx = -1;
          render();
          const fb = card.querySelector('#zip-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: #ff3366; font-weight: bold;">ERR_TRACE: Link disrupted. Adjacent coordinate break. Trace cleared. Restart from N-1.</span>`;
          }
        }
      });
    });
  }

  function bindSudokuEvents() {
    const cells = card.querySelectorAll('.sudoku-cell-btn');
    cells.forEach(btn => {
      btn.addEventListener('click', function() {
        if (isSudokuSolved) return;
        const r = parseInt(this.getAttribute('data-r'));
        const c = parseInt(this.getAttribute('data-c'));
        sudokuGrid[r][c] = (sudokuGrid[r][c] + 1) % 5;
        sudokuHintCell = null;
        render();
      });
    });

    const resetBtn = card.querySelector('#sudoku-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (!config.sudoku.fixed[r][c]) {
              sudokuGrid[r][c] = 0;
            }
          }
        }
        sudokuHintCell = null;
        render();
      });
    }

    const hintBtn = card.querySelector('#sudoku-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        let foundCell = null;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (!config.sudoku.fixed[r][c] && sudokuGrid[r][c] !== config.sudoku.grid[r][c]) {
              foundCell = { r, c };
              break;
            }
          }
          if (foundCell) break;
        }

        if (foundCell) {
          sudokuHintCell = foundCell;
          sudokuGrid[foundCell.r][foundCell.c] = config.sudoku.grid[foundCell.r][foundCell.c];
          render();
          const fb = card.querySelector('#sudoku-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: var(--success); font-weight: bold;">💡 Hint activated: Temp-prefilled Cell Row ${foundCell.r + 1}, Col ${foundCell.c + 1} with correct digital value!</span>`;
          }
        } else {
          const fb = card.querySelector('#sudoku-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: var(--success); font-weight: bold;">All custom cell entries appear digitally accurate! Click Validate Matrix to finish.</span>`;
          }
        }
      });
    }

    const validateBtn = card.querySelector('#sudoku-validate-btn');
    if (validateBtn) {
      validateBtn.addEventListener('click', function() {
        let matches = true;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (sudokuGrid[r][c] !== config.sudoku.grid[r][c]) {
              matches = false;
              break;
            }
          }
        }

        if (matches) {
          localStorage.setItem(`brain_arena_solved_logicsudoku_${todayStr}`, 'true');
          adjustSkillSparks(25, 'LogicSudoku Daily Completion', validateBtn);
          checkInToday();
          try {
            confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
          } catch (e) {}
          showMentorMessage("🧩 Matrix stable! Sudoku logic fully validated. +25 Sparks reward compiled!", 5000);
          render();
        } else {
          const fb = card.querySelector('#sudoku-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: #ff3366; font-weight: bold;">LOGIC_ERR: Validation conflict. Row or column duplicate/mismatch detected. Audit your matrix path.</span>`;
          }
        }
      });
    }
  }

  function bindWordLinkEvents() {
    const tilesBtns = card.querySelectorAll('.wordlink-tile-btn');
    tilesBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        if (isWordSolved) return;
        const index = parseInt(this.getAttribute('data-idx'));
        const tile = wordLinkTiles[index];
        const currentLength = wordLinkUsedTiles.length;
        const expectedChar = wordLinkTarget[currentLength];

        if (tile.char === expectedChar) {
          wordLinkUsedTiles.push(index);
          wordLinkHintIdx = -1;

          if (wordLinkUsedTiles.length === wordLinkTarget.length) {
            localStorage.setItem(`brain_arena_solved_wordlink_${todayStr}`, 'true');
            adjustSkillSparks(25, 'WordLink Daily Completion', btn);
            checkInToday();
            try {
              confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
            } catch (e) {}
            showMentorMessage(`🎉 WordLink locked! Syntax keyword "${wordLinkTarget}" recognized. +25 Sparks reward!`, 5000);
          }
          render();
        } else {
          wordLinkUsedTiles = [];
          wordLinkHintIdx = -1;
          render();
          const fb = card.querySelector('#wordlink-feedback');
          if (fb) {
            fb.innerHTML = `<span style="color: #ff3366; font-weight: bold;">SYNTAX_ERROR: Unexpected character token at index ${currentLength}. Keyboard buffer flushed. Restart.</span>`;
          }
        }
      });
    });

    const resetBtn = card.querySelector('#wordlink-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        wordLinkUsedTiles = [];
        wordLinkHintIdx = -1;
        render();
      });
    }

    const hintBtn = card.querySelector('#wordlink-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        const nextCorrectIdx = wordLinkUsedTiles.length;
        if (nextCorrectIdx >= 0 && nextCorrectIdx < wordLinkTarget.length) {
          const expectedChar = wordLinkTarget[nextCorrectIdx];
          
          let foundTileIdx = -1;
          for (let i = 0; i < wordLinkTiles.length; i++) {
            if (wordLinkTiles[i].char === expectedChar && !wordLinkUsedTiles.includes(i)) {
              foundTileIdx = i;
              break;
            }
          }

          if (foundTileIdx !== -1) {
            wordLinkHintIdx = foundTileIdx;
            render();
            const fb = card.querySelector('#wordlink-feedback');
            if (fb) {
              fb.innerHTML = `<span style="color: var(--success); font-weight: bold;">💡 Hint activated: Locate and click the pulsed character tile "${expectedChar}" highlighted in sparkling green.</span>`;
            }
          }
        }
      });
    }
  }

  function bindSubgameEvents() {
    if (currentTab === 'codezip') {
      bindZipEvents();
    } else if (currentTab === 'logicsudoku') {
      bindSudokuEvents();
    } else if (currentTab === 'wordlink') {
      bindWordLinkEvents();
    }
  }

  function render() {
    isZipSolved = localStorage.getItem(`brain_arena_solved_codezip_${todayStr}`) === 'true';
    isSudokuSolved = localStorage.getItem(`brain_arena_solved_logicsudoku_${todayStr}`) === 'true';
    isWordSolved = localStorage.getItem(`brain_arena_solved_wordlink_${todayStr}`) === 'true';

    // Update pulse badge and statuses live on the page if they exist
    const updateHeaderBadge = () => {
      const badge = document.getElementById('brain-arena-pulse-badge');
      if (badge) {
        const allSolvedNow = isZipSolved && isSudokuSolved && isWordSolved;
        badge.style.color = allSolvedNow ? 'var(--success)' : 'var(--cyan)';
        badge.style.background = allSolvedNow ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 243, 255, 0.1)';
        badge.style.borderColor = allSolvedNow ? 'rgba(0, 255, 136, 0.25)' : 'rgba(0, 243, 255, 0.25)';
        badge.innerHTML = `
          <span style="display: inline-block; width: 6px; height: 6px; background-color: ${allSolvedNow ? 'var(--success)' : 'var(--cyan)'}; border-radius: 50%; box-shadow: 0 0 8px ${allSolvedNow ? 'var(--success)' : 'var(--cyan)'};"></span>
          ${allSolvedNow ? 'All Puzzles Solved today! ✓' : 'New Puzzles Available Today!'}
        `;
        if (allSolvedNow) {
          badge.style.animation = 'none';
        } else {
          badge.style.animation = 'brainPulse 2.5s infinite';
        }
      }
      
      const zipLbl = document.getElementById('dash-status-codezip');
      if (zipLbl) zipLbl.innerHTML = isZipSolved ? '<span style="color: var(--success); font-weight: bold;">✓ Solved</span>' : '<span style="color: #ff9f43; font-weight: bold;">Pending</span>';
      
      const sudokuLbl = document.getElementById('dash-status-logicsudoku');
      if (sudokuLbl) sudokuLbl.innerHTML = isSudokuSolved ? '<span style="color: var(--success); font-weight: bold;">✓ Solved</span>' : '<span style="color: #ff9f43; font-weight: bold;">Pending</span>';
      
      const wordLbl = document.getElementById('dash-status-wordlink');
      if (wordLbl) wordLbl.innerHTML = isWordSolved ? '<span style="color: var(--success); font-weight: bold;">✓ Solved</span>' : '<span style="color: #ff9f43; font-weight: bold;">Pending</span>';
    };
    updateHeaderBadge();

    card.innerHTML = `
      <button id="close-workout-btn" style="position: absolute; top: 16px; right: 20px; background: transparent; border: none; color: var(--text-muted); font-size: 1.8rem; cursor: pointer; transition: color 0.2s; z-index: 10;" onmouseover="this.style.color='var(--cyan)'" onmouseout="this.style.color='var(--text-muted)'">&times;</button>
      
      <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(0, 243, 255, 0.15); padding-bottom: 12px; padding-right: 32px;">
        <h2 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--cyan); text-shadow: 0 0 10px rgba(0,243,255,0.4); font-family: var(--font-sans); display: flex; align-items: center; gap: 8px;">
          <span>🚀 COGNITIVE ARENA CORE</span>
        </h2>
        <p style="margin: 6px 0 0 0; font-size: 0.75rem; color: #a0a5c0; font-family: var(--font-sans); font-weight: 500;">
          Today's Target Challenges • Status: <span style="font-family: var(--font-mono); font-size: 0.72rem; background: rgba(10,10,15,0.6); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(176,38,255,0.25);">CodeZip: ${renderStatusBadge(isZipSolved)} | LogicSudoku: ${renderStatusBadge(isSudokuSolved)} | WordLink: ${renderStatusBadge(isWordSolved)}</span>
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 20px;">
        <button id="tab-codezip" style="padding: 10px 4px; font-size: 0.7rem; font-weight: bold; border-radius: 8px; font-family: var(--font-mono); cursor: pointer; border: 1px solid ${currentTab === 'codezip' ? 'var(--cyan)' : 'transparent'}; background: ${currentTab === 'codezip' ? 'rgba(0, 243, 255, 0.12)' : 'rgba(0,0,0,0.25)'}; color: ${currentTab === 'codezip' ? 'var(--cyan)' : 'var(--text-muted)'}; text-shadow: ${currentTab === 'codezip' ? '0 0 8px rgba(0,243,255,0.4)' : 'none'}; transition: all 0.2s;">
          1. CODEZIP ${isZipSolved ? '✓' : ''}
        </button>
        <button id="tab-logicsudoku" style="padding: 10px 4px; font-size: 0.7rem; font-weight: bold; border-radius: 8px; font-family: var(--font-mono); cursor: pointer; border: 1px solid ${currentTab === 'logicsudoku' ? 'var(--purple)' : 'transparent'}; background: ${currentTab === 'logicsudoku' ? 'rgba(176, 38, 255, 0.12)' : 'rgba(0,0,0,0.25)'}; color: ${currentTab === 'logicsudoku' ? 'var(--purple)' : 'var(--text-muted)'}; text-shadow: ${currentTab === 'logicsudoku' ? '0 0 8px rgba(176,38,255,0.4)' : 'none'}; transition: all 0.2s;">
          2. SUDOKU ${isSudokuSolved ? '✓' : ''}
        </button>
        <button id="tab-wordlink" style="padding: 10px 4px; font-size: 0.7rem; font-weight: bold; border-radius: 8px; font-family: var(--font-mono); cursor: pointer; border: 1px solid ${currentTab === 'wordlink' ? 'var(--cyan)' : 'transparent'}; background: ${currentTab === 'wordlink' ? 'rgba(0, 243, 255, 0.12)' : 'rgba(0,0,0,0.25)'}; color: ${currentTab === 'wordlink' ? 'var(--cyan)' : 'var(--text-muted)'}; text-shadow: ${currentTab === 'wordlink' ? '0 0 8px rgba(0,243,255,0.4)' : 'none'}; transition: all 0.2s;">
          3. WORDLINK ${isWordSolved ? '✓' : ''}
        </button>
      </div>

      <div id="arena-game-body" style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.04); padding: 16px; border-radius: 12px; min-height: 280px; display: flex; flex-direction: column; justify-content: center;">
        ${renderGameContent()}
      </div>
    `;

    const closeBtn = card.querySelector('#close-workout-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    card.querySelector('#tab-codezip').addEventListener('click', () => { currentTab = 'codezip'; zipHintNodeIdx = -1; render(); });
    card.querySelector('#tab-logicsudoku').addEventListener('click', () => { currentTab = 'logicsudoku'; sudokuHintCell = null; render(); });
    card.querySelector('#tab-wordlink').addEventListener('click', () => { currentTab = 'wordlink'; wordLinkHintIdx = -1; render(); });

    bindSubgameEvents();
  }

  render();
}
