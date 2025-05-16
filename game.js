// Game State
const game = {
    // Original properties
    gold: 0,
    goldPerClick: 1,
    goldPerSecond: 0,
    workers: 0,
    workerCost: 10,
    workerEfficiency: 1,
    workerUpgradeCost: 100,
    pickaxeLevel: 1,
    pickaxeCost: 50,
    lastUpdate: Date.now(),
    prestigeTokens: 0,
    prestigeMultipliers: {
        globalGain: 1.0,
        workerSpeed: 1.0,
        clickMulti: 1.0
    },
    prestigeUpgradeCosts: {
        globalGain: 1,
        workerSpeed: 2,
        clickMulti: 3
    },

    // Automated Drill System
    drills: 0,
    drillCost: 500,
    drillOutput: 5,
    drillEfficiency: 1,

    // Treasure Chest System
    chests: 0,
    chestCooldown: 0,
    chestCost: 250,
    chestReward: 100
};

// DOM Elements
const elements = {
    // Original elements
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
    upgradeWorker: document.getElementById('upgradeWorker'),
    prestigeTokens: document.getElementById('prestigeTokens'),
    nextPrestigeTokens: document.getElementById('nextPrestigeTokens'),
    prestigeButton: document.getElementById('prestigeButton'),
    upgradeGlobalGain: document.getElementById('upgradeGlobalGain'),
    upgradeWorkerSpeed: document.getElementById('upgradeWorkerSpeed'),
    upgradeClickMulti: document.getElementById('upgradeClickMulti'),
    globalGainCost: document.getElementById('globalGainCost'),
    workerSpeedCost: document.getElementById('workerSpeedCost'),
    clickMultiCost: document.getElementById('clickMultiCost'),

    // Drill Elements
    drills: document.getElementById('drills'),
    drillOutput: document.getElementById('drillOutput'),
    drillCost: document.getElementById('drillCost'),
    buyDrill: document.getElementById('buyDrill'),

    // Chest Elements
    chests: document.getElementById('chests'),
    chestTimer: document.getElementById('chestTimer'),
    chestCost: document.getElementById('chestCost'),
    buyChest: document.getElementById('buyChest'),
    openChest: document.getElementById('openChest')
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
            if (parsed.drills) {
                parsed.gold += parsed.drills * parsed.drillOutput * parsed.drillEfficiency * seconds;
            }
            if (parsed.chestCooldown > 0) {
                parsed.chestCooldown = Math.max(0, parsed.chestCooldown - seconds);
            }
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
    // Original UI
    elements.gold.textContent = Math.floor(game.gold);
    elements.goldPerClick.textContent = (game.goldPerClick * game.prestigeMultipliers.clickMulti * game.prestigeMultipliers.globalGain).toFixed(1);
    elements.goldPerSecond.textContent = (game.goldPerSecond * game.prestigeMultipliers.globalGain * game.prestigeMultipliers.workerSpeed).toFixed(1);
    elements.workers.textContent = game.workers;
    elements.workerCost.textContent = game.workerCost;
    elements.workerEfficiency.textContent = game.workerEfficiency;
    elements.workerUpgradeCost.textContent = game.workerUpgradeCost;
    elements.pickaxeLevel.textContent = game.pickaxeLevel;
    elements.pickaxeCost.textContent = game.pickaxeCost;
    elements.prestigeTokens.textContent = game.prestigeTokens;
    elements.nextPrestigeTokens.textContent = calculatePrestigeTokens();
    elements.globalGainCost.textContent = game.prestigeUpgradeCosts.globalGain;
    elements.workerSpeedCost.textContent = game.prestigeUpgradeCosts.workerSpeed;
    elements.clickMultiCost.textContent = game.prestigeUpgradeCosts.clickMulti;

    // Drill UI
    elements.drills.textContent = game.drills;
    elements.drillOutput.textContent = (game.drillOutput * game.drillEfficiency).toFixed(1);
    elements.drillCost.textContent = game.drillCost;
    elements.buyDrill.disabled = game.gold < game.drillCost;

    // Chest UI
    elements.chests.textContent = game.chests;
    elements.chestCost.textContent = game.chestCost;
    elements.buyChest.disabled = game.gold < game.chestCost;
    elements.openChest.disabled = game.chests < 1 || game.chestCooldown > 0;
    elements.chestTimer.textContent = game.chestCooldown > 0 ? `${Math.ceil(game.chestCooldown)}s` : "Ready!";
}

