import { AdvanceCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Knighthood Ceremony - Role Change Advance Card (Alpha Set #081)
 *
 * Advances a Warrior summon to Knight role
 * Requirements: Control a tier 1 Warrior summon level 15 or higher
 * Effect: Target Warrior summon becomes a Knight (role change)
 * Destination: Discard pile after use
 * Speed: Action
 * Rarity: Uncommon
 */
export const knighthoodCeremony: AdvanceCard = {
    // Core card identity
    id: "008-knighthood_ceremony-Alpha",
    name: "Knighthood Ceremony",
    type: CardType.ADVANCE,
    rarity: CardRarity.UNCOMMON,
    description:
        "Target Warrior summon becomes a Knight. The knight gains balanced combat prowess and defensive capabilities.",
    attribute: "neutral",

    // Advance card properties
    speed: SpeedLevel.ACTION,
    advanceType: "roleChange",
    targetRole: "024-knight-Alpha", // Reference to actual knight role card
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
            id: "role-change-to-knight",
            type: "roleChange",
            parameters: {
                newRole: "024-knight-Alpha", // Reference to actual knight role card
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
