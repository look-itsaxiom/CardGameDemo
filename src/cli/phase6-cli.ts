#!/usr/bin/env node

/**
 * Phase 6 CLI - Testing CLI for Card Effects Engine
 *
 * This CLI allows testing of the Effect Type Registry, Stack Manager,
 * Trigger Detector, and Requirement Validator components.
 */

import { GameEngine } from "../engine/GameEngine";
import { EffectTypeRegistry } from "../engine/EffectTypeRegistry";
import { StackManager } from "../engine/StackManager";
import { TriggerDetector } from "../engine/TriggerDetector";
import { RequirementValidator } from "../engine/RequirementValidator";
import { GameState, PlayerId, CardId, Effect, EffectContext } from "../types/index";

const engine = new GameEngine();

// Initialize Phase 6 components
const effectRegistry = new EffectTypeRegistry();
const stackManager = new StackManager(engine.gameStateManager, effectRegistry);
const triggerDetector = new TriggerDetector(engine.gameStateManager, stackManager);
const requirementValidator = new RequirementValidator(engine.gameStateManager, engine.cardDatabase);

// CLI Command handlers
const commands = {
  // Effect Registry Commands
  async testEffect(args: string[]) {
    const [effectType, targetId, playerId = "player1"] = args;

    if (!effectType || !targetId) {
      console.log("Usage: testEffect <effectType> <targetId> [playerId]");
      console.log("Available effects: healSummon, damageSummon, levelUp, changeZone, enterPlayZone");
      return;
    }

    const gameState = engine.getGameState();
    const effect: Effect = {
      id: `test-${Date.now()}`,
      type: effectType,
      parameters: {
        amount: 50,
        basePower: 30,
        fromZone: "hand",
        toZone: "inPlay",
      },
    };

    const context: EffectContext = {
      playerId: playerId as PlayerId,
      targetId,
      cardId: "test-card" as CardId,
      triggerData: {},
    };

    try {
      const result = await effectRegistry.executeEffect(effect, context, gameState);
      console.log("Effect executed successfully:");
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Effect execution failed:", error);
    }
  },

  async validateEffect(args: string[]) {
    const [effectType, targetId, playerId = "player1"] = args;

    if (!effectType || !targetId) {
      console.log("Usage: validateEffect <effectType> <targetId> [playerId]");
      return;
    }

    const gameState = engine.getGameState();
    const effect: Effect = {
      id: `validate-${Date.now()}`,
      type: effectType,
      parameters: {},
    };

    const context: EffectContext = {
      playerId: playerId as PlayerId,
      targetId,
      cardId: "test-card" as CardId,
      triggerData: {},
    };

    const validation = effectRegistry.validateEffect(effect, context, gameState);
    console.log(`Effect validation: ${validation.valid ? "VALID" : "INVALID"}`);
    if (!validation.valid) {
      console.log(`Reason: ${validation.message}`);
    }
  },

  // Stack Manager Commands
  async addToStack(args: string[]) {
    const [effectType, playerId = "player1", targetId = "test-target"] = args;

    if (!effectType) {
      console.log("Usage: addToStack <effectType> [playerId] [targetId]");
      return;
    }

    const effect: Effect = {
      id: `stack-${Date.now()}`,
      type: effectType,
      parameters: { amount: 25 },
    };

    const context: EffectContext = {
      playerId: playerId as PlayerId,
      targetId,
      cardId: "test-card" as CardId,
      triggerData: {},
    };

    try {
      stackManager.addEffectToStack(effect, context, "action");
      console.log(`Added ${effectType} effect to stack for ${playerId}`);
      showStack();
    } catch (error) {
      console.error("Failed to add to stack:", error);
    }
  },

  async resolveStack() {
    console.log("Resolving stack...");
    try {
      const results = await stackManager.resolveStack();
      console.log(`Resolved ${results.length} effects from stack:`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${JSON.stringify(result, null, 2)}`);
      });
    } catch (error) {
      console.error("Stack resolution failed:", error);
    }
  },

  showStack() {
    const stack = stackManager.getStack();
    console.log(`Stack contains ${stack.length} entries:`);
    stack.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.speed}] ${entry.effect.type} by ${entry.context.playerId}`);
    });
  },

  // Trigger Detector Commands
  async emitEvent(args: string[]) {
    const [eventType, playerId = "player1", targetId = "test-target"] = args;

    if (!eventType) {
      console.log("Usage: emitEvent <eventType> [playerId] [targetId]");
      console.log("Available events: summonEnters, summonDefeated, cardPlayed, phaseChange");
      return;
    }

    const gameEvent = {
      type: eventType,
      playerId: playerId as PlayerId,
      targetId,
      timestamp: Date.now(),
      data: {},
    };

    console.log(`Emitting event: ${eventType}`);
    triggerDetector.emitEvent(gameEvent);
  },

  // Requirement Validator Commands
  async checkRequirements(args: string[]) {
    const [cardId, playerId = "player1"] = args;

    if (!cardId) {
      console.log("Usage: checkRequirements <cardId> [playerId]");
      return;
    }

    const card = engine.cardDatabase.getCard(cardId as CardId);
    if (!card) {
      console.log(`Card not found: ${cardId}`);
      return;
    }

    const gameState = engine.getGameState();
    const context = {
      gameState,
      playerId: playerId as PlayerId,
      cardId: cardId as CardId,
    };

    if (card.requirements) {
      const result = requirementValidator.checkRequirements(card.requirements, context);
      console.log(`Requirements check: ${result.valid ? "PASSED" : "FAILED"}`);
      if (!result.valid) {
        console.log(`Reason: ${result.error}`);
      }
      if (result.count !== undefined) {
        console.log(`Found ${result.count} matching targets`);
      }
    } else {
      console.log("Card has no requirements");
    }
  },

  async findTargets(args: string[]) {
    const [cardId, playerId = "player1"] = args;

    if (!cardId) {
      console.log("Usage: findTargets <cardId> [playerId]");
      return;
    }

    const gameState = engine.getGameState();
    const targets = requirementValidator.findValidTargets(cardId as CardId, playerId as PlayerId, gameState);

    console.log(`Found ${targets.length} valid targets for ${cardId}:`);
    targets.forEach((target, index) => {
      console.log(`${index + 1}. ${JSON.stringify(target, null, 2)}`);
    });
  },

  // Game State Commands
  showGameState() {
    const state = engine.getGameState();
    console.log("Current Game State:");
    console.log(`Phase: ${state.phase}, Turn: ${state.turn}, Active Player: ${state.activePlayer}`);
    console.log(`Summon Units: ${Object.keys(state.summonUnits).length}`);
    console.log(`Victory Points: ${JSON.stringify(state.victoryPoints)}`);
  },

  listSummons(args: string[]) {
    const [playerId] = args;
    const state = engine.getGameState();

    if (playerId) {
      const playerSummons = Object.values(state.summonUnits).filter((s) => s.controllerId === playerId);
      console.log(`${playerId} summons (${playerSummons.length}):`);
      playerSummons.forEach((summon) => {
        console.log(`- ${summon.id}: Level ${summon.level}, HP ${summon.currentHP}/${summon.maxHP}`);
      });
    } else {
      console.log(`All summons (${Object.keys(state.summonUnits).length}):`);
      Object.values(state.summonUnits).forEach((summon) => {
        console.log(`- ${summon.id} (${summon.controllerId}): Level ${summon.level}, HP ${summon.currentHP}/${summon.maxHP}`);
      });
    }
  },

  listCards(args: string[]) {
    const [setName = "alpha"] = args;
    console.log(`Cards in ${setName} set:`);

    try {
      const cards = engine.cardDatabase.getCardsInSet(setName);
      cards.forEach((card) => {
        console.log(`- ${card.id}: ${card.name} (${card.type})`);
      });
    } catch (error) {
      console.error(`Error listing cards: ${error}`);
    }
  },

  // Help command
  help() {
    console.log("\n=== Phase 6 Effects Engine CLI ===");
    console.log("\nEffect Registry Commands:");
    console.log("  testEffect <type> <targetId> [playerId] - Execute an effect");
    console.log("  validateEffect <type> <targetId> [playerId] - Validate effect can execute");

    console.log("\nStack Manager Commands:");
    console.log("  addToStack <effectType> [playerId] [targetId] - Add effect to resolution stack");
    console.log("  resolveStack - Resolve all effects on the stack");
    console.log("  showStack - Display current stack contents");

    console.log("\nTrigger Detector Commands:");
    console.log("  emitEvent <eventType> [playerId] [targetId] - Emit a game event");

    console.log("\nRequirement Validator Commands:");
    console.log("  checkRequirements <cardId> [playerId] - Check if card requirements are met");
    console.log("  findTargets <cardId> [playerId] - Find valid targets for a card");

    console.log("\nGame State Commands:");
    console.log("  showGameState - Display current game state summary");
    console.log("  listSummons [playerId] - List summon units");
    console.log("  listCards [setName] - List available cards");

    console.log("\nGeneral:");
    console.log("  help - Show this help message");
    console.log("  exit - Exit the CLI");
  },
};

function showStack() {
  commands.showStack();
}

// Main CLI loop
async function main() {
  console.log("Phase 6 Effects Engine CLI - Testing Card Effects System");
  console.log("Type 'help' for available commands or 'exit' to quit\n");

  // Initialize demo game state
  await engine.startGame(["player1", "player2"]);

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "phase6> ",
  });

  rl.prompt();

  rl.on("line", async (line: string) => {
    const [command, ...args] = line.trim().split(" ");

    if (command === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    if (commands[command as keyof typeof commands]) {
      try {
        await (commands[command as keyof typeof commands] as any)(args);
      } catch (error) {
        console.error(`Error executing ${command}:`, error);
      }
    } else {
      console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

export { commands };
