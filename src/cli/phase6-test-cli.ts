#!/usr/bin/env node

/**
 * Simple Phase 6 Testing CLI
 * Tests the new Phase 6 components independently
 */

import { CardDatabaseService } from "../engine/CardDatabaseService";
import { Card, ActionCard, Effect } from "../types/index";

class Phase6TestCLI {
  private cardDatabase: CardDatabaseService;

  constructor() {
    this.cardDatabase = new CardDatabaseService();
  }

  async start() {
    console.log("=== Phase 6 Effects Engine Test CLI ===");
    console.log("Testing Card Effects System Components\n");

    console.log("Available commands:");
    console.log("  cards - List all cards");
    console.log("  actions - List action cards (Phase 6 focus)");
    console.log("  card <id> - Show card details");
    console.log("  effects <cardId> - Show card effects");
    console.log("  test <component> - Test Phase 6 component");
    console.log("  help - Show this help");
    console.log("  exit - Exit CLI\n");

    this.repl();
  }

  private repl() {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "phase6> ",
    });

    rl.prompt();

    rl.on("line", (line: string) => {
      const [command, ...args] = line.trim().split(" ");
      this.handleCommand(command, args);
      rl.prompt();
    });

    rl.on("close", () => {
      console.log("Goodbye!");
      process.exit(0);
    });
  }

  private handleCommand(command: string, args: string[]) {
    try {
      switch (command) {
        case "cards":
          this.listCards();
          break;
        case "actions":
          this.listActionCards();
          break;
        case "card":
          this.showCard(args[0]);
          break;
        case "effects":
          this.showCardEffects(args[0]);
          break;
        case "test":
          this.testComponent(args[0]);
          break;
        case "help":
          this.showHelp();
          break;
        case "exit":
          process.exit(0);
          break;
        case "":
          // Empty command, do nothing
          break;
        default:
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      console.error(`Error executing command: ${error}`);
    }
  }

  private listCards() {
    console.log("All available cards:");
    try {
      const cards = this.cardDatabase.getCardsInSet("alpha");

      const groupedCards = cards.reduce((groups, card) => {
        if (!groups[card.type]) groups[card.type] = [];
        groups[card.type].push(card);
        return groups;
      }, {} as Record<string, Card[]>);

      Object.entries(groupedCards).forEach(([type, typeCards]) => {
        console.log(`\n${type.toUpperCase()} Cards (${typeCards.length}):`);
        typeCards.forEach((card) => {
          console.log(`  - ${card.id}: ${card.name}`);
        });
      });
    } catch (error) {
      console.error("Error loading cards:", error);
    }
  }

  private listActionCards() {
    console.log("Action cards (Phase 6 focus):");
    try {
      const cards = this.cardDatabase.getCardsInSet("alpha");
      const actionCards = cards.filter((card) => card.type === "action") as ActionCard[];

      if (actionCards.length === 0) {
        console.log("No action cards found");
        return;
      }

      actionCards.forEach((card) => {
        console.log(`\n${card.id}: ${card.name}`);
        console.log(`  Description: ${card.description || "No description"}`);
        if (card.effects && card.effects.length > 0) {
          console.log(`  Effects: ${card.effects.length} effect(s)`);
        }
        if (card.requirements && card.requirements.length > 0) {
          console.log(`  Requirements: ${card.requirements.length} requirement(s)`);
        }
      });
    } catch (error) {
      console.error("Error loading action cards:", error);
    }
  }

  private showCard(cardId: string) {
    if (!cardId) {
      console.log("Usage: card <cardId>");
      return;
    }

    try {
      const card = this.cardDatabase.getCard(cardId);
      if (!card) {
        console.log(`Card not found: ${cardId}`);
        return;
      }

      console.log(`\n=== ${card.name} ===`);
      console.log(`ID: ${card.id}`);
      console.log(`Type: ${card.type}`);
      console.log(`Description: ${card.description || "No description"}`);

      // Show card-specific properties
      if (card.type === "action") {
        const actionCard = card as ActionCard;
        if (actionCard.effects) {
          console.log(`Effects: ${actionCard.effects.length}`);
        }
        if (actionCard.requirements) {
          console.log(`Requirements: ${actionCard.requirements.length}`);
        }
      }

      console.log(`Raw data: ${JSON.stringify(card, null, 2)}`);
    } catch (error) {
      console.error("Error showing card:", error);
    }
  }

  private showCardEffects(cardId: string) {
    if (!cardId) {
      console.log("Usage: effects <cardId>");
      return;
    }

    try {
      const card = this.cardDatabase.getCard(cardId);
      if (!card) {
        console.log(`Card not found: ${cardId}`);
        return;
      }

      console.log(`\n=== Effects for ${card.name} ===`);

      if ("effects" in card && card.effects && card.effects.length > 0) {
        card.effects.forEach((effect: Effect, index: number) => {
          console.log(`\nEffect ${index + 1}:`);
          console.log(`  Type: ${effect.type}`);
          console.log(`  Parameters: ${JSON.stringify(effect.parameters, null, 4)}`);
          if (effect.targeting) {
            console.log(`  Targeting: ${JSON.stringify(effect.targeting, null, 4)}`);
          }
        });
      } else {
        console.log("This card has no effects");
      }
    } catch (error) {
      console.error("Error showing card effects:", error);
    }
  }

  private testComponent(component: string) {
    if (!component) {
      console.log("Usage: test <component>");
      console.log("Available components: registry, stack, triggers, requirements");
      return;
    }

    console.log(`\n=== Testing ${component} ===`);

    switch (component) {
      case "registry":
        this.testEffectRegistry();
        break;
      case "stack":
        this.testStackManager();
        break;
      case "triggers":
        this.testTriggerDetector();
        break;
      case "requirements":
        this.testRequirementValidator();
        break;
      default:
        console.log(`Unknown component: ${component}`);
        console.log("Available: registry, stack, triggers, requirements");
    }
  }

  private testEffectRegistry() {
    console.log("EffectTypeRegistry Status:");
    console.log("✓ Created and implemented");
    console.log("✓ Core effect types defined: healSummon, damageSummon, levelUp, changeZone, enterPlayZone");
    console.log("⚠ Needs integration with GameStateManager");
    console.log("⚠ Needs CLI testing interface");

    console.log("\nTesting basic registry functionality...");
    try {
      // This will fail due to constructor being private, but shows what we need to fix
      console.log("Registry creation test - needs proper initialization");
    } catch (error) {
      console.log("❌ Cannot instantiate registry - needs factory method or public constructor");
    }
  }

  private testStackManager() {
    console.log("StackManager Status:");
    console.log("✓ Created with LIFO stack implementation");
    console.log("✓ Priority and speed lock system designed");
    console.log("⚠ Needs GameStateManager integration");
    console.log("⚠ Needs effect execution integration");
    console.log("❌ Cannot test without proper initialization");
  }

  private testTriggerDetector() {
    console.log("TriggerDetector Status:");
    console.log("✓ Created with event emission system");
    console.log("✓ Trigger matching logic implemented");
    console.log("⚠ Needs integration with card database");
    console.log("⚠ Needs game event definitions");
    console.log("❌ Cannot test without proper initialization");
  }

  private testRequirementValidator() {
    console.log("RequirementValidator Status:");
    console.log("✓ Created with requirement checking system");
    console.log("✓ Multiple requirement types supported");
    console.log("⚠ Needs GameStateManager method fixes");
    console.log("⚠ Needs role family utility integration");
    console.log("❌ Cannot test without proper GameState structure");
  }

  private showHelp() {
    console.log("\n=== Phase 6 Effects Engine Test CLI ===");
    console.log("\nCard Database Commands:");
    console.log("  cards                    - List all available cards");
    console.log("  actions                  - List action cards with effects");
    console.log("  card <id>                - Show detailed card information");
    console.log("  effects <cardId>         - Show card's effects in detail");

    console.log("\nPhase 6 Component Testing:");
    console.log("  test registry            - Test EffectTypeRegistry");
    console.log("  test stack               - Test StackManager");
    console.log("  test triggers            - Test TriggerDetector");
    console.log("  test requirements        - Test RequirementValidator");

    console.log("\nGeneral:");
    console.log("  help                     - Show this help message");
    console.log("  exit                     - Exit the CLI");

    console.log("\n=== Implementation Status ===");
    console.log("✓ Card database working");
    console.log("✓ Phase 6 components created");
    console.log("⚠ Components need integration fixes");
    console.log("❌ Full testing pending integration");
  }
}

// Main execution
if (require.main === module) {
  const cli = new Phase6TestCLI();
  cli.start().catch(console.error);
}

export { Phase6TestCLI };
