/**
 * Integration tests for Game Engine Core
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import type { Player, Deck3v3, Card, PlayerId } from '../../src/types/index';

describe('GameEngine Integration', () => {
  let gameEngine: GameEngine;
  let mockPlayers: Player[];
  let mockDecks: Record<PlayerId, Deck3v3>;
  let mockCardDatabase: Record<string, Card>;

  beforeEach(() => {
    // Create minimal test players
    mockPlayers = [
      { id: 'player1', name: 'Test Player 1' },
      { id: 'player2', name: 'Test Player 2' }
    ];

    // Create minimal test decks
    mockDecks = {
      'player1': {
        summonSlots: [
          {
            summonCard: 'unique-summon-1',
            roleCard: 'role-warrior',
            equipment: { weapon: 'basic-sword' }
          }
        ],
        mainDeck: [],
        advanceDeck: []
      },
      'player2': {
        summonSlots: [
          {
            summonCard: 'unique-summon-2', 
            roleCard: 'role-warrior',
            equipment: { weapon: 'basic-sword' }
          }
        ],
        mainDeck: [],
        advanceDeck: []
      }
    };

    // Create minimal test card database
    mockCardDatabase = {
      'unique-summon-1': {
        id: 'unique-summon-1',
        type: 'summon',
        name: 'Test Summon 1',
        rarity: 'common',
        description: 'A test summon',
        digitalSignature: {
          uniqueId: 'unique-summon-1',
          openedBy: 'player1',
          timestamp: Date.now(),
          signature: 'test-sig-1'
        },
        speciesId: 'species-1',
        baseStats: {
          STR: 15, END: 12, DEF: 10, INT: 8,
          SPI: 10, MDF: 8, SPD: 12, ACC: 14, LCK: 16
        },
        growthRates: {
          STR: 'normal', END: 'normal', DEF: 'normal', INT: 'normal',
          SPI: 'normal', MDF: 'normal', SPD: 'normal', ACC: 'normal', LCK: 'normal'
        }
      } as any,
      'role-warrior': {
        id: 'role-warrior',
        type: 'role',
        name: 'Warrior',
        rarity: 'common',
        description: 'Basic warrior role',
        tier: 1,
        roleFamily: 'warrior',
        statModifiers: { STR: 1.1, DEF: 1.1 }
      } as any,
      'basic-sword': {
        id: 'basic-sword',
        type: 'equipment',
        name: 'Basic Sword',
        rarity: 'common',
        description: 'A basic sword',
        slot: 'weapon',
        power: 30,
        range: 1,
        statBonuses: { STR: 2 }
      } as any
    };
  });

  it('should initialize game engine with valid configuration', () => {
    expect(() => {
      gameEngine = new GameEngine({
        players: mockPlayers,
        playerDecks: mockDecks,
        cardDatabase: mockCardDatabase
      });
    }).not.toThrow();
  });

  describe('Core Engine Functions', () => {
    beforeEach(() => {
      gameEngine = new GameEngine({
        players: mockPlayers,
        playerDecks: mockDecks,
        cardDatabase: mockCardDatabase
      });
    });

    it('should provide read-only game state', () => {
      const state = gameEngine.getState();
      
      expect(state).toBeDefined();
      expect(state.players).toBeDefined();
      expect(state.activePlayer).toBeDefined();
      expect(state.phase).toBeDefined(); // it's 'phase' not 'currentPhase'
    });

    it('should provide read-only configuration', () => {
      const config = gameEngine.getConfig();
      expect(config).toBeDefined();
      expect(config.players).toEqual(mockPlayers);
      expect(config.cardDatabase).toEqual(mockCardDatabase);
    });

    it('should check victory conditions', () => {
      const winner = gameEngine.checkVictoryConditions();
      expect(winner).toBeNull(); // No winner at start
    });

    it('should provide effect registry', () => {
      const registry = gameEngine.getEffectRegistry();
      expect(registry).toBeDefined();
      
      // Test basic validation
      const mockEffect = {
        type: 'healSummon',
        parameters: { healingFormula: '20', basePower: 20 }
      };
      const mockContext = {
        targetId: 'test-target',
        playerId: 'player1' as PlayerId,
        sourceCardId: 'test-card'
      };
      
      // Should not throw for valid effect types
      expect(() => {
        registry.validateEffect(mockEffect, mockContext, gameEngine.getState());
      }).not.toThrow();
    });

    it('should provide stack manager', () => {
      const stackManager = gameEngine.getStackManager();
      expect(stackManager).toBeDefined();
    });
  });

  describe('Victory Conditions', () => {
    beforeEach(() => {
      gameEngine = new GameEngine({
        players: mockPlayers,
        playerDecks: mockDecks,
        cardDatabase: mockCardDatabase
      });
    });

    it('should detect victory when player reaches 3 VP', () => {
      const state = gameEngine.getState();
      
      // Manually set victory points to test condition
      (state as any).players['player1'].victoryPoints = 3;
      
      const winner = gameEngine.checkVictoryConditions();
      expect(winner).toBe('player1');
    });

    it('should return null when no player has won', () => {
      const winner = gameEngine.checkVictoryConditions();
      expect(winner).toBeNull();
    });
  });
});