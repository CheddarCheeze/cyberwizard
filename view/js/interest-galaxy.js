/**
 * Interest Galaxy - Interactive Node Graph Visualization
 * Displays interests as connected nodes in a galaxy-like layout
 */

const InterestGalaxy = (function() {
    'use strict';

    // Interest data with connections
    const interestsData = [
        {
            id: 'music',
            label: 'Music',
            icon: 'bi-music-note-beamed',
            size: 'primary',
            description: 'Music is my biggest interest and hobby. That includes anything from listening to performing. I started my appreciation when I first learned the flute in 7th grade and developed music theory in my head using mathematical patterns. I\'ve taught myself multiple instruments, including 3 different saxophones (alto, tenor, bari), guitar, piano, harmonica, drums, and beatboxing.',
            stats: {
                'Experience': '18+ years',
                'Instruments': '9+',
                'Skill Level': 'Advanced'
            },
            connections: ['mathematics', 'puzzles', 'programming'],
            relatedSkills: [],
            details: 'Instruments: Flute, Alto Sax, Tenor Sax, Bari Sax, Guitar, Piano, Harmonica, Drums, Beatboxing'
        },
        {
            id: 'board-games',
            label: 'Board Games',
            icon: 'bi-dice-5',
            size: 'primary',
            description: 'I own a collection of 597 board games and love bringing people together to enjoy them. Whether it\'s hosting game nights, attending group outings, or meeting someone new, I thrive in social settings.',
            stats: {
                'Collection': '597 games',
                'Experience': '15+ years',
                'Activity': 'Weekly'
            },
            connections: ['puzzles', 'mathematics', 'video-games'],
            relatedSkills: ['Public Relations'],
            details: 'Regular game nights, strategy enthusiast, community builder'
        },
        {
            id: 'puzzles',
            label: 'Puzzles',
            icon: 'bi-puzzle',
            size: 'primary',
            description: 'Life is chock-full of wibbly-wobbly puzzles and patterns. From video games and cybersecurity challenges to everyday household problems, I see them all as solvable puzzles. I also enjoy traditional jigsaw puzzles too.',
            stats: {
                'Types': 'Jigsaw, Logic, Cyber',
                'Largest': '1000 pieces',
                'Passion': 'Problem-solving'
            },
            connections: ['programming', 'video-games', 'mathematics', 'music', 'board-games'],
            relatedSkills: ['Object Oriented Programming', 'Computer Networking'],
            details: 'Completed works include Kandinsky\'s "In Blue" and working on "Squares with Concentric Circles"'
        },
        {
            id: 'video-games',
            label: 'Video Games',
            icon: 'bi-controller',
            size: 'secondary',
            description: 'Video games are the best way to relax after long days. Although I am a fan of PlayStation and Nintendo, I am much more of a Steam geek now. Ever since I custom built my desktop computer, computer games have been much better and I love nothing more than my companion cube!',
            stats: {
                'Platform': 'PC (Steam)',
                'Also Play': 'PlayStation, Nintendo',
                'Interest': 'Game mechanics'
            },
            connections: ['programming', 'puzzles', 'board-games', '3d-modeling'],
            relatedSkills: ['C++', 'Windows (10+ years)'],
            details: 'Custom-built gaming PC, puzzle game enthusiast, enjoys finding game flaws'
        },
        {
            id: 'programming',
            label: 'Programming',
            icon: 'bi-code-slash',
            size: 'secondary',
            description: 'Programming is both my profession and passion. I enjoy solving complex problems through code, building tools and prototypes, and exploring new technologies. The logical thinking and pattern recognition align perfectly with my love for mathematics and puzzles.',
            stats: {
                'Experience': '10+ years',
                'Focus': 'AI, Web, Data',
                'Languages': 'Python, C#, JS'
            },
            connections: ['puzzles', 'mathematics', 'video-games', '3d-modeling', '3d-printing'],
            relatedSkills: ['Python', 'C#', 'JavaScript', 'HTML', 'Web Development', 'Artificial Intelligence / LLM Integration', 'Machine Learning', 'Automation', 'Agile Development'],
            details: 'Professional developer specializing in innovation and AI-driven solutions'
        },
        {
            id: 'mathematics',
            label: 'Mathematics',
            icon: 'bi-calculator',
            size: 'secondary',
            description: 'Mathematics underpins many of my interests. From music theory and patterns to cryptography and problem-solving, I find mathematical concepts fascinating and beautiful. I minored in mathematics during my undergraduate studies.',
            stats: {
                'Education': 'Math Minor',
                'Applications': 'Theory, Crypto',
                'Interest': 'Patterns'
            },
            connections: ['music', 'puzzles', 'programming', 'board-games'],
            relatedSkills: ['Data Science / Data Visualization', 'Project Architecture'],
            details: 'Applies mathematical thinking to music composition, game strategy, and code optimization'
        },
        {
            id: 'bicycling',
            label: 'Bicycling',
            icon: 'bi-bicycle',
            size: 'tertiary',
            description: 'I used to ride my bike every day, and while I don\'t ride quite as often now, it\'s still one of my favorite ways to get around and unwind. Fayetteville has some of the prettiest trails, and I love exploring new spots whenever I can. I do not ride professionally or for races, only for recreational fun!',
            stats: {
                'Type': 'Recreation',
                'Bike': '2014 Redline Metro',
                'Activity': 'Trail exploration'
            },
            connections: [],
            relatedSkills: [],
            details: 'Enjoys trail riding and exploring new routes in Fayetteville'
        },
        {
            id: '3d-modeling',
            label: '3D Modeling',
            icon: 'bi-box',
            size: 'tertiary',
            description: 'Creating 3D models combines creativity with technical precision. Whether designing functional parts for 3D printing or creating assets for visualization, 3D modeling allows me to bring ideas into tangible (or digital) form.',
            stats: {
                'Tools': 'CAD software',
                'Focus': 'Functional design',
                'Use Case': 'Prototyping'
            },
            connections: ['3d-printing', 'programming', 'video-games'],
            relatedSkills: ['Adobe Photoshop (6+ years)'],
            details: 'Creates both functional parts and creative designs'
        },
        {
            id: '3d-printing',
            label: '3D Printing',
            icon: 'bi-printer',
            size: 'tertiary',
            description: 'Turning digital designs into physical objects through 3D printing is incredibly satisfying. It\'s the perfect intersection of technology and fabrication, allowing rapid prototyping and creation of custom solutions.',
            stats: {
                'Type': 'Fabrication',
                'Use': 'Prototyping, Tools',
                'Interest': 'Maker culture'
            },
            connections: ['3d-modeling', 'programming'],
            relatedSkills: ['Automation'],
            details: 'Prints functional parts, prototypes, and custom creations'
        }
    ];

    let selectedNode = null;
    let container = null;
    let canvas = null;
    let svg = null;
    let detailPanel = null;

    /**
     * Initialize the galaxy visualization
     */
    function init() {
        container = document.getElementById('interest-galaxy');
        if (!container) return;

        createStarfield();
        createSVGCanvas();
        createNodes();
        createConnections();
        createDetailPanel();
        addEventListeners();

        // Mobile-specific setup
        if (isMobile()) {
            showMobileHint();
        }
    }

    /**
     * Check if device is mobile (phone)
     */
    function isMobile() {
        return window.innerWidth <= 767;
    }

    /**
     * Check if device is very small mobile (small phone)
     */
    function isVerySmallMobile() {
        return window.innerWidth <= 400;
    }

    /**
     * Check if device is tablet
     */
    function isTablet() {
        return window.innerWidth > 767 && window.innerWidth <= 1024;
    }

    /**
     * Create animated starfield background
     */
    function createStarfield() {
        const starfield = document.createElement('div');
        starfield.className = 'galaxy-stars';

        // Create random stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'galaxy-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starfield.appendChild(star);
        }

        container.appendChild(starfield);
    }

    /**
     * Create SVG canvas for connection lines
     */
    function createSVGCanvas() {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'interest-connections';
        svg.style.width = '100%';
        svg.style.height = '100%';
        container.appendChild(svg);
    }

    /**
     * Check if two circles overlap
     */
    function checkCollision(x1, y1, r1, x2, y2, r2, minGap) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = r1 + r2 + minGap;
        return distance < minDistance;
    }

    /**
     * Find a non-overlapping position for a node
     */
    function findNonOverlappingPosition(interest, index, placedNodes, centerX, centerY, maxAttempts = 50) {
        const mobile = isMobile();
        const verySmallMobile = isVerySmallMobile();
        const tablet = isTablet();
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Adjust node sizes based on device (four tiers: very small mobile, mobile, tablet, desktop)
        let nodeSize;
        if (verySmallMobile) {
            nodeSize = interest.size === 'primary' ? 52 : interest.size === 'secondary' ? 42 : 34;
        } else if (mobile) {
            nodeSize = interest.size === 'primary' ? 60 : interest.size === 'secondary' ? 48 : 38;
        } else if (tablet) {
            nodeSize = interest.size === 'primary' ? 85 : interest.size === 'secondary' ? 65 : 50;
        } else {
            nodeSize = interest.size === 'primary' ? 120 : interest.size === 'secondary' ? 90 : 70;
        }

        const radius = nodeSize / 2;
        const minGap = verySmallMobile ? 18 : mobile ? 22 : tablet ? 20 : 20; // Larger gap on mobile to prevent overlap

        // Calculate max radius to keep nodes within bounds (with padding)
        const padding = verySmallMobile ? 40 : mobile ? 50 : tablet ? 70 : 80;
        const maxRadius = Math.min(
            centerX - radius - padding,
            centerY - radius - padding,
            containerWidth - centerX - radius - padding,
            containerHeight - centerY - radius - padding
        );

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Use spiral pattern with increasing radius based on attempts
            const baseAngle = (index / interestsData.length) * Math.PI * 2;
            const angleOffset = (attempt / maxAttempts) * Math.PI * 0.5;
            const angle = baseAngle + angleOffset;

            // Base radius depends on node size with more spacing (adjusted for new sizes)
            // Optimized clustering for four device tiers
            let baseRadius;
            if (verySmallMobile) {
                baseRadius = interest.size === 'primary' ? 50 : interest.size === 'secondary' ? 90 : 120;
            } else if (mobile) {
                baseRadius = interest.size === 'primary' ? 70 : interest.size === 'secondary' ? 115 : 150;
            } else if (tablet) {
                baseRadius = interest.size === 'primary' ? 110 : interest.size === 'secondary' ? 155 : 195;
            } else {
                baseRadius = interest.size === 'primary' ? 190 : interest.size === 'secondary' ? 240 : 280;
            }

            // Increase radius with each attempt, but cap at maxRadius
            baseRadius = Math.min(baseRadius + attempt * (verySmallMobile ? 6 : mobile ? 8 : tablet ? 10 : 15), maxRadius);

            const x = centerX + baseRadius * Math.cos(angle);
            const y = centerY + baseRadius * Math.sin(angle);

            // Ensure position is within container bounds
            if (x - radius < padding || x + radius > containerWidth - padding ||
                y - radius < padding || y + radius > containerHeight - padding) {
                continue;
            }

            // Check collision with all placed nodes
            let hasCollision = false;
            for (const placed of placedNodes) {
                let placedSize;
                if (verySmallMobile) {
                    placedSize = placed.size === 'primary' ? 52 : placed.size === 'secondary' ? 42 : 34;
                } else if (mobile) {
                    placedSize = placed.size === 'primary' ? 60 : placed.size === 'secondary' ? 48 : 38;
                } else if (tablet) {
                    placedSize = placed.size === 'primary' ? 85 : placed.size === 'secondary' ? 65 : 50;
                } else {
                    placedSize = placed.size === 'primary' ? 120 : placed.size === 'secondary' ? 90 : 70;
                }
                const placedRadius = placedSize / 2;

                if (checkCollision(x, y, radius, placed.x, placed.y, placedRadius, minGap)) {
                    hasCollision = true;
                    break;
                }
            }

            if (!hasCollision) {
                return { x, y };
            }
        }

        // Fallback: use constrained position
        const fallbackAngle = (index / interestsData.length) * Math.PI * 2;
        let fallbackRadius;
        if (verySmallMobile) {
            fallbackRadius = Math.min(60 + index * 8, maxRadius);
        } else if (mobile) {
            fallbackRadius = Math.min(80 + index * 10, maxRadius);
        } else if (tablet) {
            fallbackRadius = Math.min(120 + index * 12, maxRadius);
        } else {
            fallbackRadius = Math.min(270 + index * 15, maxRadius);
        }
        return {
            x: centerX + fallbackRadius * Math.cos(fallbackAngle),
            y: centerY + fallbackRadius * Math.sin(fallbackAngle)
        };
    }

    /**
     * Create interest nodes with collision-free positioning
     */
    function createNodes() {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        const placedNodes = [];
        const mobile = isMobile();
        const verySmallMobile = isVerySmallMobile();
        const tablet = isTablet();

        interestsData.forEach((interest, index) => {
            const node = document.createElement('div');
            node.className = `interest-node size-${interest.size} color-${interest.size}`;
            node.dataset.id = interest.id;

            // Find non-overlapping position
            const position = findNonOverlappingPosition(interest, index, placedNodes, centerX, centerY);

            // Store position for connection lines
            interest.x = position.x;
            interest.y = position.y;
            placedNodes.push(interest);

            // Position node (accounting for node size based on device)
            let nodeSize;
            if (verySmallMobile) {
                nodeSize = interest.size === 'primary' ? 52 : interest.size === 'secondary' ? 42 : 34;
            } else if (mobile) {
                nodeSize = interest.size === 'primary' ? 60 : interest.size === 'secondary' ? 48 : 38;
            } else if (tablet) {
                nodeSize = interest.size === 'primary' ? 85 : interest.size === 'secondary' ? 65 : 50;
            } else {
                nodeSize = interest.size === 'primary' ? 120 : interest.size === 'secondary' ? 90 : 70;
            }
            node.style.left = (position.x - nodeSize / 2) + 'px';
            node.style.top = (position.y - nodeSize / 2) + 'px';

            // Create node content
            node.innerHTML = `
                <div class="interest-node-inner">
                    <i class="bi ${interest.icon} interest-node-icon"></i>
                    <div class="interest-node-label">${interest.label}</div>
                </div>
            `;

            // Add click handler
            node.addEventListener('click', () => selectNode(interest.id));

            // Add hover handlers for highlighting connections (desktop only)
            if (!mobile) {
                node.addEventListener('mouseenter', () => highlightConnections(interest.id, true));
                node.addEventListener('mouseleave', () => highlightConnections(interest.id, false));
            }

            container.appendChild(node);
        });
    }

    /**
     * Create connection lines between related interests
     */
    function createConnections() {
        interestsData.forEach(interest => {
            interest.connections.forEach(targetId => {
                const target = interestsData.find(i => i.id === targetId);
                if (target) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', interest.x);
                    line.setAttribute('y1', interest.y);
                    line.setAttribute('x2', target.x);
                    line.setAttribute('y2', target.y);
                    line.classList.add('connection-line');
                    line.dataset.from = interest.id;
                    line.dataset.to = targetId;
                    svg.appendChild(line);
                }
            });
        });
    }

    /**
     * Highlight connections for a specific node
     */
    function highlightConnections(nodeId, highlight) {
        const lines = svg.querySelectorAll('.connection-line');
        lines.forEach(line => {
            if (line.dataset.from === nodeId || line.dataset.to === nodeId) {
                if (highlight) {
                    line.classList.add('highlighted');
                } else {
                    line.classList.remove('highlighted');
                }
            }
        });
    }

    /**
     * Select a node and show its details
     */
    function selectNode(nodeId) {
        const interest = interestsData.find(i => i.id === nodeId);
        if (!interest) return;

        // Update node states
        document.querySelectorAll('.interest-node').forEach(n => {
            n.classList.remove('active');
        });
        document.querySelector(`[data-id="${nodeId}"]`).classList.add('active');

        // Show detail panel
        selectedNode = interest;
        showDetailPanel(interest);

        // Highlight all connections
        highlightConnections(nodeId, true);
    }

    /**
     * Create the detail panel
     */
    function createDetailPanel() {
        detailPanel = document.createElement('div');
        detailPanel.id = 'interest-detail-panel';
        detailPanel.innerHTML = `
            <button class="detail-close">&times;</button>
            <div class="detail-content-wrapper"></div>
        `;

        document.getElementById('interest-galaxy-container').appendChild(detailPanel);

        // Close button handler
        detailPanel.querySelector('.detail-close').addEventListener('click', closeDetailPanel);
    }

    /**
     * Show detail panel with interest information
     */
    function showDetailPanel(interest) {
        const wrapper = detailPanel.querySelector('.detail-content-wrapper');

        // Build stats HTML
        let statsHTML = '';
        for (const [label, value] of Object.entries(interest.stats)) {
            statsHTML += `
                <div class="detail-stat">
                    <div class="detail-stat-label">${label}</div>
                    <div class="detail-stat-value">${value}</div>
                </div>
            `;
        }

        // Build connections HTML
        let connectionsHTML = '';
        if (interest.connections.length > 0) {
            connectionsHTML = `
                <div class="detail-connections">
                    <h4>Connected Interests</h4>
                    <div class="connection-tags">
                        ${interest.connections.map(connId => {
                            const conn = interestsData.find(i => i.id === connId);
                            return `<div class="connection-tag" data-target="${connId}">${conn.label}</div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Build related skills HTML
        let skillsHTML = '';
        if (interest.relatedSkills && interest.relatedSkills.length > 0) {
            skillsHTML = `
                <div class="detail-connections related-skills-section">
                    <h4>Related Skills</h4>
                    <div class="connection-tags">
                        ${interest.relatedSkills.map(skillName => {
                            return `<div class="connection-tag skill-tag" data-skill="${skillName}"><i class="bi bi-star-fill"></i> ${skillName}</div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        wrapper.innerHTML = `
            <div class="detail-header">
                <i class="bi ${interest.icon} detail-icon"></i>
                <h3 class="detail-title">${interest.label}</h3>
            </div>
            <div class="detail-stats">
                ${statsHTML}
            </div>
            <div class="detail-content">
                <p>${interest.description}</p>
                ${interest.details ? `<p><strong>Details:</strong> ${interest.details}</p>` : ''}
            </div>
            ${skillsHTML}
            ${connectionsHTML}
        `;

        // Add click handlers for connection tags (interests)
        wrapper.querySelectorAll('.connection-tag:not(.skill-tag)').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = tag.dataset.target;
                if (targetId) {
                    selectNode(targetId);
                }
            });
        });

        // Add click handlers for skill tags
        wrapper.querySelectorAll('.skill-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillName = tag.dataset.skill;
                if (skillName) {
                    openSkillDialog(skillName);
                }
            });
        });

        detailPanel.classList.add('visible');

        // Hide instructions when panel is shown
        const instructions = document.querySelector('.galaxy-instructions');
        if (instructions) {
            instructions.classList.add('hidden');
        }
    }

    /**
     * Close the detail panel
     */
    function closeDetailPanel() {
        detailPanel.classList.remove('visible');

        // Clear active states
        document.querySelectorAll('.interest-node').forEach(n => {
            n.classList.remove('active');
        });

        // Clear highlighted connections
        svg.querySelectorAll('.connection-line').forEach(line => {
            line.classList.remove('highlighted');
        });

        selectedNode = null;

        // Show instructions again
        const instructions = document.querySelector('.galaxy-instructions');
        if (instructions) {
            instructions.classList.remove('hidden');
        }
    }

    /**
     * Add event listeners
     */
    function addEventListeners() {
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (detailPanel && detailPanel.classList.contains('visible')) {
                if (!e.target.closest('#interest-detail-panel') &&
                    !e.target.closest('.interest-node')) {
                    closeDetailPanel();
                }
            }
        });

        // Recalculate positions on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                repositionNodes();
            }, 250);
        });
    }

    /**
     * Reposition nodes on window resize
     */
    function repositionNodes() {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        const placedNodes = [];
        const mobile = isMobile();
        const verySmallMobile = isVerySmallMobile();
        const tablet = isTablet();

        interestsData.forEach((interest, index) => {
            // Find non-overlapping position
            const position = findNonOverlappingPosition(interest, index, placedNodes, centerX, centerY);

            interest.x = position.x;
            interest.y = position.y;
            placedNodes.push(interest);

            const node = document.querySelector(`[data-id="${interest.id}"]`);
            let nodeSize;
            if (verySmallMobile) {
                nodeSize = interest.size === 'primary' ? 52 : interest.size === 'secondary' ? 42 : 34;
            } else if (mobile) {
                nodeSize = interest.size === 'primary' ? 60 : interest.size === 'secondary' ? 48 : 38;
            } else if (tablet) {
                nodeSize = interest.size === 'primary' ? 85 : interest.size === 'secondary' ? 65 : 50;
            } else {
                nodeSize = interest.size === 'primary' ? 120 : interest.size === 'secondary' ? 90 : 70;
            }
            node.style.left = (position.x - nodeSize / 2) + 'px';
            node.style.top = (position.y - nodeSize / 2) + 'px';
        });

        // Redraw connections
        svg.querySelectorAll('.connection-line').forEach(line => line.remove());
        createConnections();
    }

    /**
     * Center the galaxy view on mobile devices
     */
    function centerGalaxyOnMobile() {
        // Scroll to center the galaxy canvas horizontally
        const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
        const scrollTop = (container.scrollHeight - container.clientHeight) / 2;

        container.scrollLeft = scrollLeft;
        container.scrollTop = scrollTop;
    }

    /**
     * Show a helpful hint for mobile users
     */
    function showMobileHint() {
        const hint = document.createElement('div');
        hint.className = 'mobile-hint';
        hint.innerHTML = '<i class="bi bi-hand-index-thumb"></i> Tap a node to explore • Swipe to view all';
        document.getElementById('interest-galaxy-container').appendChild(hint);

        // Remove hint after animation completes
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 3000);
    }

    /**
     * Open a skill dialog by scrolling to the abilities section and highlighting the skill
     * @param {String} skillName - Name of the skill to highlight
     */
    function openSkillDialog(skillName) {
        // First, scroll to the abilities section
        const abilitiesSection = document.getElementById('abilities');
        if (!abilitiesSection) {
            console.warn('Abilities section not found');
            return;
        }

        // Close the interest detail panel
        closeDetailPanel();

        // Smooth scroll to abilities section
        abilitiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Wait for scroll to complete, then find and highlight the skill
        setTimeout(() => {
            // Find all skill items
            const skillItems = document.querySelectorAll('.skill-list li');
            let targetSkill = null;

            skillItems.forEach(item => {
                const skillTitle = item.querySelector('.skill-title span:first-child');
                if (skillTitle && skillTitle.textContent.trim() === skillName) {
                    targetSkill = item;
                }
            });

            if (targetSkill) {
                // Remove any existing highlights
                skillItems.forEach(item => item.classList.remove('skill-highlighted'));

                // Add highlight to target skill
                targetSkill.classList.add('skill-highlighted');

                // Scroll the skill into view if needed
                targetSkill.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Wait 1.5 seconds before adding particle effect so user can read the skill name
                setTimeout(() => {
                    if (window.SkillsRenderer && typeof window.SkillsRenderer.createParticleBurst === 'function') {
                        window.SkillsRenderer.createParticleBurst(targetSkill, '#22A39F');
                    }
                }, 1500);

                // Remove highlight after burst completes (1.5s delay + 1s burst + 2.5s to read)
                setTimeout(() => {
                    targetSkill.classList.remove('skill-highlighted');
                }, 5000);
            } else {
                console.warn(`Skill "${skillName}" not found in abilities section`);
            }
        }, 800); // Wait for scroll animation to complete
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('interest-galaxy')) {
        InterestGalaxy.init();
    }
});
