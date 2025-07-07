// Shopping Cart Manager for Free Fire Elite Gaming Store
class CartManager {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.total = 0;
        
        this.loadCart();
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close cart when clicking overlay
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    // Account data (in real app this would come from API)
    getAccountData(accountId) {
        const accounts = {
            1: {
                id: 1,
                title: 'Elite Grandmaster Account',
                level: 80,
                price: 299,
                originalPrice: 499,
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                category: 'legendary',
                features: ['Legendary Skins Collection', 'Grandmaster Rank', '50,000+ Diamonds', 'Exclusive Emotes']
            },
            2: {
                id: 2,
                title: 'Pro Diamond Account',
                level: 65,
                price: 199,
                originalPrice: 299,
                image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                category: 'epic',
                features: ['Epic Skins Bundle', 'Diamond Rank', '25,000+ Diamonds', 'Rare Characters']
            },
            3: {
                id: 3,
                title: 'Advanced Platinum Account',
                level: 45,
                price: 99,
                originalPrice: 149,
                image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                category: 'rare',
                features: ['Rare Skins Collection', 'Platinum Rank', '10,000+ Diamonds', 'Special Characters']
            },
            4: {
                id: 4,
                title: 'Master Elite Account',
                level: 72,
                price: 249,
                originalPrice: 399,
                image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                category: 'epic',
                features: ['Epic Weapon Skins', 'Master Rank', '35,000+ Diamonds', 'Legendary Vehicles']
            }
        };

        return accounts[accountId] || accounts[1];
    }

    addToCart(accountId, quantity = 1) {
        const account = this.getAccountData(accountId);
        if (!account) {
            this.showCartNotification('Account not found', 'error');
            return;
        }

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.id === accountId);
        
        if (existingItem) {
            this.showCartNotification('Account already in cart', 'info');
            return;
        }

        // Add new item to cart
        const cartItem = {
            id: account.id,
            title: account.title,
            level: account.level,
            price: account.price,
            originalPrice: account.originalPrice,
            image: account.image,
            category: account.category,
            quantity: quantity,
            addedAt: new Date().toISOString()
        };

        this.cart.push(cartItem);
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification(`${account.title} added to cart!`, 'success');
        this.animateCartIcon();

