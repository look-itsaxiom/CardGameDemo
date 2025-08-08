import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameEngine, GameEngineConfig } from '../../engine/GameEngine';
import { GameState, Position, PlayerId, Card } from '../../types';
import { allPlayers, allDecks } from '../../data/players';
import { cardDatabase } from '../../engine/CardDatabaseService';

/**
 * Enhanced Interactive Game Board
 * Demonstrates actual card game functionality with engine integration
 */
export class InteractiveGameBoard extends Scene {
    private gameEngine!: GameEngine;
    private gameState!: GameState;
    
    // UI Elements
    private gameInfoPanel!: Phaser.GameObjects.Container;
    private handPanel!: Phaser.GameObjects.Container;
    private boardContainer!: Phaser.GameObjects.Container;
    
    // Game state displays
    private gameInfoText!: Phaser.GameObjects.Text;
    private phaseText!: Phaser.GameObjects.Text;
    private instructionText!: Phaser.GameObjects.Text;
    
    // Board
    private gridCells: Phaser.GameObjects.Rectangle[][] = [];
    private readonly BOARD_WIDTH = 12;
    private readonly BOARD_HEIGHT = 14;
    private readonly CELL_SIZE = 35;
    private readonly BOARD_X = 300;
    private readonly BOARD_Y = 150;

    constructor() {
        super('InteractiveGameBoard');
    }

    create() {
        console.log('InteractiveGameBoard: Starting enhanced card game...');
        
        try {
            this.initializeGameEngine();
            this.createInterface();
            this.setupControls();
            this.updateDisplay();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game engine');
        }
        
        EventBus.emit('current-scene-ready', this);
    }

    private initializeGameEngine(): void {
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
        
        console.log('Game engine initialized successfully');
        console.log('Initial game state:', this.gameState);
    }

    private createInterface(): void {
        // Background
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a2e);
        
        // Title
        this.add.text(512, 30, 'Interactive Tactical Card Game', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        
        this.createGameBoard();
        this.createInfoPanel();
        this.createHandPanel();
        this.createControlsHelp();
    }

