import { AdvanceCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Oath of Light - Role Change Advance Card (Alpha Set #033)
 *
 * Advances a Warrior or Magician summon to Paladin role
 * Requirements: Control a tier 1-2 Warrior or Magician summon level 20 or higher
 * Effect: Target summon becomes a Paladin (role change)
 * Destination: Discard pile after use
 * Speed: Action
 * Rarity: Legend
 */
export const oathOfLight: AdvanceCard = {
    // Core card identity
    id: "033-oath_of_light-Alpha",
    name: "Oath of Light",
    type: CardType.ADVANCE,
    rarity: CardRarity.LEGEND,
    description:
        "Promote a target warrior or magician based summon you control to the Paladin role, the epitome of holy warriors in terms of defense and support.",
    attribute: "light",

    // Advance card properties
    speed: SpeedLevel.ACTION,
    advanceType: "roleChange",
    targetRole: "031-paladin-Alpha", // Reference to actual paladin role card
    destinationPile: "discard",

    // Requirements to play the card
    requirements: [
        {
            id: "control-warrior-or-magician-summon",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                roleFamily: ["warrior", "magician"],
                tier: [1, 2],
                levelRange: { min: 20 },
                minimumCount: 1,
            },
        },
    ],

    // Effects when playing the card
    effects: [
        {
            id: "role-change-to-paladin",
            type: "roleChange",
            parameters: {
                newRole: "031-paladin-Alpha", // Reference to actual paladin role card
                permanent: true,
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self",
                        roleFamily: ["warrior", "magician"],
                        tier: [1, 2],
                        levelRange: { min: 20 },
                    },
                ],
            },
        },
    ],
};
