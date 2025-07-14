# Card Implementation Guide

This guide provides technical specifications and best practices for implementing card data using the established type system in `src/types/index.ts`.

## Implementation Strategy

### Phase 1: Core Cards from Play Example

Implement all cards referenced in the detailed play example to validate the type system against real mechanics:

**Priority Order:**

1. **Species Definitions** - Foundation for all summon generation
2. **Basic Role Cards** - Tier 1 roles (Warrior, Magician, Scout)
3. **Equipment Cards** - Weapons, offhand, armor, accessories
4. **Action Cards** - Core gameplay mechanics (Sharpened Blade, Blast Bolt, Healing Hands, etc.)
5. **Building Cards** - Complex ongoing effects (Dark Altar, Gignen Country)
6. **Quest Cards** - Objective-based mechanics (Nearwood Forest Expedition)
7. **Advance Cards** - Role progression and Named Summons
8. **Counter/Reaction Cards** - Stack interaction mechanics

### Phase 2: Validation & Testing

-   Create test decks matching the play example
-   Validate all card interactions work as expected
-   Test edge cases and complex effect combinations

## Technical Implementation Standards

### File Organization

```
src/data/cards/
├── global/                    # Global files not tied to specific sets
│   ├── player-gen/           # Player-generated summon cards and related data
│   └── species/              # Species templates for summon generation
└── sets/                     # Set-organized card content
    ├── alpha/                # Alpha set cards
    │   ├── accessory-cards/  # Accessory equipment (.ts files)
    │   ├── action-cards/     # Action cards (.ts files)
    │   ├── advance-cards/    # Role advancement cards (.ts files)
    │   ├── armor-cards/      # Armor equipment (.ts files)
    │   ├── building-cards/   # Building cards (.ts files)
    │   ├── counter-cards/    # Counter cards (.ts files)
    │   ├── offhand-cards/    # Offhand equipment (.ts files)
    │   ├── quest-cards/      # Quest cards (.ts files)
    │   ├── role-cards/       # Role cards (.ts files)
    │   ├── unique-action-cards/ # Named Summon abilities (.ts files)
    │   └── weapon-cards/     # Weapon equipment (.ts files)
    └── beta/                 # Future set (same structure)
        └── ...
```

### Naming Conventions

-   **File names:** `kebab-case.ts` (e.g., `sharpened-blade.ts`)
-   **Card IDs:** Use format `{set card #}-{name}-{set}` (e.g., `001-sharpened-blade-Alpha`)
-   **Unique Card IDs:** Cards that are created dynamically from card effects should use the format `{set card #}-{spawning card #}-'i'-{name}`
-   **Species IDs:** Simple lowercase (e.g., `gignen`, `fae`, `stoneheart`)
-   **Unique card IDs:** Use UUID v4 format for generated summons
-   **Set organization:** Each set has its own directory with card type subdirectories
-   **Export naming:** Use camelCase for TypeScript exports (e.g., `sharpenedBlade`)

### Build Process Integration

-   **Individual .ts files:** Each card is a separate TypeScript file exporting a typed object
-   **Index layers:** Each directory has an `index.ts` that re-exports all cards
-   **Build script:** Compiles all TypeScript exports into master JSON database
-   **Type validation:** Native TypeScript checking ensures schema compliance at build time

## Effect System Implementation

### Trigger System

All card effects use the standardized trigger system:

```typescript
// Example: "When this card is played"
trigger: {
    type: TriggerType.ON_PLAY,
    sourceType: TriggerSourceType.SELF,
    timing: TriggerTiming.IMMEDIATE
}

// Example: "When an opponent's summon enters play"
trigger: {
    type: TriggerType.SUMMON_ENTERS_PLAY,
    sourceType: TriggerSourceType.OPPONENT,
    timing: TriggerTiming.IMMEDIATE
}
```

### Targeting System

Use the Target interface for all effect targeting:

```typescript
// Example: Target friendly summon
target: {
    type: TargetType.SUMMON,
    restriction: TargetRestriction.FRIENDLY,
    count: { min: 1, max: 1 },
    conditions: [
        {
            type: ConditionType.HAS_ROLE,
            value: "warrior"
        }
    ]
}
```

### Effect Parameters

All effect-specific data goes in the `parameters` object:

```typescript
// Example: Healing effect
effect: {
    type: EffectType.HEAL,
    parameters: {
        formula: "caster.SPI * (1 + base_power / 100)",
        basePower: 40,
        canCrit: true,
        critMultiplier: 1.5
    }
}
```

## Data-Driven Requirements

### Calculation Formulas

All damage, healing, and stat calculations must be data-driven strings that the engine can interpret:

```typescript
// Valid formula examples:
"caster.STR * (1 + base_power / 100) * (caster.STR / target.DEF)";
"target.maxHP * 0.25";
"caster.INT + caster.SPI";
```

### Condition System

Use standardized conditions for all requirements and targeting:

```typescript
requirements: [
    {
        type: RequirementType.PHASE,
        value: GamePhase.ACTION,
    },
    {
        type: RequirementType.CONTROL_SUMMON,
        condition: {
            type: ConditionType.HAS_ROLE,
            value: "warrior",
        },
    },
];
```

## Card-Specific Implementation Notes

### Summon Cards (Unique)

-   Must include `digitalSignature` with complete provenance
-   Stats generated from species template + growth rates
-   Equipment slots always start empty (filled during deck building)

