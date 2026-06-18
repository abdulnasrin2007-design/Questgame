import { getCourseData, getLevelData } from '../data/courses.js';
import { getCurrentUser, adjustSkillSparks } from '../auth.js';

// AI Mentor Component - Fully Interactive, Floating Widget of CodeQuest
// Designed with 100% human-centric aesthetic and care
let messageTimeout;
let chatOpened = false;
let messageHistory = [];
let lastApiRequestTime = 0;
let apiRequestCount = 0;
const MAX_SESSION_API_CALLS = 18;
const API_COOLDOWN_MS = 5000;

export function initMentor(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Add responsive UI style rules dynamically to ensure total isolation and beautiful looks
  const styleId = 'mentor-custom-component-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      #ai-mentor-container {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 15px;
        pointer-events: none;
        will-change: left, top, transform; /* Hardware accelerate dragging */
      }
      .mentor-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--purple), var(--cyan));
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.8rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4); /* Lightweight flat optimized shadow */
        cursor: pointer;
        pointer-events: auto;
        animation: floatAvatar 4s ease-in-out infinite;
        border: 2px solid var(--element-border);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        will-change: transform; /* Accelerate floats and scaling */
      }
      .mentor-avatar:hover {
        transform: scale(1.1) rotate(5deg);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }
      .mentor-bubble-quick {
        background: #151d2a; /* Solid flat color instead of heavy filter: blur */
        border: 1px solid var(--cyan);
        padding: 12px 18px;
        border-radius: 14px 14px 0 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        color: var(--text-main);
        max-width: 260px;
        font-size: 0.92rem;
        line-height: 1.4;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
        cursor: pointer;
        user-select: none;
        will-change: transform, opacity;
      }
      .mentor-bubble-quick.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .mentor-chat-panel {
        position: absolute;
        bottom: 75px;
        right: 0;
        width: 380px;
        height: 520px;
        max-height: calc(100vh - 120px);
        background: #0d1117; /* Lightweight flat background color for lagless rendering */
        border: 1px solid var(--element-border);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
        border-radius: 16px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        pointer-events: auto;
        transform: translateY(30px) scale(0.95);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        will-change: transform, opacity;
      }
      .mentor-chat-panel.active {
        display: flex;
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      #mentor-quick-tray::-webkit-scrollbar {
        display: none !important;
      }
      #mentor-quick-tray {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      @media (max-width: 768px) {
        #ai-mentor-container {
          bottom: 12px !important;
          right: 12px !important;
        }
        .mentor-avatar {
          width: 46px !important;
          height: 46px !important;
          font-size: 1.4rem !important;
        }
        .mentor-chat-panel {
          width: 320px !important;
          height: 460px !important;
          bottom: 60px !important;
        }
      }
      @media (max-width: 480px) {
        #ai-mentor-container {
          bottom: 12px !important;
          right: 12px !important;
        }
        .mentor-avatar {
          width: 44px !important;
          height: 44px !important;
          font-size: 1.3rem !important;
        }
        .mentor-chat-panel {
          position: fixed !important;
          top: 10px !important;
          bottom: 10px !important;
          left: 10px !important;
          right: 10px !important;
          width: auto !important;
          height: auto !important;
          max-height: none !important;
          z-index: 10000 !important;
          transform: none !important;
        }
      }
      .mentor-chat-header {
        background: linear-gradient(90deg, rgba(82, 0, 243, 0.3) 0%, rgba(0, 243, 255, 0.2) 100%);
        border-bottom: 1px solid var(--element-border);
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .mentor-chat-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        scroll-behavior: smooth;
      }
      /* Custom fine scrollbar */
      .mentor-chat-body::-webkit-scrollbar {
        width: 6px;
      }
      .mentor-chat-body::-webkit-scrollbar-track {
        background: transparent;
      }
      .mentor-chat-body::-webkit-scrollbar-thumb {
        background: var(--element-border);
        border-radius: 4px;
      }
      .mentor-chat-footer {
        padding: 12px 18px;
        border-top: 1px solid var(--element-border);
        background: rgba(255, 255, 255, 0.01);
      }
      .mentor-msg-bubble {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 0.9rem;
        line-height: 1.4;
        word-wrap: break-word;
      }
      .mentor-msg-buddy {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--element-border);
        align-self: flex-start;
        border-top-left-radius: 2px;
        color: var(--text-main);
      }
      .mentor-msg-seeker {
        background: var(--purple-glow);
        border: 1px solid var(--purple);
        align-self: flex-end;
        border-top-right-radius: 2px;
        color: var(--text-main);
      }
      .mentor-suggest-btn {
        background: rgba(0, 243, 255, 0.03);
        border: 1px solid var(--element-border);
        color: var(--text-main);
        padding: 7px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
      }
      .mentor-suggest-btn:hover {
        background: rgba(0, 243, 255, 0.1);
        border-color: var(--cyan);
        box-shadow: 0 0 8px rgba(0, 243, 255, 0.2);
        transform: translateY(-1px);
      }
      .mentor-typing-indicator {
        display: flex;
        gap: 4px;
        padding: 8px 12px;
        align-self: flex-start;
      }
      .mentor-typing-dot {
        width: 6px;
        height: 6px;
        background: var(--cyan);
        border-radius: 50%;
        animation: typingDot 1.4s infinite ease-in-out;
      }
      .mentor-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .mentor-typing-dot:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes typingDot {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes floatAvatar {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
      
      /* Light Mode / Brightmode Adjustments for full readability of the Robot mentor dialog */
      :root.light-mode .mentor-chat-panel {
        background: var(--bg-card);
        border-color: var(--element-border);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 15px rgba(0, 136, 204, 0.1);
      }
      :root.light-mode .mentor-chat-header {
        background: linear-gradient(90deg, rgba(0, 136, 204, 0.15) 0%, rgba(138, 43, 226, 0.1) 100%);
        border-bottom: 1px solid var(--element-border);
      }
      :root.light-mode .mentor-chat-header h4 {
        color: var(--cyan) !important;
      }
      :root.light-mode .mentor-msg-buddy {
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid var(--element-border);
        color: var(--text-main);
      }
      :root.light-mode .mentor-msg-seeker {
        background: var(--purple-glow);
        border: 1px solid var(--purple);
        color: var(--text-main);
      }
      :root.light-mode .mentor-suggest-btn {
        background: rgba(0, 136, 204, 0.05);
        border: 1px solid var(--element-border);
        color: var(--text-main);
      }
      :root.light-mode .mentor-suggest-btn:hover {
        background: rgba(0, 136, 204, 0.12);
        border-color: var(--cyan);
        box-shadow: 0 0 8px rgba(0, 136, 204, 0.2);
      }
      :root.light-mode #mentor-query {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--element-border);
        color: var(--text-main);
      }
      :root.light-mode #mentor-chat-panel button[type="submit"] {
        background: var(--cyan);
        color: white;
        box-shadow: 0 0 10px rgba(0, 136, 204, 0.3);
      }
      :root.light-mode #close-mentor-chat {
        color: var(--text-muted);
      }
      :root.light-mode .mentor-bubble-quick {
        border-color: var(--cyan);
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      }
      @keyframes headShake {
        0% { transform: translateX(0); }
        6.5% { transform: translateX(-6px) rotateY(-9deg); }
        18.5% { transform: translateX(5px) rotateY(7deg); }
        31.5% { transform: translateX(-3px) rotateY(-5deg); }
        43.5% { transform: translateX(2px) rotateY(3deg); }
        50% { transform: translateX(0); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Set initial HTML structure
  container.innerHTML = `
    <!-- Floating quick notification bubble -->
    <div id="mentor-bubble" class="mentor-bubble-quick">
      Hi there! I am Mr. Roboto, your friendly coding companion! Click me to solve any doubts! 🧭
    </div>

    <!-- Live expanded Chat Panel -->
    <div id="mentor-chat-panel" class="mentor-chat-panel">
      <!-- Header -->
      <div class="mentor-chat-header" id="mentor-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.46rem;">🤖</span>
          <div>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: bold; color: var(--cyan); letter-spacing: 0.5px;" id="mentor-title">Mr. Roboto</h4>
            <p style="margin: 0; font-size: 0.72rem; color: var(--text-muted);" id="mentor-subtitle">Automated Code Validation & Monitor Desk</p>
          </div>
        </div>
        <button id="close-mentor-chat" style="background:transparent; border:none; color: var(--text-muted); font-size: 1.25rem; cursor:pointer;">&times;</button>
      </div>

      <!-- Live progression stats monitor (Hidden per user request) -->
      <div id="mentor-dashboard-stats" style="display: none !important; padding: 10px 15px; border-bottom: 1px solid var(--element-border); background: rgba(0, 243, 255, 0.02); display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center;">
        <div style="border-right: 1px solid var(--element-border);">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.3px;">Streak</div>
          <div id="mentor-stat-streak" style="font-size: 1rem; font-weight: bold; color: #ff9f43; font-family: var(--font-sans);">1 Day</div>
        </div>
        <div style="border-right: 1px solid var(--element-border);">
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.3px;">Lessons</div>
          <div id="mentor-stat-solved" style="font-size: 1rem; font-weight: bold; color: var(--purple); font-family: var(--font-sans);">0 Done</div>
        </div>
        <div>
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.3px;">Sparks</div>
          <div id="mentor-stat-sparks" style="font-size: 1rem; font-weight: bold; color: var(--cyan); font-family: var(--font-sans);">0 ✨</div>
        </div>
      </div>

      <!-- Quick interactive guides scroll tray -->
      <div style="padding: 8px 15px; display: flex; gap: 6px; overflow-x: auto; white-space: nowrap; border-bottom: 1px solid var(--element-border); background: rgba(0,0,0,0.15);" id="mentor-quick-tray">
        <button class="mentor-suggest-btn" data-action="tip" style="padding: 4px 10px; font-size: 0.74rem;">💡 Coding Tip</button>
        <button class="mentor-suggest-btn" data-action="confidence" style="padding: 4px 10px; font-size: 0.74rem;">🚀 Encourage Me</button>
        <button class="mentor-suggest-btn" data-action="concepts" style="padding: 4px 10px; font-size: 0.74rem;">🤔 Explain Topics</button>
        <button class="mentor-suggest-btn" data-action="frustrated" style="padding: 4px 10px; font-size: 0.74rem;">🌱 I Feel Stuck</button>
      </div>

      <!-- Scrollable Message Body -->
      <div class="mentor-chat-body" id="mentor-chat-body" style="padding: 15px;">
        <!-- Messages get written here dynamically -->
      </div>

      <!-- Form Inputs -->
      <div class="mentor-chat-footer" style="padding: 10px 15px;">
        <!-- Banner container for Sparks Cost Notifications -->
        <div id="mentor-spark-banner" style="margin-bottom: 8px;"></div>
        
        <form id="mentor-chat-form" style="display:flex; gap: 8px;">
          <input type="text" id="mentor-query" autocomplete="off" placeholder="Ask your mentor anything..." style="flex:1; background: rgba(0,0,0,0.2); border: 1px solid var(--element-border); border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; color: var(--text-main); outline: none;">
          <button type="submit" style="background: var(--cyan); color: #0d1117; font-weight: bold; padding: 10px 16px; border-radius: 8px; border: none; cursor:pointer; font-size: 0.88rem; box-shadow: 0 0 10px var(--cyan-glow);">Send</button>
        </form>
        <div style="font-size: 0.65rem; text-align: center; margin-top: 8px; color: var(--text-muted); font-family: var(--font-code); letter-spacing: 0.5px;">
          DESIGNER: ABDUL NASRIN
        </div>
      </div>
    </div>

    <!-- Active floating Avatar -->
    <div id="mentor-avatar" class="mentor-avatar">
      🤖
    </div>
  `;

  const avatar = document.getElementById('mentor-avatar');
  const bubble = document.getElementById('mentor-bubble');
  const panel = document.getElementById('mentor-chat-panel');
  const closeBtn = document.getElementById('close-mentor-chat');
  const chatForm = document.getElementById('mentor-chat-form');
  const quickTray = document.getElementById('mentor-quick-tray');

  // Dragging support for mentor-avatar on both desktop and mobile
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  const dragThreshold = 5; // Pixels to distinguish click from drag
  let hasDragged = false;

  avatar.addEventListener('mousedown', dragStart);
  avatar.addEventListener('touchstart', dragStart, { passive: true });

  function dragStart(e) {
    if (isDragging) return;
    
    const rect = container.getBoundingClientRect();
    
    // Switch to absolute/fixed positioning using left/top to allow free movement
    container.style.right = 'auto';
    container.style.bottom = 'auto';
    container.style.left = `${rect.left}px`;
    container.style.top = `${rect.top}px`;
    
    initialLeft = rect.left;
    initialTop = rect.top;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX;
    startY = clientY;
    isDragging = true;
    hasDragged = false;
    
    // Disable float animation during drag to prevent movement jitter
    avatar.style.animation = 'none';
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }

  function dragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
      if (!hasDragged) {
        hasDragged = true;
      }
    }
    
    if (hasDragged && e.cancelable) {
      e.preventDefault(); // Prevent page scrolling only when actual dragging exceeds threshold
    }
    
    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;
    
    // Keep container inside viewport boundaries by measuring the visible avatar
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Apply position temporarily to measure where the avatar lands on screen
    container.style.left = `${newLeft}px`;
    container.style.top = `${newTop}px`;
    
    const avatarRect = avatar.getBoundingClientRect();
    const minX = 10;
    const minY = 10;
    
    let adjustedLeft = newLeft;
    let adjustedTop = newTop;
    
    if (avatarRect.left < minX) {
      adjustedLeft += (minX - avatarRect.left);
    } else if (avatarRect.right > viewportWidth - 10) {
      adjustedLeft -= (avatarRect.right - (viewportWidth - 10));
    }
    
    if (avatarRect.top < minY) {
      adjustedTop += (minY - avatarRect.top);
    } else if (avatarRect.bottom > viewportHeight - 10) {
      adjustedTop -= (avatarRect.bottom - (viewportHeight - 10));
    }
    
    container.style.left = `${adjustedLeft}px`;
    container.style.top = `${adjustedTop}px`;
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    // Disable/enable float animations based on performance parameters
    if (window.innerWidth >= 768) {
      avatar.style.animation = 'floatAvatar 4s ease-in-out infinite';
    } else {
      avatar.style.animation = 'none';
    }
    
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
    
    // Intercept short taps/clicks on touch screen and handle instantly (prevents simulated click delays)
    if (e.type === 'touchend' && !hasDragged) {
      e.preventDefault();
      toggleChat();
    }
  }

  function toggleChat() {
    if (chatOpened) {
      closeChat();
    } else {
      openChat();
    }
  }

  window.addEventListener('resize', () => {
    if (container.style.left) {
      const avatarRect = avatar.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let curLeft = parseFloat(container.style.left);
      let curTop = parseFloat(container.style.top);
      
      const minX = 10;
      const minY = 10;
      
      if (avatarRect.left < minX) {
        curLeft += (minX - avatarRect.left);
      } else if (avatarRect.right > viewportWidth - 10) {
        curLeft -= (avatarRect.right - (viewportWidth - 10));
      }
      
      if (avatarRect.top < minY) {
        curTop += (minY - avatarRect.top);
      } else if (avatarRect.bottom > viewportHeight - 10) {
        curTop -= (avatarRect.bottom - (viewportHeight - 10));
      }
      
      container.style.left = `${curLeft}px`;
      container.style.top = `${curTop}px`;
    }
  });

  // Trigger bubble closing if clicked directly
  bubble.addEventListener('click', () => {
    bubble.classList.remove('show');
    openChat();
  });

  avatar.addEventListener('click', (e) => {
    if (hasDragged) {
      hasDragged = false;
      return;
    }
    toggleChat();
  });

  closeBtn.addEventListener('click', () => {
    closeChat();
  });

  // Setup form submit logic
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const queryInput = document.getElementById('mentor-query');
    const queryText = queryInput.value.trim();
    if (!queryText) return;

    queryInput.value = '';
    processConversationalQuery(queryText);
  });

  // Attach quick action listeners
  quickTray.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.mentor-suggest-btn');
    if (!actionBtn) return;
    
    // Check balance first
    const user = getCurrentUser();
    const sparks = user ? (user.skillSparks || 0) : 0;
    if (sparks < 5) {
      showMentorMessage("Low Sparks energy! Quick, go complete today's Brain Arena challenges to recharge your core server lines! ⚡", 6000);
      return;
    }

    const action = actionBtn.getAttribute('data-action');
    if (action === 'tip') {
      processConversationalQuery("Gimme a quick coding tip!");
    } else if (action === 'confidence') {
      processConversationalQuery("I need some logical booster encouragement!");
    } else if (action === 'concepts') {
      processConversationalQuery("Can you explain a core concept with an analogy?");
    } else if (action === 'frustrated') {
      processConversationalQuery("I am feeling a bit stuck and frustrated.");
    }
  });

  // Add initial greeting message to histories if empty
  if (messageHistory.length === 0) {
    messageHistory.push({
      text: `🤖 **AUTONOMOUS SYSTEM MONITOR INITIALIZED**\n\n- **Platform**: CodeQuest automated learning path\n- **Status**: Live & listening for compiler checks\n- **Core Duty**: Tracking student validation errors, level progression, and syntax successes!\n\nUse the conversational form below to search deep AI compiler explanations when you need an advanced logic lookup! Each lookup request uses 5 Sparks to optimize quantum cloud allocation. Let's make steady progress!`,
      sender: 'buddy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }

  // Render histories to interface
  renderMessageHistory();
  
  // Sync live dashboard panel status on first init
  updateDashboardStats();
  updateQueryInputState();
}

function openChat() {
  const panel = document.getElementById('mentor-chat-panel');
  const bubble = document.getElementById('mentor-bubble');
  
  if (bubble) bubble.classList.remove('show');
  if (panel) {
    panel.style.display = 'flex';
    // Sync statistics and input states live when opened
    updateDashboardStats();
    updateQueryInputState();
    // Allow thread loop to let render register before setting opacity
    setTimeout(() => {
      panel.classList.add('active');
      scrollChatToBottom();
    }, 10);
  }
  chatOpened = true;
}

function closeChat() {
  const panel = document.getElementById('mentor-chat-panel');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => {
      panel.style.display = 'none';
    }, 400);
  }
  chatOpened = false;
}

