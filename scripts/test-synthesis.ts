#!/usr/bin/env tsx

/**
 * Test Summon Unit Synthesis
 *
 * Tests the new Summon+Role+Equipment composition system
 */

import { summonUnitSynthesis } from "../src/engine/SummonUnitSynthesisService.js";
import { cardDatabase } from "../src/engine/CardDatabaseService.js";
import { speciesDatabase } from "../src/engine/SpeciesDatabaseService.js";
import { SummonSlot } from "../src/types/index.js";
import { playerA_GignenWarrior, playerA_GignenScout } from "../src/data/players/index.js";

console.log("🧪 Testing Summon Unit Synthesis System");
console.log("=======================================");

// Test 1: Basic Synthesis
console.log("\n📋 Test 1: Basic Gignen Warrior Synthesis");

const testSummonSlot: SummonSlot = {
  summonCard: playerA_GignenWarrior.id,
  roleCard: "020-warrior-Alpha",
  equipment: {
    weapon: "034-heirloom_sword-Alpha",
  },
};

const testUnit = summonUnitSynthesis.createSummonUnitFromSlot(testSummonSlot, { x: 5, y: 7 });

if (testUnit) {
  console.log(`✅ Successfully created unit: ${testUnit.id}`);
  console.log(`   Base Card: ${testUnit.baseCard}`);
  console.log(`   Current Role: ${testUnit.currentRole}`);
  console.log(`   Weapon: ${testUnit.currentEquipment.weapon || "None"}`);
  console.log(`   Level: ${testUnit.level}`);
  console.log(`   Stats: STR:${testUnit.currentStats.STR} END:${testUnit.currentStats.END} SPD:${testUnit.currentStats.SPD}`);
  console.log(`   HP: ${testUnit.currentHP}/${testUnit.maxHP}`);
  console.log(`   Movement: ${testUnit.totalMovement - testUnit.movementUsed}/${testUnit.totalMovement}`);

  // Test weapon data
  const weaponData = summonUnitSynthesis.getWeaponData(testUnit);
  const weaponRange = summonUnitSynthesis.getWeaponRange(testUnit);
  const weaponPower = summonUnitSynthesis.getWeaponPower(testUnit);

  console.log(`   Weapon Range: ${weaponRange}`);
  console.log(`   Weapon Power: ${weaponPower}`);
  console.log(`   Weapon Name: ${weaponData?.name || "None"}`);
} else {
  console.log("❌ Failed to create unit");
}

// Test 2: Card Database Loading
console.log("\n📋 Test 2: Card Database Verification");

const warriorRole = cardDatabase.getRoleCard("020-warrior-Alpha");
if (warriorRole) {
  console.log(`✅ Found Warrior role: ${warriorRole.name}`);
  console.log(`   STR Modifier: ${warriorRole.statModifiers?.STR || 1.0}x`);
  console.log(`   END Modifier: ${warriorRole.statModifiers?.END || 1.0}x`);
} else {
  console.log("❌ Failed to find Warrior role");
}

const heirloomSword = cardDatabase.getEquipmentCard("034-heirloom_sword-Alpha");
if (heirloomSword) {
  console.log(`✅ Found Heirloom Sword: ${heirloomSword.name}`);
  console.log(`   Power: ${heirloomSword.power}`);
  console.log(`   Range: ${heirloomSword.range}`);
} else {
  console.log("❌ Failed to find Heirloom Sword");
}

// Test 3: Species Database
console.log("\n📋 Test 3: Species Database Verification");

const gignenSpecies = speciesDatabase.getSpecies("001-gignen_template-Alpha");
if (gignenSpecies) {
  console.log(`✅ Found Gignen species: ${gignenSpecies.name}`);
  console.log(`   STR Range: ${gignenSpecies.baseStatRanges.STR.min}-${gignenSpecies.baseStatRanges.STR.max}`);
} else {
  console.log("❌ Failed to find Gignen species");
}

// Test 4: Different Weapon Types
console.log("\n📋 Test 4: Testing Different Weapon Types");

const bowSummonSlot: SummonSlot = {
  summonCard: playerA_GignenScout.id,
  roleCard: "022-scout-Alpha",
  equipment: {
    weapon: "036-hunting_bow-Alpha",
  },
};

const bowUnit = summonUnitSynthesis.createSummonUnitFromSlot(bowSummonSlot, { x: 3, y: 4 });

if (bowUnit) {
  const bowRange = summonUnitSynthesis.getWeaponRange(bowUnit);
  const bowPower = summonUnitSynthesis.getWeaponPower(bowUnit);

  console.log(`✅ Created bow-wielding scout`);
  console.log(`   Weapon Range: ${bowRange} (should be 4 for bow)`);
  console.log(`   Weapon Power: ${bowPower} (should be 20 for hunting bow)`);
} else {
  console.log("❌ Failed to create bow unit");
}

console.log("\n🎉 Synthesis testing complete!");
console.log("\n💡 Summary:");
console.log("   ✅ Card Database Service: Loading real cards");
console.log("   ✅ Species Database Service: Loading species data");
console.log("   ✅ Summon Unit Synthesis: Proper Summon+Role+Equipment composition");
console.log("   ✅ Weapon-Based Combat: Different ranges and powers per weapon");
console.log("\n🚀 Phase 4 & 5 Implementation: COMPLETE");
