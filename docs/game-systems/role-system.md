# Role System - Complete Documentation

The role system is the core progression mechanic in the card game, providing strategic depth through a three-tier advancement system across multiple families. Each role provides stat bonuses, special abilities, and advancement paths that shape gameplay.

## Overview

The role system consists of **13 roles** organized into **3 families**, each with distinct playstyles and advancement trees:

-   **Warrior Family**: Physical combat specialists focused on strength and defense
-   **Scout Family**: Speed and precision specialists with high mobility
-   **Magician Family**: Magical practitioners with spell-based abilities

### Tier Structure

-   **Tier 1**: Base roles - foundation of each family (3 roles)
-   **Tier 2**: Specializations - advanced versions with focused abilities (7 roles)
-   **Tier 3**: Masters - elite roles with unique effects (3 roles)

## Role Families

### Warrior Family

The warrior family focuses on direct combat, high durability, and battlefield control.

#### Tier 1: Warrior

-   **ID**: `020-warrior-Alpha`
-   **Rarity**: Common
-   **Stats**: +25% STR, +25% END
-   **Description**: A fierce warrior who excels in close combat, wielding powerful weapons and armor to dominate the battlefield
-   **Advances To**: Berserker, Knight

#### Tier 2: Specializations

**Berserker** (`023-berserker-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +60% STR, +35% END, +25% SPD
-   **Description**: A frenzied warrior who channels their rage into devastating attacks, becoming a whirlwind of destruction on the battlefield
-   **Advances To**: Sentinel

**Knight** (`024-knight-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +35% STR, +50% END, +35% DEF
-   **Description**: A stalwart defender clad in heavy armor to protect allies and vanquish foes
-   **Advances To**: Paladin, Sentinel

#### Tier 3: Masters

**Paladin** (`031-paladin-Alpha`)

-   **Rarity**: Rare
-   **Attribute**: Light
-   **Stats**: +5% STR, +50% END, +55% DEF, +25% INT, **+100% SPI**, +75% MDF, +10% LCK
-   **Description**: A light magic wielding warrior who excels in both physical and magical defense, using their holy powers to protect and heal allies
-   **Unique Effect**: Gains "Healing Touch" action card on play and during level phase
-   **Advancement Sources**: Knight + Light Mage
-   **Role Family**: Warrior (hybrid warrior/magician)

**Sentinel** (`030-sentinel-Alpha`)

-   **Rarity**: Rare
-   **Attribute**: Earth
-   **Stats**: +35% STR, **+110% END**, +85% DEF, +25% MDF, **-30% SPD**
-   **Description**: A vigilant guardian who stands watch over their allies, ready to intercept threats and shield them from harm
-   **Unique Effect**: Passive aura giving +15% DEF to allies within 4 spaces
-   **Advancement Sources**: Knight + Berserker
-   **Role Family**: Warrior

### Scout Family

The scout family focuses on speed, precision, and mobility-based tactics.

#### Tier 1: Scout

-   **ID**: `022-scout-Alpha`
-   **Rarity**: Common
-   **Stats**: +25% SPD, +25% LCK
-   **Description**: A nimble scout who excels in reconnaissance and agility, using their speed and ranged attacks to outmaneuver opponents
-   **Advances To**: Rogue, Explorer

#### Tier 2: Specializations (Terminal in Alpha)

**Rogue** (`028-rogue-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +35% SPD, +50% LCK, +35% ACC
-   **Description**: A cunning rogue who excels in subterfuge and precision strikes, using high risk, high reward tactics to outmaneuver opponents
-   **Advancement Sources**: Scout
-   **Terminal Role**: No Tier 3 advancement in Alpha set

**Explorer** (`029-explorer-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +10% END, +60% SPD, +50% LCK
-   **Description**: A daring explorer who ventures into the unknown, using their wits and agility to navigate treacherous terrain and adapt to new environments
-   **Advancement Sources**: Scout
-   **Terminal Role**: No Tier 3 advancement in Alpha set

### Magician Family

The magician family focuses on magical abilities, spell casting, and elemental manipulation.

#### Tier 1: Magician

-   **ID**: `021-magician-Alpha`
-   **Rarity**: Common
-   **Stats**: +25% INT, +25% SPI
-   **Description**: A developing magic user learning to control the elements and cast powerful spells, using their intellect and creativity to overcome challenges
-   **Advances To**: Element Mage, Light Mage, Dark Mage

#### Tier 2: Specializations

**Element Mage** (`025-element_mage-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +60% INT, +10% MDF, +25% SPD
-   **Description**: A conduit of elemental magic, wielding the forces of fire, water, earth, and wind to devastate their foes
-   **Advancement Sources**: Magician
-   **Terminal Role**: No Tier 3 advancement in Alpha set

**Light Mage** (`027-light_mage-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +25% INT, +60% SPI, +25% MDF, +10% LCK
-   **Description**: An enlightened magic wielder, harnessing the power of the element of light to heal allies and smite foes
-   **Advancement Sources**: Magician
-   **Advances To**: Paladin

**Dark Mage** (`026-dark_mage-Alpha`)

-   **Rarity**: Uncommon
-   **Stats**: +60% INT, +10% MDF, +25% ACC
-   **Description**: A practitioner of shadow magic, manipulating the dark element to confound, confuse, control, and consume
-   **Advancement Sources**: Magician
-   **Advances To**: Warlock

#### Tier 3: Masters

**Warlock** (`032-warlock-Alpha`)

-   **Rarity**: Rare
-   **Attribute**: Dark
-   **Stats**: **+110% INT**, +35% MDF, +75% ACC, **-30% LCK**
-   **Description**: A master of dark magic who wields forbidden powers to curse enemies and cast devastating spells
-   **Unique Effect**: Gains "Nightmare Pain" counter card on play and draw phase (if not already in hand/play)
-   **Advancement Sources**: Dark Mage
-   **Role Family**: Magician

## Complete Advancement Trees

This section shows the full role progression system, including roles not yet implemented in the Alpha set.

### Warrior Family Tree

```
Warrior (Tier 1)
├── Knight (Tier 2)
│   ├── Sentinel (Tier 3) ✅ Alpha
│   ├── Paladin (Tier 3) ✅ Alpha
│   └── Dread Knight (Tier 3) 📋 Planned
├── Berserker (Tier 2)
│   ├── Warlord (Tier 3) 📋 Planned
│   ├── Battle Dancer (Tier 3) 📋 Planned
│   └── Spellblade (Tier 3) 📋 Planned
```

**Convergence Points:**

-   **Sentinel**: Knight + Berserker paths
-   **Paladin**: Knight + Light Mage paths
-   **Dread Knight**: Knight + Dark Mage paths
-   **Spellblade**: Berserker + Element Mage paths
-   **Battle Dancer**: Berserker + Rogue paths

### Magician Family Tree

```
Magician (Tier 1)
├── Element Mage (Tier 2)
│   └── Sorcerer (Tier 3) 📋 Planned
├── Light Mage (Tier 2)
│   └── Sage (Tier 3) 📋 Planned
├── Dark Mage (Tier 2)
│   ├── Warlock (Tier 3) ✅ Alpha
│   ├── Dread Knight (Tier 3) 📋 Planned
│   └── Shadowblade (Tier 3) 📋 Planned
```

**Convergence Points:**

-   **Dread Knight**: Dark Mage + Knight paths
-   **Shadowblade**: Dark Mage + Rogue paths
-   **Spellblade**: Element Mage + Berserker paths

### Scout Family Tree

```
Scout (Tier 1)
├── Rogue (Tier 2)
│   ├── Assassin (Tier 3) 📋 Planned
│   ├── Battle Dancer (Tier 3) 📋 Planned
│   └── Shadowblade (Tier 3) 📋 Planned
├── Explorer (Tier 2)
│   ├── Ranger (Tier 3) 📋 Planned
│   └── Trailblazer (Tier 3) 📋 Planned
```

**Convergence Points:**

-   **Battle Dancer**: Rogue + Berserker paths
-   **Shadowblade**: Rogue + Dark Mage paths

### Multi-Family Tier 3 Roles

Some Tier 3 roles can be reached through multiple family paths, creating strategic decision points:

#### Dread Knight (Warrior/Magician Hybrid)

-   **Paths**: Knight (Warrior) + Dark Mage (Magician)
-   **Theme**: Dark warrior combining martial prowess with shadow magic
-   **Attribute**: Dark
-   **Estimated Stats**: High STR, END, DEF, INT, low SPI, MDF penalties

#### Battle Dancer (Warrior/Scout Hybrid)

-   **Paths**: Berserker (Warrior) + Rogue (Scout)
-   **Theme**: Fluid combat specialist with deadly grace
-   **Attribute**: Wind
-   **Estimated Stats**: High STR, SPD, LCK, moderate END, extreme ACC

#### Shadowblade (Magician/Scout Hybrid)

-   **Paths**: Dark Mage (Magician) + Rogue (Scout)
-   **Theme**: Stealth assassin with shadow magic
-   **Attribute**: Dark
-   **Estimated Stats**: High INT, SPD, ACC, moderate STR, low END/DEF

#### Spellblade (Warrior/Magician Hybrid)

-   **Paths**: Berserker (Warrior) + Element Mage (Magician)
-   **Theme**: Weapon master who channels elemental magic
-   **Attribute**: Variable (based on element)
-   **Estimated Stats**: High STR, INT, moderate END, SPD

### Alpha Set Implementation Status

**✅ Implemented (3/13 total roles)**:

-   Paladin (Warrior → Knight → Light Mage convergence)
-   Sentinel (Warrior → Knight/Berserker convergence)
-   Warlock (Magician → Dark Mage)

**📋 Planned for Future Sets (10 additional roles)**:

-   Dread Knight, Warlord, Battle Dancer, Spellblade (Warrior family)
-   Sorcerer, Sage, Shadowblade (Magician family)
-   Assassin, Ranger, Trailblazer (Scout family)

### Design Philosophy

The advancement system creates strategic depth through:

1. **Multi-Path Convergence**: Some Tier 3 roles accessible through different family combinations
2. **Hybrid Identities**: Cross-family roles blend mechanics from multiple families
3. **Specialization vs. Versatility**: Pure family paths vs. hybrid convergence paths
4. **Attribute Diversity**: Each Tier 3 role has unique attribute associations
5. **Unique Effects**: Every Tier 3 role will have distinctive abilities and card access

This system enables players to pursue the same ultimate role through different strategic paths, creating replay value and diverse deck building approaches.

## Technical Implementation

### Role Family System

The role system uses dynamic `roleFamily` properties instead of hardcoded lists:

```typescript
// Card requirements can query families dynamically
requirements: {
    controlsRoleFamily: "warrior"; // Matches any warrior family role
}

// Instead of hardcoded lists:
roleTypes: ["warrior", "berserker", "knight", "paladin", "sentinel"];
```

### Advancement Mechanics

Roles track both advancement paths and sources:

```typescript
export const knight: RoleCard = {
    // ...other properties
    advancements: [
        { toRole: "031-paladin-Alpha" },
        { toRole: "030-sentinel-Alpha" },
    ],
    advancementSources: ["020-warrior-Alpha"],
};
```

### Tier 3 Unique Effects

Master roles have special effects that trigger during gameplay:

-   **Paladin**: `addUniqueCardToHand` - Healing Touch every turn
-   **Sentinel**: `passiveBuffAura` - +15% DEF to nearby allies
-   **Warlock**: `addUniqueCardToHand` - Nightmare Pain auto-return

## Design Benefits

### Scalability

-   New roles can be added to existing families without breaking card requirements
-   Role families support dynamic queries for flexible card design
-   Clear upgrade paths enable gradual power progression

### Strategic Depth

-   Multiple paths to Tier 3 roles (Paladin via Knight OR Light Mage)
-   Some specializations are terminal (encouraging diverse strategies)
-   Stat trade-offs create meaningful choices (Sentinel speed penalty)

### Unique Identity

-   Each family has distinct statistical focuses and playstyles
-   Tier 3 roles feel significantly different from lower tiers
-   Special effects make advancement feel impactful beyond just stat increases

## Role Family System Benefits

### The Problem with Hardcoded Role Lists

Before the role family system, every "warrior-based" card needed manual updates:

```typescript
// Sharpened Blade
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// Warrior's Charge
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// Battle Cry
roleTypes: ["warrior", "berserker", "knight", "paladin"];

// ...and 20+ more warrior-based cards
```

**Adding a new role like "Warlord"** = Update 23+ cards manually 😱

### The Solution: Dynamic Role Families

With the role family system, cards reference the family:

```typescript
// Sharpened Blade
roleFamily: "warrior";

// Warrior's Charge
roleFamily: "warrior";

// Battle Cry
roleFamily: "warrior";

// ...and 20+ more warrior-based cards
```

**Adding "Warlord"** = Define one role with `roleFamily: "warrior"` ✅

### Example: Adding New Warrior Advancement

```typescript
// New Tier 2 advancement from Warrior
export const warlord: RoleCard = {
    id: "beta-warlord-role",
    name: "Warlord",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description: "A tactical commander who leads from the front.",

    tier: 2,
    roleFamily: "warrior", // ← This one line makes it work with ALL warrior-based cards
    baseRole: "020-warrior-Alpha",

    statModifiers: {
        STR: 1.4,
        END: 1.3,
        SPI: 1.2, // Leadership bonus
    },

    advancements: [
        { toRole: "beta-champion-role" }, // Tier 3 path
    ],
};
```

**Result**: Warlord now works with:

-   Sharpened Blade ✅
-   All existing warrior-based cards ✅
-   All future warrior-based cards ✅

**Zero cards need updating!** 🎉

### Engine Benefits

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

## Future Expansion

The Alpha set establishes the foundation with 3 of 13 planned Tier 3 roles. Future sets will add:

-   **Beta Set**: Target completion of all 13 Tier 3 roles from the advancement trees
-   **Hybrid Specializations**: Multi-family convergence roles like Dread Knight and Battle Dancer
-   **New Specializations**: Additional Tier 2 roles expanding each family
-   **Set-Specific Requirements**: Advanced roles requiring specific quest completion or achievements
-   **Elemental Variations**: Attribute-based role variants (Fire Knight, Ice Mage, etc.)

See the **Complete Advancement Trees** section above for the full planned role system.