        // Auto-open cart for first item
        if (this.cart.length === 1) {
            setTimeout(() => this.openCart(), 500);
        }
    }

    removeFromCart(accountId) {
        const itemIndex = this.cart.findIndex(item => item.id === accountId);
        
        if (itemIndex > -1) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartDisplay();
            this.showCartNotification(`${removedItem.title} removed from cart`, 'info');
        }
    }

    updateQuantity(accountId, quantity) {
        const item = this.cart.find(item => item.id === accountId);
        
        if (item && quantity > 0) {
            item.quantity = Math.min(quantity, 1); // Max 1 per account
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification('Cart cleared', 'info');
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateSavings() {
        return this.cart.reduce((savings, item) => {
            const itemSavings = (item.originalPrice - item.price) * item.quantity;
            return savings + itemSavings;
        }, 0);
    }

    updateCartDisplay() {
        this.updateCartCounter();
        this.updateCartItems();
        this.updateCartTotal();
    }

    updateCartCounter() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((count, item) => count + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>Your cart is empty</h3>
                    <p>Add some premium accounts to get started!</p>
                    <button class="btn btn-primary" onclick="cartManager.closeCart(); document.getElementById('accounts').scrollIntoView();">
                        <i class="fas fa-plus"></i>
                        Browse Accounts
                    </button>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="cart-item-badge ${item.category}">${item.category.toUpperCase()}</div>
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-level">
                        <i class="fas fa-star"></i>
                        Level ${item.level}
                    </div>
                    <div class="cart-item-pricing">
                        <span class="cart-item-price">$${item.price}</span>
                        ${item.originalPrice > item.price ? `<span class="cart-item-original">$${item.originalPrice}</span>` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" onclick="cartManager.removeFromCart(${item.id})" title="Remove from cart">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add cart item styles if not exist
        if (!document.querySelector('#cart-styles')) {
            this.addCartStyles();
        }
    }

    updateCartTotal() {
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            const total = this.calculateTotal();
            cartTotal.textContent = total.toFixed(0);
            
            // Update total in footer as well
            const cartFooter = cartTotal.closest('.cart-footer');
            if (cartFooter && this.cart.length > 0) {
                const savings = this.calculateSavings();
                
                // Add savings display if there are savings
                if (savings > 0) {
                    let savingsElement = cartFooter.querySelector('.cart-savings');
                    if (!savingsElement) {
                        savingsElement = document.createElement('div');
                        savingsElement.className = 'cart-savings';
                        cartFooter.insertBefore(savingsElement, cartFooter.querySelector('.cart-total'));
                    }
                    savingsElement.innerHTML = `
                        <span class="savings-text">
                            <i class="fas fa-tag"></i>
                            You save: $${savings}
                        </span>
                    `;
                }
            }
        }
    }

    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            this.isOpen = true;
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Play sound effect
            if (window.gameStore) {
                window.gameStore.playSound('cart');
            }
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            this.isOpen = false;
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
            
            // Play sound effect
            if (window.gameStore) {
                window.gameStore.playSound('close');
            }
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showCartNotification('Your cart is empty', 'error');
            return;
        }

        // Simulate checkout process
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            checkoutBtn.disabled = true;

            setTimeout(() => {
                this.showCheckoutModal();
                checkoutBtn.innerHTML = originalText;
                checkoutBtn.disabled = false;
            }, 2000);
        }
    }

    showCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'modal checkout-modal open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-credit-card"></i> Secure Checkout</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="checkout-summary">
                        <h4>Order Summary</h4>
                        <div class="checkout-items">
                            ${this.cart.map(item => `
                                <div class="checkout-item">
                                    <span>${item.title}</span>
                                    <span>$${item.price}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="checkout-total">
                            <strong>Total: $${this.calculateTotal()}</strong>
                        </div>
                    </div>
                    <div class="checkout-form">
                        <div class="payment-methods">
                            <h4>Payment Method</h4>
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="card" checked>
                                    <span><i class="fas fa-credit-card"></i> Credit Card</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="paypal">
                                    <span><i class="fab fa-paypal"></i> PayPal</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="crypto">
                                    <span><i class="fab fa-bitcoin"></i> Cryptocurrency</span>
                                </label>
                            </div>
                        </div>
                        <div class="checkout-actions">
                            <button class="btn btn-primary" onclick="cartManager.processPayment()">
                                <i class="fas fa-lock"></i>
                                Complete Purchase
                            </button>
                            <p class="checkout-security">
                                <i class="fas fa-shield-alt"></i>
                                Secured by 256-bit SSL encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add checkout styles
        this.addCheckoutStyles();
    }

    processPayment() {
        const modal = document.querySelector('.checkout-modal');
        const btn = modal.querySelector('.btn-primary');
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        btn.disabled = true;

        setTimeout(() => {
            modal.remove();
            this.showSuccessModal();
            this.clearCart();
            this.closeCart();
            
            // Play success sound
            if (window.gameStore) {
                window.gameStore.playSound('success');
            }
        }, 3000);
    }

    showSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'modal success-modal open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-body">
                    <div class="success-content">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Payment Successful!</h3>
                        <p>Your premium accounts have been activated and details sent to your email.</p>
                        <div class="success-actions">
                            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                                <i class="fas fa-gamepad"></i>
                                Start Gaming
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }

    animateCartIcon() {
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
            cartContainer.classList.add('animate-bounce-in');
            setTimeout(() => {
                cartContainer.classList.remove('animate-bounce-in');
            }, 600);
        }
    }

    showCartNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.innerHTML = `
            <div class="cart-notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Position relative to cart
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
            const rect = cartContainer.getBoundingClientRect();
            notification.style.position = 'fixed';
            notification.style.top = (rect.bottom + 10) + 'px';
            notification.style.right = '20px';
            notification.style.zIndex = '10001';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }

    saveCart() {
        try {
            localStorage.setItem('gamestore_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
        }
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('gamestore_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.warn('Could not load cart from localStorage:', error);
            this.cart = [];
        }
    }

    addCartStyles() {
        const styles = document.createElement('style');
        styles.id = 'cart-styles';
        styles.textContent = `
            .cart-empty {
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-secondary);
            }
            .cart-empty-icon {
                font-size: 3rem;
                color: var(--text-muted);
                margin-bottom: 1rem;
            }
            .cart-item {
                display: flex;
                gap: 1rem;
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                transition: all 0.3s ease;
            }
            .cart-item:hover {
                background: rgba(0, 255, 224, 0.05);
            }
            .cart-item-image {
                position: relative;
                width: 80px;
                height: 80px;
                border-radius: 12px;
                overflow: hidden;
                flex-shrink: 0;
            }
            .cart-item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .cart-item-badge {
                position: absolute;
                top: 4px;
                left: 4px;
                font-size: 0.6rem;
                padding: 2px 6px;
                border-radius: 8px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .cart-item-badge.legendary { background: #FFD700; color: #000; }
            .cart-item-badge.epic { background: #8B5CF6; color: #fff; }
            .cart-item-badge.rare { background: #3B82F6; color: #fff; }
            .cart-item-details {
                flex: 1;
                min-width: 0;
            }
            .cart-item-title {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            .cart-item-level {
                display: flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.8rem;
                color: var(--accent-cyan);
                margin-bottom: 0.5rem;
            }
            .cart-item-pricing {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .cart-item-price {
                font-weight: bold;
                color: var(--accent-cyan);
            }
            .cart-item-original {
                font-size: 0.8rem;
                color: var(--text-muted);
                text-decoration: line-through;
            }
            .cart-item-actions {
                display: flex;
                align-items: center;
            }
            .cart-item-remove {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .cart-item-remove:hover {
                background: var(--accent-red);
                color: white;
                transform: scale(1.1);
            }
            .cart-savings {
                text-align: center;
                margin-bottom: 1rem;
                padding: 0.8rem;
                background: rgba(255, 107, 0, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(255, 107, 0, 0.3);
            }
            .savings-text {
                color: var(--accent-orange);
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .cart-notification {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1rem;
                min-width: 250px;
                box-shadow: var(--shadow-card);
                transform: translateY(-10px);
                opacity: 0;
                transition: all 0.3s ease;
            }
            .cart-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            .cart-notification-content {
                display: flex;
                align-items: center;
                gap: 0.8rem;
                color: var(--text-primary);
            }
            .cart-notification-success { border-left: 4px solid var(--accent-cyan); }
            .cart-notification-error { border-left: 4px solid var(--accent-red); }
            .cart-notification-info { border-left: 4px solid var(--accent-orange); }
        `;
        document.head.appendChild(styles);
    }

    addCheckoutStyles() {
        if (document.querySelector('#checkout-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'checkout-styles';
        styles.textContent = `
            .checkout-modal .modal-content {
                max-width: 600px;
                width: 90vw;
            }
            .checkout-summary {
                background: var(--card-bg);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                margin-bottom: 2rem;
                border: 1px solid var(--border-color);
            }
            .checkout-items {
                margin: 1rem 0;
            }
            .checkout-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            }
            .checkout-total {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 2px solid var(--border-color);
                font-size: 1.2rem;
                color: var(--accent-cyan);
            }
            .payment-methods h4 {
                margin-bottom: 1rem;
                color: var(--text-primary);
            }
            .payment-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .payment-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .payment-option:hover {
                border-color: var(--accent-cyan);
                background: rgba(0, 255, 224, 0.05);
            }
            .payment-option input[type="radio"] {
                accent-color: var(--accent-cyan);
            }
            .checkout-actions {
                text-align: center;
            }
            .checkout-security {
                margin-top: 1rem;
                font-size: 0.9rem;
                color: var(--text-muted);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .success-modal .modal-content {
                max-width: 400px;
                text-align: center;
            }
            .success-content {
                padding: 2rem;
            }
            .success-icon {
                font-size: 4rem;
                color: var(--accent-cyan);
                margin-bottom: 1.5rem;
                animation: bounceIn 0.8s ease-out;
            }
            .success-content h3 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            .success-content p {
                color: var(--text-secondary);
                margin-bottom: 2rem;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize cart manager
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for global access
window.CartManager = CartManager;
