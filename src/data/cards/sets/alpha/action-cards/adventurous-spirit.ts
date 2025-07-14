import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Adventurous Spirit - Action Card (Alpha Set #013)
 *
 * Requires: Control a Scout-based summon
 * Effect: Search your deck, recharge pile, or discard pile for a Quest card and add it to your hand
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Earth
 * Rarity: Common
 */
export const adventurousSpirit: ActionCard = {
    // Core card identity
    id: "013-adventurous_spirit-Alpha",
    name: "Adventurous Spirit",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Add target Quest card from your deck, recharge pile, or discard pile to your hand.",
    attribute: "earth",

    // Action card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "discard",

    // Requirements to play this card
    requirements: [
        {
            id: "control-scout-family",
            type: "controlsRoleFamily",
            parameters: {
                roleFamily: "scout", // Any role from scout family tree
                minimumCount: 1,
            },
        },
    ],

    // Card effects
    effects: [
        {
            id: "search-for-quest-card",
            type: "searchAndAddToHand",
            parameters: {
                searchZones: ["deck", "recharge", "discard"],
                cardType: "quest",
                amount: 1,
                controller: "self",
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "cardInZone",
                        parameters: {
                            zones: ["deck", "recharge", "discard"],
                            cardType: "quest",
                            controller: "self",
                        },
                    },
                ],
            },
        },
    ],
};

export default adventurousSpirit;
