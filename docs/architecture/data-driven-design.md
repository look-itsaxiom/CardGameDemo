# Data-Driven Design Philosophy

## Overview

The Card Game Demo is built on the principle that game content and rules should be defined as data, not hardcoded logic. This approach enables rapid iteration, easy expansion, and maintainable code.

## Core Principles

### 1. Content as Data

All game content is defined in structured data formats:

```typescript
// Card definitions
const fireball: ActionCard = {
    id: "alpha-fireball-action",
    name: "Fireball",
    type: CardType.ACTION,
    effects: [
        {
            type: "damage",
            parameters: {
                formula: "caster.INT * (1 + base_power / 100)",
                damageType: "fire",
                baseAccuracy: 90,
            },
        },
    ],
};

// NOT hardcoded logic
function castFireball(caster: Unit, target: Unit) {
    const damage = caster.INT * 1.6; // ❌ Hardcoded
    target.takeDamage(damage);
}
```

### 2. Engine as Interpreter

The game engine interprets data structures rather than executing card-specific code:

```typescript
// Engine interprets effect data
function resolveEffect(effect: Effect, context: GameContext) {
    switch (effect.type) {
        case "damage":
            return resolveDamageEffect(effect.parameters, context);
        case "heal":
            return resolveHealEffect(effect.parameters, context);
        case "buff":
            return resolveBuffEffect(effect.parameters, context);
        // Engine handles any effect type through data
    }
}
```

### 3. Separation of Concerns

-   **Data Layer**: Card definitions, rules, formulas
-   **Logic Layer**: Game engine, state management
-   **Presentation Layer**: UI components, animations

## Benefits

### 1. Rapid Iteration

```typescript
// Change damage formula by editing data
const sharpenedBlade = {
    // ...
    effects: [
        {
            type: "damage",
            parameters: {
                formula: "caster.STR * 1.5", // Was 1.3, now 1.5
                // No code changes needed!
            },
        },
    ],
};
```

### 2. Designer Empowerment

Non-programmers can create content by editing JSON/TypeScript data:

```json
{
    "name": "Lightning Bolt",
    "type": "action",
    "effects": [
        {
            "type": "damage",
            "parameters": {
                "formula": "caster.INT * 2.0",
                "damageType": "lightning",
                "canCrit": true
            }
        }
    ]
}
```

### 3. Automated Testing

Data-driven design enables comprehensive testing:

```typescript
// Test all cards systematically
describe("All Action Cards", () => {
    actionCards.forEach((card) => {
        test(`${card.name} has valid effects`, () => {
            expect(validateEffects(card.effects)).toBe(true);
        });
    });
});
```

### 4. Extensibility

New mechanics can be added without breaking existing content:

```typescript
// Add new effect type
interface CharmEffect extends Effect {
    type: "charm";
    parameters: {
        duration: number;
        controlType: "full" | "partial";
    };
}

// Engine automatically handles it
function resolveCharmEffect(
    params: CharmEffectParameters,
    context: GameContext
) {
    // Implementation
}
```

## Implementation Patterns

### 1. Formula System

All calculations use data-driven formulas:

```typescript
interface FormulaEffect {
    formula: string; // "caster.STR * (1 + base_power / 100)"
    baseAccuracy?: number;
    basePower?: number;
    canCrit?: boolean;
}

// Formula interpreter
function evaluateFormula(formula: string, context: FormulaContext): number {
    return formulaEngine.evaluate(formula, context);
}
```

### 2. Requirement System

All card requirements are data-driven:

```typescript
interface Requirement {
    type: RequirementType;
    parameters: RequirementParameters;
}

const sharpenedBlade: ActionCard = {
    // ...
    requirements: [
        {
            type: "roleFamily",
            parameters: { family: "warrior" },
        },
        {
            type: "targetInRange",
            parameters: { range: 1 },
        },
    ],
};
```

### 3. Effect Composition

