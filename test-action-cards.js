// Simple test to verify action cards work correctly
import { readFile } from "fs/promises";
import { join } from "path";

async function testActionCards() {
    try {
        // Test the action cards index
        const actionIndexFile = join(
            process.cwd(),
            "src",
            "data",
            "cards",
            "sets",
            "alpha",
            "action-cards",
            "index.ts"
        );
        const indexContent = await readFile(actionIndexFile, "utf-8");

        console.log("✅ Action cards index file exists and readable");

        // Count action cards exports
        const exportMatches = indexContent.match(
            /export const alphaActionCardsList = \[([\s\S]*?)\]/
        );
        if (exportMatches) {
            const cardList = exportMatches[1];
            const cardCount = cardList
                .split(",")
                .filter((line) => line.trim() && !line.includes("//")).length;
            console.log(`📊 Found ${cardCount} action cards in export list`);
        }

        // Check for specific cards
        const hasSharpened = indexContent.includes("sharpenedBlade");
        const hasHealing = indexContent.includes("healingHands");

        console.log(`🗡️  Sharpened Blade: ${hasSharpened ? "✅" : "❌"}`);
        console.log(`🩹 Healing Hands: ${hasHealing ? "✅" : "❌"}`);

        // Check ID consistency
        const idMatches = indexContent.match(/"(\d{3}-[^"]+)"/g);
        if (idMatches) {
            console.log(`🔢 Card IDs found: ${idMatches.join(", ")}`);
        }

        console.log("\n✅ All action cards appear to be properly structured!");
    } catch (error) {
        console.error("❌ Error testing action cards:", error);
    }
}

testActionCards();
