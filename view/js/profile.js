/**
 * Profile Section Interactive Features
 * Includes: Typewriter Effect, Stats Counter, Skill Tag Cloud
 */

const ProfileInteractive = (function() {
	'use strict';

	// Configuration
	const config = {
		typewriterSpeed: 50, // milliseconds per character
		typewriterDelay: 500, // delay before starting
		statsAnimationDuration: 2000, // milliseconds
		skillTags: [
			'Python', 'JavaScript', 'C#', 'SQL', 'Azure', 'AWS',
			'Machine Learning', 'AI', 'Data Analytics', 'APIs',
			'Git', 'Docker', 'Cryptography', 'IPv6', 'Security',
			'Spark', 'Big Data', 'Cloud', 'React', 'Node.js',
			'Computer Networks', 'Database Management', 'Agile'
		]
	};

	/**
	 * Typewriter Effect
	 */
	const TypewriterEffect = {
		init: function(selector) {
			const elements = document.querySelectorAll(selector);

			elements.forEach((element, index) => {
				const text = element.textContent;

				// Pre-allocate space to prevent layout shift
				// Get computed height before clearing text
				const computedHeight = element.offsetHeight;

				// Set fixed height to prevent reflow during typing
				element.style.height = computedHeight + 'px';
				element.style.overflow = 'hidden';

				// Wrap content in a span for the cursor effect
				const textSpan = document.createElement('span');
				textSpan.className = 'typewriter-text';
				element.textContent = '';
				element.appendChild(textSpan);

				// Stagger animations for multiple elements
				setTimeout(() => {
					this.typeText(textSpan, text);
				}, config.typewriterDelay + (index * 100));
			});
		},

		typeText: function(element, text, index = 0) {
			if (index < text.length) {
				element.textContent += text.charAt(index);
				setTimeout(() => {
					this.typeText(element, text, index + 1);
				}, config.typewriterSpeed);
			} else {
				// Remove cursor after typing complete
				setTimeout(() => {
					element.classList.add('typing-complete');
					// Remove fixed dimensions from parent paragraph
					const parent = element.parentElement;
					if (parent) {
						parent.style.height = '';
						parent.style.overflow = '';
					}
				}, 500);
			}
		}
	};

	/**
	 * Stats Counter with Animation
	 */
	const StatsCounter = {
		stats: [
			{
				icon: 'bi-code-slash',
				label: 'Years Coding',
				value: 14,
				max: 20,
				suffix: '+'
			},
			{
				icon: 'bi-briefcase-fill',
				label: 'Years Experience',
				value: 10,
				max: 15,
				suffix: '+'
			},
			{
				icon: 'bi-terminal-fill',
				label: 'Technologies',
				value: 25,
				max: 30,
				suffix: '+'
			},
			{
				icon: 'bi-award-fill',
				label: 'Projects Completed',
				value: 50,
				max: 60,
				suffix: '+'
			}
		],

		init: function() {
			const container = document.querySelector('#profile .row');
			if (!container) return;

			// Create stats section
			const statsHTML = this.createStatsHTML();

			// Insert after the first row
			const statsDiv = document.createElement('div');
			statsDiv.className = 'col-md-12';
			statsDiv.innerHTML = statsHTML;
			container.parentNode.insertBefore(statsDiv, container.nextSibling);

			// Setup intersection observer to trigger animation when visible
			this.setupObserver();
		},

		createStatsHTML: function() {
			const statsItems = this.stats.map(stat => `
				<div class="col-xl-3 col-md-6 col-sm-6 col-12 stat-item">
					<i class="${stat.icon} stat-icon"></i>
					<span class="stat-value" data-value="${stat.value}" data-suffix="${stat.suffix}">0</span>
					<div class="stat-label">${stat.label}</div>
					<div class="stat-progress">
						<div class="stat-progress-bar" data-percent="${(stat.value / stat.max) * 100}"></div>
					</div>
				</div>
			`).join('');

			return `
				<div class="profile-stats">
					<div class="row">
						${statsItems}
					</div>
				</div>
			`;
		},

		setupObserver: function() {
			const statsSection = document.querySelector('.profile-stats');
			if (!statsSection) return;

			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.animateStats();
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.3 });

			observer.observe(statsSection);
		},

		animateStats: function() {
			const statValues = document.querySelectorAll('.stat-value');
			const progressBars = document.querySelectorAll('.stat-progress-bar');

			// Animate numbers
			statValues.forEach(el => {
				const target = parseInt(el.dataset.value);
				const suffix = el.dataset.suffix;
				this.animateValue(el, 0, target, config.statsAnimationDuration, suffix);
			});

			// Animate progress bars
			progressBars.forEach(bar => {
				setTimeout(() => {
					bar.style.width = bar.dataset.percent + '%';
				}, 100);
			});
		},

		animateValue: function(element, start, end, duration, suffix = '') {
			const range = end - start;
			const increment = range / (duration / 16); // 60fps
			let current = start;

			const timer = setInterval(() => {
				current += increment;
				if (current >= end) {
					element.textContent = end + suffix;
					clearInterval(timer);
				} else {
					element.textContent = Math.floor(current) + suffix;
				}
			}, 16);
		}
	};

	/**
	 * Skill Tag Cloud Background
	 */
	const SkillTagCloud = {
		init: function() {
			const profileSection = document.querySelector('#profile.container');
			if (!profileSection) return;

			// Create cloud container
			const cloud = document.createElement('div');
			cloud.className = 'skill-tag-cloud';
			profileSection.insertBefore(cloud, profileSection.firstChild);

			// Generate and position tags
			this.generateTags(cloud);
		},

		generateTags: function(container) {
			const tags = config.skillTags;
			const containerHeight = 600; // Approximate profile section height
			const containerWidth = container.offsetWidth;

			tags.forEach((tag, index) => {
				const tagEl = document.createElement('div');
				tagEl.className = 'skill-tag';
				tagEl.textContent = tag;
				tagEl.style.opacity = Math.random() * 0.4 + 0.3; // 0.3 to 0.7

				// Random positioning
				const x = Math.random() * (containerWidth - 150);
				const y = Math.random() * (containerHeight - 50);

				tagEl.style.left = x + 'px';
				tagEl.style.top = y + 'px';

				// Random font size variation
				const fontSize = Math.random() * 8 + 12; // 12px to 20px
				tagEl.style.fontSize = fontSize + 'px';

				// Subtle floating animation
				const duration = Math.random() * 10 + 15; // 15s to 25s
				const delay = Math.random() * 5;
				tagEl.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

				// Click handler to jump to abilities section
				tagEl.addEventListener('click', (e) => {
					e.stopPropagation();
					const abilitiesSection = document.querySelector('#abilities');
					if (abilitiesSection) {
						abilitiesSection.scrollIntoView({ behavior: 'smooth' });
					}
				});

				container.appendChild(tagEl);
			});

			// Add floating animation CSS if not exists
			this.addFloatingAnimation();
		},

		addFloatingAnimation: function() {
			const styleId = 'skill-tag-float-animation';
			if (document.getElementById(styleId)) return;

			const style = document.createElement('style');
			style.id = styleId;
			style.textContent = `
				@keyframes float {
					0%, 100% {
						transform: translateY(0px) translateX(0px);
					}
					25% {
						transform: translateY(-20px) translateX(10px);
					}
					50% {
						transform: translateY(-10px) translateX(-10px);
					}
					75% {
						transform: translateY(-15px) translateX(5px);
					}
				}
			`;
			document.head.appendChild(style);
		}
	};

	/**
	 * Initialize all profile features
	 */
	function init() {
		// Wait for DOM to be fully loaded
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', initializeFeatures);
		} else {
			initializeFeatures();
		}
	}

	function initializeFeatures() {
		// Check if we're on a page with profile section
		const profileSection = document.querySelector('#profile');
		if (!profileSection) return;

		// Initialize skill tag cloud first (background layer)
		SkillTagCloud.init();

		// Initialize stats counter
		StatsCounter.init();

		// Initialize typewriter effect on "About me" paragraph
		// Wait a bit for stats to be inserted
		setTimeout(() => {
			const aboutText = document.querySelector('#profile .col-md-4 p');
			if (aboutText) {
				TypewriterEffect.init('#profile .col-md-4 p');
			}
		}, 100);
	}

	// Public API
	return {
		init: init,
		TypewriterEffect: TypewriterEffect,
		StatsCounter: StatsCounter,
		SkillTagCloud: SkillTagCloud
	};
})();

// Auto-initialize
ProfileInteractive.init();
