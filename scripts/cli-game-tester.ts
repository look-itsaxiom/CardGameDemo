#!/usr/bin/env tsx

/**
 * CLI Game Testing Tool
 *
 * A simple command-line interface for testing the game engine.
 * Allows manual input of actions for both players and displays game state changes.
 */

import { GameEngine, GameEngineConfig } from "../src/engine/GameEngine.js";
import { allPlayers, allDecks } from "../src/data/players/index.js";
import { Player, GameAction, GamePhase, Card, CardType } from "../src/types/index.js";
import { cardDatabase } from "../src/engine/CardDatabaseService.js";
import * as readline from "readline";

class CLIGameTester {
  private engine: GameEngine;
  private rl: readline.Interface;

  constructor() {
    // Set up readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Initialize game with PlayerA and PlayerB
    const playerA = allPlayers.find((p) => p.id === "playerA");
    const playerB = allPlayers.find((p) => p.id === "playerB");

    if (!playerA || !playerB) {
      console.error("Could not find PlayerA or PlayerB in data");
      process.exit(1);
    }

    const deckA = allDecks.find((d) => d.id === "playerA_deck1");
    const deckB = allDecks.find((d) => d.id === "playerB_deck1");

    if (!deckA || !deckB) {
      console.error("Could not find player decks");
      process.exit(1);
    }

    const config: GameEngineConfig = {
      players: [playerA, playerB],
      playerDecks: {
        [playerA.id]: deckA,
        [playerB.id]: deckB,
      },
      cardDatabase: cardDatabase.getAllCards(),
    };

    this.engine = new GameEngine(config);
  }

  /**
   * Add summon slot definitions for the CLI to access
   */
  private async addSummonSlotDefinitions(): Promise<void> {
    try {
      // Import real player data to get summon slot definitions
      const { playerA_Deck, playerB_Deck } = await import("../src/data/players/index.js");

      // Store summon slot definitions globally for CLI access
      (globalThis as any).summonSlotDefinitions = {
        playerA_slots: playerA_Deck.summonSlots,
        playerB_slots: playerB_Deck.summonSlots,
      };

      console.log("✅ Loaded summon slot definitions for CLI");

      // Switch to ACTION phase for easy testing
      const state = this.engine.getState();
      (state as any).phase = "action";

      console.log("💡 Use 'slots' to see available summon slots");
      console.log("💡 Use 'hand' to see your starting summon cards");
      console.log("💡 Use 'summon <slotIndex> <x> <y>' to play a summon slot");
      console.log("💡 Game switched to ACTION phase for testing");
    } catch (error) {
      console.error("Failed to load summon slot definitions:", error);
    }
  }

  /**
   * Start the CLI game loop
   */
  async start(): Promise<void> {
    // Load summon slot definitions for CLI
    await this.addSummonSlotDefinitions();

    console.log("=".repeat(60));
    console.log("CARD GAME DEMO - CLI TESTING TOOL");
    console.log("=".repeat(60));
    console.log();
    console.log("Available commands:");
    console.log("  help          - Show available commands");
    console.log("  state         - Show current game state");
    console.log("  hand          - Show current player's hand");
    console.log("  board         - Show board state");
    console.log("  slots         - Show available summon slots");
    console.log("  summon <slot> <x> <y> - Play a summon slot at position");
    console.log("  play <card> <x> <y> - Play a card at position");
    console.log("  move <unitId> <x> <y> - Move a unit to position");
    console.log("  attack <attackerUnitId> <targetUnitId> - Attack a unit");
    console.log("  info <unitId> - Show detailed unit information");
    console.log("  end           - End current phase");
    console.log("  quit          - Exit the game");
    console.log();

    this.displayGameState();
    await this.gameLoop();
  }

  /**
   * Main game loop - accept commands and process them
   */
  private async gameLoop(): Promise<void> {
    while (true) {
      const state = this.engine.getState();
      const prompt = `[Turn ${state.turn}] [${state.phase}] [${state.activePlayer}]> `;

      const input = await this.prompt(prompt);
      const command = input.trim().toLowerCase();

      if (command === "quit" || command === "exit") {
        console.log("Thanks for testing!");
        break;
      }

      await this.processCommand(command);
    }

    this.rl.close();
  }

