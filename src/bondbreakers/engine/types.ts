// --- Card Types & Interfaces ---

export type CardType = "summon" | "summon_template" | "action" | "quest" | "counter" | "building" | "equipment" | "role" | "advance" | "advance_named_summon";

export type Attribute = "neutral" | "fire" | "earth" | "light" | "dark" | "wind" | "water";

export type Rarity = "common" | "uncommon" | "rare" | "legend";

// Base stats for Summons and Roles
export interface ICardBaseStats {
    STR: number;
    END: number;
    DEF: number;
    INT: number;
    SPI: number;
    MDF: number;
    SPD: number;
    LCK: number;
    ACC: number;
}

// Growth rates for Summons
export interface IGrowthRates {
    STR: number;
    END: number;
    DEF: number;
    INT: number;
    SPI: number;
    MDF: number;
    SPD: number;
    LCK: number;
    ACC: number;
}

// --- General Card Interface ---

export interface ICard {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    card_type: CardType | string;
    attribute?: Attribute | string;
    rarity?: Rarity | string;
    [key: string]: unknown; // For extensibility
}

// --- Summon Card (unique instance) ---

export interface ISummonCard extends ICard {
    card_type: "summon";
    species: string;
    base_stats: ICardBaseStats;
    growth_rates: IGrowthRates;
    rarity: Rarity;
    template_id: string;
    opened_by: string;
    opened_date: string;
}

// --- Summon Template Card ---

export interface ISummonTemplateCard extends ICard {
    card_type: "summon_template";
    species: string;
    base_stats: {
        [K in keyof ICardBaseStats]: { min: number; max: number };
    };
    rarity_probability: Record<Rarity, { probability: number }>;
}

// --- Role Card ---

export interface IRoleCard extends ICard {
    card_type: "role";
    role_type: string[]; // e.g., ["warrior"]
    stat_modifiers: Partial<ICardBaseStats>;
    tier: number;
    requirements?: Record<string, unknown>;
}

// --- Equipment Card ---

export type EquipmentType = "weapon" | "offhand" | "armor" | "accessory";

export interface IEquipmentCard extends ICard {
    card_type: "equipment";
    equipment_type: EquipmentType;
    stat_modifiers: Partial<ICardBaseStats>;
    base_power?: number;
    attack_range?: number;
    damage_stat?: keyof ICardBaseStats;
    damage_type?: "physical" | "magical" | string;
}

// --- Action, Quest, Counter, Building, Advance Cards ---

export type EffectType = "level_up" | "damage" | "heal" | "stat_buff" | "draw" | "move" | "summon_special" | "custom";

export interface IEffect {
    type: EffectType;
    value?: number; // e.g., amount of damage, healing, stat change, etc.
    stat?: keyof ICardBaseStats; // For stat buffs
    target?: "self" | "opponent" | "summon" | "building" | string; // Target type or ID
    base_accuracy?: number;
    hit_modifier?: number;
    damage_formula?: string;
    damage_type?: "physical" | "magical" | string;
    damage_attribute?: Attribute | string;
    base_power?: number;
    can_crit?: boolean;
    crit_multiplier?: number;
    crit_formula?: string;
    effects_expiration?: "end_of_turn" | "indefinite" | string;
    [key: string]: unknown; // For extensibility
}

export interface IActionCard extends ICard {
    card_type: "action" | "quest" | "counter" | "building" | "advance" | "advance_named_summon";
    effects?: IEffect[];
    target?: unknown; // To be refined later
    play_requirements?: unknown;
    resolve_requirements?: unknown;
    trigger?: string[];
    resolve_timing?: string[];
    attribute?: Attribute | string;
    rarity?: Rarity | string;
    zoneAfterResolve?: string;
    zoneAfterDestroy?: string;
}

// --- Player State ---

export interface IPlayerState {
    id: string;
    name: string;
    hand: string[]; // Card IDs in hand
    mainDeck: string[]; // Card IDs in main deck (top = last)
    advanceDeck: string[]; // Card IDs in advance deck
    discardPile: string[]; // Card IDs in discard
    rechargePile: string[]; // Card IDs in recharge
    victoryPoints: number;
    summonSlots: ISummonSlotState[];
}

export interface ISummonSlotState {
    summonId: string | null; // Card ID of the summon in this slot
    roleId: string | null; // Card ID of the role
    equipment: Partial<Record<EquipmentType, string | null>>; // Card IDs for each equipment slot
}

// --- Summon Unit (in play) ---

export interface ISummonUnit {
    id: string; // Unique instance ID
    cardId: string; // Card ID of the summon
    controller: string; // Player ID
    x: number;
    y: number;
    level: number;
    stats: Partial<ICardBaseStats>;
    maxHP: number;
    currentHP: number;
    movement: number;
    remainingMovement: number;
    hasAttacked: boolean;
    attackRange?: number;
    equippedWeaponId?: string | null;
    // Add more as needed
}

// --- Board State ---

export interface IBoardSpace {
    x: number;
    y: number;
    occupied: {
        summonId: string | null;
        buildingId: string | null;
    };
    controller: string | null; // Player ID or null
}

export interface IBoardState {
    width: number;
    height: number;
    spaces: IBoardSpace[][];
}

// --- Game Phase Enum ---

export enum GamePhase {
    DRAW = "DRAW",
    LEVEL_UP = "LEVEL_UP",
    MAIN = "MAIN",
    END = "END",
}

// --- Overall Game State ---

export interface IGameState {
    players: IPlayerState[];
    board: IBoardState;
    summonUnits: ISummonUnit[];
    turn: number;
    currentPlayer: string; // Player ID
    phase: GamePhase;
    inPlayZone: string[]; // Card IDs of cards in play (summons, buildings, etc.)
    // Add more as needed
}

// --- Union Type for All Cards ---

export type Card = ISummonCard | ISummonTemplateCard | IRoleCard | IEquipmentCard | IActionCard;

// --- Effect Resolution Context ---

export interface EffectContext {
    sourcePlayerId: string; // Who played the card
    sourceCardId: string; // Card being resolved
    targets?: string[]; // Card IDs or summon IDs targeted
    // Optionally: add more context as needed (e.g., board position, etc.)
}
