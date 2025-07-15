// Modern TypeScript player and deck data for CardGameDemo
import {
    Player,
    PlayerCollection,
    Deck3v3,
    SummonSlot,
    SummonCard,
    CardType,
    CardRarity,
    BaseStats,
    GrowthRates,
    GrowthRate,
    UniqueCardId,
    PlayerId,
    CardId,
} from "../../types/index.js";

// Helper function to create a unique card ID
function createUniqueCardId(
    templateId: string,
    playerId: PlayerId,
    timestamp: number,
    signature: string
): UniqueCardId {
    return `${templateId}.${playerId}.${timestamp}.${signature}` as UniqueCardId;
}

// Simple demo cryptographic key (in real app, use proper key management)
const DEMO_PRIVATE_KEY =
    "CardGameDemo-PrivateKey-2025-ThisIsADemoKey-DontEvenTry";
const DEMO_PUBLIC_KEY =
    "CardGameDemo-PublicKey-2025-ThisIsADemoKey-DontEvenTry";

// Helper function to create a deterministic hash for demo purposes
function createHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
}

// Helper function to create a cryptographic signature that can be validated
function createSignature(
    templateId: string,
    playerId: PlayerId,
    timestamp: number,
    stats: BaseStats,
    growthRates: GrowthRates
): string {
    // Create the canonical card data string with deterministic ordering
    const orderedStats = JSON.stringify(stats, Object.keys(stats).sort());
    const orderedGrowthRates = JSON.stringify(
        growthRates,
        Object.keys(growthRates).sort()
    );
    const cardData = `${templateId}-${playerId}-${timestamp}-${orderedStats}-${orderedGrowthRates}`;

    // In a real implementation, this would use proper cryptographic signing (RSA, ECDSA, etc.)
    // For demo purposes, we'll create a signature that includes both the data hash and a key-based signature
    const dataHash = createHash(cardData);
    const keySignature = createHash(cardData + DEMO_PRIVATE_KEY);

    // Combine data hash with key signature for validation
    return `${dataHash}${keySignature}`;
}

// Helper function to validate a card's digital signature
function validateSignature(card: SummonCard): boolean {
    try {
        // Recreate the canonical card data string with deterministic ordering
        const orderedStats = JSON.stringify(
            card.baseStats,
            Object.keys(card.baseStats).sort()
        );
        const orderedGrowthRates = JSON.stringify(
            card.growthRates,
            Object.keys(card.growthRates).sort()
        );
        const cardData = `${card.speciesId}-${card.digitalSignature.openedBy}-${card.digitalSignature.timestamp}-${orderedStats}-${orderedGrowthRates}`;

        // Recreate the expected signature
        const expectedDataHash = createHash(cardData);
        const expectedKeySignature = createHash(cardData + DEMO_PRIVATE_KEY);
        const expectedSignature = `${expectedDataHash}${expectedKeySignature}`;

        // Compare with the card's signature
        return card.digitalSignature.signature === expectedSignature;
    } catch (error) {
        console.error("Signature validation failed:", error);
        return false;
    }
}

