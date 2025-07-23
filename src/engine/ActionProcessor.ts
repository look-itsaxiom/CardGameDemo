/**
 * Action Processor - Handles different types of player actions
 *
 * Single Responsibility: Processes and validates player actions
 */

import { GameAction, GamePhase, PlayerZones } from "../types/index.js";
import { GameStateManager } from "./GameStateManager.js";
import { CardManager } from "./CardManager.js";
import { BoardManager } from "./BoardManager.js";
import { PhaseManager } from "./PhaseManager.js";
import { EffectTypeRegistry } from "./EffectTypeRegistry.js";
import { StackManager } from "./StackManager.js";
import { TriggerDetector } from "./TriggerDetector.js";
import { RequirementValidator } from "./RequirementValidator.js";
import { summonUnitSynthesis } from "./SummonUnitSynthesisService.js";

export class ActionProcessor {
  constructor(
    private stateManager: GameStateManager,
    private cardManager: CardManager,
    private boardManager: BoardManager,
    private phaseManager: PhaseManager,
    private effectRegistry?: EffectTypeRegistry,
    private stackManager?: StackManager,
    private triggerDetector?: TriggerDetector,
    private requirementValidator?: RequirementValidator
  ) {}

  /**
   * Process a player action and update game state
   */
  processAction(action: GameAction): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    // Validate action is from active player (except during response windows)
    if (!state.awaitingResponse && action.playerId !== state.activePlayer) {
      return {
        success: false,
        message: `It is not ${action.playerId}'s turn. Current active player: ${state.activePlayer}`,
      };
    }

