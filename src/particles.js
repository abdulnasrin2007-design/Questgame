// simple particle system for futuristic background
export function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.3)' : 'rgba(176, 38, 255, 0.3)';
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  // Detect mobile device to scale down particle counts automatically
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 8 : 45;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  let animationId;
  let active = true;
  let lastTime = performance.now();
  const fpsInterval = isMobile ? 33.3 : 16.6; // Throttle to 30 FPS on mobile, 60 FPS on desktop
 
  function animate(currentTime = performance.now()) {
    if (!active) return;
    animationId = requestAnimationFrame(animate);
    
    const elapsed = currentTime - lastTime;
    if (elapsed < fpsInterval) return;
    lastTime = currentTime - (elapsed % fpsInterval);
    
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }
  
  // Inactivity tracking (dormancy model): pause background particles if user is idle for passive conservation
  let idleTimeout;
  function resetInactivity() {
    if (!active && !document.hidden) {
      active = true;
      animate();
    }
    clearTimeout(idleTimeout);
    // Pause animation after 12 seconds of inactivity on mobile, 30 on desktop
    idleTimeout = setTimeout(() => {
      active = false;
      cancelAnimationFrame(animationId);
    }, isMobile ? 12000 : 30000);
  }

  // Tab inactivity tracking: conserve battery/CPU power when browser window is minimized or hidden
  function handleVisibilityChange2() {
    if (document.hidden) {
      active = false;
      cancelAnimationFrame(animationId);
    } else {
      resetInactivity();
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange2);
  
  // Listen to mouse, tap, keyboard, and scroll interactions to check active engagement
  window.addEventListener('mousemove', resetInactivity, { passive: true });
  window.addEventListener('mousedown', resetInactivity, { passive: true });
  window.addEventListener('keydown', resetInactivity, { passive: true });
  window.addEventListener('touchstart', resetInactivity, { passive: true });
  window.addEventListener('scroll', resetInactivity, { passive: true });
  
  resetInactivity();
}
