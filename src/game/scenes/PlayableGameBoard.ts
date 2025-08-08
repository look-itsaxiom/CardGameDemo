import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameEngine, GameEngineConfig } from '../../engine/GameEngine';
import { 
    GameState, 
    Position, 
    GameAction, 
    GamePhase, 
    PlayerId, 
    Card,
    SummonCard,
    ActionCard,
    SummonUnit,
    PlayCardAction,
    MoveUnitAction,
    AttackAction,
    EndPhaseAction
} from '../../types';
import { allPlayers, allDecks } from '../../data/players';
import { cardDatabase } from '../../engine/CardDatabaseService';

/**
 * Fully Playable GameBoard Scene
 * Complete tactical card game implementation with visual UI
 */
export class PlayableGameBoard extends Scene {
    private gameEngine!: GameEngine;
    private gameState!: GameState;
    
    // Visual containers
    private boardContainer!: Phaser.GameObjects.Container;
    private uiContainer!: Phaser.GameObjects.Container;
    private handContainer!: Phaser.GameObjects.Container;
    private infoContainer!: Phaser.GameObjects.Container;
    
    // Board elements
    private boardGrid!: Phaser.GameObjects.Graphics;
    private gridCells: Phaser.GameObjects.Rectangle[][] = [];
    
    // Game state displays
    private turnText!: Phaser.GameObjects.Text;
    private phaseText!: Phaser.GameObjects.Text;
    private playerAInfo!: Phaser.GameObjects.Text;
    private playerBInfo!: Phaser.GameObjects.Text;
    private actionText!: Phaser.GameObjects.Text;
    
    // Player hand
    private handCards: Phaser.GameObjects.Container[] = [];
    
    // Board units
    private unitSprites: Map<string, Phaser.GameObjects.Container> = new Map();
    
    // Interaction state
    private selectedCard: Card | null = null;
    private selectedUnit: SummonUnit | null = null;
    private targetingMode: 'none' | 'position' | 'unit' = 'none';
    private validTargets: Position[] = [];
    
    // Configuration
    private readonly BOARD_WIDTH = 12;
    private readonly BOARD_HEIGHT = 14;
    private readonly CELL_SIZE = 45;
    private readonly BOARD_START_X = 50;
    private readonly BOARD_START_Y = 100;
    
    private readonly HAND_Y = 650;
    private readonly CARD_WIDTH = 60;
    private readonly CARD_HEIGHT = 80;

    constructor() {
        super('PlayableGameBoard');
    }

    create() {
        console.log('PlayableGameBoard: Starting playable card game...');
        
        // Initialize game engine
        this.initializeGameEngine();
        
        // Create visual elements
        this.createContainers();
        this.createBackground();
        this.createGameBoard();
        this.createUI();
        this.createHandArea();
        
        // Setup interactions
        this.setupInputHandling();
        
        // Initial update
        this.updateDisplay();
        
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
        
        console.log('PlayableGameBoard: Game engine initialized');
        console.log('PlayableGameBoard: Game state:', this.gameState);
    }

    private createContainers(): void {
        this.boardContainer = this.add.container(this.BOARD_START_X, this.BOARD_START_Y);
        this.uiContainer = this.add.container(0, 0);
        this.handContainer = this.add.container(0, this.HAND_Y);
        this.infoContainer = this.add.container(600, 50);
    }

    private createBackground(): void {
        // Dark tactical background
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a2e).setDepth(-10);
        
        // Game title
        this.add.text(512, 30, 'Tactical Card Game Arena', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(1000);
    }

