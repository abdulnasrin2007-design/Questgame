import { initParticles } from './particles.js';
import { setupRouter, navigate } from './router.js';
import { initMentor } from './components/Mentor.js';
import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-mode');
  }

  // 1. Initialize global background effects
  initParticles('particles-bg');
  
  // 2. Initialize floating AI Mentor globally
  initMentor('ai-mentor-container');
  
  // 3. Setup client-side routing
  setupRouter();
  
  // 4. Initial Navigation Check
  const user = getCurrentUser();
  const initialHash = window.location.hash;
  
  if (!user && initialHash !== '#login' && initialHash !== '#signup') {
    // Force login if no user data found
    window.location.hash = '#login';
  } else if (!initialHash || initialHash === '#') {
    // Default to dashboard if logged in
    window.location.hash = user ? '#dashboard' : '#login';
  } else {
    // Trigger route handler for current hash
    navigate();
  }
});

// Expose a global theme toggle function for ui elements
window.toggleTheme = function() {
  const isLight = document.documentElement.classList.contains('light-mode');
  if (isLight) {
    document.documentElement.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  }
};
