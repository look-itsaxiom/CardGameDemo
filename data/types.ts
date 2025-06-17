export type CardType = "summon" | "summon_template" | "action" | "quest" | "counter" | "building" | "equipment" | "role" | "advance" | "advance_named_summon";

export type Attribute = "neutral" | "fire" | "earth" | "light" | "dark" | "wind" | "water";

export type Rarity = "common" | "uncommon" | "rare" | "legend";

export type ISummonTiers = 1 | 2 | 3;

export type RoleInheritanceKey = "warrior" | "magician" | "scout";

// Base stats for Summons
export interface IBaseStats {
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

export interface ICard {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    card_type: CardType | string;
    attribute?: Attribute | string;
    rarity?: Rarity | string;
    [key: string]: unknown;
}

export interface ISummonCard extends ICard {
    card_type: "summon";
    species: string;
    base_stats: IBaseStats;
    growth_rates: IGrowthRates;
    rarity: Rarity;
    template_id: string;
    opened_by: string;
    opened_date: string;
}

export interface ISummonTemplateCard extends ICard {
    card_type: "summon_template";
    species: string;
    base_stats: {
        [K in keyof IBaseStats]: { min: number; max: number };
    };
    rarity_probability: Record<Rarity, { probability: number }>;
}

export interface IRoleRequirements {}

export interface IRoleCard extends ICard {
    card_type: "role";
    role_type: RoleInheritanceKey[];
    stat_modifiers: Partial<IBaseStats>;
    tier: ISummonTiers;
    requirements?: IRoleRequirements;
}

// --- Equipment Card ---

export type EquipmentType = "weapon" | "offhand" | "armor" | "accessory";

export interface IEquipmentCard extends ICard {
    card_type: "equipment";
    equipment_type: EquipmentType;
    stat_modifiers: Partial<IBaseStats>;
    base_power?: number;
    attack_range?: number;
    damage_stat?: keyof IBaseStats;
    damage_type?: "physical" | "magical" | string;
}

// --- Action, Quest, Counter, Building, Advance Cards ---

export type EffectType = "level_up" | "damage" | "heal" | "stat_buff" | "draw" | "move" | "summon_special" | "custom";

export interface IEffect {
    type: EffectType;
    value?: number; // e.g., amount of damage, healing, stat change, etc.
    stat?: keyof IBaseStats; // For stat buffs
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

export interface ISummonSlotState {
    summonId: string | null;
    roleId: string | null;
    equipment: Partial<Record<EquipmentType, string | null>>;
}

export interface ISummonUnit {
    id: string;
    cardId: string;
    controller: string;
    x: number;
    y: number;
    level: number;
    stats: Partial<IBaseStats>;
    maxHP: number;
    currentHP: number;
    movement: number;
    remainingMovement: number;
    hasAttacked: boolean;
    attackRange?: number;
    equippedWeaponId?: string | null;
}

export interface IBoardSpace {
    x: number;
    y: number;
    occupied: {
        summon: ISummonUnit | null;
        building: IBuilding | null;
    };
    controller: string | null;
}

export interface IBoardState {
    width: number;
    height: number;
    spaces: IBoardSpace[][];
}

export enum GamePhase {
    DRAW = "DRAW",
    LEVEL_UP = "LEVEL_UP",
    MAIN = "MAIN",
    END = "END",
}

export interface IGameState {
    players: IPlayerState[];
    board: IBoardState;
    summonUnits: ISummonUnit[];
    turn: number;
    currentPlayer: string;
    phase: GamePhase;
    inPlayZone: string[];
}

export type Card = ISummonCard | ISummonTemplateCard | IRoleCard | IEquipmentCard | IActionCard;
