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
export const positionsEqual = (a: Position, b: Position): boolean =>
    a.x === b.x && a.y === b.y;

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
    EPIC = "epic",
    LEGENDARY = "legendary",
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
    requirements: Requirement[];
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
    requirements?: Requirement[]; // Additional requirements beyond base role + level
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
    objective: QuestObjective;
    reward: Effect[];
    failureCondition?: QuestObjective; // Conditions that cause quest to fail
    punishment?: Effect[]; // Effects applied if quest fails
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
}

export type Card =
    | SummonCard
    | RoleCard
    | EquipmentCard
    | ActionCard
    | BuildingCard
    | QuestCard
    | CounterCard
    | ReactionCard
    | AdvanceCard;

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
}

export interface StatusEffect {
    id: string;
    name: string;
    description: string;
    duration: number; // Turns remaining
    effects: Effect[];
}

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

export interface TargetRestriction {
    type: string; // e.g., 'summonWithRole', 'enemyUnit', 'adjacentSpace'
    parameters: Record<string, any>;
}

export interface RoleRequirement {
    requiredRole: CardId; // Role that the summon must currently have
    minimumLevel?: number;
    additionalRequirements?: Requirement[];
}

export interface QuestObjective {
    type: string; // e.g., 'controlSummon', 'dealDamage', 'surviveRounds'
    parameters: Record<string, any>;
    completed: boolean;
    failed?: boolean; // Track failure state separately
}

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

export type SpecificAction =
    | PlayCardAction
    | MoveUnitAction
    | AttackAction
    | RespondAction
    | EndPhaseAction;
