import { ICard, IPlayableCard, ISummonSlotCard, MainDeckCard } from "../types";

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param deck The array to shuffle.
 * @returns The shuffled array (same reference as input).
 */
export function shuffleDeck<T>(deck: T[]): T[] {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/**
 * Checks if a card is a main deck card.
 * @param card The card to check.
 * @returns True if the card is a main deck card, false otherwise.
 */
export function isMainDeckCard(card: IPlayableCard): card is MainDeckCard {
    return card.card_type === "action" || card.card_type === "counter" || card.card_type === "quest" || card.card_type === "building";
}

/**
 * Generates a unique instance ID for a card.
 * @param card The card to generate an ID for.
 * @returns A unique string ID for the card.
 */
export function generateInstanceId(card_id: string): string {
    return `${card_id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