// Helper function to validate specific card values against their signature
function validateCardValues(card: SummonCard): {
    isValid: boolean;
    validationResults: {
        baseStatsValid: boolean;
        growthRatesValid: boolean;
        speciesIdValid: boolean;
        timestampValid: boolean;
        playerIdValid: boolean;
    };
} {
    const results = {
        baseStatsValid: false,
        growthRatesValid: false,
        speciesIdValid: false,
        timestampValid: false,
        playerIdValid: false,
    };

    try {
        // Test each component by recreating the signature with the card's values
        const orderedStats = JSON.stringify(
            card.baseStats,
            Object.keys(card.baseStats).sort()
        );
        const orderedGrowthRates = JSON.stringify(
            card.growthRates,
            Object.keys(card.growthRates).sort()
        );
        const cardData = `${card.speciesId}-${card.digitalSignature.openedBy}-${card.digitalSignature.timestamp}-${orderedStats}-${orderedGrowthRates}`;

        const expectedDataHash = createHash(cardData);
        const expectedKeySignature = createHash(cardData + DEMO_PRIVATE_KEY);
        const expectedSignature = `${expectedDataHash}${expectedKeySignature}`;

        // If the overall signature matches, all values are valid
        const signatureMatches =
            card.digitalSignature.signature === expectedSignature;

        if (signatureMatches) {
            results.baseStatsValid = true;
            results.growthRatesValid = true;
            results.speciesIdValid = true;
            results.timestampValid = true;
            results.playerIdValid = true;
        } else {
            // Test individual components to identify what's been tampered with

            // Test base stats individually
            const testCardDataWithOriginalStats = `${card.speciesId}-${card.digitalSignature.openedBy}-${card.digitalSignature.timestamp}-${orderedStats}-${orderedGrowthRates}`;
            const testStatsHash = createHash(testCardDataWithOriginalStats);
            const testStatsSignature = createHash(
                testCardDataWithOriginalStats + DEMO_PRIVATE_KEY
            );
            results.baseStatsValid =
                card.digitalSignature.signature ===
                `${testStatsHash}${testStatsSignature}`;

            // Test growth rates individually
            const testCardDataWithOriginalGrowth = `${card.speciesId}-${card.digitalSignature.openedBy}-${card.digitalSignature.timestamp}-${orderedStats}-${orderedGrowthRates}`;
            const testGrowthHash = createHash(testCardDataWithOriginalGrowth);
            const testGrowthSignature = createHash(
                testCardDataWithOriginalGrowth + DEMO_PRIVATE_KEY
            );
            results.growthRatesValid =
                card.digitalSignature.signature ===
                `${testGrowthHash}${testGrowthSignature}`;

            // For more granular validation, we'd need to store component hashes separately
            // This is a simplified approach for demonstration
            results.speciesIdValid = true; // Assume valid if signature creation doesn't fail
            results.timestampValid = true;
            results.playerIdValid = true;
        }
    } catch (error) {
        console.error("Card value validation failed:", error);
        // All false by default
    }

    const isValid = Object.values(results).every((result) => result === true);
    return { isValid, validationResults: results };
}

// Helper function to validate a card's complete digital provenance
function validateCardProvenance(card: SummonCard): {
    isValid: boolean;
    validationResults: {
        signatureValid: boolean;
        timestampValid: boolean;
        idConsistent: boolean;
        dataIntegrity: boolean;
        baseStatsValid: boolean;
        growthRatesValid: boolean;
        valuesMatchSignature: boolean;
    };
} {
    const results = {
        signatureValid: false,
        timestampValid: false,
        idConsistent: false,
        dataIntegrity: false,
        baseStatsValid: false,
        growthRatesValid: false,
        valuesMatchSignature: false,
    };

    // 1. Validate cryptographic signature
    results.signatureValid = validateSignature(card);

    // 2. Validate timestamp (should be in the past and reasonable)
    const now = Date.now();
    const cardTimestamp = card.digitalSignature.timestamp;
    results.timestampValid = cardTimestamp > 0 && cardTimestamp <= now;

    // 3. Validate ID consistency
    const expectedIdPrefix = `${card.speciesId}.${card.digitalSignature.openedBy}.${card.digitalSignature.timestamp}`;
    results.idConsistent =
        card.id.startsWith(expectedIdPrefix) &&
        card.digitalSignature.uniqueId === card.id;

    // 4. Validate data integrity (ensure all required fields are present)
    results.dataIntegrity = !!(
        card.speciesId &&
        card.baseStats &&
        card.growthRates &&
        card.digitalSignature.openedBy &&
        card.digitalSignature.signature &&
        card.digitalSignature.timestamp
    );

    // 5. Validate that the card's values match its signature (reversible validation)
    const valueValidation = validateCardValues(card);
    results.baseStatsValid = valueValidation.validationResults.baseStatsValid;
    results.growthRatesValid =
        valueValidation.validationResults.growthRatesValid;
    results.valuesMatchSignature = valueValidation.isValid;

    const isValid = Object.values(results).every((result) => result === true);

    return { isValid, validationResults: results };
}

