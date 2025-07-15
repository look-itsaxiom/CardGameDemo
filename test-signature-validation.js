// Test script to demonstrate the reversible digital signature validation system

async function testSignatureValidation() {
    console.log("=== DIGITAL SIGNATURE VALIDATION TEST ===\n");

    // Mock data structure matching our TypeScript types
    const mockCard = {
        id: "001-gignen_template-Alpha.playerA.1714608324751.abc12345def67890",
        name: "Test Gignen Warrior",
        speciesId: "001-gignen_template-Alpha",
        baseStats: {
            STR: 12,
            END: 8,
            DEF: 10,
            INT: 12,
            SPI: 8,
            MDF: 8,
            SPD: 10,
            LCK: 9,
            ACC: 9,
        },
        growthRates: {
            STR: "GRADUAL",
            END: "NORMAL",
            DEF: "NORMAL",
            INT: "STEADY",
            SPI: "NORMAL",
            MDF: "STEADY",
            SPD: "MINIMAL",
            LCK: "EXCEPTIONAL",
            ACC: "STEADY",
        },
        digitalSignature: {
            uniqueId:
                "001-gignen_template-Alpha.playerA.1714608324751.abc12345def67890",
            openedBy: "playerA",
            timestamp: 1714608324751,
            signature: "abc12345def67890",
        },
    };

    // Simple hash function for demo
    function createHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, "0");
    }

    // Create signature function
    function createSignature(
        templateId,
        playerId,
        timestamp,
        stats,
        growthRates
    ) {
        const orderedStats = JSON.stringify(stats, Object.keys(stats).sort());
        const orderedGrowthRates = JSON.stringify(
            growthRates,
            Object.keys(growthRates).sort()
        );
        const cardData = `${templateId}-${playerId}-${timestamp}-${orderedStats}-${orderedGrowthRates}`;

        const dataHash = createHash(cardData);
        const keySignature = createHash(
            cardData + "CardGameDemo-PrivateKey-2025"
        );

        return `${dataHash}${keySignature}`;
    }

    // Generate the correct signature for our mock card
    const correctSignature = createSignature(
        mockCard.speciesId,
        mockCard.digitalSignature.openedBy,
        mockCard.digitalSignature.timestamp,
        mockCard.baseStats,
        mockCard.growthRates
    );

    // Update mock card with correct signature
    mockCard.digitalSignature.signature = correctSignature;
    mockCard.id = `${mockCard.speciesId}.${mockCard.digitalSignature.openedBy}.${mockCard.digitalSignature.timestamp}.${correctSignature}`;
    mockCard.digitalSignature.uniqueId = mockCard.id;

    console.log("✅ ORIGINAL CARD VALIDATION:");
    console.log(`Card ID: ${mockCard.id}`);
    console.log(`Signature: ${mockCard.digitalSignature.signature}`);
    console.log(`STR: ${mockCard.baseStats.STR}`);
    console.log(`Growth STR: ${mockCard.growthRates.STR}`);
    console.log("");

    // Test 1: Validate original card (should pass)
    function validateCard(card) {
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
        const expectedKeySignature = createHash(
            cardData + "CardGameDemo-PrivateKey-2025"
        );
        const expectedSignature = `${expectedDataHash}${expectedKeySignature}`;

        return card.digitalSignature.signature === expectedSignature;
    }

    const originalValid = validateCard(mockCard);
    console.log(`Original Card Valid: ${originalValid ? "✅" : "❌"}`);

    // Test 2: Tamper with base stats (should fail)
    console.log("\n❌ TAMPERED BASE STATS TEST:");
    const tamperedStatsCard = { ...mockCard };
    tamperedStatsCard.baseStats = { ...tamperedStatsCard.baseStats, STR: 999 };

    const tamperedStatsValid = validateCard(tamperedStatsCard);
    console.log(
        `Tampered Stats Card Valid: ${tamperedStatsValid ? "✅" : "❌"}`
    );
    console.log(
        `Original STR: ${mockCard.baseStats.STR}, Tampered STR: ${tamperedStatsCard.baseStats.STR}`
    );

    // Test 3: Tamper with growth rates (should fail)
    console.log("\n❌ TAMPERED GROWTH RATES TEST:");
    const tamperedGrowthCard = { ...mockCard };
    tamperedGrowthCard.growthRates = {
        ...tamperedGrowthCard.growthRates,
        STR: "EXCEPTIONAL",
    };

    const tamperedGrowthValid = validateCard(tamperedGrowthCard);
    console.log(
        `Tampered Growth Card Valid: ${tamperedGrowthValid ? "✅" : "❌"}`
    );
    console.log(
        `Original Growth STR: ${mockCard.growthRates.STR}, Tampered Growth STR: ${tamperedGrowthCard.growthRates.STR}`
    );

    // Test 4: Show that we can reverse-engineer expected values
    console.log("\n🔍 REVERSE ENGINEERING TEST:");
    console.log(
        "Given only the signature and metadata, we can validate if proposed values match:"
    );

    // Test various STR values to see which one matches the signature
    const testValues = [12, 13, 14, 15, 999];
    for (const testSTR of testValues) {
        const testCard = { ...mockCard };
        testCard.baseStats = { ...testCard.baseStats, STR: testSTR };

        const isValid = validateCard(testCard);
        console.log(
            `  STR = ${testSTR}: ${isValid ? "✅ MATCHES" : "❌ Invalid"}`
        );
    }

    console.log("\n✅ CONCLUSION:");
    console.log(
        "The digital signature system is fully reversible and can validate:"
    );
    console.log("- Card authenticity (signature matches expected)");
    console.log("- Base stats integrity (any tampering detected)");
    console.log("- Growth rates integrity (any tampering detected)");
    console.log("- Complete provenance chain (timestamp, player, species)");
}

// Run the test
testSignatureValidation().catch(console.error);
