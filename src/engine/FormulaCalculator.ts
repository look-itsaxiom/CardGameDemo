/**
 * Formula Calculator
 * 
 * Handles all game formula calculations including damage, healing, stat calculations,
 * hit chances, critical hits, and growth rates. This is the core mathematical
 * engine that interprets formula strings and applies them to game state.
 */

import { 
  GrowthRateType, 
  CalculationResult, 
  FormulaContext,
  SummonUnit,
  DamageType
} from '@/types';

export class FormulaCalculator {
  /**
   * Calculate final stat value for a summon unit at a given level
   * Formula: (BaseStat + Floor(Level × GrowthRate)) × RoleModifier + EquipmentBonus
   */
  static calculateFinalStat(
    baseStat: number,
    level: number,
    growthRate: GrowthRateType,
    roleModifier: number = 1,
    equipmentBonus: number = 0
  ): number {
    const growthValue = this.calculateGrowthValue(level, growthRate);
    return Math.floor((baseStat + growthValue) * roleModifier) + equipmentBonus;
  }

  /**
   * Calculate how much a stat has grown based on level and growth rate
   */
  static calculateGrowthValue(level: number, growthRate: GrowthRateType): number {
    switch (growthRate) {
      case GrowthRateType.MINIMAL:
        return Math.floor(level / 2); // 1 point every 2 levels
      
      case GrowthRateType.STEADY:
        return Math.floor((level * 2) / 3); // 2 points every 3 levels
      
      case GrowthRateType.NORMAL:
        return level; // 1 point every level
      
      case GrowthRateType.GRADUAL:
        return level + Math.floor(level / 3); // 1 + bonus every 3 levels
      
      case GrowthRateType.ACCELERATED:
        return level + Math.floor(level / 2); // 1 + bonus every 2 levels
      
      case GrowthRateType.EXCEPTIONAL:
        return level * 2; // 2 points every level
      
      default:
        return level; // Default to normal
    }
  }

  /**
   * Calculate maximum HP for a summon unit
   * Formula: 50 + Floor(END ^ 1.5)
   */
  static calculateMaxHP(endurance: number): number {
    return 50 + Math.floor(Math.pow(endurance, 1.5));
  }

  /**
   * Calculate movement speed for a summon unit
   * Formula: 2 + Floor((SPD - 10) / 5)
   */
  static calculateMovementSpeed(speed: number): number {
    return Math.max(1, 2 + Math.floor((speed - 10) / 5));
  }

  /**
   * Calculate critical hit chance
   * Formula: Floor((LCK × 0.3375) + 1.65)
   */
  static calculateCritChance(luck: number): number {
    return Math.floor((luck * 0.3375) + 1.65);
  }

  /**
   * Calculate basic hit chance
   * Formula: BaseAccuracy + (ACC / 10)
   */
  static calculateHitChance(baseAccuracy: number, accuracy: number): number {
    return Math.min(100, Math.max(0, baseAccuracy + (accuracy / 10)));
  }

  /**
   * Calculate physical damage
   * Formula: STR × (1 + WeaponPower / 100) × (STR / TargetDEF) × CritMultiplier
   */
  static calculatePhysicalDamage(
    attackerStr: number,
    weaponPower: number,
    targetDef: number,
    isCritical: boolean = false,
    critMultiplier: number = 1.5
  ): CalculationResult {
    const baseDamage = attackerStr * (1 + weaponPower / 100);
    const damageRatio = attackerStr / Math.max(1, targetDef);
    const finalMultiplier = isCritical ? critMultiplier : 1;
    
    const finalDamage = Math.floor(baseDamage * damageRatio * finalMultiplier);
    
    return {
      value: finalDamage,
      success: true,
      details: `Physical: ${attackerStr} STR × ${(1 + weaponPower / 100).toFixed(2)} × ${damageRatio.toFixed(2)} ${isCritical ? `× ${critMultiplier} (CRIT)` : ''}`,
      wasCritical: isCritical
    };
  }

  /**
   * Calculate magical damage
   * Formula: INT × (1 + BasePower / 100) × (INT / TargetMDF) × CritMultiplier
   */
  static calculateMagicalDamage(
    attackerInt: number,
    basePower: number,
    targetMdf: number,
    isCritical: boolean = false,
    critMultiplier: number = 1.5
  ): CalculationResult {
    const baseDamage = attackerInt * (1 + basePower / 100);
    const damageRatio = attackerInt / Math.max(1, targetMdf);
    const finalMultiplier = isCritical ? critMultiplier : 1;
    
    const finalDamage = Math.floor(baseDamage * damageRatio * finalMultiplier);
    
    return {
      value: finalDamage,
      success: true,
      details: `Magical: ${attackerInt} INT × ${(1 + basePower / 100).toFixed(2)} × ${damageRatio.toFixed(2)} ${isCritical ? `× ${critMultiplier} (CRIT)` : ''}`,
      wasCritical: isCritical
    };
  }

  /**
   * Calculate healing amount
   * Formula: SPI × (1 + BasePower / 100) × CritMultiplier
   */
  static calculateHealing(
    casterSpi: number,
    basePower: number,
    isCritical: boolean = false,
    critMultiplier: number = 1.5
  ): CalculationResult {
    const baseHealing = casterSpi * (1 + basePower / 100);
    const finalMultiplier = isCritical ? critMultiplier : 1;
    
    const finalHealing = Math.floor(baseHealing * finalMultiplier);
    
    return {
      value: finalHealing,
      success: true,
      details: `Healing: ${casterSpi} SPI × ${(1 + basePower / 100).toFixed(2)} ${isCritical ? `× ${critMultiplier} (CRIT)` : ''}`,
      wasCritical: isCritical
    };
  }

