// Particle System for Free Fire Elite Gaming Store
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.config = null;
        this.animationId = null;
        this.isRunning = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.connectionDistance = 120;
        this.maxParticles = 80;
        
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const response = await fetch('./assets/particles-config.json');
            this.config = await response.json();
        } catch (error) {
            console.warn('Could not load particles config, using defaults');
            this.config = this.getDefaultConfig();
        }
        
        if (this.config) {
            this.maxParticles = this.config.particles.number.value;
            this.connectionDistance = this.config.interactivity.distance;
        }
    }

    getDefaultConfig() {
        return {
            particles: {
                number: { value: 80 },
                color: { value: "#00FFE0" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    bounce: false
                }
            },
            interactivity: {
                distance: 120,
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            },
            retina_detect: true
        };
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.createParticles();
        this.start();
    }

    createCanvas() {
        // Remove existing canvas if any
        const existingCanvas = document.getElementById('particles-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particles-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.7';

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('click', (e) => this.handleClick(e));
        
        // Visibility change to pause/resume animation
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    handleClick(e) {
        if (this.config?.interactivity?.events?.onclick?.enable) {
            this.addParticle(e.clientX, e.clientY);
        }
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Adjust particle count based on screen size
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080;
        const ratio = Math.min(screenArea / baseArea, 1);
        this.maxParticles = Math.floor((this.config?.particles?.number?.value || 80) * ratio);
        
        // Remove excess particles
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(0, this.maxParticles);
        }
    }

    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(x = null, y = null) {
        const config = this.config?.particles || {};
        
        return {
            x: x !== null ? x : Math.random() * this.canvas.width,
            y: y !== null ? y : Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * (config.move?.speed || 2),
            vy: (Math.random() - 0.5) * (config.move?.speed || 2),
            size: config.size?.random ? 
                Math.random() * (config.size?.value || 3) + 1 : 
                (config.size?.value || 3),
            opacity: config.opacity?.random ? 
                Math.random() * (config.opacity?.value || 0.5) + 0.1 : 
                (config.opacity?.value || 0.5),
            color: this.parseColor(config.color?.value || '#00FFE0'),
            life: 100,
            maxLife: 100
        };
    }

    parseColor(color) {
        if (typeof color === 'string') {
            return color;
        } else if (Array.isArray(color)) {
            return color[Math.floor(Math.random() * color.length)];
        }
        return '#00FFE0';
    }

    addParticle(x, y) {
        if (this.particles.length < this.maxParticles + 10) {
            const particle = this.createParticle(x, y);
            particle.life = 50; // Temporary particle
            particle.maxLife = 50;
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            if (this.config?.interactivity?.events?.onhover?.enable) {
                const dx = this.mouseX - particle.x;
                const dy = this.mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const force = (this.connectionDistance - distance) / this.connectionDistance;
                    const angle = Math.atan2(dy, dx);
                    
                    // Repulse effect
                    particle.x -= Math.cos(angle) * force * 2;
                    particle.y -= Math.sin(angle) * force * 2;
                }
            }
            
            // Boundary checks with wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Update life for temporary particles
            if (particle.life < particle.maxLife) {
                particle.life--;
                if (particle.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
                particle.opacity = (particle.life / particle.maxLife) * 0.5;
            }
        }
        
        // Maintain particle count
        while (this.particles.length < this.maxParticles) {
            this.particles.push(this.createParticle());
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections first
        this.drawConnections();
        
        // Draw particles
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }

    drawConnections() {
        if (!this.config?.interactivity?.distance) return;
        
        this.ctx.strokeStyle = 'rgba(0, 255, 224, 0.2)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.globalAlpha = opacity * 0.3;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    animate() {
        if (!this.isRunning) return;
        
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.isRunning) {
            this.start();
        }
    }

    destroy() {
        this.pause();
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.remove();
        }
        this.particles = [];
    }

    // Gaming-specific effects
    createExplosion(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 5 + 2;
            const particle = this.createParticle(x, y);
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = ['#FF6B00', '#FF3333', '#00FFE0'][Math.floor(Math.random() * 3)];
            particle.life = 30;
            particle.maxLife = 30;
            particle.size = Math.random() * 4 + 2;
            
            this.particles.push(particle);
        }
    }

    createTrail(startX, startY, endX, endY, count = 10) {
        for (let i = 0; i < count; i++) {
            const progress = i / count;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            const particle = this.createParticle(x, y);
            particle.life = 20 - i;
            particle.maxLife = 20;
            particle.color = '#00FFE0';
            particle.size = 2;
            
            this.particles.push(particle);
        }
    }
}

// Initialize particles.js compatibility layer
window.particlesJS = function(elementId, config) {
    if (window.particleSystem) {
        window.particleSystem.destroy();
    }
    
    window.particleSystem = new ParticleSystem();
    
    if (config) {
        window.particleSystem.config = config;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.particleSystem.init();
        });
    } else {
        window.particleSystem.init();
    }
};

// Auto-initialize with default config
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('particles-js')) {
        window.particlesJS('particles-js');
    }
});

// Export for use
window.ParticleSystem = ParticleSystem;
