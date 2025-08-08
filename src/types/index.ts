/**
 * Core Game Types
 * 
 * This file contains all the fundamental TypeScript interfaces and types for the
 * tactical card game. The type system is based on the comprehensive design
 * documentation and implements a data-driven approach where all game mechanics
 * are defined as structured data rather than hardcoded logic.
 */

// =====================================================================================
// ENUMS AND CONSTANTS
// =====================================================================================

export enum CardType {
  SUMMON = 'summon',
  ACTION = 'action',
  BUILDING = 'building',
  QUEST = 'quest',
  COUNTER = 'counter',
  REACTION = 'reaction',
  ROLE = 'role',
  EQUIPMENT = 'equipment',
  ADVANCE = 'advance',
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum SpeedLevel {
  ACTION = 'action',
  REACTION = 'reaction', 
  COUNTER = 'counter',
}

export enum GrowthRateType {
  MINIMAL = 'minimal',     // 1 point every 2 levels
  STEADY = 'steady',       // 2 points every 3 levels  
  NORMAL = 'normal',       // 1 point every level
  GRADUAL = 'gradual',     // 1 point + bonus every 3 levels
  ACCELERATED = 'accelerated', // 1 point + bonus every 2 levels
  EXCEPTIONAL = 'exceptional', // 2 points every level
}

export enum EquipmentSlot {
  WEAPON = 'weapon',
  OFFHAND = 'offhand',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
}

export enum RoleFamily {
  WARRIOR = 'warrior',
  SCOUT = 'scout', 
  MAGICIAN = 'magician',
}

export enum GamePhase {
  DRAW = 'draw',
  LEVEL = 'level',
  ACTION = 'action',
  END = 'end',
}

export enum DamageType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical',
  HEALING = 'healing',
}

export enum DamageAttribute {
  NEUTRAL = 'neutral',
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  WIND = 'wind',
  LIGHT = 'light',
  DARK = 'dark',
}

// =====================================================================================
// CORE GAME STATS
// =====================================================================================

export interface Stats {
  str: number;  // Strength - Physical attack damage
  end: number;  // Endurance - Health calculation base
  def: number;  // Defense - Physical damage reduction
  int: number;  // Intelligence - Magical attack damage
  spi: number;  // Spirit - Healing effectiveness
  mdf: number;  // Magic Defense - Magical damage reduction
  spd: number;  // Speed - Movement speed calculation
  acc: number;  // Accuracy - Hit chance bonus
  lck: number;  // Luck - Critical hit chance
}

export interface GrowthRates {
  str: GrowthRateType;
  end: GrowthRateType;
  def: GrowthRateType;
  int: GrowthRateType;
  spi: GrowthRateType;
  mdf: GrowthRateType;
  spd: GrowthRateType;
  acc: GrowthRateType;
  lck: GrowthRateType;
}

// =====================================================================================
// BOARD AND POSITION
// =====================================================================================

export interface Position {
  x: number;
  y: number;
}

export interface BoardDimensions {
  width: number;
  height: number;
}

export interface Territory {
  playerId: string;
  startRow: number;
  endRow: number;
}

// =====================================================================================
// EQUIPMENT SYSTEM
// =====================================================================================

export interface EquipmentSlots {
  weapon?: string;     // Equipment card ID
  offhand?: string;    // Equipment card ID
  armor?: string;      // Equipment card ID
  accessory?: string;  // Equipment card ID
}

export interface WeaponProperties {
  basePower: number;
  range: number;
  attackFormula: string;
  damageType: DamageType;
  damageAttribute: DamageAttribute;
}

// =====================================================================================
// DIGITAL PROVENANCE SYSTEM
// =====================================================================================

export interface DigitalSignature {
  id: string;
  timestamp: string;
  opener: string;        // Player who opened the pack
  packId: string;
  signature: string;     // Cryptographic signature
  verified: boolean;
}

// =====================================================================================
// CARD BASE TYPES
// =====================================================================================

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  description: string;
  set?: string;
  cost?: number;
  attribute?: DamageAttribute;
}

// =====================================================================================
// EFFECT SYSTEM
// =====================================================================================

export interface TargetingRule {
  type: 'self' | 'ally' | 'enemy' | 'any' | 'position' | 'area';
  range?: number;
  count?: number;
  filter?: Record<string, unknown>;
}

export interface Requirement {
  type: string;
  value?: unknown;
  description: string;
}

