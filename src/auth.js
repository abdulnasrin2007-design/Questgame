// auth.js - Simulates backend persistence using localStorage
import { showMentorMessage } from './components/Mentor.js';

const USER_KEY = 'codequest_user';
const ACCOUNTS_KEY = 'codequest_accounts';

// Helper to retrieve all registered accounts
function getAccounts() {
  const data = localStorage.getItem(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : {};
}

// Helper to save registered accounts
function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Run transparent migration immediately to keep existing user progress
try {
  const existingSingleUser = localStorage.getItem(USER_KEY);
  if (existingSingleUser) {
    const userObj = JSON.parse(existingSingleUser);
    if (userObj && userObj.email) {
      const accounts = getAccounts();
      const emailLower = userObj.email.toLowerCase();
      if (!accounts[emailLower]) {
        // If they had no password stored yet, give a standard default
        userObj.password = userObj.password || 'password123';
        accounts[emailLower] = userObj;
        saveAccounts(accounts);
        // Save the updated version back with password
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      }
    }
  }
} catch (e) {
  console.error('[Auth] Migration error:', e);
}

export function getCurrentUser() {
  const data = localStorage.getItem(USER_KEY);
  if (data) {
    const userObj = JSON.parse(data);
    if (userObj) {
      if (userObj.skillSparks === undefined) userObj.skillSparks = 0;
      if (userObj.logicKeys === undefined) userObj.logicKeys = 0;
      if (userObj.unlockedPracticeArenas === undefined) userObj.unlockedPracticeArenas = ['basic'];
      if (userObj.unlockedPracticeHints === undefined) userObj.unlockedPracticeHints = [];
      if (userObj.unlockedSyntaxVision === undefined) userObj.unlockedSyntaxVision = [];
      if (userObj.streak === undefined) userObj.streak = 1;
      if (userObj.streakShields === undefined) userObj.streakShields = 0;
      if (userObj.prestigeTitle === undefined) userObj.prestigeTitle = "";
      if (!userObj.completedLevels) userObj.completedLevels = {};
      if (!userObj.roadmapsUnlocked) userObj.roadmapsUnlocked = ['python'];
      if (!userObj.streakCheckedDays) {
        userObj.streakCheckedDays = [new Date(userObj.lastLogin || Date.now()).toDateString()];
      }
    }
    return userObj;
  }
  return null;
}

export function checkInToday() {
  const user = getCurrentUser();
  if (!user) return { success: false, errorMessage: "User session expired." };
  
  if (!user.streakCheckedDays) {
    user.streakCheckedDays = [];
  }
  
  const today = new Date().toDateString();
  if (!user.streakCheckedDays.includes(today)) {
    user.streakCheckedDays.push(today);
    
    // Sort checked days descending to calculate previous check-in intervals
    const sortedDays = [...user.streakCheckedDays]
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    let isShieldUsed = false;
    let earnedBonus = 0;
    if (sortedDays.length > 1) {
      const lastCheck = sortedDays[1];
      lastCheck.setHours(0,0,0,0);
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      
      const diffMs = todayDate - lastCheck;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
        // Streak bonus +15 Sparks!
        user.skillSparks = (user.skillSparks || 0) + 15;
        earnedBonus = 15;
      } else if (diffDays > 1) {
        if (user.streakShields && user.streakShields > 0) {
          user.streakShields -= 1;
          user.streak = (user.streak || 1) + 1;
          isShieldUsed = true;
          // Streak bonus +15 Sparks on shield usage too!
          user.skillSparks = (user.skillSparks || 0) + 15;
          earnedBonus = 15;
        } else {
          user.streak = 1; // broken streak reset
        }
      }
    } else {
      user.streak = 1;
    }
    
    user.lastLogin = new Date().toISOString();
    saveUser(user);
    if (earnedBonus > 0) {
      setTimeout(() => {
        adjustSkillSparks(0); // Trigger floating anim or UI sync
        showFloatingSparksIndicator(earnedBonus);
      }, 500);
    }
    return { success: true, updatedStreak: user.streak, isShieldUsed, user, earnedBonus };
  }
  
  return { success: false, errorMessage: "Already checked in today!", user };
}

