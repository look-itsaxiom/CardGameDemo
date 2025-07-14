import { AdvanceCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Shadow Pact - Role Change Advance Card (Alpha Set #018)
 *
 * Advances a Magician summon to Warlock role
 * Requirements: Control a tier 1-2 Magician summon level 20+
 * Effect: Target Magician summon becomes a Warlock (role change)
 * Destination: Discard pile after use
 * Speed: Action
 * Rarity: Legend
 */
export const shadowPact: AdvanceCard = {
    // Core card identity
    id: "018-shadow_pact-Alpha", // Corrected to match legacy ID
    name: "Shadow Pact",
    type: CardType.ADVANCE,
    rarity: CardRarity.LEGEND, // Corrected to match legacy rarity
    description:
        "Target Magician summon becomes a Warlock. The warlock gains dark magic mastery and powerful offensive capabilities.",
    attribute: "dark",

    // Advance card properties
    speed: SpeedLevel.ACTION,
    advanceType: "roleChange",
    targetRole: "032-warlock-Alpha", // Reference to actual warlock role card
    destinationPile: "discard",

    // Requirements to play the card
    requirements: [
        {
            id: "control-magician-summon",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                roleFamily: ["magician"],
                tier: [1, 2], // Tier 1 or tier 2 magician roles
                levelRange: { min: 20 }, // Level 20+
                minimumCount: 1,
            },
        },
    ],

    // Effects when playing the card
    effects: [
        {
            id: "role-change-to-warlock",
            type: "roleChange",
            parameters: {
                newRole: "032-warlock-Alpha", // Reference to actual warlock role card
                permanent: true,
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self",
                        roleFamily: ["magician"],
                        tier: [1, 2], // Tier 1 or tier 2 magician roles
                        levelRange: { min: 20 }, // Level 20+
                    },
                ],
            },
        },
    ],
};
