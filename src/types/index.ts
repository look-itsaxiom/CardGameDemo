// ============================================================================
// CORE ENTITY MAP & RELATIONSHIPS
// Card Game Demo - Type Definitions
// ============================================================================

// ============================================================================
// FOUNDATIONAL TYPES
// ============================================================================

export type PlayerId = string;
export type CardId = string;
export type UniqueCardId = string; // For unique summon cards with digital signatures

// ============================================================================
// POSITION SYSTEM
// ============================================================================

export interface Position {
  x: number; // 0-11 (12 wide)
  y: number; // 0-13 (14 tall)
}

export type PositionId = string; // Serialized position "x,y" for keys/references

// Utility functions for position handling
export const positionToId = (pos: Position): PositionId => `${pos.x},${pos.y}`;
export const positionFromId = (id: PositionId): Position => {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
};
export const positionsEqual = (a: Position, b: Position): boolean => a.x === b.x && a.y === b.y;

// ============================================================================
// DIGITAL PROVENANCE SYSTEM
// ============================================================================

export interface DigitalSignature {
  readonly uniqueId: UniqueCardId;
  readonly openedBy: PlayerId;
  readonly timestamp: number;
  readonly signature: string; // Cryptographic signature
}

// ============================================================================
// GAME PHASES & TIMING
// ============================================================================

export enum GamePhase {
  SETUP = "setup",
  DRAW = "draw",
  LEVEL = "level",
  ACTION = "action",
  END = "end",
}

export enum SpeedLevel {
  ACTION = 1,
  REACTION = 2,
  COUNTER = 3,
}

// ============================================================================
// CARD TYPE HIERARCHY
// ============================================================================

export enum CardType {
  SUMMON = "summon",
  ROLE = "role",
  EQUIPMENT = "equipment",
  ACTION = "action",
  BUILDING = "building",
  QUEST = "quest",
  COUNTER = "counter",
  REACTION = "reaction",
  ADVANCE = "advance",
}

export enum CardRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  LEGEND = "legend",
  MYTH = "myth",
}

// ============================================================================
// STATS & GROWTH SYSTEM
// ============================================================================

export interface BaseStats {
  STR: number; // Strength - physical damage
  END: number; // Endurance - max HP
  DEF: number; // Defense - physical damage reduction
  INT: number; // Intelligence - magical damage
  SPI: number; // Spirit - healing effectiveness
  MDF: number; // Magic Defense - magical damage reduction
  SPD: number; // Speed - movement
  ACC: number; // Accuracy - hit chance
  LCK: number; // Luck - critical hits
}

export enum GrowthRate {
  MINIMAL = "minimal", // 0.5  - Symbol: "--" - +1 every 2 levels
  STEADY = "steady", // 0.66 - Symbol: "-"  - +2 every 3 levels
  NORMAL = "normal", // 1.0  - Symbol: "_"  - +1 every level
  GRADUAL = "gradual", // 1.33 - Symbol: "+"  - +1 every level + 1 every 3 levels
  ACCELERATED = "accelerated", // 1.5  - Symbol: "++" - +1 every level + 1 every 2 levels
  EXCEPTIONAL = "exceptional", // 2.0  - Symbol: "*"  - +2 every level
}

export const GROWTH_RATE_VALUES: Record<GrowthRate, number> = {
  [GrowthRate.MINIMAL]: 0.5,
  [GrowthRate.STEADY]: 0.66,
  [GrowthRate.NORMAL]: 1.0,
  [GrowthRate.GRADUAL]: 1.33,
  [GrowthRate.ACCELERATED]: 1.5,
  [GrowthRate.EXCEPTIONAL]: 2.0,
};

export const GROWTH_RATE_SYMBOLS: Record<GrowthRate, string> = {
  [GrowthRate.MINIMAL]: "--",
  [GrowthRate.STEADY]: "-",
  [GrowthRate.NORMAL]: "_",
  [GrowthRate.GRADUAL]: "+",
  [GrowthRate.ACCELERATED]: "++",
  [GrowthRate.EXCEPTIONAL]: "*",
};

export type GrowthRates = Record<keyof BaseStats, GrowthRate>;

// ============================================================================
// SPECIES SYSTEM
// ============================================================================

export interface StatRange {
  min: number;
  max: number;
}

