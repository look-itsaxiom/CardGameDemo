/**
 * Stack Manager - Handles effect resolution stack and priority system
 *
 * Single Responsibility: Manages the LIFO stack for effect resolution and player response windows
 */

import { StackEntry, SpeedLevel, PlayerId, GameState, GamePhase, TriggerContext, Effect, EffectContext, GameEvent } from "../types/index";
import { GameStateManager } from "./GameStateManager";
import { EffectTypeRegistry } from "./EffectTypeRegistry";

export interface StackResolution {
  success: boolean;
  message: string;
  completed: boolean; // True if stack is now empty
  awaitingResponse: boolean; // True if waiting for player responses
  priorityPlayer?: PlayerId;
}

export interface PlayerResponse {
  playerId: PlayerId;
  cardId?: string;
  effectType: string;
  targetId?: string;
  declined: boolean;
}

export class StackManager {
  private effectRegistry: EffectTypeRegistry;

  constructor(private stateManager: GameStateManager, private players: { id: PlayerId; name: string }[]) {
    this.effectRegistry = EffectTypeRegistry.getInstance();
  }

  /**
   * Add effect to the stack
   */
  addEffectToStack(entry: StackEntry): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    // Validate speed restrictions
    const speedValidation = this.validateSpeedRestrictions(entry.speed);
    if (!speedValidation.valid) {
      return { success: false, message: speedValidation.message };
    }

    // Add to stack (LIFO)
    state.zones.stack.push(entry);

    // Update priority and response state
    this.updatePriorityState(entry);

