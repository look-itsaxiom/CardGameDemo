import { CounterCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Graverobbing - Counter Card (Alpha Set #019)
 *
 * Must be set face-down in the In Play zone
 * Trigger: A Summon you control is removed from In Play
 * Effect: Return target Action card from your Discard pile to your hand
 * Additional Cost: Discard a card from your hand
 * Speed: Counter Speed
 * Destination: Discard pile after use
 * Attribute: Dark
 * Rarity: Common
 */
export const graverobbing: CounterCard = {
    // Core card identity
    id: "019-graverobbing-Alpha",
    name: "Graverobbing",
    type: CardType.COUNTER,
    rarity: CardRarity.COMMON,
    description:
        "Trigger: A Summon you control is removed from In Play. Return target Action card from your Discard to your hand.",
    attribute: "dark",

    // Counter card specific properties
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
                    source: "any", // Can be defeated, sacrificed, returned, etc.
                },
            },
        ],
    },

    // Requirements to activate this counter (when trigger occurs)
    requirements: [
        {
            id: "target-action-in-discard",
            type: "hasTargetInZone",
            parameters: {
                zone: "discard",
                cardType: "action",
                controller: "self",
                minimumCount: 1,
            },
        },
        {
            id: "can-pay-discard-cost",
            type: "canPayCost",
            parameters: {
                costType: "discardFromHand",
                amount: 1,
            },
        },
    ],

    // TODO: Cost should be handled by engine during activation, not as an effect
    // Cost: Discard one card from your hand
    // This should be paid automatically when the counter is activated, before effects resolve

    // Effects when this counter is activated
    effects: [
        {
            id: "return-action-to-hand",
            type: "changeZone",
            parameters: {
                fromZone: "discard",
                toZone: "hand",
                amount: 1,
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "card",
                        zone: "discard",
                        cardType: "action",
                        controller: "self",
                    },
                ],
            },
        },
    ],
};
