import { getCurrentUser, saveUser, adjustSkillSparks } from '../auth.js';

// Define the 5 daily rotating challenge types
export const CHALLENGES = [
  {
    id: 'connections',
    name: 'Connections',
    icon: '🔀',
    description: 'Find the unifying programmatic category for the given concepts.'
  },
  {
    id: 'sudoku',
    name: 'Logic Sudoku',
    icon: '🔢',
    description: 'Fill the blank cell in a 3x3 logic grid without repeats.'
  },
  {
    id: 'nqueens',
    name: 'N-Queens Placement',
    icon: '👑',
    description: 'Place 4 Queens on a 4x4 chessboard so they do not attack each other.'
  },
  {
    id: 'pattern',
    name: 'Pattern Match',
    icon: '🎯',
    description: 'Solve the progression sequence of loop indices or arithmetic values.'
  },
  {
    id: 'memory',
    name: 'Code Memory',
    icon: '💾',
    description: 'Memorize a snippet of code, wait for it to hide, and recall the missing term.'
  }
];

// Seeded daily selection: Select 3 unique challenges based on today's calendar date
export function getActiveChallengesForToday() {
  const day = new Date().getDate(); // 1 to 31
  const list = [];
  for (let i = 0; i < 3; i++) {
    const index = (day + i) % CHALLENGES.length;
    list.push(CHALLENGES[index]);
  }
  return list;
}

// Get the completion state for a given challenge ID today
export function isChallengeCompletedToday(challengeId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  const todayStr = new Date().toDateString();
  if (!user.dailyChallengesCompleted) return false;
  
  const completedToday = user.dailyChallengesCompleted[todayStr] || [];
  return completedToday.includes(challengeId);
}

// Mark a challenge as completed today and award Sparks if not already rewarded
export function completeChallengeToday(challengeId, elementForFloatingText = null) {
  const user = getCurrentUser();
  if (!user) return { success: false, msg: "User not logged in" };

  const todayStr = new Date().toDateString();
  
  if (!user.dailyChallengesCompleted) {
    user.dailyChallengesCompleted = {};
  }
  if (!user.dailyChallengesCompleted[todayStr]) {
    user.dailyChallengesCompleted[todayStr] = [];
  }

  const completedToday = user.dailyChallengesCompleted[todayStr];
  
  if (completedToday.includes(challengeId)) {
    // Already completed today: Allow replay but no duplicate rewards
    return { success: true, alreadyClaimed: true, msg: "Nice play! Replay finished for practice." };
  }

  // Save completion state
  completedToday.push(challengeId);
  user.dailyChallengesCompleted[todayStr] = completedToday;
  saveUser(user);

  // Award +10 Sparks!
  adjustSkillSparks(10, 'Daily challenge ' + challengeId + ' completion', elementForFloatingText);

  // Array of feedback messages as requested: "Great thinking.", "Brain challenge complete.", "Nice work. Sparks earned."
  const messages = [
    "Great thinking.",
    "Brain challenge complete.",
    "Nice work. Sparks earned."
  ];
  const randomFeedback = messages[Math.floor(Math.random() * messages.length)];

  return { success: true, alreadyClaimed: false, msg: randomFeedback };
}