export function claimDailySparksBonus() {
  const user = getCurrentUser();
  if (!user) return { success: false, errorMessage: "User session expired." };
  
  const today = new Date().toDateString();
  if (user.lastClaimedSparks === today) {
    return { success: false, errorMessage: "Bonus already claimed today! Check back tomorrow." };
  }
  
  // Award 50 bonus sparks + possible streak bonus!
  let totalReward = 50;
  user.lastClaimedSparks = today;
  
  // Auto check-in to keep active streak safe
  if (!user.streakCheckedDays) {
    user.streakCheckedDays = [];
  }
  let isShieldUsed = false;
  if (!user.streakCheckedDays.includes(today)) {
    user.streakCheckedDays.push(today);
    
    // Recalculate streak
    const sortedDays = [...user.streakCheckedDays]
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    if (sortedDays.length > 1) {
      const lastCheck = sortedDays[1];
      lastCheck.setHours(0,0,0,0);
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      
      const diffMs = todayDate - lastCheck;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
        totalReward += 15; // +15 Streak bonus!
      } else if (diffDays > 1) {
        if (user.streakShields && user.streakShields > 0) {
          user.streakShields -= 1;
          user.streak = (user.streak || 1) + 1;
          isShieldUsed = true;
          totalReward += 15; // +15 Streak bonus!
        } else {
          user.streak = 1;
        }
      }
    } else {
      user.streak = 1;
    }
  }
  
  user.skillSparks = (user.skillSparks || 0) + totalReward;
  user.lastLogin = new Date().toISOString();
  saveUser(user);
  
  // Sync UI and show floating indicator
  setTimeout(() => {
    adjustSkillSparks(0); // sync text displays
    showFloatingSparksIndicator(totalReward);
  }, 100);

  return { success: true, reward: totalReward, updatedSparks: user.skillSparks, isShieldUsed, user };
}

export function purchaseShopItem(itemId, cost) {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "User session expired." };
  
  if ((user.skillSparks || 0) < cost) {
    return { success: false, error: `Insufficient Sparks! You need ${cost} Sparks, but you only have ${user.skillSparks || 0}.` };
  }
  
  user.skillSparks -= cost;
  
  if (itemId === 'streak_shield') {
    user.streakShields = (user.streakShields || 0) + 1;
    saveUser(user);
    return { success: true, message: `Purchased Streak Freeze Shield! You now have ${user.streakShields} shield(s) protecting your streak.`, user };
  }
  
  if (itemId === 'bypass_key') {
    const allIds = ['python', 'c', 'java', 'javascript', 'cpp'];
    allIds.forEach(id => {
      if (!user.roadmapsUnlocked.includes(id)) {
        user.roadmapsUnlocked.push(id);
      }
    });
    saveUser(user);
    return { success: true, message: `Roadmap Bypass Key Activated! All programming language roadmaps are now fully unlocked!`, user };
  }
  
  if (itemId.startsWith('title_')) {
    const titleName = itemId.replace('title_', '');
    user.prestigeTitle = titleName;
    saveUser(user);
    return { success: true, message: `Prestige Title Activated! Your title is now "${titleName}".`, user };
  }
  
  return { success: false, error: "Unknown shop item." };
}

export function canResetPassword(email) {
  if (!email) return false;
  const accounts = getAccounts();
  return !!accounts[email.trim().toLowerCase()];
}

export function resetUserPassword(email, newPassword) {
  if (!email || !newPassword) return false;
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  const matchedUser = accounts[normalizedEmail];
  
  if (!matchedUser) {
    throw new Error('Email address is not registered in CodeQuest!');
  }
  
  matchedUser.password = newPassword;
  accounts[normalizedEmail] = matchedUser;
  saveAccounts(accounts);
  
  // If Currently logged-in user is resetting, synchronize current session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
    currentUser.password = newPassword;
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  }
  
  return true;
}

export function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  const existingUser = accounts[normalizedEmail];
  
  if (existingUser) {
    // Validate password
    if (existingUser.password && existingUser.password !== password) {
      throw new Error('Incorrect password! Please check your credentials or click Forgot Password.');
    }
    
    // Simulate daily login streak incrementing if lastLogin was a different day.
    const lastLoginDate = new Date(existingUser.lastLogin).toDateString();
    const today = new Date().toDateString();
    
    if (lastLoginDate !== today) {
      existingUser.streak += 1;
      // Award streak bonus on daily login streak increment (+15 Sparks)
      existingUser.skillSparks = (existingUser.skillSparks || 0) + 15;
      existingUser.lastLogin = new Date().toISOString();
      
      setTimeout(() => {
        adjustSkillSparks(0);
        showFloatingSparksIndicator(15);
      }, 1000);
    }
    
    // Set as current logged-in user
    localStorage.setItem(USER_KEY, JSON.stringify(existingUser));
    return existingUser;
  }
  
  // For standard user signup/creation when email isn't in accounts database
  throw new Error('Account not found! If you are a new traveler, click the "Sign Up" tab above to create a new profile.');
}