export interface Species {
  id: string;
  name: string;
  description: string;
  baseStatRanges: Record<keyof BaseStats, StatRange>;
  traits?: Effect[]; // Species-specific passive effects that transfer to summons
}

// ============================================================================
// CARD DEFINITIONS
// ============================================================================

export interface BaseCard {
  id: CardId;
  name: string;
  type: CardType;
  rarity: CardRarity;
  description: string;
  attribute?: string; // Card attribute (e.g., "earth", "fire", "water", "air", "neutral")
}

// Shared properties for playable cards (not summons/roles/equipment)
export interface PlayableCard extends BaseCard {
  speed: SpeedLevel;
  requirements: TypedRequirement[];
  effects: Effect[];
  destinationPile: "discard" | "recharge" | "removed";
}

// Unique summon cards generated from packs
export interface SummonCard extends BaseCard {
  type: CardType.SUMMON;
  digitalSignature: DigitalSignature;
  speciesId: string; // Reference to Species definition
  baseStats: BaseStats; // Generated values within species ranges
  growthRates: GrowthRates; // Randomly assigned based on species probabilities
}

// Role advancement tree structure
export interface RoleAdvancement {
  toRole: CardId;
  requirements?: TypedRequirement[]; // Additional requirements beyond base role + level
}

// Role cards define classes/jobs
export interface RoleCard extends BaseCard {
  type: CardType.ROLE;
  tier: number; // 1, 2, 3, etc.
  roleFamily: string; // Root archetype (e.g., "warrior", "mage", "scout")
  baseRole?: CardId; // For advancement roles, what tier 1 role they stem from
  statModifiers: Partial<BaseStats>; // Multipliers applied to base stats
  advancements?: RoleAdvancement[]; // What this role can advance to
  advancementSources?: CardId[]; // What roles can advance to this one (for reverse lookup)
  effects?: Effect[]; // Special abilities for higher tier roles
}

// Equipment cards for customization
export enum EquipmentSlot {
  WEAPON = "weapon",
  OFFHAND = "offhand",
  ARMOR = "armor",
  ACCESSORY = "accessory",
}

export interface EquipmentCard extends BaseCard {
  type: CardType.EQUIPMENT;
  slot: EquipmentSlot;
  statBonuses: Partial<BaseStats>;
  power?: number; // For weapons - affects damage calculations
  range?: number; // For weapons - attack range
  effects?: Effect[]; // Special equipment effects
}

// Main deck cards
export interface ActionCard extends PlayableCard {
  type: CardType.ACTION;
}

export interface BuildingCard extends PlayableCard {
  type: CardType.BUILDING;
  dimensions: { width: number; height: number };
}

export interface QuestCard extends PlayableCard {
  type: CardType.QUEST;

  // Quest objectives and failure conditions - checked when player attempts activation
  objectiveRequirements: TypedRequirement[]; // Requirements that must be met to activate quest
  objectiveEffects: Effect[]; // Effects that trigger when player activates quest

  // Optional failure conditions - these trigger automatically when met
  failureRequirements?: TypedRequirement[]; // Conditions that cause automatic failure
  failureEffects?: Effect[]; // Effects that trigger on failure

  // Player interaction settings
  canBeActivatedBy?: "owner" | "opponent" | "either"; // Defaults to "owner"
  activationTiming?: SpeedLevel; // What speed the activation uses, defaults to ACTION

  // Destination after completion/failure
  destinationOnCompletion?: "recharge" | "discard" | "removed"; // Defaults to "recharge"
  destinationOnFailure?: "recharge" | "discard" | "removed"; // Defaults to "discard"
}

export interface CounterCard extends PlayableCard {
  type: CardType.COUNTER;
  speed: SpeedLevel.COUNTER;
  activationTrigger: Trigger; // Specific trigger for when this counter can be activated
}

export interface ReactionCard extends PlayableCard {
  type: CardType.REACTION;
  speed: SpeedLevel.REACTION;
}

export interface AdvanceCard extends PlayableCard {
  type: CardType.ADVANCE;
  speed: SpeedLevel.ACTION;
  advanceType: "roleChange" | "namedSummon";

  // For role change cards
  targetRole?: string; // The role this card changes the target to

  // For named summon cards
  namedSummonStats?: {
    species: string;
    role: string;
    level: number;
    baseStats: BaseStats;
    growthRates: GrowthRates;
    inheritedProperties?: string[]; // Properties inherited from material summon
    uniqueEffects?: Effect[]; // Special effects unique to this named summon
  };
}

