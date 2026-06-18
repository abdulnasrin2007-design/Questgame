import { getCurrentUser, logoutUser, checkAndCelebrateStreak, claimDailySparksBonus, checkInToday, isCourseUnlocked, adjustSkillSparks, saveUser } from '../auth.js';
import { courses } from '../data/courses.js';
import { showMentorMessage } from '../components/Mentor.js';
import { showAchievementBadgeModal } from '../components/AchievementBadge.js';
import confetti from 'canvas-confetti';

export function renderDashboard() {
  const user = getCurrentUser();
  if(!user) return '';

  const todayStr = new Date().toDateString();
  const checkedDays = user.streakCheckedDays || [todayStr];
  const hasClaimedToday = user.lastClaimedSparks === todayStr;
  const currentStreak = user.streak || 1;

  const isZipSolved = localStorage.getItem(`brain_arena_solved_codezip_${todayStr}`) === 'true';
  const isSudokuSolved = localStorage.getItem(`brain_arena_solved_logicsudoku_${todayStr}`) === 'true';
  const isWordSolved = localStorage.getItem(`brain_arena_solved_wordlink_${todayStr}`) === 'true';
  const allSolved = isZipSolved && isSudokuSolved && isWordSolved;

  const getCompletedState = (id) => {
    const course = courses.find(c => c.id === id);
    if (!course) return false;
    const completedArr = user.completedLevels[id] || [];
    return course.levels.length > 0 && completedArr.length === course.levels.length;
  };

  const pythonCompleted = getCompletedState('python');
  const cCompleted = getCompletedState('c');
  const javaCompleted = getCompletedState('java');
  const javascriptCompleted = getCompletedState('javascript');
  const cppCompleted = getCompletedState('cpp');

  let html = `
    <div class="fade-in">
      <div class="dashboard-header">
        <div>
          <h1 class="text-gradient" id="dashboard-welcome-heading">Welcome, ${user.name}${user.prestigeTitle ? ` <span style="font-size: 1.1rem; color: var(--purple); font-weight: bold; background: rgba(176,38,255,0.12); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(176,38,255,0.25);">${user.prestigeTitle}</span>` : ''}</h1>
          <p style="color: var(--text-muted); margin-top: 5px;">Your Beginner Development Roadmap - Designed by Abdul Nasrin</p>
        </div>
        <div style="display:flex; gap: 15px; align-items:center;">
          <div class="stats-badge" id="hdr-sparks-badge">✨ Sparks: <span id="hdr-sparks-val">${user.skillSparks || 0}</span></div>
          <button id="theme-toggle-btn" style="background:transparent; border:none; color: var(--cyan); cursor:pointer; font-size: 1.2rem; display: flex; align-items: center;" title="Toggle Theme">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>
          <button id="logout-btn" class="btn-purple" style="padding: 8px 16px; border-radius: 6px; border:1px solid var(--purple); background:transparent; color: var(--text-main); cursor:pointer;">Log Out</button>
        </div>
      </div>

      <!-- Natural Game-Like Daily Streak Console (Compact & Modern) -->
      <div class="glass-panel streak-header-panel" style="padding: 1rem 1.5rem; border-color: rgba(255, 165, 0, 0.2); position: relative; overflow: hidden; margin-top: -1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap;">
        <div style="position: absolute; top: -50%; left: -20%; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255,165,0,0.06) 0%, transparent 70%); pointer-events: none;"></div>
        
        <div style="display: flex; align-items: center; gap: 15px;">
          <div>
            <div style="display: flex; align-items: baseline; gap: 6px; line-height: 1;">
              <span style="font-size: 1.8rem; font-weight: 800; color: #ff9f43; font-family: var(--font-code);" id="panel-streak-num">${currentStreak}</span>
              <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">Day Coding Streak</span>
            </div>
            <div style="font-size: 0.75rem; color: ${checkedDays.includes(todayStr) ? 'var(--success)' : '#ff9f43'}; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;" id="streak-status-lbl">
              ${checkedDays.includes(todayStr) 
                ? 'Streak Guard Secured - Checked in today' 
                : 'Streak Vulnerable - Buy Streak Freeze Shield or claim bonus to secure'}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.75rem;" title="Protects your streak if you miss check-in!">
            <span>🛡️</span>
            <span style="color: var(--cyan); font-weight: bold;">
              Shields Active: <span id="shield-count-disp" style="font-family: var(--font-code);">${user.streakShields || 0}</span>
            </span>
          </div>

          <button id="claim-sparks-btn" class="${hasClaimedToday ? 'btn-neon disabled' : 'btn-neon'}" 
                  style="${hasClaimedToday ? 'filter: brightness(0.6);' : ''} padding: 8px 16px; font-size: 0.8rem; display:flex; align-items:center; gap: 6px; border-radius: 20px; font-weight: bold;"
                  ${hasClaimedToday ? 'disabled' : ''}>
            <span>✨</span>
            <span id="claim-btn-text">${hasClaimedToday ? 'Daily Sparks Claimed ✓' : 'Claim Daily Sparks (+50)'}</span>
          </button>
        </div>
      </div>

      <!-- Interactive Sparks Shop & Badges Section -->
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-bottom: 2.5rem; max-width: 700px; margin-left: auto; margin-right: auto; width: 100%;">
        
        <!-- Streak Center Shop -->
        <div class="glass-panel" style="padding: 1rem; border-color: rgba(176, 38, 255, 0.25); display: flex; flex-direction: column; max-width: 320px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px dashed rgba(176, 38, 255, 0.15); padding-bottom: 6px;">
            <h3 style="margin: 0; font-size: 1rem; color: var(--purple); display: flex; align-items: center; gap: 6px; font-family: var(--font-sans); font-weight: 700;">
              <span>⚡ Streak Center</span>
            </h3>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: center;">
            <!-- Streak Shield Item -->
            <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--element-border); padding: 8px 10px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 0.8rem; color: var(--text-main); display: flex; align-items: center; gap: 4px; font-family: var(--font-sans); font-weight: 600;">Streak Shield</h4>
                <p style="margin: 2px 0 0 0; font-size: 0.65rem; color: var(--text-muted); line-height: 1.25; font-family: var(--font-sans);">Protects your streak if you miss a day.</p>
              </div>
              <button class="btn-neon shop-buy-btn" data-item="streak_shield" data-cost="150" style="padding: 4px 8px; font-size: 0.65rem; border-radius: 6px; white-space: nowrap; font-weight: bold; font-family: var(--font-sans);">
                Buy (150 ✨ Sparks)
              </button>
            </div>
          </div>
        </div>

        <!-- Course Completion Credentials & Badges (Skill Badges) -->
        <div class="glass-panel" style="padding: 1rem; border-color: rgba(0, 243, 255, 0.25); display: flex; flex-direction: column; max-width: 320px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px dashed rgba(0, 243, 255, 0.15); padding-bottom: 6px;">
            <h3 style="margin: 0; font-size: 1rem; color: var(--cyan); display: flex; align-items: center; gap: 6px; font-family: var(--font-sans); font-weight: 700;">
              <span>Skill Badges</span>
            </h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; flex: 1; align-content: center; justify-content: center;">
             <!-- Python Milestone -->
            <div id="skill-badge-python" class="skill-badge-item" style="padding: 6px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; transition: all 0.2s ease; ${
              pythonCompleted 
                ? 'border: 1px solid var(--success); box-shadow: 0 0 6px var(--success-glow); background: rgba(0, 255, 136, 0.05); cursor: pointer;' 
                : 'border: 1px dashed var(--element-border); opacity: 0.35; filter: grayscale(100%); cursor: help;'
            }" title="${pythonCompleted ? 'Click to generate and view your Python Achievement Badge! 🏅' : 'Complete Python course to earn this badge!'}">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python logo" style="width: 18px; height: 18px; display: block;" />
              <div style="font-family: var(--font-sans); min-width: 0;">
                <div style="font-weight: 600; font-size: 0.7rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Python</div>
                <div style="font-size: 0.55rem; color: ${pythonCompleted ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${pythonCompleted ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>

            <!-- C Milestone -->
            <div id="skill-badge-c" class="skill-badge-item" style="padding: 6px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; transition: all 0.2s ease; ${
              cCompleted 
                ? 'border: 1px solid var(--success); box-shadow: 0 0 6px var(--success-glow); background: rgba(0, 255, 136, 0.05); cursor: pointer;' 
                : 'border: 1px dashed var(--element-border); opacity: 0.35; filter: grayscale(100%); cursor: help;'
            }" title="${cCompleted ? 'Click to generate and view your C Achievement Badge! 🏅' : 'Complete C course to earn this badge!'}">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" alt="C logo" style="width: 18px; height: 18px; display: block;" />
              <div style="font-family: var(--font-sans); min-width: 0;">
                <div style="font-weight: 600; font-size: 0.7rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">C</div>
                <div style="font-size: 0.55rem; color: ${cCompleted ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${cCompleted ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>

            <!-- Java Milestone -->
            <div id="skill-badge-java" class="skill-badge-item" style="padding: 6px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; transition: all 0.2s ease; ${
              javaCompleted 
                ? 'border: 1px solid var(--success); box-shadow: 0 0 6px var(--success-glow); background: rgba(0, 255, 136, 0.05); cursor: pointer;' 
                : 'border: 1px dashed var(--element-border); opacity: 0.35; filter: grayscale(100%); cursor: help;'
            }" title="${javaCompleted ? 'Click to generate and view your Java Achievement Badge! 🏅' : 'Complete Java course to earn this badge!'}">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java logo" style="width: 18px; height: 18px; display: block;" />
              <div style="font-family: var(--font-sans); min-width: 0;">
                <div style="font-weight: 600; font-size: 0.7rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Java</div>
                <div style="font-size: 0.55rem; color: ${javaCompleted ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${javaCompleted ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>

            <!-- JavaScript Milestone -->
            <div id="skill-badge-javascript" class="skill-badge-item" style="padding: 6px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; transition: all 0.2s ease; ${
              javascriptCompleted 
                ? 'border: 1px solid var(--success); box-shadow: 0 0 6px var(--success-glow); background: rgba(0, 255, 136, 0.05); cursor: pointer;' 
                : 'border: 1px dashed var(--element-border); opacity: 0.35; filter: grayscale(100%); cursor: help;'
            }" title="${javascriptCompleted ? 'Click to generate and view your JavaScript Achievement Badge! 🏅' : 'Complete JavaScript course to earn this badge!'}">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript logo" style="width: 18px; height: 18px; display: block;" />
              <div style="font-family: var(--font-sans); min-width: 0;">
                <div style="font-weight: 600; font-size: 0.7rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">JavaScript</div>
                <div style="font-size: 0.55rem; color: ${javascriptCompleted ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${javascriptCompleted ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>

            <!-- C++ Milestone -->
            <div id="skill-badge-cpp" class="skill-badge-item" style="padding: 6px 8px; border-radius: 8px; display: flex; align-items: center; gap: 8px; box-sizing: border-box; transition: all 0.2s ease; ${
              cppCompleted 
                ? 'border: 1px solid var(--success); box-shadow: 0 0 6px var(--success-glow); background: rgba(0, 255, 136, 0.05); cursor: pointer;' 
                : 'border: 1px dashed var(--element-border); opacity: 0.35; filter: grayscale(100%); cursor: help;'
            }" title="${cppCompleted ? 'Click to generate and view your C++ Achievement Badge! 🏅' : 'Complete C++ course to earn this badge!'}">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" alt="C++ logo" style="width: 18px; height: 18px; display: block;" />
              <div style="font-family: var(--font-sans); min-width: 0;">
                <div style="font-weight: 600; font-size: 0.7rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">C++</div>
                <div style="font-size: 0.55rem; color: ${cppCompleted ? 'var(--success)' : 'var(--text-muted)'}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">
                  ${cppCompleted ? 'Earned' : 'Locked'}
                </div>
              </div>
            </div>         </div>
          </div>
        </div>
      </div>


      <!-- Practice Arena Entrance Banner -->
      <div class="glass-panel slide-up" style="margin-top: -1rem; margin-bottom: 2rem; padding: 1.5rem; border-color: rgba(0, 243, 255, 0.3); background: linear-gradient(135deg, rgba(0, 243, 255, 0.04) 0%, rgba(176, 38, 255, 0.04) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 0 15px rgba(0,0,0,0.25);">
        <div style="flex: 1; min-width: 250px;">
          <h2 style="margin: 0; font-size: 1.3rem; font-weight: bold; color: var(--cyan); text-shadow: 0 0 10px var(--cyan-glow); font-family: var(--font-sans); display: flex; align-items: center; gap: 8px;">
            <span>⚔️ Practice Arena</span>
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 0.9rem; color: var(--text-main); line-height: 1.5; font-family: var(--font-sans); opacity: 0.95;">
            Hone your core programming structural skills visually! Reorder shuffled syntax puzzle blocks for Python, JavaScript, C, Java, and C++ to build logical ordering skills fear-free.
          </p>
        </div>
        <div>
          <a href="#practice-arena" class="btn-neon" style="display: inline-block; padding: 10px 20px; font-size: 0.85rem; text-decoration: none; font-weight: bold; font-family: var(--font-sans); box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); border-color: var(--cyan);">
            Enter Practice Arena
          </a>
        </div>
      </div>
      
      <div class="roadmap-grid">
  `;

  // Render course cards
  courses.forEach(course => {
    const isUnlocked = isCourseUnlocked(user, course.id);
    const completedArr = user.completedLevels[course.id] || [];
    const totalLevels = course.levels.length;
    const progressPct = totalLevels > 0 ? Math.round((completedArr.length / totalLevels) * 100) : 0;
    
    let lockButtonText = 'Locked';
    if (course.id === 'c') lockButtonText = 'Locked: Complete Python First';
    else if (course.id === 'javascript') lockButtonText = 'Locked: Complete C Language First';
    else if (course.id === 'java') lockButtonText = 'Locked: Complete JavaScript First';
    else if (course.id === 'cpp') lockButtonText = 'Locked: Complete Java First';
    
    html += `
      <div class="glass-panel course-card course-card-${course.id} ${!isUnlocked ? 'locked' : 'slide-up'}" style="${!isUnlocked ? 'opacity: 0.5; filter: grayscale(1);' : ''}">
        <div class="course-icon">${course.icon}</div>
        <h2 class="course-title">${course.title}</h2>
        <p class="course-desc">${course.description}</p>
        
        <div class="course-meta">
          <span>${course.difficulty}</span>
        </div>
        
        <div style="margin-top: auto;">
          <div style="display:flex; justify-content: space-between; font-size: 0.8rem; margin-top: 15px;">
            <span>Progress</span>
            <span class="text-gradient">${completedArr.length}/${totalLevels} (${progressPct}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPct}%"></div>
          </div>
          
          <div style="margin-top: 15px; display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
            ${(() => {
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
              
              return course.levels.map((lvl) => {
                const isLvlCompleted = completedArr.includes(lvl.id);
                const isLvlUnlocked = isUnlocked && (isLvlCompleted || lvl.id === completedArr.length + 1);
                const bgColor = isLvlCompleted ? 'var(--purple-glow)' : 'transparent';
                const borderColor = isLvlCompleted ? 'var(--purple)' : (isLvlUnlocked ? 'var(--cyan)' : 'var(--element-border)');
                const textColor = isLvlCompleted ? 'var(--purple)' : (isLvlUnlocked ? 'var(--cyan)' : 'var(--text-muted)');
                return `
                  <a ${isLvlUnlocked ? `href="#quest/${course.id}/${lvl.id}"` : ''} 
                     style="width: 25px; height: 25px; border-radius: 50%; display: flex; align-items:center; justify-content:center; 
                            border: 1.5px solid ${borderColor}; background: ${bgColor}; color: ${textColor}; 
                            font-size: 0.75rem; font-weight: bold; text-decoration: none; 
                            ${!isLvlUnlocked ? 'cursor: not-allowed;' : ''}" 
                     title="${lvl.title}">
                    ${levelDisplays[lvl.id]}
                  </a>
                `;
              }).join('');
            })()}
          </div>
          
          <div style="margin-top: 20px; text-align:center;">
            ${isUnlocked 
              ? `<a href="#quest/${course.id}/${completedArr.length < totalLevels ? completedArr.length + 1 : 1}" class="btn-neon" style="display:inline-block; width:100%; text-decoration:none;">${completedArr.length === 0 ? 'Start Course' : (completedArr.length < totalLevels ? 'Resume Course' : 'Review Course')}</a>`
              : `<button class="btn-neon" disabled style="width:100%; filter: brightness(0.5); cursor:not-allowed;">${lockButtonText}</button>`
            }
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;
  return html;
}

export function mountDashboard() {
  setTimeout(() => {
    showMentorMessage("This is your learning dashboard. We highly recommend starting with Python to understand the logic first!", 6000);
  }, 1000);

  const celebratedStreak = checkAndCelebrateStreak();
  if (celebratedStreak) {
    // Wait a brief moment before firing confetti to ensure dashboard has rendered properly
    setTimeout(() => {
      // Fire confetti multiple times for a big celebration
      var duration = 3 * 1000;
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      showMentorMessage(`Incredible! You hit a ${celebratedStreak}-Day Coding Streak! Keep up the brilliant work!`, 8000);
    }, 500);
  }

  const claimSparksBtn = document.getElementById('claim-sparks-btn');
  if (claimSparksBtn) {
    claimSparksBtn.addEventListener('click', () => {
      const result = claimDailySparksBonus();
      if (result.success) {
        // Celebrate with confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Show tutor message
        showMentorMessage(`🎉 Spectacular! You claimed +50 Sparks! Daily check-in complete!`, 7000);
        
        // Dynamic update of components!
        const sparksHdrVal = document.getElementById('hdr-sparks-val');
        if (sparksHdrVal) sparksHdrVal.innerText = result.updatedSparks;
        
        const panelStreakVal = document.getElementById('panel-streak-num');
        if (panelStreakVal) {
          panelStreakVal.innerText = result.user.streak;
        }
        
        // Update claim button live state
        claimSparksBtn.classList.add('disabled');
        claimSparksBtn.disabled = true;
        claimSparksBtn.style.filter = 'brightness(0.6)';
        const btnText = document.getElementById('claim-btn-text');
        if (btnText) btnText.innerText = 'Daily Sparks Claimed ✓';

        const statusLbl = document.getElementById('streak-status-lbl');
        if (statusLbl) {
          statusLbl.innerHTML = '✓ Streak Guard Secured • Checked in today!';
          statusLbl.style.color = 'var(--success)';
        }
      } else {
        showMentorMessage(`${result.errorMessage || 'Already claimed today!'}`, 5000);
      }
    });
  }

  // Handle normal Sparks shop item purchases
  const buyButtons = document.querySelectorAll('.shop-buy-btn');
  buyButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.getAttribute('data-item');
      if (!itemId) return;
      const cost = parseInt(this.getAttribute('data-cost'));
      
      import('../auth.js').then(auth => {
        const res = auth.purchaseShopItem(itemId, cost);
        if (res.success) {
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 }
          });
          showMentorMessage(res.message, 6000);
          
          // Update sparks header counter
          const sparksHdrVal = document.getElementById('hdr-sparks-val');
          if (sparksHdrVal) sparksHdrVal.innerText = res.user.skillSparks;
          
          // Update shield count if streak shield bought
          if (itemId === 'streak_shield') {
            const shieldDisp = document.getElementById('shield-count-disp');
            if (shieldDisp) shieldDisp.innerText = res.user.streakShields;
          }
          
          // If bypass key bought, trigger full page/hash reload to re-render courses unlocked state!
          if (itemId === 'bypass_key') {
             setTimeout(() => {
               window.location.reload();
             }, 1500);
          }
        } else {
          showMentorMessage(`Purchase failed: ${res.error}`, 5000);
        }
      });
    });
  });

  // Handle prestige suffix title purchases
  const buyTitleBtn = document.getElementById('buy-title-btn');
  if (buyTitleBtn) {
    buyTitleBtn.addEventListener('click', () => {
      const selectEl = document.getElementById('title-suffix-selector');
      if (!selectEl) return;
      
      const selectedValue = selectEl.value; // e.g. "title_🧙‍♂️ Code Sorcerer"
      const cost = parseInt(buyTitleBtn.getAttribute('data-cost'));
      
      import('../auth.js').then(auth => {
        const res = auth.purchaseShopItem(selectedValue, cost);
        if (res.success) {
          confetti({
            particleCount: 80,
            spread: 40,
            origin: { y: 0.8 }
          });
          showMentorMessage(res.message, 6000);
          
          // Update sparks display
          const sparksHdrVal = document.getElementById('hdr-sparks-val');
          if (sparksHdrVal) sparksHdrVal.innerText = res.user.skillSparks;
          
          // Reload dashboard to render name suffix instantly
          setTimeout(() => {
            window.dispatchEvent(new Event('hashchange'));
          }, 1500);
        } else {
          showMentorMessage(`Purchase failed: ${res.error}`, 5000);
        }
      });
    });
  }

  // Bind click event listeners to the Skill Badges
  const courseIds = ['python', 'c', 'java', 'javascript', 'cpp'];
  courseIds.forEach(id => {
    const el = document.getElementById(`skill-badge-${id}`);
    if (el) {
      el.addEventListener('click', () => {
        const userObj = getCurrentUser();
        if (!userObj) return;
        const course = courses.find(c => c.id === id);
        if (!course) return;
        
        const completedLevels = userObj.completedLevels[id] || [];
        const isCompleted = course.levels.length > 0 && completedLevels.length === course.levels.length;
        
        if (isCompleted) {
          showAchievementBadgeModal(id);
        } else {
          showMentorMessage(`🔒 The ${course.title} credential badge is locked. Finish all ${course.levels.length} lessons in this roadmap to generate your certified Achievement Badge! 🚀`, 6000);
        }
      });
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
    });
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (typeof window.toggleTheme === 'function') {
        window.toggleTheme();
      }
    });
  }

  // Handle Brain Challenge launches
  const playChallengeBtns = document.querySelectorAll('.play-challenge-btn');
  playChallengeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const challengeId = this.getAttribute('data-id');
      if (challengeId) {
        startBrainChallenge(challengeId);
      }
    });
  });
}

export function startBrainChallenge(challengeId) {
  import('./BrainArena.js').then(m => {
    let mode = 'codezip';
    if (challengeId === 'connections' || challengeId === 'codezip') mode = 'codezip';
    else if (challengeId === 'logic-sudoku' || challengeId === 'logicsudoku') mode = 'logicsudoku';
    else if (challengeId === 'code-memory' || challengeId === 'wordlink') mode = 'wordlink';
    m.openBrainArenaModal(mode);
  });
}

export function openBrainArenaModal() {
  import('./BrainArena.js').then(m => {
    m.openBrainArenaModal();
  });
}

// Legacy fallback bypass variables
const fakeCloseModal = () => {};
const headerEl = null;
const bodyEl = null;
const feedbackEl = null;
const closeModal = fakeCloseModal;
const closeBtn = null;

if (false) {
  const card = { querySelector: () => null };
  const triggerChallengeWin = (id) => {
    // Confetti
    try {
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const curUser = getCurrentUser();
    const today = new Date().toDateString();

    if (!curUser.completedBrainChallenges) {
      curUser.completedBrainChallenges = {};
    }
    if (!curUser.completedBrainChallenges[today]) {
      curUser.completedBrainChallenges[today] = [];
    }

    const alreadySolved = curUser.completedBrainChallenges[today].includes(id);
    const rewardEl = card.querySelector('#challenge-reward-status');

    // Define messages per guidelines
    const brainChallengeMessages = [
      "Great thinking.",
      "Brain challenge complete.",
      "Nice work. Sparks earned."
    ];
    const pickedMsg = brainChallengeMessages[Math.floor(Math.random() * brainChallengeMessages.length)];

    if (!alreadySolved) {
      curUser.completedBrainChallenges[today].push(id);
      saveUser(curUser);
      
      // Update Sparks instantly with the smooth floating animation
      adjustSkillSparks(10, 'Daily brain challenge completed', card);
      
      // Show mentor feedback with the chosen message
      showMentorMessage(`🎉 ${pickedMsg}`, 5000);
      
      if (rewardEl) {
        rewardEl.innerHTML = `<span style="font-size: 1rem; color: var(--success); font-weight: bold; display: block; margin-top: 10px;">✓ ${pickedMsg} <br>+10 Sparks credited!</span>`;
      }
    } else {
      // Replay must NOT trigger sparks or change progress, but inform the user cleanly
      showMentorMessage(`🔁 Replayed: "${pickedMsg}" (No additional rewards)`, 4000);
      if (rewardEl) {
        rewardEl.innerHTML = `<span style="font-size: 0.9rem; color: var(--text-muted); display: block; margin-top: 10px;">✓ Challenge replayed! (No additional rewards for replaying today)</span>`;
      }
    }
  };

  if (challengeId === 'connections') {
    // Header setup (rendered once)
    headerEl.innerHTML = `
      <h2 style="margin: 0 0 4px 0; color: var(--purple); font-size: 1.3rem; font-family: var(--font-sans); font-weight: 700;">Connections Challenge</h2>
      <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-sans);">Group 8 items into categories of 4 sharing a common concept!</p>
    `;

    const categories = {
      python: { name: 'Python Control & Def keywords', color: 'rgba(0, 243, 255, 0.08)', border: 'var(--cyan)' },
      http: { name: 'REST API HTTP Action methods', color: 'rgba(176, 38, 255, 0.08)', border: 'var(--purple)' }
    };
    
    let items = [
      { text: 'lambda', cat: 'python' },
      { text: 'yield', cat: 'python' },
      { text: 'elif', cat: 'python' },
      { text: 'pass', cat: 'python' },
      { text: 'GET', cat: 'http' },
      { text: 'POST', cat: 'http' },
      { text: 'PATCH', cat: 'http' },
      { text: 'DELETE', cat: 'http' }
    ];

    // Shuffle
    items = items.sort(() => Math.random() - 0.5);

    let selected = [];
    let solvedGroups = [];

    const renderGame = () => {
      bodyEl.innerHTML = `
        <div id="connections-solved-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; font-family: var(--font-sans);">
          ${solvedGroups.map(grpId => {
            const grp = categories[grpId];
            const grpItems = items.filter(i => i.cat === grpId).map(i => i.text).join(', ');
            return `
              <div style="background: ${grp.color}; border: 1.5px solid ${grp.border}; border-radius: 8px; padding: 10px; text-align: center;">
                <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: bold; letter-spacing: 0.5px;">${grp.name}</div>
                <div style="font-size: 0.9rem; font-weight: bold; color: var(--text-main); margin-top: 3px; font-family: var(--font-mono);">${grpItems}</div>
              </div>
            `;
          }).join('')}
        </div>

        ${solvedGroups.length < 2 ? `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 16px;">
            ${items.filter(i => !solvedGroups.includes(i.cat)).map(item => {
              const isSel = selected.includes(item.text);
              return `
                <button class="connection-item-btn" data-text="${item.text}" style="
                  height: 54px; border-radius: 8px; border: 1.5px solid ${isSel ? 'var(--purple)' : 'var(--element-border)'}; 
                  background: ${isSel ? 'rgba(176, 38, 255, 0.15)' : 'rgba(0,0,0,0.15)'}; 
                  color: ${isSel ? 'var(--purple)' : 'var(--text-main)'};
                  font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; cursor: pointer; transition: background 0.1s, border-color 0.1s;
                ">
                  ${item.text}
                </button>
              `;
            }).join('')}
          </div>

          <div style="display: flex; gap: 10px; margin-top: 12px; justify-content: flex-end;">
            <button id="connections-submit-btn" class="btn-neon" style="padding: 8px 16px; font-size: 0.8rem; font-family: var(--font-sans); font-weight: bold;">Submit Selected</button>
          </div>
        ` : `
          <div id="connections-win-container" style="text-align: center; margin-top: 20px; font-family: var(--font-sans);">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🌟</div>
            <h3 style="color: var(--success); font-size: 1.25rem; margin: 0 0 8px 0; font-weight: bold;">Connections Solved!</h3>
            <p id="challenge-reward-status" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px 0;"></p>
            <button id="connections-done-btn" class="btn-neon" style="padding: 8px 24px; font-size: 0.85rem; border-color: var(--success); color: var(--success); font-weight: bold;">Close Panel</button>
          </div>
        `}
      `;

      const doneBtn = bodyEl.querySelector('#connections-done-btn');
      if (doneBtn) doneBtn.addEventListener('click', closeModal);

      const itemBtns = bodyEl.querySelectorAll('.connection-item-btn');
      itemBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const text = this.getAttribute('data-text');
          if (selected.includes(text)) {
            selected = selected.filter(s => s !== text);
          } else {
            if (selected.length < 4) {
              selected.push(text);
            } else {
              feedbackEl.innerText = "Select up to 4 elements only!";
              feedbackEl.style.color = '#ff3366';
              setTimeout(() => { feedbackEl.innerText = ""; }, 2000);
            }
          }
          renderGame();
        });
      });

      const submitBtn = bodyEl.querySelector('#connections-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (selected.length !== 4) {
            feedbackEl.innerText = "Please select exactly 4 items to verify.";
            feedbackEl.style.color = '#ff3366';
            return;
          }

          const firstItem = items.find(i => i.text === selected[0]);
          const groupTarget = firstItem.cat;
          const matchAll = selected.every(txt => {
            const foundObj = items.find(i => i.text === txt);
            return foundObj && foundObj.cat === groupTarget;
          });

          if (matchAll) {
            solvedGroups.push(groupTarget);
            selected = [];
            feedbackEl.innerText = "";
            
            if (solvedGroups.length === 2) {
              headerEl.innerHTML = '';
              renderGame();
              triggerChallengeWin('connections');
            } else {
              renderGame();
              feedbackEl.innerText = "✓ Exact category match! Keep finding the last set.";
              feedbackEl.style.color = 'var(--success)';
              setTimeout(() => { feedbackEl.innerText = ""; }, 3000);
            }
          } else {
            feedbackEl.innerText = "Incorrect association! Refine item selection.";
            feedbackEl.style.color = '#ff3366';
            setTimeout(() => { feedbackEl.innerText = ""; }, 3000);
          }
        });
      }
    };

    renderGame();
  }

  else if (challengeId === 'logic-sudoku') {
    headerEl.innerHTML = `
      <h2 style="margin: 0 0 4px 0; color: var(--purple); font-size: 1.3rem; font-family: var(--font-sans); font-weight: 700;">🧩 Operator Logic Sudoku</h2>
      <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-sans);">Each row and column must contain exactly one <b>&lt;</b>, one <b>&gt;</b>, and one <b>==</b> without duplicates.</p>
    `;

    const solution = [
      ['<', '>', '=='],
      ['==', '<', '>'],
      ['>', '==', '<']
    ];
    const initial = [
      ['<', '', '=='],
      ['', '==', ''],
      ['>', '', '']
    ];

    const gridState = [
      [...initial[0]],
      [...initial[1]],
      [...initial[2]]
    ];

    const cycleValue = (r, c) => {
      if (initial[r][c] !== '') return;
      const order = ['', '<', '>', '=='];
      const curIdx = order.indexOf(gridState[r][c]);
      const nextIdx = (curIdx + 1) % order.length;
      gridState[r][c] = order[nextIdx];
    };

    const renderSudoku = () => {
      bodyEl.innerHTML = `
        <div style="display: flex; justify-content: center; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: repeat(3, 76px); gap: 8px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; border: 1.5px dashed rgba(176,38,255,0.35);">
            ${gridState.map((row, r) => row.map((cell, c) => {
              const isFixed = initial[r][c] !== '';
              return `
                <button class="sudoku-cell" data-r="${r}" data-c="${c}" style="
                  width: 76px; height: 76px; font-size: 1.4rem; border-radius: 8px; font-family: var(--font-mono); font-weight: bold;
                  background: ${isFixed ? 'rgba(0, 243, 255, 0.08)' : 'rgba(176,38,255,0.04)'};
                  border: 1.5px solid ${isFixed ? 'var(--cyan)' : 'var(--element-border)'};
                  color: ${isFixed ? 'var(--cyan)' : (cell ? 'var(--purple)' : 'var(--text-muted)')};
                  cursor: ${isFixed ? 'not-allowed' : 'pointer'};
                  transition: border-color 0.1s;
                " ${isFixed ? 'disabled' : ''}>
                  ${cell || '?'}
                </button>
              `;
            }).join('')).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; margin-top: 12px; font-family: var(--font-sans);">
          <button id="sudoku-reset-btn" class="btn-neon" style="padding: 6px 12px; font-size: 0.75rem; border-color: var(--text-muted); color: var(--text-muted); font-weight: bold;">Reset Grid</button>
          <button id="sudoku-check-btn" class="btn-neon" style="padding: 8px 16px; font-size: 0.85rem; font-weight: bold;">Check Operators</button>
        </div>
      `;

      const cells = bodyEl.querySelectorAll('.sudoku-cell');
      cells.forEach(cell => {
        cell.addEventListener('click', function() {
          const r = parseInt(this.getAttribute('data-r'));
          const c = parseInt(this.getAttribute('data-c'));
          cycleValue(r, c);
          renderSudoku();
        });
      });

      const resetBtn = bodyEl.querySelector('#sudoku-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              gridState[r][c] = initial[r][c];
            }
          }
          feedbackEl.innerText = "";
          renderSudoku();
        });
      }

      const checkBtn = bodyEl.querySelector('#sudoku-check-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          let isCorrect = true;
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              if (gridState[r][c] !== solution[r][c]) {
                isCorrect = false;
              }
            }
          }

          if (isCorrect) {
            feedbackEl.innerText = "✓ Perfect match! Matrix logic balanced successfully.";
            feedbackEl.style.color = 'var(--success)';
            setTimeout(() => {
              headerEl.innerHTML = '';
              feedbackEl.innerHTML = '';
              bodyEl.innerHTML = `
                <div style="text-align: center; padding: 10px; font-family: var(--font-sans);">
                  <div style="font-size: 2.5rem; margin-bottom: 10px;">🧠</div>
                  <h2 style="color: var(--success); font-size: 1.35rem; margin: 0 0 8px 0; font-weight: bold;">Sudoku Matrix Solved!</h2>
                  <p id="challenge-reward-status" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px 0;"></p>
                  <button id="sudoku-done-btn" class="btn-neon" style="padding: 8px 24px; font-size: 0.85rem; border-color: var(--success); color: var(--success); font-weight: bold;">Seal Matrix</button>
                </div>
              `;
              const doneBtn = bodyEl.querySelector('#sudoku-done-btn');
              if (doneBtn) doneBtn.addEventListener('click', closeModal);
              triggerChallengeWin('logic-sudoku');
            }, 1000);
          } else {
            feedbackEl.innerText = "Logical conflicts found. Ensure unique Operators in each row and column!";
            feedbackEl.style.color = '#ff3366';
            setTimeout(() => { feedbackEl.innerText = ""; }, 3000);
          }
        });
      }
    };

    renderSudoku();
  }

  else if (challengeId === 'n-queens') {
    headerEl.innerHTML = `
      <h2 style="margin: 0 0 6px 0; color: var(--purple); font-size: 1.3rem; font-family: var(--font-sans); font-weight: 700;">👑 N-Queens Logic Matrix</h2>
      <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-sans);">Position exactly <b>4</b> Queens. Avoid alignment attacks vertically, horizontally, or diagonally!</p>
    `;

    const grid = [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ];

    const getPlacedCount = () => {
      let count = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c]) count++;
        }
      }
      return count;
    };

    const toggleQueen = (r, c) => {
      if (grid[r][c]) {
        grid[r][c] = false;
      } else {
        if (getPlacedCount() < 4) {
          grid[r][c] = true;
        } else {
          feedbackEl.innerText = "Max 4 Queens! Deselect an existing Queen first.";
          feedbackEl.style.color = '#ff3366';
          setTimeout(() => { feedbackEl.innerText = ""; }, 2500);
        }
      }
    };

    const renderQueens = () => {
      const placed = getPlacedCount();
      bodyEl.innerHTML = `
        <div style="text-align: center; font-size: 0.9rem; font-family: var(--font-mono); margin-bottom: 12px;" class="text-gradient">
          Queens Placed: ${placed} / 4
        </div>

        <div style="display: flex; justify-content: center; margin: 15px 0;">
          <div style="display: grid; grid-template-columns: repeat(4, 52px); gap: 4px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 8px; border: 1px solid rgba(176,38,255,0.2);">
            ${grid.map((row, r) => row.map((hasQueen, c) => {
              const isDarkCell = (r + c) % 2 === 1;
              return `
                <button class="queen-cell" data-r="${r}" data-c="${c}" style="
                  width: 52px; height: 52px; border-radius: 4px; border: none; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
                  background: ${hasQueen ? 'rgba(176,38,255,0.22)' : (isDarkCell ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)')};
                  box-shadow: ${hasQueen ? 'inset 0 0 8px rgba(176,38,255,0.4), 0 0 4px rgba(176,38,255,0.2)' : 'none'};
                  transition: background 0.1s;
                ">
                  ${hasQueen ? '👑' : ''}
                </button>
              `;
            }).join('')).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; margin-top: 12px; font-family: var(--font-sans);">
          <button id="queens-reset-btn" class="btn-neon" style="padding: 6px 12px; font-size: 0.75rem; border-color: var(--text-muted); color: var(--text-muted); font-weight: bold;">Clear Grid</button>
          <button id="queens-check-btn" class="btn-neon" style="padding: 8px 16px; font-size: 0.85rem; font-weight: bold;">Check Alignment</button>
        </div>
      `;

      const resetBtn = bodyEl.querySelector('#queens-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              grid[r][c] = false;
            }
          }
          feedbackEl.innerText = "";
          renderQueens();
        });
      }

      const cells = bodyEl.querySelectorAll('.queen-cell');
      cells.forEach(cell => {
        cell.addEventListener('click', function() {
          const r = parseInt(this.getAttribute('data-r'));
          const c = parseInt(this.getAttribute('data-c'));
          toggleQueen(r, c);
          renderQueens();
        });
      });

      const checkBtn = bodyEl.querySelector('#queens-check-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const list = [];
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (grid[r][c]) {
                list.push({ r, c });
              }
            }
          }

          if (list.length !== 4) {
            feedbackEl.innerText = `Place exactly 4 Queens. Currently on board: ${list.length}`;
            feedbackEl.style.color = '#ff3366';
            return;
          }

          let clash = false;
          let clashReason = "";
          for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
              const q1 = list[i];
              const q2 = list[j];
              if (q1.r === q2.r) {
                clash = true;
                clashReason = `Queens collide horizontally on Row ${q1.r + 1}!`;
                break;
              }
              if (q1.c === q2.c) {
                clash = true;
                clashReason = `Queens collide vertically on Column ${q1.c + 1}!`;
                break;
              }
              if (Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c)) {
                clash = true;
                clashReason = `Collision detected on diagonal intercept lines!`;
                break;
              }
            }
          }

          if (clash) {
            feedbackEl.innerText = `Alignment issue: ${clashReason}`;
            feedbackEl.style.color = '#ff3366';
            setTimeout(() => { feedbackEl.innerText = ""; }, 3000);
          } else {
            feedbackEl.innerText = "✓ Safe positioning! Matrix fully guarded.";
            feedbackEl.style.color = 'var(--success)';
            setTimeout(() => {
              headerEl.innerHTML = '';
              feedbackEl.innerHTML = '';
              bodyEl.innerHTML = `
                <div style="text-align: center; padding: 10px; font-family: var(--font-sans);">
                  <div style="font-size: 2.5rem; margin-bottom: 10px;">👑</div>
                  <h2 style="color: var(--success); font-size: 1.35rem; margin: 0 0 8px 0; font-weight: bold;">Queens Guarded!</h2>
                  <p id="challenge-reward-status" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px 0;"></p>
                  <button id="queens-done-btn" class="btn-neon" style="padding: 8px 24px; font-size: 0.85rem; border-color: var(--success); color: var(--success); font-weight: bold;">Seal Alignment</button>
                </div>
              `;
              const doneBtn = bodyEl.querySelector('#queens-done-btn');
              if (doneBtn) doneBtn.addEventListener('click', closeModal);
              triggerChallengeWin('n-queens');
            }, 1000);
          }
        });
      }
    };

    renderQueens();
  }

  else if (challengeId === 'pattern-match') {
    headerEl.innerHTML = `
      <h2 style="margin: 0 0 6px 0; color: var(--purple); font-size: 1.3rem; font-family: var(--font-sans); font-weight: 700;">Pattern Match Challenge</h2>
      <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-sans);">Analyze the target values and correctly select their underlying Regular Expression.</p>
    `;

    const rounds = [
      {
        text: 'Target literals to match: "admin#99", "user#42", "super#00"',
        question: 'Select the regular expression matching lowercase letters, then hash symbol (#) and exactly two decimal digits:',
        options: [
          { text: '/^[a-z]+#[0-9]{2}$/', correct: true },
          { text: '/^[0-9]+#[a-zA-Z]+$/', correct: false },
          { text: '/^[a-z]+$/', correct: false }
        ]
      },
      {
        text: 'Target hex web values: "#ff9900", "#12ab34", "#FFFFFF"',
        question: 'Uncover the correct regex framing design with an opening hashtag (#) and exactly six hexadecimal-ranged safe characters:',
        options: [
          { text: '/^#[0-9a-fA-F]{6}$/', correct: true },
          { text: '/^[0-9a-fA-F]{6}$/', correct: false },
          { text: '/^#[a-z]{3}$/', correct: false }
        ]
      },
      {
        text: 'Target file inputs to map: "app.js", "server.ts", "package.json"',
        question: 'Identify the exact regex catching lowercase alphabetical letters optionally terminated by a web suffix of dot followed by js, ts, or json file extension:',
        options: [
          { text: '/^[a-z]+\\.(js|ts|json)$/', correct: true },
          { text: '/^[a-z]+\\.[a-z]{3}$/', correct: false },
          { text: '/^\\.[js|ts|json]$/', correct: false }
        ]
      }
    ];

    let currentRound = 0;

    const renderPatternMatch = () => {
      const rnd = rounds[currentRound];
      bodyEl.innerHTML = `
        <div style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; background: rgba(176,38,255,0.06); padding: 4px 10px; border-radius: 6px; border: 1px dashed rgba(176,38,255,0.2); margin-bottom: 12px; text-align: center;">
          Stage Progress: ${currentRound + 1} / 3
        </div>

        <div class="glass-panel" style="padding: 12px; margin-bottom: 14px; background: rgba(0,0,0,0.15); border-color: rgba(0, 243, 255, 0.25);">
          <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--cyan); word-break: break-all;">${rnd.text}</div>
        </div>

        <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: var(--text-main); font-weight: 600; line-height: 1.45; font-family: var(--font-sans);">${rnd.question}</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${rnd.options.map((opt, oIdx) => `
            <button class="pattern-option-btn quiz-option" data-correct="${opt.correct}" style="
              width: 100%; padding: 12px 14px; text-align: left; font-family: var(--font-mono); font-size: 0.78rem; border-radius: 8px; border: 1.5px solid var(--element-border); background: transparent; color: var(--text-main); cursor: pointer; transition: background 0.1s;
            ">
              ${opt.text}
            </button>
          `).join('')}
        </div>
      `;

      const optBtns = bodyEl.querySelectorAll('.pattern-option-btn');
      optBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const isCorrect = this.getAttribute('data-correct') === 'true';
          
          if (isCorrect) {
            this.style.borderColor = 'var(--success)';
            this.style.background = 'rgba(0, 255, 136, 0.1)';
            this.style.color = 'var(--success)';
            feedbackEl.innerText = "✓ Concept matched! Testing cases parsed successfully.";
            feedbackEl.style.color = 'var(--success)';
            
            setTimeout(() => {
              if (currentRound < 2) {
                currentRound++;
                feedbackEl.innerText = "";
                renderPatternMatch();
              } else {
                headerEl.innerHTML = '';
                feedbackEl.innerHTML = '';
                bodyEl.innerHTML = `
                  <div style="text-align: center; padding: 10px; font-family: var(--font-sans);">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
                    <h2 style="color: var(--success); font-size: 1.35rem; margin: 0 0 8px 0; font-weight: bold;">Pattern Matrices Decoded!</h2>
                    <p id="challenge-reward-status" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px 0;"></p>
                    <button id="pattern-done-btn" class="btn-neon" style="padding: 8px 24px; font-size: 0.85rem; border-color: var(--success); color: var(--success); font-weight: bold;">Seal Analyzer</button>
                  </div>
                `;
                const doneBtn = bodyEl.querySelector('#pattern-done-btn');
                if (doneBtn) doneBtn.addEventListener('click', closeModal);
                triggerChallengeWin('pattern-match');
              }
            }, 1000);
          } else {
            this.style.borderColor = '#ff3366';
            this.style.background = 'rgba(255, 51, 102, 0.1)';
            this.style.color = '#ff3366';
            feedbackEl.innerText = "Incorrect regular expression format bounds! Choose alternative.";
            feedbackEl.style.color = '#ff3366';
            setTimeout(() => { feedbackEl.innerText = ""; }, 3000);
          }
        });
      });
    };

    renderPatternMatch();
  }

  else if (challengeId === 'code-memory') {
    headerEl.innerHTML = `
      <h2 style="margin: 0 0 6px 0; color: var(--purple); font-size: 1.3rem; font-family: var(--font-sans); font-weight: 700;">Code Memory Link</h2>
      <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-sans);">Uncover the code snippets and link them directly to their evaluation output!</p>
    `;

    let cardPairs = [
      { id: 1, text: '[1, 2, 3].map(x => x * 2)', pair: 'A' },
      { id: 2, text: '[2, 4, 6]', pair: 'A' },
      { id: 3, text: '"hello".toUpperCase()', pair: 'B' },
      { id: 4, text: '"HELLO"', pair: 'B' },
      { id: 5, text: 'typeof null', pair: 'C' },
      { id: 6, text: '"object"', pair: 'C' }
    ];

    cardPairs = cardPairs.sort(() => Math.random() - 0.5);

    let cardsState = cardPairs.map(cp => ({
      ...cp,
      flipped: false,
      matched: false
    }));

    let selectedIdxs = [];
    let isFlippedTimeout = false;

    const renderMemory = () => {
      const isAllSolved = cardsState.every(c => c.matched);

      bodyEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">
          ${cardsState.map((cd, index) => {
            const showFace = cd.flipped || cd.matched;
            return `
              <button class="memory-card-btn" data-idx="${index}" style="
                height: 80px; border-radius: 8px; border: 1.5px solid ${cd.matched ? 'var(--success)' : (cd.flipped ? 'var(--cyan)' : 'var(--element-border)')};
                background: ${cd.matched ? 'rgba(0,255,136,0.05)' : (cd.flipped ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0,0,0,0.2)')};
                color: ${showFace ? (cd.matched ? 'var(--success)' : 'var(--cyan)') : 'transparent'};
                font-family: var(--font-mono); font-size: 0.75rem; font-weight: bold; cursor: pointer; 
                display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box; text-align: center; line-height: 1.35;
                box-shadow: ${cd.flipped ? '0 0 8px rgba(0, 243, 255, 0.3)' : 'none'};
                transition: background 0.15s ease, border-color 0.15s ease;
              " ${cd.matched ? 'disabled' : ''}>
                ${showFace ? cd.text : '❓'}
              </button>
            `;
          }).join('')}
        </div>
      `;

      if (isAllSolved) {
        setTimeout(() => {
          headerEl.innerHTML = '';
          feedbackEl.innerHTML = '';
          bodyEl.innerHTML = `
            <div style="text-align: center; padding: 10px; font-family: var(--font-sans);">
              <div style="font-size: 2.5rem; margin-bottom: 10px;">🎴</div>
              <h2 style="color: var(--success); font-size: 1.35rem; margin: 0 0 8px 0; font-weight: bold;">Memory Cache Linked!</h2>
              <p id="challenge-reward-status" style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px 0;"></p>
              <button id="memory-done-btn" class="btn-neon" style="padding: 8px 24px; font-size: 0.85rem; border-color: var(--success); color: var(--success); font-weight: bold;">Seal Cache</button>
            </div>
          `;
          const doneBtn = bodyEl.querySelector('#memory-done-btn');
          if (doneBtn) doneBtn.addEventListener('click', closeModal);
          triggerChallengeWin('code-memory');
        }, 1100);
      }

      if (!isAllSolved && !isFlippedTimeout) {
        const cdBtns = bodyEl.querySelectorAll('.memory-card-btn');
        cdBtns.forEach(btn => {
          btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            const targetCard = cardsState[idx];
            if (targetCard.matched || targetCard.flipped || selectedIdxs.length >= 2) return;

            targetCard.flipped = true;
            selectedIdxs.push(idx);
            renderMemory();

            if (selectedIdxs.length === 2) {
              const firstCard = cardsState[selectedIdxs[0]];
              const secCard = cardsState[selectedIdxs[1]];

              if (firstCard.pair === secCard.pair) {
                firstCard.matched = true;
                secCard.matched = true;
                firstCard.flipped = false;
                secCard.flipped = false;
                selectedIdxs = [];
                renderMemory();
              } else {
                isFlippedTimeout = true;
                feedbackEl.innerText = "Pair mismatch! Resetting selection...";
                feedbackEl.style.color = '#ff3366';
                
                setTimeout(() => {
                  firstCard.flipped = false;
                  secCard.flipped = false;
                  selectedIdxs = [];
                  isFlippedTimeout = false;
                  feedbackEl.innerText = "";
                  renderMemory();
                }, 1200);
              }
            }
          });
        });
      }
    };

    renderMemory();
  }
}