export interface EffectParameter {
  name: string;
  value: unknown;
  formula?: string;
}

export interface Effect {
  id: string;
  name: string;
  description: string;
  type: string;
  speed: SpeedLevel;
  targeting: TargetingRule[];
  requirements: Requirement[];
  parameters: EffectParameter[];
  trigger?: string;
  conditions?: Record<string, unknown>;
}

// =====================================================================================
// SPECIFIC CARD TYPES
// =====================================================================================

export interface SummonCard extends Card {
  type: CardType.SUMMON;
  species: string;
  digitalSignature: DigitalSignature;
  baseStats: Stats;
  growthRates: GrowthRates;
  level: number;
  maxLevel: number;
  equipment: EquipmentSlots;
  roleId?: string;  // Current role card ID
}

export interface ActionCard extends Card {
  type: CardType.ACTION | CardType.REACTION;
  effects: Effect[];
  requirements: Requirement[];
  speed: SpeedLevel;
  targetingRules: TargetingRule[];
  destinationPile: 'discard' | 'recharge';
}

export interface BuildingCard extends Card {
  type: CardType.BUILDING;
  dimensions: { width: number; height: number };
  effects: Effect[];
  requirements: Requirement[];
  isTrapped?: boolean;  // Building - Trap subtype
  hitPoints?: number;
  destinationPile: 'discard' | 'recharge';
}

export interface QuestCard extends Card {
  type: CardType.QUEST;
  objective: string;
  requirements: Requirement[];
  rewards: Effect[];
  ongoing?: Effect[];  // Effects while quest is active
  destinationPile: 'discard' | 'recharge';
}

export interface CounterCard extends Card {
  type: CardType.COUNTER;
  triggerCondition: string;
  effects: Effect[];
  requirements: Requirement[];
  activationCost?: Effect[];  // Additional costs to activate
  destinationPile: 'discard' | 'recharge';
}

export interface RoleCard extends Card {
  type: CardType.ROLE;
  family: RoleFamily;
  tier: number;
  statModifiers: Partial<Stats>;
  advancement?: {
    tier2Options: string[];  // Role card IDs
    tier3Options: string[];  // Role card IDs
  };
  uniqueAbilities?: Effect[];
}

export interface EquipmentCard extends Card {
  type: CardType.EQUIPMENT;
  slot: EquipmentSlot;
  statBonuses: Partial<Stats>;
  weaponProperties?: WeaponProperties;
  effects?: Effect[];
}

export interface AdvanceCard extends Card {
  type: CardType.ADVANCE;
  targetType: 'role_change' | 'named_summon';
  requirements: Requirement[];
  effects: Effect[];
  destinationPile: 'discard' | 'remove';
}

// Union type for all card types
export type AnyCard = SummonCard | ActionCard | BuildingCard | QuestCard | 
                     CounterCard | RoleCard | EquipmentCard | AdvanceCard;

// =====================================================================================
// GAME STATE TYPES
// =====================================================================================

export interface SummonUnit {
  id: string;
  originalCard: SummonCard;
  currentStats: Stats;
  currentHP: number;
  maxHP: number;
  level: number;
  position: Position;
  movement: number;      // Movement points remaining this turn
  hasAttacked: boolean;  // Can only attack once per turn
  statusEffects: StatusEffect[];
  equipment: EquipmentSlots;
  roleId?: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number;      // -1 for permanent
  effects: Effect[];
  source: string;        // What caused this effect
}

export interface PlayerState {
  id: string;
  name: string;
  victoryPoints: number;
  hand: string[];        // Card IDs
  mainDeck: string[];    // Card IDs
  advanceDeck: string[]; // Card IDs
  discardPile: string[]; // Card IDs
  rechargePile: string[]; // Card IDs
  territory: Territory;
  summonSlots: {
    slot1?: SummonUnit;
    slot2?: SummonUnit;
    slot3?: SummonUnit;
  };
}

export interface GameBoard {
  dimensions: BoardDimensions;
  occupiedSpaces: Map<string, string>; // "x,y" -> unitId or buildingId
  buildings: Map<string, BuildingInstance>; // buildingId -> building
}

export interface BuildingInstance {
  id: string;
  cardId: string;
  positions: Position[];
  effects: Effect[];
  hitPoints: number;
  isRevealed: boolean;   // For trap buildings
}

