// ========================================================
// Magical Forest Wedding Invitation - JavaScript Core
// ========================================================

// Run immediately as script is at the bottom of the body
(function() {
    // Navigation State
    let currentStep = 0;
    const maxSteps = 3; // Welcome=0, Details=1, Dresscode=2, RSVP=3. Success=4 is manual.
    
    // DOM Elements
    const body = document.body;
    const cards = document.querySelectorAll('.card');
    const navControls = document.getElementById('nav-controls');
    const dots = document.querySelectorAll('.dot');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnEnter = document.getElementById('btn-enter');
    const btnToDresscode = document.getElementById('btn-to-dresscode');
    const btnToRsvp = document.getElementById('btn-to-rsvp');
    const btnRestart = document.getElementById('btn-restart');
    const rsvpForm = document.getElementById('rsvp-form');
    const forestContainer = document.getElementById('forest-container');
    const musicToggle = document.getElementById('music-toggle');

    // Canvas elements
    const firefliesCanvas = document.getElementById('fireflies-canvas');
    const firefliesFGCanvas = document.getElementById('fireflies-fg-canvas');

    // Set initial nav step
    body.setAttribute('data-nav-step', '0');

    // Redraw on resize
    window.addEventListener('resize', () => {
        resizeFirefliesCanvas();
    });

    // ========================================================
    // 2. MAGICAL FIREFLIES PARTICLE ENGINE
    // ========================================================
    const fCtx = firefliesCanvas.getContext('2d');
    const fgCtx = firefliesFGCanvas.getContext('2d');
    let fireflies = [];
    const bgFireflyCount = 40;
    const fgFireflyCount = 14; // Giant, blurry foreground lights
    let mouse = { x: null, y: null, radius: 110 };

    function resizeFirefliesCanvas() {
        firefliesCanvas.width = window.innerWidth;
        firefliesCanvas.height = window.innerHeight;
        firefliesFGCanvas.width = window.innerWidth;
        firefliesFGCanvas.height = window.innerHeight;
    }
    resizeFirefliesCanvas();

    // Firefly Particle definition
    class Firefly {
        constructor(layer = 'bg') {
            this.layer = layer;
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            
            if (this.layer === 'fg') {
                this.size = 3.8 + Math.random() * 4.2; // Giant lights
                // Foreground drifts slightly faster
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.4 - 0.15;
                this.alpha = 0.08 + Math.random() * 0.38; // Softer, translucent glow
                this.pulseSpeed = 0.004 + Math.random() * 0.01;
            } else {
                this.size = 1.2 + Math.random() * 2.8;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.4 - 0.1;
                this.alpha = Math.random();
                this.pulseSpeed = 0.01 + Math.random() * 0.02;
            }
            
            // Wavy motion variables
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = 0.01 + Math.random() * 0.03;
            this.waveRange = 0.3 + Math.random() * 0.5;
        }

        update() {
            // Apply drift
            this.angle += this.angularSpeed;
            this.x += this.vx + Math.cos(this.angle) * this.waveRange;
            this.y += this.vy;

            // Pulse glowing brightness
            this.alpha += this.pulseSpeed;
            
            const minAlpha = this.layer === 'fg' ? 0.05 : 0.1;
            const maxAlpha = this.layer === 'fg' ? 0.46 : 1.0;
            
            if (this.alpha > maxAlpha || this.alpha < minAlpha) {
                this.pulseSpeed = -this.pulseSpeed;
            }
            this.alpha = Math.max(minAlpha, Math.min(maxAlpha, this.alpha));

            // Wrap around screen edges
            const margin = this.size * 2 + 10;
            if (this.x < -margin) this.x = window.innerWidth + margin;
            if (this.x > window.innerWidth + margin) this.x = -margin;
            if (this.y < -margin) this.y = window.innerHeight + margin;
            if (this.y > window.innerHeight + margin) this.y = -margin;

            // Gentle mouse repulsion (magical reactive touch)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const activeRadius = this.layer === 'fg' ? mouse.radius * 1.3 : mouse.radius;
                
                if (dist < activeRadius) {
                    const force = (activeRadius - dist) / activeRadius;
                    // Push particles away gently
                    const pushFactor = this.layer === 'fg' ? 2.2 : 1.5;
                    this.x += (dx / dist) * force * pushFactor;
                    this.y += (dy / dist) * force * pushFactor;
                }
            }
        }

        draw(ctx) {
            ctx.save();
            if (this.layer === 'fg') {
                ctx.shadowBlur = this.size * 4.5;
                ctx.shadowColor = 'rgba(255, 230, 150, 0.7)';
                ctx.fillStyle = `rgba(255, 246, 190, ${this.alpha})`;
            } else {
                ctx.shadowBlur = this.size * 3.5;
                ctx.shadowColor = 'rgba(243, 229, 171, 0.9)';
                ctx.fillStyle = `rgba(255, 242, 161, ${this.alpha})`;
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize background and foreground fireflies
    for (let i = 0; i < bgFireflyCount; i++) {
        fireflies.push(new Firefly('bg'));
    }
    for (let i = 0; i < fgFireflyCount; i++) {
        fireflies.push(new Firefly('fg'));
    }

    // Interactive mouse movement tracker
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Support touch devices for firefly repulsion
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Animation Loop
    function animateFireflies() {
        fCtx.clearRect(0, 0, firefliesCanvas.width, firefliesCanvas.height);
        fgCtx.clearRect(0, 0, firefliesFGCanvas.width, firefliesFGCanvas.height);
        
        fireflies.forEach(firefly => {
            firefly.update();
            if (firefly.layer === 'fg') {
                firefly.draw(fgCtx);
            } else {
                firefly.draw(fCtx);
            }
        });
        requestAnimationFrame(animateFireflies);
    }
    animateFireflies();

    // ========================================================
    // 3. NAVIGATION STATE MACHINE (Parting Trees & Pages)
    // ========================================================
    
    function navigateToStep(step) {
        if (step < 0 || step > 4) return;
        
        currentStep = step;
        body.setAttribute('data-nav-step', currentStep.toString());

        // Update active card class
        cards.forEach(card => {
            const cardStep = parseInt(card.getAttribute('data-step'));
            if (cardStep === currentStep) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update dots and navigation bar visibility
        // Hide controls on Welcome (0) and Success (4) states
        if (currentStep === 0 || currentStep === 4) {
            navControls.classList.remove('visible');
        } else {
            navControls.classList.add('visible');
            
            // Update dot indicator
            dots.forEach(dot => {
                const dotStep = parseInt(dot.getAttribute('data-step'));
                if (dotStep === currentStep) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // Step Transition Button Handlers
    btnEnter.addEventListener('click', () => {
        navigateToStep(1);
        startBackgroundMusic();
    });

    btnToDresscode.addEventListener('click', () => navigateToStep(2));
    btnToRsvp.addEventListener('click', () => navigateToStep(3));

    btnRestart.addEventListener('click', () => {
        // Reset RSVP form details
        rsvpForm.reset();
        navigateToStep(0);
    });

    // Keyboard navigation (optional comfort feature)
    document.addEventListener('keydown', (e) => {
        if (currentStep === 0 || currentStep === 4) return;
        if (e.key === 'ArrowRight') {
            if (currentStep < maxSteps) navigateToStep(currentStep + 1);
        } else if (e.key === 'ArrowLeft') {
            if (currentStep > 1) navigateToStep(currentStep - 1);
        }
    });

    // Click navigation controls
    btnNext.addEventListener('click', () => {
        if (currentStep < maxSteps) {
            navigateToStep(currentStep + 1);
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            navigateToStep(currentStep - 1);
        }
    });

    // Clicking dots to directly jump to standard steps
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetStep = parseInt(dot.getAttribute('data-step'));
            navigateToStep(targetStep);
        });
    });

    // Clicking on forest trees in welcome screen opens the forest!
    forestContainer.addEventListener('click', (e) => {
        if (currentStep === 0) {
            navigateToStep(1);
            startBackgroundMusic();
        }
    });

    // ========================================================
    // 4. RSVP FORM PROCESSING & SIMULATION
    // ========================================================
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get filled RSVP data for realistic submission experience
        const name = document.getElementById('guest-name').value;
        const attendance = document.querySelector('input[name="attendance"]:checked').value;
        
        const selectedDrinks = [];
        document.querySelectorAll('input[name="drinks"]:checked').forEach(cb => {
            selectedDrinks.push(cb.value);
        });
        
        const foodWishes = document.getElementById('food-wishes').value;

        const responseData = {
            guestName: name,
            willAttend: attendance,
            drinks: selectedDrinks,
            dietaryRestrictions: foodWishes,
            timestamp: new Date().toISOString()
        };

        // Simulate saving data to mock storage
        localStorage.setItem('wedding_rsvp_response', JSON.stringify(responseData));

        // Display smooth success transition
        navigateToStep(4);
    });

    // Toggle dependent alcohol fields based on attendance choice (if they say "No", clear alcohol/food needs)
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    const dependentFields = document.querySelectorAll('.dependent-field');

    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'no') {
                dependentFields.forEach(field => {
                    field.style.opacity = '0.3';
                    field.style.pointerEvents = 'none';
                    // Uncheck alcohol boxes
                    field.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                });
            } else {
                dependentFields.forEach(field => {
                    field.style.opacity = '1';
                    field.style.pointerEvents = 'auto';
                });
            }
        });
    });

    // ========================================================
    // 5. COUNTDOWN TIMER
    // ========================================================
    const weddingDate = new Date('September 12, 2026 16:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = weddingDate - now;

        if (diff <= 0) {
            document.getElementById('countdown').innerHTML = "<div class='countdown-over'>Мы поженились!</div>";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Pad zeros for premium digital look
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    }

    // Start timer and refresh every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ========================================================
    // 6. PROCEDURAL AMBIENT WIND SYNTHESIZER (Web Audio API)
    // ========================================================
    let windSynth = null;

    function createWindSynth() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // Generate a 5-second buffer of white noise
        const bufferSize = ctx.sampleRate * 5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        
        // Bandpass filter to isolate the whistling wind frequencies
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2.5; // Resonant bandwidth
        filter.frequency.value = 350; // Center frequency
        
        // Lowpass filter to simulate the deep rustling of leaves and foliage
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 200;
        
        // LFO to modulate the bandpass filter frequency (produces swaying wind gusts)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.07; // Very slow cycle (approx 14s)
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 160; // Sweeps frequency between 190Hz and 510Hz
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        // Main volume control (Gain node) set to a gentle, comfortable level
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.05; // Extremely soft forest atmosphere
        
        // Separate gain to balance noise signal
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.4;
        noiseSource.connect(noiseGain);
        
        noiseGain.connect(filter);
        noiseGain.connect(lowpass);
        
        filter.connect(gainNode);
        lowpass.connect(gainNode);
        
        gainNode.connect(ctx.destination);
        
        lfo.start();
        noiseSource.start();
        
        return {
            context: ctx,
            source: noiseSource,
            gain: gainNode,
            lfo: lfo
        };
    }

    function startBackgroundMusic() {
        if (!windSynth) {
            try {
                windSynth = createWindSynth();
                musicToggle.classList.add('playing');
            } catch (err) {
                console.log("AudioContext failed to initialize:", err);
            }
        } else if (windSynth.context.state === 'suspended') {
            windSynth.context.resume().then(() => {
                musicToggle.classList.add('playing');
            });
        }
    }

    musicToggle.addEventListener('click', () => {
        if (!windSynth) {
            startBackgroundMusic();
        } else if (windSynth.context.state === 'running') {
            windSynth.context.suspend().then(() => {
                musicToggle.classList.remove('playing');
            });
        } else {
            windSynth.context.resume().then(() => {
                musicToggle.classList.add('playing');
            });
        }
    });

    // Remove preloader once everything is fully loaded (images, fonts, assets)
    function removePreloader() {
        const preloader = document.getElementById('site-preloader');
        
        // Remove preload-active to trigger the smooth fade-in transition of the forest & content
        document.body.classList.remove('preload-active');
        
        if (preloader) {
            preloader.classList.add('fade-out');
        }
        
        // Defer removing the transition-locking .preload class until after the preloader has fully faded out (1.0s)
        setTimeout(() => {
            document.body.classList.remove('preload');
        }, 1000);
    }

    if (document.readyState === 'complete') {
        removePreloader();
    } else {
        window.addEventListener('load', removePreloader);
    }
})();
