/**
 * Summon Unit Synthesis Service
 *
 * Handles the proper composition of Summon Units from:
 * 1. Summon Card (species, base stats, growth rates)
 * 2. Role Card (stat modifiers, tier information)
 * 3. Equipment Cards (weapon, offhand, armor, accessory bonuses)
 */

import { BaseStats, SummonUnit, Position, SummonCard, RoleCard, EquipmentCard, SummonSlot, GROWTH_RATE_VALUES } from "../types/index.js";
import { cardDatabase } from "./CardDatabaseService.js";
import { speciesDatabase } from "./SpeciesDatabaseService.js";

export class SummonUnitSynthesisService {
  /**
   * Create a Summon Unit from a properly configured summon slot
   */
  createSummonUnitFromSlot(summonSlot: SummonSlot, position: Position): SummonUnit | null {
    try {
      // 1. Load the Summon Card
      const summonCard = cardDatabase.getSummonCard(summonSlot.summonCard);
      if (!summonCard) {
        console.error(`Summon card not found: ${summonSlot.summonCard}`);
        return null;
      }

      // 2. Load the Role Card
      const roleCard = cardDatabase.getRoleCard(summonSlot.roleCard);
      if (!roleCard) {
        console.error(`Role card not found: ${summonSlot.roleCard}`);
        return null;
      }

      // 3. Load Equipment Cards
      const equipment = this.loadEquipment(summonSlot.equipment);

      // 4. Synthesize the unit stats
      const synthesizedStats = this.synthesizeStats(summonCard, roleCard, equipment);
      if (!synthesizedStats) {
        console.error(`Failed to synthesize stats for summon unit`);
        return null;
      }

      // 5. Create the final Summon Unit
      return this.assembleSummonUnit(summonCard, roleCard, equipment, synthesizedStats, position);
    } catch (error) {
      console.error(`Error creating summon unit from slot:`, error);
      return null;
    }
  }

  /**
   * Load equipment cards from equipment slot configuration
   */
  private loadEquipment(equipmentSlots: SummonSlot["equipment"]): {
    weapon?: EquipmentCard;
    offhand?: EquipmentCard;
    armor?: EquipmentCard;
    accessory?: EquipmentCard;
  } {
    const equipment: any = {};

    if (equipmentSlots.weapon) {
      equipment.weapon = cardDatabase.getEquipmentCard(equipmentSlots.weapon);
      if (!equipment.weapon) {
        console.warn(`Weapon card not found: ${equipmentSlots.weapon}`);
      }
    }

    if (equipmentSlots.offhand) {
      equipment.offhand = cardDatabase.getEquipmentCard(equipmentSlots.offhand);
      if (!equipment.offhand) {
        console.warn(`Offhand card not found: ${equipmentSlots.offhand}`);
      }
    }

    if (equipmentSlots.armor) {
      equipment.armor = cardDatabase.getEquipmentCard(equipmentSlots.armor);
      if (!equipment.armor) {
        console.warn(`Armor card not found: ${equipmentSlots.armor}`);
      }
    }

    if (equipmentSlots.accessory) {
      equipment.accessory = cardDatabase.getEquipmentCard(equipmentSlots.accessory);
      if (!equipment.accessory) {
        console.warn(`Accessory card not found: ${equipmentSlots.accessory}`);
      }
    }

    return equipment;
  }

