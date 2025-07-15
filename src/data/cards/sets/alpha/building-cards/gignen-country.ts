import { BuildingCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Gignen Country - Building Card (Alpha Set #004)
 *
 * Dimensions: 3x2 (6 spaces)
 * Effect: Gignen-based summons in occupied spaces gain +1 level when they level up
 * Speed: Action Speed
 * Destination: Stays in play until destroyed
 * Attribute: Neutral
 * Rarity: Uncommon
 */
export const gignenCountry: BuildingCard = {
    // Core card identity
    id: "004-gignen_country-Alpha",
    name: "Gignen Country",
    type: CardType.BUILDING,
    rarity: CardRarity.UNCOMMON,
    description:
        "While occupying all Gignen based Summons you control receive an additional level whenever they level up.",
    attribute: "neutral",

    // Building card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "discard", // Goes to discard when destroyed
    dimensions: { width: 3, height: 2 }, // 3x2 building

    // Requirements to play this card
    requirements: [
        {
            id: "valid-board-space",
            type: "validBoardSpace",
            parameters: {
                dimensions: { width: 3, height: 2 },
                controller: "self", // Must be placed in your territory
                unoccupiedBy: ["buildings", "summons"], // Must be clear of both buildings and summons
            },
        },
    ],

    // Building effects (persistent while in play)
    effects: [
        {
            id: "gignen-level-bonus",
            type: "ongoingEffect",
            parameters: {
                trigger: {
                    type: "summonLevelUp",
                    restrictions: [
                        {
                            type: "summonInOccupiedSpaces",
                            parameters: {
                                controller: "self",
                                species: "gignen",
                            },
                        },
                    ],
                },
                effect: {
                    type: "grantAdditionalLevels",
                    value: 1,
                },
            },
        },
    ],
};

export default gignenCountry;
