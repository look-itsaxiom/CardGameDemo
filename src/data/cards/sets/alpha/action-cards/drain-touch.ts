import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Drain Touch - Action Card (Alpha Set #012)
 *
 * Requires: Control a Magician-based summon
 * Effect: Deals dark magic damage and heals caster for 50% of damage dealt
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Dark
 * Rarity: Uncommon
 */
export const drainTouch: ActionCard = {
    // Core card identity
    id: "012-drain_touch-Alpha",
    name: "Drain Touch",
    type: CardType.ACTION,
    rarity: CardRarity.UNCOMMON,
    description:
        "A close-range attack that siphons life from a target, dealing damage and healing the caster.",
    attribute: "dark",

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
    ],

    // Card effects
    effects: [
        {
            id: "drain-touch-damage-and-heal",
            type: "damageSummon",
            parameters: {
                damageType: "magical",
                damageAttribute: "dark",
                basePower: 30,
                baseAccuracy: 90,
                hitFormula: "standard", // 90 + (caster.ACC / 10)
                damageFormula:
                    "caster.INT * (1 + basePower/100) * (caster.INT / target.MDF)",
                canCrit: true,
                critMultiplier: 1.5,
                critFormula: "standard",

                // Heal caster for 50% of damage dealt
                onHitEffect: {
                    type: "healCaster",
                    healFormula: "damageDealt * 0.5",
                    healingType: "magical",
                    healingAttribute: "dark",
                    canCrit: false, // Healing doesn't crit
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
                            rangeFromCaster: 1, // Close range
                        },
                    },
                ],
            },
        },
    ],
};

export default drainTouch;
