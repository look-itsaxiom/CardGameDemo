// Alpha Set - Main Index
// This file exports all cards from the Alpha set organized by type

import {
    alphaActionCards,
    alphaActionCardsList,
} from "./action-cards/index.js";

import {
    alphaBuildingCards,
    alphaBuildingCardsList,
} from "./building-cards/index.js";

import { alphaRoleCards, alphaRoleCardsList } from "./role-cards/index.js";

import { alphaQuestCards } from "./quest-cards/index.js";

import { uniqueCards } from "./unique-cards/index.js";

import * as weaponCards from "./weapon-cards/index.js";

import * as advanceCards from "./advance-cards/index.js";

import * as counterCards from "./counter-cards/index.js";

// Export all card collections by type
export { alphaActionCards, alphaActionCardsList };
export { alphaBuildingCards, alphaBuildingCardsList };
export { alphaRoleCards, alphaRoleCardsList };
export { alphaQuestCards };

// Export unique cards
export const alphaUniqueCards = uniqueCards;

// Export weapon cards
export const alphaWeaponCards = weaponCards;
export const alphaWeaponCardsList = [
    weaponCards.heirloomSword,
    weaponCards.apprenticesWand,
    weaponCards.huntingBow,
];

// Export advance cards
export const alphaAdvanceCards = advanceCards;
export const alphaAdvanceCardsList = [
    advanceCards.berserkerRage,
    advanceCards.knighthoodCeremony,
    advanceCards.oathOfLight,
    advanceCards.shadowPact,
    advanceCards.alrechtBarkstepScoutmaster,
];

// Export counter cards
export const alphaCounterCards = counterCards;
export const alphaCounterCardsList = [counterCards.graverobbing];

// Export a combined collection of all Alpha set cards
export const alphaSetCards = {
    actionCards: alphaActionCards,
    buildingCards: alphaBuildingCards,
    roleCards: alphaRoleCards,
    questCards: alphaQuestCards,
    uniqueCards: alphaUniqueCards,
    weaponCards: alphaWeaponCards,
    advanceCards: alphaAdvanceCards,
    counterCards: alphaCounterCards,
    // TODO: Add other card types as they are implemented
    // equipmentCards: alphaEquipmentCards,
} as const;

// Export metadata about the Alpha set
export const alphaSetInfo = {
    id: "alpha",
    name: "Alpha Set",
    description: "The first card set for the tactical RPG card game demo",
    releaseDate: "2024-01-01",
    totalCards: {
        action: alphaActionCardsList.length,
        building: alphaBuildingCardsList.length,
        role: alphaRoleCardsList.length,
        quest: alphaQuestCards.length,
        unique: alphaUniqueCards.length,
        weapon: alphaWeaponCardsList.length,
        advance: alphaAdvanceCardsList.length,
        counter: alphaCounterCardsList.length,
        // TODO: Add counts for other card types
        total:
            alphaActionCardsList.length +
            alphaBuildingCardsList.length +
            alphaRoleCardsList.length +
            alphaQuestCards.length +
            alphaUniqueCards.length +
            alphaWeaponCardsList.length +
            alphaAdvanceCardsList.length +
            alphaCounterCardsList.length,
    },
} as const;
