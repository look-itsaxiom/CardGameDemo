import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Magician - Role Card (Alpha Set #021)
 *
 * Tier: 1 (Base Role)
 * Family: Magician
 * Stat Modifiers: +25% INT, +25% SPI
 * Advancements: Element Mage, Light Mage, Dark Mage
 * Rarity: Common
 * Description: Foundation magic role focused on spellcasting
 */
export const magician: RoleCard = {
    // Core card identity
    id: "021-magician-Alpha",
    name: "Magician",
    type: CardType.ROLE,
    rarity: CardRarity.COMMON,
    description:
        "A developing magic user learning to control the elements and cast powerful spells, using their intellect and creativity to overcome challenges.",

    // Role-specific properties
    tier: 1,
    roleFamily: "magician",

    // Stat modifiers applied when this role is active
    statModifiers: {
        INT: 1.25, // +25% intelligence
        SPI: 1.25, // +25% spirit
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "025-element_mage-Alpha" },
        { toRole: "027-light_mage-Alpha" },
        { toRole: "026-dark_mage-Alpha" },
    ],
};

export default magician;
