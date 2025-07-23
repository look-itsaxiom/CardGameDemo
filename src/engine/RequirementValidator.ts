/**
 * Requirement Validator - Validates card requirements and targeting restrictions
 *
 * Single Responsibility: Determines if cards can be played and finds valid targets
 */

import { GameState, PlayerId, Requirement, TargetRestriction, SummonUnit } from "../types/index";
import { GameStateManager } from "./GameStateManager";

export class RequirementValidator {
  constructor(private gameStateManager: GameStateManager) {}

  /**
   * Check if all requirements are met for playing a card
   */
  checkRequirements(requirements: Requirement[], playerId: PlayerId, state: GameState): { valid: boolean; failedRequirement?: string } {
    for (const requirement of requirements) {
      const result = this.checkSingleRequirement(requirement, playerId, state);
      if (!result.valid) {
        return { valid: false, failedRequirement: result.message };
      }
    }
    return { valid: true };
  }

  /**
   * Find all valid targets for a card's targeting restrictions
   */
  findValidTargets(restrictions: TargetRestriction[], playerId: PlayerId, state: GameState): string[] {
    const validTargets: string[] = [];

    for (const restriction of restrictions) {
      const targets = this.findTargetsForRestriction(restriction, playerId, state);
      validTargets.push(...targets);
    }

    // Remove duplicates
    return Array.from(new Set(validTargets));
  }

  /**
   * Validate a specific target against restrictions
   */
  isValidTarget(targetId: string, restrictions: TargetRestriction[], playerId: PlayerId, state: GameState): boolean {
    const validTargets = this.findValidTargets(restrictions, playerId, state);
    return validTargets.includes(targetId);
  }

  private checkSingleRequirement(requirement: Requirement, playerId: PlayerId, state: GameState): { valid: boolean; message: string } {
    switch (requirement.type) {
      case "controlsRoleFamily":
        return this.checkControlsRoleFamily(requirement, playerId, state);

      case "controlsSummon":
        return this.checkControlsSummon(requirement, playerId, state);

      case "hasTargetInZone":
        return this.checkHasTargetInZone(requirement, playerId, state);

      case "canPayCost":
        return this.checkCanPayCost(requirement, playerId, state);

      default:
        return { valid: false, message: `Unknown requirement type: ${(requirement as any).type}` };
    }
  }

  private checkControlsRoleFamily(requirement: any, playerId: PlayerId, state: GameState): { valid: boolean; message: string } {
    const targetFamily = requirement.roleFamily as string;

    // Get current player's summon IDs and then get the actual summon units
    const playerSummonIds = state.players[playerId]?.summonUnits || [];
    const playerSummons = playerSummonIds.map((id) => state.summonUnits[id]).filter(Boolean);

    const hasFamily = playerSummons.some((summon) => {
      const role = this.gameStateManager.getCurrentRole(summon.id);
      return role && this.getRoleFamily(role.roleType) === targetFamily;
    });

    return {
      valid: hasFamily,
      message: hasFamily ? "" : `No ${targetFamily} summons controlled`,
    };
  }

  private checkControlsSummon(requirement: any, playerId: PlayerId, state: GameState): { valid: boolean; message: string } {
    const playerSummonIds = state.players[playerId]?.summonUnits || [];
    const playerSummons = playerSummonIds.map((id) => state.summonUnits[id]).filter(Boolean);

    if (requirement.count && playerSummons.length < requirement.count) {
      return {
        valid: false,
        message: `Need at least ${requirement.count} summons, have ${playerSummons.length}`,
      };
    }

    return { valid: true, message: "" };
  }

  private checkHasTargetInZone(requirement: any, _playerId: PlayerId, state: GameState): { valid: boolean; message: string } {
    const zone = requirement.zone;
    const targetType = requirement.targetType;

    // For now, assume we're checking summons in play
    if (zone === "inPlay" && targetType === "summon") {
      const allSummons = Object.values(state.summonUnits);
      return {
        valid: allSummons.length > 0,
        message: allSummons.length > 0 ? "" : "No valid targets in play",
      };
    }

    return { valid: true, message: "" };
  }

  private checkCanPayCost(_requirement: any, _playerId: PlayerId, _state: GameState): { valid: boolean; message: string } {
    // For now, assume all costs can be paid (no resource system yet)
    return { valid: true, message: "" };
  }

  private findTargetsForRestriction(restriction: TargetRestriction, playerId: PlayerId, state: GameState): string[] {
    switch (restriction.type) {
      case "summon":
        return this.findSummonTargets(restriction, playerId, state);

      case "card":
        return this.findCardTargets(restriction, playerId, state);

      case "space":
        return this.findSpaceTargets(restriction, playerId, state);

      case "building":
        return this.findBuildingTargets(restriction, playerId, state);

      case "equipment":
        return this.findEquipmentTargets(restriction, playerId, state);

      default:
        return [];
    }
  }

  private findSummonTargets(restriction: any, playerId: PlayerId, state: GameState): string[] {
    let validTargets = Object.values(state.summonUnits);

    // Filter by controller
    if (restriction.controller === "self") {
      const playerSummonIds = state.players[playerId]?.summonUnits || [];
      validTargets = validTargets.filter((s) => playerSummonIds.includes(s.id));
    } else if (restriction.controller === "opponent") {
      const playerSummonIds = state.players[playerId]?.summonUnits || [];
      validTargets = validTargets.filter((s) => !playerSummonIds.includes(s.id));
    }

    // Filter by role family
    if (restriction.roleFamily) {
      validTargets = validTargets.filter((summon) => {
        const role = this.gameStateManager.getCurrentRole(summon.id);
        return role && restriction.roleFamily.includes(this.getRoleFamily(role.roleType));
      });
    }

    // Filter by minimum level
    if (restriction.minLevel) {
      validTargets = validTargets.filter((s) => s.level >= restriction.minLevel);
    }

    return validTargets.map((s) => s.id);
  }

  private findCardTargets(_restriction: any, _playerId: PlayerId, _state: GameState): string[] {
    // Implementation for card targeting - placeholder
    return [];
  }

  private findSpaceTargets(_restriction: any, _playerId: PlayerId, _state: GameState): string[] {
    // Implementation for space targeting - placeholder
    return [];
  }

  private findBuildingTargets(_restriction: any, _playerId: PlayerId, _state: GameState): string[] {
    // Implementation for building targeting - placeholder
    return [];
  }

  private findEquipmentTargets(_restriction: any, _playerId: PlayerId, _state: GameState): string[] {
    // Implementation for equipment targeting - placeholder
    return [];
  }

  private getRoleFamily(roleType: string): string {
    // Map role types to families based on the game design
    const familyMap: Record<string, string> = {
      warrior: "warrior",
      berserker: "warrior",
      knight: "warrior",
      scout: "scout",
      ranger: "scout",
      rogue: "scout",
      magician: "magician",
      cleric: "magician",
      warlock: "magician",
    };

    return familyMap[roleType.toLowerCase()] || "warrior";
  }
}
