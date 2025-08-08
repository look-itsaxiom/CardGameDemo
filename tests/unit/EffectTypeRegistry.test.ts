/**
 * Tests for EffectTypeRegistry - Core effects system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EffectTypeRegistry } from '../../src/engine/EffectTypeRegistry';
import type { GameState, Effect, EffectContext } from '../../src/types/index';

describe('EffectTypeRegistry', () => {
  let registry: EffectTypeRegistry;
  let mockState: Partial<GameState>;
  let mockContext: EffectContext;

  beforeEach(() => {
    registry = EffectTypeRegistry.getInstance();
    
    // Create a minimal mock game state
    mockState = {
      summonUnits: {
        'test-summon-1': {
          id: 'test-summon-1',
          position: { x: 5, y: 2 },
          baseCard: 'Test Summon',
          level: 5,
          currentHP: 80,
          maxHP: 100,
          totalMovement: 3,
          currentStats: {
            STR: 15, END: 12, DEF: 10, INT: 8,
            SPI: 10, MDF: 8, SPD: 12, ACC: 14, LCK: 16
          }
        }
      },
      players: {},
      victoryPoints: {},
      zones: { stack: [], inPlay: [] },
      activePlayer: 'player1',
      currentPhase: 'action' as any,
      turnNumber: 1
    } as GameState;

    mockContext = {
      targetId: 'test-summon-1',
      casterId: undefined,
      playerId: 'player1',
      sourceCardId: 'test-card'
    };
  });

  describe('Heal Summon Effect', () => {
    it('should validate heal target correctly', () => {
      const healEffect: Effect = {
        type: 'healSummon',
        parameters: {
          healingFormula: '20',
          basePower: 20,
          canCrit: false,
          critMultiplier: 1.5
        }
      };

      const result = registry.validateEffect(healEffect, mockContext, mockState as GameState);
      expect(result.valid).toBe(true);
    });

    it('should reject heal on full HP target', () => {
      // Set target to full HP
      mockState.summonUnits!['test-summon-1'].currentHP = 100;
      
      const healEffect: Effect = {
        type: 'healSummon',
        parameters: {
          healingFormula: '20',
          basePower: 20,
          canCrit: false,
          critMultiplier: 1.5
        }
      };

      const result = registry.validateEffect(healEffect, mockContext, mockState as GameState);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('already at full HP');
    });
  });

  describe('Damage Summon Effect', () => {
    it('should validate damage target correctly', () => {
      const damageEffect: Effect = {
        type: 'damageSummon',
        parameters: {
          damageFormula: '25',
          basePower: 25,
          canCrit: false,
          critMultiplier: 2.0
        }
      };

      const result = registry.validateEffect(damageEffect, mockContext, mockState as GameState);
      expect(result.valid).toBe(true);
    });
  });

  describe('Level Up Effect', () => {
    it('should validate level up target correctly', () => {
      const levelUpEffect: Effect = {
        type: 'levelUp',
        parameters: {
          levels: 1
        }
      };

      const result = registry.validateEffect(levelUpEffect, mockContext, mockState as GameState);
      expect(result.valid).toBe(true);
    });

    it('should reject level up on max level target', () => {
      // Set target to max level
      mockState.summonUnits!['test-summon-1'].level = 20;
      
      const levelUpEffect: Effect = {
        type: 'levelUp',
        parameters: {
          levels: 1
        }
      };

      const result = registry.validateEffect(levelUpEffect, mockContext, mockState as GameState);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('already at max level');
    });
  });

  describe('Effect Registration', () => {
    it('should have all required effect types registered', () => {
      const requiredEffects = ['healSummon', 'damageSummon', 'levelUp', 'changeZone', 'enterPlayZone'];
      
      for (const effectType of requiredEffects) {
        const mockEffect: Effect = { type: effectType, parameters: {} };
        
        // Should not throw error when validating registered effects
        expect(() => {
          registry.validateEffect(mockEffect, mockContext, mockState as GameState);
        }).not.toThrow();
      }
    });
  });
});