/**
 * Retro Pong Game
 * A modern implementation of the classic Pong game with AI opponent
 */

// Game Settings and Configuration
const GAME_CONFIG = {
    targetScore: 10,
    ballSpeedIncrease: 0.2,
    initialBallSpeed: 5,
    paddleSpeed: 8,
    aiDifficulty: 'easy', // 'easy', 'medium', 'hard'
    aiReactionSpeeds: {
        easy: 0.05,
        medium: 0.12,
        hard: 0.3
    },
    aiErrorMargins: {
        easy: 50,
        medium: 25,
        hard: 10
    },
    gameMode: 'classic', // 'classic', 'survival'
    soundEnabled: true,
    commentaryEnabled: true,
    controlsType: 'both', // 'arrows', 'wasd', 'both'
    theme: 'retro',
    accessibility: {
        highContrast: false,
        largeText: false
    }
};

// Game State
const GAME_STATE = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    playerScore: 0,
    aiScore: 0,
    startTime: null,
    elapsedTime: 0,
    gameMode: null,
    longestRally: 0,
    currentRally: 0,
    lastScorer: null,
    konamiActivated: false,
    paddleHits: 0
};

// DOM Elements - will be populated when the DOM is loaded
let DOM = {
    canvas: null,
    ctx: null,
    startMenu: null,
    gameUI: null,
    pauseMenu: null,
    gameOver: null,
    leaderboardScreen: null,
    settingsScreen: null,
    playerScore: null,
    aiScore: null,
    gameTimer: null,
    commentary: null,
    mobileControls: null
};

// Audio Elements
const AUDIO = {
    paddleHit: null,
    wallHit: null,
    score: null,
    gameStart: null,
    gameOver: null
};

// Game Objects
let paddle = {
    width: 15,
    height: 100,
    x: 0, // Will be set properly on game init
    y: 0, // Will be set properly on game init
    speed: GAME_CONFIG.paddleSpeed,
    isMovingUp: false,
    isMovingDown: false,
    color: '#ffffff'
};

let aiPaddle = {
    width: 15,
    height: 100,
    x: 0, // Will be set properly on game init
    y: 0, // Will be set properly on game init
    speed: GAME_CONFIG.paddleSpeed * 0.85, // AI paddle slightly slower by default
    targetY: 0,
    reactionSpeed: GAME_CONFIG.aiReactionSpeeds[GAME_CONFIG.aiDifficulty],
    errorMargin: GAME_CONFIG.aiErrorMargins[GAME_CONFIG.aiDifficulty],
    color: '#ffffff'
};

let ball = {
    x: 0, // Will be set properly on game init
    y: 0, // Will be set properly on game init
    radius: 10,
    speedX: GAME_CONFIG.initialBallSpeed,
    speedY: GAME_CONFIG.initialBallSpeed,
    maxSpeed: 15,
    color: '#ffffff'
};

// Canvas dimensions
let canvasWidth = 800;
let canvasHeight = 600;

// Input State
const keys = {
    up: false,
    down: false,
    w: false,
    s: false
};

// Commentary System
const COMMENTARY = {
    normal: [
        "The rally continues!",
        "Nice return!",
        "Good shot!",
        "Keep it up!",
        "Great positioning!",
        "Watch the ball closely!"
    ],
    playerScore: [
        "Point for the player!",
        "The AI missed that one!",
        "Great shot, point scored!",
        "The AI couldn't reach that one!",
        "You've got the AI on the defensive!"
    ],
    aiScore: [
        "Point for the AI!",
        "The AI scores!",
        "You'll get it next time!",
        "The AI found an opening!",
        "Stay focused, you can catch up!"
    ],
    closeGame: [
        "It's a close game!",
        "Every point matters now!",
        "The tension is building!",
        "Who will take the lead?",
        "This is getting intense!"
    ],
    playerWinning: [
        "You're in the lead!",
        "Keep up the momentum!",
        "The AI is struggling to keep up!",
        "You've got the upper hand!",
        "Looking good for a win!"
    ],
    aiWinning: [
        "The AI has the advantage!",
        "Time to step up your game!",
        "Don't let the AI pull too far ahead!",
        "Focus and make a comeback!",
        "The AI is showing its skills!"
    ],
    gamePoint: [
        "Game point!",
        "This could be the winning point!",
        "One more point for victory!",
        "Can you clinch it?",
        "The pressure is on!"
    ],
    longRally: [
        "What a rally!",
        "This rally is going on forever!",
        "Neither side wants to give in!",
        "Incredible control from both sides!",
        "This is becoming epic!"
    ],
    fastBall: [
        "The ball is speeding up!",
        "That ball has some pace on it!",
        "Getting harder to return!",
        "The speed is increasing!",
        "Quick reflexes needed now!"
    ],
    tips: [
        "Try to anticipate where the ball will go",
        "Position your paddle before the ball arrives",
        "Watch the angle of the ball's approach",
        "Keep your paddle centered when possible",
        "Stay calm during long rallies"
    ]
};

