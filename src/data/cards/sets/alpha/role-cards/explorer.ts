import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Explorer - Role Card (Alpha Set #029)
 *
 * Tier: 2 (Advancement Role)
 * Family: Scout
 * Base Role: Scout
 * Stat Modifiers: +10% END, +60% SPD, +50% LCK
 * Advancements: None (Terminal in Alpha)
 * Rarity: Uncommon
 * Description: Mobile scout specializing in extreme speed and survival
 */
export const explorer: RoleCard = {
    // Core card identity
    id: "029-explorer-Alpha",
    name: "Explorer",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A daring explorer who ventures into the unknown, using their wits and agility to navigate treacherous terrain and adapt to new environments.",

    // Role-specific properties
    tier: 2,
    roleFamily: "scout",
    baseRole: "022-scout-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        END: 1.1, // +10% endurance
        SPD: 1.6, // +60% speed (very fast)
        LCK: 1.5, // +50% luck
        // All other stats remain 1.0 (no modifier)
    },

    // Terminal role - no tier 3 advancement for explorers in Alpha set
    // Future sets may add: Ranger, Trailblazer

    // Roles that can advance to this role
    advancementSources: ["022-scout-Alpha"],
};

export default explorer;
