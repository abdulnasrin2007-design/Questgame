import { getCourseData, getLevelData } from '../data/courses.js';
import { awardSkillSparks, markLevelCompleted, getCurrentUser, checkInToday, isCourseUnlocked, adjustSkillSparks, showFloatingSparksIndicator } from '../auth.js';
import { showMentorMessage } from '../components/Mentor.js';
import { showAchievementBadgeModal } from '../components/AchievementBadge.js';

const MOTIVATIONAL_PREFIXES = [
  "Almost there!",
  "Good try!",
  "Think carefully about this step.",
  "You're improving step by step!",
  "Keep coding! Every mistake makes you stronger.",
  "Nice effort! Take a quick breath and try again."
];

function getMotivationalPrefix() {
  const idx = Math.floor(Math.random() * MOTIVATIONAL_PREFIXES.length);
  return MOTIVATIONAL_PREFIXES[idx];
}

function getChallengeType(courseId, levelId) {
  const currentLvlNum = parseInt(levelId, 10);
  const lvl = getLevelData(courseId, currentLvlNum);
  if (!lvl) return 'quiz';
  
  if (lvl.isMatchingMilestone) {
    return 'matching';
  }
  
  const origId = lvl.originalId || lvl.id;
  
  if (courseId === 'javascript' && origId === 13) {
    return 'matching';
  }
  
  const modVal = origId % 5;
  if (modVal === 3) return 'arrange';        // Levels 3, 8, 13, 18
  if (modVal === 4) return 'bug-finding';    // Levels 4, 9, 14, 19
  if (modVal === 2) return 'prediction';     // Levels 2, 7, 12, 17
  
  return 'quiz';                             // Default/Level 1, 5, 6, 10, 11, 12, 14, 15... standard multiple choice
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getMatchingData(courseId, levelId) {
  const currentLvlNum = parseInt(levelId, 10);
  
  const datasets = {
    python: {
      5: [
        { concept: 'Variable', meaning: 'Stores dynamic value containers' },
        { concept: 'Loop', meaning: 'Repeats a block of code sequentially' },
        { concept: 'Function', meaning: 'Reusable blocks of statements' }
      ],
      10: [
        { concept: 'List', meaning: 'Index-ordered mutable linear list' },
        { concept: 'Tuple', meaning: 'Locked unchangeable sequence' },
        { concept: 'Dictionary', meaning: 'Mapped key-to-value matching' }
      ],
      15: [
        { concept: 'Set', meaning: 'Unique de-duplicated collection' },
        { concept: 'Exception', meaning: 'Handles code errors gracefully' },
        { concept: 'Class', meaning: 'Standard object-oriented blueprint' }
      ],
      20: [
        { concept: 'f-string', meaning: 'Formatted dynamic string injection' },
        { concept: 'import', meaning: 'Loads external helper libraries' },
        { concept: 'def', meaning: 'Declares custom reusable handles' }
      ]
    },
    javascript: {
      5: [
        { concept: 'let', meaning: 'Mutable block-scoped variable' },
        { concept: 'const', meaning: 'Immutable read-only variable' },
        { concept: '===', meaning: 'Checks strict equality of value and type' }
      ],
      10: [
        { concept: 'Array', meaning: 'Zero-indexed sequenced elements' },
        { concept: 'Object', meaning: 'Bundle of key-value item properties' },
        { concept: 'DOM', meaning: 'HTML elements interactive tree' }
      ],
      13: [
        { concept: 'fetch()', meaning: 'Gets remote API server payloads' },
        { concept: 'async/await', meaning: 'Synchronizes asynchronous promises' },
        { concept: 'localStorage', meaning: 'Saves states inside browser permanently' }
      ]
    },
    c: {
      5: [
        { concept: 'int', meaning: 'Declares signed decimal numbers' },
        { concept: 'printf()', meaning: 'Displays letters to standard output' },
        { concept: 'scanf()', meaning: 'Processes terminal entries into memory' }
      ],
      10: [
        { concept: 'for', meaning: 'Runs repeat loops with increment counts' },
        { concept: 'if / else', meaning: 'Branches script execution conditionally' },
        { concept: 'address &', meaning: 'Returns index coordinates in RAM' }
      ]
    },
    java: {
      5: [
        { concept: 'class', meaning: 'Blueprint of object definitions' },
        { concept: 'main()', meaning: 'Required entry point within JVM' },
        { concept: 'System.out.println', meaning: 'Prints lines of text results' }
      ],
      10: [
        { concept: 'int / boolean', meaning: 'Core basic primitive structures' },
        { concept: 'new', meaning: 'Stores class item objects on heap' },
        { concept: 'if (cond)', meaning: 'Executes choices with parentheses' }
      ]
    },
    cpp: {
      5: [
        { concept: 'std::cout', meaning: 'Standard terminal stream writer' },
        { concept: 'std::cin', meaning: 'Gathers raw human typing inputs' },
        { concept: 'std::vector', meaning: 'Sleek C++ dynamic sizing list' }
      ],
      10: [
        { concept: 'template', meaning: 'Generic datatype code structures' },
        { concept: 'pointer *', meaning: 'Holds target coordinate addresses' },
        { concept: 'class', meaning: 'Groups properties under standard blueprint' }
      ]
    }
  };
  
  if (datasets[courseId] && datasets[courseId][currentLvlNum]) {
    return datasets[courseId][currentLvlNum];
  }
  
  return [
    { concept: 'String', meaning: 'Enclosed text inside quotation marks' },
    { concept: 'Integer', meaning: 'Whole number values without decimals' },
    { concept: 'Boolean', meaning: 'True or false logical states' }
  ];
}

function renderChallengeBody(courseId, levelId, lvl) {
  const challengeType = getChallengeType(courseId, levelId);
  const currentLvlNum = parseInt(levelId, 10);
  
  if (challengeType === 'matching') {
    const pairs = lvl.pairs || getMatchingData(courseId, lvl.originalId || currentLvlNum);
    const shuffledConcepts = shuffleArray(pairs.map(p => p.concept));
    const shuffledMeanings = shuffleArray(pairs.map(p => p.meaning));
    
    return `
      <div class="matching-container" style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px; justify-content: space-between; width: 100%;">
        <!-- Left column: Concepts -->
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--cyan); letter-spacing: 1.5px; margin-bottom: 5px; opacity: 0.95; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 6px; height: 6px; background-color: var(--cyan); border-radius: 50%; box-shadow: 0 0 6px var(--cyan);"></span>
            Concepts
          </div>
          ${shuffledConcepts.map((concept, idx) => `
            <button class="match-btn-left quiz-option" 
                    data-concept="${concept}" 
                    style="width: 100%; transition: all 0.2s ease-in-out; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 14px 20px; min-height: 74px; box-sizing: border-box;">
              <span style="font-size: 0.95rem; font-weight: 700; word-break: break-word;">${concept}</span>
              <span class="match-status-badge" style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; font-family: var(--font-main); flex-shrink: 0; border: 1px solid var(--element-border); padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.15);">Unlinked</span>
            </button>
          `).join('')}
        </div>
        
        <!-- Right column: Meanings -->
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--purple); letter-spacing: 1.5px; margin-bottom: 5px; opacity: 0.95; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 6px; height: 6px; background-color: var(--purple); border-radius: 50%; box-shadow: 0 0 6px rgba(176, 38, 255, 0.8);"></span>
            Meanings
          </div>
          ${shuffledMeanings.map((meaning, idx) => `
            <button class="match-btn-right quiz-option" 
                    data-meaning="${meaning}" 
                    style="width: 100%; transition: all 0.2s ease-in-out; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 14px 20px; min-height: 74px; box-sizing: border-box;">
              <span style="font-size: 0.95rem; font-weight: 500; word-break: break-word;">${meaning}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div id="matching-feedback-bar" style="margin-top: 20px; padding: 12px; border-radius: 6px; background: rgba(0,0,0,0.2); border: 1px solid var(--element-border); font-weight: 600; text-align: center; font-size: 0.95rem; color: var(--cyan); display: none;"></div>
    `;
  }
  
  if (challengeType === 'arrange') {
    const originalLines = lvl.code.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'));
      
    window.currentArrangeCodeLines = shuffleArray(originalLines);
    while (window.currentArrangeCodeLines.length > 1 && JSON.stringify(window.currentArrangeCodeLines) === JSON.stringify(originalLines)) {
      window.currentArrangeCodeLines = shuffleArray(originalLines);
    }
    
    let arrangeHtml = `
      <h3 class="quiz-title" style="color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow); font-weight: bold; font-size: 1.3rem; margin-bottom: 12px;">
        Visual Syntax Organizer
      </h3>
      <div style="font-size: 1.05rem; margin-bottom: 15px; color: var(--text-main); font-weight: 500; line-height: 1.5;">
        Build the program sequence! Click the arrow buttons (▲ / ▼) to move code lines into their correct logical structure:
      </div>
      <div id="arrange-items-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px; width: 100%;">
    `;
    
    window.currentArrangeCodeLines.forEach((line, idx) => {
      arrangeHtml += `
        <div class="arrange-item" data-idx="${idx}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; background: var(--element-bg); border: 1px solid var(--element-border); border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem; gap: 15px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <span style="color: var(--text-muted); font-weight: bold; width: 20px; flex-shrink: 0;">${idx + 1}</span>
            <pre style="margin: 0; white-space: pre-wrap; color: var(--text-main); font-size: 0.85rem; font-weight: bold; overflow-x: auto;"><code>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>
          <div style="display: flex; gap: 5px; flex-shrink: 0;">
            <button class="arrange-up-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--cyan); border-radius: 4px; color: var(--cyan); cursor: pointer;" title="Move Up">▲</button>
            <button class="arrange-down-btn btn-neon" data-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; border-color: var(--purple); border-radius: 4px; color: var(--purple); cursor: pointer;" title="Move Down">▼</button>
          </div>
        </div>
      `;
    });
    
    arrangeHtml += `
      </div>
      <button id="verify-arrange-btn" class="btn-neon" style="margin-top: 20px; width: 100%; display: flex; justify-content: center; padding: 14px; font-weight: bold; font-size: 1rem; border-color: var(--cyan); background: transparent; cursor: pointer;">
        Verify Code Structure
      </button>
      <div id="arrange-feedback-bar" style="margin-top: 20px; padding: 12px; border-radius: 6px; background: var(--element-bg); border: 1px solid var(--element-border); font-weight: 600; text-align: center; font-size: 0.95rem; display: none;"></div>
    `;
    
    return arrangeHtml;
  }
  
  if (challengeType === 'bug-finding') {
    let optionsHtml = '';
    lvl.options.forEach((opt, idx) => {
      optionsHtml += `<button class="quiz-option" data-idx="${idx}">${opt}</button>`;
    });
    
    return `
      <h3 class="quiz-title" style="color: #ff3366; text-shadow: 0 0 10px rgba(255,51,102,0.3); font-weight: bold; font-size: 1.3rem; margin-bottom: 12px;">Debugging Arena</h3>
      <div style="display: inline-block; padding: 4px 10px; background: rgba(255, 51, 102, 0.15); border: 1.5px solid #ff3366; border-radius: 12px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #ff99aa; margin-bottom: 12px;">
        Level Mode: Bug Spotter
      </div>
      <p style="margin-bottom: 20px; font-size: 1.05rem; font-weight: 500; line-height: 1.5;">${lvl.question}</p>
      <div class="quiz-options" id="quiz-container" style="display: flex; flex-direction: column; gap: 10px;">
        ${optionsHtml}
      </div>
    `;
  }
  
  if (challengeType === 'prediction') {
    let optionsHtml = '';
    lvl.options.forEach((opt, idx) => {
      optionsHtml += `<button class="quiz-option" data-idx="${idx}">${opt}</button>`;
    });
    
    return `
      <h3 class="quiz-title" style="color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow); font-weight: bold; font-size: 1.3rem; margin-bottom: 12px;">Output Prediction Challenge</h3>
      <div style="display: inline-block; padding: 4px 10px; background: rgba(0, 243, 255, 0.15); border: 1.5px solid var(--cyan); border-radius: 12px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--cyan); margin-bottom: 12px;">
        Level Mode: Logical Prediction
      </div>
      <p style="margin-bottom: 20px; font-size: 1.05rem; font-weight: 500; line-height: 1.5;">${lvl.question}</p>
      <div class="quiz-options" id="quiz-container" style="display: flex; flex-direction: column; gap: 10px;">
        ${optionsHtml}
      </div>
    `;
  }
  
  let optionsHtml = '';
  lvl.options.forEach((opt, idx) => {
    optionsHtml += `<button class="quiz-option" data-idx="${idx}">${opt}</button>`;
  });
  
  return `
    <h3 class="quiz-title" style="color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow); font-weight: bold; font-size: 1.3rem; margin-bottom: 12px;">Challenge</h3>
    <p style="margin-bottom: 20px; font-size: 1.05rem; line-height: 1.5;">${lvl.question}</p>
    <div class="quiz-options" id="quiz-container" style="display: flex; flex-direction: column; gap: 10px;">
      ${optionsHtml}
    </div>
  `;
}

function triggerQuestSuccess(courseId, currentLvlNum, lvl, course) {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  
  const btn = document.getElementById('mr-roboto-tts-btn');
  const txt = document.getElementById('tts-btn-text');
  const eq = document.getElementById('tts-equalizer');
  if (btn && txt && eq) {
    btn.style.background = 'var(--element-bg)';
    btn.style.color = 'var(--cyan)';
    btn.style.boxShadow = 'none';
    txt.innerText = 'Listen to Mr. Roboto';
    eq.style.display = 'none';
  }

  const newlyCompleted = markLevelCompleted(courseId, currentLvlNum);
  if (newlyCompleted && !window.isSkipping) {
    awardSkillSparks(10);
  }
  
  const checkInRes = checkInToday();
  if (checkInRes && checkInRes.success) {
    setTimeout(() => {
      showMentorMessage(`Double Win! Your daily learning check-in is complete! Active Streak count: ${checkInRes.updatedStreak} Days!`, 5500);
    }, 4000);
  }
  
  setTimeout(() => {
    const overlay = document.getElementById('celebration-overlay');
    const nextBtn = document.getElementById('next-level-btn');
    if (!overlay || !nextBtn) return;
    
    const isCourseCompleted = currentLvlNum >= course.levels.length;
    if (isCourseCompleted) {
      nextBtn.innerHTML = 'CLAIM ACHIEVEMENT BADGE';
      nextBtn.style.background = 'linear-gradient(135deg, #ffd700, #ff8c00)';
      nextBtn.style.borderColor = '#ffd700';
      nextBtn.style.color = '#000000';
      nextBtn.style.fontWeight = '800';
      nextBtn.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.6)';
    } else {
      nextBtn.innerHTML = 'Continue Journey';
      nextBtn.style.background = '';
      nextBtn.style.borderColor = '';
      nextBtn.style.color = '';
      nextBtn.style.fontWeight = '';
      nextBtn.style.boxShadow = '';
    }

    if (window.isSkipping) {
      overlay.querySelector('.spark-reward').innerHTML = 'Skipped challenge!<br><span style="font-size: 1.2rem; margin-top: 10px; display: block; color: #ff3366; font-weight:800;">-5 Sparks used for skip. Keep learning.</span>';
      overlay.querySelector('h2').innerText = 'LEVEL SKIPPED';
      window.isSkipping = false;
    } else if (!newlyCompleted) {
      overlay.querySelector('.spark-reward').innerHTML = isCourseCompleted 
        ? 'Roadmap Fully Mastered!<br><span style="font-size: 1.2rem; margin-top: 10px; display: block; color: var(--success); font-weight:700;">Certification Ready!</span>'
        : 'Challenge Completed!<br><span style="font-size: 1.2rem; margin-top: 10px; display: block; color: var(--text-muted); font-weight:700;">Points already awarded</span>';
      overlay.querySelector('h2').innerText = isCourseCompleted ? 'COURSE MASTERED!' : 'LEVEL RETAKE CLEARED!';
    } else if (isCourseCompleted) {
      overlay.querySelector('.spark-reward').innerHTML = '+10 reward ✨ Sparks<br><span style="font-size: 1.1rem; margin-top: 10px; display: block; color: var(--success); font-weight:800; text-transform:uppercase; letter-spacing:1px; line-height:1.4;">ROADMAP COMPLETED!</span>';
      overlay.querySelector('h2').innerText = 'ROADMAP FULLY CLEARED!';
    } else {
      overlay.querySelector('.spark-reward').innerHTML = '+10 reward ✨ Sparks <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      overlay.querySelector('h2').innerText = 'LEVEL CLEARED!';
    }
    overlay.classList.add('active');
    
    nextBtn.onclick = () => {
       if (isCourseCompleted) {
         overlay.classList.remove('active');
         showAchievementBadgeModal(courseId);
         
         setTimeout(() => {
           const modalObj = document.getElementById('achievement-badge-modal');
           if (modalObj) {
             const returnBtn = document.getElementById('close-badge-doc-btn');
             const closeXBtn = modalObj.querySelector('.badge-close-btn');
             const handleCloseAndNavigate = () => {
               modalObj.remove();
               window.location.hash = '#dashboard';
             };
             if (returnBtn) returnBtn.onclick = handleCloseAndNavigate;
             if (closeXBtn) closeXBtn.onclick = handleCloseAndNavigate;
           }
         }, 100);
       } else {
         window.location.hash = `#quest/${courseId}/${currentLvlNum + 1}`;
       }
    };
    
    const retakeBtn = document.getElementById('retake-level-btn');
    if (retakeBtn) {
      retakeBtn.onclick = () => {
         window.dispatchEvent(new Event('hashchange'));
      };
    }
  }, 1200);
}