// Coaching Tips for end of game
const COACHING_TIPS = [
    "Try anticipating the ball's trajectory for better positioning.",
    "Position your paddle slightly ahead of where you think the ball will go.",
    "The ball speeds up during long rallies, be prepared for faster returns.",
    "Mix up your strategy by sometimes hitting the ball at steeper angles.",
    "Use the full height of your paddle - the edges create more extreme angles.",
    "Watch the AI's movement patterns and try to exploit any weaknesses.",
    "If you're struggling, focus on defense first and counter-attacking.",
    "After long rallies, the AI sometimes needs a moment to reset its position.",
    "Try to keep the ball in play longer to build up your reaction skills.",
    "The middle of the paddle gives more predictable rebounds than the edges."
];

// Leaderboard (stored in localStorage)
let leaderboard = {
    classic: [],
    survival: []
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the game - setup event listeners, load resources, etc.
 */
function init() {
    // Get DOM elements
    DOM.canvas = document.getElementById('pongCanvas');
    DOM.ctx = DOM.canvas.getContext('2d');
    DOM.startMenu = document.getElementById('start-menu');
    DOM.gameUI = document.getElementById('game-ui');
    DOM.pauseMenu = document.getElementById('pause-menu');
    DOM.gameOver = document.getElementById('game-over');
    DOM.leaderboardScreen = document.getElementById('leaderboard-screen');
    DOM.settingsScreen = document.getElementById('settings-screen');
    DOM.playerScore = document.getElementById('player-score');
    DOM.aiScore = document.getElementById('ai-score');
    DOM.gameTimer = document.getElementById('game-timer');
    DOM.commentary = document.getElementById('commentary');
    DOM.mobileControls = document.getElementById('mobile-controls');

    // Initialize audio elements
    AUDIO.paddleHit = document.getElementById('paddle-hit');
    AUDIO.wallHit = document.getElementById('wall-hit');
    AUDIO.score = document.getElementById('score-sound');
    AUDIO.gameStart = document.getElementById('game-start');
    AUDIO.gameOver = document.getElementById('game-over-sound');

    // Setup canvas size
    resizeCanvas();
    
    // Add event listeners
    setupEventListeners();

    // Load saved settings
    loadSettings();
    
    // Load leaderboard from localStorage
    loadLeaderboard();
    
    // Apply theme
    applyTheme(GAME_CONFIG.theme);
    
    // Apply accessibility settings
    updateAccessibilitySettings();
    
    // Initialize mobile controls based on device
    initializeMobileControls();
    
    // Setup Konami code easter egg detection
    setupKonamiCode();
}

/**
 * Resize canvas to fit the screen
 */
function resizeCanvas() {
    // Set canvas size based on window size while maintaining aspect ratio
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Target aspect ratio: 4:3
    const targetRatio = 4 / 3;
    
    let newWidth = containerWidth * 0.8; // Use 80% of available width
    let newHeight = newWidth / targetRatio;
    
    // Check if the height is too large for the container
    if (newHeight > containerHeight * 0.8) {
        newHeight = containerHeight * 0.8;
        newWidth = newHeight * targetRatio;
    }
    
    // Set canvas size
    DOM.canvas.width = canvasWidth = Math.floor(newWidth);
    DOM.canvas.height = canvasHeight = Math.floor(newHeight);
    
    // Adjust game object sizes based on canvas dimensions
    adjustGameElements();
}

/**
 * Adjust game elements sizes and positions based on canvas dimensions
 */
function adjustGameElements() {
    // Adjust paddle dimensions
    paddle.width = Math.max(10, Math.floor(canvasWidth * 0.02));
    paddle.height = Math.max(80, Math.floor(canvasHeight * 0.16));
    
    // Position player paddle
    paddle.x = paddle.width * 2;
    paddle.y = (canvasHeight - paddle.height) / 2;
    
    // Adjust AI paddle dimensions (same as player paddle)
    aiPaddle.width = paddle.width;
    aiPaddle.height = paddle.height;
    
    // Position AI paddle
    aiPaddle.x = canvasWidth - (aiPaddle.width * 3);
    aiPaddle.y = (canvasHeight - aiPaddle.height) / 2;
    
    // Adjust ball size
    ball.radius = Math.max(5, Math.floor(canvasWidth * 0.012));
    
    // Position ball
    resetBall();
}

/**
 * Reset the ball to the center of the screen
 */
function resetBall(scorer = null) {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    
    // Reset ball speed to initial value
    const speed = GAME_CONFIG.initialBallSpeed;
    
    // Random angle between -45 and 45 degrees
    const angle = ((Math.random() * 90) - 45) * Math.PI / 180;
    
    // Direction based on who scored last (or random if null)
    let direction = 1;
    if (scorer === 'player') {
        direction = -1; // Ball goes towards AI
    } else if (scorer === 'ai') {
        direction = 1; // Ball goes towards player
    } else {
        direction = Math.random() > 0.5 ? 1 : -1; // Random direction
    }
    
    ball.speedX = Math.cos(angle) * speed * direction;
    ball.speedY = Math.sin(angle) * speed;
    
    // Reset rally counter
    GAME_STATE.currentRally = 0;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Menu buttons
    document.getElementById('start-classic').addEventListener('click', () => startGame('classic'));
    document.getElementById('start-survival').addEventListener('click', () => startGame('survival'));
    
    // Difficulty buttons
    document.getElementById('easy').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('medium').addEventListener('click', () => setDifficulty('medium'));
    document.getElementById('hard').addEventListener('click', () => setDifficulty('hard'));
    
    // Leaderboard button
    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('leaderboard-back').addEventListener('click', hideLeaderboard);
    
    // Settings
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    document.getElementById('settings-back').addEventListener('click', saveAndCloseSettings);
    
    // Game control buttons
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    document.getElementById('menu-btn').addEventListener('click', confirmExitToMenu);
    
    // Pause menu buttons
    document.getElementById('resume-btn').addEventListener('click', resumeGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('exit-to-menu').addEventListener('click', exitToMenu);
    
    // Game over buttons
    document.getElementById('play-again').addEventListener('click', restartGame);
    document.getElementById('save-score').addEventListener('click', saveScore);
    document.getElementById('go-to-menu').addEventListener('click', exitToMenu);
    
    // Leaderboard tabs
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.getAttribute('data-mode');
            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('selected'));
            tab.classList.add('selected');
            displayLeaderboard(mode);
        });
    });
    
    // Settings controls
    document.getElementById('sound-toggle').addEventListener('change', e => {
        GAME_CONFIG.soundEnabled = e.target.checked;
    });
    
    document.getElementById('commentary-toggle').addEventListener('change', e => {
        GAME_CONFIG.commentaryEnabled = e.target.checked;
    });
    
    document.getElementById('theme-selector').addEventListener('change', e => {
        applyTheme(e.target.value);
    });
    
    document.getElementById('control-selector').addEventListener('change', e => {
        GAME_CONFIG.controlsType = e.target.value;
    });
    
    document.getElementById('ball-speed').addEventListener('input', e => {
        const speedFactor = parseInt(e.target.value);
        GAME_CONFIG.initialBallSpeed = 3 + speedFactor;
    });
    
    // Mobile touch controls
    if ('ontouchstart' in window) {
        document.getElementById('touch-up').addEventListener('touchstart', () => { keys.up = true; });
        document.getElementById('touch-up').addEventListener('touchend', () => { keys.up = false; });
        document.getElementById('touch-down').addEventListener('touchstart', () => { keys.down = true; });
        document.getElementById('touch-down').addEventListener('touchend', () => { keys.down = false; });
    }
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
    if (e.key === 'ArrowUp' && (GAME_CONFIG.controlsType === 'arrows' || GAME_CONFIG.controlsType === 'both')) {
        keys.up = true;
    } else if (e.key === 'ArrowDown' && (GAME_CONFIG.controlsType === 'arrows' || GAME_CONFIG.controlsType === 'both')) {
        keys.down = true;
    } else if (e.key === 'w' && (GAME_CONFIG.controlsType === 'wasd' || GAME_CONFIG.controlsType === 'both')) {
        keys.w = true;
    } else if (e.key === 's' && (GAME_CONFIG.controlsType === 'wasd' || GAME_CONFIG.controlsType === 'both')) {
        keys.s = true;
    } else if (e.key === 'Escape' && GAME_STATE.isRunning) {
        togglePause();
    } else if (e.key === 'm') {
        toggleMute();
    }
}

