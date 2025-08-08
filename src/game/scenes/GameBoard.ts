import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameEngine, GameEngineConfig } from '../../engine/GameEngine';
import { GameState, Position, GameAction, GamePhase, PlayerId } from '../../types';
import { allPlayers, allDecks } from '../../data/players';
import { cardDatabase } from '../../engine/CardDatabaseService';

/**
 * GameBoard Scene - Integrates Phaser visualization with the card game engine
 * Provides a visual representation of the 12x14 game board and game state
 */
export class GameBoard extends Scene {
    private gameEngine!: GameEngine;
    private gameState!: GameState;
    
    // UI Elements
    private boardGrid!: Phaser.GameObjects.Graphics;
    private boardContainer!: Phaser.GameObjects.Container;
    private uiContainer!: Phaser.GameObjects.Container;
    
    // Game State Display
    private gameInfoText!: Phaser.GameObjects.Text;
    private playerAInfo!: Phaser.GameObjects.Text;
    private playerBInfo!: Phaser.GameObjects.Text;
    private phaseText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    
    // Board Configuration
    private readonly BOARD_WIDTH = 12;
    private readonly BOARD_HEIGHT = 14;
    private readonly CELL_SIZE = 40;
    private readonly BOARD_START_X = 50;
    private readonly BOARD_START_Y = 50;
    
    // Visual Elements
    private summonSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private gridHighlights: Phaser.GameObjects.Rectangle[] = [];

    constructor() {
        super('GameBoard');
    }

    create() {
        // Initialize game engine
        this.initializeGameEngine();
        
        // Create UI containers
        this.createContainers();
        
        // Create the game board
        this.createGameBoard();
        
        // Create UI elements
        this.createUI();
        
        // Set up input handling
        this.setupInputHandling();
        
        // Update display
        this.updateDisplay();
        
        EventBus.emit('current-scene-ready', this);
    }

    private initializeGameEngine(): void {
        // Get players and decks from data
        const playerA = allPlayers.find(p => p.id === 'playerA');
        const playerB = allPlayers.find(p => p.id === 'playerB');
        const deckA = allDecks.find(d => d.id === 'playerA_deck1');
        const deckB = allDecks.find(d => d.id === 'playerB_deck1');

        if (!playerA || !playerB || !deckA || !deckB) {
            throw new Error('Could not load player data');
        }

        const config: GameEngineConfig = {
            players: [playerA, playerB],
            playerDecks: {
                [playerA.id]: deckA,
                [playerB.id]: deckB,
            },
            cardDatabase: cardDatabase.getAllCards(),
        };

        this.gameEngine = new GameEngine(config);
        this.gameState = this.gameEngine.getState();
        
        console.log('GameBoard: Game engine initialized');
        console.log('GameBoard: Initial game state:', this.gameState);
    }

    private createContainers(): void {
        // Container for the game board
        this.boardContainer = this.add.container(this.BOARD_START_X, this.BOARD_START_Y);
        
        // Container for UI elements
        this.uiContainer = this.add.container(0, 0);
    }

    private createGameBoard(): void {
        // Create graphics object for the grid
        this.boardGrid = this.add.graphics();
        this.boardContainer.add(this.boardGrid);
        
        this.drawGameGrid();
    }

    private drawGameGrid(): void {
        this.boardGrid.clear();
        
        // Draw grid lines
        this.boardGrid.lineStyle(1, 0x666666, 0.8);
        
        // Vertical lines
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.boardGrid.moveTo(x * this.CELL_SIZE, 0);
            this.boardGrid.lineTo(x * this.CELL_SIZE, this.BOARD_HEIGHT * this.CELL_SIZE);
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.boardGrid.moveTo(0, y * this.CELL_SIZE);
            this.boardGrid.lineTo(this.BOARD_WIDTH * this.CELL_SIZE, y * this.CELL_SIZE);
        }
        
        this.boardGrid.strokePath();
        
