#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Import all cards from the alpha set
import * as alphaActionCards from "../../src/data/cards/sets/alpha/action-cards/index.js";
import * as alphaAdvanceCards from "../../src/data/cards/sets/alpha/advance-cards/index.js";
import * as alphaBuildingCards from "../../src/data/cards/sets/alpha/building-cards/index.js";
import * as alphaCounterCards from "../../src/data/cards/sets/alpha/counter-cards/index.js";
import * as alphaQuestCards from "../../src/data/cards/sets/alpha/quest-cards/index.js";
import * as alphaRoleCards from "../../src/data/cards/sets/alpha/role-cards/index.js";
import * as alphaWeaponCards from "../../src/data/cards/sets/alpha/weapon-cards/index.js";

// Import player data
import {
    allPlayers,
    allDecks,
    allGeneratedSummons,
} from "../../src/data/players/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LegacyCard {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    card_type: string;
    [key: string]: any;
}

interface LegacyDatabase {
    cards: LegacyCard[];
    decks: any[];
    players: any[];
}

/**
 * Convert a modern SummonCard to legacy format
 */
function convertSummonCardToLegacy(summonCard: any): LegacyCard {
    return {
        id: summonCard.id,
        name: summonCard.name,
        display_name: summonCard.name,
        description: summonCard.description || "",
        card_type: "summon",
        species: summonCard.speciesId,
        attribute: summonCard.attribute,
        rarity: summonCard.rarity,
        base_stats: summonCard.baseStats,
        growth_rates: summonCard.growthRates,
        opened_date: new Date(
            summonCard.digitalSignature.timestamp
        ).toISOString(),
        opened_by: summonCard.digitalSignature.openedBy,
        template_id: summonCard.speciesId,
        rank: 1,
        digital_signature: {
            unique_id: summonCard.digitalSignature.uniqueId,
            opened_by: summonCard.digitalSignature.openedBy,
            timestamp: summonCard.digitalSignature.timestamp,
            signature: summonCard.digitalSignature.signature,
        },
    };
}

/**
 * Convert a modern Player to legacy format
 */
function convertPlayerToLegacy(player: any): any {
    return {
        id: player.id,
        name: player.name,
        owned_cards: player.collection.summonCards,
    };
}

/**
 * Convert a modern Deck to legacy format
 */
function convertDeckToLegacy(deck: any): any {
    return {
        id: deck.id,
        name: deck.name,
        format: deck.format,
        main_deck: deck.mainDeck,
        advance_deck: deck.advanceDeck,
        summons: deck.summonSlots.map((slot: any, index: number) => ({
            slot_index: index,
            summon_id: slot.summonCard,
            role_id: slot.roleCard,
            equipment_slot: slot.equipment.weapon || null,
        })),
    };
}

/**
 * Convert a TypeScript card object to legacy JSON format
 */
function convertCardToLegacy(card: any): LegacyCard {
    const legacyCard: LegacyCard = {
        id: card.id,
        name: card.name,
        display_name: card.name,
        description: card.description || "",
        card_type: card.type?.toLowerCase() || "unknown",
    };

    // Add specific properties based on card type
    if (card.rarity) {
        legacyCard.rarity = card.rarity.toLowerCase();
    }

    if (card.attribute) {
        legacyCard.attribute = card.attribute;
    }

    if (card.destinationPile) {
        legacyCard.zone_after_resolve = card.destinationPile;
    }

    // Convert requirements
    if (card.requirements) {
        legacyCard.play_requirements = {};
        legacyCard.resolve_requirements = {};

        card.requirements.forEach((req: any) => {
            if (req.type === "controlledSummon") {
                legacyCard.play_requirements.controlled_role =
                    req.parameters.roleType;
                legacyCard.resolve_requirements.controlled_role =
                    req.parameters.roleType;
            }
            if (req.type === "hasValidTarget") {
                legacyCard.play_requirements.target_valid = true;
                legacyCard.resolve_requirements.target_valid = true;
            }
        });
    }

    // Convert targeting
    if (card.effects && card.effects[0] && card.effects[0].targeting) {
        const targeting = card.effects[0].targeting;
        legacyCard.target = {};

        if (targeting.restrictions) {
            const restriction = targeting.restrictions[0];
            legacyCard.target.type = restriction.type;
            legacyCard.target.zone = restriction.zone;
            legacyCard.target.controller = restriction.controller;
            if (restriction.minimumCount) {
                legacyCard.target.amount = restriction.minimumCount;
            }
        }
    }

    // Convert effects
    if (card.effects) {
        legacyCard.effects = card.effects.map((effect: any) => ({
            type: effect.type,
            ...effect.parameters,
        }));
    }

    // Add triggers
    if (card.activationTrigger) {
        legacyCard.trigger = [card.activationTrigger.id];
    } else {
        legacyCard.trigger = ["on_play"];
    }

    legacyCard.resolve_timing = ["immediate"];

    // Equipment specific properties
    if (card.type === "equipment") {
        legacyCard.equipment_type = card.equipmentType;
        legacyCard.base_power = card.basePower;
        legacyCard.attack_range = card.attackRange;
        legacyCard.damage_stat = card.damageType?.stat;
        legacyCard.damage_type = card.damageType?.type;
        if (card.statModifiers) {
            legacyCard.stat_modifiers = card.statModifiers;
        }
    }

    // Role specific properties
    if (card.type === "role") {
        legacyCard.role_type = card.roleFamily;
        legacyCard.tier = card.tier;
        if (card.requirements) {
            legacyCard.requirements = {
                min_level:
                    card.requirements.find(
                        (r: any) => r.type === "minimumLevel"
                    )?.parameters.level || 1,
            };
        }
        if (card.statModifiers) {
            legacyCard.stat_modifiers = card.statModifiers;
        }
    }

    // Quest specific properties
    if (card.type === "quest") {
        // Convert objectiveRequirements to legacy objectives format
        legacyCard.objectives = card.objectiveRequirements
            ? card.objectiveRequirements.map((req: any) => ({
                  id: req.id,
                  type: req.type,
                  ...req.parameters,
              }))
            : [];

        // Convert objectiveEffects to legacy rewards format
        legacyCard.rewards = card.objectiveEffects
            ? card.objectiveEffects.map((effect: any) => ({
                  id: effect.id,
                  type: effect.type,
                  ...effect.parameters,
              }))
            : [];

        legacyCard.fail_conditions = card.failConditions || [];
        legacyCard.zone_after_complete =
            card.destinationOnCompletion || "recharge";
        legacyCard.zone_after_fail = card.destinationOnFailure || "discard";
    }

    // Advance/Named Summon specific properties
    if (card.type === "advance_named_summon") {
        legacyCard.species = card.species;
        legacyCard.role = card.role;
        legacyCard.base_stats = card.baseStats;
        legacyCard.growth_rates = card.growthRates;
        legacyCard.equipment = card.equipment;
        legacyCard.starting_position = card.startingPosition;
        legacyCard.zone_after_destroy = card.destroyDestination || "removed";
    }

    return legacyCard;
}

