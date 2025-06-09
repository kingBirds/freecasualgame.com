/**
 * Games.js - Game data handling module
 * Responsible for loading and processing game data
 */

// Global games data store
let gamesData = [];
let currentCategory = 'all';

// Function to load games data from JSON file
async function loadGamesData() {
    try {
        const response = await fetch('../data/games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        gamesData = await response.json();
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
    
    return shuffled.slice(0, limit);
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
    setCurrentCategory(category) {
        currentCategory = category;
    },
    getCurrentCategory() {
        return currentCategory;
    }
}; 