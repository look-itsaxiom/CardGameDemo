import { RoleCard, CardType, CardRarity } from "@types";

export const warlock: RoleCard = {
    id: "032-warlock-Alpha",
    name: "Warlock",
    type: CardType.ROLE,
    rarity: CardRarity.RARE,
    description:
        "A master of dark magic who wields forbidden powers to curse enemies and cast devastating spells.",
    attribute: "dark",

    tier: 3,
    roleFamily: "magician",
    baseRole: "021-magician-Alpha",

    statModifiers: {
        INT: 2.1, // +110% intelligence (overwhelming magical power)
        MDF: 1.35, // +35% magic defense
        ACC: 1.75, // +75% accuracy (precise dark magic)
        LCK: 0.7, // -30% luck (dark magic curse)
    },

    // Special warlock ability: Nightmare Pain counter card
    effects: [
        {
            id: "warlock-nightmare-pain-effect",
            type: "addUniqueCardToHand",
            parameters: {
                cardId: "132-nightmare_pain-Alpha",
                triggers: ["onPlay", "onPlayerDrawPhase"],
                conditions: {
                    roleInPlay: true,
                    cardNotInHand: true,
                    cardNotInPlay: true,
                },
            },
        },
    ],

    // Terminal role
    advancementSources: ["026-dark_mage-Alpha"],
};

export default warlock;
