/**
 * Main.js - Main application logic for the homepage
 * Handles UI interactions, game rendering and event handling
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const gamesGrid = document.getElementById('games-grid');
    const searchInput = document.querySelector('input[placeholder="Search games..."]');
    const categoryLinks = document.querySelectorAll('.category-link');
    const languageSelect = document.querySelector('select');
    const gameCardTemplate = document.getElementById('game-card-template');
    const sortOptions = document.getElementById('sort-options');
    
    // Sidebar elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Load games data
    await GameData.load();
    
    // Initialize the page with featured games
    renderGames(GameData.getFeatured());
    
    // Set the active category
    setActiveCategory('all');
    
    // Event Listeners
    
    // Sidebar toggle (mobile)
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Prevent scrolling when sidebar is open
    });
    
    // Close sidebar
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    });
    
    // Close sidebar when a category is selected (on mobile)
    categoryLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // Only on mobile
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    });
    
    // Category selection
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            
            // Update active category
            setActiveCategory(category);
            
            // Update games grid based on category and current sort option
            let games = GameData.getByCategory(category);
            const currentSort = GameData.getCurrentSortOption();
            
            // Apply sorting if not 'all' category
            if (category !== 'all') {
                games = applySorting(games, currentSort);
            } else {
                games = GameData.getFeatured();
            }
            
            renderGames(games);
            
            // Update page title
            updatePageTitle(category);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value;
        let games = GameData.search(searchTerm);
        
        // Apply current sort to search results
        games = applySorting(games, GameData.getCurrentSortOption());
        
        renderGames(games);
    }, 300));
    
    // Language selection
    languageSelect.addEventListener('change', () => {
        const language = languageSelect.value;
        changeLanguage(language);
    });
    
    // Sort options
    sortOptions.addEventListener('change', () => {
        const sortBy = sortOptions.value;
        GameData.setCurrentSortOption(sortBy);
        
        // Get current category games and apply sort
        const currentCategory = GameData.getCurrentCategory();
        let games;
        
        if (currentCategory === 'all') {
            games = GameData.getFeatured();
        } else {
            games = GameData.getByCategory(currentCategory);
            games = applySorting(games, sortBy);
        }
        
        renderGames(games);
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 768) {
            // On desktop/tablet, ensure sidebar is visible
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        } else {
            // On mobile, ensure sidebar is hidden
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        }
    }, 200));
    
    // Functions
    
    // Apply sorting to a specific array of games
    function applySorting(games, sortOption) {
        const gamesCopy = [...games];
        
        switch (sortOption) {
            case 'rating':
                return gamesCopy.sort((a, b) => b.rating - a.rating);
            case 'title':
                return gamesCopy.sort((a, b) => a.title.localeCompare(b.title));
            case 'newest':
                // Placeholder for newest sorting
                return gamesCopy;
            default:
                return gamesCopy;
        }
    }
    
    // Render games to the grid
    function renderGames(games) {
        // Clear the grid
        gamesGrid.innerHTML = '';
        
        if (games.length === 0) {
            gamesGrid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-xl text-gray-500">No games found. Try a different search or category.</p>
                </div>
            `;
            return;
        }
        
        // Add each game card to the grid
        games.forEach(game => {
            const gameCard = createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
        
        // Add enhanced animation to cards
        animateCards();
    }
    
    // Create a game card from template
    function createGameCard(game) {
        const template = gameCardTemplate.content.cloneNode(true);
        const card = template.querySelector('.game-card');
        
        // Set game ID
        card.setAttribute('data-id', game.id);
        
        // Set image
        const img = card.querySelector('img');
        img.src = game.image;
        img.alt = game.title;
        
        // Set title
        const titleElements = card.querySelectorAll('h3');
        titleElements.forEach(el => el.textContent = game.title);
        
        // Set description
        const description = card.querySelector('.game-description');
        description.textContent = game.description;
        
        // Set tags
        const tagsContainer = card.querySelector('.flex.flex-wrap.gap-1');
        tagsContainer.innerHTML = '';
        
        // Only add the first 3 tags to save space
        game.tags.slice(0, 3).forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'game-tag text-xs bg-blue-600 px-2 py-1 rounded-full';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
        
        // Set "Play Now" link
        const playNowBtn = card.querySelector('.play-now-btn');
        playNowBtn.href = `play.html?id=${game.id}`;
        
        // Add enhanced hover effects to the card
        card.classList.add('transition-all', 'duration-300', 'hover:scale-105', 'hover:shadow-xl');
        
        // Add hover effect for the overlay
        const overlay = card.querySelector('.game-overlay');
        card.addEventListener('mouseenter', () => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('opacity-100');
        });
        
        card.addEventListener('mouseleave', () => {
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0');
        });
        
        // Add rating display if available
        if (game.rating) {
            const ratingElement = document.createElement('div');
            ratingElement.className = 'rating-badge';
            ratingElement.innerHTML = `<span>★</span> ${game.rating}`;
            card.querySelector('.relative').appendChild(ratingElement);
        }
        
        return card;
    }
    
    // Set active category
    function setActiveCategory(category) {
        // Remove active class from all links
        categoryLinks.forEach(link => {
            link.classList.remove('active', 'bg-blue-600', 'text-white');
            link.classList.add('hover:bg-blue-100');
        });
        
        // Add active class to selected link
        const activeLink = document.querySelector(`.category-link[data-category="${category}"]`);
        if (activeLink) {
            activeLink.classList.add('active', 'bg-blue-600', 'text-white');
            activeLink.classList.remove('hover:bg-blue-100');
        }
        
        // Update current category
        GameData.setCurrentCategory(category);
    }
    
    // Update page title based on category
    function updatePageTitle(category) {
        const titleElement = document.querySelector('h1');
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        
        if (category === 'all') {
            titleElement.textContent = 'Featured Games';
        } else {
            titleElement.textContent = `${capitalizedCategory} Games`;
        }
    }
    
    // Animate cards on render
    function animateCards() {
        const cards = document.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            // Add staggered animation with improved effects
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 60 * index);
        });
    }
    
    // Change language function (simplified for demo)
    function changeLanguage(language) {
        console.log(`Language changed to: ${language}`);
        // In a real application, this would load language-specific content
    }
    
    // Debounce function to limit how often a function is called
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
}); 