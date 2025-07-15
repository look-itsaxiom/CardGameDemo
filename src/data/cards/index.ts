// Main Cards Index
// This file provides access to all card data including global data and sets

// Import global data
// TODO: Import species, growth rates, etc. from global folder when implemented

// Import all sets
import {
    allSets,
    getAllCards,
    getCardById,
    getCardsByType,
} from "./sets/index";

// Re-export everything for easy access
export { allSets, getAllCards, getCardById, getCardsByType };

// Export specific sets for direct access
export { alphaSetCards, alphaSetInfo } from "./sets/alpha/index";

// TODO: Export global data when implemented
// export { allSpecies } from './global/species/index.js';
// export { growthRateProbabilities } from './global/growth-rate-probabilities.json';

// Main database object that will be compiled to JSON by the build script
export const cardDatabase = {
    sets: allSets,
    // TODO: Add global data here
    // species: allSpecies,
    // growthRates: growthRateProbabilities,
    metadata: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        totalCards: getAllCards().length,
    },
} as const;
