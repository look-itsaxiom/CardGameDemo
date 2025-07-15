import { EquipmentCard, CardType, CardRarity, EquipmentSlot } from "@types";

/**
 * Heirloom Sword - Weapon Equipment Card (Alpha Set #034)
 *
 * A balanced weapon passed down through generations
 * Provides +1 to all stats except LCK which gets +1% (1.01 multiplier)
 * Base power: 30, Attack range: 1 (melee)
 * Damage stat: STR (physical damage)
 * Attribute: Neutral
 * Rarity: Common
 */
export const heirloomSword: EquipmentCard = {
    // Core card identity
    id: "034-heirloom_sword-Alpha",
    name: "Heirloom Sword",
    type: CardType.EQUIPMENT,
    slot: EquipmentSlot.WEAPON,
    rarity: CardRarity.COMMON,
    description:
        "A sword passed down through generations, it has done its job for each of its owners, and it will continue to do so for you.",
    attribute: "neutral",

    // Weapon properties
    power: 30,
    range: 1,

    // Stat bonuses - multiplicative modifiers (1.01 = 1% increase)
    statBonuses: {
        STR: 1,
        END: 1,
        DEF: 1,
        INT: 1,
        SPI: 1,
        MDF: 1,
        SPD: 1,
        LCK: 1.01, // 1% increase (101% of base)
        ACC: 1,
    },

    // Weapon effects (can be expanded for special abilities)
    effects: [
        {
            id: "physical-damage",
            type: "weaponDamage",
            parameters: {
                damageType: "physical",
                damageStat: "STR",
                basePower: 30,
                range: 1,
            },
        },
    ],
};