/**
 * Handle keyup events
 */
function handleKeyUp(e) {
    if (e.key === 'ArrowUp') {
        keys.up = false;
    } else if (e.key === 'ArrowDown') {
        keys.down = false;
    } else if (e.key === 'w') {
        keys.w = false;
    } else if (e.key === 's') {
        keys.s = false;
    }
}

/**
 * Start the game
 */
function startGame(mode) {
    // Set game mode
    GAME_STATE.gameMode = mode;
    GAME_CONFIG.gameMode = mode;
    
    // Reset scores
    GAME_STATE.playerScore = 0;
    GAME_STATE.aiScore = 0;
    updateScoreDisplay();
    
    // Reset game state
    GAME_STATE.isRunning = true;
    GAME_STATE.isPaused = false;
    GAME_STATE.isGameOver = false;
    GAME_STATE.startTime = Date.now();
    GAME_STATE.elapsedTime = 0;
    GAME_STATE.longestRally = 0;
    GAME_STATE.currentRally = 0;
    GAME_STATE.lastScorer = null;
    
    // Reset game objects
    resetBall();
    paddle.y = (canvasHeight - paddle.height) / 2;
    aiPaddle.y = (canvasHeight - aiPaddle.height) / 2;
    
    // Hide menus, show game UI
    DOM.startMenu.classList.add('hidden');
    DOM.gameUI.classList.remove('hidden');
    DOM.pauseMenu.classList.add('hidden');
    DOM.gameOver.classList.add('hidden');
    
    // Show mobile controls if on touch device
    if ('ontouchstart' in window) {
        DOM.mobileControls.classList.remove('hidden');
    }
    
    // Play game start sound
    playSound(AUDIO.gameStart);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Show initial commentary
    showCommentary(getRandomComment('normal'));
}

/**
 * Main game loop
 */
