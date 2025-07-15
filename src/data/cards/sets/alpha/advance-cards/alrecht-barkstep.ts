import {
    AdvanceCard,
    CardType,
    CardRarity,
    SpeedLevel,
    GrowthRate,
} from "@types";

/**
 * Alrecht Barkstep, Scoutmaster - Named Summon Advance Card (Alpha Set #083)
 *
 * Transforms a Scout summon into the unique Named Summon "Alrecht Barkstep, Scoutmaster"
 * Requirements: Control a tier 1 Scout summon level 10+ that has completed a Quest
 * Effect: Target Scout becomes Alrecht Barkstep (Named Summon transformation)
 * Inheritance: Equipment, position, and level from material summon
 * Special: Adds "Follow Me!" to hand on enter play and each turn
 * Destination: Removed from game (Named Summons don't return to deck)
 * Speed: Action
 * Rarity: Myth
 */
export const alrechtBarkstepScoutmaster: AdvanceCard = {
    // Core card identity
    id: "014-alrecht_barkstep-Alpha",
    name: "Alrecht Barkstep, Scoutmaster",
    type: CardType.ADVANCE,
    rarity: CardRarity.LEGEND,
    description:
        "Transform target Scout summon level 10+ that has completed a Quest into Alrecht Barkstep, Scoutmaster. Inherits equipment, position, and level. Adds 'Follow Me!' to hand on enter play and each turn.",
    attribute: "earth",

    // Advance card properties
    speed: SpeedLevel.ACTION,
    advanceType: "namedSummon",
    destinationPile: "removed",

    // Named Summon properties
    namedSummonStats: {
        species: "gignen", // Inherits species from material
        role: "028-rogue-Alpha", // Reference to actual rogue role card
        level: 0, // Level inherited from material summon (0 = inherit)
        baseStats: {
            STR: 11,
            END: 9,
            DEF: 8,
            INT: 8,
            SPI: 8,
            MDF: 8,
            SPD: 11,
            LCK: 10,
            ACC: 12,
        },
        growthRates: {
            STR: GrowthRate.GRADUAL,
            END: GrowthRate.NORMAL,
            DEF: GrowthRate.STEADY,
            INT: GrowthRate.MINIMAL,
            SPI: GrowthRate.MINIMAL,
            MDF: GrowthRate.STEADY,
            SPD: GrowthRate.ACCELERATED,
            LCK: GrowthRate.ACCELERATED,
            ACC: GrowthRate.EXCEPTIONAL,
        },
        inheritedProperties: ["equipment", "position", "moveHistory", "level"],
        uniqueEffects: [
            {
                id: "follow-me-generator",
                type: "addCardToHand",
                parameters: {
                    cardId: "1-083-i-follow-me!-Alpha", // Follow Me! unique action card
                    timing: "onEnterPlay", // TODO: Replace with proper trigger system
                },
            },
            {
                id: "follow-me-turn-trigger",
                type: "addCardToHand",
                parameters: {
                    cardId: "1-083-i-follow-me!-Alpha", // Follow Me! unique action card
                    timing: "turnStart", // TODO: Replace with proper trigger system
                },
            },
        ],
    },

    // Requirements to play the card
    requirements: [
        {
            id: "control-scout-level-10-completed-quest",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                roleFamily: ["scout"],
                tier: [1, 2],
                levelRange: { min: 10 },
                minimumCount: 1,
                questCompletion: {
                    required: true,
                    minimumCompleted: 2, // Must have completed at least 2 quests
                    // specificQuests: ["quest-id"], // Optional: require specific quest IDs
                },
            },
        },
    ],

    // Effects when playing the card
    effects: [
        {
            id: "transform-to-named-summon",
            type: "namedSummonTransformation",
            parameters: {
                namedSummonId: "alrecht-barkstep-scoutmaster",
                inheritProperties: [
                    "equipment",
                    "position",
                    "moveHistory",
                    "level",
                ],
                newRole: "028-rogue-Alpha", // Reference to actual rogue role card
                addUniqueCard: "1-083-i-follow-me!-Alpha", // Follow Me! unique action card
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self",
                        roleFamily: ["scout"],
                        tier: [1, 2],
                        levelRange: { min: 10 },
                        questCompletion: {
                            required: true,
                            minimumCompleted: 2, // Must have completed at least 2 quests
                        },
                    },
                ],
            },
        },
    ],
};
