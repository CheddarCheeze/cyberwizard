/**
 * Scroll-Driven Journey Map
 * Animated career journey with vehicle moving between cities as user scrolls
 */

(function() {
    'use strict';

    const JourneyMap = {
        data: null,
        elements: {},
        currentStep: 0,
        scrollProgress: 0,

        // Map coordinates (relative positioning on canvas)
        cityPositions: {},

        init: function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        },

        setup: async function() {
            try {
                // Load journey data
                const response = await fetch('view/data/journey.json');
                this.data = await response.json();

                // Sort journey steps chronologically by date
                this.data.journey.sort((a, b) => {
                    const dateA = a.date || '0000';
                    const dateB = b.date || '0000';
                    return dateA.localeCompare(dateB);
                });

                // Calculate city positions on canvas
                this.calculateCityPositions();

                // Render the journey map
                this.render();

                // Setup scroll listener
                this.setupScrollListener();

            } catch (error) {
                console.error('Error loading journey data:', error);
            }
        },

        calculateCityPositions: function() {
            // Calculate actual positions on the OpenStreetMap tile grid
            // Tiles: zoom 7, x: 29-32 (4 tiles), y: 48-51 (4 tiles)
            // Grid is 1024x1024px (4x4 tiles @ 256px each)

            // Convert lat/lng to tile coordinates at zoom 7
            function latLngToTilePercent(lat, lng) {
                const zoom = 7;
                const n = Math.pow(2, zoom);

                // Calculate tile coordinates (with decimal for position within tile)
                const xTile = ((lng + 180) / 360) * n;
                const latRad = lat * Math.PI / 180;
                const yTile = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;

                // Our grid starts at tile x=29, y=48 and spans 4 tiles wide, 4 tiles tall
                const xPercent = ((xTile - 29) / 4) * 100;
                const yPercent = ((yTile - 48) / 4) * 100;

                return { x: xPercent, y: yPercent };
            }

            // Tulsa: 36.1539°N, -95.9928°W
            // Fayetteville: 36.0626°N, -94.1574°W
            // Collierville: 35.0420°N, -89.6645°W
            // Overland Park: 38.9822°N, -94.6708°W

            this.cityPositions = {
                tulsa: latLngToTilePercent(36.1539, -95.9928),
                fayetteville: latLngToTilePercent(36.0626, -94.1574),
                collierville: latLngToTilePercent(35.0420, -89.6645),
                overlandpark: latLngToTilePercent(38.9822, -94.6708)
            };
        },

        render: function() {
            const experiencesSection = document.getElementById('experiences');
            if (!experiencesSection) return;

            // Timeline view already exists in HTML, just find it
            const timelineView = document.getElementById('timeline-view');
            if (!timelineView) return;

            // Create journey map container - insert after timeline view
            const mapHTML = `
                <div id="journey-map-section" class="view-container">
                    <div id="journey-map-container">
                        <div id="journey-canvas">
                            <div class="journey-loading">
                                <div class="spinner"></div>
                            </div>
                            <svg id="map-svg"></svg>
                            <div id="vehicle">🚗</div>
                            <div id="journey-stats">
                                <div class="stat-item">
                                    <span class="stat-icon">📍</span>
                                    <span><span class="stat-value" id="cities-count">4</span> Cities</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🛣️</span>
                                    <span><span class="stat-value" id="distance-total">615</span> Miles</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">💼</span>
                                    <span><span class="stat-value" id="experiences-count">25</span> Experiences</span>
                                </div>
                            </div>
                        </div>
                        <div class="scroll-hint">
                            Scroll to journey through career ↓
                        </div>
                    </div>
                </div>

                <div id="journey-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">Start</div>
                </div>
            `;

            // Insert journey map after timeline view
            timelineView.insertAdjacentHTML('afterend', mapHTML);

            // Cache element references
            this.elements = {
                section: document.getElementById('journey-map-section'),
                canvas: document.getElementById('journey-canvas'),
                svg: document.getElementById('map-svg'),
                vehicle: document.getElementById('vehicle'),
                progressFill: document.querySelector('.progress-fill'),
                progressText: document.querySelector('.progress-text'),
                progressIndicator: document.getElementById('journey-progress'),
                loading: document.querySelector('.journey-loading'),
                scrollHint: document.querySelector('.scroll-hint')
            };

            // Draw the map
            this.drawMap();

            // Position vehicle at start (Tulsa) facing right
            const startPos = this.cityPositions.tulsa;
            this.elements.vehicle.style.left = startPos.x + '%';
            this.elements.vehicle.style.top = startPos.y + '%';
            // Car emoji faces left by default, flip horizontally to face right
            this.elements.vehicle.style.transform = 'translate(-50%, -50%) scaleX(-1) rotate(0deg)';

            // Remove loading state
            setTimeout(() => {
                if (this.elements.loading) {
                    this.elements.loading.style.display = 'none';
                }
            }, 500);

            // Update stats with calculated values
            this.updateStats();

            // Setup view toggle functionality
            this.setupViewToggle();
        },

        updateStats: function() {
            // Calculate stats from data
            const cityCount = Object.keys(this.data.locations).length;

            // Calculate total distance from all transit steps
            const totalDistance = this.data.journey
                .filter(step => step.type === 'transit' && step.distance)
                .reduce((sum, step) => sum + step.distance, 0);

            // Count experiences (non-transit steps)
            const experienceCount = this.data.journey.filter(step => step.type !== 'transit').length;

            // Update DOM elements
            const citiesEl = document.getElementById('cities-count');
            const distanceEl = document.getElementById('distance-total');
            const experiencesEl = document.getElementById('experiences-count');

            if (citiesEl) citiesEl.textContent = cityCount;
            if (distanceEl) distanceEl.textContent = totalDistance.toLocaleString();
            if (experiencesEl) experiencesEl.textContent = experienceCount;
        },

        setupViewToggle: function() {
            const toggleButtons = document.querySelectorAll('.view-toggle-btn');
            const timelineView = document.getElementById('timeline-view');
            const journeyView = document.getElementById('journey-map-section');

            toggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetView = button.getAttribute('data-view');

                    // Update button states
                    toggleButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    // Switch views
                    if (targetView === 'timeline') {
                        timelineView.classList.add('active');
                        journeyView.classList.remove('active');
                        if (this.elements.progressIndicator) {
                            this.elements.progressIndicator.style.display = 'none';
                        }
                    } else if (targetView === 'journey') {
                        timelineView.classList.remove('active');
                        journeyView.classList.add('active');
                        // Re-trigger scroll handler to update journey view
                        this.handleScroll();
                    }
                });
            });
        },

        drawMap: function() {
            const svg = this.elements.svg;
            const canvas = this.elements.canvas;

            // Add map tiles as SVG images (4x4 grid for better coverage)
            // Zoom 7 tiles covering OK, AR, KS, TN region
            // Using tiles 29-32 (x) and 48-51 (y) to fully cover all four cities
            const tiles = [
                [29, 48], [30, 48], [31, 48], [32, 48],
                [29, 49], [30, 49], [31, 49], [32, 49],
                [29, 50], [30, 50], [31, 50], [32, 50],
                [29, 51], [30, 51], [31, 51], [32, 51]
            ];

            // Each tile is 256px, 4x4 grid = 1024x1024px
            const tileSize = 256;
            const gridWidth = 4 * tileSize;  // 1024px
            const gridHeight = 4 * tileSize; // 1024px

            tiles.forEach(([x, y], index) => {
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                const row = Math.floor(index / 4);
                const col = index % 4;

                image.setAttribute('href', `https://tile.openstreetmap.org/7/${x}/${y}.png`);
                image.setAttribute('x', col * tileSize);
                image.setAttribute('y', row * tileSize);
                image.setAttribute('width', tileSize);
                image.setAttribute('height', tileSize);
                image.setAttribute('preserveAspectRatio', 'none');

                svg.appendChild(image);
            });

            // Set SVG viewBox to the tile grid dimensions
            svg.setAttribute('viewBox', `0 0 ${gridWidth} ${gridHeight}`);
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            // Draw city markers
            Object.keys(this.cityPositions).forEach(cityKey => {
                const pos = this.cityPositions[cityKey];
                const locationData = this.data.locations[cityKey];

                const marker = document.createElement('div');
                marker.className = 'city-marker';
                marker.style.left = pos.x + '%';
                marker.style.top = pos.y + '%';

                const dot = document.createElement('div');
                dot.className = `city-dot ${locationData.type}`;

                const label = document.createElement('div');
                label.className = 'city-label';
                label.textContent = locationData.name;

                marker.appendChild(dot);
                marker.appendChild(label);
                canvas.appendChild(marker);
            });

            // Draw routes using SVG paths
            this.drawRoutes();
        },

        drawRoutes: function() {
            const svg = this.elements.svg;
            const gridWidth = 1024;  // 4 tiles @ 256px each
            const gridHeight = 1024; // 4 tiles @ 256px each

            // Iterate through all journey steps and draw routes for transit steps
            this.data.journey.forEach((step, journeyIndex) => {
                if (step.type !== 'transit') return;

                const fromPos = this.cityPositions[step.from];
                const toPos = this.cityPositions[step.to];

                // Convert percentage positions to pixel coordinates
                const fromX = (fromPos.x / 100) * gridWidth;
                const fromY = (fromPos.y / 100) * gridHeight;
                const toX = (toPos.x / 100) * gridWidth;
                const toY = (toPos.y / 100) * gridHeight;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const controlX = (fromX + toX) / 2;
                const controlY = (fromY + toY) / 2 - 40; // Curve upward
                const d = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;

                path.setAttribute('d', d);
                path.setAttribute('class', 'route-line');
                path.setAttribute('id', `route-${step.id}`);
                // Store the actual journey index, not the transit-only index
                path.setAttribute('data-transit-index', journeyIndex);

                svg.appendChild(path);
            });
        },

        setupScrollListener: function() {
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Initial update
            this.handleScroll();
        },

        handleScroll: function() {
            const section = this.elements.section;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Check if section is in view
            const inView = rect.top < viewportHeight && rect.bottom > 0;

            // Show/hide progress indicator based on section visibility
            if (this.elements.progressIndicator) {
                if (inView) {
                    this.elements.progressIndicator.classList.add('visible');
                } else {
                    this.elements.progressIndicator.classList.remove('visible');
                }
            }

            // Calculate scroll progress (0 to 1)
            // Journey starts when section top reaches middle of viewport
            // and ends when section bottom leaves viewport
            let progress = 0;

            if (rect.top <= viewportHeight / 2) {
                // Section has entered the trigger zone
                const scrolled = (viewportHeight / 2) - rect.top;
                const scrollableDistance = sectionHeight - (viewportHeight / 2);
                progress = scrolled / scrollableDistance;
            }

            progress = Math.max(0, Math.min(1, progress));
            this.scrollProgress = progress;

            // Only update journey if section is in view AND we have progress
            if (inView && progress > 0) {
                this.updateJourney(progress);
            } else if (!inView || progress === 0) {
                // Remove any popups when not in view or at start
                const existingPopups = this.elements.canvas.querySelectorAll('.experience-popup');
                existingPopups.forEach(popup => popup.remove());
            }
        },

        updateJourney: function(progress) {
            // Map progress to journey steps
            const totalSteps = this.data.journey.length;
            const currentStepFloat = progress * (totalSteps - 1);
            const currentStepIndex = Math.floor(currentStepFloat);
            const stepProgress = currentStepFloat - currentStepIndex;

            // Update progress indicator
            this.elements.progressFill.style.width = (progress * 100) + '%';

            // Get current step
            const currentStep = this.data.journey[currentStepIndex];
            if (!currentStep) return;

            // Update progress text
            if (currentStep.type === 'transit') {
                this.elements.progressText.textContent = currentStep.title;
            } else {
                this.elements.progressText.textContent = currentStep.company || currentStep.title;
            }

            // Update vehicle position and show experiences
            this.updateVehiclePosition(currentStepFloat);
            this.showExperienceAtStep(currentStepIndex);

            // Activate routes as we progress
            this.activateRoutes(currentStepFloat);

            // Hide scroll hint after first scroll
            if (progress > 0.05 && this.elements.scrollHint) {
                this.elements.scrollHint.style.opacity = '0';
            }
        },

        updateVehiclePosition: function(stepFloat) {
            const stepIndex = Math.floor(stepFloat);
            const stepProgress = stepFloat - stepIndex;

            const currentStep = this.data.journey[stepIndex];
            const nextStep = this.data.journey[stepIndex + 1];

            if (!currentStep) return;

            let x, y;

            if (currentStep.type === 'transit' && stepProgress > 0) {
                // Animate vehicle along route
                const fromPos = this.cityPositions[currentStep.from];
                const toPos = this.cityPositions[currentStep.to];

                // Interpolate position
                x = fromPos.x + (toPos.x - fromPos.x) * stepProgress;
                y = fromPos.y + (toPos.y - fromPos.y) * stepProgress;

                this.elements.vehicle.classList.add('driving');

                // Rotate vehicle based on direction of travel
                // Car emoji faces left, so flip horizontally with scaleX(-1)
                const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

                // If going left (angle between 90 and 270 degrees), flip upside down too
                const isGoingLeft = Math.abs(angle) > Math.PI / 2;
                const scaleY = isGoingLeft ? -1 : 1;

                // When not flipped: negate angle for scaleX(-1)
                // When flipped vertically too: double negative = positive, so use original angle
                const angleDeg = isGoingLeft ? (angle * 180 / Math.PI) : -(angle * 180 / Math.PI);

                this.elements.vehicle.style.setProperty('--car-rotation', `${angleDeg}deg`);
                this.elements.vehicle.style.setProperty('--car-scale-y', scaleY);
                this.elements.vehicle.style.transform = `translate(-50%, -50%) scaleX(-1) scaleY(${scaleY}) rotate(${angleDeg}deg)`;

            } else {
                // Vehicle is stopped at a location
                const location = currentStep.location;
                if (location && this.cityPositions[location]) {
                    const pos = this.cityPositions[location];
                    x = pos.x;
                    y = pos.y;
                }

                this.elements.vehicle.classList.remove('driving');
                // Keep car facing right when stopped (flip horizontally)
                this.elements.vehicle.style.transform = 'translate(-50%, -50%) scaleX(-1) rotate(0deg)';
            }

            if (x !== undefined && y !== undefined) {
                this.elements.vehicle.style.left = x + '%';
                this.elements.vehicle.style.top = y + '%';
            }
        },

        showExperienceAtStep: function(stepIndex) {
            const step = this.data.journey[stepIndex];
            if (!step) return;

            // Don't show popups for transit
            if (step.type === 'transit') {
                // Remove any existing popups during transit
                const existingPopups = this.elements.canvas.querySelectorAll('.experience-popup');
                existingPopups.forEach(popup => popup.remove());
                return;
            }

            // Check if popup for this step already exists
            const existingPopup = this.elements.canvas.querySelector(`.experience-popup[data-step="${stepIndex}"]`);
            if (existingPopup && existingPopup.classList.contains('active')) {
                // Popup already showing for this step, don't recreate
                return;
            }

            // Remove existing popups
            const existingPopups = this.elements.canvas.querySelectorAll('.experience-popup');
            existingPopups.forEach(popup => popup.remove());

            // Create experience popup
            const popup = this.createExperiencePopup(step);
            popup.setAttribute('data-step', stepIndex); // Track which step this popup belongs to
            this.elements.canvas.appendChild(popup);

            // Position popup near the location
            const location = step.location;
            if (location && this.cityPositions[location]) {
                const pos = this.cityPositions[location];

                let popupX, popupY;

                // Check if we're on a small screen
                const isSmallScreen = window.innerWidth <= 991;

                if (isSmallScreen) {
                    // On small screens, always position in top right corner
                    // This area is always empty since all cities are in the lower-left region
                    popupX = 35; // More centered to prevent right-side cutoff
                    popupY = 5;  // Top of canvas
                } else {
                    // Desktop: Smart positioning near the marker
                    // Popup max-width is 400px, canvas is typically ~1400px max, so 400/1400 ≈ 29%
                    const popupWidthPercent = 30; // conservative estimate

                    // Try positioning to the right
                    if (pos.x + popupWidthPercent < 95) {
                        // Room on the right
                        popupX = pos.x + 3;
                    } else {
                        // Position to the left
                        popupX = pos.x - popupWidthPercent - 3;
                    }

                    // Ensure popup stays within horizontal bounds
                    popupX = Math.max(2, Math.min(popupX, 98 - popupWidthPercent));

                    // Vertical positioning - keep centered on marker with bounds checking
                    popupY = pos.y - 10; // Slightly above center

                    // Keep within vertical bounds
                    popupY = Math.max(2, Math.min(popupY, 85));
                }

                popup.style.left = popupX + '%';
                popup.style.top = popupY + '%';
            }

            // Activate popup immediately (no delay to prevent duplicates)
            requestAnimationFrame(() => {
                popup.classList.add('active');
            });
        },

        createExperiencePopup: function(step) {
            const popup = document.createElement('div');
            popup.className = 'experience-popup';

            const icon = step.icon || '📍';
            const title = step.company || step.title;
            const subtitle = step.company ? step.title : '';
            const period = step.period || step.date || '';
            const description = step.description || '';
            const gpa = step.gpa ? `GPA: ${step.gpa}` : '';
            const link = step.link || '';
            const badge = step.type || '';

            let linkHTML = '';
            if (link) {
                linkHTML = `<a href="${link}" target="_blank" class="link"><i class="bi bi-link-45deg"></i> Visit website</a>`;
            }

            let gpaHTML = '';
            if (gpa) {
                gpaHTML = `<div class="gpa">${gpa}</div>`;
            }

            let subtitleHTML = '';
            if (subtitle) {
                subtitleHTML = `<h4>${subtitle}</h4>`;
            }

            popup.innerHTML = `
                <div class="experience-popup-header">
                    <div class="experience-icon">${icon}</div>
                    <div>
                        <h3>${title}</h3>
                        ${subtitleHTML}
                    </div>
                </div>
                <div class="period">${period}</div>
                <div class="description">${description}</div>
                ${gpaHTML}
                ${linkHTML}
                <span class="experience-badge ${badge}">${badge}</span>
            `;

            return popup;
        },

        activateRoutes: function(stepFloat) {
            // Activate routes progressively as the car drives along them
            // Routes should appear as soon as we start traveling along them
            const routeElements = this.elements.svg.querySelectorAll('.route-line');

            routeElements.forEach(routeEl => {
                const transitIndex = parseInt(routeEl.getAttribute('data-transit-index'));

                // Activate route if we've reached or passed the transit step
                if (stepFloat >= transitIndex) {
                    routeEl.classList.add('active');
                } else {
                    // Haven't reached this route yet - keep it inactive
                    routeEl.classList.remove('active');
                }
            });
        }
    };

    // Initialize
    JourneyMap.init();

    // Expose for debugging
    window.JourneyMap = JourneyMap;

})();