    try {
      switch (action.type) {
        case "endPhase":
          return this.phaseManager.processEndPhase();
        case "playCard":
          return this.processPlayCard(action);
        case "moveUnit":
          return this.processMoveUnit(action);
        case "attackUnit":
          return this.processAttackUnit(action);
        default:
          return {
            success: false,
            message: `Unknown action type: ${action.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error processing action: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Process play card action
   */
  private processPlayCard(action: GameAction): { success: boolean; message: string } {
    if (action.type !== "playCard") {
      return { success: false, message: "Invalid action type" };
    }

    const { cardId, position } = action.parameters;
    const state = this.stateManager.getState();
    const playerZones = state.players[action.playerId];

    // Validate card is in player's hand
    const cardIndex = this.cardManager.validateCardInHand(playerZones, cardId);
    if (cardIndex === -1) {
      return { success: false, message: `Card ${cardId} not found in hand` };
    }

    // Get card from database
    const card = this.cardManager.getCard(cardId);
    if (!card) {
      return { success: false, message: `Card ${cardId} not found in database` };
    }

    // Handle different card types
    if (card.type === "summon") {
      return this.processSummonPlacement(action.playerId, cardId, position, cardIndex, playerZones);
    }

    // For playable cards (action, building, quest, etc.), use Phase 6 systems
    if (this.requirementValidator) {
      const playableCard = card as any; // Cast to PlayableCard
      if (playableCard.requirements) {
        const validationResult = this.requirementValidator.checkRequirements(playableCard.requirements, action.playerId, state);
        if (!validationResult.valid) {
          return { success: false, message: validationResult.failedRequirement || "Requirements not met" };
        }
      }
    }

    // For now, handle action cards specifically
    if (card.type === "action") {
      return this.processActionCard(action.playerId, cardId, cardIndex, playerZones);
    }

    return { success: false, message: `Card type ${card.type} processing not yet implemented` };
  }

  /**
   * Process action card play - integrates with Phase 6 effect system
   */
  private processActionCard(playerId: string, cardId: string, cardIndex: number, playerZones: PlayerZones): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    // Validate it's action phase
    if (state.phase !== GamePhase.ACTION) {
      return { success: false, message: "Can only play action cards during Action Phase" };
    }

    const card = this.cardManager.getCard(cardId);
    if (!card || card.type !== "action") {
      return { success: false, message: "Invalid action card" };
    }

    // Remove card from hand and add to appropriate pile
    const playableCard = card as any;
    const removedCardId = this.cardManager.removeCardFromHand(playerZones, cardIndex);
    if (!removedCardId) {
      return { success: false, message: "Failed to remove card from hand" };
    }

    // Add to destination pile (for now just remove from game)
    // TODO: Implement proper pile management for discard/recharge/removed

    // If we have Phase 6 systems available, add effects to stack
    if (this.stackManager && this.effectRegistry && playableCard.effects) {
      const stackEntry = {
        id: `${cardId}_${Date.now()}`,
        playerId: playerId,
        speed: playableCard.speed,
        source: cardId,
        effects: playableCard.effects,
      };

      const addResult = this.stackManager.addEffectToStack(stackEntry);
      if (!addResult.success) {
        return { success: false, message: `Failed to add effect to stack: ${addResult.message}` };
      }

      // Emit event for triggers
      if (this.triggerDetector) {
        this.triggerDetector.emitEvent("card_played", playerId, {
          cardId: cardId,
          cardType: card.type,
          effects: playableCard.effects,
        });
      }

      return { success: true, message: `Action card ${cardId} played successfully. Effects added to stack.` };
    }

    // Fallback for when Phase 6 systems aren't available
    return { success: true, message: `Action card ${cardId} played successfully (effects system not integrated).` };
  }

  /**
   * Process summon card placement on board
   * For now, this uses the old createSummonUnit method for compatibility.
   * TODO: Update to use summon slot selection when CLI supports it.
   */
  private processSummonPlacement(
    playerId: string,
    cardId: string,
    position: any,
    cardIndex: number,
    playerZones: PlayerZones
  ): { success: boolean; message: string } {
    const state = this.stateManager.getState();

    // Validate it's action phase
    if (state.phase !== GamePhase.ACTION) {
      return { success: false, message: "Can only play summons during Action Phase" };
    }

    // Validate turn summon hasn't been used
    if (state.turnSummonUsed) {
      return { success: false, message: "Already used turn summon this turn" };
    }

    // Validate board placement
    const placementValidation = this.boardManager.validateSummonPlacement(playerId, position);
    if (!placementValidation.valid) {
      return { success: false, message: placementValidation.message };
    }

    // Create and place summon unit (using deprecated method for now)
    const summonUnit = this.boardManager.createSummonUnit(cardId, position);
    this.boardManager.placeSummonUnit(summonUnit);

    // Remove card from hand
    this.cardManager.removeCardFromHand(playerZones, cardIndex);

    // Add unit to player's summon list
    playerZones.summonUnits.push(summonUnit.id);

    // Mark turn summon as used
    this.stateManager.updateState({ turnSummonUsed: true });

    // Draw 3 cards for summon draws
    const cardsDrawn = this.cardManager.drawCards(playerZones, 3);

    return {
      success: true,
      message: `Placed summon unit at (${position.x}, ${position.y}). Drew ${cardsDrawn} cards. [Using legacy method - summon slots not yet integrated]`,
    };
  }

  /**
   * Process unit movement action
   */
  private processMoveUnit(action: GameAction): { success: boolean; message: string } {
    if (action.type !== "moveUnit") {
      return { success: false, message: "Invalid action type" };
    }

    const { unitId, targetPosition } = action.parameters;
    const state = this.stateManager.getState();

    // Validate it's action phase
    if (state.phase !== GamePhase.ACTION) {
      return { success: false, message: "Can only move units during Action Phase" };
    }

    // Validate player owns this unit
    const playerZones = state.players[action.playerId];
    if (!playerZones.summonUnits.includes(unitId)) {
      return { success: false, message: "You don't control this unit" };
    }

    // Process movement through BoardManager
    return this.boardManager.moveUnit(unitId, targetPosition);
  }

  /**
   * Process basic attack action
   */
  private processAttackUnit(action: GameAction): { success: boolean; message: string } {
    if (action.type !== "attackUnit") {
      return { success: false, message: "Invalid action type" };
    }

    const { attackerUnitId, targetUnitId } = action.parameters;
    const state = this.stateManager.getState();

    // Validate it's action phase
    if (state.phase !== GamePhase.ACTION) {
      return { success: false, message: "Can only attack during Action Phase" };
    }

    // Validate player owns the attacking unit
    const playerZones = state.players[action.playerId];
    if (!playerZones.summonUnits.includes(attackerUnitId)) {
      return { success: false, message: "You don't control this unit" };
    }

    // Get units
    const attacker = state.summonUnits[attackerUnitId];
    const target = state.summonUnits[targetUnitId];

    if (!attacker || !target) {
      return { success: false, message: "Attacker or target unit not found" };
    }

    // Validate attacker has attacks remaining
    if (attacker.attacksUsed >= attacker.maxAttacks) {
      return { success: false, message: "Unit has no attacks remaining this turn" };
    }

    // Weapon-based range check
    const weaponRange = summonUnitSynthesis.getWeaponRange(attacker);
    const distance = Math.abs(attacker.position.x - target.position.x) + Math.abs(attacker.position.y - target.position.y);

    if (distance > weaponRange) {
      return {
        success: false,
        message: `Target not in attack range (distance: ${distance}, weapon range: ${weaponRange})`,
      };
    }

    // Calculate hit chance: 90% + (ACC / 10)
    const hitChance = 90 + attacker.currentStats.ACC / 10;
    const hitRoll = Math.random() * 100;
    const didHit = hitRoll <= hitChance;

    if (!didHit) {
      attacker.attacksUsed++;
      return { success: true, message: `Attack missed! (rolled ${hitRoll.toFixed(1)} vs ${hitChance.toFixed(1)}% hit chance)` };
    }

    // Calculate critical hit: Floor((LCK * 0.3375) + 1.65)
    const critChance = Math.floor(attacker.currentStats.LCK * 0.3375 + 1.65);
    const critRoll = Math.random() * 100;
    const didCrit = critRoll <= critChance;
    const critMultiplier = didCrit ? 1.5 : 1.0;

    // Weapon-based damage calculation
    const weaponPower = summonUnitSynthesis.getWeaponPower(attacker);
    const weaponData = summonUnitSynthesis.getWeaponData(attacker);

    // Determine damage stat (STR for most weapons, could be STR+ACC for bows)
    let damageStat = attacker.currentStats.STR;
    if (weaponData?.effects?.[0]?.parameters?.damageStat === "STR+ACC") {
      damageStat = (attacker.currentStats.STR + attacker.currentStats.ACC) / 2;
    }

    // Calculate damage: (DamageStat + WeaponPower) * DamageMultiplier * (DamageStat / Target DEF) * CRIT
    const baseDamage = (damageStat + weaponPower) * 1.4 * (damageStat / target.currentStats.DEF);
    const totalDamage = Math.floor(baseDamage * critMultiplier);

    // Apply damage
    target.currentHP = Math.max(0, target.currentHP - totalDamage);
    attacker.attacksUsed++;

    let resultMessage = `${didCrit ? "CRITICAL HIT! " : ""}Attack hit for ${totalDamage} damage!`;

    // Check if target was defeated
    if (target.currentHP <= 0) {
      resultMessage += ` ${targetUnitId} was defeated!`;

      // Award victory point to attacker's owner
      const attackingPlayerId = action.playerId;
      state.victoryPoints[attackingPlayerId] = (state.victoryPoints[attackingPlayerId] || 0) + 1;

      // Remove defeated unit from board and player control
      const targetOwner = Object.keys(state.players).find((playerId) => state.players[playerId].summonUnits.includes(targetUnitId));

      if (targetOwner) {
        const targetPlayerZones = state.players[targetOwner];
        targetPlayerZones.summonUnits = targetPlayerZones.summonUnits.filter((id) => id !== targetUnitId);
      }

      // Remove from board
      const targetPosId = `${target.position.x},${target.position.y}`;
      const boardPos = state.zones.board[targetPosId];
      if (boardPos) {
        boardPos.occupants[3] = boardPos.occupants[3].filter((occ) => occ.id !== targetUnitId);
      }

      // Remove from game state
      delete state.summonUnits[targetUnitId];

      resultMessage += ` Victory Point awarded to ${attackingPlayerId}! (${state.victoryPoints[attackingPlayerId]} VP total)`;

      // Check win condition
      if (state.victoryPoints[attackingPlayerId] >= 3) {
        // Use state manager to end game properly
        this.stateManager.updateState({
          gameEnded: true,
          winner: attackingPlayerId,
        });
        resultMessage += ` GAME OVER! ${attackingPlayerId} wins!`;
      }
    } else {
      resultMessage += ` Target has ${target.currentHP}/${target.maxHP} HP remaining.`;
    }

    return { success: true, message: resultMessage };
  }
}