function gameLoop(timestamp) {
    if (!GAME_STATE.isRunning) return;
    
    if (GAME_STATE.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Clear canvas
    DOM.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Update game time
    updateGameTime();
    
    // Update player paddle position
    updatePlayerPaddle();
    
    // Update AI paddle position
    updateAIPaddle();
    
    // Update ball position and handle collisions
    updateBall();
    
    // Draw game objects
    drawGame();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Update game time display
 */
function updateGameTime() {
    if (GAME_STATE.startTime) {
        const currentTime = Date.now();
        GAME_STATE.elapsedTime = Math.floor((currentTime - GAME_STATE.startTime) / 1000);
        
        const minutes = Math.floor(GAME_STATE.elapsedTime / 60);
        const seconds = GAME_STATE.elapsedTime % 60;
        
        DOM.gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Update player paddle position based on input
 */
function updatePlayerPaddle() {
    let movingUp = keys.up || keys.w;
    let movingDown = keys.down || keys.s;
    
    if (movingUp && !movingDown) {
        paddle.y -= paddle.speed;
    } else if (movingDown && !movingUp) {
        paddle.y += paddle.speed;
    }
    
    // Keep paddle within canvas bounds
    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y + paddle.height > canvasHeight) {
        paddle.y = canvasHeight - paddle.height;
    }
}

/**
 * Update AI paddle position
 */
function updateAIPaddle() {
    // AI difficulty is based on:
    // 1. Reaction speed (how quickly it moves toward the target)
    // 2. Error margin (how precisely it tracks the ball)
    
    // Only adjust AI target when ball is moving towards AI
    if (ball.speedX > 0) {
        // Predict where the ball will be when it reaches the AI paddle's x position
        const distanceToBall = aiPaddle.x - ball.x;
        const timeToImpact = distanceToBall / ball.speedX;
        
        let predictedY = ball.y + (ball.speedY * timeToImpact);
        
        // Make sure the predicted position is within the canvas
        while (predictedY < 0 || predictedY > canvasHeight) {
            if (predictedY < 0) {
                predictedY = -predictedY; // Bounce off the top
            } else if (predictedY > canvasHeight) {
                predictedY = 2 * canvasHeight - predictedY; // Bounce off the bottom
            }
        }
        
        // Add error margin based on difficulty
        let errorAmount = aiPaddle.errorMargin;
        
        // Reduce error for higher difficulty levels when it's game point or close game
        if (GAME_STATE.aiScore >= GAME_CONFIG.targetScore - 2 || 
            GAME_STATE.playerScore >= GAME_CONFIG.targetScore - 2 ||
            Math.abs(GAME_STATE.playerScore - GAME_STATE.aiScore) <= 2) {
            errorAmount = Math.max(5, errorAmount * 0.7);
        }
        
        // Apply error margin
        const error = (Math.random() * 2 - 1) * errorAmount;
        predictedY += error;
        
        // Set target as center of the paddle
        aiPaddle.targetY = predictedY - (aiPaddle.height / 2);
    } else {
        // When ball is moving away, slowly return to center with slight delay
        aiPaddle.targetY = (canvasHeight - aiPaddle.height) / 2;
    }
    
    // Move towards target with reaction speed factor
    const deltaY = aiPaddle.targetY - aiPaddle.y;
    aiPaddle.y += deltaY * aiPaddle.reactionSpeed;
    
    // Keep paddle within canvas bounds
    if (aiPaddle.y < 0) {
        aiPaddle.y = 0;
    } else if (aiPaddle.y + aiPaddle.height > canvasHeight) {
        aiPaddle.y = canvasHeight - aiPaddle.height;
    }
}

/**
 * Update ball position and handle collisions
 */
function updateBall() {
    // Update ball position
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
        ball.speedY = -ball.speedY;
        
        // Ensure the ball doesn't get stuck in the wall
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        } else if (ball.y + ball.radius > canvasHeight) {
            ball.y = canvasHeight - ball.radius;
        }
        
        // Play wall hit sound
        playSound(AUDIO.wallHit);
    }
    
    // Ball collision with player paddle
    if (ball.speedX < 0 && // Ball moving towards player
        ball.x - ball.radius <= paddle.x + paddle.width && 
        ball.x + ball.radius >= paddle.x && 
        ball.y + ball.radius >= paddle.y && 
        ball.y - ball.radius <= paddle.y + paddle.height) {
        
        handlePaddleCollision(paddle);
    }
    
    // Ball collision with AI paddle
    if (ball.speedX > 0 && // Ball moving towards AI
        ball.x + ball.radius >= aiPaddle.x && 
        ball.x - ball.radius <= aiPaddle.x + aiPaddle.width && 
        ball.y + ball.radius >= aiPaddle.y && 
        ball.y - ball.radius <= aiPaddle.y + aiPaddle.height) {
        
        handlePaddleCollision(aiPaddle);
    }
    
    // Ball goes out left or right - score
    if (ball.x - ball.radius > canvasWidth) {
        // Player scores
        GAME_STATE.playerScore++;
        GAME_STATE.lastScorer = 'player';
        updateScoreDisplay();
        handleScore('player');
    } else if (ball.x + ball.radius < 0) {
        // AI scores
        GAME_STATE.aiScore++;
        GAME_STATE.lastScorer = 'ai';
        updateScoreDisplay();
        handleScore('ai');
    }
}

/**
 * Handle ball collision with paddle
 */
function handlePaddleCollision(paddleObj) {
    // Reverse horizontal direction
    ball.speedX = -ball.speedX;
    
    // Adjust angle based on where the ball hit the paddle
    const hitPosition = (ball.y - (paddleObj.y + paddleObj.height / 2)) / (paddleObj.height / 2);
    ball.speedY = hitPosition * Math.abs(ball.speedX) * 0.75;
    
    // Increase ball speed slightly for more challenge
    const speedIncrease = GAME_CONFIG.ballSpeedIncrease;
    
    // Limit max speed
    if (Math.abs(ball.speedX) < ball.maxSpeed) {
        ball.speedX = ball.speedX > 0 ? 
            ball.speedX + speedIncrease : 
            ball.speedX - speedIncrease;
    }
    
    // Ensure ball doesn't get stuck in paddle
    if (ball.speedX > 0) {
        ball.x = paddleObj.x - ball.radius;
    } else {
        ball.x = paddleObj.x + paddleObj.width + ball.radius;
    }
    
    // Update rally count
    GAME_STATE.currentRally++;
    
    // Update longest rally if current rally is longer
    if (GAME_STATE.currentRally > GAME_STATE.longestRally) {
        GAME_STATE.longestRally = GAME_STATE.currentRally;
    }
    
    // Play paddle hit sound
    playSound(AUDIO.paddleHit);
    
    // Show commentary for long rally or fast ball
    if (GAME_STATE.currentRally >= 5 && GAME_STATE.currentRally % 5 === 0) {
        showCommentary(getRandomComment('longRally'));
    } else if (Math.abs(ball.speedX) > GAME_CONFIG.initialBallSpeed * 1.5) {
        showCommentary(getRandomComment('fastBall'));
    }
    
    // Track total paddle hits (could be used for achievements or stats)
    GAME_STATE.paddleHits++;
}

/**
 * Handle scoring
 */
function handleScore(scorer) {
    // Play score sound
    playSound(AUDIO.score);
    
    // Show appropriate commentary
    if (scorer === 'player') {
        showCommentary(getRandomComment('playerScore'));
    } else {
        showCommentary(getRandomComment('aiScore'));
    }
    
    // Check for game over
    if (GAME_STATE.playerScore >= GAME_CONFIG.targetScore || 
        GAME_STATE.aiScore >= GAME_CONFIG.targetScore) {
        endGame();
        return;
    }
    
    // Show game point commentary if applicable
    if (GAME_STATE.playerScore === GAME_CONFIG.targetScore - 1 || 
        GAME_STATE.aiScore === GAME_CONFIG.targetScore - 1) {
        setTimeout(() => {
            showCommentary(getRandomComment('gamePoint'));
        }, 1500);
    }
    // Show close game commentary
    else if (Math.abs(GAME_STATE.playerScore - GAME_STATE.aiScore) <= 2 && 
             GAME_STATE.playerScore >= 5) {
        setTimeout(() => {
            showCommentary(getRandomComment('closeGame'));
        }, 1500);
    }
    // Show who's winning if there's a significant difference
    else if (GAME_STATE.playerScore >= GAME_STATE.aiScore + 3) {
        setTimeout(() => {
            showCommentary(getRandomComment('playerWinning'));
        }, 1500);
    }
    else if (GAME_STATE.aiScore >= GAME_STATE.playerScore + 3) {
        setTimeout(() => {
            showCommentary(getRandomComment('aiWinning'));
        }, 1500);
    }
    
    // Reset ball
    resetBall(scorer);
}

/**
 * Draw all game elements on the canvas
 */
function drawGame() {
    // Clear canvas with background color
    DOM.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color');
    DOM.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw center line
    DOM.ctx.setLineDash([10, 15]);
    DOM.ctx.beginPath();
    DOM.ctx.moveTo(canvasWidth / 2, 0);
    DOM.ctx.lineTo(canvasWidth / 2, canvasHeight);
    DOM.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--secondary-color');
    DOM.ctx.lineWidth = 2;
    DOM.ctx.stroke();
    DOM.ctx.setLineDash([]);
    
    // Draw player paddle
    DOM.ctx.fillStyle = paddle.color;
    DOM.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw AI paddle
    DOM.ctx.fillStyle = aiPaddle.color;
    DOM.ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
    
    // Draw ball
    DOM.ctx.beginPath();
    DOM.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    DOM.ctx.fillStyle = ball.color;
    DOM.ctx.fill();
    DOM.ctx.closePath();
    
    // Draw special effects for Konami code
    if (GAME_STATE.konamiActivated) {
        drawKonamiEffects();
    }
}

/**
 * End the game and show the game over screen
 */
function endGame() {
    GAME_STATE.isRunning = false;
    GAME_STATE.isGameOver = true;
    
    // Play game over sound
    playSound(AUDIO.gameOver);
    
    // Show game over screen
    DOM.gameUI.classList.add('hidden');
    DOM.gameOver.classList.remove('hidden');
    
    // Update winner text
    const winnerText = document.getElementById('winner-text');
    if (GAME_STATE.playerScore > GAME_STATE.aiScore) {
        winnerText.textContent = "You Win!";
    } else {
        winnerText.textContent = "AI Wins!";
    }
    
    // Update final score
    document.getElementById('final-score').textContent = `${GAME_STATE.playerScore} - ${GAME_STATE.aiScore}`;
    
    // Update game stats
    const minutes = Math.floor(GAME_STATE.elapsedTime / 60);
    const seconds = GAME_STATE.elapsedTime % 60;
    document.getElementById('time-played').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('longest-rally').textContent = GAME_STATE.longestRally;
    
    // Set random coaching tip
    document.getElementById('coaching-tip').textContent = COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)];
    
    // Hide mobile controls
    DOM.mobileControls.classList.add('hidden');
}