/**
 * Collect all cards from the imported modules
 */
function collectAllCards(): any[] {
    const allCards: any[] = [];

    // Helper function to extract cards from a module
    function extractCards(moduleObj: any) {
        for (const [key, value] of Object.entries(moduleObj)) {
            if (key === "default" && Array.isArray(value)) {
                // Handle default export arrays
                allCards.push(...value);
            } else if (
                typeof value === "object" &&
                value !== null &&
                (value as any).id
            ) {
                // Handle individual card objects
                allCards.push(value);
            }
        }
    }

    // Extract cards from all modules
    extractCards(alphaActionCards);
    extractCards(alphaAdvanceCards);
    extractCards(alphaBuildingCards);
    extractCards(alphaCounterCards);
    extractCards(alphaQuestCards);
    extractCards(alphaRoleCards);
    extractCards(alphaWeaponCards);

    return allCards;
}

/**
 * Validate card database for consistency
 */
function validateCardDatabase(cards: LegacyCard[]): void {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    for (const card of cards) {
        // Check for duplicate IDs
        if (seenIds.has(card.id)) {
            errors.push(`Duplicate card ID: ${card.id}`);
        }
        seenIds.add(card.id);

        // Check required fields
        if (!card.id || !card.name || !card.card_type) {
            errors.push(`Card ${card.id || "unknown"} missing required fields`);
        }

        // Validate ID format
        if (
            card.id &&
            card.card_type !== "summon" &&
            !card.id.match(/^\d{3}-[\w_]+-Alpha$/)
        ) {
            errors.push(`Invalid ID format: ${card.id}`);
        }

        // Validate summon ID format (unique IDs have different format)
        if (
            card.id &&
            card.card_type === "summon" &&
            !card.id.match(/^\d{3}-[\w_]+-Alpha\./)
        ) {
            errors.push(`Invalid summon ID format: ${card.id}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Card validation failed:\n${errors.join("\n")}`);
    }
}

/**
 * Build the card database
 */
async function buildCards(): Promise<void> {
    try {
        console.log("🔨 Building card database...");

        // Collect all cards
        const allCards = collectAllCards();
        console.log(`📋 Found ${allCards.length} cards to process`);

        // Convert to legacy format
        const legacyCards = allCards.map(convertCardToLegacy);

        // Add summon cards
        const legacySummons = allGeneratedSummons.map(
            convertSummonCardToLegacy
        );
        legacyCards.push(...legacySummons);

        // Convert players and decks
        const legacyPlayers = allPlayers.map(convertPlayerToLegacy);
        const legacyDecks = allDecks.map(convertDeckToLegacy);

        // Sort cards by ID for consistent output
        legacyCards.sort((a, b) => a.id.localeCompare(b.id));

        // Validate the database
        validateCardDatabase(legacyCards);

        // Create the legacy database structure
        const legacyDatabase: LegacyDatabase = {
            cards: legacyCards,
            decks: legacyDecks,
            players: legacyPlayers,
        };

        // Ensure output directory exists
        const outputPath = path.join(__dirname, "../../dist/cards.json");
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Write the database
        const jsonContent = JSON.stringify(legacyDatabase, null, 2);
        await fs.writeFile(outputPath, jsonContent);

        console.log(`✅ Card database built successfully!`);
        console.log(`📊 Total cards: ${legacyCards.length}`);
        console.log(`� Players: ${legacyPlayers.length}`);
        console.log(`🎴 Decks: ${legacyDecks.length}`);
        console.log(`�📁 Output: ${outputPath}`);
        console.log(
            `💾 Size: ${Math.round(Buffer.byteLength(jsonContent) / 1024)}KB`
        );

        // Group by card type for summary
        const cardTypes = legacyCards.reduce((acc, card) => {
            acc[card.card_type] = (acc[card.card_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log("\n📈 Card type breakdown:");
        Object.entries(cardTypes)
            .sort(([, a], [, b]) => b - a)
            .forEach(([type, count]) => {
                console.log(`   ${type}: ${count}`);
            });
    } catch (error) {
        console.error("❌ Build failed:", error);
        process.exit(1);
    }
}

// Handle watch mode
const isWatchMode = process.argv.includes("--watch");

if (isWatchMode) {
    console.log("👀 Starting watch mode...");
    // For now, just build once - would need file watching for true watch mode
    buildCards();
} else {
    buildCards();
}