  /**
   * Process user command
   */
  private async processCommand(command: string): Promise<void> {
    const state = this.engine.getState();
    const parts = command.split(" ");

    switch (parts[0]) {
      case "help":
        this.showHelp();
        break;

      case "state":
        this.displayGameState();
        break;

      case "hand":
        this.showPlayerHand(state.activePlayer);
        break;

      case "board":
        this.showBoard();
        break;

      case "slots":
        this.showSummonSlots(state.activePlayer);
        break;

      case "summon":
        if (parts.length < 4) {
          console.log("Usage: summon <slotIndex> <x> <y>");
          console.log("Example: summon 0 2 1 (to play first summon slot)");
          console.log("Use 'slots' to see available summon slots");
        } else {
          const slotIndex = parseInt(parts[1]);
          const x = parseInt(parts[2]);
          const y = parseInt(parts[3]);

          if (isNaN(slotIndex) || isNaN(x) || isNaN(y)) {
            console.log("Slot index and coordinates must be numbers");
          } else {
            this.playSummonSlot(state.activePlayer, slotIndex, { x, y });
          }
        }
        break;

      case "info":
        if (parts.length < 2) {
          console.log("Usage: info <unitId>");
          console.log("Example: info unit_12345");
        } else {
          this.showUnitInfo(parts[1]);
        }
        break;

      case "play":
        if (parts.length < 4) {
          console.log("Usage: play <cardId> <x> <y>");
          console.log("Example: play stub-summon-1 2 1");
        } else {
          const cardId = parts[1];
          const x = parseInt(parts[2]);
          const y = parseInt(parts[3]);

          if (isNaN(x) || isNaN(y)) {
            console.log("Coordinates must be numbers");
          } else {
            const playAction: GameAction = {
              type: "playCard",
              playerId: state.activePlayer,
              parameters: {
                cardId,
                position: { x, y },
              },
            };

            const result = this.engine.processAction(playAction);
            console.log(`Action result: ${result.message}`);

            if (result.success) {
              this.displayGameState();
            }
          }
        }
        break;

      case "move":
        if (parts.length < 4) {
          console.log("Usage: move <unitId> <x> <y>");
          console.log("Example: move unit_12345 3 4");
        } else {
          const unitId = parts[1];
          const x = parseInt(parts[2]);
          const y = parseInt(parts[3]);

          if (isNaN(x) || isNaN(y)) {
            console.log("Coordinates must be numbers");
          } else {
            const moveAction: GameAction = {
              type: "moveUnit",
              playerId: state.activePlayer,
              parameters: {
                unitId,
                targetPosition: { x, y },
              },
            };

            const result = this.engine.processAction(moveAction);
            console.log(`Move result: ${result.message}`);

            if (result.success) {
              this.displayGameState();
            }
          }
        }
        break;

      case "attack":
        if (parts.length < 3) {
          console.log("Usage: attack <attackerUnitId> <targetUnitId>");
          console.log("Example: attack unit_12345 unit_67890");
        } else {
          const attackerUnitId = parts[1];
          const targetUnitId = parts[2];

          const attackAction: GameAction = {
            type: "attackUnit",
            playerId: state.activePlayer,
            parameters: {
              attackerUnitId,
              targetUnitId,
            },
          };

          const result = this.engine.processAction(attackAction);
          console.log(`Attack result: ${result.message}`);

          if (result.success) {
            this.displayGameState();

            // Check for game end
            const currentState = this.engine.getState();
            if (currentState.gameEnded && currentState.winner) {
              console.log();
              console.log("🎉".repeat(20));
              console.log(`GAME OVER! ${currentState.winner} WINS!`);
              console.log("🎉".repeat(20));
              console.log();
            }
          }
        }
        break;

      case "end":
        const action: GameAction = {
          type: "endPhase",
          playerId: state.activePlayer,
          parameters: {},
        };

        const result = this.engine.processAction(action);
        console.log(`Action result: ${result.message}`);

        if (result.success) {
          this.displayGameState();
        }
        break;

      case "":
        // Empty input, just show prompt again
        break;

      default:
        console.log(`Unknown command: ${parts[0]}. Type 'help' for available commands.`);
    }
  }

