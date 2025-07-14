# Getting Started Guide

## Prerequisites

-   **Node.js** (v20 or higher)
-   **npm** or **yarn**
-   **Git**
-   **VS Code** (recommended)

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/CardGameDemo.git
    cd CardGameDemo
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start development server**:

    ```bash
    npm run dev
    ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

## Project Structure

```
CardGameDemo/
├── src/
│   ├── data/           # Game data and card definitions
│   ├── engine/         # Game engine logic
│   ├── game/           # Phaser 3 game scenes
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── docs/               # Documentation
└── package.json        # Dependencies and scripts
```

## Development Workflow

### 1. Understanding the Architecture

The project follows a strict separation of concerns:

-   **React**: UI components, menus, deck builder
-   **Phaser 3**: Game board, animations, visual effects
-   **TypeScript**: Type-safe data definitions
-   **Engine**: Game logic and state management

### 2. Working with Cards

Cards are defined in TypeScript files for type safety:

```typescript
// src/data/cards/sets/alpha/action-cards/fireball.ts
export const fireball: ActionCard = {
    id: "alpha-fireball-action",
    name: "Fireball",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    effects: [
        {
            type: "damage",
            parameters: {
                formula: "caster.INT * 1.5",
                damageType: "fire",
            },
        },
    ],
};
```

### 3. Build System

The build system compiles TypeScript card definitions into JSON:

```bash
# Build all card data
npm run build:cards

# Watch for changes
npm run watch:cards
```

### 4. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- role-system.test.ts
```

## Common Tasks

### Creating a New Card

1. **Create TypeScript file**:

    ```bash
    # Example: new action card
    touch src/data/cards/sets/alpha/action-cards/my-card.ts
    ```

2. **Define the card**:

    ```typescript
    import { ActionCard, CardType, CardRarity } from "@types";

    export const myCard: ActionCard = {
        id: "alpha-my-card-action",
        name: "My Card",
        type: CardType.ACTION,
        rarity: CardRarity.COMMON,
        // ... other properties
    };
    ```

3. **Export in index file**:

    ```typescript
    // src/data/cards/sets/alpha/action-cards/index.ts
    export { myCard } from "./my-card.js";
    ```

4. **Rebuild data**:
    ```bash
    npm run build:cards
    ```

### Adding a New Role

1. **Define the role**:

    ```typescript
    // src/data/cards/sets/alpha/role-cards/my-role.ts
    export const myRole: RoleCard = {
        id: "alpha-my-role-role",
        name: "My Role",
        type: CardType.ROLE,
        tier: 2,
        roleFamily: "warrior",
        statModifiers: {
            STR: 1.4,
            END: 1.2,
        },
    };
    ```

2. **Update advancement trees** in related roles
3. **Test role interactions**

### Implementing a New Effect Type

1. **Define effect interface**:

    ```typescript
    // src/types/index.ts
    interface MyEffectParameters {
        value: number;
        duration?: number;
    }
    ```

2. **Add to effect registry**:

    ```typescript
    // src/engine/effects/index.ts
    export function resolveMyEffect(
        params: MyEffectParameters,
        context: GameContext
    ) {
        // Implementation
    }
    ```

3. **Update effect types**:
    ```typescript
    type EffectType = "damage" | "heal" | "buff" | "myEffect";
    ```

## Code Style

### TypeScript Guidelines

-   Use **strict mode** (`"strict": true`)
-   **No `any` types** - always specify proper types
-   Use **interfaces** for object shapes
-   Use **enums** for constants
-   Document complex types with JSDoc

### Naming Conventions

-   **Files**: `kebab-case.ts`
-   **Variables/Functions**: `camelCase`
-   **Types/Interfaces**: `PascalCase`
-   **Constants**: `UPPER_CASE`
-   **Card IDs**: `"set-card-name-type"` (e.g., "alpha-fireball-action")

### File Organization

```
src/data/cards/sets/alpha/
├── action-cards/
│   ├── index.ts          # Export all action cards
│   ├── fireball.ts       # Individual card definition
│   └── heal.ts
├── role-cards/
│   ├── index.ts
│   └── warrior.ts
└── index.ts              # Export all card types
```

## Testing

### Unit Tests

```typescript
// tests/cards/action-cards.test.ts
import { fireball } from "@data/cards/sets/alpha/action-cards";

describe("Fireball", () => {
    test("has correct properties", () => {
        expect(fireball.name).toBe("Fireball");
        expect(fireball.type).toBe(CardType.ACTION);
    });

    test("effect formula is valid", () => {
        const effect = fireball.effects[0];
        expect(effect.parameters.formula).toBe("caster.INT * 1.5");
    });
});
```

### Integration Tests

```typescript
// tests/integration/game-flow.test.ts
describe("Game Flow", () => {
    test("complete turn cycle", () => {
        const game = createTestGame();

        // Draw phase
        game.executePhase("draw");
        expect(game.currentPlayer.hand.length).toBe(4);

        // Level phase
        game.executePhase("level");
        expect(game.getPlayerSummons()[0].level).toBe(6);

        // Action phase
        game.playCard(fireball);
        expect(game.stack.length).toBe(1);
    });
});
```

## Debugging

### Common Issues

1. **Type Errors**:

    - Check that all required properties are defined
    - Verify imports are correct
    - Ensure types match expected interfaces

2. **Card Not Loading**:

    - Check card is exported in index files
    - Verify card ID is unique
    - Run `npm run build:cards`

3. **Effect Not Working**:
    - Check effect type is registered
    - Verify parameters match interface
    - Test formula syntax

### Debug Tools

-   **VS Code Debugger**: Set breakpoints in TypeScript
-   **Console Logging**: Use `console.log` for game state
-   **Type Checking**: Run `npm run type-check`

## Resources

-   **TypeScript Handbook**: https://www.typescriptlang.org/docs/
-   **Phaser 3 Documentation**: https://phaser.io/phaser3/documentation
-   **React Documentation**: https://react.dev/
-   **Project Documentation**: See `docs/` directory

## Getting Help

1. **Check Documentation**: Look in `docs/` for detailed guides
2. **Review Examples**: Study existing cards for patterns
3. **Run Tests**: Ensure your changes don't break existing functionality
4. **Ask Questions**: Create issues for unclear documentation or bugs

This guide provides the foundation for contributing to the Card Game Demo project. The data-driven architecture makes it easy to add new content while maintaining type safety and code quality.