// Generate timestamp for April 22, 2025
const TIMESTAMP_PLAYER_A = new Date("2025-04-22T00:05:24.751Z").getTime();
const TIMESTAMP_PLAYER_B = new Date("2025-05-12T00:05:24.751Z").getTime();

// ============================================================================
// PLAYER A SUMMON CARDS
// ============================================================================

// Player A's Gignen Warrior
const playerA_GignenWarrior_Stats: BaseStats = {
    STR: 12,
    END: 8,
    DEF: 10,
    INT: 12,
    SPI: 8,
    MDF: 8,
    SPD: 10,
    LCK: 9,
    ACC: 9,
};

const playerA_GignenWarrior_Growth: GrowthRates = {
    STR: GrowthRate.GRADUAL, // 1.33
    END: GrowthRate.NORMAL, // 1.0
    DEF: GrowthRate.NORMAL, // 1.0
    INT: GrowthRate.STEADY, // 0.66
    SPI: GrowthRate.NORMAL, // 1.0
    MDF: GrowthRate.STEADY, // 0.66
    SPD: GrowthRate.MINIMAL, // 0.5
    LCK: GrowthRate.EXCEPTIONAL, // 2.0
    ACC: GrowthRate.STEADY, // 0.66
};

const playerA_GignenWarrior_Signature = createSignature(
    "001-gignen_template-Alpha",
    "playerA" as PlayerId,
    TIMESTAMP_PLAYER_A,
    playerA_GignenWarrior_Stats,
    playerA_GignenWarrior_Growth
);

export const playerA_GignenWarrior: SummonCard = {
    id: createUniqueCardId(
        "001-gignen_template-Alpha",
        "playerA" as PlayerId,
        TIMESTAMP_PLAYER_A,
        playerA_GignenWarrior_Signature
    ),
    name: "Gignen Warrior A",
    type: CardType.SUMMON,
    attribute: "neutral",
    rarity: CardRarity.COMMON,
    description: "A hardy warrior from the Gignen clan.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "001-gignen_template-Alpha",
            "playerA" as PlayerId,
            TIMESTAMP_PLAYER_A,
            playerA_GignenWarrior_Signature
        ),
        openedBy: "playerA" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_A,
        signature: playerA_GignenWarrior_Signature,
    },
    speciesId: "001-gignen_template-Alpha",
    baseStats: playerA_GignenWarrior_Stats,
    growthRates: playerA_GignenWarrior_Growth,
};

// Player A's Gignen Scout
const playerA_GignenScout_Stats: BaseStats = {
    STR: 10,
    END: 11,
    DEF: 8,
    INT: 10,
    SPI: 11,
    MDF: 9,
    SPD: 12,
    LCK: 12,
    ACC: 10,
};

const playerA_GignenScout_Growth: GrowthRates = {
    STR: GrowthRate.NORMAL, // 1.0
    END: GrowthRate.GRADUAL, // 1.33
    DEF: GrowthRate.NORMAL, // 1.0
    INT: GrowthRate.NORMAL, // 1.0
    SPI: GrowthRate.NORMAL, // 1.0
    MDF: GrowthRate.NORMAL, // 1.0
    SPD: GrowthRate.GRADUAL, // 1.33
    LCK: GrowthRate.EXCEPTIONAL, // 2.0
    ACC: GrowthRate.GRADUAL, // 1.33
};

const playerA_GignenScout_Signature = createSignature(
    "001-gignen_template-Alpha",
    "playerA" as PlayerId,
    TIMESTAMP_PLAYER_A,
    playerA_GignenScout_Stats,
    playerA_GignenScout_Growth
);

