/**
 * Board Manager - Handles board state and unit placement
 *
 * Single Responsibility: Manages board positions, occupancy, and spatial logic
 */

import { Position, positionToId, BoardPosition, SummonUnit, Player, SummonSlot } from "../types/index.js";
import { GameStateManager } from "./GameStateManager.js";
import { summonUnitSynthesis } from "./SummonUnitSynthesisService.js";

export class BoardManager {
  constructor(private stateManager: GameStateManager, private players: Player[]) {}

  /**
   * Validate position is valid and in correct territory
   */
  validateSummonPlacement(playerId: string, position: Position): { valid: boolean; message: string } {
    const state = this.stateManager.getState();

    // Validate position exists on board
    const posId = positionToId(position);
    const boardPos = state.zones.board[posId];
    if (!boardPos) {
      return { valid: false, message: "Invalid board position" };
    }

    // Validate position is in player's territory
    const playerTerritory = playerId === this.players[0].id ? "player1" : "player2";
    if (boardPos.territory !== playerTerritory) {
      return { valid: false, message: "Can only place summons in your territory" };
    }

    // Validate position is not occupied by another summon
    const hasUnitOccupant = boardPos.occupants[3].length > 0; // Layer 3 = UNITS
    if (hasUnitOccupant) {
      return { valid: false, message: "Position already occupied by another unit" };
    }

    return { valid: true, message: "Valid placement" };
  }

  /**
   * Place summon unit on board
   */
  placeSummonUnit(summonUnit: SummonUnit): void {
    const state = this.stateManager.getState();
    const posId = positionToId(summonUnit.position);
    const boardPos = state.zones.board[posId];

    // Add unit to game state
    state.summonUnits[summonUnit.id] = summonUnit;

    // Add to board
    boardPos.occupants[3].push({
      id: summonUnit.id,
      type: "summon",
      layer: 3, // UNITS layer
    });
  }

  /**
   * Check if a unit can move to a position
   */
  canMoveUnit(unitId: string, targetPosition: Position): { canMove: boolean; message: string } {
    const state = this.stateManager.getState();
    const unit = state.summonUnits[unitId];

    if (!unit) {
      return { canMove: false, message: "Unit not found" };
    }

    // Check if unit has movement left
    if (unit.movementUsed >= unit.totalMovement) {
      return { canMove: false, message: "Unit has no movement remaining" };
    }

    // Check if target position exists
    const posId = positionToId(targetPosition);
    const targetBoardPos = state.zones.board[posId];
    if (!targetBoardPos) {
      return { canMove: false, message: "Target position does not exist" };
    }

    // Check if target position is occupied by another unit
    const hasUnitOccupant = targetBoardPos.occupants[3].length > 0;
    if (hasUnitOccupant) {
      return { canMove: false, message: "Target position occupied by another unit" };
    }

    // Calculate distance (simplified Manhattan distance)
    const distance = Math.abs(unit.position.x - targetPosition.x) + Math.abs(unit.position.y - targetPosition.y);
    const remainingMovement = unit.totalMovement - unit.movementUsed;

    if (distance > remainingMovement) {
      return { canMove: false, message: `Distance ${distance} exceeds remaining movement ${remainingMovement}` };
    }

    return { canMove: true, message: "Can move to target position" };
  }

  /**
   * Move a unit to a new position
   */
  moveUnit(unitId: string, targetPosition: Position): { success: boolean; message: string } {
    const moveCheck = this.canMoveUnit(unitId, targetPosition);
    if (!moveCheck.canMove) {
      return { success: false, message: moveCheck.message };
    }

    const state = this.stateManager.getState();
    const unit = state.summonUnits[unitId];

    // Calculate movement cost
    const distance = Math.abs(unit.position.x - targetPosition.x) + Math.abs(unit.position.y - targetPosition.y);

    // Remove unit from current position
    const currentPosId = positionToId(unit.position);
    const currentBoardPos = state.zones.board[currentPosId];
    currentBoardPos.occupants[3] = currentBoardPos.occupants[3].filter((occ) => occ.id !== unitId);

    // Add unit to new position
    const targetPosId = positionToId(targetPosition);
    const targetBoardPos = state.zones.board[targetPosId];
    targetBoardPos.occupants[3].push({
      id: unitId,
      type: "summon",
      layer: 3,
    });

    // Update unit state
    unit.position = targetPosition;
    unit.movementUsed += distance;

    return { success: true, message: `Unit moved to ${targetPosition.x},${targetPosition.y}. Movement used: ${unit.movementUsed}/${unit.totalMovement}` };
  }
  /**
   * Create summon unit from a summon slot configuration
   * Now uses proper Summon+Role+Equipment synthesis
   */
  createSummonUnitFromSlot(summonSlot: SummonSlot, position: Position): SummonUnit | null {
    return summonUnitSynthesis.createSummonUnitFromSlot(summonSlot, position);
  }

  /**
   * Deprecated: Use createSummonUnitFromSlot instead
   * This method is kept for backward compatibility but should not be used
   */
  createSummonUnit(cardId: string, position: Position): SummonUnit {
    console.warn("createSummonUnit is deprecated. Use createSummonUnitFromSlot instead.");

    // Fallback: Create a minimal summon unit for backward compatibility
    const unitId = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: unitId,
      baseCard: cardId as any,
      currentRole: "020-warrior-Alpha", // Default to warrior role
      currentEquipment: {
        weapon: undefined,
        offhand: undefined,
        armor: undefined,
        accessory: undefined,
      },
      level: 5,
      currentStats: {
        STR: 15,
        END: 15,
        DEF: 15,
        INT: 15,
        SPI: 15,
        MDF: 15,
        SPD: 15,
        ACC: 15,
        LCK: 15,
      },
      maxHP: 65,
      currentHP: 65,
      position,
      statusEffects: [],
      maxAttacks: 1,
      attacksUsed: 0,
      totalMovement: 3,
      movementUsed: 0,
      completedQuests: [],
      questParticipations: [],
    };
  }
}
