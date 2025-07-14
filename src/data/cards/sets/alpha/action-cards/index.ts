// Alpha Set - Action Cards Index
// This file exports all action cards from the Alpha set

import { adventurousSpirit } from "./adventurous-spirit";
import { blastBolt } from "./blast-bolt";
import { drainTouch } from "./drain-touch";
import { dualShot } from "./dual-shot";
import { ensnare } from "./ensnare";
import { lifeAlchemy } from "./life-alchemy";
import { sharpenedBlade } from "./sharpened-blade";
import { healingHands } from "./healing-hands";
import { rush } from "./rush";
import { spellRecall } from "./spell-recall";

export {
    adventurousSpirit,
    blastBolt,
    drainTouch,
    dualShot,
    ensnare,
    lifeAlchemy,
    sharpenedBlade,
    healingHands,
    rush,
    spellRecall,
};

// Export all action cards as a collection for easier access
export const alphaActionCards = {
    "001-blast_bolt-Alpha": blastBolt,
    "005-sharpen_blade-Alpha": sharpenedBlade,
    "006-healing_hands-Alpha": healingHands,
    "009-rush-Alpha": rush,
    "011-ensnare-Alpha": ensnare,
    "012-drain_touch-Alpha": drainTouch,
    "013-adventurous_spirit-Alpha": adventurousSpirit,
    "015-spell_recall-Alpha": spellRecall,
    "016-life_alchemy-Alpha": lifeAlchemy,
    "017-dual_shot-Alpha": dualShot,
} as const;

// Export just the card objects as an array
export const alphaActionCardsList = [
    adventurousSpirit,
    blastBolt,
    drainTouch,
    dualShot,
    ensnare,
    lifeAlchemy,
    sharpenedBlade,
    healingHands,
    rush,
    spellRecall,
] as const;