  /**
   * Display current game state
   */
  private displayGameState(): void {
    const state = this.engine.getState();
    const config = this.engine.getConfig();

    console.log();
    console.log("=".repeat(50));
    console.log("GAME STATE");
    console.log("=".repeat(50));
    console.log(`Turn: ${state.turn}`);
    console.log(`Phase: ${state.phase}`);
    console.log(`Active Player: ${state.activePlayer}`);
    console.log();

    // Display player information
    config.players.forEach((player) => {
      const playerZones = state.players[player.id];
      const isActive = player.id === state.activePlayer;
      const victoryPoints = state.victoryPoints[player.id] || 0;

      console.log(`${isActive ? ">>> " : "    "}${player.name} (${player.id}):`);
      console.log(`    Victory Points: ${victoryPoints}`);
      console.log(`    Hand: ${playerZones.hand.length} cards`);
      console.log(`    Main Deck: ${playerZones.mainDeck.length} cards`);
      console.log(`    Advance Deck: ${playerZones.advanceDeck.length} cards`);
      console.log(`    Discard Pile: ${playerZones.discardPile.length} cards`);
      console.log(`    Recharge Pile: ${playerZones.rechargePile.length} cards`);
      console.log(`    Summons in Play: ${playerZones.summonUnits.length}`);
      console.log();
    });

    // Board state
    const summonCount = Object.keys(state.summonUnits).length;
    console.log(`Board: 12x14 grid (${summonCount} units placed)`);
    console.log(`Turn Summon Used: ${state.turnSummonUsed}`);
    console.log();
  }

  /**
   * Show available summon slots for the current player
   */
  private showSummonSlots(playerId: string): void {
    const slotDefinitions = (globalThis as any).summonSlotDefinitions;

    if (!slotDefinitions) {
      console.log("❌ Summon slot data not loaded yet");
      return;
    }

    const playerSlots = playerId === "playerA" ? slotDefinitions.playerA_slots : slotDefinitions.playerB_slots;

    if (!playerSlots) {
      console.log(`❌ No summon slots found for ${playerId}`);
      return;
    }

    console.log();
    console.log(`${playerId}'s Summon Slots:`);
    console.log("=====================");

    playerSlots.forEach((slot: any, index: number) => {
      console.log(`${index}. ${slot.summon} + ${slot.role} + ${slot.equipment.weapon || slot.equipment.armor || slot.equipment.accessory}`);

      // Show synthesis preview if possible
      const state = this.engine.getState();
      const config = this.engine.getConfig();

      // Basic info about the slot composition
      const summonCard = config.cardDatabase[slot.summon];
      const roleCard = config.cardDatabase[slot.role];
      const equipmentCard = config.cardDatabase[slot.equipment.weapon || slot.equipment.armor || slot.equipment.accessory];

      if (summonCard && summonCard.type === "summon") {
        console.log(`   🧬 Base: ${summonCard.name} (${(summonCard as any).speciesId || "Unknown Species"})`);
      }
      if (roleCard) {
        console.log(`   🎭 Role: ${roleCard.name}`);
      }
      if (equipmentCard) {
        console.log(`   ⚔️  Equipment: ${equipmentCard.name}`);
        if (equipmentCard.type === "equipment" && (equipmentCard as any).subtype === "weapon" && (equipmentCard as any).range) {
          console.log(`      📏 Range: ${(equipmentCard as any).range} | 💪 Power: ${(equipmentCard as any).power || "N/A"}`);
        }
      }
      console.log();
    });

    console.log("💡 Use 'summon <slotIndex> <x> <y>' to play a summon slot");
    console.log();
  }

  /**
   * Play a summon slot using available summon cards as proxy
   */
  private playSummonSlot(playerId: string, slotIndex: number, position: { x: number; y: number }): void {
    const slotDefinitions = (globalThis as any).summonSlotDefinitions;

    if (!slotDefinitions) {
      console.log("❌ Summon slot data not loaded yet");
      return;
    }

    const playerSlots = playerId === "playerA" ? slotDefinitions.playerA_slots : slotDefinitions.playerB_slots;

    if (!playerSlots || !playerSlots[slotIndex]) {
      console.log(`❌ Invalid slot index ${slotIndex}`);
      return;
    }

    const slot = playerSlots[slotIndex];
    console.log(`🧬 Playing slot: ${slot.summon} + ${slot.role} + ${Object.values(slot.equipment)[0]}...`);

    // For now, use the summon card from the slot to play through the existing system
    const summonCardId = slot.summon;

    // Create the play action using the existing playCard system
    const playAction: GameAction = {
      type: "playCard",
      playerId: playerId,
      parameters: {
        cardId: summonCardId,
        position: position,
      },
    };

    const result = this.engine.processAction(playAction);
    console.log(`Play result: ${result.message}`);

    if (result.success) {
      console.log("✅ Summon played successfully!");
      console.log("💡 Note: Full summon slot synthesis will be integrated in future CLI updates");
      this.displayGameState();
    } else {
      console.log("💡 Tip: Make sure the summon card is in your hand and position is valid");
      console.log("💡 Use 'hand' to see your cards, 'board' to check valid positions");
    }
  }

