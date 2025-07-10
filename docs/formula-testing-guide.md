# Formula System & Testing Guide

This guide defines the standardized formula system for damage, healing, and stat calculations, plus testing strategies for validating complex card interactions.

## Formula System

### Syntax Rules

All formulas are data-driven strings that the engine interprets at runtime. This enables designers to create new effects without code changes.

**Variable Access:**

-   `caster.STAT` - Access caster's current stat (e.g., `caster.STR`, `caster.INT`)
-   `target.STAT` - Access target's current stat
-   `base_power` - Effect's base power value
-   `weapon_power` - Equipped weapon's power (for weapon attacks)
-   `level` - Unit's current level
-   `maxHP` - Unit's maximum HP

**Mathematical Operations:**

-   Basic: `+`, `-`, `*`, `/`, `%` (modulo)
-   Functions: `Floor()`, `Ceil()`, `Round()`, `Min()`, `Max()`
-   Parentheses for order of operations

**Example Formulas:**

```
// Basic weapon damage
"caster.STR * (1 + weapon_power / 100) * (caster.STR / target.DEF)"

// Healing based on spirit
"caster.SPI * (1 + base_power / 100)"

// Percentage-based damage
"target.maxHP * 0.25"

// Complex stat interaction
"Floor((caster.INT + caster.SPI) * 1.5) + base_power"

// Critical hit calculation
"Floor((caster.LCK * 0.3375) + 1.65)"
```

### Formula Categories

**Damage Formulas:**

-   Physical: Usually STR-based with DEF comparison
-   Magical: Usually INT-based with MDF comparison
-   True: Ignores defensive stats
-   Percentage: Based on target's current or max HP

**Healing Formulas:**

-   Spirit-based: Scale with caster's SPI stat
-   Fixed: Use only base_power
-   Percentage: Based on target's max HP

**Stat Modification:**

-   Temporary: Apply for duration, then remove
-   Permanent: Persist until end of game
-   Scaling: Based on other stats or level

**Hit Chance Formulas:**

-   Standard: `base_accuracy + (caster.ACC / 10)`
-   Enhanced: Include additional factors like luck or range
-   Guaranteed: Always hit (100% accuracy)

### Formula Validation

**Syntax Validation:**

-   All variables must be valid (caster.STAT, target.STAT, etc.)
-   Mathematical expressions must be well-formed
-   Function calls must use correct syntax
-   Parentheses must be balanced

**Logic Validation:**

-   Division by zero protection
-   Negative value handling for stats like HP
-   Integer vs. float handling for discrete values
-   Range bounds for percentage-based effects

**Performance Validation:**

-   Complex formulas should execute within performance budgets
-   Recursive or circular references must be prevented
-   Memory usage should be predictable and bounded

## Testing Framework

### Unit Testing Strategy

**Formula Testing:**

```typescript
describe("Formula System", () => {
    test("basic damage formula", () => {
        const caster = createMockSummon({ STR: 20 });
        const target = createMockSummon({ DEF: 15 });
        const formula =
            "caster.STR * (1 + 30 / 100) * (caster.STR / target.DEF)";

        const result = evaluateFormula(formula, {
            caster,
            target,
            base_power: 30,
        });
        expect(result).toBe(Math.floor(20 * 1.3 * (20 / 15)));
    });

    test("healing with critical multiplier", () => {
        const caster = createMockSummon({ SPI: 15, LCK: 22 });
        const formula = "caster.SPI * (1 + 40 / 100)";

        const baseHeal = evaluateFormula(formula, { caster, base_power: 40 });
        const critHeal = baseHeal * 1.5;

        expect(baseHeal).toBe(21);
        expect(critHeal).toBe(31.5);
    });
});
```

**Effect Testing:**

```typescript
describe("Card Effects", () => {
    test("Sharpened Blade increases weapon power", async () => {
        const gameState = createTestGameState();
        const warrior = createWarriorWithSword();
        const sharpenedBlade = createSharpenedBladeCard();

        const initialPower = warrior.equipment.weapon.basePower;

        await playCard(gameState, sharpenedBlade, {
            target: warrior.equipment.weapon,
        });

        expect(warrior.equipment.weapon.basePower).toBe(initialPower + 10);
    });

    test("Dark Altar destroys units after delay", async () => {
        const gameState = createTestGameState();
        const darkAltar = createDarkAltarCard();

        await playBuilding(gameState, darkAltar, positions);
        await advanceTurns(gameState, 2); // Should trigger destruction

        expect(gameState.board.buildings).not.toContain(darkAltar);
        // Test unit destruction, VP awards, advancement opportunities
    });
});
```

### Integration Testing

