import { RoleCard, CardType, CardRarity } from "@types";

export const sentinel: RoleCard = {
    id: "030-sentinel-Alpha",
    name: "Sentinel",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description:
        "A vigilant guardian who stands watch over their allies, ready to intercept threats and shield them from harm.",
    attribute: "earth",

    tier: 3,
    roleFamily: "warrior",
    baseRole: "020-warrior-Alpha",

    statModifiers: {
        STR: 1.35, // +35% strength
        END: 2.1, // +110% endurance (ultimate tank)
        DEF: 1.85, // +85% defense (fortress-like)
        MDF: 1.25, // +25% magic defense
        SPD: 0.7, // -30% speed (heavy armor penalty)
    },

    // Special sentinel ability: Aura of Protection buff
    effects: [
        {
            id: "sentinel-aura-of-protection",
            type: "passiveBuffAura",
            parameters: {
                range: 4, // 4 spaces from the sentinel
                targetType: "allyUnits",
                statModifier: {
                    target: "DEF",
                    operation: "multiply",
                    value: 1.15, // +15% defense
                },
                conditions: {
                    roleInPlay: true,
                },
            },
        },
    ],

    // Terminal role
    advancementSources: ["024-knight-Alpha", "023-berserker-Alpha"],
};

export default sentinel;