```typescript
const uniqueSummon: SummonCard = {
    id: "uuid-generated",
    type: CardType.SUMMON,
    name: "Gignen Warrior",
    speciesId: "gignen",
    rarity: CardRarity.COMMON,
    digitalSignature: {
        uniqueId: "uuid-generated",
        openedBy: "player-id",
        timestamp: Date.now(),
        signature: "crypto-signature",
    },
    baseStats: {
        /* generated from species */
    },
    growthRates: {
        /* rolled from probability tables */
    },
    traits: [], // Species-based traits
    level: 5, // Always start at level 5
};
```

### Role Cards

-   Define stat modifiers, not flat bonuses
-   Include tier information and advancement paths
-   Specify any special abilities or effects

```typescript
const warrior: RoleCard = {
    id: "alpha-warrior-role",
    type: CardType.ROLE,
    name: "Warrior",
    tier: 1,
    statModifiers: {
        STR: 1.2,
        DEF: 1.1,
        END: 1.1,
    },
    advancementPaths: ["berserker", "knight", "paladin"],
    effects: [], // Role-specific passive effects
};
```

### Equipment Cards

-   Specify equipment slot type
-   Include stat bonuses and special effects
-   Define any usage restrictions

```typescript
const heirloomSword: EquipmentCard = {
    id: "alpha-heirloom_sword-equipment",
    type: CardType.EQUIPMENT,
    name: "Heirloom Sword",
    equipmentType: EquipmentType.WEAPON,
    rarity: CardRarity.COMMON,
    statBonuses: {
        STR: 5,
    },
    weaponStats: {
        basePower: 30,
        range: 1,
        attackType: AttackType.PHYSICAL,
        damageFormula: "STR * (1 + weapon_power / 100) * (STR / target.DEF)",
    },
    effects: [],
};
```

### Action Cards

-   Define speed level (usually ACTION)
-   Include requirements, targeting, and effects
-   Specify where card goes after resolution (Recharge vs Discard)

```typescript
const sharpenedBlade: ActionCard = {
    id: "alpha-sharpened_blade-action",
    type: CardType.ACTION,
    name: "Sharpened Blade",
    speed: SpeedLevel.ACTION,
    rarity: CardRarity.COMMON,
    requirements: [
        {
            type: RequirementType.CONTROL_SUMMON,
            condition: {
                type: ConditionType.HAS_ROLE,
                value: "warrior",
            },
        },
    ],
    effects: [
        {
            trigger: {
                type: TriggerType.ON_PLAY,
                sourceType: TriggerSourceType.SELF,
                timing: TriggerTiming.IMMEDIATE,
            },
            target: {
                type: TargetType.EQUIPMENT,
                restriction: TargetRestriction.FRIENDLY,
                count: { min: 1, max: 1 },
                conditions: [
                    {
                        type: ConditionType.EQUIPMENT_TYPE,
                        value: EquipmentType.WEAPON,
                    },
                    {
                        type: ConditionType.EQUIPPED_TO_ROLE,
                        value: "warrior",
                    },
                ],
            },
            effect: {
                type: EffectType.MODIFY_STAT,
                parameters: {
                    stat: "basePower",
                    modifier: 10,
                    duration: "permanent",
                },
            },
        },
    ],
    resolutionDestination: PileType.RECHARGE,
};
```

### Building Cards

-   Include spatial requirements (dimensions, placement rules)
-   Define ongoing effects and destruction conditions
-   Specify interaction with units in occupied spaces

### Quest Cards

-   Define clear objective conditions
-   Include reward effects and failure conditions
-   Specify completion timing and triggers

### Ongoing & Delayed Effects

For persistent effects, use the OngoingEffect and DelayedEffect interfaces:

```typescript
// Example: Gignen Country building effect
const gignenCountryEffect: OngoingEffect = {
    id: "gignen-country-boost",
    sourceCardId: "alpha-gignen_country-building",
    trigger: {
        type: TriggerType.SUMMON_LEVELS_UP,
        sourceType: TriggerSourceType.FRIENDLY,
        timing: TriggerTiming.IMMEDIATE,
    },
    condition: {
        type: ConditionType.AND,
        conditions: [
            {
                type: ConditionType.HAS_SPECIES,
                value: "gignen",
            },
            {
                type: ConditionType.IN_POSITIONS,
                value: ["4,1", "5,1", "6,1", "4,2", "5,2", "6,2"],
            },
        ],
    },
    effect: {
        type: EffectType.LEVEL_UP,
        parameters: {
            levels: 1,
        },
    },
};
```

## Validation Checklist

Before submitting card implementations, verify:

-   [ ] All TypeScript interfaces are properly implemented
-   [ ] No `any` types used anywhere
-   [ ] All references (speciesId, roleId, etc.) point to actual entities
-   [ ] Effect triggers and targets are properly defined
-   [ ] Formulas are data-driven strings, not hardcoded logic
-   [ ] Card interactions match the play example behavior
-   [ ] Files are organized according to the established structure
-   [ ] Naming conventions are followed consistently

## Testing Strategy

### Unit Testing

Each card should have tests verifying:

-   Proper type compliance
-   Effect resolution under various conditions
-   Edge cases and error conditions
-   Integration with related cards

### Integration Testing

Test complete card interactions:

-   Full turn sequences from the play example
-   Complex effect chains and stack resolution
-   Board state changes and persistence
-   Victory condition triggers

### Performance Testing

Monitor for:

-   Effect resolution performance with large stacks
-   Memory usage with many ongoing effects
-   State serialization/deserialization speed
