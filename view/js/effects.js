/**
 * Visual Effects Module
 * Particle system and Matrix rain effect
 */

(function(window) {
  'use strict';

  // =====================================================
  // PARTICLE SYSTEM
  // =====================================================
  const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    config: {
      count: 100,
      color: '#22A39F',
      maxSize: 3,
      speed: 0.5,
      opacity: 0.6
    },
    animationId: null,

    init: function(targetSelector, options) {
      const target = document.querySelector(targetSelector);
      if (!target) return;

      // Merge config
      if (options) Object.assign(this.config, options);

      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '3';

      target.style.position = 'relative';
      target.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      // Create particles
      this.createParticles();

      // Start animation
      this.animate();

      // Handle resize
      window.addEventListener('resize', this.resize.bind(this));
    },

    resize: function() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    },

    createParticles: function() {
      this.particles = [];
      for (let i = 0; i < this.config.count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * this.config.maxSize + 1,
          speedX: (Math.random() - 0.5) * this.config.speed,
          speedY: (Math.random() - 0.5) * this.config.speed,
          opacity: Math.random() * this.config.opacity
        });
      }
    },

    animate: function() {
      if (!this.ctx) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Update and draw particles
      this.particles.forEach(p => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Draw
        this.ctx.fillStyle = this.hexToRgba(this.config.color, p.opacity);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Draw connections
      this.drawConnections();

      this.animationId = requestAnimationFrame(this.animate.bind(this));
    },

    drawConnections: function() {
      const maxDist = 120;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.3;
            this.ctx.strokeStyle = this.hexToRgba(this.config.color, opacity);
            this.ctx.lineWidth = 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    },

    hexToRgba: function(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    stop: function() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  };

  // =====================================================
  // MATRIX RAIN EFFECT
  // =====================================================
  const MatrixRain = {
    canvas: null,
    ctx: null,
    columns: [],
    fontSize: 14,
    animationId: null,
    isActive: false,
    isFadingOut: false,
    fadeStartTime: null,
    fadeDuration: 1500, // 1.5 seconds fade out

    start: function() {
      if (this.isActive) return;
      this.isActive = true;
      this.isFadingOut = false;
      this.fadeStartTime = null;

      // Create fullscreen canvas
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '2147483648'; // Higher than console (2147483647)
      this.canvas.style.opacity = '1';
      this.canvas.style.transition = 'none';
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      // Initialize columns
      const colCount = Math.floor(this.canvas.width / this.fontSize);
      this.columns = Array(colCount).fill(1);

      // Start animation
      this.animate();

      // Start fade-out after 8.5 seconds (fade for 1.5s, total 10s)
      setTimeout(() => this.beginFadeOut(), 8500);

      // Handle resize
      window.addEventListener('resize', this.resize.bind(this));
    },

    resize: function() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    animate: function() {
      if (!this.isActive || !this.ctx) return;

      // Handle fade-out animation
      if (this.isFadingOut) {
        const now = Date.now();
        const elapsed = now - this.fadeStartTime;
        const progress = Math.min(elapsed / this.fadeDuration, 1);
        const opacity = 1 - progress;

        if (this.canvas) {
          this.canvas.style.opacity = String(opacity);
        }

        // Stop completely when fade is done
        if (progress >= 1) {
          this.stop();
          return;
        }
      }

      // Semi-transparent black to create fade effect
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Matrix green
      this.ctx.fillStyle = '#0F0';
      this.ctx.font = this.fontSize + 'px monospace';

      // Draw characters
      for (let i = 0; i < this.columns.length; i++) {
        // Random character (katakana + latin + numbers)
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const char = chars[Math.floor(Math.random() * chars.length)];

        const x = i * this.fontSize;
        const y = this.columns[i] * this.fontSize;

        this.ctx.fillText(char, x, y);

        // Reset column randomly
        if (y > this.canvas.height && Math.random() > 0.975) {
          this.columns[i] = 0;
        }

        this.columns[i]++;
      }

      this.animationId = requestAnimationFrame(this.animate.bind(this));
    },

    beginFadeOut: function() {
      this.isFadingOut = true;
      this.fadeStartTime = Date.now();
    },

    stop: function() {
      this.isActive = false;
      this.isFadingOut = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
    }
  };

  // =====================================================
  // GLITCH TEXT EFFECT
  // =====================================================
  const GlitchText = {
    init: function(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent;
        el.setAttribute('data-text', text);

        el.addEventListener('mouseenter', function() {
          this.classList.add('glitch-active');
        });

        el.addEventListener('mouseleave', function() {
          this.classList.remove('glitch-active');
        });
      });
    }
  };

  // =====================================================
  // PARALLAX SCROLL EFFECT
  // =====================================================
  const ParallaxScroll = {
    init: function() {
      const layers = document.querySelectorAll('[data-parallax]');

      window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;

        layers.forEach(layer => {
          const speed = parseFloat(layer.getAttribute('data-parallax')) || 0.5;
          const yPos = -(scrolled * speed);
          layer.style.transform = `translateY(${yPos}px)`;
        });
      });
    }
  };

  // =====================================================
  // TYPING ANIMATION
  // =====================================================
  const TypeWriter = {
    type: function(element, text, speed = 50) {
      return new Promise((resolve) => {
        let i = 0;
        element.textContent = '';

        const interval = setInterval(() => {
          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, speed);
      });
    }
  };

  // Expose globally
  window.ParticleSystem = ParticleSystem;
  window.MatrixRain = MatrixRain;
  window.GlitchText = GlitchText;
  window.ParallaxScroll = ParallaxScroll;
  window.TypeWriter = TypeWriter;

})(window);