export type Card = SummonCard | RoleCard | EquipmentCard | ActionCard | BuildingCard | QuestCard | CounterCard | ReactionCard | AdvanceCard;

// ============================================================================
// DECK STRUCTURE
// ============================================================================

export interface SummonSlot {
  summonCard: UniqueCardId;
  roleCard: CardId;
  equipment: {
    weapon?: CardId;
    offhand?: CardId;
    armor?: CardId;
    accessory?: CardId;
  };
}

// Base deck interface
export interface BaseDeck {
  id: string;
  name: string;
  format: string;
  mainDeck: CardId[];
  advanceDeck: CardId[];
}

// 3v3 format specific deck
export interface Deck3v3 extends BaseDeck {
  format: "3v3";
  summonSlots: [SummonSlot, SummonSlot, SummonSlot]; // Exactly 3
}

// Future formats can extend BaseDeck differently
export type Deck = Deck3v3; // Union type for all formats

// ============================================================================
// GAME STATE ENTITIES
// ============================================================================

export interface SummonUnit {
  id: string; // Runtime ID for this unit instance
  baseCard: UniqueCardId; // Reference to the original summon card
  currentRole: CardId; // Can change during gameplay
  currentEquipment: {
    weapon?: CardId;
    offhand?: CardId;
    armor?: CardId;
    accessory?: CardId;
  };
  level: number; // 5-20
  currentStats: BaseStats; // Calculated from base + growth + role + equipment
  maxHP: number; // Calculated from END
  currentHP: number;
  position: Position;
  statusEffects: StatusEffect[];
  // Combat tracking
  maxAttacks: number; // How many attacks this unit can make per turn
  attacksUsed: number; // How many attacks used this turn
  totalMovement: number; // Total movement speed calculated from stats
  movementUsed: number; // How much movement used this turn

  // Quest completion tracking
  completedQuests: string[]; // IDs of quest cards this unit has been involved in completing
  questParticipations: QuestParticipation[]; // Detailed history of quest interactions
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number; // Turns remaining
  effects: Effect[];
}

export interface QuestParticipation {
  questId: string; // ID of the quest card
  questName: string; // Name for easy debugging/display
  completedTurn: number; // Turn when quest was completed
  role: "primary" | "secondary"; // Primary = targeted by quest, Secondary = involved in completion
  rewards?: string[]; // What rewards this unit received from quest completion
}

/**
 * Quest Completion Tracking System
 *
 * When a quest is completed:
 * 1. The quest's target summon gets the quest ID added to `completedQuests[]`
 * 2. A detailed `QuestParticipation` record is added to `questParticipations[]`
 * 3. Any other summons involved get secondary participation records
 *
 * Requirements can check quest completion using:
 * - `questCompletion.required: true` - Summon must have completed at least one quest
 * - `questCompletion.minimumCompleted: N` - Summon must have completed at least N quests
 * - `questCompletion.specificQuests: [ids]` - Summon must have completed specific quest IDs
 */

// ============================================================================
// BOARD & ZONES (Grid Engine Compatible)
// ============================================================================

export enum BoardLayer {
  TERRAIN = 0,
  NONOBSTRUCTING_BUILDINGS = 1,
  OBSTRUCTING_BUILDINGS = 2,
  UNITS = 3,
}

export interface BoardOccupant {
  id: string;
  type: "summon" | "building";
  layer: BoardLayer;
}

export interface BoardPosition {
  position: Position;
  territory: "player1" | "player2" | "neutral";
  occupants: Record<BoardLayer, BoardOccupant[]>; // Typed layers instead of magic numbers
  // Grid Engine compatibility
  isWalkable?: boolean; // Can units move through this space
  movementCost?: number; // Cost to move through this space
}

export interface GameZones {
  board: Record<PositionId, BoardPosition>;
  player1: PlayerZones;
  player2: PlayerZones;
  inPlay: CardId[]; // Active cards (buildings, quests, counters, etc.)
  stack: StackEntry[]; // For trigger/response resolution
  ongoingEffects: OngoingEffect[]; // Persistent effects in play
  delayedEffects: DelayedEffect[]; // Effects scheduled for future execution
}

export interface PlayerZones {
  hand: CardId[];
  mainDeck: CardId[];
  advanceDeck: CardId[];
  discardPile: CardId[];
  rechargePile: CardId[];
  summonUnits: string[]; // SummonUnit IDs currently in play
  defeatedUnits: SummonUnit[]; // Defeated summons for potential revival/reference
  victoryPoints: number;
}