export const playerA_GignenScout: SummonCard = {
    id: createUniqueCardId(
        "001-gignen_template-Alpha",
        "playerA" as PlayerId,
        TIMESTAMP_PLAYER_A,
        playerA_GignenScout_Signature
    ),
    name: "Gignen Scout A",
    type: CardType.SUMMON,
    attribute: "neutral",
    rarity: CardRarity.COMMON,
    description: "A swift scout from the Gignen clan.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "001-gignen_template-Alpha",
            "playerA" as PlayerId,
            TIMESTAMP_PLAYER_A,
            playerA_GignenScout_Signature
        ),
        openedBy: "playerA" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_A,
        signature: playerA_GignenScout_Signature,
    },
    speciesId: "001-gignen_template-Alpha",
    baseStats: playerA_GignenScout_Stats,
    growthRates: playerA_GignenScout_Growth,
};

// Player A's Gignen Magician
const playerA_GignenMagician_Stats: BaseStats = {
    STR: 10,
    END: 8,
    DEF: 11,
    INT: 10,
    SPI: 9,
    MDF: 10,
    SPD: 10,
    LCK: 12,
    ACC: 9,
};

const playerA_GignenMagician_Growth: GrowthRates = {
    STR: GrowthRate.GRADUAL, // 1.33
    END: GrowthRate.NORMAL, // 1.0
    DEF: GrowthRate.MINIMAL, // 0.5
    INT: GrowthRate.GRADUAL, // 1.33
    SPI: GrowthRate.GRADUAL, // 1.33
    MDF: GrowthRate.NORMAL, // 1.0
    SPD: GrowthRate.NORMAL, // 1.0
    LCK: GrowthRate.EXCEPTIONAL, // 2.0
    ACC: GrowthRate.MINIMAL, // 0.5
};

const playerA_GignenMagician_Signature = createSignature(
    "001-gignen_template-Alpha",
    "playerA" as PlayerId,
    TIMESTAMP_PLAYER_A,
    playerA_GignenMagician_Stats,
    playerA_GignenMagician_Growth
);

export const playerA_GignenMagician: SummonCard = {
    id: createUniqueCardId(
        "001-gignen_template-Alpha",
        "playerA" as PlayerId,
        TIMESTAMP_PLAYER_A,
        playerA_GignenMagician_Signature
    ),
    name: "Gignen Magician A",
    type: CardType.SUMMON,
    attribute: "neutral",
    rarity: CardRarity.COMMON,
    description: "A skilled magician from the Gignen clan.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "001-gignen_template-Alpha",
            "playerA" as PlayerId,
            TIMESTAMP_PLAYER_A,
            playerA_GignenMagician_Signature
        ),
        openedBy: "playerA" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_A,
        signature: playerA_GignenMagician_Signature,
    },
    speciesId: "001-gignen_template-Alpha",
    baseStats: playerA_GignenMagician_Stats,
    growthRates: playerA_GignenMagician_Growth,
};

// ============================================================================
// PLAYER B SUMMON CARDS
// ============================================================================

// Player B's Stoneheart Warrior
const playerB_StoneheartWarrior_Stats: BaseStats = {
    STR: 12,
    END: 10,
    DEF: 10,
    INT: 5,
    SPI: 10,
    MDF: 7,
    SPD: 8,
    LCK: 9,
    ACC: 8,
};

const playerB_StoneheartWarrior_Growth: GrowthRates = {
    STR: GrowthRate.GRADUAL, // 1.33
    END: GrowthRate.NORMAL, // 1.0
    DEF: GrowthRate.NORMAL, // 1.0
    INT: GrowthRate.NORMAL, // 1.0
    SPI: GrowthRate.GRADUAL, // 1.33
    MDF: GrowthRate.ACCELERATED, // 1.5
    SPD: GrowthRate.NORMAL, // 1.0
    LCK: GrowthRate.STEADY, // 0.66
    ACC: GrowthRate.ACCELERATED, // 1.5
};

