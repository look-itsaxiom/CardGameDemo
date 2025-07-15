// Sets Main Index
// This file exports all card sets and provides utilities for accessing card data

import { alphaSetCards, alphaSetInfo } from "./alpha/index.js";

// Export all sets
export { alphaSetCards, alphaSetInfo };

// Main registry of all sets
export const allSets = {
    alpha: {
        info: alphaSetInfo,
        cards: alphaSetCards,
    },
    // TODO: Add future sets here
} as const;

// Utility function to get all cards from all sets
export const getAllCards = () => {
    const allCards: any[] = [];

    // Add Alpha set cards
    allCards.push(...Object.values(alphaSetCards.actionCards));
    // TODO: Add other card types as they are implemented

    return allCards;
};

// Utility function to get a card by ID from any set
export const getCardById = (cardId: string) => {
    const allCards = getAllCards();
    return allCards.find((card) => card.id === cardId);
};

// Utility function to get all cards of a specific type
export const getCardsByType = (cardType: string) => {
    const allCards = getAllCards();
    return allCards.filter((card) => card.type === cardType);
};
