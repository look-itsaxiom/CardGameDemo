/**
 * End-to-End Tests for Complete Game Engine Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import { cardDatabase } from '../../src/engine/CardDatabaseService';
import { speciesDatabase } from '../../src/engine/SpeciesDatabaseService';
import type { Player, Deck3v3, PlayerId, GameAction } from '../../src/types/index';

describe('Game Engine End-to-End', () => {
  let gameEngine: GameEngine;
  let mockPlayers: Player[];
  let mockDecks: Record<PlayerId, Deck3v3>;

  beforeEach(() => {
    // Databases auto-initialize when imported

    // Create test players
    mockPlayers = [
      { id: 'playerA', name: 'Test Player A' },
      { id: 'playerB', name: 'Test Player B' }
    ];

    // Create test decks using actual card IDs from the database
    mockDecks = {
      'playerA': {
        summonSlots: [
          {
            summonCard: '001-gignen_warrior_alpha-Alpha', // Use actual summon card IDs
            roleCard: '017-warrior-Alpha',
            equipment: { weapon: '019-heirloom_sword-Alpha' }
          },
          {
            summonCard: '002-gignen_scout_beta-Alpha',
            roleCard: '018-scout-Alpha', 
            equipment: { weapon: '020-hunting_bow-Alpha' }
          },
          {
            summonCard: '003-gignen_magician_gamma-Alpha',
            roleCard: '021-magician-Alpha',
            equipment: { weapon: '022-apprentices_wand-Alpha' }
          }
        ],
        mainDeck: [
          '004-sharpened_blade-Alpha',
          '005-healing_hands-Alpha',
          '006-rush-Alpha',
          '007-nearwood_forest_expedition-Alpha'
        ],
        advanceDeck: [
          '013-berserker_rage-Alpha',
          '014-alrecht_barkstep_scoutmaster-Alpha'
        ]
      },
      'playerB': {
        summonSlots: [
          {
            summonCard: '008-stoneheart_warrior_delta-Alpha',
            roleCard: '017-warrior-Alpha',
            equipment: { weapon: '019-heirloom_sword-Alpha' }
          },
          {
            summonCard: '009-fae_magician_epsilon-Alpha', 
            roleCard: '021-magician-Alpha',
            equipment: { weapon: '022-apprentices_wand-Alpha' }
          },
          {
            summonCard: '010-wilderling_scout_zeta-Alpha',
            roleCard: '018-scout-Alpha',
            equipment: { weapon: '020-hunting_bow-Alpha' }
          }
        ],
        mainDeck: [
          '026-blast_bolt-Alpha',
          '027-dark_altar-Alpha',
          '028-ensnare-Alpha',
          '029-drain_touch-Alpha'
        ],
        advanceDeck: [
          '015-shadow_pact-Alpha'
        ]
      }
    };

    gameEngine = new GameEngine({
      players: mockPlayers,
      playerDecks: mockDecks,
      cardDatabase: cardDatabase.getAllCards()
    });
  });

  describe('Game Initialization', () => {
    it('should initialize with proper starting state', () => {
      const state = gameEngine.getState();
      
      expect(state.turn).toBe(1);
      expect(state.phase).toBe('setup');
      expect(state.activePlayer).toBe('playerA');
      
      // Check player zones initialized
      expect(state.players['playerA']).toBeDefined();
      expect(state.players['playerB']).toBeDefined();
      
      // Starting hands should have 3 summon cards
      expect(state.players['playerA'].hand).toHaveLength(3);
      expect(state.players['playerB'].hand).toHaveLength(3);
      
      // Decks should be initialized
      expect(state.players['playerA'].mainDeck.length).toBeGreaterThan(0);
      expect(state.players['playerB'].mainDeck.length).toBeGreaterThan(0);
    });

    it('should have victory points initialized to zero', () => {
      const state = gameEngine.getState();
      expect(state.players['playerA'].victoryPoints).toBe(0);
      expect(state.players['playerB'].victoryPoints).toBe(0);
    });
  });

  describe('Victory Condition System', () => {
    it('should detect victory when a player reaches 3 VP', () => {
      const state = gameEngine.getState();
      
      // Simulate player A getting 3 victory points
      (state.players['playerA'] as any).victoryPoints = 3;
      
      const winner = gameEngine.checkVictoryConditions();
      expect(winner).toBe('playerA');
    });

    it('should return first player to reach 3 VP when both reach simultaneously', () => {
      const state = gameEngine.getState();
      
      // Set both players to 3 VP
      (state.players['playerA'] as any).victoryPoints = 3;
      (state.players['playerB'] as any).victoryPoints = 3;
      
      // Should return the first player found (playerA due to object key order)
      const winner = gameEngine.checkVictoryConditions();
      expect(winner).toBe('playerA');
    });
  });

  describe('Effect System Integration', () => {
    it('should validate effects correctly with actual game state', () => {
      const registry = gameEngine.getEffectRegistry();
      const state = gameEngine.getState();
      
      // Create a heal effect
      const healEffect = {
        type: 'healSummon',
        parameters: {
          healingFormula: 'caster.SPI * (1 + 40/100)',
          basePower: 40,
          canCrit: true,
          critMultiplier: 1.5
        }
      };
      
      const context = {
        targetId: 'test-target',
        casterId: 'test-caster',
        playerId: 'playerA' as PlayerId,
        sourceCardId: 'test-source'
      };
      
      // Should handle validation gracefully even with invalid targets
      const result = registry.validateEffect(healEffect, context, state);
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('Stack Resolution System', () => {
    it('should provide functional stack manager', async () => {
      const stackManager = gameEngine.getStackManager();
      
      // Test that the stack starts empty
      const initialResolution = await stackManager.resolveNext();
      expect(initialResolution.success).toBe(true);
      expect(initialResolution.completed).toBe(true);
      expect(initialResolution.message).toContain('empty');
    });
  });

  describe('Card Database Integration', () => {
    it('should have all required card types loaded', () => {
      const cards = cardDatabase.getAllCards();
      
      // Check that we have the main card types
      const cardTypes = Object.values(cards).map(card => card.type);
      const uniqueTypes = [...new Set(cardTypes)];
      
      expect(uniqueTypes).toContain('summon');
      expect(uniqueTypes).toContain('role');
      expect(uniqueTypes).toContain('equipment');
      expect(uniqueTypes).toContain('action');
      
      // Verify we have a good variety of cards
      expect(Object.keys(cards).length).toBeGreaterThan(30);
      
      // Check for actual card IDs that exist in the database
      const cardIds = Object.keys(cards);
      expect(cardIds.some(id => id.includes('gignen'))).toBe(true);
      expect(cardIds.some(id => id.includes('warrior'))).toBe(true);
      expect(cardIds.some(id => id.includes('sword'))).toBe(true);
    });

    it('should provide valid summon cards with digital signatures', () => {
      const cards = cardDatabase.getAllCards();
      const summonCards = Object.values(cards).filter(card => card.type === 'summon');
      
      expect(summonCards.length).toBeGreaterThan(0);
      
      // Check that summon cards have required properties
      summonCards.forEach(card => {
        expect(card).toHaveProperty('digitalSignature');
        expect(card).toHaveProperty('speciesId');
        expect(card).toHaveProperty('baseStats');
        expect(card).toHaveProperty('growthRates');
      });
    });
  });

  describe('Species Database Integration', () => {
    it('should provide species data for summon cards', () => {
      const species = speciesDatabase.getAllSpecies();
      expect(Object.keys(species).length).toBeGreaterThan(0);
      
      // Check that common species exist
      expect(species['gignen']).toBeDefined();
      expect(species['stoneheart']).toBeDefined();
      expect(species['fae']).toBeDefined();
      
      // Verify species have required properties
      Object.values(species).forEach(specie => {
        expect(specie).toHaveProperty('baseStatRanges');
        expect(specie).toHaveProperty('name');
        expect(specie).toHaveProperty('description');
      });
    });
  });

  describe('Component Integration', () => {
    it('should have all engine components properly connected', () => {
      // Verify all major components are accessible
      expect(gameEngine.getState()).toBeDefined();
      expect(gameEngine.getConfig()).toBeDefined();
      expect(gameEngine.getEffectRegistry()).toBeDefined();
      expect(gameEngine.getStackManager()).toBeDefined();
      
      // Verify configuration matches initialization
      const config = gameEngine.getConfig();
      expect(config.players).toEqual(mockPlayers);
      expect(config.playerDecks).toEqual(mockDecks);
    });
  });
});