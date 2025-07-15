#!/usr/bin/env node

/**
 * Simple Alpha Set Card Test Runner
 *
 * Run this script to check implementation progress:
 * node scripts/tests/run-alpha-tests.js
 */

import { AlphaSetTestRunner } from "./alpha-set-test.js";

console.log("🎮 Alpha Set Card Implementation Test");
console.log("=====================================\n");

const testRunner = new AlphaSetTestRunner();

try {
    await testRunner.runAllTests();
    console.log("\n🎉 Testing complete!");
} catch (error) {
    console.error("\n💥 Test runner failed:", error);
    process.exit(1);
}
