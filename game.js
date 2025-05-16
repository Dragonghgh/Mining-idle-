// Game State
const game = {
    gold: 0,
    goldPerClick: 1,
    goldPerSecond: 0,
    workers: 0,
    workerCost: 10,
    workerEfficiency: 1,
    workerUpgradeCost: 100,
    pickaxeLevel: 1,
    pickaxeCost: 50,
    lastUpdate: Date.now()
};

// DOM Elements
const elements = {
    gold: document.getElementById('gold'),
    goldPerClick: document.getElementById('goldPerClick'),
    goldPerSecond: document.getElementById('goldPerSecond'),
    workers: document.getElementById('workers'),
    workerCost: document.getElementById('workerCost'),
    workerEfficiency: document.getElementById('workerEfficiency'),
    workerUpgradeCost: document.getElementById('workerUpgradeCost'),
    pickaxeLevel: document.getElementById('pickaxeLevel'),
    pickaxeCost: document.getElementById('pickaxeCost'),
    mineGold: document.getElementById('mineGold'),
    hireWorker: document.getElementById('hireWorker'),
    upgradePickaxe: document.getElementById('upgradePickaxe'),
    upgradeWorker: document.getElementById('upgradeWorker')
};

// Initialize Game
function init() {
    loadGame();
    setupEventListeners();
    requestAnimationFrame(gameLoop);
    
    // Prevent zooming
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('touchmove', (e) => {
        if (e.scale !== 1) e.preventDefault();
    }, { passive: false });
}

// Load Game
function loadGame() {
    const saved = localStorage.getItem('idleMinerSave');
    if (saved) {
        const parsed = JSON.parse(saved);
        
        // Calculate offline progress
        if (parsed.lastUpdate) {
            const seconds = (Date.now() - parsed.lastUpdate) / 1000;
            parsed.gold += parsed.goldPerSecond * seconds;
        }
        
        Object.assign(game, parsed);
        updateUI();
    }
}

// Save Game
function saveGame() {
    game.lastUpdate = Date.now();
    localStorage.setItem('idleMinerSave', JSON.stringify(game));
}

// Update UI
function updateUI() {
    elements.gold.textContent = Math.floor(game.gold);
    elements.goldPerClick.textContent = game.goldPerClick;
    elements.goldPerSecond.textContent = game.goldPerSecond.toFixed(1);
    elements.workers.textContent = game.workers;
    elements.workerCost.textContent = game.workerCost;
    elements.workerEfficiency.textContent = game.workerEfficiency;
    elements.workerUpgradeCost.textContent = game.workerUpgradeCost;
    elements.pickaxeLevel.textContent = game.pickaxeLevel;
    elements.pickaxeCost.textContent = game.pickaxeCost;
    
    // Update button states
    elements.hireWorker.disabled = game.gold < game.workerCost;
    elements.upgradePickaxe.disabled = game.gold < game.pickaxeCost;
    elements.upgradeWorker.disabled = game.gold < game.workerUpgradeCost;
}

// Game Loop
function gameLoop() {
    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000;
    game.lastUpdate = now;
    
    // Passive income
    if (game.workers > 0) {
        game.gold += game.goldPerSecond * delta;
        updateUI();
    }
    
    saveGame();
    requestAnimationFrame(gameLoop);
}

// Event Listeners
function setupEventListeners() {
    // Mine Gold
    elements.mineGold.addEventListener('click', () => {
        game.gold += game.goldPerClick;
        elements.mineGold.textContent = '⛏️ Mining...';
        setTimeout(() => {
            elements.mineGold.textContent = '⛏️ Mine Gold';
        }, 200);
        updateUI();
    });
    
    // Hire Worker
    elements.hireWorker.addEventListener('click', () => {
        if (game.gold >= game.workerCost) {
            game.gold -= game.workerCost;
            game.workers++;
            game.goldPerSecond = game.workers * game.workerEfficiency;
            game.workerCost = Math.floor(game.workerCost * 1.5);
            updateUI();
        }
    });
    
    // Upgrade Pickaxe
    elements.upgradePickaxe.addEventListener('click', () => {
        if (game.gold >= game.pickaxeCost) {
            game.gold -= game.pickaxeCost;
            game.goldPerClick++;
            game.pickaxeLevel++;
            game.pickaxeCost = Math.floor(game.pickaxeCost * 2);
            updateUI();
        }
    });
    
    // Upgrade Worker
    elements.upgradeWorker.addEventListener('click', () => {
        if (game.gold >= game.workerUpgradeCost) {
            game.gold -= game.workerUpgradeCost;
            game.workerEfficiency++;
            game.goldPerSecond = game.workers * game.workerEfficiency;
            game.workerUpgradeCost = Math.floor(game.workerUpgradeCost * 2.5);
            updateUI();
        }
    });
}

// Start the game
init();
