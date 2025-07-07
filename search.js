// Search and Filter Manager for Free Fire Elite Gaming Store
class SearchManager {
    constructor() {
        this.searchInput = null;
        this.accountCards = [];
        this.originalOrder = [];
        this.searchTimeout = null;
        this.searchDelay = 300; // ms
        this.minSearchLength = 2;
        this.isSearching = false;
        
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('searchInput');
        this.accountCards = Array.from(document.querySelectorAll('.account-card'));
        this.originalOrder = [...this.accountCards];
        
        this.setupEventListeners();
        this.setupSearchSuggestions();
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });

            this.searchInput.addEventListener('blur', () => {
                // Delay hiding suggestions to allow clicks
                setTimeout(() => this.hideSearchSuggestions(), 200);
            });

            this.searchInput.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
        }

        // Setup clear search button
        this.createClearButton();
    }

    handleSearchInput(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, this.searchDelay);

        // Update suggestions
        this.updateSearchSuggestions(query);
    }

    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.performSearch(this.searchInput.value);
            this.hideSearchSuggestions();
        } else if (e.key === 'Escape') {
            this.clearSearch();
            this.hideSearchSuggestions();
        }
    }

    performSearch(query) {
        if (this.isSearching) return;

        this.isSearching = true;
        const trimmedQuery = query.trim().toLowerCase();

        // Show loading state
        this.showSearchLoading();

        // Simulate search delay for better UX
        setTimeout(() => {
            if (trimmedQuery.length < this.minSearchLength) {
                this.resetSearch();
            } else {
                this.executeSearch(trimmedQuery);
            }
            
            this.hideSearchLoading();
            this.isSearching = false;
        }, 200);
    }

    executeSearch(query) {
        const results = this.searchAccounts(query);
        this.displaySearchResults(results, query);
        this.updateSearchSuggestions(query);
        
        // Play search sound
        if (window.gameStore) {
            window.gameStore.playSound('search');
        }
    }

    searchAccounts(query) {
        const searchTerms = query.split(' ').filter(term => term.length > 0);
        
        return this.accountCards.map(card => {
            const score = this.calculateSearchScore(card, searchTerms);
            return { card, score };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    calculateSearchScore(card, searchTerms) {
        let score = 0;
        
        // Extract searchable content
        const title = card.querySelector('.account-title')?.textContent.toLowerCase() || '';
        const level = card.querySelector('.account-level')?.textContent.toLowerCase() || '';
        const features = Array.from(card.querySelectorAll('.feature-item'))
            .map(item => item.textContent.toLowerCase()).join(' ');
        const category = card.getAttribute('data-category')?.toLowerCase() || '';
        const price = card.getAttribute('data-price') || '';
        
        const searchableContent = `${title} ${level} ${features} ${category} ${price}`;
        
        searchTerms.forEach(term => {
            // Exact matches get higher scores
            if (title.includes(term)) score += 10;
            if (category.includes(term)) score += 8;
            if (level.includes(term)) score += 6;
            if (features.includes(term)) score += 4;
            if (searchableContent.includes(term)) score += 2;
            
            // Partial matches
            if (this.fuzzyMatch(title, term)) score += 3;
            if (this.fuzzyMatch(category, term)) score += 2;
        });
        
        return score;
    }

    fuzzyMatch(text, term) {
        // Simple fuzzy matching - checks if all characters of term exist in text in order
        let termIndex = 0;
        for (let i = 0; i < text.length && termIndex < term.length; i++) {
            if (text[i] === term[termIndex]) {
                termIndex++;
            }
        }
        return termIndex === term.length;
    }

    displaySearchResults(results, query) {
        const accountsGrid = document.getElementById('accountsGrid');
        if (!accountsGrid) return;

        // Hide all cards first
        this.accountCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('search-highlight');
        });

        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }

        // Show and highlight matched cards
        results.forEach(({ card }, index) => {
            card.style.display = 'block';
            card.classList.add('search-highlight');
            
            // Stagger animations
            setTimeout(() => {
                card.classList.add('animate-fade-in-up');
            }, index * 100);
        });

        this.hideNoResults();
        this.showSearchStats(results.length, query);
    }

    showNoResults(query) {
        let noResultsElement = document.getElementById('search-no-results');
        
        if (!noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.id = 'search-no-results';
            noResultsElement.className = 'search-no-results';
            
            const accountsGrid = document.getElementById('accountsGrid');
            if (accountsGrid) {
                accountsGrid.parentNode.insertBefore(noResultsElement, accountsGrid.nextSibling);
            }
        }

        noResultsElement.innerHTML = `
            <div class="no-results-content">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No accounts found</h3>
                <p>No accounts match your search for "<strong>${this.escapeHtml(query)}</strong>"</p>
                <div class="no-results-suggestions">
                    <h4>Try searching for:</h4>
                    <div class="suggestion-tags">
                        <span class="suggestion-tag" onclick="searchManager.searchSuggestion('legendary')">Legendary</span>
                        <span class="suggestion-tag" onclick="searchManager.searchSuggestion('epic')">Epic</span>
                        <span class="suggestion-tag" onclick="searchManager.searchSuggestion('diamonds')">Diamonds</span>
                        <span class="suggestion-tag" onclick="searchManager.searchSuggestion('grandmaster')">Grandmaster</span>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="searchManager.clearSearch()">
                    <i class="fas fa-times"></i>
                    Clear Search
                </button>
            </div>
        `;

        noResultsElement.style.display = 'block';
        this.addNoResultsStyles();
    }

    hideNoResults() {
        const noResultsElement = document.getElementById('search-no-results');
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }

    showSearchStats(count, query) {
        let statsElement = document.getElementById('search-stats');
        
        if (!statsElement) {
            statsElement = document.createElement('div');
            statsElement.id = 'search-stats';
            statsElement.className = 'search-stats';
            
            const sectionHeader = document.querySelector('.section-header');
            if (sectionHeader) {
                sectionHeader.appendChild(statsElement);
            }
        }

        statsElement.innerHTML = `
            <div class="search-stats-content">
                <i class="fas fa-search"></i>
                Found <strong>${count}</strong> account${count !== 1 ? 's' : ''} for "<strong>${this.escapeHtml(query)}</strong>"
                <button class="clear-search-btn" onclick="searchManager.clearSearch()" title="Clear search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        statsElement.style.display = 'block';
        this.addSearchStatsStyles();
    }

    hideSearchStats() {
        const statsElement = document.getElementById('search-stats');
        if (statsElement) {
            statsElement.style.display = 'none';
        }
    }

    resetSearch() {
        // Show all cards in original order
        this.accountCards.forEach((card, index) => {
            card.style.display = 'block';
            card.classList.remove('search-highlight', 'animate-fade-in-up');
            
            // Re-append in original order
            const accountsGrid = document.getElementById('accountsGrid');
            if (accountsGrid && this.originalOrder[index]) {
                accountsGrid.appendChild(this.originalOrder[index]);
            }
        });

        this.hideNoResults();
        this.hideSearchStats();
        this.hideSearchSuggestions();
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchInput.focus();
        }
        
        this.resetSearch();
        this.hideClearButton();
        
        // Play clear sound
        if (window.gameStore) {
            window.gameStore.playSound('clear');
        }
    }

    // Advanced search method for external use
    handleSearch(query) {
        this.performSearch(query);
        this.updateClearButton(query);
    }

    // Search suggestions
    setupSearchSuggestions() {
        this.suggestions = [
            { text: 'Legendary accounts', category: 'legendary', icon: 'crown' },
            { text: 'Epic skins', category: 'epic', icon: 'fire' },
            { text: 'Diamond rank', terms: ['diamond', 'rank'], icon: 'gem' },
            { text: 'Grandmaster level', terms: ['grandmaster', 'level'], icon: 'trophy' },
            { text: 'High level accounts', terms: ['level', 'high'], icon: 'star' },
            { text: 'Premium skins', terms: ['premium', 'skins'], icon: 'magic' },
            { text: 'Rare characters', terms: ['rare', 'characters'], icon: 'user-ninja' },
            { text: 'Exclusive emotes', terms: ['exclusive', 'emotes'], icon: 'smile' }
        ];

        this.createSuggestionsContainer();
    }

    createSuggestionsContainer() {
        if (document.getElementById('search-suggestions')) return;

        const container = document.createElement('div');
        container.id = 'search-suggestions';
        container.className = 'search-suggestions';
        
        if (this.searchInput) {
            this.searchInput.parentNode.appendChild(container);
        }

        this.addSuggestionsStyles();
    }

    updateSearchSuggestions(query) {
        const container = document.getElementById('search-suggestions');
        if (!container || !query || query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }

        const filteredSuggestions = this.suggestions.filter(suggestion => {
            const searchText = suggestion.text.toLowerCase();
            const searchTerms = suggestion.terms || [suggestion.text.toLowerCase()];
            
            return searchText.includes(query.toLowerCase()) ||
                   searchTerms.some(term => term.includes(query.toLowerCase()));
        }).slice(0, 5);

        if (filteredSuggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        container.innerHTML = filteredSuggestions.map(suggestion => `
            <div class="suggestion-item" onclick="searchManager.searchSuggestion('${suggestion.category || suggestion.text}')">
                <i class="fas fa-${suggestion.icon}"></i>
                <span>${suggestion.text}</span>
            </div>
        `).join('');

        this.showSearchSuggestions();
    }

    searchSuggestion(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
            this.performSearch(term);
            this.hideSearchSuggestions();
            this.updateClearButton(term);
        }
    }

    showSearchSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.add('show');
        }
    }

    hideSearchSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.remove('show');
        }
    }

    // Clear button
    createClearButton() {
        if (!this.searchInput || document.getElementById('search-clear-btn')) return;

        const clearBtn = document.createElement('button');
        clearBtn.id = 'search-clear-btn';
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.onclick = () => this.clearSearch();
        clearBtn.title = 'Clear search';

        this.searchInput.parentNode.appendChild(clearBtn);
        this.addClearButtonStyles();
    }

    updateClearButton(query) {
        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) {
            clearBtn.style.display = query.trim() ? 'block' : 'none';
        }
    }

    hideClearButton() {
        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
    }

    showSearchLoading() {
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.className = 'fas fa-spinner fa-spin search-icon';
        }
    }

    hideSearchLoading() {
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.className = 'fas fa-search search-icon';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add required styles
    addNoResultsStyles() {
        if (document.getElementById('no-results-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'no-results-styles';
        styles.textContent = `
            .search-no-results {
                display: none;
                text-align: center;
                padding: 4rem 2rem;
                background: var(--card-bg);
                border-radius: var(--border-radius-large);
                border: 1px solid var(--border-color);
                margin: 2rem 0;
            }
            .no-results-content {
                max-width: 400px;
                margin: 0 auto;
            }
            .no-results-icon {
                font-size: 3rem;
                color: var(--text-muted);
                margin-bottom: 1.5rem;
            }
            .no-results-content h3 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            .no-results-content p {
                color: var(--text-secondary);
                margin-bottom: 2rem;
            }
            .no-results-suggestions h4 {
                color: var(--text-primary);
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            .suggestion-tags {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 2rem;
            }
            .suggestion-tag {
                background: rgba(0, 255, 224, 0.1);
                color: var(--accent-cyan);
                padding: 0.4rem 0.8rem;
                border-radius: 15px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 1px solid rgba(0, 255, 224, 0.3);
            }
            .suggestion-tag:hover {
                background: var(--accent-cyan);
                color: var(--bg-primary);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(styles);
    }

    addSearchStatsStyles() {
        if (document.getElementById('search-stats-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'search-stats-styles';
        styles.textContent = `
            .search-stats {
                display: none;
                margin: 1rem 0;
                padding: 1rem;
                background: rgba(0, 255, 224, 0.1);
                border: 1px solid rgba(0, 255, 224, 0.3);
                border-radius: var(--border-radius);
                animation: fadeInDown 0.3s ease-out;
            }
            .search-stats-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                color: var(--accent-cyan);
                font-weight: 500;
            }
            .clear-search-btn {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.2rem 0.4rem;
                border-radius: 4px;
                margin-left: 1rem;
                transition: all 0.3s ease;
            }
            .clear-search-btn:hover {
                background: var(--accent-red);
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }

    addSuggestionsStyles() {
        if (document.getElementById('suggestions-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'suggestions-styles';
        styles.textContent = `
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-top: none;
                border-radius: 0 0 12px 12px;
                box-shadow: var(--shadow-card);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                opacity: 0;
                transform: translateY(-10px);
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .search-suggestions.show {
                opacity: 1;
                transform: translateY(0);
                visibility: visible;
            }
            .suggestion-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border-bottom: 1px solid var(--border-color);
            }
            .suggestion-item:last-child {
                border-bottom: none;
            }
            .suggestion-item:hover {
                background: rgba(0, 255, 224, 0.1);
                color: var(--accent-cyan);
            }
            .suggestion-item i {
                color: var(--accent-cyan);
                width: 16px;
                text-align: center;
            }
        `;
        document.head.appendChild(styles);
    }

    addClearButtonStyles() {
        if (document.getElementById('clear-btn-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'clear-btn-styles';
        styles.textContent = `
            .search-clear-btn {
                position: absolute;
                right: 0.8rem;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.4rem;
                border-radius: 50%;
                display: none;
                transition: all 0.3s ease;
                z-index: 10;
            }
            .search-clear-btn:hover {
                background: var(--accent-red);
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }
}

// Initialize search manager
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});

// Export for global access
window.SearchManager = SearchManager;
