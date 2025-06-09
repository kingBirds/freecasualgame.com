/**
 * Play.js - Game playing page logic
 * Handles game loading, fullscreen mode, and related games
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const gameTitle = document.getElementById('game-title');
    const gameBreadcrumbTitle = document.getElementById('game-breadcrumb-title');
    const gameCategory = document.getElementById('game-category');
    const gameDescription = document.getElementById('game-description');
    const gameIframe = document.getElementById('game-iframe');
    const gameContainer = document.getElementById('game-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const gameTagsContainer = document.getElementById('game-tags');
    const relatedGamesContainer = document.getElementById('related-games');
    const relatedGameTemplate = document.getElementById('related-game-template');

    // Get game ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    // If no game ID is provided, redirect to homepage
    if (!gameId) {
        window.location.href = 'index.html';
        return;
    }

    // Load games data
    await GameData.load();

    // Get game data
    const game = GameData.getById(gameId);

    // If game not found, show error and link to homepage
    if (!game) {
        document.body.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
                <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 class="text-2xl font-bold text-red-600 mb-4">Game Not Found</h1>
                    <p class="text-gray-600 mb-6">The game you're looking for doesn't exist or has been removed.</p>
                    <a href="index.html" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Back to Home
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // Set page title
    document.title = `${game.title} - FreeCasualGame.com`;

    // Update game information
    gameTitle.textContent = game.title;
    gameBreadcrumbTitle.textContent = game.title;
    
    // Capitalize category
    const capitalizedCategory = game.category.charAt(0).toUpperCase() + game.category.slice(1);
    gameCategory.textContent = capitalizedCategory;
    gameCategory.href = `index.html?category=${game.category}`;
    
    gameDescription.textContent = game.description;
    gameIframe.src = game.embed;

    // Add game tags
    gameTagsContainer.innerHTML = '';
    game.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer';
        tagEl.textContent = tag;
        tagEl.addEventListener('click', () => {
            window.location.href = `index.html?tag=${tag}`;
        });
        gameTagsContainer.appendChild(tagEl);
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Load related games
    const relatedGames = GameData.getRelated(gameId);
    renderRelatedGames(relatedGames);

    // Functions

    // Toggle fullscreen for the game
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (gameContainer.requestFullscreen) {
                gameContainer.requestFullscreen();
            } else if (gameContainer.webkitRequestFullscreen) { /* Safari */
                gameContainer.webkitRequestFullscreen();
            } else if (gameContainer.msRequestFullscreen) { /* IE11 */
                gameContainer.msRequestFullscreen();
            }
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Exit fullscreen
            `;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                Click here for fullscreen
            `;
        }
    }

    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);

    function updateFullscreenButton() {
        if (!document.fullscreenElement) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                Click here for fullscreen
            `;
        }
    }

    // Render related games
    function renderRelatedGames(games) {
        relatedGamesContainer.innerHTML = '';
        
        if (games.length === 0) {
            relatedGamesContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-gray-500">No related games found.</p>
                </div>
            `;
            return;
        }
        
        games.forEach(game => {
            const gameCard = createRelatedGameCard(game);
            relatedGamesContainer.appendChild(gameCard);
        });
    }
    
    // Create a related game card
    function createRelatedGameCard(game) {
        const template = relatedGameTemplate.content.cloneNode(true);
        const card = template.querySelector('.game-card');
        
        // Set image
        const img = card.querySelector('img');
        img.src = game.image;
        img.alt = game.title;
        
        // Set title
        const title = card.querySelector('h3');
        title.textContent = game.title;
        
        // Set "Play Now" link
        const playNowBtn = card.querySelector('a');
        playNowBtn.href = `play.html?id=${game.id}`;
        
        return card;
    }
}); 