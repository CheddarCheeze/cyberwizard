/**
 * CheddarConsole - Interactive Terminal Component
 * Usage: Include this script and call CheddarConsole.init() or add data-cheddar-console to body
 */

(function(window) {
  'use strict';

  const CheddarConsole = {
    // Configuration
    config: {
      toggleKey: '~',
      autoOpen: false,
      sessionKey: 'console_seen',
      asciiCacheSmall: 'cheddar_ascii_small_v1',
      asciiCacheBig: 'cheddar_ascii_big_v1'
    },

    // State
    state: {
      history: [],
      histIdx: -1,
      isOpen: false
    },

    // ASCII ramp for image conversion
    RAMP: " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@",

    /**
     * Initialize the console
     */
    init: function(options) {
      // Merge options
      if (options) {
        Object.assign(this.config, options);
      }

      // Restore saved theme mode
      this.restoreThemeMode();

      // Inject HTML
      this.injectHTML();

      // Cache DOM elements
      this.overlay = document.getElementById('cheddarConsole');
      this.out = document.getElementById('cheddarConsoleOut');
      this.input = document.getElementById('cheddarConsoleIn');
      this.toggleBtn = document.getElementById('cheddarConsoleToggle');

      // Set high z-index
      if (this.overlay) this.overlay.style.zIndex = 2147483647;

      // Bind events
      this.bindEvents();

      // Greet
      this.greet();

      // Auto-open on first visit
      if (this.config.autoOpen && !sessionStorage.getItem(this.config.sessionKey)) {
        sessionStorage.setItem(this.config.sessionKey, '1');
        this.toggle();
      }
    },

    /**
     * Inject console HTML into DOM
     */
    injectHTML: function() {
      const html = `
        <section id="cheddarConsole" class="cheddar-console" aria-hidden="true">
          <div class="cheddar-console__title">Cheddar Interactive Console <span class="cheddar-console__badge">(~ to close)</span></div>
          <div id="cheddarConsoleOut" class="cheddar-console__out" role="log" aria-live="polite"></div>
          <div class="cheddar-console__prompt">
            <span class="cheddar-console__caret">&gt;</span>
            <input id="cheddarConsoleIn" class="cheddar-console__input" type="text" autocomplete="off" spellcheck="false" placeholder="type 'help' or 'call kairi'">
          </div>
          <div class="cheddar-console__hint">try: <code class="cheddar-console__cmd-hint">help</code> · <code class="cheddar-console__cmd-hint">skills</code> · <code class="cheddar-console__cmd-hint">projects</code> · <code class="cheddar-console__cmd-hint">call kairi</code></div>
        </section>

        <button id="cheddarConsoleToggle" aria-controls="cheddarConsole" aria-expanded="false"
          class="cheddar-console-toggle">
          ~ console
        </button>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * Bind keyboard and click events
     */
    bindEvents: function() {
      const self = this;

      // Keyboard: `, ~, or Backquote
      window.addEventListener('keydown', function(e) {
        const key = (e.key || '').toLowerCase();
        const code = e.code || '';
        const isBackquote = key === '`' || key === '~' || code === 'Backquote';
        if (isBackquote && !e.altKey) {
          e.preventDefault();
          self.toggle();
        }
      }, { capture: true });

      // Toggle button
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', function() {
          self.toggle();
        });
      }

      // Input handling
      if (this.input) {
        this.input.addEventListener('keydown', function(e) {
          self.handleInputKey(e);
        });
      }

      // Clickable command hints
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cheddar-console__cmd-hint')) {
          const cmd = e.target.textContent.trim();
          self.input.value = cmd;
          self.input.focus();
          // Trigger enter key programmatically
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
          });
          self.input.dispatchEvent(enterEvent);
        }
      });
    },

    /**
     * Toggle console visibility
     */
    toggle: function() {
      if (!this.overlay) return;

      this.overlay.classList.toggle('show');
      this.state.isOpen = this.overlay.classList.contains('show');
      this.overlay.setAttribute('aria-hidden', this.state.isOpen ? 'false' : 'true');

      if (this.state.isOpen && this.input) {
        setTimeout(() => this.input.focus(), 0);
      }

      if (this.toggleBtn) {
        this.toggleBtn.setAttribute('aria-expanded', String(this.state.isOpen));
      }
    },

    /**
     * Handle input keydown events
     */
    handleInputKey: function(e) {
      if (e.key === 'ArrowUp') {
        if (this.state.history.length) {
          this.state.histIdx = Math.max(0, this.state.histIdx === -1 ? this.state.history.length - 1 : this.state.histIdx - 1);
          this.input.value = this.state.history[this.state.histIdx];
          e.preventDefault();
        }
      } else if (e.key === 'ArrowDown') {
        if (this.state.history.length) {
          if (this.state.histIdx === -1) return;
          this.state.histIdx = Math.min(this.state.history.length - 1, this.state.histIdx + 1);
          this.input.value = this.state.history[this.state.histIdx] ?? '';
          e.preventDefault();
        }
      } else if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (!cmd) return;
        this.state.history.push(cmd);
        this.state.histIdx = -1;
        this.println('> ' + this.escapeHtml(cmd), 'cheddar-console__user');
        this.input.value = '';
        this.handleCommand(cmd);
      }
    },

    /**
     * Command router
     */
    handleCommand: async function(cmd) {
      const [name, ...args] = this.tokenize(cmd);

      switch (name.toLowerCase()) {
        case 'help':
          this.println(`commands:
- <b>help</b> — show this help
- <b>skills</b> — quick snapshot of my stack
- <b>projects</b> — highlight reel
- <b>summon cheddar</b> [--big] — render ASCII portrait
- <b>call kairi</b> — summon an 8-bit Maltipoo screen pet (hover to change looks!)
- <b>matrix</b> — activate the matrix
- <b>godmode</b> — max out all skills to 100%
- <b>darkmode</b> — toggle dark mode theme
- <b>dreammode</b> — toggle dream mode theme (purple/pink vibes)
- <b>lightmode</b> — return to default light theme
- <b>print</b> — open print-friendly version
- <b>clear</b> — wipe the console`);
          break;

        case 'skills':
          this.println(`<b>Core:</b> .NET (C#), EF Core, SQL Server, Node-RED, Home Assistant, Python, JS
<b>AI:</b> AWS Bedrock, Claude, embeddings/RAG, OCR pipelines
<b>Ops:</b> Nginx Proxy Manager, Docker, Portainer, Pi-hole
<b>Maker:</b> Bambu X1C, 3D prints, electronics`);
          break;

        case 'projects':
          this.println(`<b>Policy AI:</b> OCR ➜ policy extraction ➜ Excel/DB
<b>Intranet:</b> local-first apps (Hue, Mealie, OpenWebUI, etc.)
<b>Unity:</b> 3d modeling and game developer`);
          break;

        case 'clear':
          this.clearOut();
          break;

        case 'summon':
          if (args[0] && args[0].toLowerCase() === 'cheddar') {
            const big = args.includes('--big');
            await this.summonCheddar(big ? 240 : 160);
          } else {
            this.println(`try: <code>summon cheddar</code>`);
          }
          break;

        case 'matrix':
          this.println('Initializing Matrix Protocol...');
          if (window.MatrixRain) {
            window.MatrixRain.start();
            this.println('<span style="color:#0f0">█ MATRIX ACTIVATED █</span>');
          } else {
            this.println('Matrix module not loaded.');
          }
          break;

        case 'godmode':
          this.println('Activating GOD MODE...');
          if (window.SkillsRenderer && typeof window.SkillsRenderer.activateGodMode === 'function') {
            window.SkillsRenderer.activateGodMode();
            this.println('<span style="color:#FFD700">⚡ GOD MODE ACTIVATED! All skills maxed to 100%! ⚡</span>');
          } else {
            this.println('Skills module not loaded.');
          }
          break;

        case 'call':
          if (args[0] && args[0].toLowerCase() === 'kairi') {
            this.callKairi();
          } else {
            this.println(`try: <code>call kairi</code>`);
          }
          break;

        case 'darkmode':
          this.toggleDarkMode();
          break;

        case 'dreammode':
          this.toggleDreamMode();
          break;

        case 'lightmode':
          this.toggleLightMode();
          break;

        case 'print':
          this.printResume();
          break;

        case 'doom':
          this.launchDoom();
          break;

        default:
          this.println(`unknown command: <code>${this.escapeHtml(name)}</code>. try <b>help</b>.`);
      }
    },

    /**
     * ASCII art generation
     */
    summonCheddar: async function(widthChars = 160) {
      // Randomly choose between face and cheese (50/50 chance)
      const showCheese = Math.random() < 0.5;

      const cacheKeySuffix = showCheese ? '_cheese' : '';
      const cacheKey = ((widthChars > 120) ? this.config.asciiCacheBig : this.config.asciiCacheSmall) + cacheKeySuffix;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        this.printPre(cached, 'cheddar-console__ascii');
        return;
      }

      this.println('materializing cheddar… 🧀');

      try {
        let ascii;

        if (showCheese) {
          // Check if cheese emoji image exists, otherwise generate from emoji
          try {
            ascii = await this.imageToAscii('view/images/cheese_emoji.png', { width: widthChars, invert: false });
          } catch {
            // Fallback: generate ASCII from Unicode emoji
            ascii = await this.emojiToAscii('🧀', { width: widthChars });
          }
        } else {
          // Show profile picture
          ascii = await this.imageToAscii('view/images/profile_pic.png', { width: widthChars, invert: false });
        }

        sessionStorage.setItem(cacheKey, ascii);
        this.printPre(ascii, 'cheddar-console__ascii');
      } catch (err) {
        this.println(`Failed to summon. Error: ${this.escapeHtml(String(err))}`);
      }
    },

    /**
     * Call Kairi - summon a screen pet Maltipoo
     */
    callKairi: function() {
      // Check if pet already exists
      if (document.getElementById('kairi-pet')) {
        this.println('🐕 Kairi is already here!');
        return;
      }

      this.println('🐕 Calling Kairi... *woof woof*');

      // Create the pet element
      const pet = document.createElement('div');
      pet.id = 'kairi-pet';
      pet.className = 'screen-pet kairi-look-classic'; // Start with classic look

      // 8-bit Maltipoo dog using Unicode and CSS
      pet.innerHTML = `
        <div class="pet-body">
          <div class="pet-ear-left"></div>
          <div class="pet-ear-right"></div>
          <div class="pet-head">
            <div class="pet-eyes">
              <div class="pet-eye-left"></div>
              <div class="pet-eye-right"></div>
            </div>
            <div class="pet-snout">
              <div class="snout-muzzle"></div>
              <div class="pet-nose"></div>
              <div class="pet-mouth"></div>
            </div>
          </div>
          <div class="pet-torso">
            <div class="pet-legs">
              <div class="pet-leg pet-leg-back-left"></div>
              <div class="pet-leg pet-leg-back-right"></div>
              <div class="pet-leg pet-leg-front-left"></div>
              <div class="pet-leg pet-leg-front-right"></div>
            </div>
          </div>
          <div class="pet-tail">
            <div class="tail-fluff tail-base"></div>
            <div class="tail-fluff tail-mid1"></div>
            <div class="tail-fluff tail-mid2"></div>
            <div class="tail-fluff tail-mid3"></div>
            <div class="tail-fluff tail-tip"></div>
          </div>
        </div>
        <div class="pet-controls">
          <div class="pet-look-toggle">
            <button class="pet-look-btn pet-look-btn-classic active"
                    onclick="CheddarConsole.changeKairiLook('classic')"
                    title="Classic White"></button>
            <button class="pet-look-btn pet-look-btn-cream"
                    onclick="CheddarConsole.changeKairiLook('cream')"
                    title="Cream Maltipoo"></button>
            <button class="pet-look-btn pet-look-btn-pink"
                    onclick="CheddarConsole.changeKairiLook('pink')"
                    title="Pastel Pink"></button>
          </div>
          <button class="pet-btn" onclick="CheddarConsole.dismissKairi()">Dismiss</button>
        </div>
      `;

      document.body.appendChild(pet);

      // Set z-index higher than console
      pet.style.zIndex = '2147483647';

      // Start animation
      this.animateKairi(pet);

      this.println('✨ Kairi has arrived! Close the console (~) to see her roaming around!');
      this.println('   • Click and drag to move her around');
      this.println('   • Hover over Kairi to reveal look options and dismiss button');
    },

    /**
     * Dismiss Kairi pet
     */
    dismissKairi: function() {
      const pet = document.getElementById('kairi-pet');
      if (pet) {
        pet.classList.add('pet-leaving');
        setTimeout(() => {
          pet.remove();
          this.println('👋 Kairi says goodbye!');
        }, 500);
      }
    },

    /**
     * Change Kairi's look
     */
    changeKairiLook: function(lookName) {
      const pet = document.getElementById('kairi-pet');
      if (!pet) return;

      // Remove all look classes
      pet.classList.remove('kairi-look-classic', 'kairi-look-cream', 'kairi-look-pink');

      // Add the new look class
      pet.classList.add(`kairi-look-${lookName}`);

      // Update button active states
      const buttons = pet.querySelectorAll('.pet-look-btn');
      buttons.forEach(btn => {
        btn.classList.remove('active');
      });

      const activeBtn = pet.querySelector(`.pet-look-btn-${lookName}`);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }

      // Console feedback
      const lookNames = {
        'classic': 'Classic White',
        'cream': 'Cream Maltipoo',
        'pink': 'Pastel Pink'
      };

      if (this.state.isOpen) {
        this.println(`🎨 Kairi changed to ${lookNames[lookName]} look!`);
      }
    },

    /**
     * Animate Kairi with random movements
     */
    animateKairi: function(pet) {
      // Start in center of screen for visibility
      let posX = Math.max(100, Math.min(window.innerWidth / 2, window.innerWidth - 200));
      let posY = Math.max(100, Math.min(window.innerHeight / 2, window.innerHeight - 200));
      let velocityX = (Math.random() - 0.5) * 2;
      let velocityY = (Math.random() - 0.5) * 2;
      let isDragging = false;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      pet.style.left = posX + 'px';
      pet.style.top = posY + 'px';
      pet.style.width = '100px';
      pet.style.height = '120px';

      // Make draggable
      const petBody = pet.querySelector('.pet-body');

      petBody.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - posX;
        dragOffsetY = e.clientY - posY;
        pet.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          posX = e.clientX - dragOffsetX;
          posY = e.clientY - dragOffsetY;
          pet.style.left = posX + 'px';
          pet.style.top = posY + 'px';
        }
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        pet.style.cursor = 'grab';
      });

      // Helper function to check if element is in viewport
      const isInViewport = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      };

      // Idle animation loop
      const animate = () => {
        if (!isDragging && document.getElementById('kairi-pet')) {
          // Get the profile picture element
          const profilePic = document.querySelector('#profile img[src="view/images/profile_pic.png"]');

          // Check if profile picture is in view
          if (profilePic && isInViewport(profilePic)) {
            // Get profile pic center position
            const picRect = profilePic.getBoundingClientRect();
            const picCenterX = picRect.left + picRect.width / 2;
            const picCenterY = picRect.top + picRect.height / 2;

            // Calculate direction to profile pic
            const dx = picCenterX - (posX + 50); // 50 is half of pet width
            const dy = picCenterY - (posY + 60); // 60 is half of pet height
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If not too close, move towards the picture
            if (distance > 80) {
              const speed = 2;
              velocityX = (dx / distance) * speed;
              velocityY = (dy / distance) * speed;
            } else {
              // Arrived at picture, slow down
              velocityX *= 0.9;
              velocityY *= 0.9;
            }
          } else {
            // Profile pic not in view, do normal bouncing
            // Reset to random bouncing velocity if transitioning from seeking mode
            if (Math.abs(velocityX) < 0.5 && Math.abs(velocityY) < 0.5) {
              velocityX = (Math.random() - 0.5) * 2;
              velocityY = (Math.random() - 0.5) * 2;
            }

            // Bounce off edges
            if (posX <= 0 || posX >= window.innerWidth - 150) {
              velocityX *= -1;
            }
            if (posY <= 0 || posY >= window.innerHeight - 150) {
              velocityY *= -1;
              // Add horizontal variation when bouncing off top/bottom to prevent vertical stuck bouncing
              velocityX += (Math.random() - 0.5) * 1.5;
              // Ensure there's always some minimum horizontal movement
              if (Math.abs(velocityX) < 0.5) {
                velocityX = (Math.random() > 0.5 ? 1 : -1) * 0.8;
              }
            }
          }

          posX += velocityX;
          posY += velocityY;

          pet.style.left = posX + 'px';
          pet.style.top = posY + 'px';

          // Flip direction
          if (velocityX < 0) {
            petBody.style.transform = 'scaleX(-1)';
          } else {
            petBody.style.transform = 'scaleX(1)';
          }
        }

        if (document.getElementById('kairi-pet')) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    },

    /**
     * Convert image to ASCII art
     */
    imageToAscii: function(src, { width = 100, invert = false } = {}) {
      const self = this;
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function() {
          const { charW, charH } = self.measureCharBox();
          const targetW = width;
          const targetH = Math.max(1, Math.round(targetW * (img.height / img.width) * (charW / charH)));

          const c = document.createElement('canvas');
          c.width = targetW;
          c.height = targetH;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const { data } = ctx.getImageData(0, 0, targetW, targetH);

          let out = '';
          for (let y = 0; y < targetH; y++) {
            let row = '';
            for (let x = 0; x < targetW; x++) {
              const i = (y * targetW + x) * 4;
              const r = data[i], g = data[i + 1], b = data[i + 2];
              const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
              row += self.RAMP[Math.min(self.RAMP.length - 1, Math.round(L * (self.RAMP.length - 1)))];
            }
            out += row + '\n';
          }
          resolve(out);
        };

        img.onerror = reject;
        img.src = src;
      });
    },

    /**
     * Convert emoji to ASCII art by rendering it to canvas first
     */
    emojiToAscii: function(emoji, { width = 100 } = {}) {
      const self = this;
      return new Promise((resolve, reject) => {
        const { charW, charH } = self.measureCharBox();

        // Create a temporary canvas to render the emoji
        const tempCanvas = document.createElement('canvas');
        const size = 512; // Large size for better quality
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

        // Set font and render emoji
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, size, size);
        tempCtx.font = `${size * 0.8}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(emoji, size / 2, size / 2);

        // Now convert to ASCII
        const targetW = width;
        const targetH = Math.max(1, Math.round(targetW * (charW / charH)));

        const c = document.createElement('canvas');
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(tempCanvas, 0, 0, targetW, targetH);
        const { data } = ctx.getImageData(0, 0, targetW, targetH);

        let out = '';
        for (let y = 0; y < targetH; y++) {
          let row = '';
          for (let x = 0; x < targetW; x++) {
            const i = (y * targetW + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            row += self.RAMP[Math.min(self.RAMP.length - 1, Math.round(L * (self.RAMP.length - 1)))];
          }
          out += row + '\n';
        }
        resolve(out);
      });
    },

    /**
     * Measure character box dimensions
     */
    measureCharBox: function() {
      const probe = document.createElement('pre');
      probe.className = 'cheddar-console__ascii';
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.textContent = 'M'.repeat(100) + '\nM';
      document.body.appendChild(probe);

      const cs = getComputedStyle(probe);
      const lineH = parseFloat(cs.lineHeight);
      const width = probe.getBoundingClientRect().width;
      const charW = width / 100;

      probe.remove();
      return { charW, charH: lineH };
    },

    /**
     * Output helpers
     */
    println: function(html, className = '') {
      const line = document.createElement('div');
      line.className = `cheddar-console__line ${className}`.trim();
      line.innerHTML = html;
      this.out.appendChild(line);
      this.out.scrollTop = this.out.scrollHeight;
    },

    printPre: function(text, className = '') {
      const pre = document.createElement('pre');
      pre.className = `cheddar-console__line ${className}`.trim();
      pre.textContent = text;
      this.out.appendChild(pre);
      this.out.scrollTop = this.out.scrollHeight;
    },

    clearOut: function() {
      this.out.innerHTML = '';
    },

    greet: function() {
      this.println(`<b>Welcome to Cheddar OS</b> — press <b>~</b> to toggle. Type <code>help</code> to begin.`);
    },

    /**
     * Print Resume
     */
    printResume: function() {
      this.println('📄 Opening resume PDF...');

      // Open the resume PDF from the contact section
      window.open('view/files/OnlineResume.pdf', '_blank');

      this.println('✅ Resume opened in a new tab!');
    },

    /**
     * Initialize print handler to intercept Ctrl+P/Cmd+P
     */
    initPrintHandler: function() {
      const self = this;
      let printHandled = false;

      // Listen for beforeprint event (fires when user presses Ctrl+P or clicks print)
      window.addEventListener('beforeprint', function(e) {
        if (!printHandled) {
          // Force all skills to be visible
          document.querySelectorAll('.skill-list li').forEach(li => {
            li.style.opacity = '1';
            li.style.transform = 'none';
            li.classList.add('scroll-animated', 'skill-loaded');
          });
        }
      });

      // Also listen for keydown to catch Ctrl+P early
      document.addEventListener('keydown', function(e) {
        // Check for Ctrl+P (Windows/Linux) or Cmd+P (Mac)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          printHandled = true;

          // Use our smart wait function
          self.waitForContentThenPrint();

          // Reset flag after a delay
          setTimeout(() => {
            printHandled = false;
          }, 1000);
        }
      });
    },

    /**
     * Launch DOOM game
     */
    launchDoom: async function() {
      // Check if DOOM overlay already exists
      if (document.getElementById('doom-overlay')) {
        this.println('🎮 DOOM is already running! Close it first.');
        return;
      }

      this.println('🔫 Loading DOOM...');
      this.println('⏳ Initializing js-dos emulator...');

      // Create DOOM overlay
      const overlay = document.createElement('div');
      overlay.id = 'doom-overlay';
      overlay.innerHTML = `
        <div class="doom-container">
          <div class="doom-header">
            <h2>🔫 DOOM</h2>
            <button class="doom-close" onclick="CheddarConsole.closeDoom()">✕ Close</button>
          </div>
          <div class="doom-content">
            <div id="doom-player"></div>
            <div id="doom-loading" class="doom-loading">
              <div class="doom-spinner"></div>
              <p>Loading DOOM...</p>
            </div>
          </div>
          <div class="doom-controls">
            <p><strong>Controls:</strong> Arrow keys = move | Ctrl = shoot | Space = use | 1-7 = weapons | ESC = menu</p>
            <p><em>Click inside the game to start playing.</em></p>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Close console to show game
      if (this.state.isOpen) {
        this.toggle();
      }

      // Add styles
      this.injectDoomStyles();

      // Load and initialize js-dos
      try {
        const playerDiv = document.getElementById('doom-player');
        const loadingDiv = document.getElementById('doom-loading');

        // Load js-dos library and CSS
        if (!window.Dos) {
          this.println('📦 Downloading js-dos library...');
          await this.loadJsDosLibrary();
          await this.loadJsDosCSS();
        }

        this.println('🎮 Starting DOOM emulator...');

        // Initialize js-dos with emulators config
        const dos = window.Dos(playerDiv, {
          pathPrefix: "https://cdn.dos.zone/current/",
        });

        // Run DOOM bundle
        await dos.run("https://cdn.dos.zone/original/2X/9/9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos");

        // Hide loading indicator
        if (loadingDiv) {
          loadingDiv.style.display = 'none';
        }

        this.println('✅ DOOM loaded! Have fun!');
      } catch (err) {
        this.println(`❌ Error loading DOOM: ${this.escapeHtml(String(err.message || err))}`);
        console.error('DOOM error:', err);

        // Show error in overlay
        const loadingDiv = document.getElementById('doom-loading');
        if (loadingDiv) {
          loadingDiv.innerHTML = `
            <p style="color: #ff4444;">Failed to load DOOM</p>
            <p style="font-size: 12px;">${this.escapeHtml(String(err.message || err))}</p>
            <button onclick="CheddarConsole.closeDoom()" style="margin-top: 15px; padding: 8px 16px; background: #22A39F; border: none; color: white; border-radius: 4px; cursor: pointer;">Close</button>
          `;
        }
      }
    },

    /**
     * Load js-dos library dynamically
     */
    loadJsDosLibrary: function() {
      const self = this;
      return new Promise((resolve, reject) => {
        if (window.Dos || window.emulators) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.dos.zone/current/js-dos/js-dos.js';

        script.onload = () => {
          self.println('✅ js-dos library loaded');
          resolve();
        };

        script.onerror = () => {
          const error = new Error('Failed to load js-dos library');
          self.println('❌ ' + error.message);
          reject(error);
        };

        document.head.appendChild(script);
      });
    },

    /**
     * Load js-dos CSS
     */
    loadJsDosCSS: function() {
      return new Promise((resolve) => {
        // Check if already loaded
        if (document.getElementById('jsdos-css')) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.id = 'jsdos-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.dos.zone/current/js-dos/js-dos.css';
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Continue even if CSS fails
        document.head.appendChild(link);
      });
    },

    /**
     * Close DOOM overlay
     */
    closeDoom: function() {
      const overlay = document.getElementById('doom-overlay');
      if (overlay) {
        overlay.remove();
        this.println('👋 DOOM closed. Thanks for playing!');
      }
    },

    /**
     * Inject DOOM overlay styles
     */
    injectDoomStyles: function() {
      // Check if styles already exist
      if (document.getElementById('doom-styles')) return;

      const style = document.createElement('style');
      style.id = 'doom-styles';
      style.textContent = `
        #doom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 2147483646;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: doomFadeIn 0.3s ease-out;
        }

        @keyframes doomFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .doom-container {
          width: 90%;
          max-width: 1200px;
          height: 90%;
          max-height: 800px;
          background: #1a1a1a;
          border: 3px solid #22A39F;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 40px rgba(34, 163, 159, 0.5);
        }

        .doom-header {
          background: linear-gradient(135deg, #22A39F, #1a8a87);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 5px 5px 0 0;
        }

        .doom-header h2 {
          margin: 0;
          color: white;
          font-family: monospace;
          font-size: 24px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .doom-close {
          background: #ff4444;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        .doom-close:hover {
          background: #cc0000;
          transform: scale(1.05);
        }

        .doom-content {
          flex: 1;
          background: #000;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #doom-player {
          width: 100%;
          height: 100%;
          display: block;
        }

        #doom-player canvas {
          width: 100% !important;
          height: 100% !important;
        }

        .doom-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #22A39F;
          font-family: monospace;
          z-index: 10;
        }

        .doom-loading p {
          margin: 5px 0;
          font-size: 16px;
        }

        .doom-spinner {
          border: 4px solid #333;
          border-top: 4px solid #22A39F;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: doomSpin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes doomSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .doom-controls {
          background: #2a2a2a;
          padding: 12px 20px;
          border-radius: 0 0 5px 5px;
          color: #22A39F;
          font-family: monospace;
          font-size: 14px;
        }

        .doom-controls p {
          margin: 5px 0;
        }

        .doom-controls strong {
          color: #fff;
        }

        @media (max-width: 768px) {
          .doom-container {
            width: 95%;
            height: 95%;
          }

          .doom-header h2 {
            font-size: 18px;
          }

          .doom-controls {
            font-size: 12px;
            padding: 10px;
          }
        }
      `;

      document.head.appendChild(style);
    },

    /**
     * Wait for all dynamic content to load, then print
     */
    waitForContentThenPrint: function() {
      const maxWaitTime = 5000; // Max 5 seconds
      const startTime = Date.now();
      const self = this;

      const checkInterval = setInterval(() => {
        // Check if skills are loaded (look for skill-bar elements)
        const skillBars = document.querySelectorAll('.skill-bar');
        const skillsLoaded = skillBars.length > 0;

        // Check if skills have been animated (have the scroll-animated or skill-loaded class)
        const skillsAnimated = document.querySelectorAll('.skill-list li.skill-loaded').length > 0 ||
                               document.querySelectorAll('.skill-list li').length > 0;

        const contentReady = skillsLoaded && skillsAnimated;
        const timeoutReached = (Date.now() - startTime) > maxWaitTime;

        if (contentReady || timeoutReached) {
          clearInterval(checkInterval);

          if (contentReady) {
            // Force all skills to be visible for print
            document.querySelectorAll('.skill-list li').forEach(li => {
              li.style.opacity = '1';
              li.style.transform = 'none';
              li.classList.add('scroll-animated', 'skill-loaded');
            });

            if (self.state.isOpen) {
              self.println('✅ Content loaded! Opening print dialog...');
              self.println('💡 Tip: Enable "Background graphics" in print settings.');
            }

            // Small delay to ensure everything is rendered
            setTimeout(() => {
              window.print();
            }, 200);
          } else {
            if (self.state.isOpen) {
              self.println('⚠️ Timeout waiting for content. Printing anyway...');
            }
            window.print();
          }
        }
      }, 100); // Check every 100ms
    },

    /**
     * Restore theme mode from localStorage
     */
    restoreThemeMode: function() {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode === 'dark') {
        document.body.classList.add('dark-mode');
      } else if (savedMode === 'dream') {
        document.body.classList.add('dream-mode');
      }
    },

    /**
     * Toggle Dark Mode
     */
    toggleDarkMode: function() {
      const body = document.body;

      // Remove other modes
      body.classList.remove('dream-mode');

      // Toggle dark mode
      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        this.println('🌞 Dark mode disabled. Returning to light mode.');
        this.showModeNotification('☀️ Light Mode', '#22A39F');
        localStorage.removeItem('theme-mode');
      } else {
        body.classList.add('dark-mode');
        this.println('🌙 Dark mode activated. Your eyes will thank you.');
        this.showModeNotification('🌙 Dark Mode Activated', '#22d3ee');
        localStorage.setItem('theme-mode', 'dark');
      }
    },

    /**
     * Toggle Dream Mode
     */
    toggleDreamMode: function() {
      const body = document.body;

      // Remove other modes
      body.classList.remove('dark-mode');

      // Toggle dream mode
      if (body.classList.contains('dream-mode')) {
        body.classList.remove('dream-mode');
        this.println('✨ Dream mode disabled. Back to reality.');
        this.showModeNotification('☀️ Light Mode', '#22A39F');
        localStorage.removeItem('theme-mode');
      } else {
        body.classList.add('dream-mode');
        this.println('✨ Dream mode activated. Enter the purple realm...');
        this.showModeNotification('✨ Dream Mode Activated', '#a855f7');
        localStorage.setItem('theme-mode', 'dream');
      }
    },

    /**
     * Return to Light Mode
     */
    toggleLightMode: function() {
      const body = document.body;
      body.classList.remove('dark-mode', 'dream-mode');
      this.println('☀️ Light mode restored.');
      this.showModeNotification('☀️ Light Mode', '#22A39F');
      localStorage.removeItem('theme-mode');
    },

    /**
     * Show mode toggle notification
     */
    showModeNotification: function(message, color) {
      const notification = document.createElement('div');
      notification.className = 'mode-toggle-notification';
      notification.textContent = message;
      notification.style.background = `linear-gradient(135deg, ${color}, ${this.adjustColor(color, -20)})`;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 3000);
    },

    /**
     * Adjust color brightness
     */
    adjustColor: function(color, percent) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
    },

    /**
     * Utility functions
     */
    escapeHtml: function(s) {
      return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    tokenize: function(s) {
      return s.trim().split(/\s+/);
    }
  };

  // Auto-init if data attribute present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.body.hasAttribute('data-cheddar-console')) {
        CheddarConsole.init({ autoOpen: true });
      }
      // Set up smart print handler
      CheddarConsole.initPrintHandler();
    });
  } else {
    if (document.body.hasAttribute('data-cheddar-console')) {
      CheddarConsole.init({ autoOpen: true });
    }
    // Set up smart print handler
    CheddarConsole.initPrintHandler();
  }

  // Expose globally
  window.CheddarConsole = CheddarConsole;

})(window);
