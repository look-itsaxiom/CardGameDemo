import { RoleCard, CardType, CardRarity } from "@types";

export const darkMage: RoleCard = {
    id: "026-dark_mage-Alpha",
    name: "Dark Mage",
    type: CardType.ROLE,
    rarity: CardRarity.UNCOMMON,
    description:
        "A practitioner of shadow magic, manipulating the dark element to confound, confuse, control, and consume.",

    tier: 2,
    roleFamily: "magician",
    baseRole: "021-magician-Alpha",

    statModifiers: {
        INT: 1.6, // +60% intelligence (dark power)
        MDF: 1.1, // +10% magic defense
        ACC: 1.25, // +25% accuracy
    },

    advancements: [
        { toRole: "032-warlock-Alpha" }, // Can become Warlock
    ],
    advancementSources: ["021-magician-Alpha"],
};

export default darkMage;