// ============================================================================
// DELAYED EFFECTS & ONGOING EFFECTS SYSTEM
// ============================================================================

export interface OngoingEffect {
  id: string;
  sourceCard: CardId;
  sourcePlayer: PlayerId;
  effect: Effect;
  duration?: number; // Turns remaining, undefined = permanent
  triggerCondition?: Trigger; // When this effect should activate
  targetId?: string; // What this effect is attached to
}

export interface DelayedEffect {
  id: string;
  sourceCard: CardId;
  sourcePlayer: PlayerId;
  effects: Effect[];
  triggerTurn: number; // Turn number when this should trigger
  triggerPhase: GamePhase; // Phase when this should trigger
  triggerCondition?: Trigger; // Additional conditions beyond timing
}

export interface Trigger {
  id: string;
  name: string;
  conditions: TriggerCondition[];
}

export interface TriggerCondition {
  type: string; // e.g., 'cardPlayed', 'unitDefeated', 'phaseStart'
  parameters: Record<string, any>;
}

export interface Requirement {
  id: string;
  type: string; // e.g., 'controlsRole', 'targetInRange', 'hasResources'
  parameters: Record<string, any>;
}

// Base requirement interface with universal properties
export interface BaseRequirement {
  id: string;
}

// Summon control requirement
export interface ControlsSummonRequirement extends BaseRequirement {
  type: "controlsSummon";
  parameters: {
    controller: "self" | "opponent";
    zone: string;
    roleFamily?: string[];
    roleId?: string;
    tier?: number | number[];
    levelRange?: { min?: number; max?: number };
    hasDealtDamageThisTurn?: boolean;
    minimumCount: number;
    questCompletion?: {
      required: boolean;
      minimumCompleted: number;
      specificQuests?: string[];
    };
  };
}

// Role family control requirement
export interface ControlsRoleFamilyRequirement extends BaseRequirement {
  type: "controlsRoleFamily";
  parameters: {
    roleFamily: string;
    minimumCount: number;
  };
}

// Target in zone requirement
export interface HasTargetInZoneRequirement extends BaseRequirement {
  type: "hasTargetInZone";
  parameters: {
    zone: string;
    cardType: string;
    controller: "self" | "opponent";
    minimumCount: number;
  };
}

// Cost payment requirement
export interface CanPayCostRequirement extends BaseRequirement {
  type: "canPayCost";
  parameters: {
    costType: string;
    amount?: number;
    source?: string[];
    destinationZone?: string;
  };
}

// Generic requirement for backwards compatibility and extensibility
export interface GenericRequirement extends BaseRequirement {
  type: string;
  parameters: Record<string, any>;
}

// Union type for all possible requirements
export type TypedRequirement =
  | ControlsSummonRequirement
  | ControlsRoleFamilyRequirement
  | HasTargetInZoneRequirement
  | CanPayCostRequirement
  | GenericRequirement;

export interface Effect {
  id: string;
  type: string; // e.g., 'dealDamage', 'heal', 'moveUnit', 'drawCards'
  parameters: Record<string, any>;
  targeting?: TargetingRule;
}

export interface TargetingRule {
  type: "single" | "multiple" | "area" | "self" | "all";
  restrictions: TargetRestriction[];
}

// Base target restriction interface with universal properties
export interface BaseTargetRestriction {
  zone: string | string[];
  controller: "self" | "opponent" | "any";
  minimumCount?: number;
  maximumCount?: number;
  rangeFromCaster?: number;
}

// Summon-specific target restriction
export interface SummonTargetRestriction extends BaseTargetRestriction {
  type: "summon";
  roleFamily?: string[];
  roleId?: string;
  tier?: number | number[];
  levelRange?: { min?: number; max?: number };
  hasDealtDamageThisTurn?: boolean;
  questCompletion?: {
    required: boolean;
    minimumCompleted: number;
    specificQuests?: string[];
  };
}

// Card-specific target restriction (for cards in zones like hand, discard, etc.)
export interface CardTargetRestriction extends BaseTargetRestriction {
  type: "card";
  cardType: "action" | "building" | "quest" | "counter" | "reaction" | "advance";
  requiresRoleFamily?: string;
  rarity?: string;
  attribute?: string;
}