  /**
   * Show detailed information about a unit
   */
  private showUnitInfo(unitId: string): void {
    const state = this.engine.getState();
    const unit = state.summonUnits[unitId];

    if (!unit) {
      console.log(`❌ Unit ${unitId} not found`);
      return;
    }

    // Find which player owns this unit
    let owner = "Unknown";
    for (const [playerId, playerZones] of Object.entries(state.players)) {
      if (playerZones.summonUnits.includes(unit.id)) {
        owner = playerId;
        break;
      }
    }

    console.log();
    console.log(`Unit Information: ${unit.id}`);
    console.log("=".repeat(40));
    console.log(`Owner: ${owner}`);
    console.log(`Position: (${unit.position.x}, ${unit.position.y})`);
    console.log(`Level: ${unit.level}`);
    console.log(`HP: ${unit.currentHP}/${unit.maxHP}`);
    console.log();

    console.log("📊 Current Stats:");
    console.log(`   STR: ${unit.currentStats.STR} | END: ${unit.currentStats.END} | DEF: ${unit.currentStats.DEF}`);
    console.log(`   INT: ${unit.currentStats.INT} | SPI: ${unit.currentStats.SPI} | MDF: ${unit.currentStats.MDF}`);
    console.log(`   SPD: ${unit.currentStats.SPD} | ACC: ${unit.currentStats.ACC} | LCK: ${unit.currentStats.LCK}`);
    console.log();

    console.log("🏃 Movement & Combat:");
    console.log(`   Movement: ${unit.movementUsed}/${unit.totalMovement}`);
    console.log(`   Attacks: ${unit.attacksUsed}/${unit.maxAttacks}`);

    // Show weapon information if available
    const config = this.engine.getConfig();
    if (unit.currentEquipment?.weapon) {
      const weaponCard = config.cardDatabase[unit.currentEquipment.weapon];
      if (weaponCard && (weaponCard as any).range) {
        console.log(`   🗡️  Weapon: ${weaponCard.name}`);
        console.log(`   📏 Attack Range: ${(weaponCard as any).range}`);
        console.log(`   💪 Weapon Power: ${(weaponCard as any).power || "N/A"}`);
      }
    }

    console.log();
    console.log("🧬 Current Equipment:");
    if (unit.currentEquipment.weapon) {
      const weaponCard = config.cardDatabase[unit.currentEquipment.weapon];
      console.log(`   Weapon: ${weaponCard?.name || unit.currentEquipment.weapon}`);
    }
    if (unit.currentEquipment.armor) {
      const armorCard = config.cardDatabase[unit.currentEquipment.armor];
      console.log(`   Armor: ${armorCard?.name || unit.currentEquipment.armor}`);
    }
    if (unit.currentEquipment.accessory) {
      const accessoryCard = config.cardDatabase[unit.currentEquipment.accessory];
      console.log(`   Accessory: ${accessoryCard?.name || unit.currentEquipment.accessory}`);
    }
    if (unit.currentEquipment.offhand) {
      const offhandCard = config.cardDatabase[unit.currentEquipment.offhand];
      console.log(`   Offhand: ${offhandCard?.name || unit.currentEquipment.offhand}`);
    }

    console.log();
    console.log("🧬 Base Information:");
    console.log(`   Base Card: ${unit.baseCard}`);
    console.log(`   Current Role: ${unit.currentRole}`);
    console.log();
  }

  /**
   * Show player's hand
   */
  private showPlayerHand(playerId: string): void {
    const state = this.engine.getState();
    const playerZones = state.players[playerId];
    const config = this.engine.getConfig();

    console.log();
    console.log(`${playerId}'s Hand:`);
    console.log("================");

    if (playerZones.hand.length === 0) {
      console.log("No cards in hand");
    } else {
      playerZones.hand.forEach((cardId, index) => {
        const card = config.cardDatabase[cardId];
        const cardInfo = card ? `${card.name} (${card.type})` : cardId;
        console.log(`${index + 1}. ${cardId} - ${cardInfo}`);
      });
    }
    console.log();
  }