// Game Loop
function gameLoop() {
    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000;
    game.lastUpdate = now;
    
    // Original passive income
    if (game.workers > 0) {
        game.gold += game.goldPerSecond * delta * game.prestigeMultipliers.globalGain * game.prestigeMultipliers.workerSpeed;
    }

    // Drill income
    if (game.drills > 0) {
        game.gold += game.drills * game.drillOutput * game.drillEfficiency * delta * game.prestigeMultipliers.globalGain;
    }

    // Chest cooldown
    if (game.chestCooldown > 0) {
        game.chestCooldown -= delta;
        if (game.chestCooldown <= 0) {
            game.chestCooldown = 0;
        }
    }

    updateUI();
    saveGame();
    requestAnimationFrame(gameLoop);
}

// Drill System
function buyDrill() {
    if (game.gold >= game.drillCost) {
        game.gold -= game.drillCost;
        game.drills++;
        game.drillCost = Math.floor(game.drillCost * 1.8);
        updateUI();
    }
}

// Chest System
function buyChest() {
    if (game.gold >= game.chestCost) {
        game.gold -= game.chestCost;
        game.chests++;
        game.chestCost = Math.floor(game.chestCost * 1.5);
        updateUI();
    }
}

function openChest() {
    if (game.chests > 0 && game.chestCooldown <= 0) {
        game.chests--;
        const reward = game.chestReward * game.prestigeMultipliers.globalGain;
        game.gold += reward;
        game.chestCooldown = 5; // 5 second cooldown
        showChestReward(reward);
        updateUI();
    }
}

function showChestReward(reward) {
    const rewardElement = document.createElement('div');
    rewardElement.textContent = `+${Math.floor(reward)} Gold!`;
    rewardElement.style.position = 'absolute';
    rewardElement.style.color = 'gold';
    rewardElement.style.fontWeight = 'bold';
    rewardElement.style.animation = 'floatUp 1.5s forwards';
    rewardElement.style.pointerEvents = 'none';
    rewardElement.style.zIndex = '1000';
    
    // Position near chest button
    const chestBtn = elements.openChest.getBoundingClientRect();
    rewardElement.style.left = `${chestBtn.left + (chestBtn.width / 2) - 50}px`;
    rewardElement.style.top = `${chestBtn.top - 20}px`;
    
    document.body.appendChild(rewardElement);
    setTimeout(() => rewardElement.remove(), 1500);
}

// Prestige System
function calculatePrestigeTokens() {
    const goldValue = Math.sqrt(game.gold / 100000);
    const workerValue = Math.sqrt(game.workers / 10);
    const pickaxeValue = Math.sqrt(game.pickaxeLevel / 5);
    const drillValue = Math.sqrt(game.drills / 3);
    return Math.floor(goldValue + workerValue + pickaxeValue + drillValue);
}

function performPrestige() {
    const earnedTokens = calculatePrestigeTokens();
    if (earnedTokens < 1) return;

    game.prestigeTokens += earnedTokens;
    
    // Store multipliers and costs
    const multipliers = {...game.prestigeMultipliers};
    const upgradeCosts = {...game.prestigeUpgradeCosts};
    
    // Reset game state
    Object.assign(game, {
        gold: 0,
        goldPerClick: 1,
        goldPerSecond: 0,
        workers: 0,
        workerCost: 10,
        workerEfficiency: 1,
        workerUpgradeCost: 100,
        pickaxeLevel: 1,
        pickaxeCost: 50,
        drills: 0,
        drillCost: 500,
        chests: 0,
        chestCooldown: 0,
        lastUpdate: Date.now(),
        prestigeMultipliers: multipliers,
        prestigeUpgradeCosts: upgradeCosts
    });
    
    showPrestigeEffect(earnedTokens);
    updateUI();
}

