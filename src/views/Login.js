import { loginUser, signupUser, canResetPassword, resetUserPassword } from '../auth.js';
import { showMentorMessage } from '../components/Mentor.js';

export function renderLogin() {
  return `
    <div class="auth-container fade-in">
      <div class="glass-panel auth-box" id="auth-box-content">
        <!-- Renders Login switcher, Signup, or Forgot Password view dynamically -->
      </div>
    </div>
  `;
}

export function mountLogin() {
  const container = document.getElementById('auth-box-content');
  if (!container) return;

  let currentEmail = '';
  let generatedCode = '';
  let currentTab = 'login'; // 'login' or 'signup'

  function renderLoginState() {
    container.innerHTML = `
      <h1 class="text-gradient" style="font-size: 2.5rem; margin-bottom: 5px;">CodeQuest</h1>
      <p style="color: var(--cyan); margin-bottom: 1.5rem;">Learn coding without fear</p>
      
      <!-- Authentic tab switcher -->
      <div style="display: flex; gap: 8px; margin-bottom: 1.8rem; background: rgba(255, 255, 255, 0.03); padding: 4px; border-radius: 8px; border: 1px solid var(--element-border);">
        <button id="tab-login" class="btn-neon" style="flex: 1; padding: 10px; font-size: 0.9rem; border: none; background: ${currentTab === 'login' ? 'var(--cyan-glow)' : 'transparent'}; color: ${currentTab === 'login' ? 'var(--cyan)' : 'var(--text-muted)'}; box-shadow: ${currentTab === 'login' ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none'}; cursor: pointer; border-radius: 6px; font-weight: bold; transition: all 0.2s;">
          Log In
        </button>
        <button id="tab-signup" class="btn-neon" style="flex: 1; padding: 10px; font-size: 0.9rem; border: none; background: ${currentTab === 'signup' ? 'var(--purple-glow)' : 'transparent'}; color: ${currentTab === 'signup' ? 'var(--purple)' : 'var(--text-muted)'}; box-shadow: ${currentTab === 'signup' ? '0 0 10px rgba(176, 38, 255, 0.2)' : 'none'}; cursor: pointer; border-radius: 6px; font-weight: bold; transition: all 0.2s;">
          Sign Up
        </button>
      </div>

      ${currentTab === 'login' ? `
        <!-- LOGIN FORM -->
        <form id="login-form">
          <div class="input-group">
            <label>Enter your email</label>
            <input type="email" id="email" class="input-neon" placeholder="name@earth.planet" required>
          </div>
          <div class="input-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label style="margin-bottom: 0;">Type password</label>
              <button type="button" id="forgot-password-trigger" style="background: none; border: none; font-size: 0.82rem; color: var(--cyan); cursor: pointer; padding: 0; outline: none; transition: all 0.2s;" onmouseover="this.style.textShadow='0 0 8px var(--cyan)'" onmouseout="this.style.textShadow='none'">Forgot Password?</button>
            </div>
            <input type="password" id="password" class="input-neon" placeholder="••••••••" required>
          </div>
          
          <div id="login-error-msg" style="color: var(--error); font-size: 0.85rem; margin-bottom: 1rem; display: none; text-shadow: 0 0 5px var(--error-glow); text-align: left;"></div>
          
          <button type="submit" class="btn-neon" style="width: 100%; margin-top: 1rem;">Start Learning</button>
        </form>
      ` : `
        <!-- SIGNUP FORM -->
        <form id="signup-form">
          <div class="input-group">
            <label>Your Name / Nickname</label>
            <input type="text" id="username" class="input-neon" placeholder="Future Developer" required>
          </div>
          <div class="input-group">
            <label>Your Email Address</label>
            <input type="email" id="signup-email" class="input-neon" placeholder="name@earth.planet" required>
          </div>
          <div class="input-group">
            <label>Create Password</label>
            <input type="password" id="signup-password" class="input-neon" placeholder="••••••••" required>
          </div>
          <div class="input-group">
            <label>Confirm Password</label>
            <input type="password" id="signup-confirm-password" class="input-neon" placeholder="••••••••" required>
          </div>
          
          <div id="signup-error-msg" style="color: var(--error); font-size: 0.85rem; margin-bottom: 1rem; display: none; text-shadow: 0 0 5px var(--error-glow); text-align: left;"></div>
          
          <button type="submit" class="btn-neon btn-purple" style="width: 100%; margin-top: 1rem;">Create Quest Account</button>
        </form>
      `}
      
      <p style="margin-top: 1.8rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
        Your progress is permanently saved locally.<br>Leave anytime, resume right here.
      </p>
    `;

    // Tab switcher events
    const loginTabBtn = document.getElementById('tab-login');
    const signupTabBtn = document.getElementById('tab-signup');

    loginTabBtn.addEventListener('click', () => {
      if (currentTab !== 'login') {
        currentTab = 'login';
        renderLoginState();
      }
    });

    signupTabBtn.addEventListener('click', () => {
      if (currentTab !== 'signup') {
        currentTab = 'signup';
        renderLoginState();
      }
    });

    if (currentTab === 'login') {
      const form = document.getElementById('login-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const pwd = document.getElementById('password').value;
        const errorMsgDiv = document.getElementById('login-error-msg');
        
        if (email && pwd) {
          try {
            loginUser(email, pwd);
            window.location.hash = '#dashboard';
          } catch (error) {
            errorMsgDiv.textContent = error.message;
            errorMsgDiv.style.display = 'block';
            showMentorMessage("Check your password! If you are a new traveler, click the 'Sign Up' tab above to build an account.", 8000);
          }
        }
      });

      const forgotTrigger = document.getElementById('forgot-password-trigger');
      forgotTrigger.addEventListener('click', () => {
        renderForgotEmailState();
      });

    } else {
      const form = document.getElementById('signup-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nickname = document.getElementById('username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const pwd = document.getElementById('signup-password').value;
        const confirmPwd = document.getElementById('signup-confirm-password').value;
        const errorMsgDiv = document.getElementById('signup-error-msg');

        if (pwd.length < 4) {
          errorMsgDiv.textContent = 'Password must be at least 4 characters long!';
          errorMsgDiv.style.display = 'block';
          return;
        }

        if (pwd !== confirmPwd) {
          errorMsgDiv.textContent = 'Passwords do not match!';
          errorMsgDiv.style.display = 'block';
          return;
        }

        if (canResetPassword(email)) {
          errorMsgDiv.textContent = 'This email already has an active Quest account! Switch to the Log In tab.';
          errorMsgDiv.style.display = 'block';
          showMentorMessage("An account already exists for this email address. Switch back to 'Log In'!", 7000);
          return;
        }

        try {
          const user = signupUser(email, pwd);
          if (nickname) {
            user.name = nickname;
            // Save updated nickname directly inside key-value state
            localStorage.setItem('codequest_user', JSON.stringify(user));
            const accounts = JSON.parse(localStorage.getItem('codequest_accounts') || '{}');
            accounts[email.toLowerCase()] = user;
            localStorage.setItem('codequest_accounts', JSON.stringify(accounts));
          }
          window.location.hash = '#dashboard';
          showMentorMessage(`Welcome, traveler ${user.name}! Your professional setup is ready. Let's begin the quest!`, 7500);
        } catch (error) {
          errorMsgDiv.textContent = error.message;
          errorMsgDiv.style.display = 'block';
        }
      });
    }
  }

  function renderForgotEmailState() {
    container.innerHTML = `
      <h2 class="text-gradient" style="font-size: 2rem; margin-bottom: 5px;">Recover Key</h2>
      <p style="color: var(--cyan); margin-bottom: 2rem; font-size: 0.95rem;">Enter mailbox to locate your account</p>

      <form id="forgot-email-form">
        <div class="input-group">
          <label>Registered Email Address</label>
          <input type="email" id="reset-email" class="input-neon" placeholder="name@earth.planet" required>
        </div>
        
        <div id="forgot-error-msg" style="color: var(--error); font-size: 0.85rem; margin-bottom: 1rem; display: none; text-shadow: 0 0 5px var(--error-glow); text-align: left;"></div>

        <button type="submit" class="btn-neon" style="width: 100%; margin-top: 1.2rem;">Verify & Send Code</button>
        
        <button type="button" id="back-to-login" class="btn-neon btn-purple" style="width: 100%; margin-top: 0.8rem; font-size: 0.9rem; padding: 10px 20px;">Return to Login</button>
      </form>
    `;

    showMentorMessage("Forgot your password? No problem! Enter your email and we'll transmit a secure reset key.", 8500);

    const form = document.getElementById('forgot-email-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value.trim();
      const errorMsgDiv = document.getElementById('forgot-error-msg');
      
      if (canResetPassword(email)) {
        currentEmail = email;
        generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        renderResetPasswordState();
      } else {
        errorMsgDiv.textContent = 'This email is not registered yet! Return to login and enter a new password to auto-create and start.';
        errorMsgDiv.style.display = 'block';
        showMentorMessage("We couldn't locate that account. Make sure it is spelt correctly, or click 'Return to Login' to create a new one!", 8000);
      }
    });

    const backBtn = document.getElementById('back-to-login');
    backBtn.addEventListener('click', () => {
      renderLoginState();
    });
  }

  function renderResetPasswordState() {
    container.innerHTML = `
      <h2 class="text-gradient" style="font-size: 1.8rem; margin-bottom: 5px;">Reset Password</h2>
      <p style="color: var(--cyan); margin-bottom: 1.5rem; font-size: 0.9rem;">Security protocol initiated</p>

      <div class="glass-panel" style="background: rgba(0, 243, 255, 0.04); border: 1px dashed rgba(0, 243, 255, 0.4); padding: 14px; margin-bottom: 1.5rem; border-radius: 8px; text-align: center;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Simulated Security Code Sent To</p>
        <p style="font-size: 0.9rem; color: var(--cyan); font-weight: bold; margin-bottom: 8px;" id="reset-email-display"></p>
        <div style="font-size: 1.1rem; color: var(--success); font-family: var(--font-code); font-weight: bold; text-shadow: 0 0 8px var(--success-glow);">
          CODE: <span id="security-code-display" style="letter-spacing: 2px;"></span>
        </div>
      </div>

      <form id="reset-password-form">
        <div class="input-group">
          <label>6-Digit Security Code</label>
          <input type="text" id="verification-code" class="input-neon" placeholder="123456" maxlength="6" required style="font-family: var(--font-code); text-align: center; letter-spacing: 4px; font-weight: bold;">
        </div>
        
        <div class="input-group">
          <label>Create New Password</label>
          <input type="password" id="new-password" class="input-neon" placeholder="••••••••" required>
        </div>
        
        <div class="input-group">
          <label>Confirm Password</label>
          <input type="password" id="confirm-password" class="input-neon" placeholder="••••••••" required>
        </div>

        <div id="reset-error-msg" style="color: var(--error); font-size: 0.85rem; margin-bottom: 1rem; display: none; text-shadow: 0 0 5px var(--error-glow); text-align: left;"></div>

        <button type="submit" class="btn-neon" style="width: 100%; margin-top: 1rem;">Update Password</button>
        
        <button type="button" id="cancel-reset" class="btn-neon btn-purple" style="width: 100%; margin-top: 0.8rem; font-size: 0.9rem; padding: 10px 20px;">Cancel</button>
      </form>
    `;

    document.getElementById('reset-email-display').textContent = currentEmail;
    document.getElementById('security-code-display').textContent = generatedCode;

    showMentorMessage("Excellent. Enter the security code above, create a new safe password, and let's get you back inside!", 8500);

    const form = document.getElementById('reset-password-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('verification-code').value.trim();
      const newPwd = document.getElementById('new-password').value;
      const confirmPwd = document.getElementById('confirm-password').value;
      const errorMsgDiv = document.getElementById('reset-error-msg');

      if (code !== generatedCode) {
        errorMsgDiv.textContent = 'Incorrect security code! Copy the exact 6-digit code displayed in the status window.';
        errorMsgDiv.style.display = 'block';
        return;
      }

      if (newPwd.length < 4) {
        errorMsgDiv.textContent = 'Password must be at least 4 characters long!';
        errorMsgDiv.style.display = 'block';
        return;
      }

      if (newPwd !== confirmPwd) {
        errorMsgDiv.textContent = 'Passwords do not match! Verify both password inputs.';
        errorMsgDiv.style.display = 'block';
        return;
      }

      try {
        resetUserPassword(currentEmail, newPwd);
        
        container.innerHTML = `
          <div style="padding: 2rem 0; text-align: center;">
            <svg viewBox="0 0 24 24" width="64" height="64" style="margin: 0 auto 1.5rem auto; display: block; filter: drop-shadow(0 0 10px var(--success-glow)); animate: pulse 1s infinite;">
              <path fill="var(--success)" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8L10,17Z"></path>
            </svg>
            <h2 class="text-gradient" style="font-size: 1.8rem; margin-bottom: 10px;">Security Synced!</h2>
            <p style="color: var(--text-main); margin-bottom: 1.5rem;">Your password has been successfully reset.</p>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Returning to login interface...</p>
          </div>
        `;

        showMentorMessage("Outstanding! Your password has been successfully updated. Log in with your new credentials!", 7000);

        setTimeout(() => {
          renderLoginState();
        }, 2200);

      } catch (error) {
        errorMsgDiv.textContent = error.message;
        errorMsgDiv.style.display = 'block';
      }
    });

    const cancelBtn = document.getElementById('cancel-reset');
    cancelBtn.addEventListener('click', () => {
      renderLoginState();
    });
  }

  // Initial render
  renderLoginState();

  setTimeout(() => {
    showMentorMessage("Welcome to CodeQuest! Enter any email to begin your journey. Don't worry, 0% fear, 100% logic.", 8000);
  }, 500);
}
