// Get the canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas to full window size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Helper function to generate random numbers in a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Add configuration object
const config = {
    petalCount: 100,
    petalSize: 3,
    fallSpeed: 1,
    windSpeed: 0.5,
    petalColor: '#ffb6c1',
    rainEnabled: false,
    intensity: 1,
    particles: [],
    time: 12,
    cyclePaused: true,
    backgroundColor: 'rgb(17, 17, 17)',
    stars: [],
    milkyWayOpacity: 0,
    layerCount: 3,  // Number of depth layers
    depthScale: 0.7, // Scale factor between layers
    petalLayers: [],  // Initialize empty array for petal layers
    mistEnabled: false,  // Change initial state to false
    mistIntensity: 0.5,  // Add default mist intensity
    mistFadeLevel: 1  // Add fade level property
};

class RainDrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(0, canvas.width);
        this.y = -20;
        this.speed = random(15, 25);
        this.size = random(10, 20);
        this.opacity = random(0.2, 0.5);
    }

    update() {
        this.y += this.speed * config.intensity;
        this.x += config.windSpeed;

        if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = `rgba(180, 180, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + config.windSpeed, this.y + this.size);
        ctx.stroke();
        ctx.restore();
    }
}

function createRain() {
    config.particles = [];
    for (let i = 0; i < 100; i++) {
        config.particles.push(new RainDrop());
    }
}

// UI control handlers
function setupControls() {
    // Helper function to update span values
    const updateValue = (id, value) => document.getElementById(id + 'Value').textContent = value;

    // Setup event listeners for all controls
    document.getElementById('petalCount').addEventListener('input', (e) => {
        config.petalCount = parseInt(e.target.value);
        updateValue('petalCount', config.petalCount);
        createPetals(); // Recreate all layers
    });

    document.getElementById('petalSize').addEventListener('input', (e) => {
        config.petalSize = parseFloat(e.target.value);
        updateValue('petalSize', config.petalSize);
    });

    document.getElementById('fallSpeed').addEventListener('input', (e) => {
        config.fallSpeed = parseFloat(e.target.value);
        updateValue('fallSpeed', config.fallSpeed);
    });

    document.getElementById('windSpeed').addEventListener('input', (e) => {
        config.windSpeed = parseFloat(e.target.value);
        updateValue('windSpeed', config.windSpeed);
    });

    document.getElementById('petalColor').addEventListener('input', (e) => {
        config.petalColor = e.target.value;
    });

    const rainToggle = document.getElementById('rainToggle');
    rainToggle.addEventListener('click', () => {
        config.rainEnabled = !config.rainEnabled;
        rainToggle.classList.toggle('active');
        if (config.rainEnabled && config.particles.length === 0) {
            createRain();
        }
    });

    document.getElementById('intensity').addEventListener('input', (e) => {
        config.intensity = parseFloat(e.target.value);
        updateValue('intensity', config.intensity);
    });

    const timeSlider = document.getElementById('timeOfDay');
    const cycleToggle = document.getElementById('cycleToggle');

    timeSlider.addEventListener('input', (e) => {
        config.time = parseFloat(e.target.value);
        updateTimeDisplay();
    });

    cycleToggle.addEventListener('click', () => {
        config.cyclePaused = !config.cyclePaused;
        cycleToggle.classList.toggle('active');
        cycleToggle.textContent = config.cyclePaused ? 
            'Start Day/Night Cycle' : 'Pause Day/Night Cycle';
    });

    const mistToggle = document.getElementById('mistToggle');
    mistToggle.addEventListener('click', () => {
        config.mistEnabled = !config.mistEnabled;
        mistToggle.classList.toggle('active', config.mistEnabled); // Match visual state to actual state
        mistToggle.textContent = config.mistEnabled ? 'Disable Ethereal Mist' : 'Enable Ethereal Mist';
    });

    document.getElementById('mistIntensity').addEventListener('input', (e) => {
        config.mistIntensity = parseFloat(e.target.value);
        updateValue('mistIntensity', config.mistIntensity);
    });
}

function updateTimeDisplay() {
    const hours = Math.floor(config.time);
    const minutes = Math.floor((config.time % 1) * 60);
    document.getElementById('timeValue').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Function to update number of petals
function updatePetals() {
    const difference = config.petalCount - petals.length;
    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            petals.push(new Petal());
        }
    } else if (difference < 0) {
        petals.splice(difference);
    }
}

// Petal class for each falling blossom
class Petal {
    constructor(layer = 0) {
        this.layer = layer; // 0 is closest, higher numbers are further
        this.reset();
    }
  
    reset() {
        // Calculate depth-based scaling factors
        const depthFactor = Math.pow(config.depthScale, this.layer);
        const depthPosition = 1 - (this.layer / config.layerCount);
        
        this.x = random(0, canvas.width);
        this.y = random(-50, 0);
        
        // Scale size and speed based on depth
        this.size = random(config.petalSize * 0.8, config.petalSize * 1.2) * depthFactor;
        this.speedY = random(0.5, 1.5) * config.fallSpeed * depthFactor;
        this.speedX = (random(-0.5, 0.5) + config.windSpeed) * depthFactor;
        
        this.angle = random(0, Math.PI * 2);
        this.angularSpeed = random(-0.02, 0.02) * depthFactor;
        this.wobble = random(0, Math.PI * 2);
        this.wobbleSpeed = random(0.01, 0.05) * depthFactor;
        
        // Adjust opacity based on depth
        const baseOpacity = random(0.5, 0.9);
        this.opacity = baseOpacity * (0.7 + (0.3 * depthPosition));
    }
  
    update() {
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;
        this.y += this.speedY;
        this.angle += this.angularSpeed;
        this.wobble += this.wobbleSpeed;
        
        // Add slight wind effect
        this.speedX += (Math.random() - 0.5) * 0.05;
        this.speedX *= 0.99; // Damping

        // Rain effect on petals
        if (config.rainEnabled) {
            this.speedY += 0.01 * config.intensity;
        }

        if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
            this.reset();
            this.y = -10;
        }
    }
  
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Adjust blur based on depth
        ctx.filter = `blur(${this.layer * 0.5}px)`;

        // Create gradient for petal with depth-aware colors
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        const baseColor = config.petalColor;
        const depthDarkening = Math.pow(0.9, this.layer); // Darken further layers slightly
        
        gradient.addColorStop(0, `${baseColor}${Math.floor(this.opacity * 255 * depthDarkening).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${baseColor}${Math.floor(this.opacity * 170 * depthDarkening).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${baseColor}00`);

        // Draw petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Draw a more natural petal shape
        for (let i = 0; i < Math.PI * 2; i += 0.1) {
            const distort = Math.sin(i * 2) * 0.3 + 1;
            const x = Math.cos(i) * this.size * 1.5 * distort;
            const y = Math.sin(i) * this.size * distort;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Add shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }
}

// Modify petal creation and management
function createPetals() {
    const petalsPerLayer = Math.floor(config.petalCount / config.layerCount);
    config.petalLayers = Array.from({ length: config.layerCount }, (_, layerIndex) => {
        return Array.from({ length: petalsPerLayer }, () => new Petal(layerIndex));
    });
}

// Add new class for celestial object
class Sun {
    constructor() {
        this.radius = 40;
    }

    update(time) {
        // Convert time to angle (6am = -π/2, noon = 0, 6pm = π/2)
        const sunAngle = ((time - 12) / 12) * Math.PI;
        
        // Sun is visible from 6am (6) to 6pm (18)
        this.visible = time >= 6 && time <= 18;
        
        if (this.visible) {
            // Create arc path from east to west
            this.x = canvas.width * 0.5 + Math.sin(sunAngle) * (canvas.width * 0.4);
            this.y = canvas.height * 0.7 - Math.cos(sunAngle) * (canvas.height * 0.4);
        }
    }

    draw(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );

        // Time-based sun colors
        const timeOfDay = (config.time - 6) / 12; // 0 to 1 during daylight
        const warmth = Math.sin(timeOfDay * Math.PI);
        gradient.addColorStop(0, `rgba(255, ${200 + warmth * 55}, ${150 + warmth * 50}, 1)`);
        gradient.addColorStop(0.2, `rgba(255, ${180 + warmth * 20}, 50, 0.6)`);
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

        // Draw glow and sun
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.radius * 2, this.y - this.radius * 2, 
                    this.radius * 4, this.radius * 4);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF7EA';
        ctx.fill();
        
        ctx.restore();
    }
}

class Moon {
    constructor() {
        this.radius = 35;
    }

    update(time) {
        // Convert time to angle (6pm = -π/2, midnight = 0, 6am = π/2)
        const moonAngle = (((time + 12) % 24 - 12) / 12) * Math.PI;
        
        // Moon is visible from 6pm (18) to 6am (6)
        this.visible = time <= 6 || time >= 18;
        
        if (this.visible) {
            // Create arc path from east to west
            this.x = canvas.width * 0.5 + Math.sin(moonAngle) * (canvas.width * 0.4);
            this.y = canvas.height * 0.7 - Math.cos(moonAngle) * (canvas.height * 0.4);
        }
    }

    draw(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );

        gradient.addColorStop(0, 'rgba(200, 200, 255, 0.8)');
        gradient.addColorStop(0.2, 'rgba(150, 150, 200, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');

        // Draw glow and moon
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.radius * 2, this.y - this.radius * 2, 
                    this.radius * 4, this.radius * 4);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#EEEEEE';
        ctx.fill();
        
        ctx.restore();
    }
}

// Add new lighting functions
function updateLighting() {
    const time = config.time;
    
    // Smoother brightness curve
    let brightness;
    if (time >= 6 && time <= 18) {
        // More gradual transition during day
        brightness = Math.sin(((time - 6) / 12) * Math.PI);
        // Boost midday brightness slightly
        if (time >= 10 && time <= 14) {
            brightness *= 1.1;
        }
    } else {
        // Smoother night transitions
        if (time < 6) {
            brightness = Math.max(0, (time / 6) * 0.1);
        } else {
            brightness = Math.max(0, ((24 - time) / 6) * 0.1);
        }
    }

    // Time-based color mixing
    let r, g, b;
    
    // Base sky colors for different times
    const dawn = { r: 235, g: 180, b: 170 };    // Soft pink/orange
    const day = { r: 135, g: 206, b: 235 };     // Sky blue
    const afternoon = { r: 255, g: 190, b: 150 }; // Warm golden
    const sunset = { r: 255, g: 140, b: 100 };   // Orange/red
    const night = { r: 17, g: 17, b: 35 };      // Dark blue

    // Calculate color based on time with smooth transitions
    if (time >= 5 && time < 8) {
        // Dawn transition (5am-8am)
        const t = (time - 5) / 3;
        r = lerp(lerp(night.r, dawn.r, t), day.r, t);
        g = lerp(lerp(night.g, dawn.g, t), day.g, t);
        b = lerp(lerp(night.b, dawn.b, t), day.b, t);
    } else if (time >= 8 && time < 15) {
        // Day (8am-3pm)
        r = day.r;
        g = day.g;
        b = day.b;
    } else if (time >= 15 && time < 17) {
        // Afternoon transition (3pm-5pm)
        const t = (time - 15) / 2;
        r = lerp(day.r, afternoon.r, t);
        g = lerp(day.g, afternoon.g, t);
        b = lerp(day.b, afternoon.b, t);
    } else if (time >= 17 && time < 19) {
        // Sunset transition (5pm-7pm)
        const t = (time - 17) / 2;
        r = lerp(afternoon.r, sunset.r, t);
        g = lerp(afternoon.g, sunset.g, t);
        b = lerp(afternoon.b, sunset.b, t);
    } else if (time >= 19 && time < 20) {
        // Dusk transition (7pm-8pm)
        const t = (time - 19);
        r = lerp(sunset.r, night.r, t);
        g = lerp(sunset.g, night.g, t);
        b = lerp(sunset.b, night.b, t);
    } else {
        // Night
        r = night.r;
        g = night.g;
        b = night.b;
    }

    // Apply brightness and create final color
    r = Math.floor(lerp(night.r, r, brightness));
    g = Math.floor(lerp(night.g, g, brightness));
    b = Math.floor(lerp(night.b, b, brightness));

    config.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function lerp(start, end, amt) {
    return (1-amt) * start + amt * end;
}

// Create celestial object
const sun = new Sun();
const moon = new Moon();

class Star {
    constructor() {
        this.reset();
        this.opacity = 0;
    }

    reset() {
        this.x = random(0, canvas.width);
        this.y = random(0, canvas.height * 0.7); // Keep stars in upper portion
        this.size = random(0.5, 2);
        this.twinkleSpeed = random(0.02, 0.05);
        this.twinklePhase = random(0, Math.PI * 2);
    }

    update(time) {
        // Calculate base opacity based on time
        let targetOpacity = 0;
        
        if (time >= 18 || time <= 6) {
            // Full night opacity between 7pm and 5am
            targetOpacity = 1;
            if (time >= 18 && time <= 19) {
                // Fade in during dusk (6pm-7pm)
                targetOpacity = (time - 18);
            } else if (time >= 5 && time <= 6) {
                // Fade out during dawn (5am-6am)
                targetOpacity = 1 - (time - 5);
            }
        }

        // Smooth transition to target opacity
        this.opacity += (targetOpacity - this.opacity) * 0.1;

        // Add twinkling effect
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = 0.7 + 0.3 * Math.sin(this.twinklePhase);
        
        return this.opacity * twinkle;
    }

    draw(ctx, brightness) {
        if (brightness <= 0) return;
        
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize stars after canvas setup
function createStars(count = 200) {
    config.stars = Array.from({ length: count }, () => new Star());
}

// Add to animate function after background draw and before celestial objects
function drawStars() {
    config.stars.forEach(star => {
        const brightness = star.update(config.time);
        star.draw(ctx, brightness);
    });
}

class MilkyWay {
    constructor() {
        this.generateNoise();
        this.gradient = null;
        this.opacity = 0;
    }

    generateNoise() {
        // Create off-screen canvas for noise texture
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCanvas.width = 256;
        this.noiseCanvas.height = 256;
        const nctx = this.noiseCanvas.getContext('2d');
        
        // Generate noise pattern
        const imageData = nctx.createImageData(256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;     // R
            imageData.data[i + 1] = value; // G
            imageData.data[i + 2] = value; // B
            imageData.data[i + 3] = value * 0.5; // A
        }
        nctx.putImageData(imageData, 0, 0);
    }

    update(time) {
        // Calculate opacity based on time (similar to stars but more subtle)
        let targetOpacity = 0;
        
        if (time >= 18 || time <= 6) {
            targetOpacity = 0.3; // Maximum opacity for Milky Way
            if (time >= 18 && time <= 19) {
                targetOpacity *= (time - 18);
            } else if (time >= 5 && time <= 6) {
                targetOpacity *= (1 - (time - 5));
            }
        }

        this.opacity += (targetOpacity - this.opacity) * 0.05;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;

        ctx.save();
        
        // Create diagonal band across the sky
        const gradient = ctx.createLinearGradient(
            0, 0,
            canvas.width, canvas.height * 0.7
        );
        
        // Soft blue-purple colors for the Milky Way
        gradient.addColorStop(0, 'rgba(100, 120, 255, 0)');
        gradient.addColorStop(0.4, `rgba(130, 150, 255, ${this.opacity})`);
        gradient.addColorStop(0.6, `rgba(150, 170, 255, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(100, 120, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply noise texture
        ctx.globalAlpha = this.opacity * 0.5;
        ctx.globalCompositeOperation = 'screen';
        
        // Tile the noise texture
        const scale = 2;
        for (let x = 0; x < canvas.width; x += 256 * scale) {
            for (let y = 0; y < canvas.height * 0.7; y += 256 * scale) {
                ctx.drawImage(this.noiseCanvas, x, y, 256 * scale, 256 * scale);
            }
        }

        ctx.restore();
    }
}

// Create milkyWay instance after other initializations
const milkyWay = new MilkyWay();

// Add mist management
class MistParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(0, canvas.width);
        this.y = random(0, canvas.height * 0.7);
        this.size = random(50, 150);
        this.speed = random(0.1, 0.5);
        this.opacity = random(0.1, 0.3);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height * 0.7) {
            this.reset();
            this.y = -this.size;
        }
    }

    draw(ctx) {
        ctx.save();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );

        // Ensure opacity values are valid numbers
        const mistIntensity = config.mistIntensity || 0.5;  // Fallback value
        const baseOpacity = Math.min(1, Math.max(0, this.opacity * mistIntensity));
        
        // Time-based visibility
        const time = config.time;
        let timeOpacity = 1;
        
        if (time > 8 && time < 16) {
            timeOpacity = 0.3;  // Reduced visibility during day
        } else if (time >= 6 && time <= 8) {
            timeOpacity = 1 - ((time - 6) / 2) * 0.7;  // Dawn transition
        } else if (time >= 16 && time <= 18) {
            timeOpacity = 0.3 + ((time - 16) / 2) * 0.7;  // Dusk transition
        }

        const finalOpacity = Math.min(1, Math.max(0, baseOpacity * timeOpacity));

        gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${finalOpacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Add mist management
class MistSystem {
    constructor() {
        this.particles = Array.from({ length: 20 }, () => new MistParticle());
        this.fadeLevel = 1;
    }

    update() {
        // Update fade level
        if (config.mistEnabled) {
            this.fadeLevel = Math.min(1, this.fadeLevel + 0.02);  // Fade in
        } else {
            this.fadeLevel = Math.max(0, this.fadeLevel - 0.02);  // Fade out
        }

        // Only update particles if there's some visibility
        if (this.fadeLevel > 0) {
            this.particles.forEach(particle => particle.update());
        }
    }

    draw(ctx) {
        // Only draw if there's some visibility
        if (this.fadeLevel > 0) {
            ctx.save();
            ctx.globalAlpha = this.fadeLevel;  // Apply fade level
            this.particles.forEach(particle => particle.draw(ctx));
            ctx.restore();
        }
    }
}

// Create mist system instance
const mistSystem = new MistSystem();

// Main animation loop
function animate() {
    // Update time
    if (!config.cyclePaused) {
        config.time = (config.time + 0.001) % 24;
        document.getElementById('timeOfDay').value = config.time;
        updateTimeDisplay();
    }

    updateLighting();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw mist between background and other elements
    mistSystem.update();  // Always update to handle fade
    mistSystem.draw(ctx);
    
    // Draw Milky Way before stars
    milkyWay.update(config.time);
    milkyWay.draw(ctx);
    
    // Draw stars before celestial objects
    drawStars();
    
    // Draw celestial objects
    sun.update(config.time);
    moon.update(config.time);
    
    // Draw moon first (behind sun)
    moon.draw(ctx);
    sun.draw(ctx);

    // Update and draw rain particles
    if (config.rainEnabled) {
        config.particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
    }

    // Draw petals from back to front
    config.petalLayers.forEach(layer => {
        layer.forEach(petal => {
            petal.update();
            petal.draw(ctx);
        });
    });
    
    requestAnimationFrame(animate);
}

// Initialize everything
function init() {
    setupControls();
    createStars();
    createPetals();  // Create initial petal layers
}

init();
animate();