**Turn Sequence Testing:**
Reproduce the complete play example to validate all interactions work correctly:

```typescript
describe("Play Example Integration", () => {
    test("complete game sequence", async () => {
        const gameState = createPlayExampleGameState();

        // Turn 1 - Player A
        await executeTurn(gameState, "playerA", [
            { action: "summon", card: "gignen-warrior", position: [5, 2] },
            {
                action: "play",
                card: "sharpened-blade",
                target: "warrior-weapon",
            },
            { action: "move", unit: "gignen-warrior", position: [5, 4] },
        ]);

        // Validate state after turn 1
        expect(gameState.players.playerA.victoryPoints).toBe(0);
        expect(getUnitAt(gameState, [5, 4]).card.name).toBe("Gignen Warrior");

        // Continue through all turns...
        // Turn 2 - Player B
        // ...
        // Turn 10 - Player B wins

        expect(gameState.players.playerB.victoryPoints).toBe(3);
        expect(gameState.winner).toBe("playerB");
    });
});
```

**Stack Resolution Testing:**
Test complex trigger/response chains:

```typescript
describe("Stack Resolution", () => {
    test("counter card interrupts action", async () => {
        const gameState = createTestGameState();

        // Player A plays action
        const actionPromise = playCard(gameState, blasBolt, { target: enemy });

        // Player B responds with counter
        await playCounter(gameState, dramaticReturn, {
            trigger: "summon-destroyed",
        });

        // Verify resolution order and final state
        expect(gameState.stack.length).toBe(2);
        await resolveStack(gameState);

        // Validate final outcomes
    });
});
```

### Performance Testing

**Effect Resolution Performance:**

```typescript
describe("Performance", () => {
    test("large stack resolution under time limit", async () => {
        const gameState = createLargeStackScenario(); // 50+ effects

        const startTime = performance.now();
        await resolveStack(gameState);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100); // 100ms limit
    });

    test("ongoing effects dont accumulate memory leaks", () => {
        const gameState = createTestGameState();

        // Add many ongoing effects
        for (let i = 0; i < 100; i++) {
            addOngoingEffect(gameState, createTestEffect());
        }

        const initialMemory = getMemoryUsage();

        // Clean up expired effects
        cleanupExpiredEffects(gameState);

        const finalMemory = getMemoryUsage();
        expect(finalMemory).toBeLessThanOrEqual(initialMemory);
    });
});
```

### Edge Case Testing

**Boundary Conditions:**

-   Stats at minimum/maximum values
-   Empty hands, decks, or piles
-   Units at level 1 or level 20
-   Board positions at edges or corners
-   Victory condition triggers

**Error Conditions:**

-   Invalid targets for effects
-   Requirements not met for card play
-   Insufficient resources for actions
-   Conflicting ongoing effects
-   Malformed card data

**Race Conditions:**

-   Simultaneous victory conditions
-   Multiple triggers at the same time
-   Effect resolution order dependencies
-   Priority passing edge cases

## Test Data Management

### Mock Data Creation

**Standardized Test Entities:**

```typescript
const createTestSummon = (overrides = {}) => ({
    id: "test-summon",
    speciesId: "gignen",
    level: 5,
    stats: {
        STR: 15,
        END: 12,
        DEF: 10,
        INT: 10,
        SPI: 10,
        MDF: 8,
        SPD: 12,
        LCK: 15,
        ACC: 10,
    },
    ...overrides,
});

const createTestGameState = () => ({
    phase: GamePhase.ACTION,
    currentPlayer: "playerA",
    stack: [],
    board: createEmptyBoard(),
    players: {
        playerA: createTestPlayer(),
        playerB: createTestPlayer(),
    },
});
```

**Scenario Builders:**

```typescript
const createPlayExampleScenario = () => {
    const gameState = createTestGameState();

    // Set up exact state from play example
    setupPlayerADeck(gameState);
    setupPlayerBDeck(gameState);

    return gameState;
};

const createStackTestScenario = () => {
    // Set up complex stack with multiple speed levels
    const gameState = createTestGameState();

    addToStack(gameState, createActionEffect());
    addToStack(gameState, createReactionEffect());
    addToStack(gameState, createCounterEffect());

    return gameState;
};
```

### Test Validation

**Automated Validation:**

-   All test scenarios must validate against the type system
-   Mock data must conform to the same interfaces as real data
-   Test results must be deterministic and repeatable
-   Performance benchmarks must be met consistently

**Manual Validation:**

-   Visual inspection of complex scenarios
-   Playtesting of implemented mechanics
-   Designer review of effect interactions
-   User experience validation of timing and flow

This testing framework ensures that card implementations are robust, performant, and maintainable as the game evolves.