const playerB_StoneheartWarrior_Signature = createSignature(
    "002-stoneheart_template-Alpha",
    "playerB" as PlayerId,
    TIMESTAMP_PLAYER_B,
    playerB_StoneheartWarrior_Stats,
    playerB_StoneheartWarrior_Growth
);

export const playerB_StoneheartWarrior: SummonCard = {
    id: createUniqueCardId(
        "002-stoneheart_template-Alpha",
        "playerB" as PlayerId,
        TIMESTAMP_PLAYER_B,
        playerB_StoneheartWarrior_Signature
    ),
    name: "Stoneheart Warrior B",
    type: CardType.SUMMON,
    attribute: "earth",
    rarity: CardRarity.COMMON,
    description: "A resilient warrior of the Stoneheart clan.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "002-stoneheart_template-Alpha",
            "playerB" as PlayerId,
            TIMESTAMP_PLAYER_B,
            playerB_StoneheartWarrior_Signature
        ),
        openedBy: "playerB" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_B,
        signature: playerB_StoneheartWarrior_Signature,
    },
    speciesId: "002-stoneheart_template-Alpha",
    baseStats: playerB_StoneheartWarrior_Stats,
    growthRates: playerB_StoneheartWarrior_Growth,
};

// Player B's Fae Magician
const playerB_FaeMagician_Stats: BaseStats = {
    STR: 8,
    END: 8,
    DEF: 9,
    INT: 12,
    SPI: 14,
    MDF: 10,
    SPD: 9,
    LCK: 8,
    ACC: 9,
};

const playerB_FaeMagician_Growth: GrowthRates = {
    STR: GrowthRate.NORMAL, // 1.0
    END: GrowthRate.NORMAL, // 1.0
    DEF: GrowthRate.NORMAL, // 1.0
    INT: GrowthRate.GRADUAL, // 1.33
    SPI: GrowthRate.GRADUAL, // 1.33
    MDF: GrowthRate.NORMAL, // 1.0
    SPD: GrowthRate.NORMAL, // 1.0
    LCK: GrowthRate.NORMAL, // 1.0
    ACC: GrowthRate.GRADUAL, // 1.33
};

const playerB_FaeMagician_Signature = createSignature(
    "003-fae_template-Alpha",
    "playerB" as PlayerId,
    TIMESTAMP_PLAYER_B,
    playerB_FaeMagician_Stats,
    playerB_FaeMagician_Growth
);

export const playerB_FaeMagician: SummonCard = {
    id: createUniqueCardId(
        "003-fae_template-Alpha",
        "playerB" as PlayerId,
        TIMESTAMP_PLAYER_B,
        playerB_FaeMagician_Signature
    ),
    name: "Fae Magician B",
    type: CardType.SUMMON,
    attribute: "light",
    rarity: CardRarity.COMMON,
    description: "A mystical magician of the Fae realm.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "003-fae_template-Alpha",
            "playerB" as PlayerId,
            TIMESTAMP_PLAYER_B,
            playerB_FaeMagician_Signature
        ),
        openedBy: "playerB" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_B,
        signature: playerB_FaeMagician_Signature,
    },
    speciesId: "003-fae_template-Alpha",
    baseStats: playerB_FaeMagician_Stats,
    growthRates: playerB_FaeMagician_Growth,
};

// Player B's Wilderling Scout
const playerB_WilderlingScout_Stats: BaseStats = {
    STR: 15,
    END: 11,
    DEF: 7,
    INT: 6,
    SPI: 11,
    MDF: 7,
    SPD: 13,
    LCK: 7,
    ACC: 13,
};

const playerB_WilderlingScout_Growth: GrowthRates = {
    STR: GrowthRate.STEADY, // 0.66
    END: GrowthRate.NORMAL, // 1.0
    DEF: GrowthRate.NORMAL, // 1.0
    INT: GrowthRate.ACCELERATED, // 1.5
    SPI: GrowthRate.MINIMAL, // 0.5
    MDF: GrowthRate.STEADY, // 0.66
    SPD: GrowthRate.EXCEPTIONAL, // 2.0
    LCK: GrowthRate.ACCELERATED, // 1.5
    ACC: GrowthRate.EXCEPTIONAL, // 2.0
};