    private createGameBoard(): void {
        // Create grid graphics
        this.boardGrid = this.add.graphics();
        this.boardContainer.add(this.boardGrid);
        
        // Initialize grid cells array
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            this.gridCells[x] = [];
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                // Create clickable cell
                const cell = this.add.rectangle(
                    x * this.CELL_SIZE + this.CELL_SIZE / 2,
                    y * this.CELL_SIZE + this.CELL_SIZE / 2,
                    this.CELL_SIZE - 2,
                    this.CELL_SIZE - 2,
                    this.getCellColor(x, y),
                    0.3
                );
                
                cell.setStrokeStyle(1, 0x444444);
                cell.setInteractive();
                cell.setData('position', { x, y });
                
                // Add click handler
                cell.on('pointerdown', () => this.onCellClick({ x, y }));
                cell.on('pointerover', () => this.onCellHover({ x, y }));
                cell.on('pointerout', () => this.onCellOut({ x, y }));
                
                this.gridCells[x][y] = cell;
                this.boardContainer.add(cell);
            }
        }
        
        this.drawGridLines();
    }

    private getCellColor(x: number, y: number): number {
        // Player A territory (bottom 3 rows)
        if (y >= this.BOARD_HEIGHT - 3) return 0x4a90e2;
        // Player B territory (top 3 rows)  
        if (y < 3) return 0xe74c3c;
        // Neutral territory
        return 0x7f8c8d;
    }

    private drawGridLines(): void {
        this.boardGrid.clear();
        this.boardGrid.lineStyle(1, 0x555555, 0.5);
        
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
    }

    private createUI(): void {
        // Turn and phase info
        this.turnText = this.add.text(20, 60, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
        }).setDepth(100);

        this.phaseText = this.add.text(20, 85, '', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
        }).setDepth(100);

        // Player info panels
        this.playerAInfo = this.add.text(600, 80, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#4a90e2',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
        }).setDepth(100);

        this.playerBInfo = this.add.text(600, 150, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#e74c3c',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
        }).setDepth(100);

        // Action feedback
        this.actionText = this.add.text(512, 600, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
            align: 'center',
        }).setOrigin(0.5).setDepth(200);

        // Control instructions
        this.add.text(20, 720, 'Controls: Click cards to select • Click board to play/move • SPACE = End Phase • H = Help', {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#cccccc',
        }).setDepth(100);
    }

    private createHandArea(): void {
        // Hand background
        this.add.rectangle(512, this.HAND_Y + 40, 1024, 120, 0x2c3e50, 0.8).setDepth(50);
        
        // Hand title
        this.add.text(50, this.HAND_Y - 20, 'Your Hand:', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
        }).setDepth(100);
    }

    private setupInputHandling(): void {
        // Keyboard controls
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.endPhase();
        });

        this.input.keyboard?.on('keydown-H', () => {
            this.showHelp();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.clearSelection();
        });
    }

    private updateDisplay(): void {
        this.updateGameInfo();
        this.updatePlayerInfo();
        this.updateHand();
        this.updateUnits();
        this.clearHighlights();
    }

    private updateGameInfo(): void {
        const currentPlayer = this.gameState.activePlayer;
        this.turnText.setText(`Turn: ${this.gameState.turn} | Active: ${currentPlayer}`);
        this.phaseText.setText(`Phase: ${this.gameState.phase}`);
        
        // Phase-specific instructions
        let instruction = '';
        switch (this.gameState.phase) {
            case GamePhase.SETUP:
                instruction = 'Setup Phase: Game starting...';
                break;
            case GamePhase.DRAW:
                instruction = 'Draw Phase: Drawing cards...';
                break;
            case GamePhase.LEVEL:
                instruction = 'Level Phase: Units gaining levels...';
                break;
            case GamePhase.ACTION:
                instruction = 'Action Phase: Play cards, move units, attack!';
                break;
            case GamePhase.END:
                instruction = 'End Phase: Turn ending...';
                break;
        }
        
        this.actionText.setText(instruction);
    }

    private updatePlayerInfo(): void {
        const playerAState = this.gameState.players['playerA'];
        const playerBState = this.gameState.players['playerB'];
        
        if (playerAState) {
            this.playerAInfo.setText(
                `Player A (Blue)\n` +
                `VP: ${playerAState.victoryPoints}\n` +
                `Hand: ${playerAState.hand.length}\n` +
                `Deck: ${playerAState.mainDeck.length}\n` +
                `Units: ${Object.keys(playerAState.unitsInPlay).length}`
            );
        }
        
        if (playerBState) {
            this.playerBInfo.setText(
                `Player B (Red)\n` +
                `VP: ${playerBState.victoryPoints}\n` +
                `Hand: ${playerBState.hand.length}\n` +
                `Deck: ${playerBState.mainDeck.length}\n` +
                `Units: ${Object.keys(playerBState.unitsInPlay).length}`
            );
        }
    }

    private updateHand(): void {
        // Clear existing hand
        this.handCards.forEach(card => card.destroy());
        this.handCards = [];
        
        const currentPlayer = this.gameState.activePlayer;
        const playerState = this.gameState.players[currentPlayer];
        
        if (!playerState) return;
        
        // Create card sprites for hand
        playerState.hand.forEach((cardId, index) => {
            const card = this.gameEngine.getCardManager().getCard(cardId);
            if (!card) return;
            
            const cardSprite = this.createHandCard(card, index);
            this.handCards.push(cardSprite);
            this.handContainer.add(cardSprite);
        });
    }

    private createHandCard(card: Card, index: number): Phaser.GameObjects.Container {
        const container = this.add.container();
        
        const x = 80 + index * (this.CARD_WIDTH + 10);
        const y = 40;
        
        // Card background
        const bg = this.add.rectangle(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 0x34495e);
        bg.setStrokeStyle(2, this.getCardColor(card));
        
        // Card name
        const name = this.add.text(0, -25, card.name, {
            fontFamily: 'Arial',
            fontSize: 10,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.CARD_WIDTH - 4 }
        }).setOrigin(0.5);
        
        // Card cost/type
        const cost = this.add.text(0, 20, card.type, {
            fontFamily: 'Arial',
            fontSize: 8,
            color: '#cccccc',
            align: 'center',
        }).setOrigin(0.5);
        
        container.add([bg, name, cost]);
        container.setPosition(x, y);
        container.setSize(this.CARD_WIDTH, this.CARD_HEIGHT);
        container.setInteractive();
        
        // Card interaction
        container.on('pointerdown', () => this.onCardClick(card));
        container.on('pointerover', () => this.onCardHover(card, container));
        container.on('pointerout', () => this.onCardOut(card, container));
        
        return container;
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

    private updateUnits(): void {
        // Clear existing units
        this.unitSprites.forEach(sprite => sprite.destroy());
        this.unitSprites.clear();
        
        // Draw units for all players
        Object.values(this.gameState.players).forEach(playerState => {
            Object.values(playerState.unitsInPlay).forEach(unit => {
                this.createUnitSprite(unit);
            });
        });
    }

    private createUnitSprite(unit: SummonUnit): void {
        const container = this.add.container();
        
        const x = unit.position.x * this.CELL_SIZE + this.CELL_SIZE / 2;
        const y = unit.position.y * this.CELL_SIZE + this.CELL_SIZE / 2;
        
        // Unit background
        const color = unit.controllingPlayer === 'playerA' ? 0x3498db : 0xe74c3c;
        const bg = this.add.circle(0, 0, 18, color);
        bg.setStrokeStyle(2, 0x000000);
        
        // Unit name
        const name = this.add.text(0, -8, unit.name.slice(0, 3), {
            fontFamily: 'Arial',
            fontSize: 8,
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Unit stats
        const stats = this.add.text(0, 4, `${unit.currentHP}/${unit.stats.maxHP}`, {
            fontFamily: 'Arial',
            fontSize: 6,
            color: '#ffffff',
        }).setOrigin(0.5);
        
        container.add([bg, name, stats]);
        container.setPosition(x, y);
        container.setSize(36, 36);
        container.setInteractive();
        
        // Unit interaction
        container.on('pointerdown', () => this.onUnitClick(unit));
        container.on('pointerover', () => this.onUnitHover(unit, container));
        container.on('pointerout', () => this.onUnitOut(unit, container));
        
        this.boardContainer.add(container);
        this.unitSprites.set(unit.id, container);
    }

    // Event handlers
    private onCardClick(card: Card): void {
        this.selectedCard = card;
        this.selectedUnit = null;
        
        if (card.type === 'summon') {
            this.startTargeting('position');
            this.actionText.setText(`Select position to summon ${card.name}`);
        } else if (card.type === 'action') {
            // For now, just try to play the card
            this.playCard(card);
        }
    }

    private onCardHover(card: Card, container: Phaser.GameObjects.Container): void {
        container.setScale(1.1);
        // TODO: Show card details tooltip
    }

    private onCardOut(card: Card, container: Phaser.GameObjects.Container): void {
        container.setScale(1.0);
    }

    private onUnitClick(unit: SummonUnit): void {
        if (this.targetingMode === 'unit' && this.selectedCard) {
            // Target this unit with selected card
            this.playCardWithTarget(this.selectedCard, unit);
        } else {
            // Select this unit for movement/attack
            this.selectedUnit = unit;
            this.selectedCard = null;
            this.highlightValidMoves(unit);
            this.actionText.setText(`Unit selected: ${unit.name} - Click to move or attack`);
        }
    }

    private onUnitHover(unit: SummonUnit, container: Phaser.GameObjects.Container): void {
        container.setScale(1.2);
        // TODO: Show unit details
    }

    private onUnitOut(unit: SummonUnit, container: Phaser.GameObjects.Container): void {
        container.setScale(1.0);
    }

    private onCellClick(position: Position): void {
        if (this.targetingMode === 'position' && this.selectedCard) {
            this.playCardAtPosition(this.selectedCard, position);
        } else if (this.selectedUnit) {
            this.moveUnit(this.selectedUnit, position);
        }
    }

    private onCellHover(position: Position): void {
        const cell = this.gridCells[position.x][position.y];
        if (this.isValidTarget(position)) {
            cell.setFillStyle(0x00ff00, 0.5);
        }
    }

    private onCellOut(position: Position): void {
        const cell = this.gridCells[position.x][position.y];
        cell.setFillStyle(this.getCellColor(position.x, position.y), 0.3);
    }

    // Game actions
    private playCard(card: Card): void {
        const action: PlayCardAction = {
            type: 'playCard',
            playerId: this.gameState.activePlayer,
            parameters: {
                cardId: card.id
            }
        };
        
        this.executeAction(action);
    }

    private playCardAtPosition(card: Card, position: Position): void {
        const action: PlayCardAction = {
            type: 'playCard',
            playerId: this.gameState.activePlayer,
            parameters: {
                cardId: card.id,
                position
            }
        };
        
        this.executeAction(action);
        this.clearSelection();
    }

    private playCardWithTarget(card: Card, target: SummonUnit): void {
        const action: PlayCardAction = {
            type: 'playCard',
            playerId: this.gameState.activePlayer,
            parameters: {
                cardId: card.id,
                targets: [target.id]
            }
        };
        
        this.executeAction(action);
        this.clearSelection();
    }

    private moveUnit(unit: SummonUnit, position: Position): void {
        const action: MoveUnitAction = {
            type: 'moveUnit',
            playerId: this.gameState.activePlayer,
            parameters: {
                unitId: unit.id,
                targetPosition: position
            }
        };
        
        this.executeAction(action);
        this.clearSelection();
    }

    private endPhase(): void {
        const action: EndPhaseAction = {
            type: 'endPhase',
            playerId: this.gameState.activePlayer,
            parameters: {}
        };
        
        this.executeAction(action);
    }

    private executeAction(action: GameAction): void {
        try {
            const result = this.gameEngine.processAction(action);
            if (result.success) {
                this.gameState = this.gameEngine.getState();
                this.updateDisplay();
                this.actionText.setText(result.message || 'Action successful!');
            } else {
                this.actionText.setText(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            this.actionText.setText(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Utility methods
    private startTargeting(mode: 'position' | 'unit'): void {
        this.targetingMode = mode;
        // TODO: Highlight valid targets
    }

    private clearSelection(): void {
        this.selectedCard = null;
        this.selectedUnit = null;
        this.targetingMode = 'none';
        this.validTargets = [];
        this.clearHighlights();
        this.actionText.setText('');
    }

    private clearHighlights(): void {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                const cell = this.gridCells[x][y];
                cell.setFillStyle(this.getCellColor(x, y), 0.3);
            }
        }
    }

    private highlightValidMoves(unit: SummonUnit): void {
        // For now, highlight adjacent cells
        const pos = unit.position;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = pos.x + dx;
                const y = pos.y + dy;
                if (x >= 0 && x < this.BOARD_WIDTH && y >= 0 && y < this.BOARD_HEIGHT) {
                    const cell = this.gridCells[x][y];
                    cell.setFillStyle(0x00ff00, 0.4);
                }
            }
        }
    }

    private isValidTarget(position: Position): boolean {
        return this.validTargets.some(target => 
            target.x === position.x && target.y === position.y
        );
    }

    private showHelp(): void {
        const helpText = `
TACTICAL CARD GAME - CONTROLS

HAND INTERACTION:
• Click cards in hand to select them
• Summon cards: Click card, then click board position
• Action cards: Click to play immediately

UNIT INTERACTION:  
• Click units to select for movement
• Click destination to move selected unit
• Right-click units to attack (TODO)

GAME FLOW:
• SPACE: End current phase
• ESC: Clear selection
• H: Show this help

CURRENT STATE:
Turn: ${this.gameState.turn}
Phase: ${this.gameState.phase}
Active Player: ${this.gameState.activePlayer}
        `;
        
        this.actionText.setText(helpText);
        
        // Clear help after 5 seconds
        this.time.delayedCall(5000, () => {
            this.actionText.setText('');
        });
    }
}