// Generate the specific puzzle content for today
export function getPuzzleData(challengeId) {
  const day = new Date().getDate();
  const index = day % 3;

  switch (challengeId) {
    case 'connections':
      const connData = [
        {
          terms: ["LIFO", "Push", "Pop", "Call Stack"],
          options: ["Queue Structure", "Linked List", "Stack Structure", "Binary Tree"],
          answerIndex: 2,
          explanation: "Stack uses the Last-In, First-Out (LIFO) protocol where elements are entered via Push and accessed/purged via Pop. The Call Stack manages function scopes similarly."
        },
        {
          terms: ["Mutable", "Unordered", "Key-Value Pairs", "Hash Map"],
          options: ["Array", "Tuple", "Linked List", "Dictionary / Object"],
          answerIndex: 3,
          explanation: "Dictionaries/Objects map unique keys directly to values, are structurally unordered, and are fully mutable in Python and JavaScript!"
        },
        {
          terms: ["Continuous Memory", "O(1) Access Time", "Fixed Size in C", "Offset Indexing"],
          options: ["Linked List", "Stack", "Array", "Graph Network"],
          answerIndex: 2,
          explanation: "Arrays represent a continuous segment of RAM where elements are mapped with a direct numerical index, allowing instantaneous O(1) read/write operations."
        }
      ];
      return connData[index];

    case 'sudoku':
      const sudData = [
        {
          grid: [
            ["1", "2", "3"],
            ["3", "?", "1"],
            ["2", "3", "2"] // Display mock
          ],
          visualRows: [
            [1, 2, 3],
            [3, "?", 1],
            [2, 3, 2]
          ],
          correctDigit: "2",
          options: ["1", "2", "3"],
          explanation: "In column 2 (middle), we have 2 and 3. In row 2, we have 3 and 1. The blank cell '?' requires the number 2 to satisfy the 3x3 diagonal and constraint values with no duplicate values across the row/column."
        },
        {
          grid: [
            ["2", "3", "1"],
            ["1", "?", "3"],
            ["3", "1", "2"]
          ],
          visualRows: [
            [2, 3, 1],
            [1, "?", 3],
            [3, 1, 2]
          ],
          correctDigit: "2",
          options: ["1", "2", "3"],
          explanation: "Placing number 2 completes the middle row [1, 2, 3] and column 2 [3, 2, 1] flawlessly with no duplicates."
        },
        {
          grid: [
            ["?", "1", "2"],
            ["2", "3", "1"],
            ["1", "2", "3"]
          ],
          visualRows: [
            ["?", 1, 2],
            [2, 3, 1],
            [1, 2, 3]
          ],
          correctDigit: "3",
          options: ["1", "2", "3"],
          explanation: "Row 1 begins with ? followed by [1, 2]. Column 1 starts with ? followed by [2, 1]. Plucking 3 satisfies both constraints instantly!"
        }
      ];
      // Sanitize standard row structures
      return sudData[index];

    case 'pattern':
      const patData = [
        {
          codeSnippet: `// Python Sequence\nvalues = [2, 4, 8, 16]\n# Pattern: 2^1, 2^2, 2^3, 2^4\n# What is the next logical base-2 exponent term at index 4?`,
          options: ["24", "32", "64", "20"],
          answerIndex: 1, // 32
          explanation: "The values double exponentially on each step: 2, 4, 8, 16... The next term is 16 * 2 = 32."
        },
        {
          codeSnippet: `// Fibonacci Progression\nlet fib = [0, 1, 1, 2, 3, 5];\n// What represents the next summation element?`,
          options: ["6", "7", "8", "9"],
          answerIndex: 2, // 8
          explanation: "In Fibonacci, each next item is the sum of the previous two items. Here, 3 + 5 = 8."
        },
        {
          codeSnippet: `// Loop Progression\nint term = 1;\nfor(int i = 0; i < 4; i++) {\n    term = term * 3;\n}\n// Succession values: 1 -> 3 -> 9 -> 27 -> ?`,
          options: ["30", "54", "81", "90"],
          answerIndex: 2, // 81
          explanation: "The value multiplies by 3 on every loop sequence: 1 -> 3 -> 9 -> 27 -> 81 (27 * 3)."
        }
      ];
      return patData[index];

    case 'memory':
      const memData = [
        {
          codeSnippet: `function computeTotal(price) {\n  const taxRate = 0.08;\n  return price * (1 + taxRate);\n}`,
          obscuredSnippet: `function computeTotal(price) {\n  const taxRate = 0.08;\n  return price * (1 + ________);\n}`,
          question: "What term was defined at line 2 and multiplied at line 3?",
          options: ["price", "taxRate", "computeTotal", "0.08"],
          answerIndex: 1, // taxRate
          explanation: "The term is 'taxRate', representing the declared local constant floating multiplier of 0.08."
        },
        {
          codeSnippet: `class Superhero:\n    def __init__(self, alias):\n        self.alias = alias`,
          obscuredSnippet: `class Superhero:\n    def ________(self, alias):\n        self.alias = alias`,
          question: "Recall the proper constructor method name used to initialize Python class objects.",
          options: ["init", "__init__", "constructor", "self"],
          answerIndex: 1, // __init__
          explanation: "The method is '__init__', Python's native double-underscore constructor logic."
        },
        {
          codeSnippet: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Ready";\n}`,
          obscuredSnippet: `#include <iostream>\nusing ________ std;\nint main() {\n    cout << "Ready";\n}`,
          question: "What keyword is missing between 'using' and 'std' to map namespace definitions in C++?",
          options: ["namespace", "using", "std", "include"],
          answerIndex: 0, // namespace
          explanation: "The missing term is 'namespace', declaring standard library references in modern C++ formats."
        }
      ];
      return memData[index];

    case 'nqueens':
    default:
      // N-queens is dynamic and fully resolved via interactive grid placements
      return {
        boardSize: 4,
        targetQueens: 4,
        explanation: "To secure placement, make sure no two queens exist on the same row, column, or diagonal on this 4x4 matrix!"
      };
  }
}