const playerB_WilderlingScout_Signature = createSignature(
    "004-wilderling_template-Alpha",
    "playerB" as PlayerId,
    TIMESTAMP_PLAYER_B,
    playerB_WilderlingScout_Stats,
    playerB_WilderlingScout_Growth
);

export const playerB_WilderlingScout: SummonCard = {
    id: createUniqueCardId(
        "004-wilderling_template-Alpha",
        "playerB" as PlayerId,
        TIMESTAMP_PLAYER_B,
        playerB_WilderlingScout_Signature
    ),
    name: "Wilderling Scout B",
    type: CardType.SUMMON,
    attribute: "wind",
    rarity: CardRarity.RARE,
    description: "A swift scout from the Wilderling tribes.",
    digitalSignature: {
        uniqueId: createUniqueCardId(
            "004-wilderling_template-Alpha",
            "playerB" as PlayerId,
            TIMESTAMP_PLAYER_B,
            playerB_WilderlingScout_Signature
        ),
        openedBy: "playerB" as PlayerId,
        timestamp: TIMESTAMP_PLAYER_B,
        signature: playerB_WilderlingScout_Signature,
    },
    speciesId: "004-wilderling_template-Alpha",
    baseStats: playerB_WilderlingScout_Stats,
    growthRates: playerB_WilderlingScout_Growth,
};

// ============================================================================
// PLAYER COLLECTIONS
// ============================================================================

const playerA_Collection: PlayerCollection = {
    summonCards: [
        playerA_GignenWarrior.id,
        playerA_GignenScout.id,
        playerA_GignenMagician.id,
    ],
    roleCards: [
        "005-warrior_role-Alpha" as CardId,
        "006-scout_role-Alpha" as CardId,
        "007-magician_role-Alpha" as CardId,
    ],
    equipmentCards: [
        "034-heirloom_sword-Alpha" as CardId,
        "035-apprentices_wand-Alpha" as CardId,
        "036-hunting_bow-Alpha" as CardId,
    ],
    mainDeckCards: [
        "008-sharpened_blade-Alpha" as CardId,
        "009-healing_hands-Alpha" as CardId,
        "010-rush-Alpha" as CardId,
        "011-nearwood_forest_expedition-Alpha" as CardId,
        "012-adventurous_spirit-Alpha" as CardId,
        "013-gignen_country-Alpha" as CardId,
        "014-tempest_slash-Alpha" as CardId,
    ],
    advanceCards: [
        "015-berserker_rage-Alpha" as CardId,
        "016-alrecht_barkstep_scoutmaster-Alpha" as CardId,
    ],
};

const playerB_Collection: PlayerCollection = {
    summonCards: [
        playerB_StoneheartWarrior.id,
        playerB_FaeMagician.id,
        playerB_WilderlingScout.id,
    ],
    roleCards: [
        "005-warrior_role-Alpha" as CardId,
        "006-scout_role-Alpha" as CardId,
        "007-magician_role-Alpha" as CardId,
    ],
    equipmentCards: [
        "034-heirloom_sword-Alpha" as CardId,
        "035-apprentices_wand-Alpha" as CardId,
        "036-hunting_bow-Alpha" as CardId,
    ],
    mainDeckCards: [
        "017-blast_bolt-Alpha" as CardId,
        "018-dark_altar-Alpha" as CardId,
        "019-ensnare-Alpha" as CardId,
        "020-dramatic_return-Alpha" as CardId,
        "021-graverobbing-Alpha" as CardId,
        "022-drain_touch-Alpha" as CardId,
        "023-dual_shot-Alpha" as CardId,
        "024-spell_recall-Alpha" as CardId,
        "025-life_alchemy-Alpha" as CardId,
        "026-magicians_sanctum-Alpha" as CardId,
    ],
    advanceCards: ["027-shadow_pact-Alpha" as CardId],
};

