import { EquipmentCard, CardType, CardRarity, EquipmentSlot } from "@types";

/**
 * Apprentice's Wand - Weapon Equipment Card (Alpha Set #035)
 *
 * A magical weapon for spellcasters
 * Provides +1 to all stats except INT which gets +1% (1.01 multiplier)
 * Base power: 25, Attack range: 3 (ranged magic)
 * Damage stat: INT (magical damage)
 * Attribute: Neutral
 * Rarity: Common
 */
export const apprenticesWand: EquipmentCard = {
    // Core card identity
    id: "035-apprentices_wand-Alpha",
    name: "Apprentice's Wand",
    type: CardType.EQUIPMENT,
    slot: EquipmentSlot.WEAPON,
    rarity: CardRarity.COMMON,
    description:
        "A simple wand used by apprentices to channel their magical energy.",
    attribute: "neutral",

    // Weapon properties
    power: 25,
    range: 3,

    // Stat bonuses - multiplicative modifiers (1.01 = 1% increase)
    statBonuses: {
        STR: 1,
        END: 1,
        DEF: 1,
        INT: 1.01, // 1% increase (101% of base)
        SPI: 1,
        MDF: 1,
        SPD: 1,
        LCK: 1,
        ACC: 1,
    },

    // Weapon effects
    effects: [
        {
            id: "magical-damage",
            type: "weaponDamage",
            parameters: {
                damageType: "magical",
                damageStat: "INT",
                basePower: 25,
                range: 3,
            },
        },
    ],
};