// Space-specific target restriction (for board positions)
export interface SpaceTargetRestriction extends BaseTargetRestriction {
  type: "space";
  occupiedBy?: "none" | "summon" | "building" | "any";
  rangeFromCaster?: number;
  withinTerritory?: "self" | "opponent" | "unclaimed";
  adjacentTo?: string; // ID of another entity
}

// Building-specific target restriction
export interface BuildingTargetRestriction extends BaseTargetRestriction {
  type: "building";
  buildingType?: "standard" | "trap";
  attribute?: string;
}

// Equipment-specific target restriction
export interface EquipmentTargetRestriction extends BaseTargetRestriction {
  type: "equipment";
  equipmentType?: "weapon" | "armor" | "accessory" | "offhand";
  slotType?: "weapon" | "armor" | "accessory" | "offhand";
  equippedToRoleFamily?: string[];
  basePower?: number;
}

// Union type for all possible target restrictions
export type TargetRestriction =
  | SummonTargetRestriction
  | CardTargetRestriction
  | SpaceTargetRestriction
  | BuildingTargetRestriction
  | EquipmentTargetRestriction;

export interface RoleRequirement {
  requiredRole: CardId; // Role that the summon must currently have
  minimumLevel?: number;
  additionalRequirements?: TypedRequirement[];
}

// QuestObjective removed - quests now use standard Requirements system

// ============================================================================
// STACK & PRIORITY SYSTEM
// ============================================================================

export interface StackEntry {
  id: string;
  playerId: PlayerId;
  speed: SpeedLevel;
  source: CardId; // What card/effect created this
  effects: Effect[];
  triggerContext?: TriggerContext;
}

export interface TriggerContext {
  triggeringPlayer: PlayerId;
  triggeringCard?: CardId;
  targetId?: string;
  eventType: string;
  eventData: Record<string, any>;
}

// ============================================================================
// PLAYER & COLLECTION
// ============================================================================

export interface Player {
  id: PlayerId;
  name: string;
  collection: PlayerCollection;
  decks: Deck[];
}

export interface PlayerCollection {
  summonCards: UniqueCardId[]; // Unique cards with digital signatures
  roleCards: CardId[]; // Collected role cards (Tier 2+)
  equipmentCards: CardId[]; // Collected equipment
  mainDeckCards: CardId[]; // Action, Building, Quest, Counter, Reaction cards
  advanceCards: CardId[]; // Advance cards for role progression
}

// ============================================================================
// GAME STATE (boardgame.io compatible)
// ============================================================================

export interface GameState {
  // Game meta
  phase: GamePhase;
  turn: number;
  activePlayer: PlayerId;

  // Player data
  players: Record<PlayerId, PlayerZones>;

  // Board state
  zones: GameZones;

  // Active units
  summonUnits: Record<string, SummonUnit>;

  // Game progression
  victoryPoints: Record<PlayerId, number>; // Player victory points
  gameEnded: boolean; // Game over flag
  winner?: PlayerId; // Winner if game ended
  victoryCondition?: {
    type: "victoryPoints" | "elimination" | "timeout";
    winner?: PlayerId;
  };

  // Priority and stack
  priorityPlayer: PlayerId;
  awaitingResponse: boolean;

  // Turn tracking
  turnSummonUsed: boolean; // Has player used their turn summon this turn
}

// Game constants (not state)
export const SUMMON_DRAW_COUNT = 3; // Cards drawn when performing turn summon

// ============================================================================
// ACTION SYSTEM (for boardgame.io moves)
// ============================================================================

export interface GameAction {
  type: string;
  playerId: PlayerId;
  parameters: Record<string, any>;
}

// Specific action types
export interface PlayCardAction extends GameAction {
  type: "playCard";
  parameters: {
    cardId: CardId;
    caster?: string; // SummonUnit ID when card requires a caster
    targets?: string[]; // Target IDs (units, positions, etc.)
    position?: Position; // For placement cards (buildings, summons)
  };
}

export interface MoveUnitAction extends GameAction {
  type: "moveUnit";
  parameters: {
    unitId: string;
    targetPosition: Position;
  };
}

export interface AttackAction extends GameAction {
  type: "attack";
  parameters: {
    attackerId: string;
    targetId: string;
  };
}

export interface RespondAction extends GameAction {
  type: "respond";
  parameters: {
    cardId?: CardId; // Card to play in response
    pass?: boolean; // Pass priority
  };
}

