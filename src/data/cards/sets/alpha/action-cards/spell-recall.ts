import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Spell Recall - Action Card (Alpha Set #015)
 *
 * Requires: Control a Magician-based summon
 * Cost: Send one card from your hand or the top of your deck to the recharge pile
 * Effect: Add a target magician-based Action card from your recharge or discard pile to your hand
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Neutral
 * Rarity: Common
 */
export const spellRecall: ActionCard = {
    // Core card identity
    id: "015-spell_recall-Alpha",
    name: "Spell Recall",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Cost: Send one card from your hand or the top of your deck to the recharge pile. If you do, you can add a target magician based Action card from your recharge or discard pile to your hand.",
    attribute: "neutral",

    // Action card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "discard",

    // Requirements to play this card
    requirements: [
        {
            id: "control-magician-family",
            type: "controlsRoleFamily",
            parameters: {
                roleFamily: "magician", // Any role from magician family tree
                minimumCount: 1,
            },
        },
        {
            id: "can-pay-cost",
            type: "canPayCost",
            parameters: {
                costType: "sendCardToZone",
                destinationZone: "recharge",
                source: ["hand", "deck"], // Can choose from hand or top of deck
                amount: 1,
            },
        },
    ],

    // TODO: Cost should be handled by engine during activation, not as an effect
    // Cost: Send one card from hand or top of deck to recharge pile
    // This should be paid automatically when the card is played, before effects resolve

    // Card effects (only the actual effect, not the cost)
    effects: [
        {
            id: "recall-magician-action-card",
            type: "searchAndAddToHand",
            parameters: {
                searchZones: ["recharge", "discard"],
                cardType: "action",
                amount: 1,
                controller: "self",
                additionalRestrictions: [
                    {
                        type: "requiresRoleFamily",
                        roleFamily: "magician", // Must be a magician-based action card
                    },
                ],
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "cardInZone",
                        parameters: {
                            zones: ["recharge", "discard"],
                            cardType: "action",
                            controller: "self",
                            requiresRoleFamily: "magician", // Must require magician to play
                        },
                    },
                ],
            },
        },
    ],
};

export default spellRecall;