export function signupUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const newUser = {
    email: email.trim(),
    password: password,
    name: email.trim().split('@')[0],
    skillSparks: 0,
    streak: 1,
    lastStreakCelebrated: 0,
    lastLogin: new Date().toISOString(),
    completedLevels: {}, // Format: { "python": [1, 2], "java": [] }
    roadmapsUnlocked: ['python']
  };
  
  // Save both as current active session and to accounts database
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  const accounts = getAccounts();
  accounts[normalizedEmail] = newUser;
  saveAccounts(accounts);
  
  return newUser;
}

export function saveUser(userObj) {
  localStorage.setItem(USER_KEY, JSON.stringify(userObj));
  
  // Keep the account database in sync!
  if (userObj && userObj.email) {
    const normalizedEmail = userObj.email.toLowerCase();
    const accounts = getAccounts();
    accounts[normalizedEmail] = userObj;
    saveAccounts(accounts);
  }
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
  window.location.hash = '#login';
}

export function showFloatingSparksIndicator(amount, sourceElement = null) {
  const container = document.body;
  if (!container) return;

  const floatDiv = document.createElement('div');
  floatDiv.style.position = 'fixed';
  floatDiv.style.zIndex = '999999';
  floatDiv.style.pointerEvents = 'none';
  floatDiv.style.fontFamily = 'var(--font-mono), monospace';
  floatDiv.style.fontSize = '1.4rem';
  floatDiv.style.fontWeight = '900';
  floatDiv.style.borderRadius = '30px';
  floatDiv.style.padding = '4px 12px';
  floatDiv.style.transition = 'all 1.0s cubic-bezier(0.1, 0.8, 0.3, 1)';
  
  if (amount > 0) {
    floatDiv.innerText = `+${amount} Sparks`;
    floatDiv.style.color = '#00ff88';
    floatDiv.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.7)';
  } else {
    floatDiv.innerText = `${amount} Sparks`;
    floatDiv.style.color = '#ff3366';
    floatDiv.style.textShadow = '0 0 10px rgba(255, 51, 102, 0.7)';
  }

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2 - 50;

  if (sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      x = rect.left + rect.width / 2;
      y = rect.top;
    }
  }

  // To prevent placing it off-screen, clamp it
  x = Math.max(20, Math.min(window.innerWidth - 80, x));
  y = Math.max(20, Math.min(window.innerHeight - 80, y));

  floatDiv.style.left = `${x}px`;
  floatDiv.style.top = `${y}px`;

  document.body.appendChild(floatDiv);

  // Trigger floating up and fading out
  requestAnimationFrame(() => {
    floatDiv.style.transform = 'translateY(-60px) scale(1.15)';
    floatDiv.style.opacity = '0';
  });

  setTimeout(() => {
    floatDiv.remove();
  }, 1000);
}

export function adjustSkillSparks(amount, reason = '', sourceElement = null) {
  const user = getCurrentUser();
  if (!user) return 0;

  const currentVal = user.skillSparks || 0;
  let newVal = currentVal + amount;
  if (newVal < 0) {
    newVal = 0;
  }
  const diff = newVal - currentVal;
  
  user.skillSparks = newVal;
  saveUser(user);

  // Sync to UI elements immediately
  const displayIds = ['hdr-sparks-val', 'arena-sparks-val', 'cl-sparks-val'];
  displayIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = newVal;
    }
  });

  // Also query selector search for any general indicators
  const queryDisplays = document.querySelectorAll('.sparks-count-header, [id*="sparks-display"]');
  queryDisplays.forEach(el => {
    el.innerText = newVal;
  });

  // Highlight Sparks Header Badge if exists
  const badge = document.getElementById('hdr-sparks-badge');
  if (badge) {
    badge.style.transform = 'scale(1.15)';
    badge.style.transition = 'transform 0.15s ease';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  }

  // Show floating indicator if change is non-zero
  if (diff !== 0) {
    showFloatingSparksIndicator(diff, sourceElement);
  }

  // Toast notification popup specifically when sparks get used (diff < 0) per user instruction
  if (diff < 0) {
    const toast = document.createElement('div');
    toast.className = 'glowing-toast-alert';
    toast.style.position = 'fixed';
    toast.style.zIndex = '1000000';
    toast.style.background = 'rgba(15, 20, 32, 0.95)';
    toast.style.border = '1.5px solid #ff3366';
    toast.style.boxShadow = '0 0 15px rgba(255, 51, 102, 0.4)';
    toast.style.borderRadius = '12px';
    toast.style.padding = '12px 18px';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = 'bold';
    toast.style.fontFamily = 'var(--font-sans), sans-serif';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.style.pointerEvents = 'none';

    if (window.innerWidth < 480) {
      toast.style.left = '16px';
      toast.style.right = '16px';
      toast.style.bottom = '16px';
    } else {
      toast.style.right = '24px';
      toast.style.bottom = '24px';
    }

    toast.innerHTML = `
      <span style="font-size: 1.5rem; line-height: 1;">⚡</span>
      <div>
        <div style="color: #ff3366; font-size: 0.74rem; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.5px; font-weight: bold;">Sparks Deduction</div>
        <div style="margin-top: 2px; font-weight: bold;">Used <span style="color: #ff3366;">${Math.abs(diff)} Sparks</span>${reason ? ` for ${reason}` : ''}</div>
      </div>
    `;

    document.body.appendChild(toast);

    // Fade and slide in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 100);

    // Keep it on screen longer, then slide out
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4500);
  }

  return newVal;
}

