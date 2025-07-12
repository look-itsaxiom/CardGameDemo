# Type System Documentation

## Overview

The Card Game Demo uses a comprehensive TypeScript type system defined in `src/types/index.ts` to ensure type safety across all game components. This system provides the foundation for the data-driven architecture.

## Core Type Categories

### 1. Card Types

All card types implement the base `Card` interface and extend it with specific properties:

```typescript
// Base card interface
interface Card {
    id: string;
    name: string;
    type: CardType;
    rarity: CardRarity;
    description: string;
    set?: string;
    cost?: number;
    attribute?: string;
}

// Specific card types
interface SummonCard extends Card {
    species: string;
    digitalSignature: DigitalSignature;
    baseStats: Stats;
    growthRates: GrowthRates;
    level: number;
    // ...
}

interface ActionCard extends Card {
    effects: Effect[];
    requirements: Requirement[];
    targets: TargetingRule[];
    speed: SpeedLevel;
    // ...
}
```

### 2. Game State Types

```typescript
interface GameState {
    players: Player[];
    board: Board;
    currentPlayer: PlayerId;
    phase: GamePhase;
    stack: StackItem[];
    // ...
}

interface Player {
    id: PlayerId;
    hand: Card[];
    mainDeck: Card[];
    advanceDeck: Card[];
    // ...
}
```

### 3. Effect System Types

```typescript
interface Effect {
    id: string;
    type: EffectType;
    parameters: EffectParameters;
    triggers: TriggerCondition[];
    requirements: Requirement[];
    // ...
}

interface TriggerCondition {
    event: TriggerEvent;
    source?: string;
    target?: string;
    timing: TriggerTiming;
    // ...
}
```

## Type Safety Benefits

### 1. Compile-Time Validation

-   Card definitions are validated at compile time
-   Missing required properties cause TypeScript errors
-   Type mismatches are caught before runtime

### 2. IntelliSense Support

-   Full autocomplete for all card properties
-   Property documentation via JSDoc comments
-   Error highlighting for invalid configurations

### 3. Refactoring Safety

-   Changes to interfaces propagate throughout codebase
-   Renaming properties updates all references
-   Unused types are identified automatically

## Implementation Patterns

### 1. Discriminated Unions

```typescript
type Card = SummonCard | ActionCard | EquipmentCard | BuildingCard | QuestCard;

// Type narrowing
function processCard(card: Card) {
    switch (card.type) {
        case CardType.SUMMON:
            // TypeScript knows this is a SummonCard
            return processSummon(card);
        case CardType.ACTION:
            // TypeScript knows this is an ActionCard
            return processAction(card);
        // ...
    }
}
```

### 2. Generic Constraints

```typescript
interface Effect<T extends EffectParameters = EffectParameters> {
    type: EffectType;
    parameters: T;
}

interface DamageEffect extends Effect<DamageEffectParameters> {
    type: "damage";
    parameters: {
        formula: string;
        damageType: DamageType;
        canCrit: boolean;
    };
}
```

### 3. Mapped Types

```typescript
type Stats = {
    STR: number;
    END: number;
    DEF: number;
    INT: number;
    SPI: number;
    MDF: number;
    SPD: number;
    ACC: number;
    LCK: number;
};

type StatModifiers = {
    [K in keyof Stats]?: number;
};
```

## Best Practices

### 1. Always Define Types

```typescript
// ❌ Don't use any
function processCard(card: any) { ... }

// ✅ Use specific types
function processCard(card: Card) { ... }
```

### 2. Use Type Guards

```typescript
function isSummonCard(card: Card): card is SummonCard {
    return card.type === CardType.SUMMON;
}

// Usage
if (isSummonCard(card)) {
    // TypeScript knows card is SummonCard
    console.log(card.species);
}
```

### 3. Leverage Union Types

```typescript
type GamePhase = "draw" | "level" | "action" | "end";
type SpeedLevel = "action" | "reaction" | "counter";
```

## Future Considerations

### 1. Runtime Type Validation

While TypeScript provides compile-time safety, consider adding runtime validation for:

-   JSON data loaded from external sources
-   User input validation
-   Network communication

### 2. Type Generation

-   Generate types from JSON schemas
-   Auto-generate documentation from types
-   Create type-safe API contracts

### 3. Advanced Type Features

-   Conditional types for complex effect systems
-   Template literal types for dynamic card IDs
-   Utility types for common transformations

## Migration Guide

When updating the type system:

1. **Backward Compatibility**: Use optional properties for new fields
2. **Migration Scripts**: Create utilities to transform old data
3. **Deprecation Warnings**: Mark old types as deprecated
4. **Documentation**: Update examples and guides

## Testing Types

```typescript
// Type-only tests
type TestSummonCard = SummonCard; // Ensures type compiles
type TestEffect = Effect<DamageEffectParameters>; // Ensures generic works

// Runtime tests
describe("Type Guards", () => {
    test("isSummonCard identifies summon cards", () => {
        const card: Card = createSummonCard();
        expect(isSummonCard(card)).toBe(true);
    });
});
```

This type system provides the foundation for a robust, maintainable, and extensible card game engine.
