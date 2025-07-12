import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Element Mage - Role Card (Alpha Set #025)
 *
 * Tier: 2 (Advancement Role)
 * Family: Magician
 * Base Role: Magician
 * Stat Modifiers: +60% INT, +10% MDF, +25% SPD
 * Advancements: None (Terminal in Alpha)
 * Rarity: Uncommon
 * Description: Elemental magic specialist focused on raw magical power
 */
export const elementMage: RoleCard = {
    // Core card identity
    id: "025-element_mage-Alpha",
    name: "Element Mage",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A conduit of elemental magic, wielding the forces of fire, water, earth, and wind to devastate their foes.",

    // Role-specific properties
    tier: 2,
    roleFamily: "magician",
    baseRole: "021-magician-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        INT: 1.6, // +60% intelligence (raw magical power)
        MDF: 1.1, // +10% magic defense
        SPD: 1.25, // +25% speed
        // All other stats remain 1.0 (no modifier)
    },

    // Terminal role - focusing on just 2 tier 3 roles for Alpha
    // Future sets may add: Sorcerer

    // Roles that can advance to this role
    advancementSources: ["021-magician-Alpha"],
};

export default elementMage;
