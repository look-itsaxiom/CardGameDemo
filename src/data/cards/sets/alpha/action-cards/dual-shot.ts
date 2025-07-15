import { ActionCard, CardType, CardRarity, SpeedLevel, Duration } from "@types";

/**
 * Dual Shot - Action Card (Alpha Set #017)
 *
 * Requires: Control a Scout-based summon
 * Effect: Target scout can make two basic attacks this turn instead of one
 * Speed: Action Speed
 * Destination: Recharge Pile
 * Attribute: Neutral
 * Rarity: Uncommon
 */
export const dualShot: ActionCard = {
    // Core card identity
    id: "017-dual_shot-Alpha",
    name: "Dual Shot",
    type: CardType.ACTION,
    rarity: CardRarity.UNCOMMON,
    description:
        "Target scout based Summon you control is able to make two basic attacks this turn, instead of one.",
    attribute: "neutral",

    // Action card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "recharge",

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
            id: "grant-extra-attack",
            type: "grantExtraAttack",
            parameters: {
                duration: Duration.endOfThisTurn(),
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self", // Must target your own summon
                        roleFamily: ["scout"], // Must be scout-based
                    },
                ],
            },
        },
    ],
};

export default dualShot;