// Render HTML layout of the Daily Challenges Panel
export function renderDailyChallenges() {
  const activeList = getActiveChallengesForToday();
  
  let html = `
    <!-- Daily Brain Challenges Section -->
    <div class="glass-panel daily-challenges-section" style="margin-top: -1.5rem; margin-bottom: 2rem; padding: 1.5rem; border-color: rgba(176, 38, 255, 0.35); position: relative; overflow: hidden; border-radius: 12px; background: linear-gradient(135deg, rgba(14, 11, 23, 0.7) 0%, rgba(20, 10, 30, 0.8) 100%);">
      <div style="position: absolute; top: -50px; right: -50px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(176, 38, 255, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
      
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(176, 38, 255, 0.2); padding-bottom: 8px; flex-wrap: wrap; gap: 10px;">
        <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--purple); text-shadow: 0 0 10px var(--purple-glow); font-family: var(--font-sans); display: flex; align-items: center; gap: 8px;">
          <span>🧠 Daily Brain Challenges</span>
        </h2>
        <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(176, 38, 255, 0.15); border: 1px solid rgba(176, 38, 255, 0.3); padding: 3px 8px; border-radius: 20px; font-weight: bold; font-family: var(--font-mono);">
          Refreshes Automatically
        </span>
      </div>
      
      <p style="margin: 0 0 1.25rem 0; font-size: 0.85rem; color: var(--text-main); font-family: var(--font-sans); opacity: 0.85;">
        Perform daily logical rotations to challenge your brain and earn exclusive <strong>Sparks (+10)</strong>. Replay for practice anytime!
      </p>

      <!-- Active Daily Challenges Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; width: 100%; box-sizing: border-box;">
        ${activeList.map(ch => {
          const completed = isChallengeCompletedToday(ch.id);
          return `
            <div class="glass-panel daily-challenge-card" id="dc-card-${ch.id}" 
                 style="background: rgba(0, 0, 0, 0.2); border-color: ${completed ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 255, 255, 0.08)'}; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; border-radius: 8px;">
              
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.4rem;">${ch.icon}</span>
                  <span style="font-size: 0.72rem; font-weight:bold; ${completed ? 'color: var(--success);' : 'color: var(--cyan);'}" id="dc-reward-badge-${ch.id}">
                    ${completed ? '✓ Claimed' : '+10 ✨ Sparks'}
                  </span>
                </div>
                
                <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main); font-family: var(--font-sans);">${ch.name}</h3>
                <p style="margin: 4px 0 0 0; font-size: 0.7rem; color: var(--text-muted); line-height: 1.35; font-family: var(--font-sans);">${ch.description}</p>
              </div>

              <!-- Action button or completion indicator -->
              <div style="margin-top: 1rem;" id="dc-action-area-${ch.id}">
                ${completed 
                  ? `
                    <div style="display:flex; flex-direction:column; gap: 6px;">
                      <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid var(--success); color: var(--success); font-weight: bold; text-align: center; padding: 5px; border-radius: 6px; font-size: 0.72rem;">
                        ✓ Completed Today
                      </div>
                      <button class="play-challenge-btn" data-id="${ch.id}" 
                              style="width: 100%; font-size: 0.7rem; padding: 4px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: var(--text-muted); border-radius: 4px; cursor: pointer; font-weight: bold;">
                        Practice Replay
                      </button>
                    </div>
                    ` 
                  : `
                    <button class="btn-neon play-challenge-btn" data-id="${ch.id}" 
                            style="width: 100%; font-size: 0.75rem; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                      Play Challenge
                    </button>
                    `
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Live Challenge Play Box Container (Displays when active) -->
      <div id="live-challenge-sandbox" style="display: none; margin-top: 1.5rem; padding: 1.25rem; background: rgba(14, 11, 23, 0.9); border: 1px solid var(--cyan); border-radius: 8px; box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);">
        <!-- Active content loaded dynamically -->
      </div>
    </div>
  `;
  return html;
}

// Attach event handlers to the daily challenges
export function mountDailyChallenges() {
  const btns = document.querySelectorAll('.play-challenge-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const challengeId = this.getAttribute('data-id');
      if (challengeId) {
        launchChallengeSandbox(challengeId);
      }
    });
  });
}

// Active challenge state inside sandbox
let memorySnippetShown = false;
let memoryTimerVal = 8;
let memoryTimerInterval = null;
let activeNQueensList = []; // tracks coordinates placed, e.g. {r: 0, c: 1}

// Launch the active mini gameplay sandbox inline
function launchChallengeSandbox(id) {
  const sandbox = document.getElementById('live-challenge-sandbox');
  if (!sandbox) return;

  const ch = CHALLENGES.find(c => c.id === id);
  if (!ch) return;

  const completed = isChallengeCompletedToday(id);
  const data = getPuzzleData(id);

  sandbox.style.display = 'block';
  sandbox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Clear timers if left over
  if (memoryTimerInterval) {
    clearInterval(memoryTimerInterval);
  }

  let gameplayHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px dashed rgba(255, 255, 255, 0.15); padding-bottom: 6px;">
      <h3 style="margin: 0; font-size: 1rem; color: var(--cyan); font-family: var(--font-sans); display: flex; align-items: center; gap: 6px;">
        <span>${ch.icon} Playing: ${ch.name}</span>
      </h3>
      <button id="close-sandbox-btn" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 0;" title="Close Sandbox">✕</button>
    </div>
  `;

  if (id === 'connections') {
    gameplayHtml += `
      <div style="font-family: var(--font-sans);">
        <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-main);">
          Group representation check: Examine these 4 programmatic keywords. Choose the correct unifying core concept:
        </p>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1rem; justify-content: center;">
          ${data.terms.map(t => `
            <span style="background: rgba(176, 38, 255, 0.15); border: 1px solid var(--purple); color: var(--text-main); font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; padding: 6px 12px; border-radius: 4px; box-shadow: 0 0 4px rgba(176,38,255,0.25);">
              ${t}
            </span>
          `).join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem;" id="conn-options-list">
          ${data.options.map((opt, idx) => `
            <button class="conn-option-btn" data-idx="${idx}" 
                    style="width: 100%; text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text-main); font-size: 0.82rem; font-weight: 500; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">
              ${idx + 1}. ${opt}
            </button>
          `).join('')}
        </div>

        <div id="sandbox-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-sans); margin-bottom: 0.5rem; line-height: 1.4;"></div>
      </div>
    `;
  } 
  else if (id === 'sudoku') {
    gameplayHtml += `
      <div style="font-family: var(--font-sans); display: flex; flex-direction: column; align-items: center;">
        <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-main); text-align: center; width: 100%;">
          Complete the 3x3 diagonal constraint sudoku. Avoid repeating values 1, 2, or 3 inside any row, column, or diagonal line! Click the <strong>?</strong> cell to toggle digits or select from multiple choices.
        </p>

        <!-- Sudoku interactive grid representation -->
        <div style="display: grid; grid-template-rows: repeat(3, 1fr); gap: 6px; width: 150px; height: 150px; margin-bottom: 1.25rem;">
          ${data.visualRows.map((row, rIdx) => `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 100%;">
              ${row.map((val, cIdx) => {
                if (val === '?') {
                  return `
                    <div id="sudoku-blank-cell" class="clickable-sudoku-cell"
                         style="background: rgba(0, 243, 255, 0.12); border: 1.5px dashed var(--cyan); color: var(--cyan); font-weight: 900; font-size: 1.1rem; display: flex; align-items:center; justify-content:center; border-radius: 6px; cursor: pointer; text-shadow: 0 0 4px var(--cyan-glow);"
                         title="Click to fill or select option below">
                      ?
                    </div>
                  `;
                } else {
                  return `
                    <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-size: 1rem; font-weight: bold; display: flex; align-items:center; justify-content:center; border-radius: 6px; user-select: none;">
                      ${val}
                    </div>
                  `;
                }
              }).join('')}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; width: 100%; margin-bottom: 1rem;">
          ${data.options.map(digit => `
            <button class="sudoku-digit-btn" data-digit="${digit}"
                    style="width: 44px; height: 44px; font-size: 1rem; font-weight: bold; color: var(--cyan); border: 1.5px solid var(--cyan); background: rgba(0, 243, 255, 0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
              ${digit}
            </button>
          `).join('')}
        </div>

        <div id="sandbox-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-sans); margin-bottom: 0.5rem; line-height: 1.4; width: 100%; box-sizing: border-box;"></div>
      </div>
    `;
  }
  else if (id === 'nqueens') {
    activeNQueensList = []; // Reset queen coordinates placement
    gameplayHtml += `
      <div style="font-family: var(--font-sans); display: flex; flex-direction: column; align-items: center;">
        <p style="margin: 0 0 0.75rem 0; font-size: 0.85rem; color: var(--text-main); text-align: center; width: 100%;">
          Place exactly <strong>4 Queens 👑</strong> on the 4x4 coordinate space. Guarantee that no two queens attack each other vertically, horizontally, or diagonally!
        </p>
        
        <div style="font-size: 0.75rem; color: var(--cyan); margin-bottom: 0.75rem; font-family: var(--font-mono);" id="nqueens-placed-counter">
          Queens Placed: 0 / 4
        </div>

        <!-- 4x4 Interactive Chessboard -->
        <div style="display: grid; grid-template-rows: repeat(4, 1fr); gap: 4px; width: 180px; height: 180px; margin-bottom: 1.25rem; border: 2px solid var(--purple); padding: 4px; border-radius: 8px; background: rgba(0,0,0,0.3);">
          ${[0, 1, 2, 3].map(r => `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; width: 100%;">
              ${[0, 1, 2, 3].map(c => {
                const isDark = (r + c) % 2 === 1;
                const cellBg = isDark ? 'rgba(176, 38, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
                return `
                  <button class="nqueens-grid-cell" data-row="${r}" data-col="${c}"
                          style="background: ${cellBg}; border: 1px solid rgba(176, 38, 255, 0.2); color: var(--text-main); font-size: 1.2rem; display: flex; align-items:center; justify-content:center; border-radius: 4px; cursor: pointer; transition: all 0.1s ease; outline: none; padding: 0; min-height: 38px;">
                  </button>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin-bottom: 1rem;">
          <button id="nqueens-verify-btn" class="btn-neon" style="font-size: 0.75rem; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Verify Placements
          </button>
          <button id="nqueens-reset-btn" style="font-size: 0.75rem; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: var(--text-muted); border-radius: 6px; cursor: pointer; font-weight: bold;">
            Clear Board
          </button>
        </div>

        <div id="sandbox-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-sans); margin-bottom: 0.5rem; line-height: 1.4; width: 100%; box-sizing: border-box;"></div>
      </div>
    `;
  }
  else if (id === 'pattern') {
    gameplayHtml += `
      <div style="font-family: var(--font-sans);">
        <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-main);">
          Progression sequencing: Examine the following code sequence blocks and select the matching next index result!
        </p>

        <pre style="background: var(--code-bg); color: var(--code-color); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.78rem; border-left: 3px solid var(--purple); margin: 0 0 1.25rem 0; overflow-x: auto; white-space: pre-wrap; line-height: 1.4;">${data.codeSnippet}</pre>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem;" id="pat-options-list">
          ${data.options.map((opt, idx) => `
            <button class="pat-option-btn" data-idx="${idx}" 
                    style="width: 100%; text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text-main); font-size: 0.82rem; font-weight: 500; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">
              ${idx + 1}. ${opt}
            </button>
          `).join('')}
        </div>

        <div id="sandbox-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-sans); margin-bottom: 0.5rem; line-height: 1.4;"></div>
      </div>
    `;
  }
  else if (id === 'memory') {
    memorySnippetShown = true;
    memoryTimerVal = 8;
    
    gameplayHtml += `
      <div style="font-family: var(--font-sans);">
        <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-main);" id="memory-instructions">
          Memorize this snippet of syntax before the timer hits 0. We will hide the code and block a portion!
        </p>

        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.2); padding: 8px; border-radius: 6px; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; color: var(--cyan);" id="memory-countdown-indicator">
          ⏱️ Memorization Timer: <span id="memory-timer-secs" style="font-size:1.1rem; font-weight:900;">${memoryTimerVal}</span>s
        </div>

        <!-- Code Snippet Box -->
        <pre id="memory-snippet-box" style="background: var(--code-bg); color: var(--code-color); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.78rem; border-left: 3px solid var(--cyan); margin: 0 0 1.25rem 0; overflow-x: auto; white-space: pre-wrap; line-height: 1.4;">${data.codeSnippet}</pre>

        <!-- Hidden Input Overlay Answers (Hidden initially) -->
        <div id="memory-obscured-quiz-section" style="display: none;">
          <p style="margin: 0 0 0.75rem 0; font-size: 0.82rem; font-weight: bold; color: var(--cyan); font-family: var(--font-sans);">
            ${data.question}
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem;" id="mem-options-list">
            ${data.options.map((opt, idx) => `
              <button class="mem-option-btn" data-idx="${idx}" 
                      style="width: 100%; text-align: left; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text-main); font-size: 0.82rem; font-weight: 500; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">
                ${idx + 1}. ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="sandbox-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 0.8rem; font-family: var(--font-sans); margin-bottom: 0.5rem; line-height: 1.4;"></div>
      </div>
    `;
  }

  sandbox.innerHTML = gameplayHtml;

  // Track binding close click
  document.getElementById('close-sandbox-btn').addEventListener('click', () => {
    sandbox.style.display = 'none';
    if (memoryTimerInterval) {
      clearInterval(memoryTimerInterval);
    }
  });

  // Track Specific Engine Handlers
  if (id === 'connections') {
    const optButtons = sandbox.querySelectorAll('.conn-option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const selIdx = parseInt(this.getAttribute('data-idx'));
        const feedbackDiv = document.getElementById('sandbox-feedback');
        
        // Remove active highlights
        optButtons.forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.1)';
          b.style.background = 'rgba(255,255,255,0.04)';
        });

        if (selIdx === data.answerIndex) {
          this.style.borderColor = 'var(--success)';
          this.style.background = 'rgba(0, 255, 136, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackDiv.style.border = '1px solid var(--success)';
          feedbackDiv.style.color = 'var(--success)';
          
          const claimResult = completeChallengeToday('connections', this);
          feedbackDiv.innerHTML = `<strong>Correct!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
          
          if (!claimResult.alreadyClaimed) {
            updateDashboardCompletedUI('connections');
          }
        } else {
          this.style.borderColor = '#ff3366';
          this.style.background = 'rgba(255, 51, 102, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackDiv.style.border = '1px solid #ff3366';
          feedbackDiv.style.color = '#ff3366';
          feedbackDiv.innerHTML = `<strong>Incorrect.</strong> Try analyzing the structural rules of stack queues again!`;
        }
      });
    });
  } 
  else if (id === 'sudoku') {
    const blankCell = document.getElementById('sudoku-blank-cell');
    const digitButtons = sandbox.querySelectorAll('.sudoku-digit-btn');
    let currentSelectedDigit = "?";

    const feedbackDiv = document.getElementById('sandbox-feedback');

    // Tap interactive cell or digit buttons to insert
    digitButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const digit = this.getAttribute('data-digit');
        currentSelectedDigit = digit;
        if (blankCell) {
          blankCell.innerText = digit;
          blankCell.style.borderStyle = 'solid';
        }

        // Verify instantly
        if (digit === data.correctDigit) {
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackDiv.style.border = '1px solid var(--success)';
          feedbackDiv.style.color = 'var(--success)';
          
          const claimResult = completeChallengeToday('sudoku', this);
          feedbackDiv.innerHTML = `<strong>Correct Grid!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
          
          if (!claimResult.alreadyClaimed) {
            updateDashboardCompletedUI('sudoku');
          }
        } else {
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackDiv.style.border = '1px solid #ff3366';
          feedbackDiv.style.color = '#ff3366';
          feedbackDiv.innerHTML = `<strong>Collision error!</strong> Placing '${digit}' introduces duplicate numbering values on the grid constraints. Try again!`;
        }
      });
    });

    if (blankCell) {
      blankCell.addEventListener('click', () => {
        // Simple cycler helper
        let val = parseInt(blankCell.innerText);
        if (isNaN(val)) val = 1;
        else val = (val % 3) + 1;
        
        blankCell.innerText = val;
        blankCell.style.borderStyle = 'solid';

        if (String(val) === data.correctDigit) {
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackDiv.style.border = '1px solid var(--success)';
          feedbackDiv.style.color = 'var(--success)';
          
          const claimResult = completeChallengeToday('sudoku', blankCell);
          feedbackDiv.innerHTML = `<strong>Correct Grid!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
          
          if (!claimResult.alreadyClaimed) {
            updateDashboardCompletedUI('sudoku');
          }
        } else {
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackDiv.style.border = '1px solid #ff3366';
          feedbackDiv.style.color = '#ff3366';
          feedbackDiv.innerHTML = `<strong>Collision error!</strong> Column/Row repeats detected for '${val}'. Adjust the selection!`;
        }
      });
    }
  }
  else if (id === 'nqueens') {
    const cells = sandbox.querySelectorAll('.nqueens-grid-cell');
    const counterDisp = document.getElementById('nqueens-placed-counter');
    const feedbackDiv = document.getElementById('sandbox-feedback');

    // Click handler to position queens
    cells.forEach(cell => {
      cell.addEventListener('click', function() {
        const r = parseInt(this.getAttribute('data-row'));
        const c = parseInt(this.getAttribute('data-col'));
        
        // Find if already placed there
        const existingIdx = activeNQueensList.findIndex(item => item.r === r && item.c === c);
        
        if (existingIdx !== -1) {
          // Remove Queen
          activeNQueensList.splice(existingIdx, 1);
          this.innerText = '';
          this.style.background = (r + c) % 2 === 1 ? 'rgba(176, 38, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
        } else {
          // Check max limit (4)
          if (activeNQueensList.length >= 4) {
            feedbackDiv.style.display = 'block';
            feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
            feedbackDiv.style.border = '1px solid #ff3366';
            feedbackDiv.style.color = '#ff3366';
            feedbackDiv.innerText = `You can place at most 4 queens on the board. Remove a queen to place this one!`;
            return;
          }

          // Add Queen
          activeNQueensList.push({r, c});
          this.innerText = '👑';
          this.style.background = 'rgba(0, 243, 255, 0.15)';
          feedbackDiv.style.display = 'none';
        }

        counterDisp.innerText = `Queens Placed: ${activeNQueensList.length} / 4`;
      });
    });

    // Clear board handler
    document.getElementById('nqueens-reset-btn').addEventListener('click', () => {
      activeNQueensList = [];
      cells.forEach(cell => {
        const r = parseInt(cell.getAttribute('data-row'));
        const c = parseInt(cell.getAttribute('data-col'));
        cell.innerText = '';
        cell.style.background = (r + c) % 2 === 1 ? 'rgba(176, 38, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
      });
      counterDisp.innerText = `Queens Placed: 0 / 4`;
      feedbackDiv.style.display = 'none';
    });

    // Verify placements hander
    document.getElementById('nqueens-verify-btn').addEventListener('click', (e) => {
      if (activeNQueensList.length !== 4) {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
        feedbackDiv.style.border = '1px solid #ff3366';
        feedbackDiv.style.color = '#ff3366';
        feedbackDiv.innerText = `Incomplete placement! You need exactly 4 Queens on the board (currently ${activeNQueensList.length}).`;
        return;
      }

      // Check collision algorithmically:
      // Since it's N-queens, check rows, cols, and diagonal offsets
      let attackDetected = false;
      let collisionMsg = "";

      for (let i = 0; i < activeNQueensList.length; i++) {
        for (let j = i + 1; j < activeNQueensList.length; j++) {
          const q1 = activeNQueensList[i];
          const q2 = activeNQueensList[j];

          if (q1.r === q2.r) {
            attackDetected = true;
            collisionMsg = `Collision found on Row ${q1.r + 1}! Queens at Column ${q1.c + 1} and Column ${q2.c + 1} are attacking each other.`;
            break;
          }
          if (q1.c === q2.c) {
            attackDetected = true;
            collisionMsg = `Collision found on Column ${q1.c + 1}! Queens at Row ${q1.r + 1} and Row ${q2.r + 1} are attacking each other.`;
            break;
          }
          if (Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c)) {
            attackDetected = true;
            collisionMsg = `Diagonal attack detected! Queen at [${q1.r + 1}, ${q1.c + 1}] and Queen at [${q2.r + 1}, ${q2.c + 1}] share an open diagonal line.`;
            break;
          }
        }
        if (attackDetected) break;
      }

      if (attackDetected) {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
        feedbackDiv.style.border = '1px solid #ff3366';
        feedbackDiv.style.color = '#ff3366';
        feedbackDiv.innerText = collisionMsg;
      } else {
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
        feedbackDiv.style.border = '1px solid var(--success)';
        feedbackDiv.style.color = 'var(--success)';
        
        const claimResult = completeChallengeToday('nqueens', e.target);
        feedbackDiv.innerHTML = `<strong>Magnificent Solution!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
        
        if (!claimResult.alreadyClaimed) {
          updateDashboardCompletedUI('nqueens');
        }
      }
    });
  }
  else if (id === 'pattern') {
    const optButtons = sandbox.querySelectorAll('.pat-option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const selIdx = parseInt(this.getAttribute('data-idx'));
        const feedbackDiv = document.getElementById('sandbox-feedback');
        
        // Remove active highlights
        optButtons.forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.1)';
          b.style.background = 'rgba(255,255,255,0.04)';
        });

        if (selIdx === data.answerIndex) {
          this.style.borderColor = 'var(--success)';
          this.style.background = 'rgba(0, 255, 136, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackDiv.style.border = '1px solid var(--success)';
          feedbackDiv.style.color = 'var(--success)';
          
          const claimResult = completeChallengeToday('pattern', this);
          feedbackDiv.innerHTML = `<strong>Correct!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
          
          if (!claimResult.alreadyClaimed) {
            updateDashboardCompletedUI('pattern');
          }
        } else {
          this.style.borderColor = '#ff3366';
          this.style.background = 'rgba(255, 51, 102, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackDiv.style.border = '1px solid #ff3366';
          feedbackDiv.style.color = '#ff3366';
          feedbackDiv.innerHTML = `<strong>Incorrect.</strong> Try calculating the loop multipliers or list sequence indices carefully!`;
        }
      });
    });
  }
  else if (id === 'memory') {
    const timerSecs = document.getElementById('memory-timer-secs');
    const snippetBox = document.getElementById('memory-snippet-box');
    const obscuredQuizSection = document.getElementById('memory-obscured-quiz-section');
    const countdownIndicator = document.getElementById('memory-countdown-indicator');
    const instrP = document.getElementById('memory-instructions');

    memoryTimerInterval = setInterval(() => {
      memoryTimerVal--;
      if (timerSecs) {
        timerSecs.innerText = memoryTimerVal;
      }

      if (memoryTimerVal <= 0) {
        clearInterval(memoryTimerInterval);
        
        // Hide/Obscure block
        if (snippetBox) {
          snippetBox.innerText = data.obscuredSnippet;
          snippetBox.style.borderColor = 'var(--purple)';
        }

        if (countdownIndicator) {
          countdownIndicator.style.display = 'none';
        }

        if (instrP) {
          instrP.innerText = "Recall challenge: The snippet is now obscured! Choose the missing variable/keyword that was present:";
        }

        if (obscuredQuizSection) {
          obscuredQuizSection.style.display = 'block';
        }
      }
    }, 1000);

    // Bind options
    const optButtons = sandbox.querySelectorAll('.mem-option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const selIdx = parseInt(this.getAttribute('data-idx'));
        const feedbackDiv = document.getElementById('sandbox-feedback');
        
        // Remove active highlights
        optButtons.forEach(b => {
          b.style.borderColor = 'rgba(255,255,255,0.1)';
          b.style.background = 'rgba(255,255,255,0.04)';
        });

        // Restore original full code snippet on click value for review
        if (snippetBox) {
          snippetBox.innerText = data.codeSnippet;
          snippetBox.style.borderColor = 'var(--success)';
        }

        if (selIdx === data.answerIndex) {
          this.style.borderColor = 'var(--success)';
          this.style.background = 'rgba(0, 255, 136, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackDiv.style.border = '1px solid var(--success)';
          feedbackDiv.style.color = 'var(--success)';
          
          const claimResult = completeChallengeToday('memory', this);
          feedbackDiv.innerHTML = `<strong>Perfect Recall!</strong> ${claimResult.msg}<br><span style="color:var(--text-main); opacity:0.85; margin-top:4px; display:inline-block;">${data.explanation}</span>`;
          
          if (!claimResult.alreadyClaimed) {
            updateDashboardCompletedUI('memory');
          }
        } else {
          this.style.borderColor = '#ff3366';
          this.style.background = 'rgba(255, 51, 102, 0.08)';

          feedbackDiv.style.display = 'block';
          feedbackDiv.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackDiv.style.border = '1px solid #ff3366';
          feedbackDiv.style.color = '#ff3366';
          feedbackDiv.innerHTML = `<strong>Inaccurate recollection.</strong> The actual syntax has been restored for review. Try again next time!`;
        }
      });
    });
  }
}

// Dynamically update the specific challenge card completed visual state in real-time
function updateDashboardCompletedUI(id) {
  const card = document.getElementById(`dc-card-${id}`);
  const area = document.getElementById(`dc-action-area-${id}`);
  const reward = document.getElementById(`dc-reward-badge-${id}`);

  if (card) {
    card.style.borderColor = 'rgba(0, 255, 136, 0.25)';
  }

  if (reward) {
    reward.innerText = '✓ Claimed';
    reward.style.color = 'var(--success)';
  }

  if (area) {
    area.innerHTML = `
      <div style="display:flex; flex-direction:column; gap: 6px;">
        <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid var(--success); color: var(--success); font-weight: bold; text-align: center; padding: 5px; border-radius: 6px; font-size: 0.72rem;">
          ✓ Completed Today
        </div>
        <button class="play-challenge-btn" data-id="${id}" 
                style="width: 100%; font-size: 0.7rem; padding: 4px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: var(--text-muted); border-radius: 4px; cursor: pointer; font-weight: bold;">
          Practice Replay
        </button>
      </div>
    `;

    // Rebind newly added replay button
    const replayBtn = area.querySelector('.play-challenge-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        launchChallengeSandbox(id);
      });
    }
  }
}
