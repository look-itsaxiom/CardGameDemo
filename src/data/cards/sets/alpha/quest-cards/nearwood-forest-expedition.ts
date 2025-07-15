import { QuestCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Nearwood Forest Expedition - Quest Card (Alpha Set #002)
 *
 * Quest acts like a building - played and becomes active in In Play Zone
 * Objective: Control a Warrior, Scout, or Magician summon whose current level is under 10
 * Player Action: When objective is met, player can activate quest to gain reward
 * Completion: Target summon gains 2 levels, quest moves to recharge pile
 * Interaction: Can be activated by owner during their action phase
 * Destination: Recharge pile after completion
 * Attribute: Earth
 * Rarity: Common
 */
export const nearwoodForestExpedition: QuestCard = {
    // Core card identity
    id: "037-nearwood_forest_expedition-Alpha",
    name: "Nearwood Forest Expedition",
    type: CardType.QUEST,
    rarity: CardRarity.COMMON,
    description:
        "While this quest is active, if you control a Warrior, Scout, or Magician summon under level 10, you may activate this quest to have that summon gain 2 levels.",
    attribute: "earth",

    // Play characteristics
    speed: SpeedLevel.ACTION,
    destinationPile: "recharge",

    // Requirements to play the quest card (minimal - just like buildings)
    requirements: [
        {
            id: "basic-playability",
            type: "canPlayCard",
            parameters: {},
        },
    ],

    // Effects when playing the quest (enters In Play Zone)
    effects: [
        {
            id: "enter-play",
            type: "enterPlayZone",
            parameters: {
                zone: "inPlay",
                controller: "self",
            },
        },
    ],

    // Requirements that must be met to activate quest effects
    objectiveRequirements: [
        {
            id: "control-eligible-summon",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                roleFamily: ["warrior", "scout", "magician"],
                levelRange: { max: 9 }, // Under level 10
                minimumCount: 1,
            },
        },
    ],

    // Effects that happen when player activates the quest
    objectiveEffects: [
        {
            id: "grant-levels",
            type: "levelUp",
            parameters: {
                levels: 2,
                targetSource: "objectiveTarget", // Target the same summon that met the objective
            },
        },
    ],

    // Player interaction settings
    canBeActivatedBy: "owner",
    activationTiming: SpeedLevel.ACTION,

    // Destination control
    destinationOnCompletion: "recharge",
    destinationOnFailure: "recharge",
};
