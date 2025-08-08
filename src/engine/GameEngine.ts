/**
 * Game Engine
 * 
 * The main game engine that coordinates all subsystems and provides the
 * authoritative interface for game operations. Handles action processing,
 * turn management, and state updates.
 */

import { 
  GameAction,
  AnyGameAction,
  MoveUnitAction,
  AttackAction,
  EndPhaseAction,
  GameState,
  Position,
  SummonUnit,
  GamePhase
} from '@/types';

import { GameStateManager } from './GameStateManager';
import { FormulaCalculator } from './FormulaCalculator';

export interface GameEngineConfig {
  gameId: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
}

export class GameEngine {
  private stateManager: GameStateManager;
  private actionHistory: GameAction[] = [];

  constructor(config: GameEngineConfig) {
    this.stateManager = new GameStateManager(config.gameId);
    
    // Add players
    this.stateManager.addPlayer(config.player1Id, config.player1Name);
    this.stateManager.addPlayer(config.player2Id, config.player2Name);
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.stateManager.startGame();
    
    // Reset movement for the first player
    const currentPlayer = this.stateManager.getCurrentPlayer();
    if (currentPlayer) {
      this.stateManager.resetMovementForPlayer(currentPlayer.id);
    }
  }

  /**
   * Get current game state
   */
  getGameState(): Readonly<GameState> {
    return this.stateManager.getGameState();
  }

  /**
   * Process a game action
   */
  processAction(action: AnyGameAction): { success: boolean; message: string; gameState: GameState } {
    try {
      // Validate action can be performed
      const validation = this.validateAction(action);
      if (!validation.valid) {
        return { 
          success: false, 
          message: validation.reason || 'Invalid action', 
          gameState: this.getGameState() 
        };
      }

      // Process the action
      const result = this.executeAction(action);
      
      // Add to history if successful
      if (result.success) {
        this.actionHistory.push(action);
      }

      return {
        success: result.success,
        message: result.message,
        gameState: this.getGameState()
      };
    } catch (error) {
      return {
        success: false,
        message: `Action processing error: ${error}`,
        gameState: this.getGameState()
      };
    }
  }

  /**
   * Validate if an action can be performed
   */
  private validateAction(action: AnyGameAction): { valid: boolean; reason?: string } {
    const gameState = this.stateManager.getGameState();
    
    // Check if it's the acting player's turn
    if (action.playerId !== gameState.currentPlayer) {
      return { valid: false, reason: 'Not your turn' };
    }

    // Check if game is still active
    if (gameState.status !== 'playing') {
      return { valid: false, reason: 'Game is not active' };
    }

    // Validate action-specific requirements
    switch (action.type) {
      case 'move_unit':
        return this.validateMoveAction(action as MoveUnitAction);
      
      case 'attack':
        return this.validateAttackAction(action as AttackAction);
      
      case 'end_phase':
        return this.validateEndPhaseAction(action as EndPhaseAction);
      
      default:
        return { valid: true };
    }
  }

  /**
   * Validate move action
   */
  private validateMoveAction(action: MoveUnitAction): { valid: boolean; reason?: string } {
    const { unitId, targetPosition } = action.data;
    const gameState = this.stateManager.getGameState();
    
    // Check if it's action phase
    if (gameState.currentPhase !== GamePhase.ACTION) {
      return { valid: false, reason: 'Can only move during action phase' };
    }

    // Find the unit
    const unit = this.stateManager.findSummonUnit(unitId);
    if (!unit) {
      return { valid: false, reason: 'Unit not found' };
    }

    // Check if player owns the unit
    const player = this.stateManager.getPlayer(action.playerId);
    if (!player) {
      return { valid: false, reason: 'Player not found' };
    }

    let ownsUnit = false;
    for (const slot of Object.values(player.summonSlots)) {
      if (slot && slot.id === unitId) {
        ownsUnit = true;
        break;
      }
    }

    if (!ownsUnit) {
      return { valid: false, reason: 'You do not own this unit' };
    }

    // Check if target position is valid
    const distance = this.calculateDistance(unit.position, targetPosition);
    if (distance > unit.movement) {
      return { valid: false, reason: 'Not enough movement points' };
    }

    // Check if target position is free
    const occupant = this.stateManager.getSummonAtPosition(targetPosition);
    if (occupant) {
      return { valid: false, reason: 'Target position is occupied' };
    }

    return { valid: true };
  }