function showPrestigeEffect(tokensEarned) {
    const effect = document.createElement('div');
    effect.style.position = 'fixed';
    effect.style.top = '50%';
    effect.style.left = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.fontSize = '24px';
    effect.style.fontWeight = 'bold';
    effect.style.color = '#9c64ff';
    effect.style.textShadow = '0 0 10px #6a0dad';
    effect.style.zIndex = '1000';
    effect.style.animation = 'fadeOut 2s forwards';
    effect.textContent = `+${tokensEarned} Prestige Tokens!`;
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 2000);
}

// Event Listeners
function setupEventListeners() {
    // Mine Gold
    elements.mineGold.addEventListener('click', () => {
        game.gold += game.goldPerClick * game.prestigeMultipliers.clickMulti * game.prestigeMultipliers.globalGain;
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
            game.goldPerClick += 1;
            game.pickaxeLevel++;
            game.pickaxeCost = Math.floor(game.pickaxeCost * 2);
            updateUI();
        }
    });
    
    // Upgrade Worker
    elements.upgradeWorker.addEventListener('click', () => {
        if (game.gold >= game.workerUpgradeCost) {
            game.gold -= game.workerUpgradeCost;
            game.workerEfficiency += 1;
            game.goldPerSecond = game.workers * game.workerEfficiency;
            game.workerUpgradeCost = Math.floor(game.workerUpgradeCost * 2.5);
            updateUI();
        }
    });
    
    // Buy Drill
    elements.buyDrill.addEventListener('click', buyDrill);
    
    // Buy Chest
    elements.buyChest.addEventListener('click', buyChest);
    
    // Open Chest
    elements.openChest.addEventListener('click', openChest);
    
    // Prestige Reset
    elements.prestigeButton.addEventListener('click', () => {
        const tokens = calculatePrestigeTokens();
        if (tokens > 0) {
            if (confirm(`Ascend to deeper mines and reset your progress?\n\nYou will gain ${tokens} prestige tokens!\n\nAll progress will reset but you keep prestige upgrades.`)) {
                performPrestige();
            }
        } else {
            alert("You need more progress to earn prestige tokens!");
        }
    });
    
    // Prestige Upgrades
    elements.upgradeGlobalGain.addEventListener('click', () => {
        if (game.prestigeTokens >= game.prestigeUpgradeCosts.globalGain) {
            game.prestigeTokens -= game.prestigeUpgradeCosts.globalGain;
            game.prestigeMultipliers.globalGain += 0.1;
            game.prestigeUpgradeCosts.globalGain = Math.ceil(game.prestigeUpgradeCosts.globalGain * 1.5);
            updateUI();
        }
    });
    
    elements.upgradeWorkerSpeed.addEventListener('click', () => {
        if (game.prestigeTokens >= game.prestigeUpgradeCosts.workerSpeed) {
            game.prestigeTokens -= game.prestigeUpgradeCosts.workerSpeed;
            game.prestigeMultipliers.workerSpeed += 0.15;
            game.prestigeUpgradeCosts.workerSpeed = Math.ceil(game.prestigeUpgradeCosts.workerSpeed * 1.5);
            updateUI();
        }
    });
    
    elements.upgradeClickMulti.addEventListener('click', () => {
        if (game.prestigeTokens >= game.prestigeUpgradeCosts.clickMulti) {
            game.prestigeTokens -= game.prestigeUpgradeCosts.clickMulti;
            game.prestigeMultipliers.clickMulti += 0.2;
            game.prestigeUpgradeCosts.clickMulti = Math.ceil(game.prestigeUpgradeCosts.clickMulti * 1.5);
            updateUI();
        }
    });
}

// Start the game
init();