        // Draw territory zones
        this.drawTerritoryZones();
    }

    private drawTerritoryZones(): void {
        // Player A territory (bottom 3 rows) - rows 0-2
        this.boardGrid.fillStyle(0x0066cc, 0.1);
        this.boardGrid.fillRect(0, 0, this.BOARD_WIDTH * this.CELL_SIZE, 3 * this.CELL_SIZE);
        
        // Player B territory (top 3 rows) - rows 11-13
        this.boardGrid.fillStyle(0xcc0066, 0.1);
        this.boardGrid.fillRect(0, 11 * this.CELL_SIZE, this.BOARD_WIDTH * this.CELL_SIZE, 3 * this.CELL_SIZE);
        
        // Neutral zone (middle area)
        this.boardGrid.fillStyle(0x666666, 0.05);
        this.boardGrid.fillRect(0, 3 * this.CELL_SIZE, this.BOARD_WIDTH * this.CELL_SIZE, 8 * this.CELL_SIZE);
    }

    private createUI(): void {
        // Game information
        this.gameInfoText = this.add.text(this.BOARD_START_X + this.BOARD_WIDTH * this.CELL_SIZE + 20, 50, '', {
            fontSize: '16px',
            color: '#ffffff'
        });
        this.uiContainer.add(this.gameInfoText);

        // Player A info
        this.playerAInfo = this.add.text(this.BOARD_START_X + this.BOARD_WIDTH * this.CELL_SIZE + 20, 120, '', {
            fontSize: '14px',
            color: '#0066cc'
        });
        this.uiContainer.add(this.playerAInfo);

        // Player B info
        this.playerBInfo = this.add.text(this.BOARD_START_X + this.BOARD_WIDTH * this.CELL_SIZE + 20, 220, '', {
            fontSize: '14px',
            color: '#cc0066'
        });
        this.uiContainer.add(this.playerBInfo);

        // Phase indicator
        this.phaseText = this.add.text(this.BOARD_START_X + this.BOARD_WIDTH * this.CELL_SIZE + 20, 320, '', {
            fontSize: '18px',
            color: '#ffff00'
        });
        this.uiContainer.add(this.phaseText);

        // Instructions
        this.instructionText = this.add.text(20, this.BOARD_START_Y + this.BOARD_HEIGHT * this.CELL_SIZE + 20, '', {
            fontSize: '12px',
            color: '#cccccc',
            wordWrap: { width: 700 }
        });
        this.uiContainer.add(this.instructionText);
    }

    private setupInputHandling(): void {
        // Make the board interactive
        const boardInteractiveZone = this.add.rectangle(
            this.BOARD_START_X + (this.BOARD_WIDTH * this.CELL_SIZE) / 2,
            this.BOARD_START_Y + (this.BOARD_HEIGHT * this.CELL_SIZE) / 2,
            this.BOARD_WIDTH * this.CELL_SIZE,
            this.BOARD_HEIGHT * this.CELL_SIZE,
            0x000000,
            0
        );
        boardInteractiveZone.setInteractive();

        // Handle clicks on the board
        boardInteractiveZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleBoardClick(pointer);
        });

        // Add keyboard controls
        this.input.keyboard!.on('keydown-SPACE', () => {
            this.handleEndPhase();
        });

        this.input.keyboard!.on('keydown-S', () => {
            this.handleSummonSlot();
        });
    }

    private handleBoardClick(pointer: Phaser.Input.Pointer): void {
        // Convert screen coordinates to board coordinates
        const boardX = Math.floor((pointer.x - this.BOARD_START_X) / this.CELL_SIZE);
        const boardY = Math.floor((pointer.y - this.BOARD_START_Y) / this.CELL_SIZE);

        // Validate coordinates
        if (boardX < 0 || boardX >= this.BOARD_WIDTH || boardY < 0 || boardY >= this.BOARD_HEIGHT) {
            return;
        }

        const position: Position = { x: boardX, y: boardY };
        console.log(`GameBoard: Clicked on position (${boardX}, ${boardY})`);

        // Handle based on current game phase
        if (this.gameState.currentPhase === GamePhase.ACTION) {
            this.handleActionPhaseClick(position);
        }
    }

    private handleActionPhaseClick(position: Position): void {
        const currentPlayer = this.gameState.activePlayer;
        
        // For now, just try to place a summon if we haven't used our turn summon
        const turnSummonUsed = this.gameState.turnState?.turnSummonUsed || false;
        if (!turnSummonUsed) {
            this.attemptSummonPlacement(currentPlayer, position);
        } else {
            this.showMessage(`Turn summon already used this turn. Try moving a unit or ending the phase.`);
        }
    }

    private attemptSummonPlacement(playerId: PlayerId, position: Position): void {
        // Check if position is in player's territory
        const isValidTerritory = this.isValidTerritoryForPlayer(playerId, position);
        
        if (!isValidTerritory) {
            this.showMessage(`Cannot place summon outside your territory!`);
            return;
        }

        // Get first available summon slot
        const playerHand = this.gameState.players[playerId].hand;
        const summonCards = playerHand.filter(cardId => {
            const card = this.gameEngine.getConfig().cardDatabase[cardId];
            return card && card.type === 'summon';
        });

        if (summonCards.length === 0) {
            this.showMessage(`No summon cards available in hand!`);
            return;
        }

        // Try to place the first summon card
        const summonCardId = summonCards[0];
        const action: GameAction = {
            type: 'playSummon',
            playerId: playerId,
            cardId: summonCardId,
            targetPosition: position
        };

        const result = this.gameEngine.processAction(action);
        
        if (result.success) {
            this.showMessage(`Summon placed at (${position.x}, ${position.y})!`);
            this.updateDisplay();
        } else {
            this.showMessage(`Failed to place summon: ${result.message}`);
        }
    }

    private isValidTerritoryForPlayer(playerId: PlayerId, position: Position): boolean {
        if (playerId === 'playerA') {
            // Player A controls bottom 3 rows (y: 0-2)
            return position.y >= 0 && position.y <= 2;
        } else if (playerId === 'playerB') {
            // Player B controls top 3 rows (y: 11-13)
            return position.y >= 11 && position.y <= 13;
        }
        return false;
    }

    private handleEndPhase(): void {
        const action: GameAction = {
            type: 'endPhase',
            playerId: this.gameState.activePlayer
        };

        const result = this.gameEngine.processAction(action);
        
        if (result.success) {
            this.showMessage(`Phase ended. ${result.message}`);
            this.updateDisplay();
        } else {
            this.showMessage(`Failed to end phase: ${result.message}`);
        }
    }

    private handleSummonSlot(): void {
        // Show available summon slots
        const currentPlayer = this.gameState.activePlayer;
        const playerHand = this.gameState.players[currentPlayer].hand;
        const summonCards = playerHand.filter(cardId => {
            const card = this.gameEngine.getConfig().cardDatabase[cardId];
            return card && card.type === 'summon';
        });

        this.showMessage(`Available summon cards: ${summonCards.length}. Click on the board to place.`);
    }

    private updateDisplay(): void {
        // Refresh game state
        this.gameState = this.gameEngine.getState();
        
        // Update game info
        this.updateGameInfo();
        
        // Update player info
        this.updatePlayerInfo();
        
        // Update phase display
        this.updatePhaseDisplay();
        
        // Update board visuals
        this.updateBoardVisuals();
        
        // Update instructions
        this.updateInstructions();
    }

    private updateGameInfo(): void {
        const text = `Turn: ${this.gameState.turnNumber}\nActive Player: ${this.gameState.activePlayer}`;
        this.gameInfoText.setText(text);
    }

    private updatePlayerInfo(): void {
        // Player A info
        const playerA = this.gameState.players.playerA;
        if (playerA) {
            const playerAText = `Player A:\nVP: ${playerA.victoryPoints}\nHand: ${playerA.hand.length}\nDeck: ${playerA.mainDeck.length}\nUnits: ${Object.keys(playerA.summonUnits).length}`;
            this.playerAInfo.setText(playerAText);
        }

        // Player B info  
        const playerB = this.gameState.players.playerB;
        if (playerB) {
            const playerBText = `Player B:\nVP: ${playerB.victoryPoints}\nHand: ${playerB.hand.length}\nDeck: ${playerB.mainDeck.length}\nUnits: ${Object.keys(playerB.summonUnits).length}`;
            this.playerBInfo.setText(playerBText);
        }
    }

    private updatePhaseDisplay(): void {
        const phase = this.gameState.currentPhase || this.gameState.phase || 'UNKNOWN';
        const phaseText = `Phase: ${phase.toString().toUpperCase()}`;
        this.phaseText.setText(phaseText);
    }

    private updateBoardVisuals(): void {
        // Clear existing summon sprites
        this.summonSprites.forEach(sprite => sprite.destroy());
        this.summonSprites.clear();

        // Place summons on board
        Object.values(this.gameState.players).forEach(player => {
            Object.values(player.summonUnits).forEach(unit => {
                this.createSummonSprite(unit.id, unit.position, unit.controlledBy);
            });
        });
    }

    private createSummonSprite(unitId: string, position: Position, playerId: PlayerId): void {
        // Create a simple colored rectangle for the summon
        const color = playerId === 'playerA' ? 0x0066cc : 0xcc0066;
        
        const sprite = this.add.rectangle(
            this.BOARD_START_X + position.x * this.CELL_SIZE + this.CELL_SIZE / 2,
            this.BOARD_START_Y + position.y * this.CELL_SIZE + this.CELL_SIZE / 2,
            this.CELL_SIZE - 4,
            this.CELL_SIZE - 4,
            color
        );

        // Add unit ID text
        const text = this.add.text(
            sprite.x,
            sprite.y,
            unitId.substring(0, 3),
            {
                fontSize: '10px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.boardContainer.add(sprite);
        this.boardContainer.add(text);
        
        this.summonSprites.set(unitId, sprite);
    }

    private updateInstructions(): void {
        let instructions = '';
        
        const currentPhase = this.gameState.currentPhase || this.gameState.phase || 'unknown';
        
        if (currentPhase === GamePhase.ACTION || currentPhase === 'action') {
            if (!this.gameState.turnState?.turnSummonUsed) {
                instructions = 'ACTION PHASE: Click on your territory to place a summon. Press SPACE to end phase.';
            } else {
                instructions = 'ACTION PHASE: Turn summon used. Move units or use cards. Press SPACE to end phase.';
            }
        } else {
            instructions = `${currentPhase.toString().toUpperCase()} PHASE: Press SPACE to continue.`;
        }
        
        instructions += '\n\nControls:\n- Click: Place summon or target\n- SPACE: End phase\n- S: Show summon slots';
        
        this.instructionText.setText(instructions);
    }

    private showMessage(message: string): void {
        console.log(`GameBoard: ${message}`);
        
        // Show temporary message on screen
        const messageText = this.add.text(400, 300, message, {
            fontSize: '16px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Auto-remove after 3 seconds
        this.time.delayedCall(3000, () => {
            messageText.destroy();
        });
    }

    changeScene(): void {
        this.scene.start('GameOver');
    }
}