# Role Family System - Scalability Example

## The Problem (Old Approach)

With hardcoded role lists, every "warrior-based" card needed manual updates:

```typescript
// Sharpened Blade
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// Warrior's Charge
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// Battle Cry
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// ...and 20 more warrior-based cards
```

**Adding a new role like "Warlord"** = Update 23+ cards manually 😱

## The Solution (Role Family System)

With dynamic role families, cards reference the family:

```typescript
// Sharpened Blade
roleFamily: "warrior";

// Warrior's Charge
roleFamily: "warrior";

// Battle Cry
roleFamily: "warrior";

// ...and 20 more warrior-based cards
```

**Adding "Warlord"** = Define one role with `roleFamily: "warrior"` ✅

## Example: Adding New Warrior Advancement

```typescript
// New Tier 2 advancement from Warrior
export const warlord: RoleCard = {
    id: "alpha-warlord-role",
    name: "Warlord",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description: "A tactical commander who leads from the front.",

    tier: 2,
    roleFamily: "warrior", // ← This one line makes it work with ALL warrior-based cards
    baseRole: "alpha-warrior-role",

    statModifiers: {
        STR: 1.4,
        END: 1.3,
        SPI: 1.2, // Leadership bonus
    },

    advancements: [
        { toRole: "alpha-champion-role" }, // Tier 3 path
    ],
};
```

**Result**: Warlord now works with:

-   Sharpened Blade ✅
-   All existing warrior-based cards ✅
-   All future warrior-based cards ✅

**Zero cards need updating!** 🎉

## Engine Benefits

The game engine can now query role relationships dynamically:

```typescript
// Instead of hardcoded checks:
if (role === "warrior" || role === "berserker" || role === "knight"...)

// Engine uses:
if (isRoleInFamily(role, "warrior"))
```

This makes the entire system:

-   **Scalable**: Add infinite role variations without touching existing cards
-   **Maintainable**: One place to define role relationships
-   **Data-driven**: Role families are data, not hardcoded logic
-   **Error-proof**: No more forgetting to update card lists