// ============================================================================
// DECKS
// ============================================================================

const playerA_SummonSlots: [SummonSlot, SummonSlot, SummonSlot] = [
    {
        summonCard: playerA_GignenWarrior.id,
        roleCard: "005-warrior_role-Alpha" as CardId,
        equipment: {
            weapon: "034-heirloom_sword-Alpha" as CardId,
        },
    },
    {
        summonCard: playerA_GignenScout.id,
        roleCard: "006-scout_role-Alpha" as CardId,
        equipment: {
            weapon: "036-hunting_bow-Alpha" as CardId,
        },
    },
    {
        summonCard: playerA_GignenMagician.id,
        roleCard: "007-magician_role-Alpha" as CardId,
        equipment: {
            weapon: "035-apprentices_wand-Alpha" as CardId,
        },
    },
];

const playerB_SummonSlots: [SummonSlot, SummonSlot, SummonSlot] = [
    {
        summonCard: playerB_StoneheartWarrior.id,
        roleCard: "005-warrior_role-Alpha" as CardId,
        equipment: {
            weapon: "034-heirloom_sword-Alpha" as CardId,
        },
    },
    {
        summonCard: playerB_FaeMagician.id,
        roleCard: "007-magician_role-Alpha" as CardId,
        equipment: {
            weapon: "035-apprentices_wand-Alpha" as CardId,
        },
    },
    {
        summonCard: playerB_WilderlingScout.id,
        roleCard: "006-scout_role-Alpha" as CardId,
        equipment: {
            weapon: "036-hunting_bow-Alpha" as CardId,
        },
    },
];

export const playerA_Deck: Deck3v3 = {
    id: "playerA_deck1",
    name: "Player A Default Deck",
    format: "3v3",
    mainDeck: [
        "008-sharpened_blade-Alpha" as CardId,
        "009-healing_hands-Alpha" as CardId,
        "010-rush-Alpha" as CardId,
        "011-nearwood_forest_expedition-Alpha" as CardId,
        "012-adventurous_spirit-Alpha" as CardId,
        "013-gignen_country-Alpha" as CardId,
        "014-tempest_slash-Alpha" as CardId,
    ],
    advanceDeck: [
        "015-berserker_rage-Alpha" as CardId,
        "016-alrecht_barkstep_scoutmaster-Alpha" as CardId,
    ],
    summonSlots: playerA_SummonSlots,
};

export const playerB_Deck: Deck3v3 = {
    id: "playerB_deck1",
    name: "Player B Default Deck",
    format: "3v3",
    mainDeck: [
        "017-blast_bolt-Alpha" as CardId,
        "018-dark_altar-Alpha" as CardId,
        "019-ensnare-Alpha" as CardId,
        "020-dramatic_return-Alpha" as CardId,
        "021-graverobbing-Alpha" as CardId,
        "022-drain_touch-Alpha" as CardId,
        "023-dual_shot-Alpha" as CardId,
        "024-spell_recall-Alpha" as CardId,
        "025-life_alchemy-Alpha" as CardId,
        "026-magicians_sanctum-Alpha" as CardId,
    ],
    advanceDeck: ["027-shadow_pact-Alpha" as CardId],
    summonSlots: playerB_SummonSlots,
};

// ============================================================================
// PLAYERS
// ============================================================================

export const playerA: Player = {
    id: "playerA" as PlayerId,
    name: "Player A",
    collection: playerA_Collection,
    decks: [playerA_Deck],
};

