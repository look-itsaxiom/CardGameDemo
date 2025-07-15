# Development Guide

## Overview

This guide provides comprehensive technical standards and workflows for developing the Card Game Demo. It covers implementation patterns, coding standards, testing approaches, and best practices for maintaining code quality and extensibility.

## Implementation Standards

### TypeScript Requirements

**Type Safety:**

-   Zero `any` types throughout the codebase
-   Comprehensive type definitions for all game entities
-   Strict null checking enabled
-   Exhaustive switch statements for enums

**Code Quality:**

-   All functions must have return type annotations
-   Interface definitions for all object structures
-   Proper error handling with typed error objects
-   Documentation comments for public APIs

### File Organization

#### Directory Structure

```
src/data/cards/sets/{set}/{type}/
├── action-cards/         # Action card implementations
├── role-cards/          # Role card definitions
├── equipment/           # Equipment subdivided by type
│   ├── weapon-cards/
│   ├── armor-cards/
│   ├── offhand-cards/
│   └── accessory-cards/
├── building-cards/      # Building card implementations
├── counter-cards/       # Counter card definitions
├── quest-cards/         # Quest card implementations
├── advance-cards/       # Role advancement cards
└── unique-cards/        # Named summons and special cards
```

#### Naming Conventions

**Files:**

-   `kebab-case.ts` for all TypeScript files
-   Descriptive names matching card names
-   Example: `sharpened-blade.ts`, `healing-hands.ts`

**Exports:**

-   `camelCase` for TypeScript exports
-   Example: `export const sharpenedBlade: ActionCard`

**Card IDs:**

-   Format: `{set card #}-{name}-{set}`
-   Example: `001-sharpened-blade-Alpha`
-   Unique cards: `{set card #}-{spawning card #}-'i'-{name}`

### Card Implementation Patterns

#### Basic Card Structure

```typescript
import { ActionCard, CardType, CardRarity, SpeedLevel } from "../../../types";

export const exampleCard: ActionCard = {
    id: "001-example-card-Alpha",
    name: "Example Card",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description: "An example action card implementation.",
    set: "Alpha",
    cost: 2,
    speed: SpeedLevel.ACTION,
    effects: [
        {
            id: "example-effect-1",
            type: EffectType.DAMAGE,
            parameters: {
                amount: 10,
                damageType: DamageType.PHYSICAL,
            },
            triggers: [
                {
                    event: TriggerEvent.ON_PLAY,
                    timing: TriggerTiming.IMMEDIATE,
                },
            ],
            requirements: [
                {
                    type: RequirementType.ROLE,
                    target: "warrior",
                },
            ],
            targets: [
                {
                    type: TargetType.ENEMY_SUMMON,
                    count: 1,
                    optional: false,
                },
            ],
            timing: EffectTiming.IMMEDIATE,
            description: "Deal 10 physical damage to target enemy summon.",
        },
    ],
    requirements: [
        {
            type: RequirementType.ROLE,
            target: "warrior",
        },
    ],
    targets: [
        {
            type: TargetType.ENEMY_SUMMON,
            count: 1,
            optional: false,
        },
    ],
    destinationPile: DestinationPile.RECHARGE,
};
```

#### Effect Implementation

**Standard Effect Structure:**

```typescript
const healingEffect: Effect = {
    id: "healing-hands-heal",
    type: EffectType.HEAL,
    parameters: {
        basePower: 40,
        formula: "caster.SPI * (1 + basePower / 100)",
        canCrit: true,
        critMultiplier: 1.5,
    },
    triggers: [
        {
            event: TriggerEvent.ON_PLAY,
            timing: TriggerTiming.IMMEDIATE,
        },
    ],
    requirements: [
        {
            type: RequirementType.ROLE,
            target: "magician",
        },
    ],
    targets: [
        {
            type: TargetType.FRIENDLY_SUMMON,
            count: 1,
            optional: false,
        },
    ],
    timing: EffectTiming.IMMEDIATE,
    description: "Heal target friendly summon based on caster's SPI.",
};
```

#### Complex Card Examples

**Multi-Effect Cards:**