  /**
   * Show board state with units
   */
  private showBoard(): void {
    const state = this.engine.getState();

    console.log();
    console.log("BOARD STATE");
    console.log("===========");
    console.log("12x14 grid (0,0 = bottom-left)");
    console.log("Player 1 territory: rows 0-2");
    console.log("Player 2 territory: rows 11-13");
    console.log();

    // Show units on board
    const units = Object.values(state.summonUnits);
    if (units.length === 0) {
      console.log("No units on board");
    } else {
      console.log("Units on Board:");
      console.log("---------------");
      units.forEach((unit) => {
        // Find which player owns this unit
        let owner = "Unknown";
        for (const [playerId, playerZones] of Object.entries(state.players)) {
          if (playerZones.summonUnits.includes(unit.id)) {
            owner = playerId;
            break;
          }
        }

        console.log(`📍 ${unit.id} [${owner}] at (${unit.position.x}, ${unit.position.y})`);
        console.log(`   ❤️  Level ${unit.level} | HP: ${unit.currentHP}/${unit.maxHP}`);
        console.log(`   🏃 Movement: ${unit.movementUsed}/${unit.totalMovement} | ⚔️  Attacks: ${unit.attacksUsed}/${unit.maxAttacks}`);
        console.log(
          `   📊 STR:${unit.currentStats.STR} DEF:${unit.currentStats.DEF} SPD:${unit.currentStats.SPD} ACC:${unit.currentStats.ACC} LCK:${unit.currentStats.LCK}`
        );
        console.log();
      });

      console.log("💡 Use 'move <unitId> <x> <y>' to move units");
      console.log("💡 Use 'attack <yourUnit> <enemyUnit>' to attack (must be adjacent)");
    }
    console.log();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log();
    console.log("Available Commands:");
    console.log("==================");
    console.log("help       - Show this help message");
    console.log("state      - Display current game state");
    console.log("hand       - Show current player's hand");
    console.log("board      - Show board with unit positions and stats");
    console.log("slots      - Show available summon slots with synthesis preview");
    console.log("summon <slotIndex> <x> <y> - Play a summon slot (uses synthesis system)");
    console.log("play <card> <x> <y> - Play a card at position");
    console.log("move <unitId> <x> <y> - Move unit to position");
    console.log("attack <attackerUnitId> <targetUnitId> - Attack target unit");
    console.log("info <unitId> - Show detailed unit info including weapon range");
    console.log("end        - End the current phase");
    console.log("quit       - Exit the game");
    console.log();

    const state = this.engine.getState();
    console.log("Current Context:");
    console.log(`- Turn: ${state.turn}`);
    console.log(`- Phase: ${state.phase}`);
    console.log(`- Active Player: ${state.activePlayer}`);

    console.log();
    console.log("Phase Information:");
    console.log("- SETUP: Game initialization");
    console.log("- DRAW: Draw 1 card (skipped on turn 1)");
    console.log("- LEVEL: All your summons gain 1 level");
    console.log("- ACTION: Play cards, move units, attack");
    console.log("- END: Hand limit (6), cleanup effects");

    console.log();
    console.log("Phase 4&5 Features:");
    console.log("- Real card database with 32+ Alpha set cards loaded");
    console.log("- Summon slot synthesis: Summon + Role + Equipment = final unit");
    console.log("- Weapon-based combat with range/power calculations");
    console.log("- Species database with proper stat growth rates");
    console.log("- Digital signature validation for summon cards");

    console.log();
    console.log("Game Rules:");
    console.log("- Place summons in your territory (Player 1: rows 0-2, Player 2: rows 11-13)");
    console.log("- Units can move up to their movement speed per turn");
    console.log("- Weapon ranges: Sword=1, Bow=4, Wand=1 (melee vs ranged)");
    console.log("- Attack power = base damage + weapon power bonus");
    console.log("- Defeating enemy units awards Victory Points");
    console.log("- First to 3 Victory Points wins!");
    console.log();
  }

  /**
   * Prompt for user input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Run the CLI tool
const tester = new CLIGameTester();
tester.start().catch(console.error);