    private createGameBoard(): void {
        this.boardContainer = this.add.container(this.BOARD_X, this.BOARD_Y);
        
        // Initialize grid
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            this.gridCells[x] = [];
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                const cellX = x * this.CELL_SIZE + this.CELL_SIZE / 2;
                const cellY = y * this.CELL_SIZE + this.CELL_SIZE / 2;
                
                let color = 0x555555; // Neutral
                if (y >= this.BOARD_HEIGHT - 3) color = 0x4a90e2; // Player A
                else if (y < 3) color = 0xe74c3c; // Player B
                
                const cell = this.add.rectangle(cellX, cellY, this.CELL_SIZE - 2, this.CELL_SIZE - 2, color, 0.6);
                cell.setStrokeStyle(1, 0x333333);
                cell.setInteractive();
                cell.setData('gridPos', { x, y });
                
                // Add hover effects
                cell.on('pointerover', () => {
                    cell.setFillStyle(color, 0.8);
                    this.showCellInfo(x, y);
                });
                
                cell.on('pointerout', () => {
                    cell.setFillStyle(color, 0.6);
                });
                
                cell.on('pointerdown', () => {
                    this.onCellClick(x, y);
                });
                
                this.gridCells[x][y] = cell;
                this.boardContainer.add(cell);
            }
        }
        
        // Board labels
        this.add.text(this.BOARD_X - 80, this.BOARD_Y + this.BOARD_HEIGHT * this.CELL_SIZE / 2, 'BATTLEFIELD\n12x14 Grid', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#cccccc',
            align: 'center',
        }).setOrigin(0.5);
    }

    private createInfoPanel(): void {
        this.gameInfoPanel = this.add.container(150, 120);
        
        // Background for info panel
        const infoBg = this.add.rectangle(0, 0, 220, 200, 0x2c3e50, 0.9);
        infoBg.setStrokeStyle(2, 0x34495e);
        
        this.gameInfoText = this.add.text(-100, -80, '', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#ffffff',
        });
        
        this.phaseText = this.add.text(-100, -40, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#f39c12',
            fontStyle: 'bold',
        });
        
        this.gameInfoPanel.add([infoBg, this.gameInfoText, this.phaseText]);
    }

    private createHandPanel(): void {
        this.handPanel = this.add.container(512, 650);
        
        // Hand background
        const handBg = this.add.rectangle(0, 0, 800, 100, 0x2c3e50, 0.8);
        handBg.setStrokeStyle(2, 0x34495e);
        
        const handLabel = this.add.text(-380, -40, 'Your Hand:', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            fontStyle: 'bold',
        });
        
        this.handPanel.add([handBg, handLabel]);
    }

    private createControlsHelp(): void {
        this.instructionText = this.add.text(750, 150, '', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#bdc3c7',
            align: 'left',
        });
        
        const controlsText = `CONTROLS:
SPACE - Next Phase
H - Show Game State
R - Reset Game
ESC - Clear Selection

GAME INFO:
Click cells to inspect
Hover for details`;
        
        this.add.text(750, 300, controlsText, {
            fontFamily: 'Arial',
            fontSize: 11,
            color: '#7f8c8d',
            align: 'left',
        });
    }

    private setupControls(): void {
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.advancePhase();
        });
        
        this.input.keyboard?.on('keydown-H', () => {
            this.showGameState();
        });
        
        this.input.keyboard?.on('keydown-R', () => {
            this.resetGame();
        });
        
        this.input.keyboard?.on('keydown-ESC', () => {
            this.clearSelection();
        });
    }

    private updateDisplay(): void {
        this.updateGameInfo();
        this.updateHand();
        this.updateInstructions();
    }

    private updateGameInfo(): void {
        const state = this.gameState;
        const activePlayer = state.activePlayer;
        const playerState = state.players[activePlayer];
        
        const info = `Turn: ${state.turn}
Active: ${activePlayer}
VP: ${playerState?.victoryPoints || 0}
Hand: ${playerState?.hand.length || 0} cards
Deck: ${playerState?.mainDeck.length || 0} cards
Units: ${Object.keys(playerState?.unitsInPlay || {}).length}`;
        
        this.gameInfoText.setText(info);
        this.phaseText.setText(`Phase: ${state.phase.toUpperCase()}`);
    }

    private updateHand(): void {
        // Clear existing hand display
        this.handPanel.list.slice(2).forEach((child: any) => child.destroy());
        
        const activePlayer = this.gameState.activePlayer;
        const playerState = this.gameState.players[activePlayer];
        
        console.log('UpdateHand - activePlayer:', activePlayer);
        console.log('UpdateHand - playerState:', playerState);
        
        if (!playerState) {
            console.log('UpdateHand - No player state found');
            return;
        }
        
        console.log('UpdateHand - Hand cards:', playerState.hand);
        
        // Display hand cards as simple rectangles with names
        playerState.hand.forEach((cardId, index) => {
            console.log(`UpdateHand - Processing card ${index}: ${cardId}`);
            const card = this.gameEngine.getCardManager().getCard(cardId);
            console.log(`UpdateHand - Retrieved card:`, card);
            
            if (!card) {
                console.log(`UpdateHand - Card ${cardId} not found in card manager`);
                
                // Create a placeholder for missing cards
                const cardX = -350 + index * 70;
                const cardY = 0;
                
                const cardRect = this.add.rectangle(cardX, cardY, 60, 80, 0x95a5a6, 0.8);
                cardRect.setStrokeStyle(2, 0xffffff);
                
                const cardText = this.add.text(cardX, cardY - 10, 'Missing', {
                    fontFamily: 'Arial',
                    fontSize: 8,
                    color: '#ffffff',
                    align: 'center',
                }).setOrigin(0.5);
                
                const typeText = this.add.text(cardX, cardY + 15, cardId.slice(0, 8), {
                    fontFamily: 'Arial',
                    fontSize: 6,
                    color: '#cccccc',
                }).setOrigin(0.5);
                
                this.handPanel.add([cardRect, cardText, typeText]);
                return;
            }
            
            const cardX = -350 + index * 70;
            const cardY = 0;
            
            // Card background
            const cardRect = this.add.rectangle(cardX, cardY, 60, 80, this.getCardColor(card), 0.8);
            cardRect.setStrokeStyle(2, 0xffffff);
            cardRect.setInteractive();
            
            // Card name
            const cardText = this.add.text(cardX, cardY - 10, card.name, {
                fontFamily: 'Arial',
                fontSize: 8,
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 55 }
            }).setOrigin(0.5);
            
            // Card type
            const typeText = this.add.text(cardX, cardY + 15, card.type, {
                fontFamily: 'Arial',
                fontSize: 6,
                color: '#cccccc',
            }).setOrigin(0.5);
            
            // Add hover effects
            cardRect.on('pointerover', () => {
                cardRect.setScale(1.1);
                this.showCardInfo(card);
            });
            
            cardRect.on('pointerout', () => {
                cardRect.setScale(1.0);
            });
            
            cardRect.on('pointerdown', () => {
                this.onCardClick(card);
            });
            
            this.handPanel.add([cardRect, cardText, typeText]);
        });
        
        console.log('UpdateHand - Finished updating hand display');
    }

    private updateInstructions(): void {
        const phase = this.gameState.phase;
        let instruction = '';
        
        switch (phase) {
            case 'setup':
                instruction = 'Setup Phase\nInitializing game...\nPress SPACE to continue';
                break;
            case 'draw':
                instruction = 'Draw Phase\nDrawing cards...\nPress SPACE to continue';
                break;
            case 'level':
                instruction = 'Level Phase\nUnits gaining levels...\nPress SPACE to continue';
                break;
            case 'action':
                instruction = 'Action Phase\nPlay cards, move units!\nPress SPACE to end turn';
                break;
            case 'end':
                instruction = 'End Phase\nTurn ending...\nPress SPACE to continue';
                break;
            default:
                instruction = 'Press SPACE to start\nH for game state\nR to reset';
        }
        
        this.instructionText.setText(instruction);
    }

    private getCardColor(card: Card): number {
        switch (card.type) {
            case 'summon': return 0x27ae60;
            case 'action': return 0xe67e22;
            case 'building': return 0x8e44ad;
            case 'counter': return 0xe74c3c;
            case 'reaction': return 0xf39c12;
            default: return 0x95a5a6;
        }
    }

    // Event handlers
    private onCellClick(x: number, y: number): void {
        console.log(`Clicked cell (${x}, ${y})`);
        this.showCellInfo(x, y);
    }

    private onCardClick(card: Card): void {
        console.log(`Clicked card: ${card.name}`);
        this.showCardInfo(card);
    }

    private showCellInfo(x: number, y: number): void {
        let territory = 'Neutral';
        if (y >= this.BOARD_HEIGHT - 3) territory = 'Player A Territory';
        else if (y < 3) territory = 'Player B Territory';
        
        this.instructionText.setText(`Cell (${x}, ${y})\n${territory}`);
    }

    private showCardInfo(card: Card): void {
        this.instructionText.setText(`${card.name}\nType: ${card.type}\nCost: ${(card as any).cost || 'N/A'}`);
    }

    private advancePhase(): void {
        try {
            const previousPhase = this.gameState.phase;
            const action = {
                type: 'endPhase',
                playerId: this.gameState.activePlayer,
                parameters: {}
            };
            
            const result = this.gameEngine.processAction(action);
            if (result.success) {
                this.gameState = this.gameEngine.getState();
                this.updateDisplay();
                console.log(`Phase advanced: ${previousPhase} -> ${this.gameState.phase}`);
                
                // Special handling for draw phase
                if (this.gameState.phase === 'draw') {
                    setTimeout(() => {
                        console.log('Auto-advancing from draw phase');
                        this.advancePhase();
                    }, 1000);
                }
            } else {
                console.log('Failed to advance phase:', result.message);
                this.instructionText.setText(`Error: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error advancing phase:', error);
            this.instructionText.setText(`Error: ${error}`);
        }
    }

    private showGameState(): void {
        console.log('Current game state:', this.gameState);
        this.instructionText.setText(`Game State Logged\nCheck console for details`);
    }

    private resetGame(): void {
        console.log('Resetting game...');
        this.scene.restart();
    }

    private clearSelection(): void {
        this.instructionText.setText('Selection cleared');
    }

    private showError(message: string): void {
        this.add.text(512, 384, `ERROR: ${message}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#e74c3c',
            align: 'center',
        }).setOrigin(0.5);
    }
}