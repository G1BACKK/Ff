// Main JavaScript functionality for Free Fire Elite Gaming Store
class GameStore {
    constructor() {
        this.isLoading = true;
        this.currentTestimonial = 0;
        this.testimonials = document.querySelectorAll('.testimonial-card');
        this.chatOpen = false;
        this.themeMode = 'dark';
        this.soundEnabled = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.startLoadingSequence();
        this.initializeAnimations();
        this.setupIntersectionObserver();
        this.initializeCounters();
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('load', () => this.handleWindowLoad());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // Navigation events
        document.addEventListener('click', (e) => this.handleNavClick(e));
        
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreAccounts());
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        }

        // Cart events
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
            cartContainer.addEventListener('click', () => window.cartManager?.toggleCart());
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    initializeComponents() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 50
            });
        }

        // Initialize testimonial slider
        this.initTestimonialSlider();
        
        // Setup scroll to top button
        this.setupScrollToTop();
        
        // Initialize chat widget
        this.initChatWidget();
        
        // Setup search functionality
        this.setupSearch();
    }

    startLoadingSequence() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingProgress = document.getElementById('loadingProgress');
        
        if (!loadingOverlay || !loadingProgress) return;

        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => this.hideLoading(), 500);
            }
            loadingProgress.style.width = `${progress}%`;
        }, 100);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                this.isLoading = false;
                this.playSound('startup');
            }, 500);
        }
    }

    handleWindowLoad() {
        // Add loaded class to body for CSS transitions
        document.body.classList.add('loaded');
        
        // Initialize particles after window load
        if (window.particleSystem) {
            window.particleSystem.init();
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update navigation style
        const nav = document.getElementById('navigation');
        if (nav) {
            if (scrollTop > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        // Update scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            if (scrollTop > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }

        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero && scrollTop < window.innerHeight) {
            const parallaxSpeed = 0.5;
            hero.style.transform = `translateY(${scrollTop * parallaxSpeed}px)`;
        }
    }

    handleResize() {
        // Recalculate layouts on resize
        if (window.particleSystem) {
            window.particleSystem.resize();
        }

        // Close mobile menu on desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    handleNavClick(e) {
        const link = e.target.closest('.nav-link');
        if (link && link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            this.scrollToSection(targetId);
            this.playSound('click');
        }
    }

    handleKeyDown(e) {
        // ESC key handling
        if (e.key === 'Escape') {
            this.closeAllModals();
            if (window.cartManager) {
                window.cartManager.closeCart();
            }
            this.closeChatWidget();
        }

        // Arrow keys for testimonial navigation
        if (e.key === 'ArrowLeft') {
            this.changeTestimonial(-1);
        } else if (e.key === 'ArrowRight') {
            this.changeTestimonial(1);
        }
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        
        if (navMenu && mobileToggle) {
            navMenu.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
            this.playSound('click');
        }
    }

    closeMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        
        if (navMenu && mobileToggle) {
            navMenu.classList.remove('mobile-open');
            mobileToggle.classList.remove('active');
        }
    }

    toggleTheme() {
        this.themeMode = this.themeMode === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.themeMode);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.themeMode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.playSound('switch');
        localStorage.setItem('theme', this.themeMode);
    }

    scrollToSection(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const headerHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Testimonial Slider
    initTestimonialSlider() {
        if (this.testimonials.length === 0) return;

        // Auto-advance testimonials
        setInterval(() => {
            this.changeTestimonial(1);
        }, 5000);
    }

    changeTestimonial(direction) {
        if (this.testimonials.length === 0) return;

        this.testimonials[this.currentTestimonial].classList.remove('active');
        
        this.currentTestimonial += direction;
        
        if (this.currentTestimonial >= this.testimonials.length) {
            this.currentTestimonial = 0;
        } else if (this.currentTestimonial < 0) {
            this.currentTestimonial = this.testimonials.length - 1;
        }
        
        this.testimonials[this.currentTestimonial].classList.add('active');
        
        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentTestimonial);
        });

        this.playSound('slide');
    }

    currentTestimonial(index) {
        if (this.testimonials.length === 0) return;

        this.testimonials[this.currentTestimonial].classList.remove('active');
        this.currentTestimonial = index - 1;
        this.testimonials[this.currentTestimonial].classList.add('active');
        
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentTestimonial);
        });

        this.playSound('click');
    }

    // Filter and Sort Functionality
    handleFilterClick(e) {
        const clickedTab = e.target;
        const filter = clickedTab.getAttribute('data-filter');
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        clickedTab.classList.add('active');
        
        // Filter accounts
        this.filterAccounts(filter);
        this.playSound('filter');
    }

    handleSortChange(e) {
        const sortBy = e.target.value;
        this.sortAccounts(sortBy);
        this.playSound('click');
    }

    filterAccounts(filter) {
        const accountCards = document.querySelectorAll('.account-card');
        
        accountCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('animate-zoom-in');
            
            setTimeout(() => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.classList.add('animate-zoom-in');
                }
            }, 100);
        });
    }

    sortAccounts(sortBy) {
        const accountsGrid = document.getElementById('accountsGrid');
        const accountCards = Array.from(document.querySelectorAll('.account-card'));
        
        accountCards.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
                case 'price-high':
                    return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
                case 'level-high':
                    return parseInt(b.getAttribute('data-level')) - parseInt(a.getAttribute('data-level'));
                case 'popularity':
                default:
                    return Math.random() - 0.5; // Random for demo
            }
        });
        
        // Re-append sorted cards
        accountCards.forEach(card => {
            accountsGrid.appendChild(card);
        });
    }

    // Newsletter
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (this.validateEmail(email)) {
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            e.target.reset();
            this.playSound('success');
        } else {
            this.showNotification('Please enter a valid email address.', 'error');
            this.playSound('error');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Load More Accounts
    loadMoreAccounts() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const accountsGrid = document.getElementById('accountsGrid');
        
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            loadMoreBtn.disabled = true;
            
            // Simulate loading delay
            setTimeout(() => {
                this.showNotification('All available accounts are already displayed!', 'info');
                loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> All Loaded';
                this.playSound('info');
            }, 1500);
        }
    }

    // Chat Widget
    initChatWidget() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatNotification = document.getElementById('chatNotification');
        
        if (chatWindow) {
            this.chatOpen = !this.chatOpen;
            chatWindow.classList.toggle('open', this.chatOpen);
            
            if (this.chatOpen && chatNotification) {
                chatNotification.style.display = 'none';
            }
            
            this.playSound('click');
        }
    }

    closeChatWidget() {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            this.chatOpen = false;
            chatWindow.classList.remove('open');
        }
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatInput || !chatMessages || !chatInput.value.trim()) return;
        
        const message = chatInput.value.trim();
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.innerHTML = `<span>${message}</span>`;
        chatMessages.appendChild(userMessage);
        
        chatInput.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-message bot';
            botMessage.innerHTML = `<span>Thank you for your message! Our support team will assist you shortly.</span>`;
            chatMessages.appendChild(botMessage);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.playSound('message');
    }

    sendMessage() {
        this.sendChatMessage();
    }

    // Scroll to Top
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                this.playSound('whoosh');
            });
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.playSound('whoosh');
    }

    // Search Setup
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && window.searchManager) {
            searchInput.addEventListener('input', (e) => {
                window.searchManager.handleSearch(e.target.value);
            });
        }
    }

    // Modal Functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            this.playSound('modal');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
            this.playSound('close');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
    }

    // Quick View
    openQuickView(accountId) {
        // Mock account data - in real app this would come from API
        const accountData = {
            1: {
                title: 'Elite Grandmaster Account',
                level: 80,
                price: 299,
                features: ['Legendary Skins', 'Grandmaster Rank', '50,000+ Diamonds', 'Exclusive Emotes'],
                description: 'Premium account with rare collections and high-level progression.'
            },
            2: {
                title: 'Pro Diamond Account',
                level: 65,
                price: 199,
                features: ['Epic Skins Bundle', 'Diamond Rank', '25,000+ Diamonds', 'Rare Characters'],
                description: 'Professional gaming account with valuable items and progression.'
            }
        };

        const data = accountData[accountId] || accountData[1];
        
        const quickViewContent = document.getElementById('quickViewContent');
        if (quickViewContent) {
            quickViewContent.innerHTML = `
                <div class="quick-view-details">
                    <h3>${data.title}</h3>
                    <div class="quick-view-level">Level ${data.level}</div>
                    <p>${data.description}</p>
                    <div class="quick-view-features">
                        <h4>Features:</h4>
                        <ul>
                            ${data.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="quick-view-price">$${data.price}</div>
                    <div class="quick-view-actions">
                        <button class="btn btn-primary" onclick="gameStore.addToCart(${accountId})">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="gameStore.quickBuy(${accountId})">
                            <i class="fas fa-bolt"></i> Buy Now
                        </button>
                    </div>
                </div>
            `;
        }
        
        this.openModal('quickViewModal');
    }

    // Cart Functions (delegated to cart manager)
    addToCart(accountId) {
        if (window.cartManager) {
            window.cartManager.addToCart(accountId);
        }
        this.playSound('add');
    }

    quickBuy(accountId) {
        if (window.cartManager) {
            window.cartManager.addToCart(accountId);
            window.cartManager.toggleCart();
        }
        this.playSound('purchase');
    }

    checkout() {
        if (window.cartManager) {
            window.cartManager.checkout();
        }
    }

    // Intersection Observer for Animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.account-card, .feature-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Counter Animation
    initializeCounters() {
        const counters = document.querySelectorAll('.counter');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        let current = 0;
        const increment = target / 100;
        const duration = 2000; // 2 seconds
        const stepTime = duration / 100;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, stepTime);
    }

    // Sound Effects
    playSound(type) {
        if (!this.soundEnabled) return;

        try {
            let audio;
            switch (type) {
                case 'hover':
                    audio = document.getElementById('hoverSound');
                    break;
                case 'click':
                case 'filter':
                case 'switch':
                case 'modal':
                case 'close':
                    audio = document.getElementById('clickSound');
                    break;
                default:
                    audio = document.getElementById('clickSound');
            }
            
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {
                    // Ignore play errors (user interaction required)
                });
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles if not exist
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    padding: 1rem;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    box-shadow: var(--shadow-card);
                }
                .notification-success { border-left: 4px solid var(--accent-cyan); }
                .notification-error { border-left: 4px solid var(--accent-red); }
                .notification-info { border-left: 4px solid var(--accent-orange); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: var(--text-primary);
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }

    // Initialize animations
    initializeAnimations() {
        // Add hover sound effects to interactive elements
        document.querySelectorAll('.btn, .nav-link, .account-card, .feature-card').forEach(el => {
            el.addEventListener('mouseenter', () => this.playSound('hover'));
        });

        // Matrix rain effect for background
        this.createMatrixRain();
    }

    createMatrixRain() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const container = document.querySelector('.hero-background');
        
        if (!container) return;

        setInterval(() => {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = chars[Math.floor(Math.random() * chars.length)];
            char.style.left = Math.random() * 100 + '%';
            char.style.animationDuration = (Math.random() * 3 + 2) + 's';
            char.style.fontSize = (Math.random() * 10 + 10) + 'px';
            char.style.opacity = Math.random() * 0.5 + 0.1;
            
            container.appendChild(char);
            
            setTimeout(() => {
                if (char.parentElement) {
                    char.remove();
                }
            }, 5000);
        }, 200);
    }
}