// Dynamically generate styles tailored for each programming language (using variables to preserve visual consistency)
function getCourseThemeStyle(courseId) {
  switch (courseId) {
    case 'python':
      return `
        /* Python: Green/Cyan Explorer Theme */
        .quest-container {
          --cyan: #00ffaa !important;
          --purple: #00adb5 !important;
          --cyan-glow: rgba(0, 255, 170, 0.25) !important;
          --purple-glow: rgba(0, 173, 181, 0.25) !important;
          --element-bg: rgba(0, 255, 170, 0.05) !important;
          --element-border: rgba(0, 255, 170, 0.2) !important;
        }
        
        .light-mode .quest-container {
          --cyan: #008055 !important;
          --purple: #005f66 !important;
          --cyan-glow: rgba(0, 128, 85, 0.15) !important;
          --purple-glow: rgba(0, 95, 102, 0.15) !important;
          --element-bg: rgba(0, 128, 85, 0.04) !important;
          --element-border: rgba(0, 128, 85, 0.18) !important;
        }
      `;
    case 'c':
      return `
        /* C: Blue Engineering Lab Theme */
        .quest-container {
          --cyan: #00bcff !important;
          --purple: #3a5aff !important;
          --cyan-glow: rgba(0, 188, 255, 0.25) !important;
          --purple-glow: rgba(58, 90, 255, 0.25) !important;
          --element-bg: rgba(0, 188, 255, 0.05) !important;
          --element-border: rgba(0, 188, 255, 0.2) !important;
        }
        
        .light-mode .quest-container {
          --cyan: #0077aa !important;
          --purple: #0033cc !important;
          --cyan-glow: rgba(0, 119, 170, 0.15) !important;
          --purple-glow: rgba(0, 51, 204, 0.15) !important;
          --element-bg: rgba(0, 119, 170, 0.04) !important;
          --element-border: rgba(0, 119, 170, 0.18) !important;
        }
      `;
    case 'java':
      return `
        /* Java: Orange/Red Futuristic City Theme */
        .quest-container {
          --cyan: #ff7f11 !important;
          --purple: #e01e37 !important;
          --cyan-glow: rgba(255, 127, 17, 0.25) !important;
          --purple-glow: rgba(224, 30, 55, 0.25) !important;
          --element-bg: rgba(255, 127, 17, 0.05) !important;
          --element-border: rgba(255, 127, 17, 0.2) !important;
        }
        
        .light-mode .quest-container {
          --cyan: #b35300 !important;
          --purple: #a61225 !important;
          --cyan-glow: rgba(179, 83, 0, 0.15) !important;
          --purple-glow: rgba(166, 18, 37, 0.15) !important;
          --element-bg: rgba(179, 83, 0, 0.04) !important;
          --element-border: rgba(179, 83, 0, 0.18) !important;
        }
      `;
    case 'javascript':
      return `
        /* JavaScript: Yellow Neon Cyber Theme */
        .quest-container {
          --cyan: #ffd600 !important;
          --purple: #ff007f !important;
          --cyan-glow: rgba(255, 214, 0, 0.25) !important;
          --purple-glow: rgba(255, 0, 127, 0.25) !important;
          --element-bg: rgba(255, 214, 0, 0.05) !important;
          --element-border: rgba(255, 214, 0, 0.2) !important;
        }
        
        .light-mode .quest-container {
          --cyan: #967000 !important;
          --purple: #bd005a !important;
          --cyan-glow: rgba(150, 112, 0, 0.15) !important;
          --purple-glow: rgba(189, 0, 90, 0.15) !important;
          --element-bg: rgba(150, 112, 0, 0.04) !important;
          --element-border: rgba(150, 112, 0, 0.18) !important;
        }
      `;
    case 'cpp':
      return `
        /* C++: Purple Mechanical/Space Theme */
        .quest-container {
          --cyan: #ae00ff !important;
          --purple: #00f0ff !important;
          --cyan-glow: rgba(174, 0, 255, 0.25) !important;
          --purple-glow: rgba(0, 240, 255, 0.25) !important;
          --element-bg: rgba(174, 0, 255, 0.05) !important;
          --element-border: rgba(174, 0, 255, 0.2) !important;
        }
        
        .light-mode .quest-container {
          --cyan: #7a00cc !important;
          --purple: #008899 !important;
          --cyan-glow: rgba(122, 0, 204, 0.15) !important;
          --purple-glow: rgba(0, 136, 153, 0.15) !important;
          --element-bg: rgba(122, 0, 204, 0.04) !important;
          --element-border: rgba(122, 0, 204, 0.18) !important;
        }
      `;
    default:
      return '';
  }
}

