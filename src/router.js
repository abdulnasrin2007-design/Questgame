import { renderLogin, mountLogin } from './views/Login.js';
import { renderDashboard, mountDashboard } from './views/Dashboard.js';
import { renderQuest, mountQuest } from './views/Quest.js';
import { renderPracticeArena, mountPracticeArena } from './views/PracticeArena.js';
import { getCurrentUser } from './auth.js';

export function setupRouter() {
  window.addEventListener('hashchange', navigate);
}

export function navigate() {
  const hash = window.location.hash;
  const appContainer = document.getElementById('app-container');
  const user = getCurrentUser();
  
  // Auth Guard
  if (!user && hash !== '#login') {
    window.location.hash = '#login';
    return;
  }
  
  // Clear out old content to trigger animations nicely
  appContainer.innerHTML = '';
  
  const footerHtml = `
    <footer class="global-footer" id="main-footer-designer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="brand-text">CodeQuest</span>
          <span class="copyright">&copy; 2026</span>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-credits">
          Designed by <span class="creator-name">Abdul Nasrin</span>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-rights">ALL RIGHTS RESERVED</div>
      </div>
    </footer>
  `;
  
  // Simple route matching
  if (hash === '#login') {
    appContainer.innerHTML = renderLogin() + footerHtml;
    mountLogin();
  } 
  else if (hash === '#dashboard' || hash === '') {
    appContainer.innerHTML = renderDashboard() + footerHtml;
    mountDashboard();
  }
  else if (hash === '#practice-arena') {
    appContainer.innerHTML = renderPracticeArena() + footerHtml;
    mountPracticeArena();
  }
  else if (hash.startsWith('#quest/')) {
    // format: #quest/python/1
    const parts = hash.split('/');
    const courseId = parts[1];
    const levelId = parseInt(parts[2], 10);
    
    appContainer.innerHTML = renderQuest(courseId, levelId) + footerHtml;
    mountQuest(courseId, levelId);
  }
  else {
    // 404 fallback
    appContainer.innerHTML = `<h2 class="text-gradient">404 - Area not localized</h2>
      <a href="#dashboard" class="btn-neon mt-4">Return Base</a>` + footerHtml;
  }
}
