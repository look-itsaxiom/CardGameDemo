import { QuestCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Taste of Battle - Quest Card (Alpha Set #003)
 *
 * Quest acts like a building - played and becomes active in In Play Zone
 * Objective: Control a summon under level 10 that has dealt damage to an enemy summon this turn
 * Failure: If your summon under level 10 takes damage from an enemy, quest fails
 * Player Action: When objective is met, player can activate quest to gain reward
 * Completion: Target summon gains 2 levels, quest moves to recharge pile
 * Failure: Quest moves to discard pile
 * Interaction: Can be activated by owner during their action phase
 * Attribute: Fire
 * Rarity: Uncommon
 */
export const tasteOfBattle: QuestCard = {
    // Core card identity
    id: "003-taste_of_battle-Alpha",
    name: "Taste of Battle",
    type: CardType.QUEST,
    rarity: CardRarity.UNCOMMON,
    description:
        "While this quest is active, if you control a summon under level 10 that has dealt damage to an enemy summon this turn, you may activate this quest to have that summon gain 2 levels. If any of your summons under level 10 take damage from an enemy, this quest fails.",
    attribute: "fire",

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
            id: "control-summon-dealt-damage",
            type: "controlsSummon",
            parameters: {
                controller: "self",
                zone: "inPlay",
                levelRange: { max: 9 }, // Under level 10
                hasDealtDamageThisTurn: true,
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
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self",
                        levelRange: { max: 9 },
                        hasDealtDamageThisTurn: true,
                    },
                ],
            },
        },
    ],

    // Failure conditions - these trigger automatically when met
    failureRequirements: [
        {
            id: "summon-took-damage",
            type: "summonTookDamage",
            parameters: {
                controller: "self",
                levelRange: { max: 9 }, // Under level 10
                damageSource: "enemy",
                thisTurn: true,
            },
        },
    ],

    // Effects that trigger on failure (automatic)
    failureEffects: [
        {
            id: "quest-failed",
            type: "questFailed",
            parameters: {
                reason: "Summon under level 10 took damage from enemy",
            },
        },
    ],

    // Player interaction settings
    canBeActivatedBy: "owner",
    activationTiming: SpeedLevel.ACTION,

    // Destination control
    destinationOnCompletion: "recharge",
    destinationOnFailure: "discard",
};

export default tasteOfBattle;