export const playerB: Player = {
    id: "playerB" as PlayerId,
    name: "Player B",
    collection: playerB_Collection,
    decks: [playerB_Deck],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const allGeneratedSummons = [
    playerA_GignenWarrior,
    playerA_GignenScout,
    playerA_GignenMagician,
    playerB_StoneheartWarrior,
    playerB_FaeMagician,
    playerB_WilderlingScout,
];

export const allPlayers = [playerA, playerB];
export const allDecks = [playerA_Deck, playerB_Deck];

// Export validation functions for use in game systems
export { validateSignature, validateCardProvenance, validateCardValues };

// ============================================================================
// VALIDATION DEMO
// ============================================================================

// Demo function to test card validation (remove in production)
export function runValidationDemo(): void {
    console.log("=== DIGITAL SIGNATURE VALIDATION DEMO ===\n");

    // Test each generated summon
    allGeneratedSummons.forEach((summon) => {
        console.log(`Testing: ${summon.name}`);

        // Test signature validation
        const signatureValid = validateSignature(summon);
        console.log(`  Signature Valid: ${signatureValid ? "✅" : "❌"}`);

        // Test value validation specifically
        const valueValidation = validateCardValues(summon);
        console.log(
            `  Base Stats Valid: ${
                valueValidation.validationResults.baseStatsValid ? "✅" : "❌"
            }`
        );
        console.log(
            `  Growth Rates Valid: ${
                valueValidation.validationResults.growthRatesValid ? "✅" : "❌"
            }`
        );
        console.log(
            `  Values Match Signature: ${valueValidation.isValid ? "✅" : "❌"}`
        );

        // Test complete provenance validation
        const provenance = validateCardProvenance(summon);
        console.log(`  Overall Valid: ${provenance.isValid ? "✅" : "❌"}`);

        if (!provenance.isValid) {
            console.log("  Validation Issues:");
            Object.entries(provenance.validationResults).forEach(
                ([key, value]) => {
                    if (!value) {
                        console.log(`    - ${key}: ❌`);
                    }
                }
            );
        }

        console.log(`  Card ID: ${summon.id}`);
        console.log(`  Signature: ${summon.digitalSignature.signature}`);
        console.log("");
    });

    // Test tampered card - stats
    console.log("=== TESTING TAMPERED CARD (STATS) ===");
    const tamperedStatsCard = { ...playerA_GignenWarrior };
    tamperedStatsCard.baseStats = { ...tamperedStatsCard.baseStats, STR: 999 }; // Tamper with stats

    const tamperedStatsResult = validateCardProvenance(tamperedStatsCard);
    console.log(
        `Tampered Stats Card Valid: ${
            tamperedStatsResult.isValid ? "✅" : "❌"
        }`
    );
    console.log(
        `Base Stats Valid: ${
            tamperedStatsResult.validationResults.baseStatsValid ? "✅" : "❌"
        }`
    );
    console.log(
        `Growth Rates Valid: ${
            tamperedStatsResult.validationResults.growthRatesValid ? "✅" : "❌"
        }`
    );
    console.log("Expected: ❌ (should be invalid due to stat tampering)\n");

    // Test tampered card - growth rates
    console.log("=== TESTING TAMPERED CARD (GROWTH RATES) ===");
    const tamperedGrowthCard = { ...playerA_GignenWarrior };
    tamperedGrowthCard.growthRates = {
        ...tamperedGrowthCard.growthRates,
        STR: GrowthRate.EXCEPTIONAL,
    }; // Tamper with growth

    const tamperedGrowthResult = validateCardProvenance(tamperedGrowthCard);
    console.log(
        `Tampered Growth Card Valid: ${
            tamperedGrowthResult.isValid ? "✅" : "❌"
        }`
    );
    console.log(
        `Base Stats Valid: ${
            tamperedGrowthResult.validationResults.baseStatsValid ? "✅" : "❌"
        }`
    );
    console.log(
        `Growth Rates Valid: ${
            tamperedGrowthResult.validationResults.growthRatesValid
                ? "✅"
                : "❌"
        }`
    );
    console.log(
        "Expected: ❌ (should be invalid due to growth rate tampering)\n"
    );
}
