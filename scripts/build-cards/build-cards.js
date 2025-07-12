#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PROJECT_ROOT = join(__dirname, "..", "..");
const CARDS_INPUT = join(PROJECT_ROOT, "src", "data", "cards");
const OUTPUT_DIR = join(PROJECT_ROOT, "src", "data", "generated");
const OUTPUT_FILE = join(OUTPUT_DIR, "card-database.json");

/**
 * Build the card database by importing the TypeScript index file
 * and serializing it to JSON
 */
async function buildCardDatabase() {
    try {
        console.log("🔨 Building card database...");

        // Ensure output directory exists
        if (!existsSync(OUTPUT_DIR)) {
            await mkdir(OUTPUT_DIR, { recursive: true });
        }

        // Import the card database from TypeScript
        // Convert Windows path to file URL for ESM imports
        const indexPath = join(CARDS_INPUT, "index.js");
        const indexURL = pathToFileURL(indexPath).href;

        console.log(`📥 Importing from: ${indexURL}`);

        const { cardDatabase } = await import(indexURL);

        // Serialize to JSON with formatting
        const jsonOutput = JSON.stringify(cardDatabase, null, 2);

        // Write to output file
        await writeFile(OUTPUT_FILE, jsonOutput, "utf-8");

        console.log("✅ Card database built successfully!");
        console.log(`📁 Output: ${OUTPUT_FILE}`);
        console.log(`📊 Total cards: ${cardDatabase.metadata.totalCards}`);

        return true;
    } catch (error) {
        console.error("❌ Failed to build card database:", error);
        return false;
    }
}

/**
 * Watch mode - rebuild when files change
 */
async function watchMode() {
    const chokidar = await import("chokidar");

    console.log("👀 Watching for changes in card files...");

    const watcher = chokidar.watch([join(CARDS_INPUT, "**", "*.ts")], {
        ignored: /node_modules/,
        persistent: true,
    });

    watcher.on("change", (path) => {
        console.log(`📝 File changed: ${path}`);
        buildCardDatabase();
    });

    watcher.on("add", (path) => {
        console.log(`➕ File added: ${path}`);
        buildCardDatabase();
    });

    watcher.on("unlink", (path) => {
        console.log(`➖ File removed: ${path}`);
        buildCardDatabase();
    });

    // Initial build
    await buildCardDatabase();
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const watchFlag = args.includes("--watch") || args.includes("-w");

    if (watchFlag) {
        await watchMode();
    } else {
        const success = await buildCardDatabase();
        process.exit(success ? 0 : 1);
    }
}

main().catch(console.error);
