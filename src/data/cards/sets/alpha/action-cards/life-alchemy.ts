import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Life Alchemy - Action Card (Alpha Set #016)
 *
 * Requires: Control a Magician-based summon
 * Effect: Target two summons you control within range. First target loses 25% of max HP,
 *         second target heals for the same amount.
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Dark
 * Rarity: Common
 */
export const lifeAlchemy: ActionCard = {
    // Core card identity
    id: "016-life_alchemy-Alpha",
    name: "Life Alchemy",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Target Summon you control, it loses 25% of its max HP and restores that amount to another target Summon you control.",
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
            id: "life-alchemy-damage-first-target",
            type: "damageSummon",
            parameters: {
                damageType: "neutral",
                damageAttribute: "neutral",
                hitFormula: "always_hit", // Always hits
                damageFormula: "target.maxHP * 0.25", // 25% of max HP
                canCrit: false, // Cannot crit

                // After dealing damage, heal the second target for the same amount
                onHitEffect: {
                    type: "healSpecificTarget",
                    targetIndex: 2, // Second target from the targeting
                    healFormula: "damageDealt", // Heal for exact damage dealt
                    healingType: "magical",
                    healingAttribute: "dark",
                    canCrit: false,
                },
            },
            targeting: {
                type: "multiple",
                restrictions: [
                    {
                        type: "summon",
                        zone: "inPlay",
                        controller: "self", // Must target your own summons
                        rangeFromCaster: 4, // Range 4 from caster
                        minimumCount: 2, // Must select exactly 2 targets
                        maximumCount: 2,
                    },
                ],
            },
        },
    ],
};

export default lifeAlchemy;
