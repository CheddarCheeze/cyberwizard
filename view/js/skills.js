/**
 * Skills Renderer Module
 * Dynamically generates skill lists from JSON data
 */

(function(window) {
  'use strict';

  const SkillsRenderer = {
    konamiCode: [],
    konamiPattern: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    hackMode: false,

    /**
     * Load and render all skills sections
     */
    init: async function() {
      try {
        const data = await this.loadSkillsData();
        this.renderSkills(data.skills, '#skills-container');
        this.renderSkills(data.languages, '#languages-container');
        this.renderSkills(data.tools, '#tools-container');
        this.convertStarsToProgressBars();
        this.initEasterEggs();
        this.initScrollAnimations();
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    },

    /**
     * Load skills data from JSON file
     */
    loadSkillsData: async function() {
      const response = await fetch('view/data/skills.json');
      if (!response.ok) {
        throw new Error('Failed to load skills data');
      }
      return await response.json();
    },

    /**
     * Render skills into a container
     * @param {Array} skills - Array of skill objects
     * @param {String} containerSelector - CSS selector for container
     */
    renderSkills: function(skills, containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      // Split into two columns
      const midpoint = Math.ceil(skills.length / 2);
      const column1 = skills.slice(0, midpoint);
      const column2 = skills.slice(midpoint);

      container.innerHTML = `
        <div class="col-md-6">
          <ul class="no-bullets skill-list">
            ${column1.map(skill => this.renderSkillItem(skill)).join('')}
          </ul>
        </div>
        <div class="col-md-6">
          <ul class="no-bullets skill-list">
            ${column2.map(skill => this.renderSkillItem(skill)).join('')}
          </ul>
        </div>
      `;
    },

    /**
     * Render a single skill item
     * @param {Object} skill - Skill object with name and rating
     * @returns {String} HTML string
     */
    renderSkillItem: function(skill) {
      const stars = this.generateStars(skill.rating);
      return `
        <li>
          <span class="ability-title">${skill.name}</span>
          <span class="ability-score">
            ${stars}
          </span>
        </li>
      `;
    },

    /**
     * Generate star icons based on rating
     * @param {Number} rating - Rating from 0-5 (supports 0.5 increments)
     * @returns {String} HTML string of star icons
     */
    generateStars: function(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      const emptyStars = 5 - Math.ceil(rating);

      let html = '';

      // Full stars
      for (let i = 0; i < fullStars; i++) {
        html += '<i class="bi bi-star-fill"></i>\n\t\t\t\t\t\t';
      }

      // Half star
      if (hasHalfStar) {
        html += '<i class="bi bi-star-half"></i>\n\t\t\t\t\t\t';
      }

      // Empty stars
      for (let i = 0; i < emptyStars; i++) {
        html += '<i class="bi bi-star"></i>\n\t\t\t\t\t\t';
      }

      return html;
    },

    /**
     * Initialize easter eggs and interactive features
     */
    initEasterEggs: function() {
      // Konami code listener
      document.addEventListener('keydown', (e) => {
        this.konamiCode.push(e.key);
        this.konamiCode = this.konamiCode.slice(-10);

        if (this.konamiCode.join(',') === this.konamiPattern.join(',')) {
          this.activateGodMode();
        }
      });

      // Click to level up
      document.addEventListener('click', (e) => {
        const skillItem = e.target.closest('.skill-list li');
        if (skillItem && !this.hackMode) {
          this.levelUpSkill(skillItem);
        }
      });

      // Triple-click abilities header to shuffle
      let clickCount = 0;
      let clickTimer = null;
      document.querySelectorAll('#abilities h2, #abilities h3').forEach(header => {
        header.addEventListener('click', () => {
          clickCount++;
          if (clickCount === 3) {
            this.shuffleSkills();
            clickCount = 0;
          }
          clearTimeout(clickTimer);
          clickTimer = setTimeout(() => clickCount = 0, 500);
        });
      });

      // Start random bar re-animations to liven up the page
      this.startRandomReanimations();
    },

    /**
     * Konami code: Max out all skills to 100%
     */
    activateGodMode: function() {
      console.log('🎮 GOD MODE ACTIVATED!');

      document.querySelectorAll('.skill-list li').forEach((li, i) => {
        setTimeout(() => {
          const bar = li.querySelector('.skill-bar');
          const pct = li.querySelector('.skill-percent');
          if (bar && pct) {
            bar.style.setProperty('--fill', '100%');
            pct.textContent = '100%';
            this.createParticleBurst(li, '#FFD700');

            // Stop any existing animations and ensure visibility
            li.style.animation = 'none';
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';

            // Force a reflow
            void li.offsetWidth;

            // Start infinite rainbow pulse
            li.style.animation = 'rainbow-pulse 2s ease-in-out infinite';
          }
        }, i * 50);
      });

      // Show notification
      this.showNotification('⚡ GOD MODE: All skills maxed!');
    },

    /**
     * Level up skill on click with particle effect
     */
    levelUpSkill: function(skillItem) {
      const bar = skillItem.querySelector('.skill-bar');
      const pct = skillItem.querySelector('.skill-percent');
      if (!bar || !pct) return;

      // Prevent rapid clicking during mastery animation
      if (skillItem.dataset.celebrating === 'true') {
        return;
      }

      // Check current fill and prestige level
      const currentFill = parseInt(bar.style.getPropertyValue('--fill')) || parseInt(pct.textContent);
      const prestigeLevel = parseInt(skillItem.dataset.prestige || 0);

      if (currentFill >= 100) {
        // Already maxed - add prestige star
        if (prestigeLevel < 5) {
          this.addPrestigeStar(skillItem);
        } else {
          // Max prestige reached
          this.createParticleBurst(skillItem, '#FFD700');
          this.showNotification('⭐ MAX PRESTIGE REACHED! ⭐');
        }
        return;
      }

      const newFill = Math.min(100, currentFill + 10);

      bar.style.setProperty('--fill', newFill + '%');
      pct.textContent = newFill + '%';

      this.createParticleBurst(skillItem, '#22A39F');

      // Reward with quote when reaching 100%!
      if (newFill === 100) {
        // Mark as celebrating to prevent clicks during animation
        skillItem.dataset.celebrating = 'true';

        // Stop any existing animations and ensure visibility
        skillItem.style.animation = 'none';
        skillItem.style.opacity = '1';
        skillItem.style.transform = 'translateX(0)';

        // Force a reflow to apply the animation stop
        void skillItem.offsetWidth;

        // Start rainbow pulse animation
        skillItem.style.animation = 'rainbow-pulse 2s ease-in-out 3';

        // Show congratulatory message with tech quote
        const skillName = skillItem.querySelector('.skill-title span:first-child').textContent;
        setTimeout(() => {
          this.showMasteryReward(skillName);
        }, 500);

        // Allow prestige clicks after celebration completes
        setTimeout(() => {
          skillItem.dataset.celebrating = 'false';
          // Ensure item stays visible after celebration
          skillItem.style.animation = 'none';
          skillItem.style.opacity = '1';
          skillItem.style.transform = 'translateX(0)';
        }, 6500); // 6s animation + 0.5s delay
      }
    },

    /**
     * Add prestige star to maxed skill
     */
    addPrestigeStar: function(skillItem) {
      const prestigeLevel = parseInt(skillItem.dataset.prestige || 0);
      const newPrestige = Math.min(5, prestigeLevel + 1);

      skillItem.dataset.prestige = newPrestige;

      // Get or create prestige container
      let prestigeContainer = skillItem.querySelector('.prestige-stars');
      if (!prestigeContainer) {
        prestigeContainer = document.createElement('div');
        prestigeContainer.className = 'prestige-stars';
        const skillTitle = skillItem.querySelector('.skill-title');
        skillTitle.appendChild(prestigeContainer);
      }

      // Update stars
      prestigeContainer.innerHTML = '★'.repeat(newPrestige);

      // Particle burst and animation
      this.createParticleBurst(skillItem, '#FFD700');
      prestigeContainer.style.animation = 'none';
      setTimeout(() => {
        prestigeContainer.style.animation = 'prestige-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      }, 10);

      // Show notification
      if (newPrestige === 5) {
        this.showNotification('🌟 LEGENDARY PRESTIGE! Maximum rank achieved!', 4000);
      } else {
        this.showNotification(`⭐ Prestige ${newPrestige}! Click again for more stars!`);
      }
    },

    /**
     * Create particle burst effect
     */
    createParticleBurst: function(element, color) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'skill-particle';
        particle.style.cssText = `
          position: fixed;
          left: ${centerX}px;
          top: ${centerY}px;
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 10px ${color};
        `;
        document.body.appendChild(particle);

        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
          duration: 600 + Math.random() * 400,
          easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
        }).onfinish = () => particle.remove();
      }
    },

    /**
     * Show mastery reward when skill reaches 100%
     */
    showMasteryReward: function(skillName) {
      const quotes = [
        '"Any sufficiently advanced technology is indistinguishable from magic." - Arthur C. Clarke',
        '"Talk is cheap. Show me the code." - Linus Torvalds',
        '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
        '"First, solve the problem. Then, write the code." - John Johnson',
        '"Experience is the name everyone gives to their mistakes." - Oscar Wilde',
        '"In order to be irreplaceable, one must always be different." - Coco Chanel',
        '"Java is to JavaScript what car is to Carpet." - Chris Heilmann',
        '"Knowledge is power." - Francis Bacon',
        '"The best error message is the one that never shows up." - Thomas Fuchs',
        '"Simplicity is the soul of efficiency." - Austin Freeman',
        '"Programs must be written for people to read, and only incidentally for machines to execute." - Harold Abelson',
        '"The only way to go fast is to go well." - Robert C. Martin',
        '"Make it work, make it right, make it fast." - Kent Beck',
        '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry',
        '"The best thing about a boolean is even if you are wrong, you are only off by a bit." - Anonymous'
      ];

      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      // Create special mastery notification
      const notification = document.createElement('div');
      notification.className = 'skill-mastery-notification';
      notification.innerHTML = `
        <div style="font-size: 1.2em; margin-bottom: 10px;">
          ⭐ <strong>MASTERED: ${skillName}</strong> ⭐
        </div>
        <div style="font-style: italic; opacity: 0.9;">
          ${quote}
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(135deg, #FFD700, #FFA500, #FF8C00);
        color: #222;
        padding: 25px 35px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.4);
        opacity: 0;
        pointer-events: none;
        max-width: 500px;
        text-align: center;
        border: 3px solid #FFD700;
      `;
      document.body.appendChild(notification);

      // Animate in with bounce
      requestAnimationFrame(() => {
        notification.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
        notification.style.opacity = '1';
      });

      // Animate out
      setTimeout(() => {
        notification.style.transition = 'all 0.4s ease-in-out';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 400);
      }, 6000);
    },

    /**
     * Shuffle skills with animation
     */
    shuffleSkills: function() {
      console.log('🔀 Shuffling skills...');

      const containers = ['#skills-container', '#languages-container', '#tools-container'];

      containers.forEach(selector => {
        const container = document.querySelector(selector);
        if (!container) return;

        const columns = container.querySelectorAll('.col-md-6');
        columns.forEach(col => {
          const ul = col.querySelector('ul');
          if (!ul) return;

          const items = Array.from(ul.children);

          // Shuffle array
          for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
          }

          // Animate out
          items.forEach((item, i) => {
            item.style.animation = 'none';
            setTimeout(() => {
              item.style.animation = 'skill-fade-out 0.3s ease-out forwards';
            }, i * 30);
          });

          // Reorder and animate in
          setTimeout(() => {
            ul.innerHTML = '';
            items.forEach((item, i) => {
              ul.appendChild(item);
              item.style.animation = 'none';
              setTimeout(() => {
                item.style.animation = `skill-fade-in 0.4s ease-out forwards`;
                item.style.animationDelay = `${i * 0.05}s`;
              }, 50);
            });
          }, 400);
        });
      });

      this.showNotification('🔀 Skills shuffled!');
    },

    /**
     * Show notification popup
     */
    showNotification: function(message, duration = 3000) {
      const notification = document.createElement('div');
      notification.className = 'skill-notification';
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: linear-gradient(135deg, #22A39F, #1c8784);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(34, 163, 159, 0.6);
        opacity: 0;
        pointer-events: none;
        max-width: 80%;
        text-align: center;
      `;
      document.body.appendChild(notification);

      // Animate in
      requestAnimationFrame(() => {
        notification.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        notification.style.transform = 'translateX(-50%) translateY(0)';
        notification.style.opacity = '1';
      });

      // Animate out
      setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(-100px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
      }, duration);
    },

    /**
     * Convert star ratings to animated progress bars
     * (Reuses existing conversion script logic)
     */
    convertStarsToProgressBars: function() {
      const STAR_FULL = 'bi-star-fill';
      const STAR_HALF = 'bi-star-half';
      const STAR_EMPTY = 'bi-star';

      function getPercent(container) {
        const icons = Array.from(container.querySelectorAll('i'));
        let score = 0;
        icons.forEach(i => {
          if (i.classList.contains(STAR_FULL)) score += 1;
          else if (i.classList.contains(STAR_HALF)) score += 0.5;
        });
        const max = icons.length || 5;
        return Math.round((score / max) * 100);
      }

      document.querySelectorAll('.skill-list li').forEach((li, index) => {
        const titleEl = li.querySelector('.ability-title');
        const starsEl = li.querySelector('.ability-score');
        if (!titleEl || !starsEl) return;
        const pct = getPercent(starsEl);

        // Build new content
        const titleRow = document.createElement('div');
        titleRow.className = 'skill-title';
        titleRow.innerHTML = `
          <span>${titleEl.textContent}</span>
          <span class="skill-percent">${pct}%</span>
        `;

        const bar = document.createElement('div');
        bar.className = 'skill-bar';
        bar.style.setProperty('--fill', pct + '%');

        // Replace
        starsEl.replaceWith(bar);
        titleEl.replaceWith(titleRow);

        // Trigger bar animation after the fade-in animation starts
        // Match the delay of each skill item's fade-in animation
        const fadeInDelay = 100 + (index % 14) * 50; // Matches CSS animation-delay pattern
        setTimeout(() => {
          li.classList.add('skill-loaded');
        }, fadeInDelay);
      });
    },

    /**
     * Start random re-animations of skill bars to add life to the page
     */
    startRandomReanimations: function() {
      const reanimateRandomSkill = () => {
        const allSkills = document.querySelectorAll('.skill-list li');
        if (allSkills.length === 0) return;

        // Pick a random skill
        const randomIndex = Math.floor(Math.random() * allSkills.length);
        const skill = allSkills[randomIndex];
        const bar = skill.querySelector('.skill-bar');

        if (!bar) return;

        // Get the current fill percentage
        const currentFill = bar.style.getPropertyValue('--fill');

        // Temporarily remove the skill-loaded class to reset the animation
        skill.classList.remove('skill-loaded');

        // Force a reflow to restart the animation
        void skill.offsetWidth;

        // Re-add the class to trigger the animation again
        setTimeout(() => {
          skill.classList.add('skill-loaded');
        }, 50);

        // Add a subtle pulse effect to draw attention
        skill.style.transition = 'transform 0.3s ease';
        skill.style.transform = 'scale(1.03)';
        setTimeout(() => {
          skill.style.transform = '';
        }, 300);
      };

      // Run the reanimation at random intervals
      const scheduleNextReanimation = () => {
        // Random delay between 3-8 seconds
        const delay = 3000 + Math.random() * 5000;
        setTimeout(() => {
          reanimateRandomSkill();
          scheduleNextReanimation();
        }, delay);
      };

      // Start after initial page load animations complete
      setTimeout(() => {
        scheduleNextReanimation();
      }, 3000);
    },

    /**
     * Initialize scroll-triggered animations using IntersectionObserver
     */
    initScrollAnimations: function() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the element is visible
      };

      const callback = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add animated class to trigger animations
            const skills = entry.target.querySelectorAll('.skill-list li');
            skills.forEach((skill, index) => {
              // Remove any existing animation state
              skill.style.animation = 'none';
              skill.style.opacity = '0';

              // Force reflow
              void skill.offsetWidth;

              // Trigger staggered fade-in animation
              setTimeout(() => {
                skill.style.opacity = '';
                skill.style.animation = '';
                skill.classList.add('scroll-animated');
              }, index * 50);
            });

            // Stop observing after animation triggers (optional - remove if you want repeated animations)
            observer.unobserve(entry.target);
          }
        });
      };

      const observer = new IntersectionObserver(callback, options);

      // Observe all skill section containers
      const containers = ['#skills-container', '#languages-container', '#tools-container'];
      containers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
          observer.observe(container);
        }
      });
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      SkillsRenderer.init();
    });
  } else {
    SkillsRenderer.init();
  }

  // Expose globally
  window.SkillsRenderer = SkillsRenderer;

})(window);
