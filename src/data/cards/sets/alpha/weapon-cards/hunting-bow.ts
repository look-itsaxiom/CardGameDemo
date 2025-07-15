import { EquipmentCard, CardType, CardRarity, EquipmentSlot } from "@types";

/**
 * Hunting Bow - Weapon Equipment Card (Alpha Set #036)
 *
 * A ranged weapon for scouts and hunters
 * Provides +1 to all stats except ACC which gets +1% (1.01 multiplier)
 * Base power: 20, Attack range: 4 (long ranged)
 * Damage stat: STR (physical damage with accuracy focus)
 * Attribute: Neutral
 * Rarity: Common
 */
export const huntingBow: EquipmentCard = {
    // Core card identity
    id: "036-hunting_bow-Alpha",
    name: "Hunting Bow",
    type: CardType.EQUIPMENT,
    slot: EquipmentSlot.WEAPON,
    rarity: CardRarity.COMMON,
    description:
        "A bow designed for hunting, it offers functional precision and power.",
    attribute: "neutral",

    // Weapon properties
    power: 20,
    range: 4,

    // Stat bonuses - multiplicative modifiers (1.01 = 1% increase)
    statBonuses: {
        STR: 1,
        END: 1,
        DEF: 1,
        INT: 1,
        SPI: 1,
        MDF: 1,
        SPD: 1,
        LCK: 1,
        ACC: 1.01, // 1% increase (101% of base)
    },

    // Weapon effects
    effects: [
        {
            id: "ranged-physical-damage",
            type: "weaponDamage",
            parameters: {
                damageType: "physical",
                damageStat: "STR",
                basePower: 20,
                range: 4,
            },
        },
    ],
};