    return {
      success: true,
      message: `Added ${entry.source} (${entry.speed}) to stack. Stack size: ${state.zones.stack.length}`,
    };
  }

  /**
   * Resolve next effect from stack
   */
  async resolveNext(): Promise<StackResolution> {
    const state = this.stateManager.getState();

    if (state.zones.stack.length === 0) {
      return {
        success: true,
        message: "Stack is empty",
        completed: true,
        awaitingResponse: false,
      };
    }

    // Check if we're waiting for responses
    if (state.awaitingResponse) {
      return {
        success: false,
        message: "Waiting for player responses",
        completed: false,
        awaitingResponse: true,
        priorityPlayer: state.priorityPlayer,
      };
    }

    // Get top entry from stack
    const entry = state.zones.stack.pop()!;

    try {
      // Resolve each effect in the entry
      const results = [];
      for (const effect of entry.effects) {
        const context: EffectContext = {
          playerId: entry.playerId,
          sourceCardId: entry.source,
          triggerContext: entry.triggerContext,
          stackEntry: entry,
        };

        const result = await this.effectRegistry.executeEffect(effect, context, state);
        results.push(result);

        // If any effect fails, stop processing
        if (!result.success) {
          return {
            success: false,
            message: `Effect failed: ${result.message}`,
            completed: false,
            awaitingResponse: false,
          };
        }

        // Process any triggered events from this effect
        if (result.triggeredEvents) {
          this.processTriggeredEvents(result.triggeredEvents);
        }
      }

      // Check if stack is now empty
      const completed = state.zones.stack.length === 0;

      // If not empty, check for new responses
      if (!completed) {
        this.checkForNewResponses();
      }

      return {
        success: true,
        message: `Resolved ${entry.source}: ${results.map((r) => r.message).join("; ")}`,
        completed,
        awaitingResponse: state.awaitingResponse,
        priorityPlayer: state.priorityPlayer,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error resolving effect: ${error}`,
        completed: false,
        awaitingResponse: false,
      };
    }
  }

  /**
   * Check for player responses to current stack state
   */
  checkForResponses(): PlayerResponse[] {
    const state = this.stateManager.getState();

    if (state.zones.stack.length === 0) {
      return [];
    }

    const responses: PlayerResponse[] = [];

    // TODO: Check each player for available responses
    // This would involve checking:
    // 1. Cards in hand with appropriate speed
    // 2. Face-down counters that could trigger
    // 3. Ongoing effects that could respond

    return responses;
  }

  /**
   * Add player response to stack
   */
  addPlayerResponse(response: PlayerResponse): { success: boolean; message: string } {
    if (response.declined) {
      return this.passResponse(response.playerId);
    }

    // TODO: Convert player response to StackEntry and add to stack
    const stackEntry: StackEntry = {
      id: `response_${Date.now()}`,
      playerId: response.playerId,
      speed: SpeedLevel.REACTION, // TODO: Determine actual speed from card
      source: response.cardId || "unknown",
      effects: [], // TODO: Get effects from card
      triggerContext: undefined,
    };

    return this.addEffectToStack(stackEntry);
  }

  /**
   * Player passes on response opportunity
   */
  passResponse(playerId: PlayerId): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    // Move priority to next player or resolve stack
    const currentPlayerIndex = this.players.findIndex((p) => p.id === playerId);
    const nextPlayer = this.players[(currentPlayerIndex + 1) % this.players.length];

    if (nextPlayer.id === state.priorityPlayer) {
      // All players have passed, continue resolution
      this.stateManager.updateState({ awaitingResponse: false });
      return { success: true, message: "All players passed, continuing resolution" };
    } else {
      // Give priority to next player
      this.stateManager.updateState({ priorityPlayer: nextPlayer.id });
      return { success: true, message: `Priority passes to ${nextPlayer.name}` };
    }
  }

  /**
   * Clear the entire stack (for testing or emergency situations)
   */
  clearStack(): void {
    const state = this.stateManager.getState();
    state.zones.stack = [];
    this.stateManager.updateState({ awaitingResponse: false });
  }

  /**
   * Get current stack state for display
   */
  getStackState(): {
    entries: StackEntry[];
    awaitingResponse: boolean;
    priorityPlayer?: PlayerId;
    canRespondWith: SpeedLevel[];
  } {
    const state = this.stateManager.getState();

    return {
      entries: [...state.zones.stack],
      awaitingResponse: state.awaitingResponse,
      priorityPlayer: state.priorityPlayer,
      canRespondWith: this.getAllowedSpeeds(),
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Validate speed restrictions based on current stack state
   */
  private validateSpeedRestrictions(speed: SpeedLevel): { valid: boolean; message: string } {
    const state = this.stateManager.getState();

    // Action speed only allowed during Action Phase
    if (speed === SpeedLevel.ACTION && state.phase !== GamePhase.ACTION) {
      return { valid: false, message: "Action speed only allowed during Action Phase" };
    }

    // Check speed locks from current stack
    const allowedSpeeds = this.getAllowedSpeeds();
    if (!allowedSpeeds.includes(speed)) {
      return {
        valid: false,
        message: `Speed ${speed} blocked by current stack. Allowed: ${allowedSpeeds.join(", ")}`,
      };
    }

    return { valid: true, message: "Speed allowed" };
  }

  /**
   * Get currently allowed speeds based on stack state
   */
  private getAllowedSpeeds(): SpeedLevel[] {
    const state = this.stateManager.getState();
    const stack = state.zones.stack;

    if (stack.length === 0) {
      // Empty stack - phase restrictions only
      if (state.phase === GamePhase.ACTION) {
        return [SpeedLevel.ACTION, SpeedLevel.REACTION, SpeedLevel.COUNTER];
      } else {
        return [SpeedLevel.REACTION, SpeedLevel.COUNTER];
      }
    }

    // Find highest speed currently on stack
    const speeds = stack.map((entry) => entry.speed);
    const hasCounter = speeds.includes(SpeedLevel.COUNTER);
    const hasReaction = speeds.includes(SpeedLevel.REACTION);

    if (hasCounter) {
      // Counter speed locks out everything else
      return [SpeedLevel.COUNTER];
    } else if (hasReaction) {
      // Reaction speed locks out Action
      return [SpeedLevel.REACTION, SpeedLevel.COUNTER];
    } else {
      // Only Actions on stack
      return [SpeedLevel.ACTION, SpeedLevel.REACTION, SpeedLevel.COUNTER];
    }
  }

  /**
   * Update priority state after adding effect to stack
   */
  private updatePriorityState(entry: StackEntry): void {
    // Determine who gets priority to respond
    // Generally, the non-active player gets first response priority
    const respondingPlayer = entry.playerId === this.players[0].id ? this.players[1].id : this.players[0].id;

    this.stateManager.updateState({
      priorityPlayer: respondingPlayer,
      awaitingResponse: true,
    });
  }

  /**
   * Process events triggered by effect resolution
   */
  private processTriggeredEvents(events: GameEvent[]): void {
    // TODO: Check for cards/effects that trigger off these events
    // This would involve:
    // 1. Scanning face-down counters for matching triggers
    // 2. Checking ongoing effects for trigger conditions
    // 3. Adding new stack entries for triggered effects

    console.log(
      `Processing ${events.length} triggered events:`,
      events.map((e) => e.type)
    );
  }

  /**
   * Check if new responses are possible after resolution
   */
  private checkForNewResponses(): void {
    const state = this.stateManager.getState();

    // Check if any player can respond to current stack state
    const responses = this.checkForResponses();

    if (responses.length > 0) {
      // Priority goes to opponent of last action
      const lastEntry = state.zones.stack[state.zones.stack.length - 1];
      const respondingPlayer = lastEntry.playerId === this.players[0].id ? this.players[1].id : this.players[0].id;

      this.stateManager.updateState({
        awaitingResponse: true,
        priorityPlayer: respondingPlayer,
      });
    } else {
      this.stateManager.updateState({ awaitingResponse: false });
    }
  }
}
