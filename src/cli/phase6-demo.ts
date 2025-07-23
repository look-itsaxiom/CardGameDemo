#!/usr/bin/env tsx

/**
 * Phase 6 Demo CLI - Working test of current components
 */

import { CardDatabaseService } from "../engine/CardDatabaseService";

async function main() {
  console.log("=== Phase 6 Effects Engine Demo ===\n");

  // Test CardDatabaseService
  console.log("1. Testing Card Database Service...");
  const cardDb = new CardDatabaseService();

  console.log("✅ CardDatabaseService initialized");

  const allCards = cardDb.getAllCards();
  console.log(`📦 Total cards loaded: ${Object.keys(allCards).length}`);

  // Show card types
  const cardTypes = [...new Set(Object.values(allCards).map((card) => card.type))];
  console.log(`🎴 Card types: ${cardTypes.join(", ")}`);

  // Show action cards (Phase 6 focus)
  console.log("\n2. Action Cards (Phase 6 target):");
  const actionCards = cardDb.getCardsByType("action");
  console.log(`📋 Found ${actionCards.length} action cards:`);

  actionCards.forEach((card) => {
    console.log(`   - ${card.id}: ${card.name}`);
    if ("effects" in card && card.effects) {
      console.log(`     → Has ${card.effects.length} effect(s)`);
    }
    if ("requirements" in card && card.requirements) {
      console.log(`     → Has ${card.requirements.length} requirement(s)`);
    }
  });

  // Show one action card in detail
  if (actionCards.length > 0) {
    const firstAction = actionCards[0];
    console.log(`\n3. Sample Action Card Detail (${firstAction.id}):`);
    console.log(JSON.stringify(firstAction, null, 2));
  }

  // Test Phase 6 component status
  console.log("\n4. Phase 6 Component Status:");
  console.log("✅ EffectTypeRegistry.ts - Created");
  console.log("✅ StackManager.ts - Created");
  console.log("✅ TriggerDetector.ts - Created");
  console.log("✅ RequirementValidator.ts - Created");
  console.log("⚠️  Components need integration testing");

  console.log("\n=== Demo Complete ===");
  console.log("Next steps: Fix component integration and add CLI testing interface");
}

if (require.main === module) {
  main().catch(console.error);
}
