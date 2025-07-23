/**
 * Trigger Detector - Detects game events and matches them to trigger conditions
 *
 * Single Responsibility: Event detection and trigger matching for card effects
 */

import { GameEvent, Trigger, TriggerCondition, PlayerId, GameState, GamePhase, SpeedLevel, StackEntry } from "../types/index";
import { GameStateManager } from "./GameStateManager";
import { StackManager } from "./StackManager";

export interface TriggerMatch {
  triggerId: string;
  sourceCardId: string;
  playerId: PlayerId;
  triggerContext: {
    event: GameEvent;
    matchedConditions: TriggerCondition[];
  };
}

export class TriggerDetector {
  private eventQueue: GameEvent[] = [];
  private eventIdCounter = 0;

  constructor(private stateManager: GameStateManager, private stackManager: StackManager) {}

  /**
   * Emit a game event and check for triggered effects
   */
  emitEvent(eventType: string, playerId: PlayerId, data: Record<string, any>): GameEvent {
    const state = this.stateManager.getState();

    const event: GameEvent = {
      id: `event_${++this.eventIdCounter}`,
      type: eventType,
      playerId,
      data,
      timestamp: Date.now(),
      phase: state.phase,
      turn: state.turn,
    };

    this.eventQueue.push(event);

    // Check for triggered effects
    this.processEventForTriggers(event);

    return event;
  }

