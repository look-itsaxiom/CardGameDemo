import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Berserker - Role Card (Alpha Set #023)
 *
 * Tier: 2 (Advancement Role)
 * Family: Warrior
 * Base Role: Warrior
 * Stat Modifiers: +60% STR, +35% END, +25% SPD
 * Advancements: Sentinel
 * Rarity: Uncommon
 * Description: Frenzied warrior specializing in devastating attacks
 */
export const berserker: RoleCard = {
    // Core card identity
    id: "023-berserker-Alpha",
    name: "Berserker",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A frenzied warrior who channels their rage into devastating attacks, becoming a whirlwind of destruction on the battlefield.",

    // Role-specific properties
    tier: 2,
    roleFamily: "warrior",
    baseRole: "020-warrior-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        STR: 1.6, // +60% strength (massive damage boost)
        END: 1.35, // +35% endurance
        SPD: 1.25, // +25% speed (berserker fury)
        // All other stats remain 1.0 (no modifier)
    },

    // Advancement paths available from this role
    advancements: [
        { toRole: "030-sentinel-Alpha" }, // Can advance to Sentinel
    ],

    // Roles that can advance to this role
    advancementSources: ["020-warrior-Alpha"],
};

export default berserker;
