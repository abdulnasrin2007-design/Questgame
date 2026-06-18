// Achievement Badge Component - Dynamically generates and displays high-fidelity digital credentials for course completions
import confetti from 'canvas-confetti';
import { getCurrentUser } from '../auth.js';

/**
 * Shows a gorgeous, highly custom achievement badge modal for a completed course.
 * @param {string} courseId - The id of the completed language course.
 */
export function showAchievementBadgeModal(courseId) {
  const user = getCurrentUser();
  if (!user) return;

  // Map course IDs to display details, colors, and descriptions
  const courseDetails = {
    python: {
      name: 'Python',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      color: '#306998',
      secondaryColor: '#ffd43b',
      shadowColor: 'rgba(48, 105, 152, 0.4)',
      credentialId: 'CQ-PY-88432',
      difficulty: 'Beginner to Intermediate Core',
      description: 'Mastered variables, integers, floats, dynamic formatted f-strings, input/output listeners, modulo arithmetic logic, conditional if-else loops, list indexing, immutable tuple security, dictionary key mappings, de-duplicating item sets, random module logic, try-except safety, classes and object blueprints.',
      sparkCount: 200
    },
    c: {
      name: 'C Language',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
      color: '#00599c',
      secondaryColor: '#a8b9cc',
      shadowColor: 'rgba(0, 89, 156, 0.4)',
      credentialId: 'CQ-CL-49210',
      difficulty: 'System Foundations & Memory',
      description: 'Mastered precise explicit static type declarations, standard format specifiers, scanf console user input streams, compiler branch evaluations, foghorn nested iterations, arrays, zero-index score tracking, return types, pointers, structured grouping alignment, dynamic memory allocation with malloc and free.',
      sparkCount: 100
    },
    java: {
      name: 'Java',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      color: '#f89820',
      secondaryColor: '#5382a1',
      shadowColor: 'rgba(248, 152, 32, 0.4)',
      credentialId: 'CQ-JV-77312',
      difficulty: 'Enterprise & Virtual Machines',
      description: 'Mastered explicit System objects, type castings, keyboard util parsing, decision block structures, loop counters, fixed multi-element collections, void function signatures, class blueprint attributes, heap storage instantiation, constructor initializers, extends keyword inheritance, method overloading signatures, try-catch exception guards, and virtual machine bytecode mechanics.',
      sparkCount: 150
    },
    javascript: {
      name: 'JavaScript',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      color: '#f7df1e',
      secondaryColor: '#323330',
      shadowColor: 'rgba(247, 223, 30, 0.4)',
      credentialId: 'CQ-JS-10926',
      difficulty: 'Modern Web Engineering',
      description: 'Mastered mutable block scoping, exact string template interpolation, arrow function syntax constructs, fallback evaluation pathways, loop arrays, custom object mapping properties, document node selection query triggers, event listener attachments, storage persistence wrappers, dynamic promise timers, and async-await fetch integrations.',
      sparkCount: 130
    },
    cpp: {
      name: 'C++',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
      color: '#00599c',
      secondaryColor: '#659ad2',
      shadowColor: 'rgba(0, 89, 156, 0.4)',
      credentialId: 'CQ-CP-35511',
      difficulty: 'High-Performance Systems & OOP',
      description: 'Mastered print streaming operators, user input extractions, backward counters, solar grid collections, class private member encapsulation, standard constructor functions, public inheritance syntax, dynamic resizable C++ Standard Template Library vectors, and output file writing configurations.',
      sparkCount: 100
    }
  };

  const details = courseDetails[courseId] || {
    name: courseId.toUpperCase(),
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: 'var(--cyan)',
    secondaryColor: 'var(--purple)',
    shadowColor: 'var(--cyan-glow)',
    credentialId: 'CQ-GEN-999',
    difficulty: 'Core Coding',
    description: 'Mastered core syntax, loops, conditions, functions, and standard data types.',
    sparkCount: 100
  };

  // Remove existing badge modals
  const oldModal = document.getElementById('achievement-badge-modal');
  if (oldModal) oldModal.remove();

  // Create style element if not exists
  const styleId = 'achievement-badge-custom-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      .badge-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(4, 6, 12, 0.96); /* Flat fully opaque backdrop to protect CPU cycle rendering */
        z-index: 10050;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        animation: badgeFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
        will-change: opacity; /* GPU hardware accelerated */
      }
      .badge-modal-card {
        background: #0a0e17;
        border: 2px solid ${details.color};
        box-shadow: 0 0 35px ${details.shadowColor}, inset 0 0 20px rgba(255, 255, 255, 0.02);
        border-radius: 20px;
        width: 100%;
        max-width: 580px;
        position: relative;
        transform: translateY(30px) scale(0.95);
        animation: badgeCardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        overflow: hidden;
        color: var(--text-main);
        box-sizing: border-box;
      }
      .badge-modal-banner {
        height: 12px;
        background: linear-gradient(90deg, ${details.color}, ${details.secondaryColor});
        display: block;
      }
      .badge-modal-content {
        padding: 30px;
        text-align: center;
        box-sizing: border-box;
      }
      .badge-diploma-wrapper {
        background: radial-gradient(circle at 50% 50%, rgba(13, 20, 35, 0.95) 0%, rgba(5, 7, 13, 1) 100%);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 14px;
        padding: 25px;
        position: relative;
        overflow: hidden;
        margin-top: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      /* Cyber Decorative Borders */
      .badge-diploma-wrapper::before {
        content: "";
        position: absolute;
        top: 6px; left: 6px; right: 6px; bottom: 6px;
        border: 1px solid rgba(255, 255, 255, 0.02);
        pointer-events: none;
        border-radius: 10px;
      }
      .badge-certificate-seal {
        width: 75px;
        height: 75px;
        border-radius: 50%;
        border: 2px dashed ${details.color};
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.4);
        position: relative;
        animation: sealPulse 3s ease-in-out infinite;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.02);
      }
      .badge-certificate-seal img {
        width: 36px;
        height: 36px;
        filter: drop-shadow(0 0 5px ${details.shadowColor});
      }
      .verified-stamp {
        font-family: var(--font-code);
        font-size: 0.58rem;
        color: ${details.secondaryColor};
        letter-spacing: 0.5px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 3px 8px;
        border-radius: 12px;
        display: inline-block;
        margin-top: 15px;
      }
      .certificate-user-name {
        font-family: var(--font-sans);
        font-size: 1.8rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--text-main) 30%, ${details.color} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 12px 0 2px 0;
        letter-spacing: -0.5px;
      }
      .certificate-course-title {
        font-family: var(--font-sans);
        text-transform: uppercase;
        font-weight: 700;
        font-size: 0.82rem;
        color: ${details.color};
        letter-spacing: 1.5px;
        margin-bottom: 12px;
      }
      .certificate-description {
        font-size: 0.76rem;
        line-height: 1.45;
        color: var(--text-muted);
        text-align: justify;
        text-align-last: center;
        margin: 0 auto;
        max-width: 440px;
      }
      .certificate-footer-grid {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        margin-top: 20px;
        padding-top: 12px;
        font-size: 0.62rem;
        color: var(--text-muted);
        font-family: var(--font-sans);
      }
      .sign-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .signature-img {
        font-family: 'Georgia', serif;
        font-style: italic;
        font-size: 0.95rem;
        color: white;
        background: linear-gradient(135deg, white, ${details.color});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: bold;
        letter-spacing: 0.5px;
      }
      .btn-download-badge {
        background: transparent;
        border: 1px solid ${details.color};
        color: var(--text-main);
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        margin-top: 20px;
      }
      .btn-download-badge:hover {
        background: ${details.color};
        color: #000;
        box-shadow: 0 0 15px ${details.shadowColor};
        transform: translateY(-2px);
      }
      @keyframes badgeFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes badgeCardPop {
        from { transform: translateY(30px) scale(0.95); }
        to { transform: translateY(0) scale(1); }
      }
      @keyframes sealPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(255,255,255,0.02); }
        50% { transform: scale(1.05); box-shadow: 0 0 25px ${details.shadowColor}; }
      }
      
      /* Print styles */
      @media print {
        body * {
          visibility: hidden;
        }
        #achievement-badge-modal, #achievement-badge-modal * {
          visibility: visible;
        }
        #achievement-badge-modal {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
        .badge-modal-overlay {
          background: white !important;
          padding: 0 !important;
        }
        .badge-modal-card {
          border: none !important;
          box-shadow: none !important;
          background: white !important;
          color: black !important;
          max-width: 100% !important;
        }
        .badge-diploma-wrapper {
          border: 2px solid black !important;
          background: white !important;
          color: black !important;
          box-shadow: none !important;
        }
        .certificate-user-name {
          -webkit-text-fill-color: black !important;
          color: black !important;
        }
        .btn-download-badge, .badge-close-btn {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  const currentDateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const modalHtml = `
    <div id="achievement-badge-modal" class="badge-modal-overlay">
      <div class="badge-modal-card">
        <div class="badge-modal-banner"></div>
        <button class="badge-close-btn" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items:center; justify-content:center; cursor:pointer;" title="Close Modal">&times;</button>
        <div class="badge-modal-content">
          <h2 class="text-gradient" style="font-weight: bold; font-size: 1.4rem; margin: 0 0 10px 0; font-family: var(--font-sans);">ACHIEVEMENT UNLOCKED</h2>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0 0 20px 0;">Your masterful programming path has triggered a verified credential.</p>
          
          <div class="badge-diploma-wrapper" id="printable-badge-area">
            <div class="badge-certificate-seal">
              <img src="${details.icon}" alt="${details.name} Badge Seal" />
            </div>
            
            <div class="verified-stamp">VERIFIED SECURED: ${details.credentialId}</div>
            
            <h3 class="certificate-user-name">${user.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.72rem; margin: 0; font-family: var(--font-sans);">HAS TRIUMPHANTLY ACQUIRED THE</p>
            <h4 class="certificate-course-title">${details.name} Achievement Badge</h4>
            
            <p class="certificate-description">${details.description}</p>
            
            <div class="certificate-footer-grid">
              <div class="sign-block" style="align-items: flex-start;">
                <span class="signature-img">Abdul Nasrin</span>
                <span style="border-top:1px solid rgba(255,255,255,0.08); width: 80px; height:1px; margin-top:2px;"></span>
                <span>Master Designer, CodeQuest</span>
              </div>
              <div class="sign-block" style="text-align: center;">
                <span style="font-family: var(--font-code); color: var(--success); font-weight:700;">ACTIVE</span>
                <span>Academic Status</span>
              </div>
              <div class="sign-block" style="align-items: flex-end;">
                <span style="color: white; font-weight:600; font-family: var(--font-code);">${currentDateStr}</span>
                <span style="border-top:1px solid rgba(255,255,255,0.08); width: 60px; height:1px; margin-top:2px;"></span>
                <span>Credential Date</span>
              </div>
            </div>
          </div>
          
          <div style="display:flex; gap:12px; justify-content: center;">
            <button id="download-badge-doc-btn" class="btn-download-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Print Certification Badge
            </button>
            <button id="close-badge-doc-btn" class="btn-download-badge" style="border-color: rgba(255,255,255,0.15)">
              Return to Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append new modal to body
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  document.body.appendChild(tempDiv.firstElementChild);

  // Bind close buttons
  const modalObj = document.getElementById('achievement-badge-modal');
  const closeBtns = modalObj.querySelectorAll('.badge-close-btn, #close-badge-doc-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalObj.remove();
    });
  });

  // Bind print/download button
  const printBtn = document.getElementById('download-badge-doc-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Trigger high production confetti celebration!
  var duration = 2.5 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 10100 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    var particleCount = 45 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.2, 0.4), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.6, 0.8), y: Math.random() - 0.2 } }));
  }, 200);
}
