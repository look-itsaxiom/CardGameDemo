// Test script to validate player data structures
import {
    allPlayers,
    allGeneratedSummons,
    allDecks,
} from "../src/data/players/index.js";

console.log("=== PRINTING PLAYER DATA ===\n");

// Test players
console.log("Players:");
allPlayers.forEach((player) => {
    console.log(`- ${player.name} (${player.id})`);
    console.log(
        `  Summons in collection: ${player.collection.summonCards.length}`
    );
    console.log(`  Role cards: ${player.collection.roleCards.length}`);
    console.log(
        `  Equipment cards: ${player.collection.equipmentCards.length}`
    );
    console.log(`  Main deck cards: ${player.collection.mainDeckCards.length}`);
    console.log(`  Advance cards: ${player.collection.advanceCards.length}`);
    console.log(`  Decks: ${player.decks.length}`);
});

console.log("\n=== SUMMON CARDS ===");
allGeneratedSummons.forEach((summon) => {
    console.log(`\n${summon.name} (${summon.id})`);
    console.log(`  Species: ${summon.speciesId}`);
    console.log(`  Attribute: ${summon.attribute}`);
    console.log(`  Rarity: ${summon.rarity}`);
    console.log(`  Opened by: ${summon.digitalSignature.openedBy}`);
    console.log(
        `  Stats: STR:${summon.baseStats.STR} END:${summon.baseStats.END} DEF:${summon.baseStats.DEF} INT:${summon.baseStats.INT} SPI:${summon.baseStats.SPI} MDF:${summon.baseStats.MDF} SPD:${summon.baseStats.SPD} LCK:${summon.baseStats.LCK} ACC:${summon.baseStats.ACC}`
    );
    console.log(
        `  Growth: STR:${summon.growthRates.STR} END:${summon.growthRates.END} DEF:${summon.growthRates.DEF} INT:${summon.growthRates.INT} SPI:${summon.growthRates.SPI} MDF:${summon.growthRates.MDF} SPD:${summon.growthRates.SPD} LCK:${summon.growthRates.LCK} ACC:${summon.growthRates.ACC}`
    );
});

console.log("\n=== DECKS ===");
allDecks.forEach((deck) => {
    console.log(`\n${deck.name} (${deck.id})`);
    console.log(`  Format: ${deck.format}`);
    console.log(`  Main deck: ${deck.mainDeck.length} cards`);
    console.log(`  Advance deck: ${deck.advanceDeck.length} cards`);
    console.log(`  Summon slots: ${deck.summonSlots.length}`);

    deck.summonSlots.forEach((slot, index) => {
        console.log(
            `    Slot ${index + 1}: ${slot.summonCard} + ${slot.roleCard} + ${
                slot.equipment.weapon || "no weapon"
            }`
        );
    });
});

console.log("\n✅ All player data loaded successfully!");
