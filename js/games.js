/**
 * Games.js - Game data handling module
 * Responsible for loading and processing game data
 */

// Global games data store
let gamesData = [];
let currentCategory = 'all';
let currentSortOption = 'rating'; // Default sort by rating

// Function to load games data from JSON file
async function loadGamesData() {
    try {
        const response = await fetch('../data/games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        gamesData = await response.json();
        
        // Sort games by default sort option after loading
        sortGames(currentSortOption);
        
        return gamesData;
    } catch (error) {
        console.error('Error loading games data:', error);
        return [];
    }
}

// Function to get all games
function getAllGames() {
    return [...gamesData];
}

// Function to get games by category
function getGamesByCategory(category) {
    if (category === 'all') {
        return getAllGames();
    }
    return gamesData.filter(game => game.category === category);
}

// Function to get a game by ID
function getGameById(id) {
    return gamesData.find(game => game.id === id);
}

// Function to search games by term
function searchGames(term) {
    if (!term || term.trim() === '') {
        return getAllGames();
    }
    
    const searchTerm = term.toLowerCase().trim();
    return gamesData.filter(game => {
        // Search in title
        if (game.title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in description
        if (game.description.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in tags
        if (game.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
        }
        
        // Search in category
        if (game.category.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        return false;
    });
}

// Function to get related games (same category, excluding the current game)
function getRelatedGames(gameId, limit = 4) {
    const currentGame = getGameById(gameId);
    if (!currentGame) {
        return [];
    }
    
    const category = currentGame.category;
    return gamesData
        .filter(game => game.category === category && game.id !== gameId)
        .slice(0, limit);
}

// Function to filter games by tag
function getGamesByTag(tag) {
    return gamesData.filter(game => game.tags.includes(tag));
}

// Function to get random featured games
function getFeaturedGames(limit = 8) {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...gamesData];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Get top rated games from shuffled array
    return shuffled
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// Function to sort games by different criteria
function sortGames(sortBy = 'rating') {
    currentSortOption = sortBy;
    
    switch (sortBy) {
        case 'rating':
            gamesData.sort((a, b) => b.rating - a.rating);
            break;
        case 'title':
            gamesData.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'newest':
            // This is a placeholder - in a real app, we'd have a date field
            // For now, we'll just shuffle to simulate "newest"
            const shuffled = [...gamesData];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            gamesData = shuffled;
            break;
        default:
            gamesData.sort((a, b) => b.rating - a.rating);
    }
    
    return gamesData;
}

// Function to get popular games based on rating
function getPopularGames(limit = 8) {
    return [...gamesData]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// Expose functions to global scope
window.GameData = {
    load: loadGamesData,
    getAll: getAllGames,
    getByCategory: getGamesByCategory,
    getById: getGameById,
    search: searchGames,
    getRelated: getRelatedGames,
    getByTag: getGamesByTag,
    getFeatured: getFeaturedGames,
    getPopular: getPopularGames,
    sort: sortGames,
    setCurrentCategory(category) {
        currentCategory = category;
    },
    getCurrentCategory() {
        return currentCategory;
    },
    setCurrentSortOption(option) {
        currentSortOption = option;
        sortGames(option);
    },
    getCurrentSortOption() {
        return currentSortOption;
    }
}; 