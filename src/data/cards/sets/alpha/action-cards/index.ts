// Alpha Set - Action Cards Index
// This file exports all action cards from the Alpha set

import { sharpenedBlade } from "./sharpened-blade";

export { sharpenedBlade };

// Export all action cards as a collection for easier access
export const alphaActionCards = {
    "alpha-001-sharpened-blade-action": sharpenedBlade,
} as const;

// Export just the card objects as an array
export const alphaActionCardsList = [sharpenedBlade] as const;