// Helper to standardize level content according to beginner-friendly structural rules
function getStandardizedLevel(courseId, lvl) {
  if (!lvl) return lvl;
  if (lvl.isMatchingMilestone) return lvl;

  const cloned = { ...lvl };
  const currentLvlNum = parseInt(cloned.originalId || cloned.id, 10);
  
  let scenarioText = "";
  let codeSnippet = "";
  let question = cloned.question || "";
  let options = cloned.options || [];
  let answerIndex = cloned.answerIndex ?? 0;
  let successMsg = cloned.successMsg || "";
  let errorMsg = cloned.errorMsg || "";

  // Dynamic mapping per course/level
  if (courseId === "python") {
    switch (currentLvlNum) {
      case 1:
        scenarioText = "Scenario: You run a local Toy Store. Label a storage box as 'toy_cars' to count how many toy cars you have on your shelf.";
        codeSnippet = "toy_cars = 15\nprint(toy_cars)";
        question = "How would you store the value 15 in a variable named 'toy_cars' for your toy store?";
        options = ["15 = toy_cars", "toy_cars = 15", "toy_cars == 15", "set toy_cars to 15"];
        answerIndex = 1;
        successMsg = "Stellar choice! You created a variable named 'toy_cars' and stored 15 in it.";
        errorMsg = "Remember, the variable name goes on the left, followed by '=' and then the value on the right.";
        break;
      case 2:
        scenarioText = "Scenario: You run a cozy Pet Shop. Use custom labels to store puppy counts (integer), price of bird food (float), and puppy name (string).";
        codeSnippet = "puppies = 8\nprice = 12.50\nbreed = \"Goldie\"";
        question = "Which of the variables in your cozy Pet Shop is a STRING data type?";
        options = ["puppies = 8", "price = 12.50", "breed = \"Goldie\"", "None of these"];
        answerIndex = 2;
        successMsg = "Perfect! breed = \"Goldie\" is a String because the value is enclosed in quotation marks.";
        errorMsg = "Look at the values! Double quotes (\" \") mark a String, whole numbers are integers, and decimals are floats.";
        break;
      case 3:
        scenarioText = "Scenario: You work at a Movie Theater ticket counter. Ask incoming movie guests for their custom name, then print out a custom welcome ticket.";
        codeSnippet = "user = input(\"Name: \")\nprint(\"Welcome \" + user)";
        question = "At the Movie Theater counter, which function listens and catches the guest's name (Input)?";
        options = ["print()", "input()", "welcome()", "scan()"];
        answerIndex = 1;
        successMsg = "Spot on! input() is used to capture input from the guest.";
        errorMsg = "Remember, print() displays output while input() captures input.";
        break;
      case 4:
        scenarioText = "Scenario: You are sharing a large Pizza among friends. Find how many full slices everyone gets, and calculate the leftover slices.";
        codeSnippet = "slices = 8\nfriends = 3\nshares = slices // friends\nleftover = slices % friends";
        question = "How many leftover slices of pizza do we get using the modulo operator 'slices % friends' (where slices = 8, friends = 3)?";
        options = ["3", "2", "1", "0"];
        answerIndex = 1;
        successMsg = "Exactly! 3 goes into 8 two times, leaving a remainder of 2 leftover slices.";
        errorMsg = "Let's check the math: 8 divided by 3 has a remainder of 2 (8 - 3 * 2 = 2).";
        break;
      case 5:
        scenarioText = "Scenario: You operate an Amusement Park ride. Check if a child's height is tall enough for the roller-coaster, otherwise point them to the carousel.";
        codeSnippet = "if height >= 120:\n    print(\"Go coaster!\")\nelse:\n    print(\"Go carousel!\")";
        question = "To send children to the carousel if their height is not high enough, which block is executed?";
        options = ["if block", "elif block", "else block", "or block"];
        answerIndex = 2;
        successMsg = "That's it! The 'else:' block is triggered if the initial 'if' condition evaluates to False.";
        errorMsg = "Think about the path: if height >= 120 is false, the code falls back immediately to the 'else' block.";
        break;
      case 6:
        scenarioText = "Scenario: You are a gardener watering five beautiful sunflower pots in a neat row. Repeat the watering action sequentially until all are hydrated.";
        codeSnippet = "for pot in range(1, 6):\n    print(f\"Pot {pot} watered!\")";
        question = "How many pots will your 'for pot in range(1, 6):' loop water in total?";
        options = ["6 times", "5 times", "1 time", "0 times"];
        answerIndex = 1;
        successMsg = "Excellent! range(1, 6) starts at 1 and stops before 6, running exactly 5 times.";
        errorMsg = "Notice that range(start, stop) runs from start up to (stop - 1). So 1 to 5, which is 5 times.";
        break;
      case 7:
        scenarioText = "Scenario: You are a DJ at a dance club. Standardize your signature airhorn sound effect once inside a reusable function to blast it dynamically.";
        codeSnippet = "def airhorn(times):\n    return \"📣\" * times\n\nprint(airhorn(3))";
        question = "Which Python keyword is used to declare and define our signature 'airhorn' function?";
        options = ["function", "def", "sound", "declare"];
        answerIndex = 1;
        successMsg = "Correct! 'def' stands for define. It tells Python you are defining a custom function.";
        errorMsg = "In Python, we use the short 3-letter keyword 'def' to define a function.";
        break;
      case 8:
        scenarioText = "Scenario: You are packing a Picnic Basket for a sunny day at the park. Store your snacks sequentially inside an aligned list.";
        codeSnippet = "basket = [\"Apple\", \"Cookie\", \"Juice\"]\nprint(basket[1])";
        question = "In your picnic basket list, if you want to print 'Apple', what index position would you access?";
        options = ["basket[0]", "basket[1]", "basket[2]", "basket[3]"];
        answerIndex = 0;
        successMsg = "Spot on! Lists in Python are zero-indexed, so the first element is at index 0.";
        errorMsg = "Zero-indexing means we start counting at 0. So the first item 'Apple' is at index 0.";
        break;
      case 9:
        scenarioText = "Scenario: You are a pilot locking down your flight's GPS coordinates. Use a locked, unchangeable tuple so your navigation remains safe.";
        codeSnippet = "gps = (45.10, -122.68)\n# gps[0] = 10.0  # Error! Safe & locked!";
        question = "Why do we use a tuple '(45.10, -122.68)' for the flight's GPS instead of a normal list?";
        options = ["Tuples can be easily extended", "Tuples are faster to write", "Tuples are immutable (locked and cannot be altered once created)", "Lists cannot hold decimals"];
        answerIndex = 2;
        successMsg = "Precisely! Tuples are immutable, which safeguards the values from accidental changes.";
        errorMsg = "The key safety feature of a tuple is that it is locked (immutable) and cannot be modified once set.";
        break;
      case 10:
        scenarioText = "Scenario: You run a busy Coffee Shop. Map your menu item name strings directly to their price tags for instant cashier query lookups.";
        codeSnippet = "menu = {\"Latte\": 4, \"Mocha\": 5}\nprint(menu[\"Latte\"])";
        question = "In our Coffee Shop dictionary, how would we fetch the price of a 'Mocha'?";
        options = ["menu[1]", "menu.getMocha", "menu[\"Mocha\"]", "menu{\"Mocha\"}"];
        answerIndex = 2;
        successMsg = "That's it! We use brackets with the exact string key menu[\"Mocha\"] to lookup the mapped value.";
        errorMsg = "To query a dictionary, use brackets menu[\"key\"] with the matching item label.";
        break;
      case 11:
        scenarioText = "Scenario: You are a postal worker sorting letters. De-duplicate multiple incoming zipcodes instantly into unique delivery bags.";
        codeSnippet = "zipcodes = {\"90210\", \"10001\", \"90210\"}\nprint(zipcodes)  # Only unique codes!";
        question = "For zipcodes '{\"90210\", \"10001\", \"90210\"}', what output will print, highlighting the main feature of Sets?";
        options = ["{'90210', '10001'}", "{'90210', '10001', '90210'}", "['90210', '10001']", "{'10001'}"];
        answerIndex = 0;
        successMsg = "Perfect! Sets automatically de-duplicate items, keeping only unique values.";
        errorMsg = "Sets contain only unique items. The duplicate '90210' is discarded.";
        break;
      case 12:
        scenarioText = "Scenario: You are printing customized birthday invitation cards. Format guest names and ages dynamically inside your print statements.";
        codeSnippet = "guest = \"Alice\"\nletter = f\"Happy birthday, {guest}!\"\nprint(letter)";
        question = "How does Python recognize that our birthday letter is a dynamically formatted f-string?";
        options = ["By putting 'f' right before the opening quote", "By using curly braces {}", "By declaring format=True", "By using %f inside quotes"];
        answerIndex = 0;
        successMsg = "Exactly! Prepending 'f' to the string makes it an f-string.";
        errorMsg = "We must place the character 'f' directly before the opening quotation mark.";
        break;
      case 13:
        scenarioText = "Scenario: You are rolling dice during a family board game night. Import the random module to generate a fair number between 1 and 6.";
        codeSnippet = "import random\nroll = random.randint(1, 6)\nprint(roll)";
        question = "Which keyword retrieves the external 'random' module into our dice script?";
        options = ["require", "import", "include", "use"];
        answerIndex = 1;
        successMsg = "Yes! 'import' is the keyword used to load external modules in Python.";
        errorMsg = "We use the keyword 'import' to bring in external libraries.";
        break;
      case 14:
        scenarioText = "Scenario: You are a secret investigator. Write down your discovered crime clues permanently into a notepad text file.";
        codeSnippet = "with open(\"clues.txt\", \"w\") as f:\n    f.write(\"Red key in room 4\")";
        question = "What does the '\"w\"' parameter tell open() to do with your investigator notepad?";
        options = ["Read ONLY from file", "Write (and overwrite) data permanently", "Watch for changes", "Wait for input"];
        answerIndex = 1;
        successMsg = "Correct! 'w' stands for write, enabling permanent file modifications.";
        errorMsg = "'w' specifies Write mode, which overwrites or creates a new file.";
        break;
      case 15:
        scenarioText = "Scenario: You manage an elevator floor selector. Safeguard the speed calculator to prevent system crashes if division by zero occurs.";
        codeSnippet = "try:\n    speed = dist / time\nexcept ZeroDivisionError:\n    speed = 0";
        question = "In our elevator safeguarding code, which block handles the situation if a division by zero error occurs?";
        options = ["try block", "except ZeroDivisionError block", "catch Error block", "handle block"];
        answerIndex = 1;
        successMsg = "Exactly! The except block catches and resolves the division error smoothly.";
        errorMsg = "Python uses except (not catch) to intercept and handle matching exceptions.";
        break;
      case 16:
        scenarioText = "Scenario: You are an architect designing a Smart Home. Create a standard blueprint class that lets you build multiple physical houses.";
        codeSnippet = "class House:\n    def __init__(self, color):\n        self.color = color";
        question = "What special method acting as the constructor is called automatically when you build a new House in Python?";
        options = ["def constructor()", "def __init__()", "def build()", "def create()"];
        answerIndex = 1;
        successMsg = "Perfect! __init__ is Python's automatic constructor.";
        errorMsg = "Python classes use the dunder method __init__ as the constructor function.";
        break;
      case 17:
        scenarioText = "Scenario: You operate a fleet of vehicles. Inherit the basic traits of a standard Truck to build a specialized IceCreamTruck.";
        codeSnippet = "class Truck:\n    wheels = 4\nclass IceCream(Truck): pass";
        question = "How does our IceCream class indicate that it inherits all traits from Truck?";
        options = ["class IceCream inherits Truck", "class IceCream : Truck", "class IceCream(Truck)", "class IceCream implements Truck"];
        answerIndex = 2;
        successMsg = "Outstanding! Passing the parent class in parentheses is Python's syntax for class inheritance.";
        errorMsg = "To inherit in Python, place the parent class inside parentheses immediately after the new class name.";
        break;
      case 18:
        scenarioText = "Scenario: You are checking weather reports. Parse a digital JSON payload received from a weather balloon to check if it's raining.";
        codeSnippet = "import json\nforecast = '{\"rain\": true}'\nweather = json.loads(forecast)\nprint(weather[\"rain\"])";
        question = "Which function in the json module parses a JSON string like our weather payload into a dictionary?";
        options = ["json.loads()", "json.dumps()", "json.parse()", "json.read()"];
        answerIndex = 0;
        successMsg = "Perfect! json.loads loads a JSON string into Python.";
        errorMsg = "We use json.loads() (short for load string) to decode JSON datasets.";
        break;
      case 19:
        scenarioText = "Scenario: You are building a checkout system for a grocery store. Calculate the total sum of items in the customer's cart.";
        codeSnippet = "cart = [12, 8, 20]\ntotal = sum(cart)\nprint(f\"Total: {total}\")";
        question = "Which built-in Python function will compute the addition of all numeric values in our cart list?";
        options = ["add()", "calculate()", "total()", "sum()"];
        answerIndex = 3;
        successMsg = "Exactly! sum() returns the sum of all elements in an iterable.";
        errorMsg = "The simple built-in function sum(list) computes the direct total of lists.";
        break;
      case 20:
      default:
        scenarioText = "Scenario: You graduated the Python track! Calibrate your code engine to run diagnostic signals across all system lanes.";
        codeSnippet = "print(\"Python engine fully operational!\")";
        question = "What basic statement will confirm your Python program can print diagnostic feedback?";
        options = ["echo(\"Go\")", "print(\"Go\")", "system(\"Go\")", "console.log(\"Go\")"];
        answerIndex = 1;
        successMsg = "Brilliant! print() is the foundational command to output diagnostic strings.";
        errorMsg = "Remember, print() is the standard statement to write to output.";
        break;
    }
  } else if (courseId === "c") {
    switch (currentLvlNum) {
      case 1:
        scenarioText = "Scenario: You are the chief engineer of a Cargo Ship. Setup a precise variable slot to track the fuel container units in the main bay.";
        codeSnippet = "int fuel = 80;\nprintf(\"%d units\", fuel);";
        question = "How do you define a precise integer variable named 'fuel' with a value of 80 in C?";
        options = ["fuel = 80;", "int fuel = 80;", "var fuel = 80;", "integer fuel = 80;"];
        answerIndex = 1;
        successMsg = "Correct! C requires explicit data type declarations like 'int' for integers.";
        errorMsg = "In C, we must prepend the data type 'int' before the variable name.";
        break;
      case 2:
        scenarioText = "Scenario: You run a Subway station ticket scanner. Read your passenger's boarding zone choice and print their gate number.";
        codeSnippet = "int zone;\nscanf(\"%d\", &zone);\nprintf(\"Zone: %d\", zone);";
        question = "Which C function retrieves formatted input (like our zone choice) from the console?";
        options = ["printf()", "scanf()", "read()", "input()"];
        answerIndex = 1;
        successMsg = "Correct! scanf() reads formatted input from the standard input.";
        errorMsg = "We use scanf() with a format specifier to accept numeric input.";
        break;
      case 3:
        scenarioText = "Scenario: You are checking temperatures inside a Chocolate Refinery. If the heat is safe, start the stirrers; otherwise trigger cooling.";
        codeSnippet = "if (heat < 50) {\n    printf(\"Stirring!\");\n} else {\n    printf(\"Cooling!\");\n}";
        question = "In the Chocolate Refinery check, how does C check if heat is less than 50?";
        options = ["if heat < 50", "if(heat < 50) { ... }", "if heat < 50 then", "when (heat < 50)"];
        answerIndex = 1;
        successMsg = "Perfect! C conditions require parentheses around the boolean expression.";
        errorMsg = "Always place parentheses around the conditional statement in C.";
        break;
      case 4:
        scenarioText = "Scenario: You are sounding a harbor foghorn warning during a heavy mist. Sound the foghorn beep sequentially 5 times in a loop.";
        codeSnippet = "for (int i = 0; i < 5; i++) {\n    printf(\"BEEP!\\n\");\n}";
        question = "Which part of the C for loop ensures the counter index increment progresses to the next step?";
        options = ["int i = 0", "i < 5", "i++", "printf()"];
        answerIndex = 2;
        successMsg = "Spot on! i++ increments the loop counter on each run.";
        errorMsg = "The third statement inside a for loop (i++) handles updating the counter.";
        break;
      case 5:
        scenarioText = "Scenario: You are tracking the scoreboard points for a local Soccer Tournament. Store three match scores inside a fixed array.";
        codeSnippet = "int points[3] = {3, 1, 0};\nprintf(\"Score: %d\", points[0]);";
        question = "What value does points[0] print for our Soccer Tournament scores?";
        options = ["3", "1", "0", "3, 1, 0"];
        answerIndex = 0;
        successMsg = "Exactly! points[0] accesses the very first score, which is 3.";
        errorMsg = "C arrays are zero-indexed, meaning position [0] accesses the first score.";
        break;
      case 6:
        scenarioText = "Scenario: You are adjusting prices at a boutique shop. Group the tax calculation logic inside a reusable, neat function block.";
        codeSnippet = "float discount(int price) {\n    return price * 0.08;\n}";
        question = "What data type does the discount function return according to its definition signature?";
        options = ["int", "float", "void", "double"];
        answerIndex = 1;
        successMsg = "Correct! The prefix 'float' specifies that the function yields decimal outputs.";
        errorMsg = "Check the start of the function signature: 'float discount(...)'.";
        break;
      case 7:
        scenarioText = "Scenario: You are a treasure hunter searching for gold coins. Get or modify values by pointing directly to physical coordinate memory addresses.";
        codeSnippet = "int coins = 250;\nint *map = &coins;\n*map = 300;";
        question = "Which symbol creates a pointer variable map that holds the memory address of our gold coins?";
        options = ["&", "*", "$", "->"];
        answerIndex = 1;
        successMsg = "Precisely! The asterisk (*) specifies that the variable is a pointer.";
        errorMsg = "An asterisk (*) is used to declare pointer types in C.";
        break;
      case 8:
        scenarioText = "Scenario: You command a Space Shuttle. Bundle flight speed and fuel levels into a single cohesive structure.";
        codeSnippet = "struct Shuttle {\n    int speed;\n    int fuel;\n};\nstruct Shuttle s = {17500, 100};";
        question = "How do you access the speed property from your initialized Space Shuttle variable s?";
        options = ["s[0]", "s->speed", "s.speed", "Shuttle.speed"];
        answerIndex = 2;
        successMsg = "Awesome! We use dot notation (s.speed) to read members of structures.";
        errorMsg = "We use a simple dot (.) to access structure attributes on standard variables.";
        break;
      case 9:
        scenarioText = "Scenario: You are logging daily temperature readings on a lighthouse weather card permanently on your drive.";
        codeSnippet = "FILE *out = fopen(\"temp.dat\", \"w\");\nfprintf(out, \"Temp: 18C\");\nfclose(out);";
        question = "Which function handles closing and flushing the permanent file stream in C?";
        options = ["fopen()", "fclose()", "fcloseall()", "close()"];
        answerIndex = 1;
        successMsg = "Excellent! fclose() correctly shuts file streams safely.";
        errorMsg = "Always release system file handles using fclose() at the end.";
        break;
      case 10:
      default:
        scenarioText = "Scenario: You are booking seats for a last-minute flight. Dynamically allocate a clean memory room as passengers check-in.";
        codeSnippet = "int *seats = malloc(4 * sizeof(int));\nseats[0] = 12;\nfree(seats);";
        question = "Which function releases the dynamically allocated seat memory back to the operating system?";
        options = ["malloc()", "release()", "free()", "delete()"];
        answerIndex = 2;
        successMsg = "Correct! free() is C's method to clean up dynamically allocated RAM.";
        errorMsg = "In C, every dynamic malloc() allocation must eventually be cleaned with free().";
        break;
    }
  } else if (courseId === "cpp") {
    switch (currentLvlNum) {
      case 1:
        scenarioText = "Scenario: You run a smart Car Rental parking zone. Define a precise variable to track available electric vehicles in stock.";
        codeSnippet = "int cars = 12;\nstd::cout << cars;";
        question = "Which operator pipes and displays outputs through std::cout?";
        options = ["<<", ">>", "=", "::"];
        answerIndex = 0;
        successMsg = "Absolutely! The insertion operator (<<) pushes data to the console output stream.";
        errorMsg = "Think of 'std::cout' as pushing data away. Use '<<'.";
        break;
      case 2:
        scenarioText = "Scenario: You are building an epic holographic Game Arena lobby. Listen to incoming player names and print out greeting tags.";
        codeSnippet = "string hero;\nstd::cin >> hero;\nstd::cout << \"Chief \" << hero;";
        question = "Which operator receives values from std::cin to load into our variable?";
        options = ["<<", ">>", "==", "::"];
        answerIndex = 1;
        successMsg = "Correct! The extraction operator (>>) pulls data from input streams.";
        errorMsg = "Input extraction pulls towards the variable, requiring the '>>' operator.";
        break;
      case 3:
        scenarioText = "Scenario: You are building an automated rocket launch countdown. Loop down from 3 to 1 before shouting lift-off!";
        codeSnippet = "for (int count = 3; count > 0; count--) {\n    std::cout << count << \" \";\n}";
        question = "How many numbers will the rocket countdown loop print in total?";
        options = ["3", "4", "2", "0"];
        answerIndex = 0;
        successMsg = "Perfect! It loops for count = 3, 2, and 1, which prints exactly 3 items.";
        errorMsg = "The loop executes for numbers strictly greater than 0: 3, 2, 1.";
        break;
      case 4:
        scenarioText = "Scenario: You are managing rows of solar panel voltage outputs. Catalog their rates across solid locked array indices.";
        codeSnippet = "int temps[3] = {350, 375, 400};\nstd::cout << temps[0];";
        question = "What values will temps[0] reveal in our solar array dataset?";
        options = ["350", "375", "400", "3"];
        answerIndex = 0;
        successMsg = "Perfect! 350 is located at zero index position.";
        errorMsg = "Arrays index starting from 0. The first val is 350.";
        break;
      case 5:
        scenarioText = "Scenario: You are a sound engineer. Play alert signals that accept either simple beep pitches or complex musical notes.";
        codeSnippet = "void beep() { cout << \"Bip\"; }\nvoid beep(string sound) { cout << sound; }";
        question = "What C++ capability lets you declare multiple functions with the same name but different input arguments?";
        options = ["Function Overloading", "Class Inheritance", "Function Copying", "Deduplication"];
        answerIndex = 0;
        successMsg = "Correct! Overloading distinguishes methods using matching parameter signatures.";
        errorMsg = "Declaring same-name methods with distinct parameter types is 'Function Overloading'.";
        break;
      case 6:
        scenarioText = "Scenario: You are designing an automatic espresso dispenser. Hide internal pressure controls behind private accessibility barriers.";
        codeSnippet = "class Machine {\nprivate:\n    int bars = 15;\npublic:\n    int pressure() { return bars; }\n};";
        question = "What keyword prevents scripts from reading or altering 'bars' directly outside the Machine class?";
        options = ["public", "private", "protected", "secret"];
        answerIndex = 1;
        successMsg = "Correct! 'private' encapsulates fields behind high-security gates.";
        errorMsg = "Fields labeled 'private' are hidden from external classes.";
        break;
      case 7:
        scenarioText = "Scenario: You run a robotics manufacturing workshop. Instantiate a physical robot assistant from your Class blueprint.";
        codeSnippet = "Robot gold;\ngold.serial = 405;\nstd::cout << gold.serial;";
        question = "How do we access or set the member variable 'serial' of our 'gold' Robot instance?";
        options = ["gold.serial", "gold->serial", "gold::serial", "Robot->serial"];
        answerIndex = 0;
        successMsg = "Yes! Class instances use dot notation direct lookups.";
        errorMsg = "Standard class references utilize a dot (.) to reach properties.";
        break;
      case 8:
        scenarioText = "Scenario: You are cataloging delivery vehicles. Create a specialized sports car that inherits base attributes from a general vehicle template.";
        codeSnippet = "class Vehicle { public: int speed; };\nclass SportsCar : public Vehicle { };";
        question = "What symbol and access level connects SportsCar to inherit from public class Vehicle?";
        options = [": public", "extends public", "< public", "inherits"];
        answerIndex = 0;
        successMsg = "Fabulous! C++ uses a colon ':' followed by the access modifier to subclass parent templates.";
        errorMsg = "In C++, we use a colon followed by inheritance type, like ': public'.";
        break;
      case 9:
        scenarioText = "Scenario: You are packing keys and passport details inside a dynamic STL Vector list that resizes automatically as you add items.";
        codeSnippet = "vector<string> items;\nitems.push_back(\"Passport\");\ncout << items[0];";
        question = "Which function adds 'Passport' into our dynamic vector?";
        options = ["add()", "push()", "push_back()", "append()"];
        answerIndex = 2;
        successMsg = "Brilliant! push_back() places items safely at the end of STL vectors.";
        errorMsg = "In C++ STL vectors, we use push_back() to insert elements.";
        break;
      case 10:
      default:
        scenarioText = "Scenario: You are a security guard logging nightly visitors. Write visitor timestamps directly into logs.txt permanently.";
        codeSnippet = "ofstream file(\"log.txt\");\nfile << \"Guest: John\";\nfile.close();";
        question = "What C++ standard library class is used to open file streams for writing data?";
        options = ["ifstream", "ofstream", "fstream", "file_writer"];
        answerIndex = 1;
        successMsg = "That's it! ofstream stands for output file stream.";
        errorMsg = "For writing out to files, use the 'ofstream' class.";
        break;
    }
  } else if (courseId === "java") {
    switch (currentLvlNum) {
      case 1:
        scenarioText = "Scenario: You manage a peaceful School Library. Set the daily book circulation count inside a strict variable slot.";
        codeSnippet = "int books = 24;\nSystem.out.println(books);";
        question = "Which statement prints our book catalog counts onto Java console terminals?";
        options = ["print(books);", "System.out.println(books);", "console.log(books);", "out.print(books);"];
        answerIndex = 1;
        successMsg = "Exactly! System.out.println() writes formatted text lines in Java.";
        errorMsg = "Java requires the full standard reference pipeline: System.out.println();";
        break;
      case 2:
        scenarioText = "Scenario: You represent a credit card transaction. Track the customer transaction amount, validation status, and bank brand.";
        codeSnippet = "double cash = 99.50;\nboolean valid = true;\nString card = \"Visa\";";
        question = "Which Java datatype manages fractional currencies like 99.50?";
        options = ["int", "double", "boolean", "String"];
        answerIndex = 1;
        successMsg = "Fabulous! decimals (floats) use double-precision 'double' tags in Java.";
        errorMsg = "'double' holds high precision decimal numbers smoothly.";
        break;
      case 3:
        scenarioText = "Scenario: You are a hotel front desk clerk. Capture incoming guest names using scanner utilities to check them in.";
        codeSnippet = "Scanner in = new Scanner(System.in);\nString guest = in.next();\nSystem.out.println(guest);";
        question = "What class captures keyboard scanner console inputs in Java?";
        options = ["System.in", "Scanner", "Reader", "Input"];
        answerIndex = 1;
        successMsg = "Yes! java.util.Scanner represents the primary input reader.";
        errorMsg = "We instantiate the 'Scanner' class to parse typed lines.";
        break;
      case 4:
        scenarioText = "Scenario: You operate agricultural water sprinklers. Check the temperature score to automatically trigger water sprays.";
        codeSnippet = "if (heat > 30) {\n    System.out.println(\"Spray!\");\n} else {\n    System.out.println(\"Idle\");\n}";
        question = "What will the sprinklers output if the heat variable is 25?";
        options = ["Spray!", "Idle", "No Output", "Error"];
        answerIndex = 1;
        successMsg = "Exactly! 25 > 30 is false, routing execution immediately to 'Idle' else paths.";
        errorMsg = "Look closely: is 25 greater than 30? No, prompting the else route.";
        break;
      case 5:
        scenarioText = "Scenario: You are coaching an athlete running track laps. Repeat the track lap count systematically up to 3 times.";
        codeSnippet = "for (int lap = 1; lap <= 3; lap++) {\n    System.out.println(\"Lap: \" + lap);\n}";
        question = "At which number counter check does our athlete lap loop stop execution?";
        options = ["lap == 1", "lap == 2", "lap == 3", "lap == 4"];
        answerIndex = 3;
        successMsg = "Correct! Once lap evaluates to 4, 'lap <= 3' is false, terminating the loop.";
        errorMsg = "The loop repeats while lap <= 3. It will stop when lap increments to 4.";
        break;
      case 6:
        scenarioText = "Scenario: You catalog inventory bin codes in a warehouse depot. Store codes neatly inside an aligned integer array.";
        codeSnippet = "int[] codes = {501, 502, 503};\nSystem.out.println(codes[1]);";
        question = "Which warehouse code will codes[1] retrieve?";
        options = ["501", "502", "503", "IndexOutOfBounds"];
        answerIndex = 1;
        successMsg = "Spot on! Index [1] references the second element, 502.";
        errorMsg = "Remember array indexes start from 0: codes[0]=501, codes[1]=502.";
        break;
      case 7:
        scenarioText = "Scenario: You run an automated central water pump. Package pump operational steps inside reusable method definitions.";
        codeSnippet = "static void pump() {\n    System.out.println(\"Water Flowing!\");\n}";
        question = "What keyword indicates that our pump() method does not return any valued outputs?";
        options = ["static", "void", "null", "int"];
        answerIndex = 1;
        successMsg = "Outstanding! The 'void' keyword tells Java this function returns nothing.";
        errorMsg = "'void' specifies an empty return datatype.";
        break;
      case 8:
        scenarioText = "Scenario: You are designing high-performance Racing Cars. Create a class template specifying color and top speed.";
        codeSnippet = "class Car {\n    String color;\n    int topSpeed;\n}";
        question = "Which fields describe structural properties within our new Car blueprint?";
        options = ["color and topSpeed", "class Car", "methods", "constructors"];
        answerIndex = 0;
        successMsg = "Perfect! color and topSpeed are direct attribute fields.";
        errorMsg = "Fields inside a class define the state properties.";
        break;
      case 9:
        scenarioText = "Scenario: You manufacture a live physical racing car instance out of your conceptual Class blueprint.";
        codeSnippet = "Car racer = new Car();\nracer.color = \"Red\";\nSystem.out.println(racer.color);";
        question = "Which operator token instantiates the new physical racer object in Java memory?";
        options = ["=", "new", "Car()", "create"];
        answerIndex = 1;
        successMsg = "Correct! The 'new' keyword creates and constructs live object instances.";
        errorMsg = "We allocate new heap storage in Java with the 'new' keyword.";
        break;
      case 10:
        scenarioText = "Scenario: You run a smart thermostat. Automatically assign starting temperature parameters upon device initialization.";
        codeSnippet = "class Thermostat {\n    Thermostat(int t) { temp = t; }\n    int temp;\n}";
        question = "What is the constructor method signature for our Thermostat class?";
        options = ["void Thermostat()", "Thermostat(int t)", "initThermostat()", "constructor(int t)"];
        answerIndex = 1;
        successMsg = "Perfect! Constructors must share the exact same name as their Class and define no return type.";
        errorMsg = "Java constructors match the class name 'Thermostat' and have no void/return tag.";
        break;
      case 11:
        scenarioText = "Scenario: You run an international bank. Create specialized gold savings account profiles inheriting general parental traits.";
        codeSnippet = "class Account { int id; }\nclass Savings extends Account { }";
        question = "What keyword links subclass Savings to inherit from general Account classes in Java?";
        options = ["inherits", "implements", "extends", "subclasses"];
        answerIndex = 2;
        successMsg = "Splendid! Java uses the 'extends' keyword for class inheritance.";
        errorMsg = "Subclasses inherit parent blueprints using 'extends'.";
        break;
      case 12:
        scenarioText = "Scenario: You orchestrate an automated music orchestra. Standardize playing keys accepting varied inputs dynamically.";
        codeSnippet = "void play(int pitch) { }\nvoid play(String melody) { }";
        question = "How does Java support writing these two methods with same names but different signatures?";
        options = ["Overriding", "Overloading", "Polymorphism", "Shadowing"];
        answerIndex = 1;
        successMsg = "Correct! Creating same-name methods with distinct variables is Overloading.";
        errorMsg = "Overloading allows multiple signatures to exist in a single class.";
        break;
      case 13:
        scenarioText = "Scenario: You operate flight control systems. Intercept unexpected arithmetic operations to prevent cockpit computer crashes.";
        codeSnippet = "try {\n    int val = 100 / divisor;\n} catch (Exception e) {\n    System.out.println(\"Fail-safe Triggered!\");\n}";
        question = "What keyword captures exception signals to execute fallback safety procedures?";
        options = ["try", "catch", "throw", "intercept"];
        answerIndex = 1;
        successMsg = "Awesome! Java catches raised crash signals in the 'catch' block.";
        errorMsg = "We use try-catch blocks to monitor and catch exceptions.";
        break;
      case 14:
        scenarioText = "Scenario: You operate a shipping container dock. Keep active shipping product lists safe inside a dynamic ArrayList.";
        codeSnippet = "ArrayList<String> box = new ArrayList<>();\nbox.add(\"Toy\");\nSystem.out.println(box.get(0));";
        question = "Which arraylist function grabs 'Toy' value from index slot 0?";
        options = ["read(0)", "get(0)", "grab(0)", "fetch(0)"];
        answerIndex = 1;
        successMsg = "Splendid! We call get(index) to fetch values inside lists.";
        errorMsg = "ArrayList properties are read using the .get() method.";
        break;
      case 15:
      default:
        scenarioText = "Scenario: You graduated the Java track! Calibrate the registry to verify that the virtual machine states are online.";
        codeSnippet = "System.out.println(\"Java engine online!\");";
        question = "Who processes compiled bytecode files in Java?";
        options = ["Browser", "JVM (Java Virtual Machine)", "OS directly", "C compiler"];
        answerIndex = 1;
        successMsg = "Brilliant! The JVM interprets bytecode on any device.";
        errorMsg = "JVM (Java Virtual Machine) executes our Java bytecode smoothly.";
        break;
    }
  } else if (courseId === "javascript") {
    switch (currentLvlNum) {
      case 1:
        scenarioText = "Scenario: You are building a smart parking dashboard. Track occupied slots using block-scoped variables and constant locks.";
        codeSnippet = "const limit = 50;\nlet occupied = 12;";
        question = "Which keyword creates a mutable block-scoped variable that can be changed later?";
        options = ["const", "let", "var", "def"];
        answerIndex = 1;
        successMsg = "Outstanding! 'let' allows updates, while 'const' locks state.";
        errorMsg = "Use 'let' to set variables that can adapt and update.";
        break;
      case 2:
        scenarioText = "Scenario: You are writing a digital food recipe app. Record ingredients using numeric weights, names, and organic status.";
        codeSnippet = "let rate = 9.8;\nlet unit = \"kg\";\nlet done = true;";
        question = "What value category does the done = true state represent?";
        options = ["Number", "String", "Boolean", "Object"];
        answerIndex = 2;
        successMsg = "Correct! True/False parameters are Booleans.";
        errorMsg = "Logical binary flags represent Booleans in JavaScript.";
        break;
      case 3:
        scenarioText = "Scenario: You are a taxi dispatcher calculating rides. Package trip fare estimation algorithms inside modern arrow functions.";
        codeSnippet = "const fare = (miles) => {\n    return miles * 2.5;\n};";
        question = "Which symbol identifies this as an Arrow Function in ES6 JavaScript?";
        options = ["=>", "->", ":=", "function"];
        answerIndex = 0;
        successMsg = "Excellent! The hash-arrow (=>) creates compact arrow functions.";
        errorMsg = "We specify arrow functions using '=>' syntax.";
        break;
      case 4:
        scenarioText = "Scenario: You are coding a bank ATM screen. Check the cardholder's balance before approving cash withdrawal requests.";
        codeSnippet = "if (balance >= cash) {\n    console.log(\"Dispense!\");\n} else {\n    console.log(\"No cash!\");\n}";
        question = "What triggers 'No cash!' print logs in our bank ATM code?";
        options = ["balance is more than cash", "balance is equal to cash", "balance is less than cash", "Error matches"];
        answerIndex = 2;
        successMsg = "Bravo! If balance is less than cash, the 'else' branch path triggers.";
        errorMsg = "If the IF guard is false (meaning balance is lower), the else runs.";
        break;
      case 5:
        scenarioText = "Scenario: You are illuminating festival paper lanterns in the backyard. Automate ignition sequences 3 times sequentially.";
        codeSnippet = "for (let i = 1; i <= 3; i++) {\n    console.log(\"Lamp \" + i + \" lit!\");\n}";
        question = "How many lanterns are glowing output lines in our logs?";
        options = ["1", "2", "3", "4"];
        answerIndex = 2;
        successMsg = "Indeed! Loops count i from 1 up to 3 inclusive.";
        errorMsg = "Check the bounds: 'i <= 3' with starts of 1 will iterate exactly 3 times.";
        break;
      case 6:
        scenarioText = "Scenario: You are packing a suitcase for a holiday. Store your travel accessories sequentially inside an array list.";
        codeSnippet = "let bag = [\"Socks\", \"Shirt\", \"Keys\"];\nconsole.log(bag[2]);";
        question = "What travels on bag[2] print displays?";
        options = ["Socks", "Shirt", "Keys", "Undefined"];
        answerIndex = 2;
        successMsg = "Correct! Index position [2] represents the third element, Keys.";
        errorMsg = "Remember array sequences: index 0 is Socks, 1 is Shirt, 2 is Keys.";
        break;
      case 7:
        scenarioText = "Scenario: You are designing a gaming profile card for a superhero. Group power ranks and super aliases into an object map.";
        codeSnippet = "let hero = { alias: \"Spark\", power: 95 };\nconsole.log(hero.alias);";
        question = "How do you target the super power metric from our initialized hero object?";
        options = ["hero[power]", "hero.power", "hero{\"power\"}", "hero->power"];
        answerIndex = 1;
        successMsg = "Fabulous! Dot notation (.power) reads properties easily.";
        errorMsg = "Objects read target variables using standard dot notation tags.";
        break;
      case 8:
        scenarioText = "Scenario: You run a live digital news tickerboard. Access or change visual header texts dynamically using browser DOM queries.";
        codeSnippet = "let feed = document.querySelector(\"#feed\");\nfeed.style.color = \"#FF007F\";";
        question = "How does Document.querySelector identify the ID feed selector element?";
        options = ["feed", ".feed", "#feed", "@feed"];
        answerIndex = 2;
        successMsg = "That's it! Hash marks (#) denote ID targets in CSS/DOM queries.";
        errorMsg = "For scanning ID markers, we use the hashtag Symbol (#).";
        break;
      case 9:
        scenarioText = "Scenario: You manage a game night buzzer. Listen for mouse-taps on the button to sound warning triggers in real-time.";
        codeSnippet = "buzzer.onclick = () => {\n    console.log(\"Buzz!\");\n};";
        question = "Which click listener property tracks button element taps directly?";
        options = ["onclick", "onpress", "ontap", "onhover"];
        answerIndex = 0;
        successMsg = "Correct! The onclick attribute captures simple cursor clicks.";
        errorMsg = "We utilize 'onclick' properties to register element click events.";
        break;
      case 10:
        scenarioText = "Scenario: You run a music app. Save active volume slider settings inside local storage cards to persist after refresh.";
        codeSnippet = "localStorage.setItem(\"vol\", 80);\nconsole.log(localStorage.getItem(\"vol\"));";
        question = "Which key is used to search and read local storage configurations in browser logs?";
        options = ["\"vol\"", "\"80\"", "\"set\"", "\"vol_config\""];
        answerIndex = 0;
        successMsg = "Spot on! The key 'vol' returns mapped value counts.";
        errorMsg = "getItem('vol') searches key registers matching that specific key name.";
        break;
      case 11:
        scenarioText = "Scenario: You are waiting for food delivery drones. Halt standard dashboard updates using promise-based sleep delays.";
        codeSnippet = "const delay = ms => new Promise(r => setTimeout(r, ms));\nawait delay(1200);";
        question = "Which JavaScript class schedules delayed timers like setTimeout?";
        options = ["Timer", "Promise", "Await", "Delay"];
        answerIndex = 1;
        successMsg = "Spot on! Promises manage asynchronous delays nicely.";
        errorMsg = "We use the Promise constructor class to wrap setTimeout callbacks.";
        break;
      case 12:
        scenarioText = "Scenario: You are a stock ticker investor. Fetch live trading index tables dynamically from a shared API depot.";
        codeSnippet = "let res = await fetch(\"/api/stocks\");\nlet prices = await res.json();";
        question = "Which browser function initiates asynchronous HTTP network requests?";
        options = ["fetch()", "get()", "sync()", "request()"];
        answerIndex = 0;
        successMsg = "Incredible! The fetch() API triggers standard web resource queries.";
        errorMsg = "We call fetch() to download external data resources smoothly.";
        break;
      case 13:
      default:
        scenarioText = "Scenario: You graduated the Javascript track! Run final security optimizations for your high-speed browser script engine.";
        codeSnippet = "console.log(\"JS console optimized!\");";
        question = "Which browser console panel displays these standard logs and scripts?";
        options = ["DevTools Console", "Inspector Style", "Network Panel", "File Storage"];
        answerIndex = 0;
        successMsg = "Brilliant! The standard developer tools console views printout outputs.";
        errorMsg = "Developer tools (DevTools) contain our visual log outputs.";
        break;
    }
  } else {
    scenarioText = "Scenario: You run a bakery. " + (cloned.analogy || cloned.story || "");
    codeSnippet = cleanCode(cloned.code);
  }

  cloned.analogy = scenarioText;
  cloned.code = codeSnippet;
  cloned.story = scenarioText;
  cloned.question = question;
  cloned.options = options;
  cloned.answerIndex = answerIndex;
  cloned.successMsg = successMsg;
  cloned.errorMsg = errorMsg;

  return cloned;
}

