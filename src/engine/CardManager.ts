/**
 * Card Manager - Handles card operations like drawing, deck management
 *
 * Single Responsibility: Manages card-related operations and deck manipulation
 */

import { PlayerZones, Card, SummonUnit, BaseStats, GrowthRates, GROWTH_RATE_VALUES } from "../types/index.js";
import { SummonUnitSynthesisService } from "./SummonUnitSynthesisService.js";

export class CardManager {
  constructor(private cardDatabase: Record<string, Card>) {}

  /**
   * Calculate current stats for a summon unit based on level and growth rates
   */
  calculateCurrentStats(baseStats: BaseStats, growthRates: GrowthRates, level: number): BaseStats {
    const currentStats: BaseStats = { ...baseStats };

    // Apply growth rate progression for each stat
    Object.keys(baseStats).forEach((statKey) => {
      const stat = statKey as keyof BaseStats;
      const growthRate = growthRates[stat];
      const growthValue = GROWTH_RATE_VALUES[growthRate];

      // Formula: BaseStat + Floor(Level * GrowthRate)
      const statIncrease = Math.floor(level * growthValue);
      currentStats[stat] = baseStats[stat] + statIncrease;
    });

    return currentStats;
  }

  /**
   * Calculate max HP based on END stat
   */
  calculateMaxHP(endStat: number): number {
    return 50 + Math.floor(Math.pow(endStat, 1.5));
  }

  /**
   * Calculate movement speed from SPD stat
   */
  calculateMovementSpeed(spdStat: number): number {
    return 2 + Math.floor((spdStat - 10) / 5);
  }

  /**
   * Update summon unit stats when leveling up
   */
  recalculateSummonStats(unit: SummonUnit, baseStats: BaseStats, growthRates: GrowthRates): void {
    const newStats = this.calculateCurrentStats(baseStats, growthRates, unit.level);
    const oldMaxHP = unit.maxHP;
    const newMaxHP = this.calculateMaxHP(newStats.END);

    // Update stats
    unit.currentStats = newStats;
    unit.maxHP = newMaxHP;
    unit.totalMovement = this.calculateMovementSpeed(newStats.SPD);

    // Scale current HP proportionally (so partial damage is maintained)
    if (oldMaxHP > 0) {
      const hpRatio = unit.currentHP / oldMaxHP;
      unit.currentHP = Math.round(newMaxHP * hpRatio);
    } else {
      unit.currentHP = newMaxHP;
    }
  }

  /**
   * Draw cards from main deck to hand
   */
  drawCards(playerZones: PlayerZones, count: number): number {
    let cardsDrawn = 0;

    for (let i = 0; i < count; i++) {
      // Try to draw from main deck
      if (playerZones.mainDeck.length > 0) {
        const drawn = playerZones.mainDeck.pop();
        if (drawn) {
          playerZones.hand.push(drawn);
          cardsDrawn++;
        }
      } else if (playerZones.rechargePile.length > 0) {
        // Shuffle recharge pile into main deck
        playerZones.mainDeck.push(...playerZones.rechargePile);
        playerZones.rechargePile.length = 0;
        this.shuffleDeck(playerZones.mainDeck);

        // Try drawing again
        if (playerZones.mainDeck.length > 0) {
          const drawn = playerZones.mainDeck.pop();
          if (drawn) {
            playerZones.hand.push(drawn);
            cardsDrawn++;
          }
        }
      } else {
        // No more cards to draw
        break;
      }
    }

    return cardsDrawn;
  }

  /**
   * Get card from database
   */
  getCard(cardId: string): Card | undefined {
    console.log(`CardManager.getCard: Looking for card ${cardId}`);
    
    // First check the main card database
    const dbCard = this.cardDatabase[cardId];
    if (dbCard) {
      console.log(`CardManager.getCard: Found card in database: ${dbCard.name}`);
      return dbCard;
    }
    
    console.log(`CardManager.getCard: Card not in database, checking synthesis service`);
    
    // Check if this is a synthesized summon slot card
    try {
      const synthesisService = SummonUnitSynthesisService.getInstance();
      console.log(`CardManager.getCard: Got synthesis service`);
      
      const summonSlot = synthesisService.getSummonSlotByCardId(cardId);
      console.log(`CardManager.getCard: Got summon slot:`, summonSlot);
      
      if (summonSlot) {
        // Create a temporary card representation for the summon slot
        const summonCard = this.cardDatabase[summonSlot.summonCard];
        const roleCard = this.cardDatabase[summonSlot.roleCard];
        
        console.log(`CardManager.getCard: Found summon card: ${summonCard?.name}, role card: ${roleCard?.name}`);
        
        if (summonCard && roleCard) {
          // Create a composite card name that includes the role
          const compositeCard = {
            id: cardId,
            name: `${summonCard.name} (${roleCard.name})`,
            type: 'summon',
            set: summonCard.set,
            rarity: summonCard.rarity,
            cost: summonCard.cost || 0,
            // Include additional info for display
            ...summonCard,
            roleCard: roleCard.name,
            isSlotCard: true
          } as Card;
          
          console.log(`CardManager.getCard: Created composite card:`, compositeCard);
          return compositeCard;
        }
      }
    } catch (error) {
      console.log(`CardManager.getCard: Error in synthesis service:`, error);
    }
    
    console.log(`CardManager.getCard: Card not found anywhere`);
    return undefined;
  }

  /**
   * Validate card is in player's hand
   */
  validateCardInHand(playerZones: PlayerZones, cardId: string): number {
    return playerZones.hand.indexOf(cardId);
  }

  /**
   * Remove card from hand
   */
  removeCardFromHand(playerZones: PlayerZones, cardIndex: number): string | undefined {
    return playerZones.hand.splice(cardIndex, 1)[0];
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleDeck(deck: string[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}
