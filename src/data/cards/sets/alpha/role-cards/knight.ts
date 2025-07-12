import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Knight - Role Card (Alpha Set #024)
 *
 * Tier: 2 (Advancement Role)
 * Family: Warrior
 * Base Role: Warrior
 * Stat Modifiers: +35% STR, +50% END, +35% DEF
 * Advancements: Paladin, Sentinel
 * Rarity: Uncommon
 * Description: Defensive warrior specializing in protection and durability
 */
export const knight: RoleCard = {
    // Core card identity
    id: "024-knight-Alpha",
    name: "Knight",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A stalwart defender clad in heavy armor to protect allies and vanquish foes.",

    // Role-specific properties
    tier: 2,
    roleFamily: "warrior",
    baseRole: "020-warrior-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        STR: 1.35, // +35% strength
        END: 1.5, // +50% endurance (tanky)
        DEF: 1.35, // +35% defense
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "031-paladin-Alpha" }, // Holy path
        { toRole: "030-sentinel-Alpha" }, // Guardian path
    ],

    // Roles that can advance to this role
    advancementSources: ["020-warrior-Alpha"],
};

export default knight;
