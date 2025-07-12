// Alpha Set - Action Cards Index
// This file exports all action cards from the Alpha set

import { blastBolt } from "./blast-bolt";
import { sharpenedBlade } from "./sharpened-blade";
import { healingHands } from "./healing-hands";

export { blastBolt, sharpenedBlade, healingHands };

// Export all action cards as a collection for easier access
export const alphaActionCards = {
    "001-blast_bolt-Alpha": blastBolt,
    "005-sharpen_blade-Alpha": sharpenedBlade,
    "006-healing_hands-Alpha": healingHands,
} as const;

// Export just the card objects as an array
export const alphaActionCardsList = [
    blastBolt,
    sharpenedBlade,
    healingHands,
] as const;
