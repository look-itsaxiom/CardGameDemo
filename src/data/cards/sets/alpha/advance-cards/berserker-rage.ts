import { AdvanceCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Berserker Rage - Role Change Advance Card (Alpha Set #080)
 *
 * Advances a Warrior summon to Berserker role
 * Requirements: Control a tier 1 Warrior summon level 10 or higher
 * Effect: Target Warrior summon becomes a Berserker (role change)
 * Destination: Discard pile after use
 * Speed: Action
 * Rarity: Uncommon
 */
export const berserkerRage: AdvanceCard = {
    // Core card identity
    id: "007-berserker_rage-Alpha",
    name: "Berserker Rage",
    type: CardType.ADVANCE,
    rarity: CardRarity.RARE,
    description:
        "Target Warrior summon becomes a Berserker. The berserker gains increased physical prowess at the cost of defense.",
    attribute: "fire",

    // Advance card properties
    speed: SpeedLevel.ACTION,
    advanceType: "roleChange",
    targetRole: "023-berserker-Alpha", // Reference to actual berserker role card
    destinationPile: "discard",

    // Requirements to play the card
    requirements: [
        {
            id: "control-warrior-summon",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                roleFamily: ["warrior"],
                tier: [1, 2],
                levelRange: { min: 10 },
                minimumCount: 1,
            },
        },
    ],

    // Effects when playing the card
    effects: [
        {
            id: "role-change-to-berserker",
            type: "roleChange",
            parameters: {
                newRole: "023-berserker-Alpha", // Reference to actual berserker role card
                permanent: true,
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self",
                        roleFamily: ["warrior"],
                        tier: [1, 2],
                        levelRange: { min: 10 },
                    },
                ],
            },
        },
    ],
};