export interface GameState {
  id: string;
  status: 'setup' | 'playing' | 'finished';
  currentPlayer: string;
  currentPhase: GamePhase;
  turn: number;
  players: Record<string, PlayerState>;
  board: GameBoard;
  stack: StackEntry[];   // Effect resolution stack
  ongoingEffects: OngoingEffect[];
  delayedEffects: DelayedEffect[];
  winner?: string;
}

// =====================================================================================
// STACK SYSTEM TYPES
// =====================================================================================

export interface StackEntry {
  id: string;
  type: 'action' | 'effect' | 'triggered_ability';
  cardId?: string;
  playerId: string;
  speed: SpeedLevel;
  effects: Effect[];
  targets: string[];
  requirements: Requirement[];
  timestamp: number;
}

export interface OngoingEffect {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
  source: string;
  targets: string[];
  duration: number;      // -1 for permanent
  conditions?: Record<string, unknown>;
}

export interface DelayedEffect {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
  source: string;
  triggerCondition: string;
  triggerTime?: number;  // Turn number or timestamp
}

// =====================================================================================
// ACTIONS AND COMMANDS
// =====================================================================================

export interface GameAction {
  type: string;
  playerId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface PlayCardAction extends GameAction {
  type: 'play_card';
  data: {
    cardId: string;
    targets?: string[];
    position?: Position;
  };
}

export interface MoveUnitAction extends GameAction {
  type: 'move_unit';
  data: {
    unitId: string;
    targetPosition: Position;
  };
}

export interface AttackAction extends GameAction {
  type: 'attack';
  data: {
    attackerId: string;
    targetId: string;
  };
}

export interface EndPhaseAction extends GameAction {
  type: 'end_phase';
  data: Record<string, never>;
}

// Union type for all actions
export type AnyGameAction = PlayCardAction | MoveUnitAction | AttackAction | EndPhaseAction;

// =====================================================================================
// DECK BUILDING TYPES
// =====================================================================================

export interface SummonSlot {
  summon: SummonCard;
  role: RoleCard;
  equipment: {
    weapon?: EquipmentCard;
    offhand?: EquipmentCard;
    armor?: EquipmentCard;
    accessory?: EquipmentCard;
  };
}

export interface Deck {
  id: string;
  name: string;
  format: '3v3';
  summonSlots: [SummonSlot, SummonSlot, SummonSlot]; // Exactly 3 slots
  mainDeck: AnyCard[];
  advanceDeck: AdvanceCard[];
  isValid: boolean;
  validationErrors: string[];
}

// =====================================================================================
// SPECIES SYSTEM
// =====================================================================================

export interface Species {
  id: string;
  name: string;
  description: string;
  baseStats: Stats;
  statRanges: {
    str: [number, number];
    end: [number, number];
    def: [number, number];
    int: [number, number];
    spi: [number, number];
    mdf: [number, number];
    spd: [number, number];
    acc: [number, number];
    lck: [number, number];
  };
  growthRateProbabilities: Record<GrowthRateType, number>;
  traitEffects?: Effect[];
}

// =====================================================================================
// FORMULA SYSTEM
// =====================================================================================

export interface FormulaContext {
  caster?: SummonUnit;
  target?: SummonUnit;
  card?: AnyCard;
  gameState: GameState;
  parameters: Record<string, unknown>;
}

export interface CalculationResult {
  value: number;
  success: boolean;
  details: string;
  wasCritical?: boolean;
}

// =====================================================================================
// EVENT SYSTEM
// =====================================================================================

export interface GameEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  source: string;
}

export interface TriggerContext {
  event: GameEvent;
  gameState: GameState;
  triggeredBy: string;
  additionalData?: Record<string, unknown>;
}

// =====================================================================================
// UTILITY TYPES
// =====================================================================================

export type CardId = string;
export type PlayerId = string;
export type UnitId = string;
export type PositionKey = string; // "x,y" format

// Type guards
export function isSummonCard(card: AnyCard): card is SummonCard {
  return card.type === CardType.SUMMON;
}

export function isActionCard(card: AnyCard): card is ActionCard {
  return card.type === CardType.ACTION || card.type === CardType.REACTION;
}

export function isEquipmentCard(card: AnyCard): card is EquipmentCard {
  return card.type === CardType.EQUIPMENT;
}

export function isRoleCard(card: AnyCard): card is RoleCard {
  return card.type === CardType.ROLE;
}