// Global helper functions
window.scrollToSection = function(selector) {
    if (window.gameStore) {
        window.gameStore.scrollToSection(selector);
    }
};

window.openModal = function(modalId) {
    if (window.gameStore) {
        window.gameStore.openModal(modalId);
    }
};

window.closeModal = function(modalId) {
    if (window.gameStore) {
        window.gameStore.closeModal(modalId);
    }
};

window.openQuickView = function(accountId) {
    if (window.gameStore) {
        window.gameStore.openQuickView(accountId);
    }
};

window.addToCart = function(accountId) {
    if (window.gameStore) {
        window.gameStore.addToCart(accountId);
    }
};

window.quickBuy = function(accountId) {
    if (window.gameStore) {
        window.gameStore.quickBuy(accountId);
    }
};

window.toggleCart = function() {
    if (window.cartManager) {
        window.cartManager.toggleCart();
    }
};

window.checkout = function() {
    if (window.gameStore) {
        window.gameStore.checkout();
    }
};

window.changeTestimonial = function(direction) {
    if (window.gameStore) {
        window.gameStore.changeTestimonial(direction);
    }
};

window.currentTestimonial = function(index) {
    if (window.gameStore) {
        window.gameStore.currentTestimonial(index);
    }
};

window.toggleChat = function() {
    if (window.gameStore) {
        window.gameStore.toggleChat();
    }
};

window.sendMessage = function() {
    if (window.gameStore) {
        window.gameStore.sendMessage();
    }
};

window.scrollToTop = function() {
    if (window.gameStore) {
        window.gameStore.scrollToTop();
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.gameStore = new GameStore();
});

// Load theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
});