export interface EndPhaseAction extends GameAction {
  type: "endPhase";
  parameters: Record<string, never>;
}

export type SpecificAction = PlayCardAction | MoveUnitAction | AttackAction | RespondAction | EndPhaseAction;

// ============================================================================
// EFFECT MODIFICATION TYPES
// ============================================================================

export enum ModificationTarget {
  // Direct stats (from BaseStats)
  STR = "STR",
  END = "END",
  DEF = "DEF",
  INT = "INT",
  SPI = "SPI",
  MDF = "MDF",
  SPD = "SPD",
  ACC = "ACC",
  LCK = "LCK",

  // Calculated values
  MOVEMENT_SPEED = "movementSpeed",
  MAX_HP = "maxHP",
  CURRENT_HP = "currentHP",
  ATTACK_DAMAGE = "attackDamage",
  CRIT_CHANCE = "critChance",
  HIT_CHANCE = "hitChance",
}

export enum ModificationType {
  ADD = "add",
  SUBTRACT = "subtract",
  MULTIPLY = "multiply",
  DIVIDE = "divide",
  SET = "set",
}

export interface ModificationDuration {
  type: "permanent" | "untilRemoved" | "phaseEnd" | "turnEnd" | "roundEnd";

  // For phaseEnd: specifies which phase and whose turn
  phase?: GamePhase; // Which phase to end at
  playerTurn?: "self" | "opponent" | "any"; // Whose turn
  turnOffset?: number; // 0 = this turn, 1 = next turn, 2 = turn after next, etc.

  // For roundEnd: specifies number of complete rounds
  rounds?: number;

  // For complex scenarios: custom condition
  condition?: {
    type: "cardPlayed" | "summonDefeated" | "damageDealt" | "custom";
    parameters?: Record<string, any>;
  };
}

// Convenience factory functions for common durations
export const Duration = {
  permanent: (): ModificationDuration => ({ type: "permanent" }),
  untilRemoved: (): ModificationDuration => ({ type: "untilRemoved" }),

  // Phase-based durations
  endOfThisPhase: (phase: GamePhase): ModificationDuration => ({
    type: "phaseEnd",
    phase,
    playerTurn: "self",
    turnOffset: 0,
  }),
  endOfThisTurn: (): ModificationDuration => ({
    type: "turnEnd",
    playerTurn: "self",
    turnOffset: 0,
  }),
  endOfOpponentTurn: (): ModificationDuration => ({
    type: "turnEnd",
    playerTurn: "opponent",
    turnOffset: 0,
  }),
  endOfOpponentNextTurn: (): ModificationDuration => ({
    type: "turnEnd",
    playerTurn: "opponent",
    turnOffset: 1,
  }),

  // Advanced scenarios
  endOfPhaseInTurns: (phase: GamePhase, playerTurn: "self" | "opponent" | "any", turnOffset: number): ModificationDuration => ({
    type: "phaseEnd",
    phase,
    playerTurn,
    turnOffset,
  }),
  forRounds: (rounds: number): ModificationDuration => ({
    type: "roundEnd",
    rounds,
  }),
  untilCondition: (condition: ModificationDuration["condition"]): ModificationDuration => ({
    type: "untilRemoved",
    condition,
  }),
};

export interface ModificationEffect {
  target: ModificationTarget;
  type: ModificationType;
  value: number;
  duration: ModificationDuration;
}

// ============================================================================
// EFFECT SYSTEM TYPES
// ============================================================================

export interface EffectContext {
  playerId: PlayerId;
  sourceCardId?: CardId;
  targetId?: string;
  casterId?: string;
  triggerContext?: TriggerContext;
  stackEntry?: StackEntry;
}

export interface EffectResult {
  success: boolean;
  message: string;
  changes: EffectChange[];
  triggeredEvents?: GameEvent[];
}

export interface EffectChange {
  type: string;
  targetId?: string;
  cardId?: string;
  amount?: number;
  newHP?: number;
  oldLevel?: number;
  newLevel?: number;
  fromZone?: string;
  toZone?: string;
  vpAwarded?: number;
  awardedTo?: PlayerId;
  [key: string]: any;
}

export interface GameEvent {
  id: string;
  type: string;
  playerId: PlayerId;
  data: Record<string, any>;
  timestamp: number;
  phase: GamePhase;
  turn: number;
}
