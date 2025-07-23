/**
 * Game State Manager - Handles state initialization and access
 *
 * Single Responsibility: Manages the authoritative game state
 */

import { GameState, GamePhase, PlayerId, Player, PlayerZones, positionToId, BoardPosition, GameZones, Deck3v3, CardId } from "../types/index.js";

export class GameStateManager {
  private state: GameState;

  constructor(players: Player[], playerDecks: Record<PlayerId, Deck3v3>) {
    this.state = this.initializeGame(players, playerDecks);
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Update game state (internal use only)
   */
  updateState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Update specific player zones
   */
  updatePlayerZones(playerId: PlayerId, updates: Partial<PlayerZones>): void {
    this.state.players[playerId] = {
      ...this.state.players[playerId],
      ...updates,
    };
  }

  /**
   * Initialize game state from player data and decks
   */
  private initializeGame(players: Player[], playerDecks: Record<PlayerId, Deck3v3>): GameState {
    const [player1, player2] = players;

    // Initialize board - 12 wide, 14 tall
    const board: Record<string, BoardPosition> = {};
    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 14; y++) {
        const position = { x, y };
        const posId = positionToId(position);

        // Determine territory ownership
        let territory: "player1" | "player2" | "neutral" = "neutral";
        if (y <= 2) territory = "player1";
        else if (y >= 11) territory = "player2";

        board[posId] = {
          position,
          territory,
          occupants: {
            0: [], // TERRAIN
            1: [], // NONOBSTRUCTING_BUILDINGS
            2: [], // OBSTRUCTING_BUILDINGS
            3: [], // UNITS
          },
          isWalkable: true,
          movementCost: 1,
        };
      }
    }

    // Initialize player zones
    const createPlayerZones = (playerId: PlayerId): PlayerZones => {
      const deck = playerDecks[playerId];

      // Players start with their 3 summon cards from summon slots in hand
      const startingHand: CardId[] = [];
      deck.summonSlots.forEach((slot) => {
        startingHand.push(slot.summonCard);
      });

      return {
        hand: startingHand, // Start with 3 summon cards from summon slots
        mainDeck: [...deck.mainDeck], // Copy to avoid mutations
        advanceDeck: [...deck.advanceDeck],
        discardPile: [],
        rechargePile: [],
        summonUnits: [],
        defeatedUnits: [],
        victoryPoints: 0,
      };
    };

    const zones: GameZones = {
      board,
      player1: createPlayerZones(player1.id),
      player2: createPlayerZones(player2.id),
      inPlay: [],
      stack: [],
      ongoingEffects: [],
      delayedEffects: [],
    };

    // Shuffle main decks
    this.shuffleDeck(zones.player1.mainDeck);
    this.shuffleDeck(zones.player2.mainDeck);

    return {
      phase: GamePhase.SETUP,
      turn: 1,
      activePlayer: player1.id,
      players: {
        [player1.id]: zones.player1,
        [player2.id]: zones.player2,
      },
      zones,
      summonUnits: {},
      victoryPoints: {
        [player1.id]: 0,
        [player2.id]: 0,
      },
      gameEnded: false,
      priorityPlayer: player1.id,
      awaitingResponse: false,
      turnSummonUsed: false,
    };
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleDeck(deck: string[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * Get the current role for a summon unit
   */
  getCurrentRole(summonId: string): RoleCard | null {
    const summon = this.state.summonUnits[summonId];
    if (!summon) return null;

    // Return the current role card based on summon's roleId
    // This would need to interact with card database to get role card data
    return null; // Placeholder - would need card database integration
  }

  /**
   * Get victory points for a player
   */
  getVictoryPoints(playerId: PlayerId): number {
    return this.state.victoryPoints[playerId] || 0;
  }

  /**
   * Award victory points to a player
   */
  awardVictoryPoints(playerId: PlayerId, amount: number): void {
    if (!this.state.victoryPoints[playerId]) {
      this.state.victoryPoints[playerId] = 0;
    }
    this.state.victoryPoints[playerId] += amount;
  }

  /**
   * Get all summon units for a player
   */
  getPlayerSummons(playerId: PlayerId): SummonUnit[] {
    const playerSummonIds = this.state.players[playerId]?.summonUnits || [];
    return playerSummonIds.map((id) => this.state.summonUnits[id]).filter(Boolean);
  }

  /**
   * Update summon unit HP
   */
  updateSummonHP(summonId: string, newHP: number): boolean {
    const summon = this.state.summonUnits[summonId];
    if (!summon) return false;

    summon.currentHP = Math.max(0, Math.min(newHP, summon.maxHP));
    return true;
  }

  /**
   * Update summon unit level
   */
  updateSummonLevel(summonId: string, newLevel: number): boolean {
    const summon = this.state.summonUnits[summonId];
    if (!summon) return false;

    summon.level = Math.max(1, Math.min(newLevel, 20)); // Level 1-20
    return true;
  }

  /**
   * Check if game has ended
   */
  checkGameEnd(): { ended: boolean; winner?: PlayerId; condition?: string } {
    // Check victory point condition (3 VP wins)
    for (const [playerId, vp] of Object.entries(this.state.victoryPoints)) {
      if (vp >= 3) {
        return { ended: true, winner: playerId as PlayerId, condition: "victoryPoints" };
      }
    }

    return { ended: false };
  }
}
