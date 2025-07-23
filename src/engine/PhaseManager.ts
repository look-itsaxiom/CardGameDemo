/**
 * Phase Manager - Handles game phase transitions and phase-specific logic
 *
 * Single Responsibility: Manages turn phases and their associated behaviors
 */

import { GamePhase, PlayerId, Player, GrowthRates, GrowthRate } from "../types/index";
import { GameStateManager } from "./GameStateManager";
import { CardManager } from "./CardManager";

export class PhaseManager {
  constructor(private stateManager: GameStateManager, private cardManager: CardManager, private players: Player[]) {}

  /**
   * Process end phase action - advance to next phase or next player's turn
   */
  processEndPhase(): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    if (state.phase === GamePhase.SETUP) {
      // Move to first player's first turn
      this.stateManager.updateState({
        phase: GamePhase.DRAW,
        activePlayer: this.players[0].id,
      });
      return { success: true, message: "Game started! Moving to Draw Phase." };
    }

    switch (state.phase) {
      case GamePhase.DRAW:
        this.processDrawPhase();
        this.stateManager.updateState({ phase: GamePhase.LEVEL });
        return { success: true, message: "Moving to Level Phase." };

      case GamePhase.LEVEL:
        this.processLevelPhase();
        this.stateManager.updateState({ phase: GamePhase.ACTION });
        return { success: true, message: "Moving to Action Phase." };

      case GamePhase.ACTION:
        this.stateManager.updateState({ phase: GamePhase.END });
        return { success: true, message: "Moving to End Phase." };

      case GamePhase.END:
        this.processEndPhaseEffects();
        this.advanceToNextTurn();
        return { success: true, message: "Turn completed. Next player's turn." };

      default:
        return { success: false, message: `Cannot end phase from: ${state.phase}` };
    }
  }

  /**
   * Process draw phase - draw 1 card (skip on first turn)
   */
  private processDrawPhase(): void {
    const state = this.stateManager.getState();

    if (state.turn === 1) {
      // Skip draw on first turn
      return;
    }

    const playerZones = state.players[state.activePlayer];
    this.cardManager.drawCards(playerZones, 1);
  }

  /**
   * Process level phase - all player's summons gain 1 level
   */
  private processLevelPhase(): void {
    const state = this.stateManager.getState();
    const playerZones = state.players[state.activePlayer];

    // Level up all summons controlled by active player
    playerZones.summonUnits.forEach((unitId) => {
      const unit = state.summonUnits[unitId];
      if (unit && unit.level < 20) {
        unit.level++;

        // Get base stats and growth rates from the original summon card
        // For now, use placeholder values - will be enhanced with real card data
        const baseStats = {
          STR: 15,
          END: 13,
          DEF: 14,
          INT: 15,
          SPI: 14,
          MDF: 13,
          SPD: 13,
          ACC: 12,
          LCK: 16,
        };
        const growthRates: GrowthRates = {
          STR: GrowthRate.NORMAL,
          END: GrowthRate.NORMAL,
          DEF: GrowthRate.NORMAL,
          INT: GrowthRate.NORMAL,
          SPI: GrowthRate.NORMAL,
          MDF: GrowthRate.NORMAL,
          SPD: GrowthRate.NORMAL,
          ACC: GrowthRate.NORMAL,
          LCK: GrowthRate.NORMAL,
        };

        // Recalculate all stats for new level
        this.cardManager.recalculateSummonStats(unit, baseStats, growthRates);
      }
    });
  }

  /**
   * Process end phase effects - hand limit, cleanup
   */
  private processEndPhaseEffects(): void {
    const state = this.stateManager.getState();
    const playerZones = state.players[state.activePlayer];

    // Hand limit: discard down to 6 cards
    while (playerZones.hand.length > 6) {
      const discarded = playerZones.hand.pop();
      if (discarded) {
        playerZones.rechargePile.push(discarded);
      }
    }

    // Reset turn-specific flags
    this.stateManager.updateState({ turnSummonUsed: false });

    // Reset unit combat flags
    Object.values(state.summonUnits).forEach((unit) => {
      unit.attacksUsed = 0;
      unit.movementUsed = 0;
    });
  }

  /**
   * Advance to next turn
   */
  private advanceToNextTurn(): void {
    const state = this.stateManager.getState();

    // Switch active player
    const currentPlayerIndex = this.players.findIndex((p) => p.id === state.activePlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
    const nextActivePlayer = this.players[nextPlayerIndex].id;

    const updates: any = {
      activePlayer: nextActivePlayer,
      phase: GamePhase.DRAW,
      priorityPlayer: nextActivePlayer,
    };

    // Advance turn counter when back to first player
    if (nextPlayerIndex === 0) {
      updates.turn = state.turn + 1;
    }

    this.stateManager.updateState(updates);
  }
}