  /**
   * Calculate ranged attack damage for scouts (hybrid STR+ACC formula)
   * Formula: ((STR + ACC) / 2) × (1 + WeaponPower / 100) × (STR / TargetDEF) × CritMultiplier
   */
  static calculateRangedDamage(
    attackerStr: number,
    attackerAcc: number,
    weaponPower: number,
    targetDef: number,
    isCritical: boolean = false,
    critMultiplier: number = 1.5
  ): CalculationResult {
    const effectiveStr = (attackerStr + attackerAcc) / 2;
    const baseDamage = effectiveStr * (1 + weaponPower / 100);
    const damageRatio = attackerStr / Math.max(1, targetDef);
    const finalMultiplier = isCritical ? critMultiplier : 1;
    
    const finalDamage = Math.floor(baseDamage * damageRatio * finalMultiplier);
    
    return {
      value: finalDamage,
      success: true,
      details: `Ranged: ${effectiveStr.toFixed(1)} (STR+ACC)/2 × ${(1 + weaponPower / 100).toFixed(2)} × ${damageRatio.toFixed(2)} ${isCritical ? `× ${critMultiplier} (CRIT)` : ''}`,
      wasCritical: isCritical
    };
  }

  /**
   * Perform hit roll based on calculated hit chance
   */
  static performHitRoll(hitChance: number): boolean {
    const roll = Math.random() * 100;
    return roll <= hitChance;
  }

  /**
   * Perform critical hit roll based on calculated crit chance
   */
  static performCritRoll(critChance: number): boolean {
    const roll = Math.random() * 100;
    return roll <= critChance;
  }

  /**
   * Calculate damage based on damage type and context
   */
  static calculateDamage(
    damageType: DamageType,
    context: FormulaContext,
    basePower: number,
    weaponPower?: number
  ): CalculationResult {
    if (!context.caster || !context.target) {
      return {
        value: 0,
        success: false,
        details: 'Missing caster or target for damage calculation'
      };
    }

    const caster = context.caster;
    const target = context.target;
    
    // Check for critical hit
    const critChance = this.calculateCritChance(caster.currentStats.lck);
    const isCritical = this.performCritRoll(critChance);

    switch (damageType) {
      case DamageType.PHYSICAL:
        return this.calculatePhysicalDamage(
          caster.currentStats.str,
          weaponPower || 0,
          target.currentStats.def,
          isCritical
        );

      case DamageType.MAGICAL:
        return this.calculateMagicalDamage(
          caster.currentStats.int,
          basePower,
          target.currentStats.mdf,
          isCritical
        );

      case DamageType.HEALING:
        return this.calculateHealing(
          caster.currentStats.spi,
          basePower,
          isCritical
        );

      default:
        return {
          value: 0,
          success: false,
          details: `Unknown damage type: ${damageType}`
        };
    }
  }

  /**
   * Evaluate a custom formula string with context
   * This is a simplified formula evaluator for basic expressions
   */
  static evaluateFormula(formula: string, context: FormulaContext): CalculationResult {
    try {
      // Replace context variables in the formula
      let processedFormula = formula;
      
      if (context.caster) {
        const stats = context.caster.currentStats;
        processedFormula = processedFormula
          .replace(/caster\.str/g, stats.str.toString())
          .replace(/caster\.end/g, stats.end.toString())
          .replace(/caster\.def/g, stats.def.toString())
          .replace(/caster\.int/g, stats.int.toString())
          .replace(/caster\.spi/g, stats.spi.toString())
          .replace(/caster\.mdf/g, stats.mdf.toString())
          .replace(/caster\.spd/g, stats.spd.toString())
          .replace(/caster\.acc/g, stats.acc.toString())
          .replace(/caster\.lck/g, stats.lck.toString());
      }

      if (context.target) {
        const stats = context.target.currentStats;
        processedFormula = processedFormula
          .replace(/target\.str/g, stats.str.toString())
          .replace(/target\.end/g, stats.end.toString())
          .replace(/target\.def/g, stats.def.toString())
          .replace(/target\.int/g, stats.int.toString())
          .replace(/target\.spi/g, stats.spi.toString())
          .replace(/target\.mdf/g, stats.mdf.toString())
          .replace(/target\.spd/g, stats.spd.toString())
          .replace(/target\.acc/g, stats.acc.toString())
          .replace(/target\.lck/g, stats.lck.toString());
      }

      // Replace parameter values
      for (const [key, value] of Object.entries(context.parameters)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, String(value));
      }

      // Evaluate the processed formula (simple math expressions only)
      // Note: In a production environment, you'd want a more robust formula parser
      const result = this.evaluateMathExpression(processedFormula);
      
      return {
        value: Math.floor(result),
        success: true,
        details: `Formula: ${formula} = ${processedFormula} = ${result}`
      };
    } catch (error) {
      return {
        value: 0,
        success: false,
        details: `Formula evaluation error: ${error}`
      };
    }
  }

  /**
   * Safely evaluate a mathematical expression
   * This is a simplified evaluator - in production you'd want a proper parser
   */
  private static evaluateMathExpression(expression: string): number {
    // Remove whitespace and validate expression contains only safe characters
    const cleanExpression = expression.replace(/\s/g, '');
    const safePattern = /^[0-9+\-*/().]+$/;
    
    if (!safePattern.test(cleanExpression)) {
      throw new Error('Invalid characters in expression');
    }

    // Use Function constructor for safe evaluation (basic expressions only)
    // Note: This is still potentially unsafe and should be replaced with a proper parser
    return Function(`"use strict"; return (${cleanExpression})`)();
  }
}