  /**
   * Process queued events (called after stack resolution)
   */
  processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEventForTriggers(event);
    }
  }

  /**
   * Get all events that occurred this turn
   */
  getEventsThisTurn(): GameEvent[] {
    const state = this.stateManager.getState();
    return this.eventQueue.filter((event) => event.turn === state.turn);
  }

  /**
   * Clear event history (typically at end of turn)
   */
  clearEventHistory(): void {
    this.eventQueue = [];
  }

  // ============================================================================
  // CORE EVENT TYPES
  // ============================================================================

  /**
   * Emit summon played event
   */
  emitSummonPlayed(playerId: PlayerId, summonId: string, position: { x: number; y: number }): GameEvent {
    return this.emitEvent("summonPlayed", playerId, {
      summonId,
      position,
      summonCard: this.stateManager.getState().summonUnits[summonId]?.baseCard,
    });
  }

  /**
   * Emit summon defeated event
   */
  emitSummonDefeated(playerId: PlayerId, summonId: string, killerId?: string, damage?: number): GameEvent {
    return this.emitEvent("summonDefeated", playerId, {
      summonId,
      killerId,
      damage,
      summonCard: this.stateManager.getState().summonUnits[summonId]?.baseCard,
    });
  }

  /**
   * Emit card played event
   */
  emitCardPlayed(playerId: PlayerId, cardId: string, targets?: string[]): GameEvent {
    return this.emitEvent("cardPlayed", playerId, {
      cardId,
      targets,
    });
  }

  /**
   * Emit phase entered event
   */
  emitPhaseEntered(playerId: PlayerId, phase: GamePhase): GameEvent {
    return this.emitEvent("phaseEntered", playerId, {
      phase,
    });
  }

  /**
   * Emit movement completed event
   */
  emitMovementCompleted(playerId: PlayerId, summonId: string, fromPos: { x: number; y: number }, toPos: { x: number; y: number }): GameEvent {
    return this.emitEvent("movementCompleted", playerId, {
      summonId,
      fromPos,
      toPos,
      distance: Math.abs(fromPos.x - toPos.x) + Math.abs(fromPos.y - toPos.y),
    });
  }

  /**
   * Emit damage dealt event
   */
  emitDamageDealt(playerId: PlayerId, attackerId: string, targetId: string, damage: number, damageType: string): GameEvent {
    return this.emitEvent("damageDealt", playerId, {
      attackerId,
      targetId,
      damage,
      damageType,
    });
  }

  /**
   * Emit healing performed event
   */
  emitHealingPerformed(playerId: PlayerId, casterId: string, targetId: string, healAmount: number): GameEvent {
    return this.emitEvent("healingPerformed", playerId, {
      casterId,
      targetId,
      healAmount,
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Process an event to find matching triggers
   */
  private processEventForTriggers(event: GameEvent): void {
    const state = this.stateManager.getState();
    const matches: TriggerMatch[] = [];

    // Check face-down counters for trigger matches
    matches.push(...this.checkCounterTriggers(event));

    // Check ongoing effects for trigger matches
    matches.push(...this.checkOngoingEffectTriggers(event));

    // Check building effects for trigger matches
    matches.push(...this.checkBuildingTriggers(event));

    // Process all matches
    for (const match of matches) {
      this.processTriggerMatch(match);
    }
  }

  /**
   * Check face-down counter cards for trigger matches
   */
  private checkCounterTriggers(event: GameEvent): TriggerMatch[] {
    const matches: TriggerMatch[] = [];
    const state = this.stateManager.getState();

    // TODO: Scan in-play zone for face-down counter cards
    // For now, return empty array until we implement counter card system

    return matches;
  }

  /**
   * Check ongoing effects for trigger matches
   */
  private checkOngoingEffectTriggers(event: GameEvent): TriggerMatch[] {
    const matches: TriggerMatch[] = [];
    const state = this.stateManager.getState();

    for (const ongoingEffect of state.zones.ongoingEffects) {
      if (ongoingEffect.triggerCondition) {
        if (this.doesEventMatchTrigger(event, ongoingEffect.triggerCondition)) {
          matches.push({
            triggerId: ongoingEffect.triggerCondition.id,
            sourceCardId: ongoingEffect.sourceCard,
            playerId: ongoingEffect.sourcePlayer,
            triggerContext: {
              event,
              matchedConditions: ongoingEffect.triggerCondition.conditions,
            },
          });
        }
      }
    }

    return matches;
  }

  /**
   * Check building effects for trigger matches
   */
  private checkBuildingTriggers(event: GameEvent): TriggerMatch[] {
    const matches: TriggerMatch[] = [];

    // TODO: Check building cards in play for triggered abilities
    // This would involve loading building card definitions and checking their trigger conditions

    return matches;
  }

  /**
   * Check if an event matches a trigger condition
   */
  private doesEventMatchTrigger(event: GameEvent, trigger: Trigger): boolean {
    return trigger.conditions.every((condition) => this.doesEventMatchCondition(event, condition));
  }

  /**
   * Check if an event matches a specific condition
   */
  private doesEventMatchCondition(event: GameEvent, condition: TriggerCondition): boolean {
    switch (condition.type) {
      case "summonDefeated":
        return event.type === "summonDefeated" && this.matchConditionParameters(event, condition);

      case "summonPlayed":
        return event.type === "summonPlayed" && this.matchConditionParameters(event, condition);

      case "cardPlayed":
        return event.type === "cardPlayed" && this.matchConditionParameters(event, condition);

      case "phaseStart":
        return event.type === "phaseEntered" && this.matchConditionParameters(event, condition);

      case "damageDealt":
        return event.type === "damageDealt" && this.matchConditionParameters(event, condition);

      case "healingPerformed":
        return event.type === "healingPerformed" && this.matchConditionParameters(event, condition);

      case "movementCompleted":
        return event.type === "movementCompleted" && this.matchConditionParameters(event, condition);

      default:
        console.warn(`Unknown trigger condition type: ${condition.type}`);
        return false;
    }
  }

  /**
   * Match condition parameters against event data
   */
  private matchConditionParameters(event: GameEvent, condition: TriggerCondition): boolean {
    const { parameters } = condition;

    // Check controller restrictions
    if (parameters.controller) {
      switch (parameters.controller) {
        case "self":
          if (event.playerId !== parameters.sourcePlayerId) return false;
          break;
        case "opponent":
          if (event.playerId === parameters.sourcePlayerId) return false;
          break;
        case "any":
          // No restriction
          break;
      }
    }

    // Check specific parameter matches
    for (const [key, value] of Object.entries(parameters)) {
      if (key === "controller" || key === "sourcePlayerId") continue;

      if (event.data[key] !== undefined && event.data[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Process a trigger match by adding appropriate effects to stack
   */
  private processTriggerMatch(match: TriggerMatch): void {
    // TODO: Create stack entry for triggered effect
    // This would involve:
    // 1. Loading the source card definition
    // 2. Finding the triggered effect
    // 3. Creating a StackEntry with appropriate speed and effects
    // 4. Adding to stack via StackManager

    console.log(`Trigger matched: ${match.triggerId} from ${match.sourceCardId} for ${match.playerId}`);
  }
}
