/**
 * Card Database Service
 *
 * Loads and provides access to the real card database instead of stub data.
 * Integrates with the built card data structure.
 */

import { Card, RoleCard, EquipmentCard, SummonCard } from "../types/index.js";

// Import specific card sets
import { alphaSetCards } from "../data/cards/sets/alpha/index.js";

// Import player summon cards
import {
  playerA_GignenWarrior,
  playerA_GignenScout,
  playerA_GignenMagician,
  playerB_StoneheartWarrior,
  playerB_FaeMagician,
  playerB_WilderlingScout,
} from "../data/players/index.js";

export class CardDatabaseService {
  private cardDatabase: Record<string, Card> = {};
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the card database with real card data
   */
  private initialize(): void {
    if (this.initialized) return;

    // Load Alpha set cards
    this.loadAlphaSet();

    // TODO: Load other sets when available

    this.initialized = true;
    console.log(`Card database initialized with ${Object.keys(this.cardDatabase).length} cards`);
  }

  /**
   * Load all Alpha set cards into the database
   */
  private loadAlphaSet(): void {
    // Load Action Cards
    Object.values(alphaSetCards.actionCards).forEach((card) => {
      this.cardDatabase[card.id] = card;
    });

    // Load Role Cards
    Object.values(alphaSetCards.roleCards).forEach((card) => {
      this.cardDatabase[card.id] = card;
    });

    // Load Equipment Cards
    Object.values(alphaSetCards.weaponCards).forEach((card) => {
      this.cardDatabase[card.id] = card;
    });

    // Load player summon cards
    this.cardDatabase[playerA_GignenWarrior.id] = playerA_GignenWarrior;
    this.cardDatabase[playerA_GignenScout.id] = playerA_GignenScout;
    this.cardDatabase[playerA_GignenMagician.id] = playerA_GignenMagician;
    this.cardDatabase[playerB_StoneheartWarrior.id] = playerB_StoneheartWarrior;
    this.cardDatabase[playerB_FaeMagician.id] = playerB_FaeMagician;
    this.cardDatabase[playerB_WilderlingScout.id] = playerB_WilderlingScout;

    // TODO: Load other card types when implemented
    // Object.values(alphaSetCards.buildingCards).forEach(card => {
    //     this.cardDatabase[card.id] = card;
    // });

    console.log(`Loaded Alpha set: ${Object.keys(this.cardDatabase).length} cards`);
  }

  /**
   * Get a card by its ID
   */
  getCard(cardId: string): Card | undefined {
    return this.cardDatabase[cardId];
  }

  /**
   * Get a role card by its ID (with type safety)
   */
  getRoleCard(cardId: string): RoleCard | undefined {
    const card = this.getCard(cardId);
    if (card && card.type === "role") {
      return card as RoleCard;
    }
    return undefined;
  }

  /**
   * Get an equipment card by its ID (with type safety)
   */
  getEquipmentCard(cardId: string): EquipmentCard | undefined {
    const card = this.getCard(cardId);
    if (card && card.type === "equipment") {
      return card as EquipmentCard;
    }
    return undefined;
  }

  /**
   * Get a summon card by its ID (with type safety)
   */
  getSummonCard(cardId: string): SummonCard | undefined {
    const card = this.getCard(cardId);
    if (card && card.type === "summon") {
      return card as SummonCard;
    }
    return undefined;
  }

  /**
   * Get all cards in the database
   */
  getAllCards(): Record<string, Card> {
    return { ...this.cardDatabase };
  }

  /**
   * Get cards by type
   */
  getCardsByType(cardType: string): Card[] {
    return Object.values(this.cardDatabase).filter((card) => card.type === cardType);
  }

  /**
   * Check if a card exists in the database
   */
  hasCard(cardId: string): boolean {
    return cardId in this.cardDatabase;
  }
}

// Export singleton instance
export const cardDatabase = new CardDatabaseService();
