#!/usr/bin/env node

/**
 * Quick Alpha Set Progress Check
 *
 * Shows implementation progress for Alpha set cards
 */

import { readdir } from "fs/promises";
import { join } from "path";

const CARD_TYPES = {
    "action-cards": { expected: 10, folder: "action-cards" },
    "role-cards": { expected: 13, folder: "role-cards" },
    "building-cards": { expected: 2, folder: "building-cards" },
    "quest-cards": { expected: 2, folder: "quest-cards" },
    "counter-cards": { expected: 2, folder: "counter-cards" },
    "equipment-cards": { expected: 3, folder: "weapon-cards" }, // Equipment split into multiple folders
    "advance-cards": { expected: 5, folder: "advance-cards" },
};

async function checkProgress() {
    console.log("📊 Alpha Set Implementation Progress");
    console.log("===================================\n");

    let totalExpected = 0;
    let totalImplemented = 0;

    for (const [cardType, config] of Object.entries(CARD_TYPES)) {
        try {
            const cardsPath = join(
                process.cwd(),
                "src",
                "data",
                "cards",
                "sets",
                "alpha",
                config.folder
            );
            const files = await readdir(cardsPath).catch(() => []);
            const tsFiles = files.filter(
                (f) =>
                    f.endsWith(".ts") &&
                    f !== "index.ts" &&
                    f !== "example-roles.ts"
            );

            const implemented = tsFiles.length;
            const expected = config.expected;
            const percentage = Math.round((implemented / expected) * 100);

            totalExpected += expected;
            totalImplemented += implemented;

            const status =
                implemented === expected ? "✅" : implemented > 0 ? "🚧" : "📋";
            console.log(
                `${status} ${cardType.padEnd(
                    15
                )} ${implemented}/${expected} (${percentage}%)`
            );
        } catch (error) {
            console.log(`❌ ${cardType.padEnd(15)} Error: ${error.message}`);
        }
    }

    console.log("─".repeat(35));
    const overallPercentage = Math.round(
        (totalImplemented / totalExpected) * 100
    );
    console.log(
        `📈 Overall Progress: ${totalImplemented}/${totalExpected} (${overallPercentage}%)`
    );

    if (overallPercentage < 100) {
        console.log(
            `\n🎯 Next priorities: Implement remaining ${
                totalExpected - totalImplemented
            } cards`
        );
    } else {
        console.log("\n🎉 All Alpha set cards implemented!");
    }
}

checkProgress().catch(console.error);