// Helper to sanitize any fallback codes to max 4 to 5 lines of code, replacing long strings with punchy brief notes.
function cleanCode(code) {
  if (!code) return "";
  let lines = code.split("\n");
  lines = lines.filter(line => !line.trim().startsWith("#") && !line.trim().startsWith("//") && line.trim().length > 0);
  lines = lines.slice(0, 5);
  return lines.join("\n")
    .replace(/Apologies, sold out!/gi, "Sold Out!")
    .replace(/Fresh Daily!/gi, "Fresh!")
    .replace(/Preparing your /gi, "Cooking ")
    .replace(/Thank you Alex! Total: /gi, "Total: ")
    .replace(/Cannot split cost among 0 patrons!/gi, "Error!")
    .replace(/Abdul Nasrin - Master Designer/gi, "Alex");
}

export function renderQuest(courseId, levelId) {
  const currentLvlNum = parseInt(levelId, 10);
  const course = getCourseData(courseId);
  const baseLvl = getLevelData(courseId, currentLvlNum);
  const lvl = getStandardizedLevel(courseId, baseLvl);
  
  if (!lvl) {
    return `
      <div class="fade-in text-center" style="margin-top: 100px; padding: 2rem;">
        <h2 class="text-gradient" style="margin-bottom: 1.5rem; font-size: 2.5rem;">Module Complete!</h2>
        <p style="margin-bottom: 2.5rem; font-size: 1.2rem;">You have finished all available levels for this course.</p>
        <a href="#dashboard" class="btn-neon" style="text-decoration: none;">RETURN TO ROADMAP</a>
      </div>
    `;
  }
  
  const user = getCurrentUser();
  if (user && !isCourseUnlocked(user, courseId)) {
    return `
      <div class="fade-in text-center" style="margin-top: 100px; padding: 2rem;">
        <h2 class="text-gradient" style="margin-bottom: 1.5rem; font-size: 2.5rem; color: var(--danger);">Roadmap Locked!</h2>
        <p style="margin-bottom: 2.5rem; font-size: 1.2rem; color: var(--text-muted);">This roadmap is currently locked. Complete previous courses sequentially to unlock this module!</p>
        <a href="#dashboard" class="btn-neon" style="text-decoration: none;">RETURN TO ROADMAPS</a>
      </div>
    `;
  }
  
  // Ensure we map completed level IDs safely to integers to prevent data type mismatch
  const completedLevels = user ? (user.completedLevels[courseId] || []).map(id => parseInt(id, 10)) : [];

  let standardCount = 0;
  const levelDisplays = {};
  course.levels.forEach((l) => {
    if (l.isMatchingMilestone) {
      levelDisplays[l.id] = 'CM';
    } else {
      standardCount++;
      levelDisplays[l.id] = standardCount;
    }
  });

  let pathHtml = `<div style="text-align: center; margin-bottom: 0.8rem; color: var(--text-muted); font-size: 0.95rem;">
    Completed <span class="text-gradient" style="font-weight: bold; font-size: 1.1rem;">${completedLevels.length}</span> out of <span style="color: var(--text-main); font-weight: bold;">${course.levels.length}</span> topics
  </div>`;
  
  // High usability: Scroll arrows directly enclosing the progress list so levels are never forgotten or hidden!
  pathHtml += `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; gap: 10px; margin-bottom: 2rem;">
      <button id="path-scroll-left" class="btn-neon" style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: transparent; padding: 0; cursor: pointer; border-color: var(--cyan); color: var(--cyan); transition: all 0.2s;" title="Scroll Left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <div class="path-preview" id="quest-path-preview" style="display:flex; justify-content: flex-start; align-items:center; gap: 12px; overflow-x: auto; padding: 12px 1.5rem; scroll-behavior: smooth; border-radius: 8px; background: var(--element-bg); border: 1px solid var(--element-border); box-sizing: border-box; flex-grow: 1; -webkit-overflow-scrolling: touch;">
  `;
  
  course.levels.forEach(l => {
    const isCurrent = l.id === currentLvlNum;
    const isCompleted = completedLevels.includes(l.id);
    const isUnlocked = isCompleted || l.id === completedLevels.length + 1;
    
    let borderColor = isCurrent ? 'var(--cyan)' : (isCompleted ? 'var(--purple)' : 'var(--element-border)');
    let bgColor = isCompleted ? 'var(--node-bg-completed)' : (isCurrent ? 'var(--node-bg-current)' : 'var(--node-bg-locked)');
    let textColor = isCurrent ? 'var(--cyan)' : (isCompleted ? 'var(--purple)' : 'var(--text-muted)');
    
    let nodeHtml = `
      <div ${isCurrent ? 'id="quest-node-current"' : ''} style="width: 36px; min-width: 36px; height: 36px; border-radius: 50%; display: flex; align-items:center; justify-content:center; border: 2px solid ${borderColor}; background: ${bgColor}; color: ${textColor}; font-weight: bold; font-size: 0.95rem; transition: transform 0.2s; flex-shrink: 0; box-shadow: ${isCurrent ? '0 0 8px var(--cyan-glow)' : 'none'}; cursor: pointer;" title="${l.title}" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${isCompleted && !isCurrent ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : levelDisplays[l.id]}
      </div>`;
      
    if (isUnlocked) {
      pathHtml += `<a href="#quest/${courseId}/${l.id}" style="text-decoration:none; color:inherit; flex-shrink:0;">${nodeHtml}</a>`;
    } else {
      pathHtml += nodeHtml;
    }
    
    if (l.id !== course.levels[course.levels.length-1].id) {
       pathHtml += `
      <div style="position: relative; width: 32px; height: 2px; flex-shrink: 0; display: flex; align-items: center;">
        <svg width="32" height="2" style="position: absolute; top: 0; left: 0;">
          <line x1="0" y1="0" x2="32" y2="0" stroke="var(--element-border)" stroke-width="2" />
          ${isCompleted ? `<line x1="0" y1="0" x2="32" y2="0" stroke="var(--purple)" stroke-width="2" class="path-line-anim" style="filter: drop-shadow(0 0 4px var(--purple));" />` : ''}
        </svg>
      </div>`;
    }
  });
  
  pathHtml += `
      </div>

      <button id="path-scroll-right" class="btn-neon" style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: transparent; padding: 0; cursor: pointer; border-color: var(--cyan); color: var(--cyan); transition: all 0.2s;" title="Scroll Right">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
  `;

  let altCodeHtml = '';
  if (lvl.altCode) {
    altCodeHtml = `
      <div style="margin-top: 20px; border-top: 1px solid var(--element-border); padding-top: 15px; text-align: center;">
        <button id="toggle-alt-code" class="btn-neon" style="font-size: 0.9rem; padding: 10px 20px; border-color: var(--purple); color: var(--purple); box-shadow: 0 0 10px rgba(176, 38, 255, 0.2); background: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          We can also write code like this (Click)
        </button>
        <div id="alt-code-display" class="code-display" style="display: none; margin-top: 15px; border-color: var(--purple-glow); text-align: left; font-family: var(--font-mono); font-size: 0.85rem; padding: 12px; background: var(--code-bg); border-radius: 6px; border-left: 3px solid var(--purple);">
          <pre style="margin: 0; white-space: pre-wrap;"><code>${lvl.altCode}</code></pre>
        </div>
      </div>
    `;
  }
  
  let optionsHtml = '';
  lvl.options.forEach((opt, idx) => {
    optionsHtml += `<button class="quiz-option" data-idx="${idx}">${opt}</button>`;
  });
  
  // Custom Dynamic CSS theme variables injection block
  const styleInjectedTheme = getCourseThemeStyle(courseId);
  const isFirstLevel = currentLvlNum === 1;
  const isLastLevel = currentLvlNum === course.levels.length;
  
  // Render clean structured logic with "Mr. Roboto" audio voice buttons
  return `
    <style>
      ${styleInjectedTheme}
      
      /* High fidelity wave equalizer active animation */
      @keyframes eqWave {
        0% { transform: scaleY(0.3); }
        100% { transform: scaleY(1); }
      }
      
      /* Webkit Custom Scrollbar track styling for path-preview */
      #quest-path-preview::-webkit-scrollbar {
        height: 6px;
      }
      #quest-path-preview::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 10px;
      }
      #quest-path-preview::-webkit-scrollbar-thumb {
        background: var(--cyan);
        border-radius: 10px;
        opacity: 0.4;
      }
      
      .story-panel {
        position: relative;
        overflow: hidden;
      }
      
      .tts-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        font-size: 0.85rem;
        font-weight: 600;
        border-radius: 30px;
        border: 1.5px solid var(--cyan);
        background: var(--element-bg);
        color: var(--cyan);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        flex-shrink: 0;
      }
      .tts-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--cyan-glow);
        border-color: var(--cyan);
      }
      .tts-button:active {
        transform: translateY(1px);
      }
    </style>
    
    <div class="quest-container slide-up">
      <div class="quest-header">
        <a href="#dashboard" style="color: var(--cyan); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">&larr; Back to Home</a>
        <div style="display:flex; gap: 12px; align-items:center;">
          <button id="view-path-btn-quest" class="btn-neon" style="padding: 6px 12px; font-size: 0.85rem; border-color: var(--cyan); color: var(--cyan); background: transparent;">Learning Path</button>
          <div class="stats-badge sparks-badge-themed" id="hdr-sparks-badge" style="font-size: 0.85rem; padding: 6px 12px; display: inline-flex; align-items: center; gap: 4px; transition: transform 0.2s ease;">
            ✨ Sparks: <span id="hdr-sparks-val">${user.skillSparks || 0}</span>
          </div>
          ${lvl.isMatchingMilestone ? `
            <div class="stats-badge cyan" style="border: 1px solid var(--cyan); background: var(--element-bg); color: var(--cyan); font-size: 0.85rem; padding: 6px 12px;">Concept Matcher</div>
          ` : `
            <div class="stats-badge cyan" style="border: 1px solid var(--cyan); background: var(--element-bg); color: var(--cyan); font-size: 0.85rem; padding: 6px 12px;">Level ${levelDisplays[lvl.id]}</div>
          `}
          <button id="theme-toggle-btn-quest" style="background:transparent; border:none; color: var(--cyan); cursor:pointer; font-size: 1.2rem; display: flex; align-items: center;" title="Toggle Theme">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>
        </div>
      </div>
      
      ${pathHtml}
      
      ${lvl.isMatchingMilestone ? `
        <div class="glass-panel" style="padding: 1.5rem 1.75rem; margin-bottom: 1.5rem; text-align: center; border-color: rgba(0, 243, 255, 0.2); background: rgba(13, 17, 28, 0.3); box-shadow: 0 0 15px rgba(0, 243, 255, 0.05);">
          <h2 class="text-gradient" style="margin: 0 0 6px 0; font-size: 2rem; font-weight: 800; letter-spacing: 0.5px; text-shadow: 0 0 10px rgba(0, 243, 255, 0.15);">Concept Matcher</h2>
          <p style="margin: 0; font-size: 1.05rem; color: var(--text-muted); font-weight: 500;">Match each concept with its correct meaning.</p>
        </div>
      ` : `
        <div class="glass-panel story-panel">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 1.2rem; border-bottom: 1px dashed var(--element-border); padding-bottom: 12px;">
            <h2 class="text-gradient" id="story-title" style="margin: 0; font-size: 1.8rem;">${lvl.title}</h2>
            
            <!-- High accessibility Click-To-Listen "Mr. Roboto" voice trigger -->
            <button id="mr-roboto-tts-btn" class="tts-button" title="Listen to Mr. Roboto!">
              <span style="display: inline-flex; align-items: center; justify-content: center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </span>
              <span id="tts-btn-text">Listen to Mr. Roboto</span>
              <span class="equalizer-wave" id="tts-equalizer" style="display: none; align-items: center; gap: 2.5px; height: 12px; margin-left: 2px;">
                <span style="width: 2.5px; height: 100%; background: var(--bg-dark); border-radius: 1px; animation: eqWave .6s ease-in-out infinite alternate; display: inline-block;"></span>
                <span style="width: 2.5px; height: 60%; background: var(--bg-dark); border-radius: 1px; animation: eqWave .4s ease-in-out infinite alternate; animation-delay: .15s; display: inline-block;"></span>
                <span style="width: 2.5px; height: 85%; background: var(--bg-dark); border-radius: 1px; animation: eqWave .5s ease-in-out infinite alternate; animation-delay: .3s; display: inline-block;"></span>
              </span>
            </button>
          </div>
          
          <div class="story-analogy" style="margin-top: 5px; margin-bottom: 5px;">
            <div>
              <div style="font-size: 0.85rem; font-weight: bold; text-transform: uppercase; color: var(--cyan); letter-spacing: 1px; margin-bottom: 4px;">Let's Imagine</div>
              <p id="story-tts-text" style="margin: 0; font-size: 1.05rem; line-height: 1.6; font-weight: 500;">${lvl.analogy}</p>
            </div>
          </div>
        </div>
      `}
      
      ${lvl.isMatchingMilestone ? '' : `<div class="code-display" id="code-snippet" style="font-family: var(--font-mono); font-size: 0.92rem; border-left: 4px solid var(--cyan); background: var(--code-bg); color: var(--code-color);">${lvl.code}</div>`}
      
      <div class="glass-panel quiz-panel">
        ${renderChallengeBody(courseId, levelId, lvl)}
        
        ${altCodeHtml}
      </div>
      
      <!-- Arrange the previous level button and next level button directly. Correct level 1 previous error. -->
      <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 1.8rem; margin-bottom: 1rem; width: 100%;">
        ${!isFirstLevel ? `
        <button id="quest-prev-btn" class="btn-neon" style="padding: 10px 20px; font-size: 0.9rem; border-color: var(--element-border); background: transparent; color: var(--text-muted); display: inline-flex; align-items: center; gap: 8px; flex: 1; justify-content: center; max-width: 200px;">
          &larr; Previous Level
        </button>` : ''}
        ${!isLastLevel ? `
        <button id="quest-next-btn" class="btn-neon" style="padding: 10px 20px; font-size: 0.9rem; border-color: var(--cyan); background: transparent; color: var(--cyan); display: inline-flex; align-items: center; gap: 8px; flex: 1; justify-content: center; max-width: 200px;">
          Next Level &rarr;
        </button>` : ''}
      </div>
    </div>
    
    <!-- Success Overlay structure -->
    <div id="celebration-overlay" class="celebration-overlay">
      <div class="celebration-content">
        <h2>LEVEL CLEARED!</h2>
        <div class="spark-reward">
          +10 reward ✨ Sparks 
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
          <button id="retake-level-btn" class="btn-neon" style="font-size: 1.2rem; padding: 15px 30px; background: transparent; border-color: var(--purple); box-shadow: 0 0 15px rgba(176, 38, 255, 0.3);">Retake Quiz</button>
          <button id="next-level-btn" class="btn-neon" style="font-size: 1.2rem; padding: 15px 30px;">Continue Journey</button>
        </div>
      </div>
    </div>
    
    <!-- Learning Path Modal Drawer -->
    <div id="learning-path-modal" class="celebration-overlay" style="align-items: flex-start; padding-top: 50px;">
      <div class="glass-panel" style="width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; text-align: left; position: relative; display: flex; flex-direction: column;">
        <button id="close-path-modal" style="position: absolute; right: 20px; top: 20px; background: transparent; border: none; color: var(--text-main); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <h2 class="text-gradient" style="margin-bottom: 5px; font-size: 1.8rem;">Learning Path</h2>
        <div style="margin-bottom: 20px; color: var(--text-muted); font-size: 0.9rem;">
          Completed <span style="color: var(--cyan); font-weight: bold;">${completedLevels.length}</span> out of ${course.levels.length} topics
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px; flex: 1;">
          ${course.levels.map(l => {
            const isCompleted = completedLevels.includes(l.id);
            const isCurrent = l.id === currentLvlNum;
            const isUnlocked = isCompleted || l.id === completedLevels.length + 1;
            const liColor = isCurrent ? 'var(--cyan)' : (isCompleted ? 'var(--purple)' : 'var(--text-muted)');
            
            return `
              <div class="learning-path-row" style="padding: 15px; border-radius: 8px; border: 1px solid var(--element-border); background: var(--element-bg); display: flex; align-items: flex-start; gap: 15px;">
                <div class="learning-path-row-left" style="min-width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isCompleted ? 'var(--purple-glow)' : (isCurrent ? 'var(--cyan-glow)' : 'transparent')}; border: 1px solid ${liColor}; color: ${liColor}; font-weight: bold; margin-top: 5px; font-size: 0.75rem;">
                   ${isCompleted ? 'Done' : l.id}
                </div>
                <div class="learning-path-row-center" style="flex: 1;">
                   <h4 style="margin: 0 0 5px; color: ${isUnlocked ? 'var(--text-main)' : 'var(--text-muted)'}; font-size: 1.1rem; font-family: inherit;">${l.title}</h4>
                   <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; font-family: inherit;">${l.story.substring(0, 100)}...</p>
                </div>
                <div class="learning-path-row-right" style="margin-left: auto; align-self: center;">
                  ${isUnlocked ? `<a href="#quest/${courseId}/${l.id}" class="btn-neon" style="padding: 6px 12px; font-size: 0.85rem; text-decoration: none; border-color: ${isCurrent ? 'var(--cyan)' : 'var(--purple)'}; background: transparent; color: ${isCurrent ? 'var(--cyan)' : 'var(--purple)'};">${isCurrent ? 'Current' : (isCompleted ? 'Review' : 'Start')}</a>` : `<span style="font-size: 0.85rem; color: var(--text-muted); padding: 6px 12px; border: 1px solid var(--element-border); border-radius: 6px; display: inline-block;">Locked</span>`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function mountQuest(courseId, levelId) {
  const currentLvlNum = parseInt(levelId, 10);
  const course = getCourseData(courseId);
  const baseLvl = getLevelData(courseId, currentLvlNum);
  const lvl = getStandardizedLevel(courseId, baseLvl);
  if (!lvl) return;
  
  // Custom scrolling scrollIntoView behavior to keep currently active node centered in scroll viewport
  setTimeout(() => {
    const currentNode = document.getElementById('quest-node-current');
    if (currentNode) {
      currentNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 180);
  
  // Custom mentor message per level type
  setTimeout(() => {
    showMentorMessage("Welcome! Click 'Listen to Mr. Roboto' to hear the lesson read aloud!", 5000);
  }, 800);
  
  // Handcrafted scroll left and right button navigation
  const scrollerLeftBtn = document.getElementById('path-scroll-left');
  const scrollerRightBtn = document.getElementById('path-scroll-right');
  const pathScrollerTrack = document.getElementById('quest-path-preview');
  
  if (scrollerLeftBtn && scrollerRightBtn && pathScrollerTrack) {
    scrollerLeftBtn.onclick = () => {
      pathScrollerTrack.scrollBy({ left: -200, behavior: 'smooth' });
    };
    scrollerRightBtn.onclick = () => {
      pathScrollerTrack.scrollBy({ left: 200, behavior: 'smooth' });
    };
  }

  // Mr. Roboto text to speech player feature
  const ttsBtn = document.getElementById('mr-roboto-tts-btn');
  if (ttsBtn) {
    ttsBtn.onclick = () => {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setTTSVisualState(false);
          return;
        }
        
        const storyText = document.getElementById('story-tts-text')?.innerText || '';
        const titleText = document.getElementById('story-title')?.innerText || '';
        const analogyText = lvl.analogy || '';
        
        // Clean speaking structure welcoming beginners and reading slowly; explicitly instructs the user to think on their own with stories
        const speakScript = `Hello! I am Mr. Roboto, your friendly guide. Today we learn about ${titleText}. Let me explain using a simple, common, everyday life story: ${storyText}. Let's imagine: ${analogyText}. I will not tell you the answer directly because I want you to think code like a real developer on your own! But here is a friendly hint: think carefully about the story and how it maps to the code. Believe in yourself, choose your answer below, and let's solve this on our own!`;
        
        const utterance = new SpeechSynthesisUtterance(speakScript);
        
        // Pick an English speaking voice
        const voices = window.speechSynthesis.getVoices();
        const voiceEN = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) 
                    || voices.find(v => v.lang.startsWith('en'))
                    || voices[0];
                    
        if (voiceEN) {
          utterance.voice = voiceEN;
        }
        
        utterance.rate = 0.90;  // Gentle, slower rate for excellent listening comprehension
        utterance.pitch = 1.05; // Friendly clear tone
        
        utterance.onstart = () => {
          setTTSVisualState(true);
        };
        
        utterance.onend = () => {
          setTTSVisualState(false);
        };
        
        utterance.onerror = () => {
          setTTSVisualState(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        showMentorMessage("Your browser doesn't support speech synthesis, but the story is written clearly above!", 4000);
      }
    };
  }
  
  function setTTSVisualState(isSpeaking) {
    const btn = document.getElementById('mr-roboto-tts-btn');
    const txt = document.getElementById('tts-btn-text');
    const eq = document.getElementById('tts-equalizer');
    if (!btn || !txt || !eq) return;
    
    if (isSpeaking) {
      btn.style.background = 'var(--cyan)';
      btn.style.color = '#000000';
      btn.style.boxShadow = '0 0 12px var(--cyan-glow)';
      txt.innerText = 'Pause Mr. Roboto';
      eq.style.display = 'inline-flex';
    } else {
      btn.style.background = 'var(--element-bg)';
      btn.style.color = 'var(--cyan)';
      btn.style.boxShadow = 'none';
      txt.innerText = 'Listen to Mr. Roboto';
      eq.style.display = 'none';
    }
  }

  // Cancel currently speaking synthesizer if user leaves the level quest page
  const leaveCleanup = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  window.addEventListener('hashchange', leaveCleanup, { once: true });
  
  const challengeType = getChallengeType(courseId, currentLvlNum);
  
  const toggleBtn = document.getElementById('toggle-alt-code');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const altCodeDisp = document.getElementById('alt-code-display');
      if (altCodeDisp.style.display === 'none') {
        altCodeDisp.style.display = 'block';
        toggleBtn.innerHTML = 'Hide alternative code';
        toggleBtn.style.background = 'var(--purple)';
        toggleBtn.style.color = '#000';
      } else {
        altCodeDisp.style.display = 'none';
        toggleBtn.innerHTML = 'We can also write code like this (Click)';
        toggleBtn.style.background = 'transparent';
        toggleBtn.style.color = 'var(--text-main)';
      }
    });
  }

  if (challengeType === 'matching') {
    const leftBtns = document.querySelectorAll('.match-btn-left');
    const rightBtns = document.querySelectorAll('.match-btn-right');
    const pairs = lvl.pairs || getMatchingData(courseId, lvl.originalId || currentLvlNum);
    const feedbackBar = document.getElementById('matching-feedback-bar');
    
    let activeConcept = null;
    let activeConceptElem = null;
    let matchedPairsCount = 0;
    
    leftBtns.forEach(btn => {
      btn.onclick = function() {
        if (this.style.pointerEvents === 'none') return;
        
        leftBtns.forEach(b => {
          if (b.style.pointerEvents !== 'none') {
            b.style.borderColor = '';
            b.style.background = '';
            b.querySelector('.match-status-badge').innerText = 'Unlinked';
            b.querySelector('.match-status-badge').style.color = 'var(--text-muted)';
          }
        });
        
        activeConcept = this.getAttribute('data-concept');
        activeConceptElem = this;
        
        this.style.borderColor = 'var(--cyan)';
        this.style.background = 'rgba(0, 243, 255, 0.12)';
        this.querySelector('.match-status-badge').innerText = 'Linking...';
        this.querySelector('.match-status-badge').style.color = 'var(--cyan)';
        
        if (feedbackBar) {
          feedbackBar.style.display = 'block';
          feedbackBar.style.color = 'var(--cyan)';
          feedbackBar.innerHTML = `<strong>Selected "${activeConcept}"</strong>. Click the matching definition on the right!`;
        }
      };
    });
    
    rightBtns.forEach(btn => {
      btn.onclick = function() {
        if (this.style.pointerEvents === 'none') return;
        
        if (!activeConcept) {
          showMentorMessage("Think carefully! Select a concept from the left list first.", 4000);
          return;
        }
        
        const meaning = this.getAttribute('data-meaning');
        const expectedPair = pairs.find(p => p.concept === activeConcept);
        
        if (expectedPair && expectedPair.meaning === meaning) {
          matchedPairsCount++;
          
          if (feedbackBar) {
            feedbackBar.style.display = 'block';
            feedbackBar.style.color = '#00FF88';
            feedbackBar.innerHTML = `Matched <strong>${activeConcept}</strong> with its definition successfully!`;
          }
          
          showMentorMessage("Brilliant! Perfect alignment.", 4000);
          
          activeConceptElem.style.borderColor = '#00ff88';
          activeConceptElem.style.background = 'rgba(0, 255, 136, 0.15)';
          activeConceptElem.style.color = '#00ff88';
          activeConceptElem.style.pointerEvents = 'none';
          const badge = activeConceptElem.querySelector('.match-status-badge');
          if (badge) {
            badge.innerText = 'Connected';
            badge.style.color = '#00ff88';
            badge.style.fontWeight = 'bold';
          }
          
          this.style.borderColor = '#00ff88';
          this.style.background = 'rgba(0, 255, 136, 0.15)';
          this.style.color = '#00ff88';
          this.style.pointerEvents = 'none';
          
          activeConcept = null;
          activeConceptElem = null;
          
          if (matchedPairsCount === pairs.length) {
            triggerQuestSuccess(courseId, currentLvlNum, lvl, course);
          }
        } else {
          // Deduct -3 Sparks on incorrect pairing error!
          adjustSkillSparks(-3, 'Incorrect Matching Pairing', this);
          
          const prefix = getMotivationalPrefix();
          const hint = `Try to align ${activeConcept} with the concept that ${expectedPair ? expectedPair.meaning.toLowerCase() : 'makes sense'}.`;
          
          if (feedbackBar) {
            feedbackBar.style.display = 'block';
            feedbackBar.style.color = '#FF3366';
            feedbackBar.innerHTML = `Incorrect pairing. Hint: ${hint}`;
          }
          
          showMentorMessage(`❌ Incorrect Match. Why it's incorrect: Pairs must share syntactical relationships. Here's a tip: ${hint} (-3 Sparks used for retry. Keep learning.)`, 8500);
          
          this.style.borderColor = '#ff3366';
          this.style.background = 'rgba(255, 51, 102, 0.15)';
          setTimeout(() => {
            if (this.style.pointerEvents !== 'none') {
              this.style.borderColor = '';
              this.style.background = '';
            }
          }, 1500);
          
          if (activeConceptElem) {
            activeConceptElem.style.borderColor = '';
            activeConceptElem.style.background = '';
            const b = activeConceptElem.querySelector('.match-status-badge');
            if (b) b.innerText = 'Unlinked';
          }
          
          activeConcept = null;
          activeConceptElem = null;
        }
      };
    });
  } else if (challengeType === 'arrange') {
    const listContainer = document.getElementById('arrange-items-list');
    const verifyBtn = document.getElementById('verify-arrange-btn');
    const feedbackBar = document.getElementById('arrange-feedback-bar');
    
    const originalLines = lvl.code.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'));
      
    const swapElements = (idx1, idx2) => {
      if (idx1 < 0 || idx2 < 0 || idx1 >= window.currentArrangeCodeLines.length || idx2 >= window.currentArrangeCodeLines.length) {
        return;
      }
      
      // Swap in our tracking array
      const temp = window.currentArrangeCodeLines[idx1];
      window.currentArrangeCodeLines[idx1] = window.currentArrangeCodeLines[idx2];
      window.currentArrangeCodeLines[idx2] = temp;
      
      // Swap the elements directly in the DOM
      const items = Array.from(listContainer.children);
      const node1 = items[idx1];
      const node2 = items[idx2];
      
      if (idx1 < idx2) {
        listContainer.insertBefore(node2, node1);
      } else {
        listContainer.insertBefore(node1, node2);
      }
      
      // Update attributes and index numbers for all elements
      const updatedItems = Array.from(listContainer.children);
      updatedItems.forEach((item, index) => {
        item.setAttribute('data-idx', index);
        
        // Update index number display text
        const numberSpan = item.querySelector('span');
        if (numberSpan) {
          numberSpan.innerText = index + 1;
        }
      });
    };
    
    const bindArrangeEvents = () => {
      listContainer.onclick = function(e) {
        const upBtn = e.target.closest('.arrange-up-btn');
        const downBtn = e.target.closest('.arrange-down-btn');
        
        if (upBtn) {
          e.preventDefault();
          const item = upBtn.closest('.arrange-item');
          if (item) {
            const idx = parseInt(item.getAttribute('data-idx'), 10);
            if (idx > 0) {
              swapElements(idx - 1, idx);
            }
          }
        } else if (downBtn) {
          e.preventDefault();
          const item = downBtn.closest('.arrange-item');
          if (item) {
            const idx = parseInt(item.getAttribute('data-idx'), 10);
            if (idx < window.currentArrangeCodeLines.length - 1) {
              swapElements(idx, idx + 1);
            }
          }
        }
      };
    };
    
    // Bind the handlers initially so buttons work right out of the gate!
    bindArrangeEvents();
    
    verifyBtn.onclick = function() {
      const isCorrect = JSON.stringify(window.currentArrangeCodeLines) === JSON.stringify(originalLines);
      
      if (isCorrect) {
        if (feedbackBar) {
          feedbackBar.style.display = 'block';
          feedbackBar.style.color = '#00FF88';
          feedbackBar.style.background = 'rgba(0, 255, 136, 0.08)';
          feedbackBar.innerHTML = `Code structure is fully correct! Incredible logical understanding!`;
        }
        showMentorMessage(`🎉 Outstanding! You've arranged the logical flow of instructions perfectly. Why it is correct: ${lvl.successMsg || "Your arranged instructions list compiles perfectly down the logical flow!"}`, 8500);
        triggerQuestSuccess(courseId, currentLvlNum, lvl, course);
      } else {
        // Deduct -3 Sparks for incorrect code structure!
        adjustSkillSparks(-3, 'Incorrect Syntax Arrangement', verifyBtn);
        
        const prefix = getMotivationalPrefix();
        const hint = `Check if function/class declarations go above printing outputs. Make sure logic statement sequence matches!`;
        
        if (feedbackBar) {
          feedbackBar.style.display = 'block';
          feedbackBar.style.color = '#FF3366';
          feedbackBar.style.background = 'rgba(255, 51, 102, 0.08)';
          feedbackBar.innerHTML = `Structure is not quite right yet. Hint: ${lvl.errorMsg || hint}`;
        }
        showMentorMessage(`❌ Structure is not correct yet. Why it is incorrect: ${lvl.errorMsg || hint} (-3 Sparks used for retry. Keep learning.)`, 8500);
      }
    };
  } else {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.onclick = function() {
        if (document.querySelector('.quiz-option.correct')) return;
        
        const selectedIdx = parseInt(this.getAttribute('data-idx'), 10);
        
        if (selectedIdx === lvl.answerIndex) {
          this.classList.add('correct');
          // Success Feedback
          showMentorMessage(`🎉 Correct choice! Why it is correct: ${lvl.successMsg || "That fits the logic requirements of the topic!"}`, 8500);
          
          const hintBox = document.getElementById('quiz-hint-box');
          if (hintBox) hintBox.style.display = 'none';
          
          triggerQuestSuccess(courseId, currentLvlNum, lvl, course);
        } else {
          this.classList.add('incorrect');
          
          // Deduct -3 Sparks on incorrect answer choice!
          adjustSkillSparks(-3, 'Incorrect Quiz Option Choice', this);
          
          const hintBox = document.getElementById('quiz-hint-box');
          const hintText = document.getElementById('quiz-hint-text');
          
          const prefix = getMotivationalPrefix();
          const fullHint = `${prefix}<br><br>${lvl.errorMsg || "Look closely at the instructions and try again!"}`;
          
          if (hintBox && hintText) {
            hintText.innerHTML = fullHint;
            hintBox.style.display = 'block';
            hintBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          
          // Error feedback from Mentor
          showMentorMessage(`❌ Incorrect choice. Why it is incorrect: ${lvl.errorMsg || "Take a moment to carefully read the options and try once more!"} (-3 Sparks used for retry. Keep learning.)`, 8500);
          
          setTimeout(() => {
            this.classList.remove('incorrect');
          }, 2000);
        }
      };
    });
  }

  // Bind Bottom Prev/Next Navigation buttons
  const prevBtn = document.getElementById('quest-prev-btn');
  const nextBtn = document.getElementById('quest-next-btn');

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentLvlNum > 1) {
        window.location.hash = `#quest/${courseId}/${currentLvlNum - 1}`;
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const user = getCurrentUser();
      const completedLevels = user ? (user.completedLevels[courseId] || []).map(id => parseInt(id, 10)) : [];
      const hasSolvedNow = !!document.querySelector('.quiz-option.correct');
      const isCompleted = completedLevels.includes(currentLvlNum) || hasSolvedNow;
      const isNextUnlocked = isCompleted || currentLvlNum < completedLevels.length + 1;

      if (currentLvlNum < course.levels.length) {
        if (isNextUnlocked) {
          window.location.hash = `#quest/${courseId}/${currentLvlNum + 1}`;
        } else {
          showMentorMessage("Solve the current challenge to unlock the next level!", 4000);
        }
      }
    };
  }

  // Bind generic theme toggles
  const themeBtn = document.getElementById('theme-toggle-btn-quest');
  if (themeBtn) {
    themeBtn.onclick = () => {
      if (typeof window.toggleTheme === 'function') {
        window.toggleTheme();
      }
    };
  }

  // Bind modal triggers for learning roadmap path drawer
  const viewPathBtn = document.getElementById('view-path-btn-quest');
  const pathModal = document.getElementById('learning-path-modal');
  const closePathModal = document.getElementById('close-path-modal');

  if (viewPathBtn && pathModal && closePathModal) {
    viewPathBtn.onclick = () => {
      pathModal.classList.add('active');
      pathModal.style.pointerEvents = 'auto';
    };
    closePathModal.onclick = () => {
      pathModal.classList.remove('active');
      pathModal.style.pointerEvents = 'none';
    };
    // Close on clicking modal background overlay
    pathModal.onclick = (e) => {
      if (e.target === pathModal) {
        pathModal.classList.remove('active');
        pathModal.style.pointerEvents = 'none';
      }
    };
  }

  // Action Handler: Reveal Hint Capsule (-2 Sparks)
  const unlockHintBtn = document.getElementById('quest-unlock-hint-btn');
  if (unlockHintBtn) {
    unlockHintBtn.onclick = () => {
      const uObj = getCurrentUser();
      if (!uObj) return;

      const completedReqs = uObj.completedLevels[courseId] || [];
      const alreadySolved = completedReqs.map(id => parseInt(id,10)).includes(currentLvlNum);
      if (alreadySolved) {
        // Free display if level is already solved!
        const hintBox = document.getElementById('quiz-hint-box');
        const hintText = document.getElementById('quiz-hint-text');
        if (hintBox && hintText) {
          hintText.innerHTML = lvl.errorMsg || "Take your time and plan the layout segments correctly.";
          hintBox.style.display = 'block';
          hintBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showMentorMessage(`💡 Here is your hint: ${lvl.errorMsg || "Think carefully!"}`, 6000);
        return;
      }

      if ((uObj.skillSparks || 0) < 2) {
        showMentorMessage("⚠️ You need at least 2 Sparks to unlock this Hint Capsule! Keep learning to get more Sparks.", 6500);
        return;
      }

      // Deduct -2 Sparks!
      adjustSkillSparks(-2, 'Unlock Quiz Hint Capsule', unlockHintBtn);

      const hintBox = document.getElementById('quiz-hint-box');
      const hintText = document.getElementById('quiz-hint-text');
      if (hintBox && hintText) {
        hintText.innerHTML = `${lvl.errorMsg || "Look closely at the declarations sequence!"}`;
        hintBox.style.display = 'block';
        hintBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showMentorMessage(`💡 Clue unlocked! Here's your helper hint: ${lvl.errorMsg || "Look closely at the declarations sequence!"} (-2 Sparks used. Keep learning.)`, 9000);
    };
  }

  // Action Handler: Skip Challenge (-5 Sparks)
  const skipLevelBtn = document.getElementById('quest-skip-level-btn');
  if (skipLevelBtn) {
    skipLevelBtn.onclick = () => {
      const uObj = getCurrentUser();
      if (!uObj) return;

      const completedReqs = uObj.completedLevels[courseId] || [];
      const alreadySolved = completedReqs.map(id => parseInt(id,10)).includes(currentLvlNum);
      if (alreadySolved) {
        showMentorMessage("You have already completed this level! Use Next Level navigation instead.", 4000);
        return;
      }

      if ((uObj.skillSparks || 0) < 5) {
        showMentorMessage("⚠️ You need at least 5 Sparks to skip this challenge! Solve it on your own to make progress.", 6500);
        return;
      }

      // Deduct -5 Sparks!
      adjustSkillSparks(-5, 'Skip Challenge Milestone', skipLevelBtn);

      window.isSkipping = true;
      showMentorMessage(`⏭️ Challenge skipped! (-5 Sparks used for skip. Keep learning.)`, 7000);
      triggerQuestSuccess(courseId, currentLvlNum, lvl, course);
    };
  }
}