/**
 * Update the score display
 */
function updateScoreDisplay() {
    DOM.playerScore.textContent = GAME_STATE.playerScore;
    DOM.aiScore.textContent = GAME_STATE.aiScore;
}

/**
 * Toggle pause state
 */
function togglePause() {
    if (GAME_STATE.isGameOver) return;
    
    GAME_STATE.isPaused = !GAME_STATE.isPaused;
    
    if (GAME_STATE.isPaused) {
        DOM.pauseMenu.classList.remove('hidden');
    } else {
        DOM.pauseMenu.classList.add('hidden');
    }
}

/**
 * Resume the game from pause
 */
function resumeGame() {
    if (GAME_STATE.isPaused) {
        GAME_STATE.isPaused = false;
        DOM.pauseMenu.classList.add('hidden');
    }
}

/**
 * Restart the current game
 */
function restartGame() {
    // Hide all menus
    DOM.pauseMenu.classList.add('hidden');
    DOM.gameOver.classList.add('hidden');
    
    // Start a new game with the same mode
    startGame(GAME_STATE.gameMode);
}

/**
 * Exit to main menu
 */
function exitToMenu() {
    // Stop the game
    GAME_STATE.isRunning = false;
    GAME_STATE.isPaused = false;
    GAME_STATE.isGameOver = false;
    
    // Hide game elements
    DOM.gameUI.classList.add('hidden');
    DOM.pauseMenu.classList.add('hidden');
    DOM.gameOver.classList.add('hidden');
    DOM.mobileControls.classList.add('hidden');
    
    // Show start menu
    DOM.startMenu.classList.remove('hidden');
}

