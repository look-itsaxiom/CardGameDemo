// Alpha Set - Main Index
// This file exports all cards from the Alpha set organized by type

import {
    alphaActionCards,
    alphaActionCardsList,
} from "./action-cards/index.js";

import { alphaRoleCards, alphaRoleCardsList } from "./role-cards/index.js";

// Export all card collections by type
export { alphaActionCards, alphaActionCardsList };
export { alphaRoleCards, alphaRoleCardsList };

// Export a combined collection of all Alpha set cards
export const alphaSetCards = {
    actionCards: alphaActionCards,
    roleCards: alphaRoleCards,
    // TODO: Add other card types as they are implemented
    // equipmentCards: alphaEquipmentCards,
    // buildingCards: alphaBuildingCards,
    // etc.
} as const;

// Export metadata about the Alpha set
export const alphaSetInfo = {
    id: "alpha",
    name: "Alpha Set",
    description: "The first card set for the tactical RPG card game demo",
    releaseDate: "2024-01-01",
    totalCards: {
        action: alphaActionCardsList.length,
        role: alphaRoleCardsList.length,
        // TODO: Add counts for other card types
        total: alphaActionCardsList.length + alphaRoleCardsList.length,
    },
} as const;
