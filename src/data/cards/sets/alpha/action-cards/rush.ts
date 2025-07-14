import { ActionCard, CardType, CardRarity, SpeedLevel, Duration } from "@types";

/**
 * Rush - Action Card (Alpha Set #009)
 *
 * Requires: Control a Warrior-based summon
 * Effect: Target warrior gains double movement speed until end of turn,
 *         and DEF is halved until end of opponent's next turn
 * Speed: Action Speed
 * Destination: Recharge Pile
 * Attribute: Neutral
 * Rarity: Common
 */
export const rush: ActionCard = {
    // Core card identity
    id: "009-rush-Alpha",
    name: "Rush",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Target warrior based summon you control. Until the end of this turn, its movement speed is doubled, while its DEF is halved until the end of the opponent's next turn.",
    attribute: "neutral",

    // Action card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "recharge",

    // Requirements to play this card
    requirements: [
        {
            id: "control-warrior-family",
            type: "controlsRoleFamily",
            parameters: {
                roleFamily: "warrior", // Any role from warrior family tree
                minimumCount: 1,
            },
        },
    ],

    // Card effects
    effects: [
        {
            id: "modify-movement-and-defense",
            type: "modify",
            parameters: {
                modifications: [
                    {
                        target: "movementSpeed",
                        type: "multiply",
                        value: 2,
                        duration: Duration.endOfThisTurn(),
                    },
                    {
                        target: "DEF",
                        type: "divide",
                        value: 2,
                        duration: Duration.endOfOpponentNextTurn(),
                    },
                ],
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summonInPlay",
                        parameters: {
                            zone: "inPlay",
                            controller: "self", // Must target your own summon
                            roleFamily: "warrior", // Must be warrior-based
                        },
                    },
                ],
            },
        },
    ],
};

export default rush;