  /**
   * Validate attack action
   */
  private validateAttackAction(action: AttackAction): { valid: boolean; reason?: string } {
    const { attackerId, targetId } = action.data;
    const gameState = this.stateManager.getGameState();
    
    // Check if it's action phase
    if (gameState.currentPhase !== GamePhase.ACTION) {
      return { valid: false, reason: 'Can only attack during action phase' };
    }

    // Find units
    const attacker = this.stateManager.findSummonUnit(attackerId);
    const target = this.stateManager.findSummonUnit(targetId);
    
    if (!attacker || !target) {
      return { valid: false, reason: 'Attacker or target not found' };
    }

    // Check if attacker belongs to current player
    const currentPlayer = this.stateManager.getCurrentPlayer();
    if (!currentPlayer) {
      return { valid: false, reason: 'No current player' };
    }

    let ownsAttacker = false;
    for (const slot of Object.values(currentPlayer.summonSlots)) {
      if (slot && slot.id === attackerId) {
        ownsAttacker = true;
        break;
      }
    }

    if (!ownsAttacker) {
      return { valid: false, reason: 'You do not own the attacking unit' };
    }

    // Check if unit has already attacked
    if (attacker.hasAttacked) {
      return { valid: false, reason: 'Unit has already attacked this turn' };
    }

    // Check if target is in range (basic adjacent attack for now)
    const distance = this.calculateDistance(attacker.position, target.position);
    if (distance > 1) {
      return { valid: false, reason: 'Target is not in range' };
    }

    return { valid: true };
  }

  /**
   * Validate end phase action
   */
  private validateEndPhaseAction(_action: EndPhaseAction): { valid: boolean; reason?: string } {
    return { valid: true };
  }

