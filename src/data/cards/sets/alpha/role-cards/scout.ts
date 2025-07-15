import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Scout - Role Card (Alpha Set #022)
 *
 * Tier: 1 (Base Role)
 * Family: Scout
 * Stat Modifiers: +25% SPD, +25% LCK
 * Advancements: Rogue, Explorer
 * Rarity: Common
 * Description: Foundation scout role focused on speed and precision
 */
export const scout: RoleCard = {
    // Core card identity
    id: "022-scout-Alpha",
    name: "Scout",
    type: CardType.ROLE,
    rarity: CardRarity.COMMON,
    description:
        "A nimble scout who excels in reconnaissance and agility, using their speed and ranged attacks to outmaneuver opponents.",

    // Role-specific properties
    tier: 1,
    roleFamily: "scout",

    // Stat modifiers applied when this role is active
    statModifiers: {
        SPD: 1.25, // +25% speed
        LCK: 1.25, // +25% luck
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "028-rogue-Alpha" },
        { toRole: "029-explorer-Alpha" },
    ],
};

export default scout;
