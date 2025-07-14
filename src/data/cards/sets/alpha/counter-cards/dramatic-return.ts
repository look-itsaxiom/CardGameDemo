import { CounterCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Dramatic Return! - Counter Card (Alpha Set #070)
 *
 * Counter card that is set face-down in the In Play Zone
 * Trigger: When a summon you control is removed from the In Play Zone (defeated)
 * Effect: Return that summon to an unoccupied space within your territory with 10% HP
 * The summon returns with all its previous attributes (level, role, equipment) intact
 * This effect does not trigger Summon Draws
 * Activation: Can be activated during opponent's turn when trigger condition is met
 * Attribute: Light
 * Rarity: Legend
 */
export const dramaticReturn: CounterCard = {
    // Core card identity
    id: "070-dramatic_return-Alpha",
    name: "Dramatic Return!",
    type: CardType.COUNTER,
    rarity: CardRarity.LEGEND,
    description:
        "Trigger: A Summon you control is removed from In Play. Return that Summon to an unoccupied space within your territory with 10% HP. This effect does not trigger Summon Draws.",
    attribute: "light",

    // Play characteristics
    speed: SpeedLevel.COUNTER,
    destinationPile: "discard",

    // Activation trigger - when this counter can be revealed and activated
    activationTrigger: {
        id: "summon-removed-controlled",
        name: "Summon Removed (Controlled)",
        conditions: [
            {
                type: "summonRemovedFromPlay",
                parameters: {
                    controller: "self", // Must be a summon you control
                    source: "defeated", // Only when defeated, not other removal reasons
                },
            },
        ],
    },

    // Requirements to play/set the counter card
    requirements: [
        {
            id: "basic-playability",
            type: "canPlayCard",
            parameters: {},
        },
        {
            id: "has-valid-placement-space",
            type: "hasValidTarget",
            parameters: {
                targetType: "space",
                zone: "gameBoard",
                controller: "self",
                occupiedBy: "none",
                withinTerritory: "self",
                minimumCount: 1,
            },
        },
    ],

    // Effects when this counter is activated
    effects: [
        {
            id: "return-summon-to-play",
            type: "returnSummonToPlay",
            parameters: {
                hpPercentage: 0.1, // 10% HP
                preserveLevel: true,
                preserveRole: true,
                preserveEquipment: true,
                clearOngoingEffects: true, // Remove ongoing effects that were tied to the summon
                preventSummonDraws: true, // This doesn't trigger summon draws
            },
            targeting: {
                type: "multiple", // Need to target both the summon and the space
                restrictions: [
                    {
                        type: "summon",
                        zone: "removed", // Target the removed summon
                        controller: "self",
                        minimumCount: 1,
                        maximumCount: 1,
                    },
                    {
                        type: "space",
                        zone: "gameBoard",
                        controller: "self", // Must be in your territory
                        occupiedBy: "none", // Must be unoccupied
                        withinTerritory: "self", // Must be in your territory
                        minimumCount: 1,
                        maximumCount: 1,
                    },
                ],
            },
        },
    ],
};

export default dramaticReturn;