  /**
   * Execute a validated action
   */
  private executeAction(action: AnyGameAction): { success: boolean; message: string } {
    switch (action.type) {
      case 'move_unit':
        return this.executeMoveAction(action as MoveUnitAction);
      
      case 'attack':
        return this.executeAttackAction(action as AttackAction);
      
      case 'end_phase':
        return this.executeEndPhaseAction(action as EndPhaseAction);
      
      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  }

  /**
   * Execute move action
   */
  private executeMoveAction(action: MoveUnitAction): { success: boolean; message: string } {
    const { unitId, targetPosition } = action.data;
    
    const unit = this.stateManager.findSummonUnit(unitId);
    if (!unit) {
      return { success: false, message: 'Unit not found' };
    }

    const distance = this.calculateDistance(unit.position, targetPosition);
    
    // Use movement points
    this.stateManager.useMovement(unitId, distance);
    
    // Move the unit
    this.stateManager.moveSummonUnit(unitId, targetPosition);
    
    return { 
      success: true, 
      message: `Moved unit ${distance} spaces to (${targetPosition.x}, ${targetPosition.y})` 
    };
  }

  /**
   * Execute attack action
   */
  private executeAttackAction(action: AttackAction): { success: boolean; message: string } {
    const { attackerId, targetId } = action.data;
    
    const attacker = this.stateManager.findSummonUnit(attackerId);
    const target = this.stateManager.findSummonUnit(targetId);
    
    if (!attacker || !target) {
      return { success: false, message: 'Attacker or target not found' };
    }

    // Calculate hit chance
    const hitChance = FormulaCalculator.calculateHitChance(90, attacker.currentStats.acc);
    const hit = FormulaCalculator.performHitRoll(hitChance);
    
    if (!hit) {
      attacker.hasAttacked = true;
      return { success: true, message: `Attack missed! (${hitChance.toFixed(1)}% chance)` };
    }

    // Calculate damage (basic physical attack)
    const damageResult = FormulaCalculator.calculatePhysicalDamage(
      attacker.currentStats.str,
      30, // Default weapon power
      target.currentStats.def
    );

    // Apply damage
    target.currentHP = Math.max(0, target.currentHP - damageResult.value);
    attacker.hasAttacked = true;

    let message = `Attack hit! ${damageResult.details}. Target HP: ${target.currentHP}/${target.maxHP}`;
    
    // Check if target was defeated
    if (target.currentHP === 0) {
      // Award victory point
      this.stateManager.addVictoryPoints(action.playerId, 1);
      
      // Remove defeated unit from board
      const positionKey = `${target.position.x},${target.position.y}`;
      const gameState = this.stateManager.getGameState();
      gameState.board.occupiedSpaces.delete(positionKey);
      
      // Remove from player's summon slots
      for (const player of Object.values(gameState.players)) {
        for (const [slotKey, slot] of Object.entries(player.summonSlots)) {
          if (slot && slot.id === targetId) {
            delete player.summonSlots[slotKey as keyof typeof player.summonSlots];
            break;
          }
        }
      }
      
      message += ` Unit defeated! Victory point awarded.`;
    }

    return { success: true, message };
  }

  /**
   * Execute end phase action
   */
  private executeEndPhaseAction(_action: EndPhaseAction): { success: boolean; message: string } {
    const currentPhase = this.stateManager.getGameState().currentPhase;
    
    // Advance to next phase
    this.stateManager.nextPhase();
    
    const newGameState = this.stateManager.getGameState();
    
    // Handle phase-specific logic
    if (newGameState.currentPhase === GamePhase.DRAW && newGameState.currentPlayer !== _action.playerId) {
      // New turn started, reset movement
      this.stateManager.resetMovementForPlayer(newGameState.currentPlayer);
      
      // Draw a card (skip first turn)
      if (newGameState.turn > 1) {
        this.stateManager.drawCard(newGameState.currentPlayer);
      }
    }
    
    if (newGameState.currentPhase === GamePhase.LEVEL) {
      // Level up all summons for current player
      this.levelUpSummons(newGameState.currentPlayer);
    }

    return { 
      success: true, 
      message: `Advanced from ${currentPhase} to ${newGameState.currentPhase}. Current player: ${newGameState.currentPlayer}` 
    };
  }

  /**
   * Level up all summons for a player
   */
  private levelUpSummons(playerId: string): void {
    const player = this.stateManager.getPlayer(playerId);
    if (!player) {
      return;
    }

    for (const unit of Object.values(player.summonSlots)) {
      if (unit) {
        // Increase level
        unit.level++;
        
        // Recalculate stats based on new level
        this.recalculateSummonStats(unit);
        
        // Increase current HP proportionally
        const hpRatio = unit.currentHP / unit.maxHP;
        unit.maxHP = FormulaCalculator.calculateMaxHP(unit.currentStats.end);
        unit.currentHP = Math.floor(unit.maxHP * hpRatio);
      }
    }
  }

  /**
   * Recalculate summon stats based on current level and equipment
   */
  private recalculateSummonStats(unit: SummonUnit): void {
    const baseStats = unit.originalCard.baseStats;
    const growthRates = unit.originalCard.growthRates;
    const level = unit.level;

    // Calculate final stats
    unit.currentStats = {
      str: FormulaCalculator.calculateFinalStat(baseStats.str, level, growthRates.str),
      end: FormulaCalculator.calculateFinalStat(baseStats.end, level, growthRates.end),
      def: FormulaCalculator.calculateFinalStat(baseStats.def, level, growthRates.def),
      int: FormulaCalculator.calculateFinalStat(baseStats.int, level, growthRates.int),
      spi: FormulaCalculator.calculateFinalStat(baseStats.spi, level, growthRates.spi),
      mdf: FormulaCalculator.calculateFinalStat(baseStats.mdf, level, growthRates.mdf),
      spd: FormulaCalculator.calculateFinalStat(baseStats.spd, level, growthRates.spd),
      acc: FormulaCalculator.calculateFinalStat(baseStats.acc, level, growthRates.acc),
      lck: FormulaCalculator.calculateFinalStat(baseStats.lck, level, growthRates.lck),
    };

    // Recalculate derived properties
    unit.maxHP = FormulaCalculator.calculateMaxHP(unit.currentStats.end);
    unit.movement = FormulaCalculator.calculateMovementSpeed(unit.currentStats.spd);
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return Math.max(dx, dy); // Chebyshev distance (allows diagonal movement)
  }

  /**
   * Get action history
   */
  getActionHistory(): ReadonlyArray<GameAction> {
    return [...this.actionHistory];
  }

  /**
   * Create a test summon unit (for development/testing)
   */
  createTestSummon(playerId: string, position: Position): SummonUnit {
    const testSummonCard = {
      id: `test-summon-${Date.now()}`,
      name: 'Test Warrior',
      type: 'summon' as const,
      rarity: 'common' as const,
      description: 'A test summon for development',
      species: 'test',
      digitalSignature: {
        id: 'test-sig',
        timestamp: new Date().toISOString(),
        opener: playerId,
        packId: 'test-pack',
        signature: 'test-signature',
        verified: true
      },
      baseStats: {
        str: 15,
        end: 12,
        def: 14,
        int: 10,
        spi: 10,
        mdf: 10,
        spd: 12,
        acc: 12,
        lck: 15
      },
      growthRates: {
        str: 'normal' as const,
        end: 'normal' as const,
        def: 'normal' as const,
        int: 'minimal' as const,
        spi: 'minimal' as const,
        mdf: 'steady' as const,
        spd: 'steady' as const,
        acc: 'normal' as const,
        lck: 'accelerated' as const
      },
      level: 5,
      maxLevel: 20,
      equipment: {}
    };

    const unit: SummonUnit = {
      id: `unit-${Date.now()}`,
      originalCard: testSummonCard,
      currentStats: { ...testSummonCard.baseStats },
      currentHP: 0,
      maxHP: 0,
      level: testSummonCard.level,
      position,
      movement: 0,
      hasAttacked: false,
      statusEffects: [],
      equipment: {}
    };

    // Calculate initial stats
    this.recalculateSummonStats(unit);
    unit.currentHP = unit.maxHP;
    unit.movement = FormulaCalculator.calculateMovementSpeed(unit.currentStats.spd);

    // Place on board
    this.stateManager.placeSummonUnit(unit, position);
    
    // Add to player's summon slots
    const player = this.stateManager.getPlayer(playerId);
    if (player) {
      if (!player.summonSlots.slot1) {
        player.summonSlots.slot1 = unit;
      } else if (!player.summonSlots.slot2) {
        player.summonSlots.slot2 = unit;
      } else if (!player.summonSlots.slot3) {
        player.summonSlots.slot3 = unit;
      }
    }

    return unit;
  }
}