  /**
   * Synthesize final stats from all components using proper formulas
   * Formula: (BaseStats + LevelGrowth) × RoleModifiers + EquipmentBonuses
   */
  private synthesizeStats(
    summonCard: SummonCard,
    roleCard: RoleCard,
    equipment: Record<string, EquipmentCard | undefined>
  ): { currentStats: BaseStats; maxHP: number; totalMovement: number } | null {
    // Step 1: Get base stats from summon card species
    const species = speciesDatabase.getSpecies(summonCard.speciesId);
    if (!species) {
      console.error(`Species not found: ${summonCard.speciesId}`);
      return null;
    }

    // For now, use the summon card's specific base stats
    // In production, these would be the generated stats when the card was opened
    const baseStats = summonCard.baseStats;
    const growthRates = summonCard.growthRates;
    const level = 5; // Starting level

    // Step 2: Apply level growth
    const levelBonusStats: BaseStats = {
      STR: Math.floor(level * GROWTH_RATE_VALUES[growthRates.STR]),
      END: Math.floor(level * GROWTH_RATE_VALUES[growthRates.END]),
      DEF: Math.floor(level * GROWTH_RATE_VALUES[growthRates.DEF]),
      INT: Math.floor(level * GROWTH_RATE_VALUES[growthRates.INT]),
      SPI: Math.floor(level * GROWTH_RATE_VALUES[growthRates.SPI]),
      MDF: Math.floor(level * GROWTH_RATE_VALUES[growthRates.MDF]),
      SPD: Math.floor(level * GROWTH_RATE_VALUES[growthRates.SPD]),
      LCK: Math.floor(level * GROWTH_RATE_VALUES[growthRates.LCK]),
      ACC: Math.floor(level * GROWTH_RATE_VALUES[growthRates.ACC]),
    };

    const leveledStats: BaseStats = {
      STR: baseStats.STR + levelBonusStats.STR,
      END: baseStats.END + levelBonusStats.END,
      DEF: baseStats.DEF + levelBonusStats.DEF,
      INT: baseStats.INT + levelBonusStats.INT,
      SPI: baseStats.SPI + levelBonusStats.SPI,
      MDF: baseStats.MDF + levelBonusStats.MDF,
      SPD: baseStats.SPD + levelBonusStats.SPD,
      LCK: baseStats.LCK + levelBonusStats.LCK,
      ACC: baseStats.ACC + levelBonusStats.ACC,
    };

    // Step 3: Apply role modifiers
    const roleModifiedStats: BaseStats = {
      STR: Math.floor(leveledStats.STR * (roleCard.statModifiers?.STR || 1.0)),
      END: Math.floor(leveledStats.END * (roleCard.statModifiers?.END || 1.0)),
      DEF: Math.floor(leveledStats.DEF * (roleCard.statModifiers?.DEF || 1.0)),
      INT: Math.floor(leveledStats.INT * (roleCard.statModifiers?.INT || 1.0)),
      SPI: Math.floor(leveledStats.SPI * (roleCard.statModifiers?.SPI || 1.0)),
      MDF: Math.floor(leveledStats.MDF * (roleCard.statModifiers?.MDF || 1.0)),
      SPD: Math.floor(leveledStats.SPD * (roleCard.statModifiers?.SPD || 1.0)),
      LCK: Math.floor(leveledStats.LCK * (roleCard.statModifiers?.LCK || 1.0)),
      ACC: Math.floor(leveledStats.ACC * (roleCard.statModifiers?.ACC || 1.0)),
    };

    // Step 4: Apply equipment bonuses
    const finalStats = this.applyEquipmentBonuses(roleModifiedStats, equipment);

    // Step 5: Calculate derived stats
    const maxHP = 50 + Math.floor(Math.pow(finalStats.END, 1.5));
    const totalMovement = 2 + Math.floor((finalStats.SPD - 10) / 5);

    return {
      currentStats: finalStats,
      maxHP,
      totalMovement,
    };
  }

  /**
   * Apply equipment stat bonuses to current stats
   */
  private applyEquipmentBonuses(baseStats: BaseStats, equipment: Record<string, EquipmentCard | undefined>): BaseStats {
    let finalStats = { ...baseStats };

    // Apply bonuses from each equipment piece
    Object.values(equipment).forEach((equipmentCard) => {
      if (equipmentCard && equipmentCard.statBonuses) {
        Object.entries(equipmentCard.statBonuses).forEach(([stat, bonus]) => {
          if (stat in finalStats && typeof bonus === "number") {
            // Equipment bonuses are multiplicative
            (finalStats as any)[stat] = Math.floor((finalStats as any)[stat] * bonus);
          }
        });
      }
    });

    return finalStats;
  }

  /**
   * Assemble the final Summon Unit with all components
   */
  private assembleSummonUnit(
    summonCard: SummonCard,
    roleCard: RoleCard,
    equipment: Record<string, EquipmentCard | undefined>,
    synthesizedStats: { currentStats: BaseStats; maxHP: number; totalMovement: number },
    position: Position
  ): SummonUnit {
    const unitId = `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: unitId,
      baseCard: summonCard.id,
      currentRole: roleCard.id,
      currentEquipment: {
        weapon: equipment.weapon?.id || undefined,
        offhand: equipment.offhand?.id || undefined,
        armor: equipment.armor?.id || undefined,
        accessory: equipment.accessory?.id || undefined,
      },
      level: 5,
      currentStats: synthesizedStats.currentStats,
      maxHP: synthesizedStats.maxHP,
      currentHP: synthesizedStats.maxHP,
      position,
      statusEffects: [],
      maxAttacks: 1,
      attacksUsed: 0,
      totalMovement: synthesizedStats.totalMovement,
      movementUsed: 0,
      completedQuests: [],
      questParticipations: [],
    };
  }

  /**
   * Get weapon data for a summon unit (used for combat calculations)
   */
  getWeaponData(summonUnit: SummonUnit): EquipmentCard | null {
    if (!summonUnit.currentEquipment.weapon) {
      return null;
    }

    return cardDatabase.getEquipmentCard(summonUnit.currentEquipment.weapon) || null;
  }

  /**
   * Calculate weapon range for a summon unit
   */
  getWeaponRange(summonUnit: SummonUnit): number {
    const weapon = this.getWeaponData(summonUnit);
    return weapon?.range || 1; // Default to 1 (adjacent) if no weapon
  }

  /**
   * Get weapon power for damage calculations
   */
  getWeaponPower(summonUnit: SummonUnit): number {
    const weapon = this.getWeaponData(summonUnit);
    return weapon?.power || 0; // Default to 0 if no weapon
  }
}

// Export singleton instance
export const summonUnitSynthesis = new SummonUnitSynthesisService();