Complex effects are built from simple components:

```typescript
const healAndBuff: Effect[] = [
    {
        type: "heal",
        parameters: { formula: "caster.SPI * 1.2" },
    },
    {
        type: "buff",
        parameters: {
            stat: "DEF",
            modifier: 1.15,
            duration: 3,
        },
    },
];
```

## Architecture Patterns

### 1. Registry Pattern

```typescript
class EffectRegistry {
    private effects = new Map<string, EffectHandler>();

    register(type: string, handler: EffectHandler) {
        this.effects.set(type, handler);
    }

    resolve(effect: Effect, context: GameContext) {
        const handler = this.effects.get(effect.type);
        return handler?.execute(effect.parameters, context);
    }
}
```

### 2. Strategy Pattern

```typescript
interface TargetingStrategy {
    findTargets(rule: TargetingRule, context: GameContext): Target[];
}

class SingleTargetStrategy implements TargetingStrategy {
    findTargets(rule: TargetingRule, context: GameContext) {
        // Implementation
    }
}
```

### 3. Command Pattern

```typescript
interface GameAction {
    type: string;
    parameters: any;
    execute(state: GameState): GameState;
}

class PlayCardAction implements GameAction {
    execute(state: GameState) {
        // Data-driven card play logic
    }
}
```

## Data Validation

### 1. Schema Validation

```typescript
import Ajv from "ajv";

const cardSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { enum: ["summon", "action", "equipment"] },
        effects: {
            type: "array",
            items: { $ref: "#/definitions/effect" },
        },
    },
    required: ["id", "name", "type"],
};

const ajv = new Ajv();
const validate = ajv.compile(cardSchema);
```

### 2. Type Guards

```typescript
function isValidEffect(effect: any): effect is Effect {
    return (
        typeof effect.type === "string" && typeof effect.parameters === "object"
    );
}
```

## Testing Strategy

### 1. Data Integrity Tests

```typescript
describe("Card Data Integrity", () => {
    test("All cards have unique IDs", () => {
        const ids = allCards.map((card) => card.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    test("All effect types are implemented", () => {
        const usedTypes = getAllEffectTypes(allCards);
        usedTypes.forEach((type) => {
            expect(effectRegistry.has(type)).toBe(true);
        });
    });
});
```

### 2. Formula Validation Tests

```typescript
describe("Formula System", () => {
    test("All formulas are syntactically valid", () => {
        const formulas = extractAllFormulas(allCards);
        formulas.forEach((formula) => {
            expect(() => parseFormula(formula)).not.toThrow();
        });
    });
});
```

## Best Practices

### 1. Design for Data

```typescript
// ❌ Hardcoded logic
if (card.name === "Fireball") {
    return dealFireDamage(target);
}

// ✅ Data-driven
const effect = card.effects.find((e) => e.type === "damage");
if (effect) {
    return resolveDamageEffect(effect, context);
}
```

### 2. Validate Early

```typescript
// Validate data at load time
export function loadCards(): Card[] {
    const cards = importCardData();
    return cards.filter(validateCard);
}
```

### 3. Document Data Structures

```typescript
/**
 * Damage effect parameters
 * @example
 * {
 *   formula: "caster.INT * 1.5",
 *   damageType: "fire",
 *   baseAccuracy: 90,
 *   canCrit: true
 * }
 */
interface DamageEffectParameters {
    formula: string;
    damageType?: string;
    baseAccuracy?: number;
    canCrit?: boolean;
}
```

## Migration Strategy

When expanding the data-driven system:

1. **Identify Hardcoded Logic**: Find areas where game rules are hardcoded
2. **Extract to Data**: Move rules to data structures
3. **Create Interpreters**: Build engine components to handle new data
4. **Validate**: Ensure existing functionality still works
5. **Document**: Update documentation and examples

This approach ensures the game remains maintainable and extensible as it grows in complexity.