```typescript
export const dualShot: ActionCard = {
    id: "019-dual-shot-Alpha",
    name: "Dual Shot",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Target Scout based Summon can make two basic attacks this turn.",
    set: "Alpha",
    speed: SpeedLevel.ACTION,
    effects: [
        {
            id: "dual-shot-effect",
            type: EffectType.MODIFY_ATTACKS,
            parameters: {
                additionalAttacks: 1,
                duration: "until_end_of_turn",
            },
            triggers: [
                {
                    event: TriggerEvent.ON_PLAY,
                    timing: TriggerTiming.IMMEDIATE,
                },
            ],
            requirements: [
                {
                    type: RequirementType.ROLE,
                    target: "scout",
                },
            ],
            targets: [
                {
                    type: TargetType.FRIENDLY_SUMMON,
                    count: 1,
                    optional: false,
                    filter: {
                        roleFamily: RoleFamily.SCOUT,
                    },
                },
            ],
            timing: EffectTiming.IMMEDIATE,
            description: "Grant target scout an additional attack this turn.",
        },
    ],
    requirements: [
        {
            type: RequirementType.ROLE,
            target: "scout",
        },
    ],
    targets: [
        {
            type: TargetType.FRIENDLY_SUMMON,
            count: 1,
            optional: false,
            filter: {
                roleFamily: RoleFamily.SCOUT,
            },
        },
    ],
    destinationPile: DestinationPile.RECHARGE,
};
```

## Build System Integration

### Index File Management

Each directory must maintain an `index.ts` file that exports all cards:

```typescript
// src/data/cards/sets/alpha/action-cards/index.ts
export { sharpenedBlade } from "./sharpened-blade";
export { healingHands } from "./healing-hands";
export { blastBolt } from "./blast-bolt";
export { rush } from "./rush";
export { drainTouch } from "./drain-touch";
export { lifeAlchemy } from "./life-alchemy";
export { ensnare } from "./ensnare";
export { dualShot } from "./dual-shot";
export { spellRecall } from "./spell-recall";
export { adventurousSpirit } from "./adventurous-spirit";
```

### Build Process

**Compilation Flow:**

1. TypeScript compilation validates all card definitions
2. Build script aggregates all exported cards
3. JSON database generation with type validation
4. Output to `src/data/generated/card-database.json`

**Validation Steps:**

-   Type checking for all card properties
-   ID uniqueness validation
-   Required field presence
-   Effect parameter validation
-   Reference integrity checking

## Testing Standards

### Card Implementation Testing

```typescript
describe("Card Implementation: Healing Hands", () => {
    it("should have correct basic properties", () => {
        expect(healingHands.id).toBe("008-healing-hands-Alpha");
        expect(healingHands.type).toBe(CardType.ACTION);
        expect(healingHands.rarity).toBe(CardRarity.COMMON);
    });

    it("should have valid effect structure", () => {
        const effect = healingHands.effects[0];
        expect(effect.type).toBe(EffectType.HEAL);
        expect(effect.parameters).toBeDefined();
        expect(effect.targets).toHaveLength(1);
    });

    it("should have proper requirements", () => {
        const requirement = healingHands.requirements[0];
        expect(requirement.type).toBe(RequirementType.ROLE);
        expect(requirement.target).toBe("magician");
    });
});
```

### Build Validation Testing

```typescript
describe("Build System Validation", () => {
    it("should compile all cards without errors", () => {
        const buildResult = runBuildProcess();
        expect(buildResult.success).toBe(true);
        expect(buildResult.errors).toHaveLength(0);
    });

    it("should validate card database integrity", () => {
        const database = loadCardDatabase();
        const validationResult = validateDatabase(database);
        expect(validationResult.isValid).toBe(true);
    });
});
```

### Progress Tracking

```typescript
// Automated progress tracking
const validatePlayExample = () => {
    const mentionedCards = extractCardsFromPlayExample();
    const implementedCards = loadImplementedCards();

    const coverage = mentionedCards.map((cardName) => {
        const implemented = implementedCards.find(
            (card) => card.name.toLowerCase() === cardName.toLowerCase()
        );
        return {
            name: cardName,
            implemented: !!implemented,
            id: implemented?.id || null,
        };
    });

    return {
        total: mentionedCards.length,
        implemented: coverage.filter((c) => c.implemented).length,
        coverage: coverage,
    };
};
```

## Common Implementation Patterns

### Role-Based Requirements