export function awardSkillSparks(amount, sourceElement = null) {
  return adjustSkillSparks(amount, 'Awarded sparks', sourceElement);
}

export function awardLogicKeys(amount) {
  const user = getCurrentUser();
  if (user) {
    user.logicKeys = (user.logicKeys || 0) + amount;
    saveUser(user);
    return user.logicKeys;
  }
  return 0;
}

export function isCourseUnlocked(user, courseId) {
  if (!user) return false;
  if (courseId === 'python') return true;
  
  // Python complete -> C unlock
  const pythonCompleted = (user.completedLevels['python'] || []).length >= 24;
  if (courseId === 'c') return pythonCompleted || (user.roadmapsUnlocked && user.roadmapsUnlocked.includes('c'));
  
  // C complete -> JavaScript unlock
  const cCompleted = (user.completedLevels['c'] || []).length >= 12;
  if (courseId === 'javascript') return cCompleted || (user.roadmapsUnlocked && user.roadmapsUnlocked.includes('javascript'));
  
  // JavaScript complete -> Java unlock
  const javascriptCompleted = (user.completedLevels['javascript'] || []).length >= 15;
  if (courseId === 'java') return javascriptCompleted || (user.roadmapsUnlocked && user.roadmapsUnlocked.includes('java'));
  
  // Java complete -> C++ unlock
  const javaCompleted = (user.completedLevels['java'] || []).length >= 18;
  if (courseId === 'cpp') return javaCompleted || (user.roadmapsUnlocked && user.roadmapsUnlocked.includes('cpp'));
  
  return false;
}

export function markLevelCompleted(courseId, levelId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (!user.completedLevels[courseId]) {
    user.completedLevels[courseId] = [];
  }
  
  const numericId = parseInt(levelId, 10);
  
  // Normalize existing completed levels layout list to integers before comparison
  user.completedLevels[courseId] = user.completedLevels[courseId].map(id => parseInt(id, 10));
  
  if (!user.completedLevels[courseId].includes(numericId)) {
    user.completedLevels[courseId].push(numericId);
    
    // Python complete (24 levels now including milestone revisions) -> C unlock
    if (courseId === 'python' && user.completedLevels['python'].length >= 24) {
      if (!user.roadmapsUnlocked.includes('c')) {
        user.roadmapsUnlocked.push('c');
        showMentorMessage("Magnificent! You completed Python! The static universe of 'C Language' is now unlocked.");
      }
    }
    // C complete (12 levels now including milestone revisions) -> JavaScript unlock
    if (courseId === 'c' && user.completedLevels['c'].length >= 12) {
      if (!user.roadmapsUnlocked.includes('javascript')) {
        user.roadmapsUnlocked.push('javascript');
        showMentorMessage("Superb! You completed C Language! The dynamic web capabilities of 'JavaScript' are now unlocked.");
      }
    }
    // JavaScript complete (15 levels now including milestone revisions) -> Java unlock
    if (courseId === 'javascript' && user.completedLevels['javascript'].length >= 15) {
      if (!user.roadmapsUnlocked.includes('java')) {
        user.roadmapsUnlocked.push('java');
        showMentorMessage("Fantastic! You completed JavaScript! The enterprise platform of 'Java' is now unlocked.");
      }
    }
    // Java complete (18 levels now including milestone revisions) -> C++ unlock
    if (courseId === 'java' && user.completedLevels['java'].length >= 18) {
      if (!user.roadmapsUnlocked.includes('cpp')) {
        user.roadmapsUnlocked.push('cpp');
        showMentorMessage("Brilliant! You completed Java! The high-performance systems of 'C++' are now unlocked.");
      }
    }
    
    saveUser(user);
    return true; // First time complete
  }
  return false; // Already completed
}

export function checkAndCelebrateStreak() {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Celebrate at 7, 30, and every 30 thereafter might be a cool idea, 
  // but strictly checking 7 or 30 or similar multiples.
  const isMilestone = user.streak === 7 || user.streak % 30 === 0;
  
  if (isMilestone && user.lastStreakCelebrated !== user.streak) {
    user.lastStreakCelebrated = user.streak;
    saveUser(user);
    return user.streak; // returns the streak number to celebrate
  }
  
  return false;
}
