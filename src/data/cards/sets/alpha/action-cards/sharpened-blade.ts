import { ActionCard, CardType, CardRarity, SpeedLevel } from "@types";

/**
 * Sharpened Blade - Action Card (Alpha Set #005)
 *
 * Requires: Control a Warrior-based summon equipped with a weapon
 * Effect: Permanently increases target weapon's base power by 10
 * Speed: Action Speed
 * Destination: Recharge Pile
 * Attribute: Earth
 * Rarity: Common
 */
export const sharpenedBlade: ActionCard = {
    // Core card identity
    id: "005-sharpened_blade-Alpha",
    name: "Sharpened Blade",
    type: CardType.ACTION,
    rarity: CardRarity.COMMON,
    description:
        "Target Weapon equipped to a Warrior-based Summon gains +10 Base Power.",
    attribute: "earth", // Card attribute applies to the card itself

    // Action card specific properties
    speed: SpeedLevel.ACTION,
    destinationPile: "recharge",

    // Requirements to play this card
    requirements: [
        {
            id: "control-warrior-family-with-weapon",
            type: "controlsRoleFamilyWithEquipment", // Generic requirement type
            parameters: {
                // Must control at least one summon from the warrior role family with a weapon equipped
                roleFamily: "warrior", // Any role descended from warrior archetype
                minimumCount: 1,
                requiredEquipment: {
                    slot: "weapon",
                    mustBeEquipped: true,
                },
            },
        },
    ],

    // Card effects
    effects: [
        {
            id: "enhance-weapon-power",
            type: "modifyEquipmentProperty", // More generic effect type
            parameters: {
                property: "power", // Which equipment property to modify
                modification: 10,
                operation: "add",
                duration: "permanent",
            },
            targeting: {
                type: "single",
                restrictions: [
                    {
                        type: "equipmentSlot", // Generic equipment slot restriction
                        parameters: {
                            slot: "weapon",
                        },
                    },
                    {
                        type: "equippedToRoleFamily", // Generic role family restriction
                        parameters: {
                            roleFamily: "warrior", // Any role from warrior family tree
                        },
                    },
                ],
            },
        },
    ],
};

export default sharpenedBlade;
