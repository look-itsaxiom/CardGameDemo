/**
 * Game State Manager
 * 
 * Manages the authoritative game state including players, board, turn management,
 * and state validation. This is the central state container that all other
 * systems interact with.
 */

import { 
  GameState, 
  PlayerState, 
  GamePhase, 
  Position,
  SummonUnit,
  BoardDimensions,
  Territory
} from '@/types';

export class GameStateManager {
  private gameState: GameState;

  constructor(gameId: string) {
    this.gameState = this.createInitialGameState(gameId);
  }

  /**
   * Create initial game state for a new game
   */
  private createInitialGameState(gameId: string): GameState {
    const boardDimensions: BoardDimensions = { width: 12, height: 14 };
    
    return {
      id: gameId,
      status: 'setup',
      currentPlayer: '',
      currentPhase: GamePhase.DRAW,
      turn: 0,
      players: {},
      board: {
        dimensions: boardDimensions,
        occupiedSpaces: new Map(),
        buildings: new Map()
      },
      stack: [],
      ongoingEffects: [],
      delayedEffects: [],
    };
  }

  /**
   * Add a player to the game
   */
  addPlayer(playerId: string, playerName: string): void {
    if (Object.keys(this.gameState.players).length >= 2) {
      throw new Error('Game already has maximum number of players');
    }

    const playerCount = Object.keys(this.gameState.players).length;
    const territory: Territory = {
      playerId,
      startRow: playerCount === 0 ? 0 : 11,  // Player 1: rows 0-2, Player 2: rows 11-13
      endRow: playerCount === 0 ? 2 : 13
    };

    const playerState: PlayerState = {
      id: playerId,
      name: playerName,
      victoryPoints: 0,
      hand: [],
      mainDeck: [],
      advanceDeck: [],
      discardPile: [],
      rechargePile: [],
      territory,
      summonSlots: {}
    };

    this.gameState.players[playerId] = playerState;

    // Set first player as current player
    if (Object.keys(this.gameState.players).length === 1) {
      this.gameState.currentPlayer = playerId;
    }
  }

  /**
   * Start the game (transition from setup to playing)
   */
  startGame(): void {
    if (Object.keys(this.gameState.players).length !== 2) {
      throw new Error('Need exactly 2 players to start game');
    }

    this.gameState.status = 'playing';
    this.gameState.turn = 1;
    this.gameState.currentPhase = GamePhase.DRAW;
  }

  /**
   * Get current game state (read-only copy)
   */
  getGameState(): Readonly<GameState> {
    return { ...this.gameState };
  }

  /**
   * Get current player state
   */
  getCurrentPlayer(): PlayerState | null {
    return this.gameState.players[this.gameState.currentPlayer] || null;
  }

  /**
   * Get player state by ID
   */
  getPlayer(playerId: string): PlayerState | null {
    return this.gameState.players[playerId] || null;
  }

  /**
   * Switch to next phase
   */
  nextPhase(): void {
    const phases = [GamePhase.DRAW, GamePhase.LEVEL, GamePhase.ACTION, GamePhase.END];
    const currentIndex = phases.indexOf(this.gameState.currentPhase);
    
    if (currentIndex === phases.length - 1) {
      // End of turn - switch to next player
      this.nextTurn();
    } else {
      this.gameState.currentPhase = phases[currentIndex + 1];
    }
  }

  /**
   * Switch to next turn
   */
  private nextTurn(): void {
    const playerIds = Object.keys(this.gameState.players);
    const currentIndex = playerIds.indexOf(this.gameState.currentPlayer);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    this.gameState.currentPlayer = playerIds[nextIndex];
    this.gameState.currentPhase = GamePhase.DRAW;
    
    // Increment turn counter when it's the first player's turn
    if (nextIndex === 0) {
      this.gameState.turn++;
    }
  }

  /**
   * Add a card to a player's hand
   */
  addCardToHand(playerId: string, cardId: string): void {
    const player = this.gameState.players[playerId];
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }
    