/**
 * Confirm exit to menu (when in-game)
 */
function confirmExitToMenu() {
    if (confirm("Are you sure you want to exit to the main menu? Current game progress will be lost.")) {
        exitToMenu();
    }
}

/**
 * Set the difficulty level
 */
function setDifficulty(level) {
    GAME_CONFIG.aiDifficulty = level;
    
    // Update AI parameters based on difficulty
    aiPaddle.reactionSpeed = GAME_CONFIG.aiReactionSpeeds[level];
    aiPaddle.errorMargin = GAME_CONFIG.aiErrorMargins[level];
    
    // Update UI
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById(level).classList.add('selected');
}

/**
 * Show commentary message
 */
function showCommentary(message) {
    if (!GAME_CONFIG.commentaryEnabled) return;
    
    DOM.commentary.textContent = message;
    DOM.commentary.classList.add('active');
    
    // Clear previous timeout if exists
    if (DOM.commentary.timeoutId) {
        clearTimeout(DOM.commentary.timeoutId);
    }
    
    // Hide commentary after a delay
    DOM.commentary.timeoutId = setTimeout(() => {
        DOM.commentary.classList.remove('active');
    }, 3000);
}

/**
 * Get random comment from a commentary category
 */
function getRandomComment(category) {
    const comments = COMMENTARY[category];
    return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * Play sound with volume control and mute check
 */
function playSound(sound) {
    if (!GAME_CONFIG.soundEnabled || !sound) return;
    
    // Clone the audio element to allow for overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = 0.7; // Adjust volume
    soundClone.play().catch(e => {
        // Ignore autoplay errors (common in some browsers)
        console.log("Audio playback error:", e);
    });
}

/**
 * Toggle sound mute status
 */
function toggleMute() {
    GAME_CONFIG.soundEnabled = !GAME_CONFIG.soundEnabled;
    
    // Update mute button text
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.textContent = GAME_CONFIG.soundEnabled ? '🔊' : '🔇';
    
    // Also update settings checkbox
    document.getElementById('sound-toggle').checked = GAME_CONFIG.soundEnabled;
}

/**
 * Show settings screen
 */
function showSettings() {
    DOM.startMenu.classList.add('hidden');
    DOM.settingsScreen.classList.remove('hidden');
    
    // Update settings UI with current values
    document.getElementById('sound-toggle').checked = GAME_CONFIG.soundEnabled;
    document.getElementById('commentary-toggle').checked = GAME_CONFIG.commentaryEnabled;
    document.getElementById('theme-selector').value = GAME_CONFIG.theme;
    document.getElementById('control-selector').value = GAME_CONFIG.controlsType;
    document.getElementById('ball-speed').value = GAME_CONFIG.initialBallSpeed - 3;
}

/**
 * Save settings and close settings screen
 */
function saveAndCloseSettings() {
    // Save settings
    GAME_CONFIG.soundEnabled = document.getElementById('sound-toggle').checked;
    GAME_CONFIG.commentaryEnabled = document.getElementById('commentary-toggle').checked;
    GAME_CONFIG.theme = document.getElementById('theme-selector').value;
    GAME_CONFIG.controlsType = document.getElementById('control-selector').value;
    GAME_CONFIG.initialBallSpeed = parseInt(document.getElementById('ball-speed').value) + 3;
    
    // Save to local storage
    saveSettings();
    
    // Apply theme
    applyTheme(GAME_CONFIG.theme);
    
    // Update mute button text
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.textContent = GAME_CONFIG.soundEnabled ? '🔊' : '🔇';
    }
    
    // Close settings screen
    DOM.settingsScreen.classList.add('hidden');
    DOM.startMenu.classList.remove('hidden');
}

/**
 * Save settings to local storage
 */
