import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Healing Hands - Action Card (Alpha Set #006)
 *
 * Requires: Control a Magician-based summon
 * Effect: Heals target summon for SPI * (1 + 40/100) HP
 * Speed: Action Speed
 * Destination: Discard Pile
 * Attribute: Light
 * Rarity: Uncommon
 */
export const healingHands: ActionCard = {
    // Core card identity
    id: "006-healing_hands-Alpha",
    name: "Healing Hands",
    type: CardType.ACTION,
    rarity: CardRarity.UNCOMMON,
    description:
        "Target Summon heals HP equal to the caster's SPI * 1.4. Can critically heal for 50% more.",
    attribute: "light",

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
            id: "heal-target-summon",
            type: "healSummon",
            parameters: {
                healingType: "magical",
                healingAttribute: "light",
                basePower: 40,
                healingFormula: "caster.SPI * (1 + basePower/100)",
                canCrit: true,
                critMultiplier: 1.5,
                critFormula: "standard",
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "summonInPlay",
                        parameters: {
                            zone: "inPlay",
                            controller: "any", // Can heal any summon
                            rangeFromCaster: 4,
                        },
                    },
                ],
            },
        },
    ],
};

export default healingHands;
