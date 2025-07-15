// Alpha Set - Role Cards Index
// This file exports all role cards from the Alpha set

// Import individual role cards
import { warrior } from "./warrior.js";
import { scout } from "./scout.js";
import { magician } from "./magician.js";
import { berserker } from "./berserker.js";
import { knight } from "./knight.js";
import { rogue } from "./rogue.js";
import { explorer } from "./explorer.js";
import { elementMage } from "./element-mage.js";
import { lightMage } from "./light-mage.js";
import { darkMage } from "./dark-mage.js";
import { paladin } from "./paladin.js";
import { sentinel } from "./sentinel.js";
import { warlock } from "./warlock.js";

// Export individual roles
export {
    warrior,
    scout,
    magician,
    berserker,
    knight,
    rogue,
    explorer,
    elementMage,
    lightMage,
    darkMage,
    paladin,
    sentinel,
    warlock,
};

// Export organized by tier
export const tier1Roles = {
    "alpha-020-warrior-role": warrior,
    "alpha-022-scout-role": scout,
    "alpha-021-magician-role": magician,
} as const;

export const tier2Roles = {
    "alpha-023-berserker-role": berserker,
    "alpha-024-knight-role": knight,
    "alpha-028-rogue-role": rogue,
    "alpha-025-explorer-role": explorer,
    "alpha-026-element-mage-role": elementMage,
    "alpha-027-light-mage-role": lightMage,
    "alpha-029-dark-mage-role": darkMage,
} as const;

export const tier3Roles = {
    "alpha-031-paladin-role": paladin,
    "alpha-030-sentinel-role": sentinel,
    "alpha-032-warlock-role": warlock,
} as const;

// Export organized by family
export const warriorFamilyRoles = {
    "alpha-020-warrior-role": warrior,
    "alpha-023-berserker-role": berserker,
    "alpha-024-knight-role": knight,
    "alpha-031-paladin-role": paladin,
    "alpha-030-sentinel-role": sentinel,
} as const;

export const scoutFamilyRoles = {
    "alpha-022-scout-role": scout,
    "alpha-028-rogue-role": rogue,
    "alpha-025-explorer-role": explorer,
} as const;

export const magicianFamilyRoles = {
    "alpha-021-magician-role": magician,
    "alpha-026-element-mage-role": elementMage,
    "alpha-027-light-mage-role": lightMage,
    "alpha-029-dark-mage-role": darkMage,
    "alpha-032-warlock-role": warlock,
    "alpha-031-paladin-role": paladin, // Paladin is both warrior and magician family
} as const;

// Export all role cards as a collection
export const alphaRoleCards = {
    ...tier1Roles,
    ...tier2Roles,
    ...tier3Roles,
} as const;

// Export just the card objects as an array
export const alphaRoleCardsList = [
    warrior,
    scout,
    magician,
    berserker,
    knight,
    rogue,
    explorer,
    elementMage,
    lightMage,
    darkMage,
    paladin,
    sentinel,
    warlock,
] as const;