function saveSettings() {
    try {
        localStorage.setItem('pongSettings', JSON.stringify({
            soundEnabled: GAME_CONFIG.soundEnabled,
            commentaryEnabled: GAME_CONFIG.commentaryEnabled,
            theme: GAME_CONFIG.theme,
            controlsType: GAME_CONFIG.controlsType,
            initialBallSpeed: GAME_CONFIG.initialBallSpeed,
            aiDifficulty: GAME_CONFIG.aiDifficulty,
            accessibility: GAME_CONFIG.accessibility
        }));
    } catch (e) {
        console.error("Error saving settings:", e);
    }
}

/**
 * Load settings from local storage
 */
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('pongSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Update game config with saved settings
            GAME_CONFIG.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : GAME_CONFIG.soundEnabled;
            GAME_CONFIG.commentaryEnabled = settings.commentaryEnabled !== undefined ? settings.commentaryEnabled : GAME_CONFIG.commentaryEnabled;
            GAME_CONFIG.theme = settings.theme || GAME_CONFIG.theme;
            GAME_CONFIG.controlsType = settings.controlsType || GAME_CONFIG.controlsType;
            GAME_CONFIG.initialBallSpeed = settings.initialBallSpeed || GAME_CONFIG.initialBallSpeed;
            GAME_CONFIG.aiDifficulty = settings.aiDifficulty || GAME_CONFIG.aiDifficulty;
            
            if (settings.accessibility) {
                GAME_CONFIG.accessibility = settings.accessibility;
            }
            
            // Update UI
            setDifficulty(GAME_CONFIG.aiDifficulty);
        }
    } catch (e) {
        console.error("Error loading settings:", e);
    }
}

/**
 * Apply theme to the game
 */
function applyTheme(theme) {
    // Remove any existing theme classes
    document.body.classList.remove('theme-retro', 'theme-neon', 'theme-minimal', 'theme-matrix');
    
    // Apply new theme
    if (theme !== 'retro') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Update game object colors based on theme
    paddle.color = getComputedStyle(document.body).getPropertyValue('--primary-color');
    aiPaddle.color = getComputedStyle(document.body).getPropertyValue('--primary-color');
    ball.color = getComputedStyle(document.body).getPropertyValue('--primary-color');
    
    // Save current theme
    GAME_CONFIG.theme = theme;
}

/**
 * Show leaderboard screen
 */
function showLeaderboard() {
    DOM.startMenu.classList.add('hidden');
    DOM.leaderboardScreen.classList.remove('hidden');
    
    // Display the leaderboard for classic mode by default
    displayLeaderboard('classic');
}

/**
 * Hide leaderboard screen
 */
function hideLeaderboard() {
    DOM.leaderboardScreen.classList.add('hidden');
    DOM.startMenu.classList.remove('hidden');
}

/**
 * Save score to leaderboard
 */
function saveScore() {
    // Get player name
    let playerName = prompt("Enter your name for the leaderboard:", "Player");
    
    if (!playerName) {
        playerName = "Anonymous";
    }
    
    // Create score entry
    const scoreEntry = {
        name: playerName,
        score: GAME_STATE.playerScore,
        aiScore: GAME_STATE.aiScore,
        date: new Date().toISOString().split('T')[0],
        time: GAME_STATE.elapsedTime,
        longestRally: GAME_STATE.longestRally,
        difficulty: GAME_CONFIG.aiDifficulty
    };
    
    // Add to appropriate leaderboard
    leaderboard[GAME_STATE.gameMode].push(scoreEntry);
    
    // Sort leaderboard
    leaderboard[GAME_STATE.gameMode].sort((a, b) => b.score - a.score);
    
    // Trim leaderboard to 10 entries
    if (leaderboard[GAME_STATE.gameMode].length > 10) {
        leaderboard[GAME_STATE.gameMode] = leaderboard[GAME_STATE.gameMode].slice(0, 10);
    }
    
    // Save to local storage
    saveLeaderboard();
    
    // Show leaderboard
    DOM.gameOver.classList.add('hidden');
    showLeaderboard();
    
    // Select the tab for the current game mode
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('selected');
        if (tab.getAttribute('data-mode') === GAME_STATE.gameMode) {
            tab.classList.add('selected');
        }
    });
    
    // Display the leaderboard
    displayLeaderboard(GAME_STATE.gameMode);
}

/**
 * Display leaderboard for a specific game mode
 */
