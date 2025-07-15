import { RoleCard, CardType, CardRarity } from "@types";

export const paladin: RoleCard = {
    id: "031-paladin-Alpha",
    name: "Paladin",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description:
        "A light magic wielding warrior who excels in both physical and magical defense, using their holy powers to protect and heal allies.",
    attribute: "light",

    tier: 3,
    roleFamily: "warrior", // Hybrid warrior/magician but primarily warrior
    baseRole: "020-warrior-Alpha", // Ultimate root

    statModifiers: {
        STR: 1.05, // +5% strength (modest physical)
        END: 1.5, // +50% endurance (very tanky)
        DEF: 1.55, // +55% defense (heavily armored)
        INT: 1.25, // +25% intelligence (holy magic)
        SPI: 2.0, // +100% spirit (holy power!)
        MDF: 1.75, // +75% magic defense
        LCK: 1.1, // +10% luck (divine favor)
    },

    // Special paladin ability: Healing Touch action card
    effects: [
        {
            id: "paladin-healing-touch-effect",
            type: "addUniqueCardToHand",
            parameters: {
                cardId: "131-healing_touch-Alpha",
                triggers: ["onPlay", "onPlayerLevelPhase"],
                conditions: {
                    roleInPlay: true,
                },
            },
        },
    ],

    // Terminal role
    advancementSources: ["024-knight-Alpha", "027-light_mage-Alpha"],
};

export default paladin;
