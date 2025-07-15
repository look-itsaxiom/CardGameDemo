import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Warrior - Role Card (Alpha Set #020)
 *
 * Tier: 1 (Base Role)
 * Family: Warrior
 * Stat Modifiers: +25% STR, +25% END
 * Advancements: Berserker, Knight
 * Rarity: Common
 * Description: Foundation warrior role focused on physical combat
 */
export const warrior: RoleCard = {
    // Core card identity
    id: "020-warrior-Alpha",
    name: "Warrior",
    type: CardType.ROLE,
    rarity: CardRarity.COMMON,
    description:
        "A fierce warrior who excels in close combat, wielding powerful weapons and armor to dominate the battlefield.",

    // Role-specific properties
    tier: 1,
    roleFamily: "warrior",

    // Stat modifiers applied when this role is active
    statModifiers: {
        STR: 1.25, // +25% strength
        END: 1.25, // +25% endurance
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "023-berserker-Alpha" },
        { toRole: "024-knight-Alpha" },
    ],
};

export default warrior;
