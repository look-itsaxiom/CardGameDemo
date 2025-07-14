#!/usr/bin/env node

/**
 * Play Example Card Validation
 *
 * Checks if cards mentioned in the play example are implemented
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";

// Cards specifically mentioned in the play example (copilot-instructions.md)
const PLAY_EXAMPLE_CARDS = [
    // From Turn 1 - Player A draws
    { name: "Sharpened Blade", type: "action", id: "005-sharpened_blade-Alpha" },
    { name: "Healing Hands", type: "action", id: "006-healing_hands-Alpha" },
    { name: "Rush", type: "action", id: "009-rush-Alpha" },

    // From Turn 2 - Player B draws
    { name: "Blast Bolt", type: "action", id: "001-blast_bolt-Alpha" },
    { name: "Dark Altar", type: "building", id: "010-dark_altar-Alpha" },
    { name: "Ensnare", type: "action", id: "011-ensnare-Alpha" },

    // From Turn 2 - Player B draws "Drain Touch"
    { name: "Drain Touch", type: "action", id: "012-drain_touch-Alpha" },

    // From Turn 3 - Player A draws "Gignen Country"
    {
        name: "Gignen Country",
        type: "building",
        id: "004-gignen_country-Alpha",
    },

    // Equipment mentioned
    {
        name: "Heirloom Sword",
        type: "equipment",
        id: "034-heirloom_sword-Alpha",
    },
    {
        name: "Apprentice's Wand",
        type: "equipment",
        id: "035-apprentices_wand-Alpha",
    },
    { name: "Hunting Bow", type: "equipment", id: "036-hunting_bow-Alpha" },

    // Quest cards mentioned
    {
        name: "Nearwood Forest Expedition",
        type: "quest",
        id: "060-nearwood_forest_expedition-Alpha",
    },

    // Counter cards mentioned
    {
        name: "Dramatic Return!",
        type: "counter",
        id: "070-dramatic_return-Alpha",
    },
    { name: "Graverobbing", type: "counter", id: "019-graverobbing-Alpha" },

    // Advance cards mentioned
    { name: "Berserker Rage", type: "advance", id: "007-berserker_rage-Alpha" },
    { name: "Shadow Pact", type: "advance", id: "018-shadow_pact-Alpha" },
    {
        name: "Alrecht Barkstep, Scoutmaster",
        type: "advance",
        id: "014-alrecht_barkstep-Alpha",
    },

    // Other action cards mentioned later
    { name: "Dual Shot", type: "action", id: "017-dual_shot-Alpha" },
    { name: "Life Alchemy", type: "action", id: "016-life_alchemy-Alpha" },
];

const FOLDER_MAP = {
    action: "action-cards",
    building: "building-cards",
    equipment: "weapon-cards", // Equipment cards are in weapon-cards folder for now
    quest: "quest-cards",
    counter: "counter-cards",
    advance: "advance-cards",
};

async function validatePlayExampleCards() {
    console.log("🎮 Play Example Card Validation");
    console.log("===============================\n");

    let implemented = 0;
    let total = PLAY_EXAMPLE_CARDS.length;

    for (const card of PLAY_EXAMPLE_CARDS) {
        const folderName = FOLDER_MAP[card.type];
        if (!folderName) {
            console.log(`❓ ${card.name}: Unknown card type '${card.type}'`);
            continue;
        }

        try {
            const cardsPath = join(
                process.cwd(),
                "src",
                "data",
                "cards",
                "sets",
                "alpha",
                folderName
            );
            const files = await readdir(cardsPath).catch(() => []);

            // Convert card ID to filename (e.g., "005-sharpen_blade-Alpha" -> "sharpened-blade.ts")
            const fileName = getFileNameFromId(card.id) + ".ts";
            const fileExists = files.includes(fileName);

            if (fileExists) {
                // Verify the card has the correct ID
                const filePath = join(cardsPath, fileName);
                const content = await readFile(filePath, "utf-8");

                if (content.includes(card.id)) {
                    console.log(`✅ ${card.name} (${card.type})`);
                    implemented++;
                } else {
                    console.log(
                        `⚠️  ${card.name} (${card.type}): File exists but ID mismatch`
                    );
                }
            } else {
                console.log(`❌ ${card.name} (${card.type}): Not implemented`);
            }
        } catch (error) {
            console.log(
                `❌ ${card.name} (${card.type}): Error - ${error.message}`
            );
        }
    }

    console.log("\n" + "─".repeat(40));
    const percentage = Math.round((implemented / total) * 100);
    console.log(
        `📊 Play Example Coverage: ${implemented}/${total} (${percentage}%)`
    );

    if (percentage === 100) {
        console.log("🎉 All play example cards are implemented!");
    } else {
        const remaining = total - implemented;
        console.log(
            `🎯 ${remaining} cards from the play example still need implementation`
        );

        // List the missing cards
        console.log("\n📋 Missing cards:");
        for (const card of PLAY_EXAMPLE_CARDS) {
            const folderName = FOLDER_MAP[card.type];
            if (folderName) {
                const cardsPath = join(
                    process.cwd(),
                    "src",
                    "data",
                    "cards",
                    "sets",
                    "alpha",
                    folderName
                );
                const files = await readdir(cardsPath).catch(() => []);
                const fileName = getFileNameFromId(card.id) + ".ts";

                if (!files.includes(fileName)) {
                    console.log(`   - ${card.name} (${card.type})`);
                }
            }
        }
    }
}

function getFileNameFromId(id) {
    // Convert ID like "005-sharpen_blade-Alpha" to "sharpened-blade"
    const parts = id.split("-");
    if (parts.length >= 2) {
        let fileName = parts[1].replace(/_/g, "-");
        // Handle special cases
        if (fileName === "sharpen-blade") fileName = "sharpened-blade";
        if (fileName === "healing-hands") fileName = "healing-hands";
        return fileName;
    }
    return id.toLowerCase().replace(/_/g, "-");
}

validatePlayExampleCards().catch(console.error);
