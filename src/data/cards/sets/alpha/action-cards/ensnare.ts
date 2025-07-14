import { ActionCard, CardType, CardRarity, SpeedLevel, Duration } from "@types";

/**
 * Ensnare - Action Card (Alpha Set #011)
 *
 * Requires: Control a Scout-based summon
 * Effect: Ranged attack that deals damage and potentially immobilizes target
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Earth
 * Rarity: Uncommon
 */
export const ensnare: ActionCard = {
    // Core card identity
    id: "011-ensnare-Alpha",
    name: "Ensnare",
    type: CardType.ACTION,
    rarity: CardRarity.UNCOMMON,
    description:
        "A ranged trap that ensnares a target Summon, immobilizing them from a distance and dealing a small amount of damage.",
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
            id: "ensnare-damage-and-immobilize",
            type: "damageSummon",
            parameters: {
                damageType: "physical",
                damageAttribute: "neutral",
                basePower: 25,
                baseAccuracy: 75,
                hitFormula:
                    "baseAccuracy + (caster.ACC / 10) + (caster.LCK / 10)", // Unique formula
                damageFormula:
                    "caster.STR * (1 + basePower/100) * (caster.STR / target.DEF)",
                canCrit: true,
                critMultiplier: 1.5,
                critFormula: "standard",

                // Optional: Additional effect that triggers if damage is dealt
                onHitEffect: {
                    type: "saveAgainstModification",
                    saveChance: 30, // 30% chance to save against immobilization
                    modifications: [
                        {
                            target: "movementSpeed",
                            type: "set",
                            value: 0, // Sets movement speed to 0 (immobilized)
                            duration: Duration.endOfOpponentNextTurn(),
                        },
                    ],
                },
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summonInPlay",
                        parameters: {
                            zone: "inPlay",
                            controller: "any", // Can target any summon
                            rangeFromCaster: 5, // Medium range
                        },
                    },
                ],
            },
        },
    ],
};

export default ensnare;