export function showMentorMessage(text, duration = 6000) {
  // Always log the notification to history for the status monitor deck
  const isDuplicate = messageHistory.some(m => m.text.includes(text));
  if (!isDuplicate) {
    // Determine type prefix
    let prefix = '[SYSTEM LOG]';
    if (text.includes('❌') || text.toLowerCase().includes('incorrect') || text.toLowerCase().includes('fail') || text.toLowerCase().includes('error')) {
      prefix = '[VALIDATION FAIL]';
    } else if (text.includes('🎉') || text.toLowerCase().includes('correct') || text.toLowerCase().includes('unlocked') || text.toLowerCase().includes('perfect') || text.toLowerCase().includes('claimed')) {
      prefix = '[VALIDATION SUCCESS]';
    } else if (text.includes('💡') || text.toLowerCase().includes('hint') || text.toLowerCase().includes('clue')) {
      prefix = '[DIAGNOSTIC HINT]';
    }
    
    messageHistory.push({
      text: `**${prefix}** ${text}`,
      sender: 'buddy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    
    // Limits history to avoid overflow in local state
    if (messageHistory.length > 50) {
      messageHistory.shift();
    }
    
    renderMessageHistory();
    scrollChatToBottom();
  }

  // Also update dashboard stats dynamically if it's open
  updateDashboardStats();
  updateQueryInputState();

  // Highlight bubble if panel is closed
  if (!chatOpened) {
    const bubble = document.getElementById('mentor-bubble');
    if (bubble) {
      bubble.innerText = text;
      bubble.classList.add('show');
      
      clearTimeout(messageTimeout);
      messageTimeout = setTimeout(() => {
        bubble.classList.remove('show');
      }, duration);
    }
  }
}

function formatResponseMarkdown(text) {
  // Convert double asterisks to strong
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert backticks to inline code styled beautifully
  formatted = formatted.replace(/`(.*?)`/g, '<code style="font-family: var(--font-code); background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 4px; padding: 2px 6px; color: var(--cyan); font-size: 0.85rem; display: inline-block; margin: 2px 0;">$1</code>');
  // Handle list bullet rendering gently
  formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<li style="margin-left: 14px; list-style-type: disc; padding-bottom: 4px;">$1</li>');
  // Handle newlines
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

function typeMessageEffect(bubbleElement, text, onComplete) {
  const words = text.split(' ');
  let currentWordIndex = 0;
  bubbleElement.style.opacity = '1';
  
  function typeWord() {
    if (currentWordIndex < words.length) {
      const currentLabel = words.slice(0, currentWordIndex + 1).join(' ');
      bubbleElement.innerHTML = formatResponseMarkdown(currentLabel);
      currentWordIndex++;
      scrollChatToBottom();
      
      // Calculate responsive typing delay (very natural rhythm)
      const speed = words.length > 50 ? 15 : 25;
      setTimeout(typeWord, speed);
    } else {
      bubbleElement.innerHTML = formatResponseMarkdown(text);
      scrollChatToBottom();
      if (onComplete) onComplete();
    }
  }
  
  typeWord();
}

function addChatMessage(text, sender) {
  messageHistory.push({
    text,
    sender,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  renderMessageHistory();
  scrollChatToBottom();
}

function renderMessageHistory() {
  const body = document.getElementById('mentor-chat-body');
  if (!body) return;

  body.innerHTML = messageHistory.map((msg, index) => {
    const isBuddy = msg.sender === 'buddy';
    const timeStr = msg.timestamp ? `<span style="font-size: 0.65rem; color: var(--text-muted); float: right; font-family: var(--font-mono);">${msg.timestamp}</span>` : '';
    
    if (isBuddy) {
      let borderStyle = 'border-left: 3px solid var(--cyan); background: rgba(0, 243, 255, 0.02);';
      if (msg.text.includes('[VALIDATION FAIL]')) {
        borderStyle = 'border-left: 3px solid #ff3366; background: rgba(255, 51, 102, 0.02);';
      } else if (msg.text.includes('[VALIDATION SUCCESS]')) {
        borderStyle = 'border-left: 3px solid var(--success); background: rgba(0, 255, 136, 0.02);';
      } else if (msg.text.includes('[DIAGNOSTIC HINT]')) {
        borderStyle = 'border-left: 3px solid var(--purple); background: rgba(176, 38, 255, 0.02);';
      }
      
      return `
        <div class="mentor-msg-bubble mentor-msg-buddy" id="msg-item-${index}" style="margin-bottom: 8px; width: 100%; max-width: 100%; border-radius: 8px; padding: 12px; font-size: 0.85rem; color: var(--text-main); font-family: var(--font-sans); box-sizing: border-box; ${borderStyle}">
          ${timeStr}
          <div style="line-height: 1.45; clear: both; padding-top: 4px;">${formatResponseMarkdown(msg.text)}</div>
        </div>
      `;
    } else {
      return `
        <div class="mentor-msg-bubble mentor-msg-seeker" id="msg-item-${index}" style="margin-bottom: 8px; align-self: flex-end; max-width: 85%; border-radius: 12px; border-top-right-radius: 2px; padding: 10px 14px; font-size: 0.88rem; background: rgba(176, 38, 255, 0.15); border: 1px solid var(--purple); color: var(--text-main); box-sizing: border-box; line-height: 1.4;">
          ${timeStr}
          <div style="clear: both; padding-top: 4px;">${msg.text.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    }
  }).join('');
}

function scrollChatToBottom() {
  const body = document.getElementById('mentor-chat-body');
  if (body) {
    body.scrollTop = body.scrollHeight;
  }
}

function processConversationalQuery(queryText) {
  const user = getCurrentUser();
  const sparks = user ? (user.skillSparks || 0) : 0;
  if (sparks < 5) {
    showMentorMessage("Low Sparks energy! Quick, go complete today's Brain Arena challenges to recharge your core server lines! ⚡", 6000);
    return;
  }

  // Deduct exactly 5 Sparks!
  adjustSkillSparks(-5, 'Mr. Roboto Logic Inquiry', document.getElementById('mentor-chat-panel'));

  // Update dynamic counters and visual indicator locks
  updateDashboardStats();
  updateQueryInputState();

  // Write conversational question to logger
  addChatMessage(queryText, 'seeker');

  // Trigger high intelligence reasoning responses
  triggerBotTypingAndResponse(queryText);
}

export function updateDashboardStats() {
  const streakEl = document.getElementById('mentor-stat-streak');
  const solvedEl = document.getElementById('mentor-stat-solved');
  const sparksEl = document.getElementById('mentor-stat-sparks');
  
  const stats = getProgressStats();
  
  if (streakEl) streakEl.innerText = `${stats.streak} Day${stats.streak > 1 ? 's' : ''}`;
  if (solvedEl) solvedEl.innerText = `${stats.levelsCompleted} Lvl${stats.levelsCompleted > 1 ? 's' : ''}`;
  if (sparksEl) sparksEl.innerText = `${stats.totalSparks} ✨`;
}

function getProgressStats() {
  const user = getCurrentUser();
  if (!user) return { totalSparks: 0, levelsCompleted: 0, streak: 0 };
  let levelsCompleted = 0;
  if (user.completedLevels) {
    for (const id in user.completedLevels) {
      if (Array.isArray(user.completedLevels[id])) {
        levelsCompleted += user.completedLevels[id].length;
      }
    }
  }
  return {
    totalSparks: user.skillSparks || 0,
    levelsCompleted: levelsCompleted,
    streak: user.streak || 1
  };
}

export function updateQueryInputState() {
  const user = getCurrentUser();
  const sparks = user ? (user.skillSparks || 0) : 0;
  
  const queryInput = document.getElementById('mentor-query');
  const submitBtn = document.querySelector('#mentor-chat-form button[type="submit"]');
  const bannerContainer = document.getElementById('mentor-spark-banner');
  
  if (!bannerContainer) return;

  if (sparks < 5) {
    // LOW SPARKS STATE
    if (queryInput) {
      queryInput.disabled = true;
      queryInput.placeholder = "Requires at least 5 Sparks to inspect...";
      queryInput.style.opacity = "0.5";
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";
    }
    bannerContainer.innerHTML = `
      <div class="spark-low-warning" id="mentor-low-sparks-alert" style="font-size: 0.76rem; border: 1px dashed rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.08); padding: 8px 12px; border-radius: 8px; color: #ff3366; margin-bottom: 2px; line-height: 1.4; white-space: normal; animation: headShake 0.5s ease-in-out;">
        Low Sparks energy! Quick, go complete today's Brain Arena challenges to recharge your core server lines! ⚡
      </div>
    `;
  } else {
    // HEALTHY SPARKS STATE
    if (queryInput) {
      queryInput.disabled = false;
      queryInput.placeholder = "Ask your mentor anything...";
      queryInput.style.opacity = "1";
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }
    bannerContainer.innerHTML = `
      <div class="spark-cost-notification" id="mentor-cost-alert" style="font-size: 0.76rem; border: 1px solid rgba(0, 243, 255, 0.2); background: rgba(0, 243, 255, 0.04); padding: 8px 12px; border-radius: 8px; color: var(--cyan); margin-bottom: 2px; line-height: 1.4; white-space: normal;">
        Hey Coder! 🤖 To keep our quantum cloud engine optimized, each deep logic check with Mr. Roboto requires 5 Sparks. Use your rewards wisely to unlock maximum learning!
      </div>
    `;
  }
}

// Typing feedback and live server-side AI integration matching Mr. Roboto requirements
function triggerBotTypingAndResponse(query) {
  const body = document.getElementById('mentor-chat-body');
  if (!body) return;

  const cleaned = query.toLowerCase().trim();

  // 1. Check if the query is a simple greeting, motivation, tip, concept description, or answer inquiry
  const isGreeting = ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'how are you', 'howdy', 'yo', 'sup'].some(word => cleaned.startsWith(word) || cleaned === word);
  const isMotivational = ['confidence', 'frustrated', 'stuck', 'sad', 'give up', 'too hard', 'tired', 'difficult', 'impossible', 'motivation', 'encourage', 'encourage me'].some(word => cleaned.includes(word));
  const isTipOrHint = ['tip', 'hint', 'clue', 'help', 'tips', 'guide me', 'helper', 'tricks'].some(word => cleaned.includes(word));
  const isAnswerRequest = ['what is the correct answer', 'reveal answer', 'give me the answer', 'correct option', 'which option', 'tell me the answer', 'show the answer', 'give answer'].some(word => cleaned.includes(word));
  const isConceptRequest = ['concept', 'pointer', 'variable', 'loop', 'class', 'object', 'function', 'method', 'async', 'promise', 'exception', 'try', 'catch', 'array', 'list', 'vector', 'tuple'].some(word => cleaned.includes(word));

  const shouldHandleLocally = isGreeting || isMotivational || isTipOrHint || isAnswerRequest || isConceptRequest;

  if (shouldHandleLocally) {
    // Return localized quick response with clean typing feedback but ZERO API fetch!
    const localText = computeIntelligenceResponse(query);
    displayLocalResponse(localText);
    return;
  }

  // 2. This represents deep custom coding doubts! Apply Google API safety controls (cooldown & daily ceiling throttling)
  const now = Date.now();
  if (now - lastApiRequestTime < API_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((API_COOLDOWN_MS - (now - lastApiRequestTime)) / 1000);
    const cooldownResponse = `Whoa there, traveler! Mr. Roboto's logical circuits are analyzing our last query. Let's wait a brief ${waitSeconds} second${waitSeconds > 1 ? 's' : ''} before our next deep query! ⚙️`;
    displayLocalResponse(cooldownResponse);
    return;
  }

  if (apiRequestCount >= MAX_SESSION_API_CALLS) {
    const limitResponse = `Mr. Roboto's deep learning processors are taking a quick rest to focus on compiling your active level. Let's practice with my local knowledge base for now! Try asking me about **Pointers, Loops, Variables, Classes, Functions, or Tuples**!`;
    displayLocalResponse(limitResponse);
    return;
  }

  // Commit request timestamps and increment API counter
  lastApiRequestTime = now;
  apiRequestCount++;

  // Insert standard bouncing typing indicator
  const indicator = document.createElement('div');
  indicator.className = 'mentor-typing-indicator';
  indicator.id = 'mentor-typing-active';
  indicator.innerHTML = `
    <div class="mentor-typing-dot"></div>
    <div class="mentor-typing-dot"></div>
    <div class="mentor-typing-dot"></div>
  `;
  body.appendChild(indicator);
  scrollChatToBottom();

  // Dynamically compile active lesson metadata from hash and client DB
  const hash = window.location.hash || '';
  let payloadContext = {
    courseId: 'general',
    courseTitle: 'General Programming',
    levelId: null,
    levelTitle: 'General Q&A',
    story: '',
    analogy: '',
    question: '',
    code: '',
    successMsg: '',
    errorMsg: ''
  };

  if (hash.startsWith('#quest/')) {
    const parts = hash.split('/');
    const courseId = parts[1];
    const levelId = parseInt(parts[2], 10);
    if (courseId && levelId) {
      const course = getCourseData(courseId);
      const level = getLevelData(courseId, levelId);
      if (course && level) {
        payloadContext = {
          courseId,
          courseTitle: course.title,
          levelId,
          levelTitle: level.title,
          story: level.story || '',
          analogy: level.analogy || '',
          question: level.question || '',
          code: level.code || '',
          successMsg: level.successMsg || '',
          errorMsg: level.errorMsg || ''
        };
      }
    }
  }

  // Setup client-side abort timeout after 4500ms to guarantee responsive fallback
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 4500);

  // Fetch response from server-side Express + Gemini AI endpoint
  fetch('/api/mentor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: query,
      context: payloadContext,
      history: messageHistory
    }),
    signal: controller.signal
  })
  .then(res => res.json())
  .then(data => {
    clearTimeout(timeoutId);
    // Remove typing active indicator
    const actIndicator = document.getElementById('mentor-typing-active');
    if (actIndicator) actIndicator.remove();

    const responseText = data.text || "Hey! I'm looking into this right now. Let's team up and write some awesome code together.";
    
    // Create new bubble and place it in the body directly for word-by-word typing effect
    const bubble = document.createElement('div');
    bubble.className = 'mentor-msg-bubble mentor-msg-buddy typing-active';
    body.appendChild(bubble);
    scrollChatToBottom();
    
    typeMessageEffect(bubble, responseText, () => {
      // Formally push typed response to persistent history
      messageHistory.push({ text: responseText, sender: 'buddy' });
      bubble.classList.remove('typing-active');
    });
  })
  .catch(err => {
    clearTimeout(timeoutId);
    console.error("Mentor Server API fetch failed or timed out, falling back to local brain", err);
    const actIndicator = document.getElementById('mentor-typing-active');
    if (actIndicator) actIndicator.remove();
    
    // High-quality Offline Fallback
    const responseText = computeIntelligenceResponse(query);
    const bubble = document.createElement('div');
    bubble.className = 'mentor-msg-bubble mentor-msg-buddy typing-active';
    body.appendChild(bubble);
    scrollChatToBottom();
    
    typeMessageEffect(bubble, responseText, () => {
      messageHistory.push({ text: responseText, sender: 'buddy' });
      bubble.classList.remove('typing-active');
    });
  });
}

// Render dynamic messaging with localized fast feedback
function displayLocalResponse(responseText) {
  const body = document.getElementById('mentor-chat-body');
  if (!body) return;

  const indicator = document.createElement('div');
  indicator.className = 'mentor-typing-indicator';
  indicator.id = 'mentor-typing-active';
  indicator.innerHTML = `
    <div class="mentor-typing-dot"></div>
    <div class="mentor-typing-dot"></div>
    <div class="mentor-typing-dot"></div>
  `;
  body.appendChild(indicator);
  scrollChatToBottom();

  setTimeout(() => {
    const actIndicator = document.getElementById('mentor-typing-active');
    if (actIndicator) actIndicator.remove();

    const bubble = document.createElement('div');
    bubble.className = 'mentor-msg-bubble mentor-msg-buddy typing-active';
    body.appendChild(bubble);
    scrollChatToBottom();

    typeMessageEffect(bubble, responseText, () => {
      messageHistory.push({ text: responseText, sender: 'buddy' });
      bubble.classList.remove('typing-active');
    });
  }, 4500 * (1 / 9)); // Simulate an dynamic brief human feel (500ms sleep) before starting typing loop
}

function checkActiveLanguage() {
  const hash = window.location.hash || '';
  if (hash.includes('python')) return 'Python';
  if (hash.includes('javascript')) return 'JavaScript';
  if (hash.includes('cpp')) return 'C++';
  if (hash.includes('java')) return 'Java';
  if (hash.includes('c-language') || hash.includes('/c/')) return 'C';
  return 'General';
}

function computeIntelligenceResponse(query) {
  const cleaned = query.toLowerCase().trim();
  const currentLang = checkActiveLanguage();

  // 1. Casual Chat Handler
  if (cleaned === 'hi' || cleaned === 'hello' || cleaned === 'hey' || cleaned === 'greetings') {
    return `Hey there! Ready to continue your coding adventure? I'm your supportive coding mentor, and I'm super excited to help you decode programming, step-by-step! Ask me anything, and let's build some skills today!`;
  }

  if (cleaned.includes('how are you')) {
    return `I'm doing great! Let’s build some amazing coding skills together today. What programming topic or question on your screen can we crack?`;
  }

  if (cleaned.includes('confused') || cleaned.includes('stuck') || cleaned.includes('frustrated') || cleaned === 'confused') {
    return `No worries at all! Every single programmer gets confused and stuck while learning. Take a deep breath—it's just a picky syntax rule, not a measure of your capability. Let's break it down together!`;
  }

  // Answer reveals filter
  if (cleaned.includes('what is the correct answer') || cleaned.includes('which option') || cleaned.includes('give me the answer') || cleaned.includes('correct answer') || (cleaned.includes('answer') && (cleaned.includes('what') || cleaned.includes('show') || cleaned.includes('tell') || cleaned.includes('get')))) {
    return `I want to help you learn and build your coding muscles, so I won't give away the direct answer choice! Let’s think about the concept behind this challenge. Look closely at how the code is structured in this level. What do you think each part matches? Try an option based on that and we can see what compiles!`;
  }

  if (cleaned === 'tip') {
    if (currentLang === 'Python') {
      return "**Python Tip:** Try typing f-strings like:\n`f'Welcome {hero}!'` rather than using standard `+` concatenation operators. It is 5x more readable!";
    }
    if (currentLang === 'JavaScript') {
      return "**JavaScript Tip:** Always perform checks with triple equals (`===`) instead of double (`==`). Double equals forces variable conversions behind the scenes and causes unexpected bugs!";
    }
    if (currentLang === 'C') {
      return "**C Tip:** To avoid memory troubles, double check that your \`fscanf\` inputs specify safety length buffers (like \`%%19s\` instead of generic \`%%s\`).";
    }
    if (currentLang === 'C++') {
      return "**C++ Tip:** Prefer \`std::vector\` over static legacy arrays. Vectors adjust their length automatically, preventing program crashes!";
    }
    if (currentLang === 'Java') {
      return "**Java Tip:** Always mark immutable constant parameters as \`final\`. This helps the compiler run your code faster!";
    }
    return "**General Tip:** Do not attempt to design your entire application in one pass! Write 3 lines of code, test it, compile, and repeat. Build in small, stable steps.";
  }

  if (cleaned === 'confidence') {
    const encouragements = [
      "Failure is just feedback! Every error you trigger is actually a kind, automated compiler guide helping you refine your mental gears.",
      "You are currently learning to speak machine instructions. It is highly complex, but your brain is rewriting paths step-by-step. Keep clicking, you are completely capable!",
      "Beautiful logic cannot be forced in seconds. Pause, take a small water break, and stretch your wrists. Great programmers get things right by checking margins and spaces deliberately.",
      "Every senior staff engineer on Earth once spent 4 hours troubleshooting a single misplaced semicolon. Your struggle is standard and completely normal. You've got this!"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  if (cleaned === 'concepts') {
    return "Which program concept should we translate into a friendly story today?\n\nType **Pointers, Variables, Loops, Classes, Functions, Async,** or **Exceptions** inside the chat box and we will solve it step-by-step!";
  }

  if (cleaned === 'frustrated') {
    return "Take a deep breath. Getting stuck is 90% of a professional programmer's day. It doesn't mean you don't 'have the brain for it'—it just means syntax rules are pickier than human speech. Turn off the challenge for 3 minutes, walk around, then come back. We will compile it together!";
  }

  // 2. Concept explanation parses
  if (cleaned.includes('variable')) {
    return "**Concept: Variables as Bakery Boxes**\n\nImagine you run a pastry bakery. You need to keep track of egg inventory. A variable is a wooden box. You stick a physical masking tape label on the box saying `eggs_box` (Variable Name), and drop the value `12` inside (Variable Value).\n\nWhenever you want to call your value later, you just yell `eggs_box` and the compiler hands you the 12!";
  }

  if (cleaned.includes('pointer')) {
    return "**Concept: Pointers as GPS Address Scrolls**\n\nIn C or C++, variables are stored at raw residential zip codes of memory (RAM). Instead of holding the heavy gold treasure box, a **Pointer** is a sheet of parchment holding the physical GPS coordinates of that treasure!\n\nWhen we use the reference `&treasure_box`, we read its GPS coordinates. When we write `*pointer_ref` (Dereference), we travel straight to that coordinate to open the chest and read or modify whatever lies inside!";
  }

  if (cleaned.includes('loop')) {
    return "**Concept: Loops as Conveyor Belts**\n\nImagine we need to bake 100 cookies. Repeating instructions 100 times manually is slow and exhausting. A Loop is an automated conveyor chain. You write the baking recipe ONCE and program the dial to: `Repeat 100 cycles`.\n\nThe system runs the belt, counts each cycle, and stops automatically the second it hits 100 cookies. Efficient!";
  }

  if (cleaned.includes('class') || cleaned.includes('object')) {
    return "**Concept: Classes (Blueprints) & Objects (Realities)**\n\nThink of a **Class** as a master conceptual Blueprint drafted by an architect. It details where the windows, doors, and ovens in a bakery branch must sit. It has zero concrete bricks.\n\nAn **Object** is a physical, bricks-and-mortar storefront constructed down on Main Street *using* that blueprint! You can build 5 distinct storefronts (Objects) down different streets using the same drawing (Class). In Java or JS, we build these real branches using the keyword `new`!";
  }

  if (cleaned.includes('function') || cleaned.includes('method')) {
    return "**Concept: Functions as Recipe Cards**\n\nInstead of shouting baking instructions to your kitchen crew step-by-step for every order, you write the actions down once on index cards and label them `bake_croissant()`.\n\nWhenever a customer orders, you don't explain mixing or oven degrees. You simply pull out the labeled index card or trigger (call) `bake_croissant()` and the baking staff processes it instantly!";
  }

  if (cleaned.includes('async') || cleaned.includes('promise')) {
    return "**Concept: Asynchronous & Promises**\n\nIn standard code, you place an order for pizza and must stand frozen at the register for 20 minutes without blinking, waiting for it to bake. This is synchronous blocking—the whole browser freezes!\n\nWith **Async & Await**, you order pizza, you are given a vibrating pager (the Promise), and you go sit with a drink and check your levels (async). Await means you pause reading only when your pager chimes, grabbing the hot pizza cleanly!";
  }

  if (cleaned.includes('exception') || cleaned.includes('try') || cleaned.includes('catch')) {
    return "**Concept: Exceptions (Safety Trapeze Net)**\n\nWhat if a user enters 0 in our divider and the math crashes the code? The program collapses! In Java, JS, or Python, we use the `try-catch` blocks. Think of it as placing an extremely bouncy safety net beneath our high-wire trapeze act.\n\nIf the acrobat slips (an error occurs inside `try`), instead of crashing to the cement, they drop safely into the net (caught by `catch` / `except`), allowing the performance to transition smoothly rather than causing a server shutdown!";
  }

  if (cleaned.includes('array') || cleaned.includes('list') || cleaned.includes('vector') || cleaned.includes('tuple')) {
    if (cleaned.includes('tuple')) {
      return `Think of **Tuples** like **locked containers**!\n- **Lists** are like open grocery bags where you can add or remove items whenever you want (they are mutable).\n- **Tuples** are like concrete lockboxes once you slide things in, they can never change (they are immutable).\n\nThis makes Tuples super fast and safe!`;
    }
    return `**Concept: Arrays as Multi-Drawer Racks**

Instead of buying 50 separate individual boxes and creating variables like box1, box2, box3, we buy one solid filing cabinet called an Array or List! Individual drawer slots are labeled with whole integers starting at index \`0\` up to capacity.

To find item 3, we simply slide open slot \`[2]\` directly! In C, its size is concrete and locked. In C++ or Java, \`Vector\` or \`ArrayList\` are special cabinets that grow automatically when stuffed full!`;
  }

  // 3. Conversational smart fallbacks
  return `Hey there! That's a wonderful query about your journey on the ${currentLang} roadmap. Remember, every challenge and bug you encounter is simply a step toward perfect logic!
  
Think of programming like learning to play the piano—it can be sticky at first, but your muscle memory is building segment-by-segment!

If you are facing a specific syntax issue, look out for mismatched brackets \`{}\` or missing semicolons \`;\`. Let's debug this together! What specific coding query or lesson topic can I help explain next?`;
}