```typescript
// Standard role requirement
const warriorRequirement: Requirement = {
    type: RequirementType.ROLE,
    target: "warrior",
};

// Role family requirement
const scoutFamilyRequirement: Requirement = {
    type: RequirementType.ROLE_FAMILY,
    target: RoleFamily.SCOUT,
};

// Tier requirement
const tier2Requirement: Requirement = {
    type: RequirementType.ROLE_TIER,
    target: 2,
};
```

### Targeting Patterns

```typescript
// Single target
const singleTarget: TargetingRule = {
    type: TargetType.ENEMY_SUMMON,
    count: 1,
    optional: false,
};

// Multiple targets
const multipleTargets: TargetingRule = {
    type: TargetType.FRIENDLY_SUMMON,
    count: 3,
    optional: true,
};

// Filtered targets
const filteredTarget: TargetingRule = {
    type: TargetType.SUMMON,
    count: 1,
    optional: false,
    filter: {
        roleFamily: RoleFamily.MAGICIAN,
        minLevel: 5,
    },
};
```

### Effect Timing

```typescript
// Immediate effect
const immediateEffect: Effect = {
    // ... other properties
    timing: EffectTiming.IMMEDIATE,
    triggers: [
        {
            event: TriggerEvent.ON_PLAY,
            timing: TriggerTiming.IMMEDIATE,
        },
    ],
};

// Delayed effect
const delayedEffect: Effect = {
    // ... other properties
    timing: EffectTiming.DELAYED,
    triggers: [
        {
            event: TriggerEvent.TURN_END,
            timing: TriggerTiming.END_OF_TURN,
        },
    ],
};
```

## Error Handling

### Type-Safe Error Objects

```typescript
interface CardImplementationError {
    cardId: string;
    errorType: "VALIDATION" | "COMPILATION" | "REFERENCE";
    message: string;
    details?: any;
}

const handleImplementationError = (error: CardImplementationError) => {
    console.error(`Card ${error.cardId}: ${error.message}`);
    if (error.details) {
        console.error("Details:", error.details);
    }
};
```

### Validation Utilities

```typescript
const validateCard = (card: Card): ValidationResult => {
    const errors: string[] = [];

    if (!card.id) errors.push("Card ID is required");
    if (!card.name) errors.push("Card name is required");
    if (!card.type) errors.push("Card type is required");

    return {
        isValid: errors.length === 0,
        errors,
    };
};
```

## Performance Guidelines

### Memory Management

```typescript
// Prefer immutable updates
const updateCard = (card: Card, updates: Partial<Card>): Card => {
    return { ...card, ...updates };
};

// Use proper cleanup
useEffect(() => {
    const subscription = subscribeToGameState(handleStateChange);
    return () => subscription.unsubscribe();
}, []);
```

### Efficient Data Structures

```typescript
// Use Maps for fast lookups
const cardLookup = new Map<string, Card>();
cards.forEach((card) => cardLookup.set(card.id, card));

// Prefer Set for unique collections
const uniqueCardIds = new Set(cards.map((card) => card.id));
```

## Documentation Standards

### Code Comments

```typescript
/**
 * Processes a healing effect on a target summon.
 * @param effect - The healing effect to process
 * @param caster - The summon casting the heal
 * @param target - The summon receiving the heal
 * @returns The amount healed after all calculations
 */
const processHealingEffect = (
    effect: Effect,
    caster: SummonUnit,
    target: SummonUnit
): number => {
    // Implementation
};
```

### Card Documentation

```typescript
export const healingHands: ActionCard = {
    id: "008-healing-hands-Alpha",
    name: "Healing Hands",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Target friendly Summon heals HP equal to caster's SPI × 1.4. Can critical heal.",
    // ... implementation
};
```

## Git Workflow

### Branch Strategy

-   `main` - Production-ready code
-   `develop` - Integration branch
-   `feature/*` - Individual feature branches
-   `hotfix/*` - Critical bug fixes

### Commit Messages

```
feat: implement Healing Hands action card
fix: correct damage calculation formula
docs: update card implementation guide
test: add validation for card database
```

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Run full build validation
4. Create PR with detailed description
5. Code review and approval
6. Merge to `develop`

This development guide ensures consistency, quality, and maintainability across the entire codebase while supporting the project's data-driven architecture and extensibility goals.
