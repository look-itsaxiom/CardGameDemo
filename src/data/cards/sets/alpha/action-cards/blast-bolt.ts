import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Blast Bolt - Action Card (Alpha Set #001)
 *
 * Requires: Control a Magician-based summon
 * Effect: Long range bolt of fire that explodes on impact, dealing significant single-target damage
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Fire
 * Rarity: Rare
 */
export const blastBolt: ActionCard = {
    // Core card identity
    id: "001-blast_bolt-Alpha",
    name: "Blast Bolt",
    type: CardType.ACTION,
    rarity: CardRarity.RARE,
    description:
        "A long range bolt of fire that explodes on impact, dealing significant single-target damage.",
    attribute: "fire",

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
            id: "fire-damage-target",
            type: "damageSummon",
            parameters: {
                damageType: "magical",
                damageAttribute: "fire",
                basePower: 60,
                baseAccuracy: 85,
                hitFormula: "standard", // 85 + (caster.ACC / 10)
                damageFormula:
                    "caster.INT * (1 + basePower/100) * (caster.INT / target.MDF)",
                canCrit: true,
                critMultiplier: 1.5,
                critFormula: "standard",
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "any", // Can target any summon
                        rangeFromCaster: 6, // Long range
                    },
                ],
            },
        },
    ],
};

export default blastBolt;
