import {
    BuildingCard,
    CardType,
    CardRarity,
    SpeedLevel,
    Duration,
} from "@types";

/**
 * Dark Altar - Building Card (Alpha Set #010)
 *
 * Dimensions: 2x2 (4 spaces)
 * Effect: At end of your next turn, destroys itself and any summons in occupied spaces.
 *         If a summon was destroyed this way, target magician becomes level 20 and can advance.
 * Speed: Action Speed
 * Destination: Discard pile when destroyed
 * Attribute: Dark
 * Rarity: Rare
 */
export const darkAltar: BuildingCard = {
    // Core card identity
    id: "010-dark_altar-Alpha",
    name: "Dark Altar",
    type: CardType.BUILDING,
    rarity: CardRarity.RARE,
    description:
        "At the end of your next turn, this building, and any Summons within the spaces it occupies, are destroyed. If a Summon was destroyed by this effect, target magician-based Summon you control becomes level 20 and you can immediately Advance using that Summon as a target.",
    attribute: "dark",

    // Building card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "discard", // Goes to discard when destroyed
    dimensions: { width: 2, height: 2 }, // 2x2 building

    // Requirements to play this card
    requirements: [
        {
            id: "valid-board-space",
            type: "validBoardSpace",
            parameters: {
                dimensions: { width: 2, height: 2 },
                controller: "self", // Must be placed in your territory
                unoccupiedBy: ["buildings", "summons"], // Must be clear of both buildings and summons
            },
        },
    ],

    // Building effects (triggered effects)
    effects: [
        {
            id: "dark-altar-delayed-destruction",
            type: "delayedEffect",
            parameters: {
                duration: Duration.endOfOpponentNextTurn(), // Use Duration system
                effects: [
                    {
                        type: "destroySummonsInOccupiedSpaces",
                        parameters: {
                            controller: "any", // Any summons in the spaces
                        },
                        onResolveEffect: {
                            type: "conditionalEffect",
                            condition: {
                                type: "summonWasDestroyed",
                                byThisEffect: true,
                            },
                            effects: [
                                {
                                    type: "setLevelTo",
                                    value: 20,
                                    targeting: {
                                        type: "single",
                                        restrictions: [
                                            {
                                                type: "summon",
                                                parameters: {
                                                    zone: "inPlay",
                                                    controller: "self",
                                                    roleFamily: "magician",
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "enableAdvanceSummon",
                                    targetPreviousEffect: true, // Target the magician from previous effect
                                },
                            ],
                        },
                    },
                    {
                        type: "destroySelf",
                    },
                ],
            },
        },
    ],
};

export default darkAltar;