function displayLeaderboard(mode) {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    
    if (leaderboard[mode].length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet.</div>';
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Rank</th>
        <th>Name</th>
        <th>Score</th>
        <th>Difficulty</th>
        <th>Date</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    leaderboard[mode].forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Add rank with medal for top 3
        let rankDisplay = `${index + 1}`;
        if (index === 0) rankDisplay = '🥇 1';
        if (index === 1) rankDisplay = '🥈 2';
        if (index === 2) rankDisplay = '🥉 3';
        
        row.innerHTML = `
            <td class="entry-rank">${rankDisplay}</td>
            <td>${entry.name}</td>
            <td>${entry.score} - ${entry.aiScore}</td>
            <td>${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</td>
            <td>${entry.date}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    leaderboardList.appendChild(table);
}

/**
 * Save leaderboard to local storage
 */
function saveLeaderboard() {
    try {
        localStorage.setItem('pongLeaderboard', JSON.stringify(leaderboard));
    } catch (e) {
        console.error("Error saving leaderboard:", e);
    }
}

/**
 * Load leaderboard from local storage
 */
function loadLeaderboard() {
    try {
        const savedLeaderboard = localStorage.getItem('pongLeaderboard');
        if (savedLeaderboard) {
            leaderboard = JSON.parse(savedLeaderboard);
        }
        
        // Ensure both game modes exist
        if (!leaderboard.classic) {
            leaderboard.classic = [];
        }
        if (!leaderboard.survival) {
            leaderboard.survival = [];
        }
    } catch (e) {
        console.error("Error loading leaderboard:", e);
        leaderboard = {
            classic: [],
            survival: []
        };
    }
}

/**
 * Setup Konami code easter egg detection
 * Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
 */
function setupKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        // Check key against Konami code sequence
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            // Show indicator for fun
            showKonamiProgress(konamiIndex);
            
            // If the sequence is complete
            if (konamiIndex === konamiCode.length) {
                activateKonamiEasterEgg();
                konamiIndex = 0;
            }
        } else {
            // Reset sequence
            konamiIndex = 0;
            hideKonamiIndicator();
        }
    });
}

/**
 * Show Konami code input progress
 */
function showKonamiProgress(progress) {
    const indicator = document.getElementById('konami-indicator');
    const sequence = document.querySelector('.konami-sequence');
    
    if (!indicator || !sequence) return;
    
    indicator.classList.remove('hidden');
    
    // Clear current sequence
    sequence.innerHTML = '';
    
    // Show progress
    const konamiCode = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'];
    
    for (let i = 0; i < progress; i++) {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = konamiCode[i];
        sequence.appendChild(key);
    }
    
    // Hide after a delay if not complete
    if (progress < konamiCode.length) {
        if (indicator.timeoutId) {
            clearTimeout(indicator.timeoutId);
        }
        
        indicator.timeoutId = setTimeout(() => {
            hideKonamiIndicator();
        }, 2000);
    }
}

/**
 * Hide Konami code indicator
 */
function hideKonamiIndicator() {
    const indicator = document.getElementById('konami-indicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

/**
 * Activate Konami code easter egg
 */
function activateKonamiEasterEgg() {
    // Add a fun message
    showCommentary("🎮 KONAMI CODE ACTIVATED! 🎮");
    
    // Activate rainbow mode
    GAME_STATE.konamiActivated = true;
    
    // Make ball bigger and faster
    ball.radius *= 1.5;
    ball.maxSpeed *= 1.5;
    
    // Make player paddle larger
    paddle.height *= 1.5;
    
    // Play a special sound if you have one
    playSound(AUDIO.gameStart);
}

/**
 * Draw special effects for Konami code
 */
function drawKonamiEffects() {
    // Rainbow trail for the ball
    const trailLength = 5;
    const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
    
    for (let i = 0; i < trailLength; i++) {
        const trailSize = ball.radius * (1 - i / trailLength);
        const colorIndex = i % rainbowColors.length;
        
        DOM.ctx.beginPath();
        DOM.ctx.arc(
            ball.x - (i * ball.speedX * 0.3), 
            ball.y - (i * ball.speedY * 0.3), 
            trailSize, 
            0, 
            Math.PI * 2
        );
        DOM.ctx.fillStyle = rainbowColors[colorIndex];
        DOM.ctx.fill();
    }
    
    // Add a pulsing glow to paddles
    const time = Date.now() / 1000;
    const glow = Math.abs(Math.sin(time * 3));
    
    DOM.ctx.shadowBlur = 15 * glow;
    DOM.ctx.shadowColor = rainbowColors[Math.floor(time) % rainbowColors.length];
}

/**
 * Update accessibility settings
 */
function updateAccessibilitySettings() {
    if (GAME_CONFIG.accessibility.highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    
    if (GAME_CONFIG.accessibility.largeText) {
        document.body.classList.add('large-text');
    } else {
        document.body.classList.remove('large-text');
    }
}

/**
 * Toggle accessibility mode
 */
function toggle_accessibility_mode(e) {
    GAME_CONFIG.accessibility.highContrast = e.target.checked;
    GAME_CONFIG.accessibility.largeText = e.target.checked;
    
    // Update UI
    document.getElementById('high-contrast-checkbox').checked = e.target.checked;
    document.getElementById('large-text-checkbox').checked = e.target.checked;
    
    // Apply settings
    updateAccessibilitySettings();
}

/**
 * Toggle high contrast mode
 */
function toggle_high_contrast(e) {
    GAME_CONFIG.accessibility.highContrast = e.target.checked;
    updateAccessibilitySettings();
}

/**
 * Toggle large text mode
 */
function toggle_large_text(e) {
    GAME_CONFIG.accessibility.largeText = e.target.checked;
    updateAccessibilitySettings();
}

/**
 * Initialize mobile controls based on device detection
 */
function initializeMobileControls() {
    // Only show mobile controls on touch devices
    if ('ontouchstart' in window) {
        // Show touch controls on game start
        if (GAME_STATE.isRunning) {
            DOM.mobileControls.classList.remove('hidden');
        }
    } else {
        // Hide touch controls on non-touch devices
        DOM.mobileControls.classList.add('hidden');
    }
}

// Handle window resize events to keep the game responsive
window.addEventListener('resize', () => {
    resizeCanvas();
    
    // If game is running, redraw
    if (GAME_STATE.isRunning && !GAME_STATE.isPaused) {
        drawGame();
    }
}); 