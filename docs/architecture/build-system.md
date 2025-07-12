# Build System Documentation

## Overview

The card build system uses TypeScript files for type-safe card definitions that are compiled into a master JSON database for runtime use. This approach provides the benefits of both static typing and data-driven architecture.

## Architecture

### TypeScript Source Files

Each card is defined as a TypeScript file that exports a typed object:

```typescript
// sets/alpha/action-cards/sharpened-blade.ts
import {
    ActionCard,
    CardType,
    CardRarity,
    SpeedLevel,
} from "../../../../types/index.js";

export const sharpenedBlade: ActionCard = {
    id: "alpha-sharpened_blade-action",
    name: "Sharpened Blade",
    type: CardType.ACTION,
    // ... rest of card definition
};
```

### Index Export Layers

Each directory contains an index file that re-exports all cards:

```typescript
// sets/alpha/action-cards/index.ts
export { sharpenedBlade } from "./sharpened-blade.js";
export { blastBolt } from "./blast-bolt.js";
// ... other action cards

// sets/alpha/index.ts
export * as actionCards from "./action-cards/index.js";
export * as weaponCards from "./weapon-cards/index.js";
export * as roleCards from "./role-cards/index.js";
// ... other card types

// sets/index.ts
export * as alpha from "./alpha/index.js";
// export * as beta from './beta/index.js'; // future sets
```

### Master Database Generation

A build script compiles all cards into a master JSON database:

```typescript
// scripts/build-cards.ts
import * as sets from "../src/data/cards/sets/index.js";
import * as global from "../src/data/cards/global/index.js";

const masterDb = {
    sets: sets,
    global: global,
    metadata: {
        buildTime: new Date().toISOString(),
        version: process.env.npm_package_version,
    },
};

// Write to dist/cards.json
```

## Benefits

### Development Time

-   **Type Safety**: Native TypeScript validation prevents schema errors
-   **IDE Support**: Full autocomplete, refactoring, and error detection
-   **Import Validation**: Broken references caught at compile time
-   **Refactoring Safety**: Changes automatically update all references

### Runtime

-   **Single JSON File**: All cards available in one importable database
-   **Performance**: No TypeScript compilation overhead in production
-   **Size Optimization**: Only include needed sets/cards in builds
-   **Caching**: JSON can be cached, versioned, and CDN distributed

### Maintenance

-   **Clear Organization**: Each card in its own file with proper categorization
-   **Set Management**: Easy to add/remove entire sets
-   **Version Control**: Individual card changes are easy to track
-   **Testing**: Each card can be unit tested independently

## Build Script Implementation

### Basic Build Script

```typescript
#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import * as allCards from "../src/data/cards/index.js";

async function buildCards() {
    const outputPath = "./dist/cards.json";

    // Serialize all exported cards
    const database = JSON.stringify(allCards, null, 2);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write database file
    await fs.writeFile(outputPath, database);

    console.log(`✅ Card database built: ${outputPath}`);
    console.log(`📊 Total size: ${Buffer.byteLength(database)} bytes`);
}

buildCards().catch(console.error);
```

### Advanced Build Features

#### Selective Compilation

```typescript
// Build only specific sets
const alphaOnly = {
    sets: { alpha: allCards.sets.alpha },
    global: allCards.global,
};
```

#### Validation During Build

```typescript
function validateCardDatabase(cards: any) {
    const errors: string[] = [];

    // Validate all card IDs are unique
    const allIds = new Set();
    for (const [setName, set] of Object.entries(cards.sets)) {
        for (const [cardType, cardList] of Object.entries(set)) {
            // Validation logic...
        }
    }

    if (errors.length > 0) {
        throw new Error(`Card validation failed:\n${errors.join("\n")}`);
    }
}
```

#### Multiple Output Formats

```typescript
// Generate different formats for different consumers
await fs.writeFile("./dist/cards.json", JSON.stringify(allCards, null, 2));
await fs.writeFile("./dist/cards.min.json", JSON.stringify(allCards));
await fs.writeFile(
    "./dist/cards.js",
    `export default ${JSON.stringify(allCards)};`
);
```

## Package.json Integration

```json
{
    "scripts": {
        "build:cards": "tsx scripts/build-cards.ts",
        "build": "npm run build:cards && vite build",
        "dev": "npm run build:cards && vite dev",
        "watch:cards": "tsx scripts/build-cards.ts --watch"
    }
}
```

## VS Code Integration

### Tasks Configuration

```json
// .vscode/tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build Cards Database",
            "type": "shell",
            "command": "npm",
            "args": ["run", "build:cards"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always"
            }
        }
    ]
}
```

### File Watching

```json
// .vscode/settings.json
{
    "files.watcherExclude": {
        "**/dist/cards.json": true
    }
}
```

## Error Handling

### Common Build Errors

1. **Missing Exports**: Card files not exported in index files
2. **Type Errors**: Card objects don't match TypeScript interfaces
3. **Circular Dependencies**: Import cycles between card files
4. **Duplicate IDs**: Multiple cards with same ID across sets

### Debug Strategies

```typescript
// Add debugging to build script
console.log("Building cards from:", Object.keys(allCards.sets));
for (const [setName, set] of Object.entries(allCards.sets)) {
    console.log(`  ${setName}:`, Object.keys(set));
}
```

## Future Enhancements

### Hot Reloading

Monitor TypeScript files and rebuild database automatically during development.

### Card Analytics

Generate reports on card distribution, balance metrics, and usage patterns.

### Export Optimization

Tree-shake unused cards for smaller production bundles.

### Schema Validation

Runtime validation that generated JSON matches expected schemas.

This build system provides a robust foundation for maintaining type-safe, data-driven card definitions that scale with the project's complexity.
