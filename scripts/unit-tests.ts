/**
 * Unit Tests for GameEngine and Components
 *
 * Simple, focused tests that verify individual component behaviors:
 * - Does X do Y?
 * - Clean, direct component testing
 * - No complex integration scenarios
 */

import { GameEngine, GameEngineConfig } from "../src/engine/GameEngine.js";
import { GameStateManager } from "../src/engine/GameStateManager.js";
import { PhaseManager } from "../src/engine/PhaseManager.js";
import { CardManager } from "../src/engine/CardManager.js";
import { BoardManager } from "../src/engine/BoardManager.js";
import { ActionProcessor } from "../src/engine/ActionProcessor.js";
import { GamePhase, PlayerId, GrowthRate, GameAction } from "../src/types/index.js";

// Simple test runner
class TestRunner {
  private tests: Array<() => void> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, testFn: () => void) {
    this.tests.push(() => {
      try {
        testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error}`);
        this.failed++;
      }
    });
  }

  assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message);
    }
  }

  run() {
    console.log("🧪 Running Unit Tests...\n");

    this.tests.forEach((test) => test());

    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);

    if (this.failed > 0) {
      process.exit(1);
    }

    console.log("🎉 All tests passed!");
  }
}

const test = new TestRunner();

// Mock data for testing
const mockPlayers = [
  { id: "playerA" as PlayerId, name: "Test Player A", collection: {} as any, decks: [] },
  { id: "playerB" as PlayerId, name: "Test Player B", collection: {} as any, decks: [] },
];

const mockDecks = {
  playerA: {
    id: "deck1",
    name: "Test Deck A",
    format: "3v3" as const,
    mainDeck: ["card1", "card2", "card3"],
    advanceDeck: ["advance1"],
    summonSlots: [] as any,
  },
  playerB: {
    id: "deck2",
    name: "Test Deck B",
    format: "3v3" as const,
    mainDeck: ["card4", "card5"],
    advanceDeck: ["advance2"],
    summonSlots: [] as any,
  },
};

const mockCardDB = {
  card1: { id: "card1", type: "summon", name: "Test Card 1" } as any,
  card2: { id: "card2", type: "action", name: "Test Card 2" } as any,
};

// ============================================================================
// GAMESTATE MANAGER TESTS
// ============================================================================

test.test("GameStateManager: Creates initial game state", () => {
  const manager = new GameStateManager(mockPlayers, mockDecks);
  const state = manager.getState();

  test.assert(state.phase === GamePhase.SETUP, "Should start in SETUP phase");
  test.assert(state.turn === 1, "Should start on turn 1");
  test.assert(state.activePlayer === "playerA", "Should start with playerA");
});

test.test("GameStateManager: Initializes player zones correctly", () => {
  const manager = new GameStateManager(mockPlayers, mockDecks);
  const state = manager.getState();

  test.assert(state.players.playerA !== undefined, "PlayerA zones should exist");
  test.assert(state.players.playerB !== undefined, "PlayerB zones should exist");
  test.assert(state.players.playerA.hand.length === 0, "Hand should start empty");
  test.assert(state.players.playerA.victoryPoints === 0, "VP should start at 0");
});

test.test("GameStateManager: Initializes board correctly", () => {
  const manager = new GameStateManager(mockPlayers, mockDecks);
  const state = manager.getState();

  const boardPositions = Object.keys(state.zones.board);
  test.assert(boardPositions.length === 168, "Should have 12x14 = 168 positions");

  const pos_0_0 = state.zones.board["0,0"];
  test.assert(pos_0_0 !== undefined, "Position 0,0 should exist");
  test.assert(pos_0_0.territory === "player1", "Bottom row should be player1 territory");
});

// ============================================================================
// PHASE MANAGER TESTS
// ============================================================================

test.test("PhaseManager: Exists and can be instantiated", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const cardManager = new CardManager(mockCardDB);
  const phaseManager = new PhaseManager(stateManager, cardManager, mockPlayers);

  test.assert(phaseManager !== undefined, "PhaseManager should be created successfully");
});

// ============================================================================
// CARD MANAGER TESTS
// ============================================================================

test.test("CardManager: Gets card data", () => {
  const manager = new CardManager(mockCardDB);

  const card = manager.getCard("card1");
  test.assert(card !== undefined, "Should return card data");
  test.assert(card?.name === "Test Card 1", "Should return correct card data");
});

test.test("CardManager: Returns undefined for invalid card", () => {
  const manager = new CardManager(mockCardDB);

  const card = manager.getCard("nonexistent");
  test.assert(card === undefined, "Should return undefined for invalid card");
});

// ============================================================================
// BOARD MANAGER TESTS
// ============================================================================

test.test("BoardManager: Exists and can be instantiated", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const boardManager = new BoardManager(stateManager, mockPlayers);

  test.assert(boardManager !== undefined, "BoardManager should be created successfully");
});

// ============================================================================
// ACTION PROCESSOR TESTS
// ============================================================================

test.test("ActionProcessor: Validates player permissions", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const cardManager = new CardManager(mockCardDB);
  const boardManager = new BoardManager(stateManager, mockPlayers);
  const phaseManager = new PhaseManager(stateManager, cardManager, mockPlayers);
  const processor = new ActionProcessor(stateManager, cardManager, boardManager, phaseManager);

  const result = processor.processAction({
    type: "endPhase",
    playerId: "playerB", // Wrong player
    parameters: {},
  });

  test.assert(!result.success, "Should reject action from wrong player");
});

test.test("ActionProcessor: Processes valid end phase action", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const cardManager = new CardManager(mockCardDB);
  const boardManager = new BoardManager(stateManager, mockPlayers);
  const phaseManager = new PhaseManager(stateManager, cardManager, mockPlayers);
  const processor = new ActionProcessor(stateManager, cardManager, boardManager, phaseManager);

  const result = processor.processAction({
    type: "endPhase",
    playerId: "playerA",
    parameters: {},
  });

  test.assert(result.success, "Should process valid end phase action");
});

// ============================================================================
// GAME ENGINE TESTS
// ============================================================================

test.test("GameEngine: Initializes with config", () => {
  const config: GameEngineConfig = {
    players: mockPlayers,
    playerDecks: mockDecks,
    cardDatabase: mockCardDB,
  };

  const engine = new GameEngine(config);
  test.assert(engine.getState().phase === GamePhase.SETUP, "Should initialize in SETUP phase");
  test.assert(engine.getConfig().players.length === 2, "Should have correct player count");
});

test.test("GameEngine: Processes actions through components", () => {
  const config: GameEngineConfig = {
    players: mockPlayers,
    playerDecks: mockDecks,
    cardDatabase: mockCardDB,
  };

  const engine = new GameEngine(config);
  const result = engine.processAction({
    type: "endPhase",
    playerId: "playerA",
    parameters: {},
  });

  test.assert(result.success, "Should process action successfully");
});

test.test("GameEngine: Returns read-only state", () => {
  const config: GameEngineConfig = {
    players: mockPlayers,
    playerDecks: mockDecks,
    cardDatabase: mockCardDB,
  };

  const engine = new GameEngine(config);
  const state = engine.getState();

  test.assert(typeof state === "object", "Should return state object");
  // Note: TypeScript readonly ensures compile-time immutability
});

test.test("GameEngine: Checks victory conditions", () => {
  const config: GameEngineConfig = {
    players: mockPlayers,
    playerDecks: mockDecks,
    cardDatabase: mockCardDB,
  };

  const engine = new GameEngine(config);
  const winner = engine.checkVictoryConditions();

  test.assert(winner === null, "Should have no winner at game start");
});

// Add Phase 2 & 3 feature tests
test.test("CardManager: Calculates level-based stats correctly", () => {
  const manager = new CardManager(mockCardDB);
  const baseStats = { STR: 15, END: 13, DEF: 14, INT: 15, SPI: 14, MDF: 13, SPD: 13, ACC: 12, LCK: 16 };
  const growthRates = {
    STR: GrowthRate.NORMAL,
    END: GrowthRate.NORMAL,
    DEF: GrowthRate.NORMAL,
    INT: GrowthRate.NORMAL,
    SPI: GrowthRate.NORMAL,
    MDF: GrowthRate.NORMAL,
    SPD: GrowthRate.NORMAL,
    ACC: GrowthRate.NORMAL,
    LCK: GrowthRate.NORMAL,
  };

  const currentStats = manager.calculateCurrentStats(baseStats, growthRates, 6);
  test.assert(currentStats.STR === 21, `Expected STR 21, got ${currentStats.STR}`); // 15 + (6 * 1.0) = 21
  test.assert(currentStats.END === 19, `Expected END 19, got ${currentStats.END}`); // 13 + (6 * 1.0) = 19
});

test.test("CardManager: Calculates max HP correctly", () => {
  const manager = new CardManager(mockCardDB);
  const maxHP = manager.calculateMaxHP(19); // END stat of 19
  const expected = 50 + Math.floor(Math.pow(19, 1.5));
  test.assert(maxHP === expected, `Expected HP ${expected}, got ${maxHP}`);
});

test.test("CardManager: Calculates movement speed correctly", () => {
  const manager = new CardManager(mockCardDB);
  const movement = manager.calculateMovementSpeed(18); // SPD stat of 18
  const expected = 2 + Math.floor((18 - 10) / 5); // 2 + 1 = 3
  test.assert(movement === expected, `Expected movement ${expected}, got ${movement}`);
});

test.test("BoardManager: Validates unit movement", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const boardManager = new BoardManager(stateManager, mockPlayers);
  const result = boardManager.canMoveUnit("nonexistent", { x: 5, y: 5 });
  test.assert(!result.canMove, "Should not be able to move non-existent unit");
  test.assert(result.message.includes("not found"), "Should mention unit not found");
});

test.test("ActionProcessor: Handles movement actions", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const cardManager = new CardManager(mockCardDB);
  const boardManager = new BoardManager(stateManager, mockPlayers);
  const phaseManager = new PhaseManager(stateManager, cardManager, mockPlayers);
  const actionProcessor = new ActionProcessor(stateManager, cardManager, boardManager, phaseManager);

  const action: GameAction = {
    type: "moveUnit",
    playerId: "playerA",
    parameters: { unitId: "test", targetPosition: { x: 1, y: 1 } },
  };
  const result = actionProcessor.processAction(action);
  // Should fail because unit doesn't exist, but should not crash
  test.assert(!result.success, "Should fail for non-existent unit");
});

test.test("ActionProcessor: Handles attack actions", () => {
  const stateManager = new GameStateManager(mockPlayers, mockDecks);
  const cardManager = new CardManager(mockCardDB);
  const boardManager = new BoardManager(stateManager, mockPlayers);
  const phaseManager = new PhaseManager(stateManager, cardManager, mockPlayers);
  const actionProcessor = new ActionProcessor(stateManager, cardManager, boardManager, phaseManager);

  const action: GameAction = {
    type: "attackUnit",
    playerId: "playerA",
    parameters: { attackerUnitId: "test1", targetUnitId: "test2" },
  };
  const result = actionProcessor.processAction(action);
  // Should fail because units don't exist, but should not crash
  test.assert(!result.success, "Should fail for non-existent units");
});

// Run all tests
test.run();
