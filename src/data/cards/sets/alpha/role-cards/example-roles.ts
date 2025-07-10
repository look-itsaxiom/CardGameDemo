import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Example Role Cards showing the role family hierarchy system
 *
 * This demonstrates how roles can be organized into families that can be
 * dynamically queried instead of maintaining hardcoded lists in every card.
 */

// Tier 1 Base Role
export const warrior: RoleCard = {
    id: "alpha-warrior-role",
    name: "Warrior",
    type: CardType.ROLE,
    rarity: CardRarity.COMMON,
    description: "A sturdy frontline fighter specializing in melee combat.",

    tier: 1,
    roleFamily: "warrior", // This IS the warrior family root
    // baseRole is undefined for tier 1 roles

    statModifiers: {
        STR: 1.2, // 20% bonus to strength
        DEF: 1.1, // 10% bonus to defense
        END: 1.1, // 10% bonus to endurance
    },

    advancements: [
        { toRole: "alpha-berserker-role" },
        { toRole: "alpha-knight-role" },
    ],
};

// Tier 2 Advancement - Berserker Path
export const berserker: RoleCard = {
    id: "alpha-berserker-role",
    name: "Berserker",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A fierce warrior who trades defense for overwhelming offense.",

    tier: 2,
    roleFamily: "warrior", // Part of warrior family
    baseRole: "alpha-warrior-role", // Stems from warrior

    statModifiers: {
        STR: 1.5, // 50% bonus to strength
        SPD: 1.2, // 20% bonus to speed
        DEF: 0.8, // 20% penalty to defense
    },

    advancements: [
        { toRole: "alpha-warlord-role" }, // Tier 3 advancement
    ],
    advancementSources: ["alpha-warrior-role"],
};

// Tier 2 Advancement - Knight Path
export const knight: RoleCard = {
    id: "alpha-knight-role",
    name: "Knight",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description: "A noble warrior who balances offense and defense.",

    tier: 2,
    roleFamily: "warrior", // Part of warrior family
    baseRole: "alpha-warrior-role", // Stems from warrior

    statModifiers: {
        STR: 1.3, // 30% bonus to strength
        DEF: 1.3, // 30% bonus to defense
        SPI: 1.1, // 10% bonus to spirit
    },

    advancements: [
        { toRole: "alpha-paladin-role" }, // Tier 3 advancement
    ],
    advancementSources: ["alpha-warrior-role"],
};

// Tier 3 Advancement - Paladin Path
export const paladin: RoleCard = {
    id: "alpha-paladin-role",
    name: "Paladin",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description: "A holy warrior blessed with divine power.",

    tier: 3,
    roleFamily: "warrior", // Still part of warrior family
    baseRole: "alpha-warrior-role", // Ultimate root is still warrior

    statModifiers: {
        STR: 1.4, // 40% bonus to strength
        DEF: 1.4, // 40% bonus to defense
        SPI: 1.3, // 30% bonus to spirit
        MDF: 1.2, // 20% bonus to magic defense
    },

    // No further advancements (Tier 3 terminal)
    advancementSources: ["alpha-knight-role"],
};

// Example of a different family
export const scout: RoleCard = {
    id: "alpha-scout-role",
    name: "Scout",
    type: CardType.ROLE,
    rarity: CardRarity.COMMON,
    description: "A swift and agile combatant who excels at ranged attacks.",

    tier: 1,
    roleFamily: "scout", // Different family entirely

    statModifiers: {
        SPD: 1.3, // 30% bonus to speed
        ACC: 1.2, // 20% bonus to accuracy
        LCK: 1.1, // 10% bonus to luck
    },

    advancements: [
        { toRole: "alpha-ranger-role" },
        { toRole: "alpha-assassin-role" },
    ],
};
