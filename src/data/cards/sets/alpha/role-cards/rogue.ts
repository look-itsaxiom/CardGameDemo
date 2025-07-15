import { RoleCard, CardType, CardRarity } from "@types";

/**
 * Rogue - Role Card (Alpha Set #028)
 *
 * Tier: 2 (Advancement Role)
 * Family: Scout
 * Base Role: Scout
 * Stat Modifiers: +35% SPD, +50% LCK, +35% ACC
 * Advancements: None (Terminal in Alpha)
 * Rarity: Uncommon
 * Description: Stealthy scout specializing in precision strikes and subterfuge
 */
export const rogue: RoleCard = {
    // Core card identity
    id: "028-rogue-Alpha",
    name: "Rogue",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A cunning rogue who excels in subterfuge and precision strikes, using high risk, high reward tactics to outmaneuver opponents.",

    // Role-specific properties
    tier: 2,
    roleFamily: "scout",
    baseRole: "022-scout-Alpha",

    // Stat modifiers applied when this role is active
    statModifiers: {
        SPD: 1.35, // +35% speed
        LCK: 1.5, // +50% luck (crits!)
        ACC: 1.35, // +35% accuracy
        // All other stats remain 1.0 (no modifier)
    },

    // Terminal role - no tier 3 advancement for rogues in Alpha set
    // Future sets may add: Assassin, Battle Dancer, Shadowblade

    // Roles that can advance to this role
    advancementSources: ["022-scout-Alpha"],
};

export default rogue;
