/**
 * Core Game Engine - Orchestrates game components and provides public API
 *
 * This engine follows SOLID principles:
 * - Single Responsibility: Orchestrates components, doesn't handle specifics
 * - Open/Closed: Extensible through component interfaces
 * - Liskov Substitution: Components can be swapped with compatible implementations
 * - Interface Segregation: Each component has focused, specific interfaces
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 */

import { GameState, GameAction, Player, Deck3v3, Card, PlayerId, GameEvent } from "../types/index.js";

import { GameStateManager } from "./GameStateManager.js";
import { CardManager } from "./CardManager.js";
import { BoardManager } from "./BoardManager.js";
import { PhaseManager } from "./PhaseManager.js";
import { ActionProcessor } from "./ActionProcessor.js";
import { EffectTypeRegistry } from "./EffectTypeRegistry.js";
import { StackManager } from "./StackManager.js";
import { TriggerDetector } from "./TriggerDetector.js";
import { RequirementValidator } from "./RequirementValidator.js";

export interface GameEngineConfig {
  players: Player[];
  playerDecks: Record<PlayerId, Deck3v3>;
  cardDatabase: Record<string, Card>;
}

export class GameEngine {
  private stateManager: GameStateManager;
  private cardManager: CardManager;
  private boardManager: BoardManager;
  private phaseManager: PhaseManager;
  private actionProcessor: ActionProcessor;

  // Phase 6 Components - Effects Engine
  private effectRegistry: EffectTypeRegistry;
  private stackManager: StackManager;
  private triggerDetector: TriggerDetector;
  private requirementValidator: RequirementValidator;

  private config: GameEngineConfig;

  constructor(config: GameEngineConfig) {
    this.config = config;

    // Initialize core components in dependency order
    this.stateManager = new GameStateManager(config.players, config.playerDecks);
    this.cardManager = new CardManager(config.cardDatabase);
    this.boardManager = new BoardManager(this.stateManager, config.players);
    this.phaseManager = new PhaseManager(this.stateManager, this.cardManager, config.players);

    // Initialize Phase 6 components - Effects Engine
    this.effectRegistry = EffectTypeRegistry.getInstance();
    this.stackManager = new StackManager(this.stateManager, config.players);
    this.triggerDetector = new TriggerDetector(this.stateManager, this.stackManager);
    this.requirementValidator = new RequirementValidator(this.stateManager);

    // Initialize action processor with all dependencies
    this.actionProcessor = new ActionProcessor(
      this.stateManager,
      this.cardManager,
      this.boardManager,
      this.phaseManager,
      this.effectRegistry,
      this.stackManager,
      this.triggerDetector,
      this.requirementValidator
    );
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<GameState> {
    return this.stateManager.getState();
  }

  /**
   * Get game configuration (read-only)
   */
  getConfig(): Readonly<GameEngineConfig> {
    return this.config;
  }

  /**
   * Get effect registry for card effect execution
   */
  getEffectRegistry(): EffectTypeRegistry {
    return this.effectRegistry;
  }

  /**
   * Get stack manager for effect resolution
   */
  getStackManager(): StackManager {
    return this.stackManager;
  }

  /**
   * Get trigger detector for event processing
   */
  getTriggerDetector(): TriggerDetector {
    return this.triggerDetector;
  }

  /**
   * Get requirement validator for card validation
   */
  getRequirementValidator(): RequirementValidator {
    return this.requirementValidator;
  }

  /**
   * Process a player action and update game state
   */
  processAction(action: GameAction): { success: boolean; message: string } {
    // Process through standard action processor first
    const result = this.actionProcessor.processAction(action);

    if (result.success) {
      // Emit events to trigger detector for any effects that should respond
      this.triggerDetector.emitEvent("action_processed", action.playerId, {
        actionType: action.type,
        actionData: action,
      });
    }

    return result;
  }

  /**
   * Process the effect stack until completion or awaiting responses
   */
  async processEffectStack(): Promise<{ success: boolean; message: string; awaitingResponse: boolean }> {
    let totalProcessed = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (totalProcessed < maxIterations) {
      const resolution = await this.stackManager.resolveNext();

      if (!resolution.success) {
        return { success: false, message: resolution.message, awaitingResponse: false };
      }

      if (resolution.completed) {
        return { success: true, message: `Stack processing completed. Processed ${totalProcessed} effects.`, awaitingResponse: false };
      }

      if (resolution.awaitingResponse) {
        return { success: true, message: `Stack processing paused awaiting player responses.`, awaitingResponse: true };
      }

      totalProcessed++;
    }

    return { success: false, message: `Stack processing exceeded maximum iterations (${maxIterations})`, awaitingResponse: false };
  }

  /**
   * Submit a player response to an effect on the stack
   */
  submitPlayerResponse(response: { playerId: PlayerId; cardId?: string; effectType: string; targetId?: string; declined: boolean }): {
    success: boolean;
    message: string;
  } {
    return this.stackManager.addPlayerResponse(response);
  }

  /**
   * Validate if a card can be played by checking all requirements
   */
  validateCardPlay(cardId: string, playerId: PlayerId): { valid: boolean; message: string } {
    const state = this.getState();
    const card = this.cardManager.getCard(cardId);

    if (!card) {
      return { valid: false, message: `Card ${cardId} not found` };
    }

    // Only playable cards have requirements (not Summon cards)
    if (card.type === "summon") {
      return { valid: true, message: "Summon cards use different validation rules" };
    }

    const playableCard = card as any; // Cast to access requirements
    if (!playableCard.requirements || playableCard.requirements.length === 0) {
      return { valid: true, message: "No requirements to check" };
    }

    const result = this.requirementValidator.checkRequirements(playableCard.requirements, playerId, state);
    return { valid: result.valid, message: result.failedRequirement || "All requirements met" };
  }

  /**
   * Get valid targets for a card
   */
  getValidTargets(cardId: string, playerId: PlayerId): string[] {
    const state = this.getState();
    const card = this.cardManager.getCard(cardId);

    if (!card) {
      return [];
    }

    // Only playable cards have target restrictions (not Summon cards)
    if (card.type === "summon") {
      return [];
    }

    const playableCard = card as any; // Cast to access targetRestrictions
    if (!playableCard.targetRestrictions) {
      return [];
    }

    return this.requirementValidator.findValidTargets(playableCard.targetRestrictions, playerId, state);
  }

  /**
   * Check victory conditions
   */
  checkVictoryConditions(): PlayerId | null {
    const state = this.stateManager.getState();
    for (const [playerId, playerZones] of Object.entries(state.players)) {
      if (playerZones.victoryPoints >= 3) {
        return playerId as PlayerId;
      }
    }
    return null;
  }
}
