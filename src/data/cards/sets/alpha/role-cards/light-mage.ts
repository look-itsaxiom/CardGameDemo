import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Light Mage - Role Card (Alpha Set #027)
 *
 * Tier: 2 (Advancement Role)
 * Family: Magician
 * Base Role: Magician
 * Stat Modifiers: +25% INT, +60% SPI, +25% MDF, +10% LCK
 * Advancements: Paladin
 * Rarity: Uncommon
 * Description: Light magic specialist focused on healing and support magic
 */
export const lightMage: RoleCard = {
    // Core card identity
    id: "027-light_mage-Alpha",
    name: "Light Mage",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "An enlightened magic wielder, harnessing the power of the element of light to heal allies and smite foes.",

    // Role-specific properties
    tier: 2,
    roleFamily: "magician",
    baseRole: "021-magician-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        INT: 1.25, // +25% intelligence
        SPI: 1.6, // +60% spirit (healing focus)
        MDF: 1.25, // +25% magic defense
        LCK: 1.1, // +10% luck
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "031-paladin-Alpha" }, // Can become Paladin
    ],

    // Roles that can advance to this role
    advancementSources: ["021-magician-Alpha"],
};

export default lightMage;
