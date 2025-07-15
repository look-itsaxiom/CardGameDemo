# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v20 or higher) - [Download](https://nodejs.org)
-   **npm** (comes with Node.js) or **yarn**
-   **Git** - [Download](https://git-scm.com)
-   **VS Code** (recommended) - [Download](https://code.visualstudio.com)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CardGameDemo.git
cd CardGameDemo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Card Database

```bash
npm run build
```

This compiles all TypeScript card definitions into the JSON database used by the game.

## Development Commands

### Start Development Server

```bash
npm run dev
```

Opens the game at `http://localhost:5173` with hot reload enabled.

### Build for Production

```bash
npm run build
```

Creates optimized production build in the `dist` directory.

### Run Tests

```bash
npm run test
```

Executes the test suite including card validation and progress tracking.

### Development (No Analytics)

```bash
npm run dev-nolog
```

Starts development server without analytics logging.

## Project Structure

```
CardGameDemo/
├── src/
│   ├── data/              # Game data and card definitions
│   │   ├── cards/         # Card implementations by set
│   │   ├── generated/     # Auto-generated card database
│   │   └── players/       # Player data and decks
│   ├── engine/            # Game engine logic
│   ├── game/              # Phaser 3 game scenes
│   ├── types/             # TypeScript type definitions
│   └── main.tsx           # Application entry point
├── docs/                  # Documentation
├── public/                # Static assets
├── scripts/               # Build and utility scripts
└── vite/                  # Vite configuration
```

## Key Directories

### `src/data/cards/`

Card definitions organized by set and type:

```
cards/
├── global/                # Global card data
│   ├── species/          # Summon species templates
│   └── player-gen/       # Player-generated cards
└── sets/                 # Set-organized cards
    └── alpha/            # Alpha set cards
        ├── action-cards/
        ├── role-cards/
        ├── equipment/
        └── ...
```

### `src/types/`

Contains the master type definitions in `index.ts`:

-   Core game interfaces
-   Card type definitions
-   Effect system types
-   Game state structures

### `src/engine/`

Game logic and state management:

-   Role family utilities
-   Future: Core game engine implementation

## Development Workflow

### 1. Card Development

When implementing new cards:

1. **Create card file** in appropriate `src/data/cards/sets/{set}/{type}/` directory
2. **Follow naming conventions**: `kebab-case.ts` files, camelCase exports
3. **Use proper TypeScript types** from `src/types/index.ts`
4. **Update index files** to export new cards
5. **Run build** to validate and generate database

### 2. Type System Usage

All card implementations must follow the type system:

```typescript
// Example card implementation
import { ActionCard, CardType, CardRarity } from "../../../types";

export const healingHands: ActionCard = {
    id: "008-healing-hands-Alpha",
    name: "Healing Hands",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    // ... other properties
};
```

### 3. Build Process

The build system:

1. **Compiles TypeScript** card definitions
2. **Validates types** at compile time
3. **Generates JSON database** in `src/data/generated/`
4. **Runs validation tests** to ensure consistency

### 4. Testing

Run tests regularly to ensure:

-   All cards compile successfully
-   Type safety is maintained
-   Play examples work correctly
-   Progress tracking is accurate

## Common Tasks

### Adding a New Card

1. Create new `.ts` file in appropriate directory
2. Implement card following type definitions
3. Add export to directory's `index.ts`
4. Run `npm run build` to validate
5. Test with `npm run test`

### Debugging Build Issues

Common issues and solutions:

-   **Type errors**: Check `src/types/index.ts` for correct interfaces
-   **Missing exports**: Ensure all new cards are exported in index files
-   **Build failures**: Run `npm run build` to see detailed error messages

### Working with Legacy Data

Legacy JSON data in `src/data/legacy-data/` is being migrated to TypeScript. When working with this data:

1. Check if TypeScript equivalent exists
2. Prefer TypeScript implementations
3. Update references when migrating data

## Development Tips

### VS Code Setup

Recommended VS Code extensions:

-   TypeScript and JavaScript Language Features (built-in)
-   ESLint
-   Prettier
-   Auto Rename Tag
-   Bracket Pair Colorizer

### Hot Reload

The development server supports hot reload for:

-   TypeScript files
-   React components
-   Phaser 3 scenes
-   CSS/styling

### Debugging

Use browser developer tools for:

-   Game state inspection
-   Performance profiling
-   Network request monitoring
-   Error logging

## Getting Help

### Documentation

-   **[Game Design](03-game-design.md)** - Rules and mechanics
-   **[Technical Architecture](04-technical-architecture.md)** - Type system and patterns
-   **[Development Guide](05-development-guide.md)** - Implementation standards

### External Resources

-   **[GitHub Repository](https://github.com/your-username/CardGameDemo)** - Source code and issues
-   **[Copilot Instructions](../.github/copilot-instructions.md)** - AI development guidelines
-   **[Project README](../README.md)** - Project overview and status

## Next Steps

Once you have the project running:

1. **Explore the card database** - Review implemented cards in `src/data/cards/`
2. **Study the type system** - Understand interfaces in `src/types/index.ts`
3. **Review game mechanics** - Read the [Game Design](03-game-design.md) documentation
4. **Try implementing a card** - Follow the [Development Guide](05-development-guide.md)

The project is currently in the **Game Engine Core Loop** phase, focusing on implementing the authoritative game engine that will power the tactical card game experience.