    player.hand.push(cardId);
  }

  /**
   * Remove a card from a player's hand
   */
  removeCardFromHand(playerId: string, cardId: string): boolean {
    const player = this.gameState.players[playerId];
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }
    
    const index = player.hand.indexOf(cardId);
    if (index === -1) {
      return false;
    }
    
    player.hand.splice(index, 1);
    return true;
  }

  /**
   * Draw a card from a player's main deck to their hand
   */
  drawCard(playerId: string): string | null {
    const player = this.gameState.players[playerId];
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    if (player.mainDeck.length === 0) {
      // Try to shuffle recharge pile into main deck
      if (player.rechargePile.length > 0) {
        player.mainDeck = [...player.rechargePile];
        player.rechargePile = [];
        this.shuffleDeck(player.mainDeck);
      } else {
        return null; // No cards to draw
      }
    }

    const cardId = player.mainDeck.pop();
    if (cardId) {
      player.hand.push(cardId);
    }
    
    return cardId || null;
  }

  /**
   * Shuffle an array in place
   */
  private shuffleDeck(deck: string[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * Place a summon unit on the board
   */
  placeSummonUnit(unit: SummonUnit, position: Position): void {
    const positionKey = `${position.x},${position.y}`;
    
    // Validate position is not occupied
    if (this.gameState.board.occupiedSpaces.has(positionKey)) {
      throw new Error(`Position ${positionKey} is already occupied`);
    }

    // Validate position is within board bounds
    if (position.x < 0 || position.x >= this.gameState.board.dimensions.width ||
        position.y < 0 || position.y >= this.gameState.board.dimensions.height) {
      throw new Error(`Position ${positionKey} is outside board bounds`);
    }

    unit.position = position;
    this.gameState.board.occupiedSpaces.set(positionKey, unit.id);
  }

  /**
   * Move a summon unit to a new position
   */
  moveSummonUnit(unitId: string, newPosition: Position): void {
    // Find the unit
    const unit = this.findSummonUnit(unitId);
    if (!unit) {
      throw new Error(`Summon unit ${unitId} not found`);
    }

    // Remove from old position
    const oldPositionKey = `${unit.position.x},${unit.position.y}`;
    this.gameState.board.occupiedSpaces.delete(oldPositionKey);

    // Place at new position
    this.placeSummonUnit(unit, newPosition);
  }

  /**
   * Find a summon unit by ID across all players
   */
  findSummonUnit(unitId: string): SummonUnit | null {
    for (const player of Object.values(this.gameState.players)) {
      for (const slot of Object.values(player.summonSlots)) {
        if (slot && slot.id === unitId) {
          return slot;
        }
      }
    }
    return null;
  }

  /**
   * Get summon unit at a specific position
   */
  getSummonAtPosition(position: Position): SummonUnit | null {
    const positionKey = `${position.x},${position.y}`;
    const occupantId = this.gameState.board.occupiedSpaces.get(positionKey);
    
    if (!occupantId) {
      return null;
    }

    return this.findSummonUnit(occupantId);
  }

  /**
   * Add victory points to a player
   */
  addVictoryPoints(playerId: string, points: number): void {
    const player = this.gameState.players[playerId];
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    player.victoryPoints += points;

    // Check for win condition
    if (player.victoryPoints >= 3) {
      this.gameState.status = 'finished';
      this.gameState.winner = playerId;
    }
  }

  /**
   * Check if a position is within a player's territory
   */
  isInPlayerTerritory(position: Position, playerId: string): boolean {
    const player = this.gameState.players[playerId];
    if (!player) {
      return false;
    }

    return position.y >= player.territory.startRow && position.y <= player.territory.endRow;
  }

  /**
   * Check if a position is in unclaimed territory
   */
  isInUnclaimedTerritory(position: Position): boolean {
    for (const player of Object.values(this.gameState.players)) {
      if (this.isInPlayerTerritory(position, player.id)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate if the game state is consistent
   */
  validateGameState(): string[] {
    const errors: string[] = [];

    // Validate player count
    const playerCount = Object.keys(this.gameState.players).length;
    if (playerCount !== 2 && this.gameState.status === 'playing') {
      errors.push('Game must have exactly 2 players when playing');
    }

    // Validate current player exists
    if (!this.gameState.players[this.gameState.currentPlayer]) {
      errors.push('Current player does not exist');
    }

    // Validate board occupancy consistency
    for (const [positionKey, occupantId] of this.gameState.board.occupiedSpaces) {
      const unit = this.findSummonUnit(occupantId);
      if (!unit) {
        errors.push(`Position ${positionKey} references non-existent unit ${occupantId}`);
      } else if (`${unit.position.x},${unit.position.y}` !== positionKey) {
        errors.push(`Unit ${occupantId} position mismatch`);
      }
    }

    return errors;
  }

  /**
   * Reset movement for all summon units (called at start of turn)
   */
  resetMovementForPlayer(playerId: string): void {
    const player = this.gameState.players[playerId];
    if (!player) {
      return;
    }

    for (const unit of Object.values(player.summonSlots)) {
      if (unit) {
        // Reset movement to maximum based on speed
        unit.movement = Math.max(1, 2 + Math.floor((unit.currentStats.spd - 10) / 5));
        unit.hasAttacked = false;
      }
    }
  }

  /**
   * Use movement points for a unit
   */
  useMovement(unitId: string, points: number): boolean {
    const unit = this.findSummonUnit(unitId);
    if (!unit) {
      return false;
    }

    if (unit.movement < points) {
      return false;
    }

    unit.movement -= points;
    return true;
  }
}