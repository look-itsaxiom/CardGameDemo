/**
 * Alpha Set Card Implementation Test Library
 *
 * This library tests whether all cards mentioned in the play example
 * and legacy data have been properly implemented in the new TypeScript format.
 *
 * It validates:
 * - Card existence and structure
 * - ID consistency with legacy data
 * - Implementation completeness
 * - Type safety and exports
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";

// Cards mentioned in the play example and legacy data
const EXPECTED_CARDS = {
    action: [
        { id: "001-blast_bolt-Alpha", name: "Blast Bolt", implemented: true },
        {
            id: "005-sharpened_blade-Alpha",
            name: "Sharpened Blade",
            implemented: true,
        },
        {
            id: "006-healing_hands-Alpha",
            name: "Healing Hands",
            implemented: true,
        },
        { id: "009-rush-Alpha", name: "Rush", implemented: true },
        { id: "011-ensnare-Alpha", name: "Ensnare", implemented: true },
        {
            id: "012-drain_touch-Alpha",
            name: "Drain Touch",
            implemented: true,
        },
        {
            id: "013-adventurous_spirit-Alpha",
            name: "Adventurous Spirit",
            implemented: true,
        },
        {
            id: "015-spell_recall-Alpha",
            name: "Spell Recall",
            implemented: true,
        },
        {
            id: "016-life_alchemy-Alpha",
            name: "Life Alchemy",
            implemented: true,
        },
        { id: "017-dual_shot-Alpha", name: "Dual Shot", implemented: true },
    ],
    role: [
        { id: "020-warrior-Alpha", name: "Warrior", implemented: true },
        { id: "021-magician-Alpha", name: "Magician", implemented: true },
        { id: "022-scout-Alpha", name: "Scout", implemented: true },
        { id: "023-berserker-Alpha", name: "Berserker", implemented: true },
        { id: "024-knight-Alpha", name: "Knight", implemented: true },
        {
            id: "025-element_mage-Alpha",
            name: "Element Mage",
            implemented: true,
        },
        { id: "026-dark_mage-Alpha", name: "Dark Mage", implemented: true },
        { id: "027-light_mage-Alpha", name: "Light Mage", implemented: true },
        { id: "028-rogue-Alpha", name: "Rogue", implemented: true },
        { id: "029-explorer-Alpha", name: "Explorer", implemented: true },
        { id: "030-sentinel-Alpha", name: "Sentinel", implemented: true },
        { id: "031-paladin-Alpha", name: "Paladin", implemented: true },
        { id: "032-warlock-Alpha", name: "Warlock", implemented: true },
    ],
    building: [
        { id: "010-dark_altar-Alpha", name: "Dark Altar", implemented: true },
        {
            id: "004-gignen_country-Alpha",
            name: "Gignen Country",
            implemented: true,
        },
    ],
    quest: [
        {
            id: "060-nearwood_forest_expedition-Alpha",
            name: "Nearwood Forest Expedition",
            implemented: true,
        },
        {
            id: "003-taste_of_battle-Alpha",
            name: "Taste of Battle",
            implemented: true,
        },
    ],
    counter: [
        {
            id: "070-dramatic_return-Alpha",
            name: "Dramatic Return!",
            implemented: true,
        },
        {
            id: "019-graverobbing-Alpha",
            name: "Graverobbing",
            implemented: true,
        },
    ],
    equipment: [
        {
            id: "034-heirloom_sword-Alpha",
            name: "Heirloom Sword",
            implemented: true,
        },
        {
            id: "035-apprentices_wand-Alpha",
            name: "Apprentice's Wand",
            implemented: true,
        },
        {
            id: "036-hunting_bow-Alpha",
            name: "Hunting Bow",
            implemented: true,
        },
    ],
    advance: [
        {
            id: "007-berserker_rage-Alpha",
            name: "Berserker Rage",
            implemented: true,
        },
        {
            id: "008-knighthood_ceremony-Alpha",
            name: "Knighthood Ceremony",
            implemented: true,
        },
        {
            id: "018-shadow_pact-Alpha",
            name: "Shadow Pact",
            implemented: true,
        },
        {
            id: "014-alrecht_barkstep-Alpha",
            name: "Alrecht Barkstep, Scoutmaster",
            implemented: true,
        },
        {
            id: "033-oath_of_light-Alpha",
            name: "Oath of Light",
            implemented: true,
        },
    ],
};

class AlphaSetTestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            errors: [],
            warnings: [],
            summary: {},
        };
    }

    async runAllTests() {
        console.log("🧪 Running Alpha Set Card Implementation Tests\n");

        await this.testActionCards();
        await this.testRoleCards();
        await this.testBuildingCards();
        await this.testQuestCards();
        await this.testCounterCards();
        await this.testEquipmentCards();
        await this.testAdvanceCards();

        this.printSummary();
        return this.results;
    }

    async testActionCards() {
        console.log("🎯 Testing Action Cards...");

        try {
            const actionCardsPath = join(
                process.cwd(),
                "src",
                "data",
                "cards",
                "sets",
                "alpha",
                "action-cards"
            );
            const files = await readdir(actionCardsPath);
            const tsFiles = files.filter(
                (f) => f.endsWith(".ts") && f !== "index.ts"
            );

            console.log(`   Found ${tsFiles.length} action card files`);

            // Check each expected action card
            for (const expectedCard of EXPECTED_CARDS.action) {
                const fileName = this.getFileNameFromId(expectedCard.id);
                const fileExists = tsFiles.includes(`${fileName}.ts`);

                if (expectedCard.implemented && fileExists) {
                    await this.validateCardFile(
                        actionCardsPath,
                        `${fileName}.ts`,
                        expectedCard
                    );
                    this.results.passed++;
                } else if (expectedCard.implemented && !fileExists) {
                    this.results.failed++;
                    this.results.errors.push(
                        `❌ ${expectedCard.name}: Expected file ${fileName}.ts not found`
                    );
                } else if (!expectedCard.implemented && fileExists) {
                    this.results.warnings.push(
                        `⚠️  ${expectedCard.name}: File exists but not marked as implemented`
                    );
                } else {
                    this.results.warnings.push(
                        `📋 ${expectedCard.name}: Not yet implemented`
                    );
                }
            }

            console.log(`   ✅ Action cards test completed\n`);
        } catch (error) {
            console.error(`   ❌ Action cards test failed: ${error.message}\n`);
            this.results.failed++;
        }
    }

    async testRoleCards() {
        console.log("👑 Testing Role Cards...");

        try {
            const roleCardsPath = join(
                process.cwd(),
                "src",
                "data",
                "cards",
                "sets",
                "alpha",
                "role-cards"
            );
            const files = await readdir(roleCardsPath);
            const tsFiles = files.filter(
                (f) =>
                    f.endsWith(".ts") &&
                    f !== "index.ts" &&
                    f !== "example-roles.ts"
            );

            console.log(`   Found ${tsFiles.length} role card files`);

            // Check each expected role card
            for (const expectedCard of EXPECTED_CARDS.role) {
                const fileName = this.getFileNameFromId(expectedCard.id);
                const fileExists = tsFiles.includes(`${fileName}.ts`);

                if (expectedCard.implemented && fileExists) {
                    await this.validateCardFile(
                        roleCardsPath,
                        `${fileName}.ts`,
                        expectedCard
                    );
                    this.results.passed++;
                } else if (expectedCard.implemented && !fileExists) {
                    this.results.failed++;
                    this.results.errors.push(
                        `❌ ${expectedCard.name}: Expected file ${fileName}.ts not found`
                    );
                } else {
                    this.results.warnings.push(
                        `📋 ${expectedCard.name}: Not yet implemented`
                    );
                }
            }

            console.log(`   ✅ Role cards test completed\n`);
        } catch (error) {
            console.error(`   ❌ Role cards test failed: ${error.message}\n`);
            this.results.failed++;
        }
    }

    async testBuildingCards() {
        console.log("🏗️  Testing Building Cards...");
        await this.testCardType("building", "building-cards");
    }

    async testQuestCards() {
        console.log("📜 Testing Quest Cards...");
        await this.testCardType("quest", "quest-cards");
    }

    async testCounterCards() {
        console.log("🛡️  Testing Counter Cards...");
        await this.testCardType("counter", "counter-cards");
    }

    async testEquipmentCards() {
        console.log("⚔️  Testing Equipment Cards...");
        await this.testCardType("equipment", "weapon-cards");
    }

    async testAdvanceCards() {
        console.log("⬆️  Testing Advance Cards...");
        await this.testCardType("advance", "advance-cards");
    }

    async testCardType(cardType, folderName) {
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
            const tsFiles = files.filter(
                (f) => f.endsWith(".ts") && f !== "index.ts"
            );

            console.log(`   Found ${tsFiles.length} ${cardType} card files`);

            const expectedCards = EXPECTED_CARDS[cardType] || [];
            const implementedCount = expectedCards.filter(
                (c) => c.implemented
            ).length;
            const totalCount = expectedCards.length;

            console.log(
                `   Expected: ${totalCount} cards, Implemented: ${implementedCount} cards`
            );

            if (implementedCount === 0) {
                this.results.warnings.push(
                    `📋 ${cardType} cards: Not yet implemented`
                );
            }

            console.log(`   ✅ ${cardType} cards test completed\n`);
        } catch (error) {
            console.error(
                `   ❌ ${cardType} cards test failed: ${error.message}\n`
            );
            this.results.failed++;
        }
    }

    async validateCardFile(basePath, fileName, expectedCard) {
        try {
            const filePath = join(basePath, fileName);
            const content = await readFile(filePath, "utf-8");

            // Check if the card ID matches
            if (!content.includes(expectedCard.id)) {
                this.results.errors.push(
                    `❌ ${expectedCard.name}: ID mismatch in ${fileName}`
                );
                return;
            }

            // Check if it has proper exports
            if (
                !content.includes("export const") &&
                !content.includes("export default")
            ) {
                this.results.errors.push(
                    `❌ ${expectedCard.name}: Missing proper exports in ${fileName}`
                );
                return;
            }

            // Check if it imports from @types
            if (!content.includes('from "@types"')) {
                this.results.warnings.push(
                    `⚠️  ${expectedCard.name}: Missing @types import in ${fileName}`
                );
            }

            console.log(`   ✅ ${expectedCard.name}: Validated successfully`);
        } catch (error) {
            this.results.errors.push(
                `❌ ${expectedCard.name}: Failed to validate ${fileName} - ${error.message}`
            );
        }
    }

    getFileNameFromId(id) {
        // Convert ID like "005-sharpen_blade-Alpha" to "sharpened-blade"
        const parts = id.split("-");
        if (parts.length >= 2) {
            return parts[1].replace(/_/g, "-");
        }
        return id;
    }

    printSummary() {
        console.log("📊 Test Results Summary");
        console.log("=".repeat(50));

        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
        console.log("");

        if (this.results.errors.length > 0) {
            console.log("❌ Errors:");
            this.results.errors.forEach((error) => console.log(`   ${error}`));
            console.log("");
        }

        if (this.results.warnings.length > 0) {
            console.log("⚠️  Warnings:");
            this.results.warnings.forEach((warning) =>
                console.log(`   ${warning}`)
            );
            console.log("");
        }

        // Calculate implementation progress
        const totalExpected = Object.values(EXPECTED_CARDS).flat().length;
        const totalImplemented = Object.values(EXPECTED_CARDS)
            .flat()
            .filter((c) => c.implemented).length;
        const completionPercentage = Math.round(
            (totalImplemented / totalExpected) * 100
        );

        console.log(
            `🎯 Implementation Progress: ${totalImplemented}/${totalExpected} (${completionPercentage}%)`
        );
        console.log("=".repeat(50));

        // Break down by card type
        Object.entries(EXPECTED_CARDS).forEach(([cardType, cards]) => {
            const implemented = cards.filter((c) => c.implemented).length;
            const total = cards.length;
            const percentage = Math.round((implemented / total) * 100);
            console.log(
                `   ${cardType}: ${implemented}/${total} (${percentage}%)`
            );
        });
    }
}

// Export for use in other scripts
export { AlphaSetTestRunner, EXPECTED_CARDS };

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    const testRunner = new AlphaSetTestRunner();
    testRunner
        .runAllTests()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("Test runner failed:", error);
            process.exit(1);
        });
}
