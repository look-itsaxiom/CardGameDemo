/**
 * Effect Type Registry - Central registry for all effect types
 *
 * Single Responsibility: Manages effect type definitions and executors
 */

import { GameState, SummonUnit, PlayerId, CardId, Effect, EffectContext, EffectResult } from "../types/index";
import { GameStateManager } from "./GameStateManager";

export interface EffectExecutor {
  (effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult>;
}

export interface EffectValidator {
  (effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string };
}

export interface EffectTargeter {
  (effect: Effect, context: EffectContext, state: GameState): string[];
}

export interface EffectTypeDefinition {
  id: string;
  name: string;
  description: string;
  executor: EffectExecutor;
  validator: EffectValidator;
  targeter: EffectTargeter;
}

export class EffectTypeRegistry {
  private static instance: EffectTypeRegistry;
  private effectTypes: Map<string, EffectTypeDefinition> = new Map();

  private constructor() {
    this.registerCoreEffectTypes();
  }

  static getInstance(): EffectTypeRegistry {
    if (!EffectTypeRegistry.instance) {
      EffectTypeRegistry.instance = new EffectTypeRegistry();
    }
    return EffectTypeRegistry.instance;
  }

  /**
   * Register a new effect type
   */
  registerEffectType(definition: EffectTypeDefinition): void {
    this.effectTypes.set(definition.id, definition);
  }

  /**
   * Get effect type definition
   */
  getEffectType(id: string): EffectTypeDefinition | undefined {
    return this.effectTypes.get(id);
  }

  /**
   * Get all registered effect types
   */
  getAllEffectTypes(): EffectTypeDefinition[] {
    return Array.from(this.effectTypes.values());
  }

  /**
   * Execute an effect
   */
  async executeEffect(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const effectType = this.effectTypes.get(effect.type);
    if (!effectType) {
      return {
        success: false,
        message: `Unknown effect type: ${effect.type}`,
        changes: [],
      };
    }

    // Validate effect first
    const validation = effectType.validator(effect, context, state);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        changes: [],
      };
    }

    // Execute effect
    return await effectType.executor(effect, context, state);
  }

  /**
   * Validate an effect
   */
  validateEffect(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    const effectType = this.effectTypes.get(effect.type);
    if (!effectType) {
      return { valid: false, message: `Unknown effect type: ${effect.type}` };
    }

    return effectType.validator(effect, context, state);
  }

  /**
   * Get valid targets for an effect
   */
  getValidTargets(effect: Effect, context: EffectContext, state: GameState): string[] {
    const effectType = this.effectTypes.get(effect.type);
    if (!effectType) {
      return [];
    }

    return effectType.targeter(effect, context, state);
  }

  /**
   * Register core effect types that are fundamental to the game
   */
  private registerCoreEffectTypes(): void {
    // Basic summon healing
    this.registerEffectType({
      id: "healSummon",
      name: "Heal Summon",
      description: "Heals target summon for specified amount",
      executor: this.executeHealSummon.bind(this),
      validator: this.validateHealSummon.bind(this),
      targeter: this.targetHealSummon.bind(this),
    });

    // Basic summon damage
    this.registerEffectType({
      id: "damageSummon",
      name: "Damage Summon",
      description: "Deals damage to target summon",
      executor: this.executeDamageSummon.bind(this),
      validator: this.validateDamageSummon.bind(this),
      targeter: this.targetDamageSummon.bind(this),
    });

    // Level up summons
    this.registerEffectType({
      id: "levelUp",
      name: "Level Up",
      description: "Increases summon level and recalculates stats",
      executor: this.executeLevelUp.bind(this),
      validator: this.validateLevelUp.bind(this),
      targeter: this.targetLevelUp.bind(this),
    });

    // Zone movement for cards
    this.registerEffectType({
      id: "changeZone",
      name: "Change Zone",
      description: "Moves cards between game zones",
      executor: this.executeChangeZone.bind(this),
      validator: this.validateChangeZone.bind(this),
      targeter: this.targetChangeZone.bind(this),
    });

    // Enter play zone (for buildings, quests, etc.)
    this.registerEffectType({
      id: "enterPlayZone",
      name: "Enter Play Zone",
      description: "Places card in the In Play zone",
      executor: this.executeEnterPlayZone.bind(this),
      validator: this.validateEnterPlayZone.bind(this),
      targeter: this.targetEnterPlayZone.bind(this),
    });
  }

  // ============================================================================
  // CORE EFFECT IMPLEMENTATIONS
  // ============================================================================

  private async executeHealSummon(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const { targetId, casterId } = context;
    const { healingFormula, basePower, canCrit, critMultiplier } = effect.parameters;

    const target = state.summonUnits[targetId!];
    const caster = casterId ? state.summonUnits[casterId] : null;

    if (!target) {
      return { success: false, message: "Target summon not found", changes: [] };
    }

    if (!caster && healingFormula.includes("caster")) {
      return { success: false, message: "Caster required for healing formula", changes: [] };
    }

    // Calculate heal amount
    let healAmount = this.calculateFormulaValue(healingFormula, {
      caster: caster?.currentStats,
      target: target.currentStats,
      basePower,
    });

    // Check for critical heal
    if (canCrit && caster) {
      const critChance = Math.floor(caster.currentStats.LCK * 0.3375 + 1.65);
      const roll = Math.floor(Math.random() * 100) + 1;

      if (roll <= critChance) {
        healAmount = Math.floor(healAmount * critMultiplier);
      }
    }

    // Apply healing
    const newHP = Math.min(target.currentHP + healAmount, target.maxHP);
    const actualHeal = newHP - target.currentHP;

    target.currentHP = newHP;

    return {
      success: true,
      message: `${target.baseCard} healed for ${actualHeal} HP (${target.currentHP}/${target.maxHP})`,
      changes: [
        {
          type: "summonHealed",
          targetId: targetId!,
          amount: actualHeal,
          newHP: target.currentHP,
        },
      ],
    };
  }

  private validateHealSummon(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    const { targetId } = context;

    if (!targetId) {
      return { valid: false, message: "No target specified for heal" };
    }

    const target = state.summonUnits[targetId];
    if (!target) {
      return { valid: false, message: "Target summon not found" };
    }

    if (target.currentHP >= target.maxHP) {
      return { valid: false, message: "Target is already at full HP" };
    }

    return { valid: true, message: "Valid heal target" };
  }

  private targetHealSummon(effect: Effect, context: EffectContext, state: GameState): string[] {
    // Return all summons that could be healed
    return Object.values(state.summonUnits)
      .filter((unit) => unit.currentHP < unit.maxHP)
      .map((unit) => unit.id);
  }

  private async executeDamageSummon(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const { targetId, casterId } = context;
    const { damageFormula, basePower, canCrit, critMultiplier, damageType } = effect.parameters;

    const target = state.summonUnits[targetId!];
    const caster = casterId ? state.summonUnits[casterId] : null;

    if (!target) {
      return { success: false, message: "Target summon not found", changes: [] };
    }

    // Calculate damage
    let damage = this.calculateFormulaValue(damageFormula, {
      caster: caster?.currentStats,
      target: target.currentStats,
      basePower,
    });

    // Check for critical hit
    if (canCrit && caster) {
      const critChance = Math.floor(caster.currentStats.LCK * 0.3375 + 1.65);
      const roll = Math.floor(Math.random() * 100) + 1;

      if (roll <= critChance) {
        damage = Math.floor(damage * critMultiplier);
      }
    }

    // Apply damage
    const newHP = Math.max(0, target.currentHP - damage);
    const actualDamage = target.currentHP - newHP;
    target.currentHP = newHP;

    const changes = [
      {
        type: "summonDamaged",
        targetId: targetId!,
        amount: actualDamage,
        newHP: target.currentHP,
      },
    ];

    let message = `${target.baseCard} takes ${actualDamage} damage (${target.currentHP}/${target.maxHP})`;

    // Check if summon was defeated
    if (target.currentHP <= 0) {
      // Remove from board and game state
      const posId = `${target.position.x},${target.position.y}`;
      const boardPos = state.zones.board[posId];
      if (boardPos) {
        boardPos.occupants[3] = boardPos.occupants[3].filter((occ) => occ.id !== target.id);
      }

      // Award victory points
      const opponent =
        context.playerId === state.activePlayer
          ? state.activePlayer === Object.keys(state.players)[0]
            ? Object.keys(state.players)[1]
            : Object.keys(state.players)[0]
          : state.activePlayer;

      // Tier 1 summons = 1 VP, Tier 2+ = 2 VP (TODO: detect tier properly)
      const vpAwarded = 1; // Simplified for now
      state.victoryPoints[opponent] += vpAwarded;

      // Move to defeated units
      state.players[context.playerId].defeatedUnits.push(target);
      delete state.summonUnits[target.id];

      changes.push({
        type: "summonDefeated",
        targetId: targetId!,
        vpAwarded,
        awardedTo: opponent,
      });

      message += ` - DEFEATED! ${opponent} gains ${vpAwarded} VP`;
    }

    return {
      success: true,
      message,
      changes,
    };
  }

  private validateDamageSummon(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    const { targetId } = context;

    if (!targetId) {
      return { valid: false, message: "No target specified for damage" };
    }

    const target = state.summonUnits[targetId];
    if (!target) {
      return { valid: false, message: "Target summon not found" };
    }

    return { valid: true, message: "Valid damage target" };
  }

  private targetDamageSummon(effect: Effect, context: EffectContext, state: GameState): string[] {
    // Return all summons that could be damaged
    return Object.keys(state.summonUnits);
  }

  private async executeLevelUp(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const { targetId } = context;
    const { levels } = effect.parameters;

    const target = state.summonUnits[targetId!];
    if (!target) {
      return { success: false, message: "Target summon not found", changes: [] };
    }

    const oldLevel = target.level;
    const newLevel = Math.min(20, target.level + levels);
    target.level = newLevel;

    // TODO: Recalculate stats using SummonUnitSynthesisService
    // For now, just update level

    return {
      success: true,
      message: `${target.baseCard} levels up from ${oldLevel} to ${newLevel}`,
      changes: [
        {
          type: "summonLevelUp",
          targetId: targetId!,
          oldLevel,
          newLevel,
        },
      ],
    };
  }

  private validateLevelUp(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    const { targetId } = context;

    if (!targetId) {
      return { valid: false, message: "No target specified for level up" };
    }

    const target = state.summonUnits[targetId];
    if (!target) {
      return { valid: false, message: "Target summon not found" };
    }

    if (target.level >= 20) {
      return { valid: false, message: "Target is already at max level (20)" };
    }

    return { valid: true, message: "Valid level up target" };
  }

  private targetLevelUp(effect: Effect, context: EffectContext, state: GameState): string[] {
    return Object.values(state.summonUnits)
      .filter((unit) => unit.level < 20)
      .map((unit) => unit.id);
  }

  private async executeChangeZone(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const { targetId, playerId } = context;
    const { fromZone, toZone, amount = 1 } = effect.parameters;

    // TODO: Implement card zone movement logic
    return {
      success: true,
      message: `Moved card from ${fromZone} to ${toZone}`,
      changes: [
        {
          type: "cardZoneChanged",
          cardId: targetId!,
          fromZone,
          toZone,
        },
      ],
    };
  }

  private validateChangeZone(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    // TODO: Validate zone movement
    return { valid: true, message: "Valid zone change" };
  }

  private targetChangeZone(effect: Effect, context: EffectContext, state: GameState): string[] {
    // TODO: Find valid cards for zone movement
    return [];
  }

  private async executeEnterPlayZone(effect: Effect, context: EffectContext, state: GameState): Promise<EffectResult> {
    const { sourceCardId, playerId } = context;

    if (!sourceCardId) {
      return { success: false, message: "No source card specified", changes: [] };
    }

    // Add card to in play zone
    state.zones.inPlay.push(sourceCardId);

    return {
      success: true,
      message: `${sourceCardId} enters play`,
      changes: [
        {
          type: "cardEnteredPlay",
          cardId: sourceCardId,
        },
      ],
    };
  }

  private validateEnterPlayZone(effect: Effect, context: EffectContext, state: GameState): { valid: boolean; message: string } {
    return { valid: true, message: "Valid enter play" };
  }

  private targetEnterPlayZone(effect: Effect, context: EffectContext, state: GameState): string[] {
    return [];
  }

  /**
   * Helper method to calculate formula values
   */
  private calculateFormulaValue(formula: string, variables: Record<string, any>): number {
    // Simple formula evaluator - replace with more robust implementation
    let result = formula;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "object" && value !== null) {
        // Handle nested objects like caster.SPI
        for (const [subKey, subValue] of Object.entries(value)) {
          result = result.replace(new RegExp(`${key}\\.${subKey}`, "g"), subValue.toString());
        }
      } else if (typeof value === "number") {
        result = result.replace(new RegExp(`\\b${key}\\b`, "g"), value.toString());
      }
    }

    try {
      // Basic math evaluation (DANGEROUS - replace with safe evaluator)
      return Math.floor(eval(result));
    } catch (error) {
      console.error(`Formula evaluation error: ${formula} -> ${result}`, error);
      return 0;
    }
  }
}
