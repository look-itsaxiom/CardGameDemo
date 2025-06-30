import { TriggerKey } from "./TriggerKey";

export type CardType = "summon" | "summon_template" | "action" | "quest" | "counter" | "building" | "equipment" | "role" | "advance" | "advance_named_summon";

export enum GameActionSpeed {
    ACTION = 1,
    REACTION = 2,
    COUNTER = 3,
}

export type GameActionSpeedKey = "action" | "reaction" | "counter";

export type Attribute = "neutral" | "fire" | "earth" | "light" | "dark" | "wind" | "water";

export type Rarity = "common" | "uncommon" | "rare" | "legend";

export type SummonTiers = 1 | 2 | 3;

export type RoleInheritanceKey = "warrior" | "magician" | "scout" | "any";

export type SpeciesKey = "gignen" | "fae" | "stoneheart" | "wilderling" | "demar" | "angar" | "creptilis";

export type DamageType = "physical" | "magical" | "neutral";

export type EffectTypeKey =
    | "position_change"
    | "role_change"
    | "add_unique_card_to_hand"
    | "inheritance"
    | "summon_special"
    | "buff"
    | "debuff"
    | "formula_mod"
    | "status"
    | "extra_attack"
    | "healing"
    | "damage"
    | "add_unique_card_to_deck"
    | "level_up"
    | "change_target_zone_to_hand"
    | "destroy_self"
    | "destroy"
    | "enable_advance_summon";

export type TargetTypeKey = CardType | `${CardType}|${CardType}` | `${CardType}|${CardType}|${CardType}` | `${CardType}|${CardType}|${CardType}|${CardType}`;

export type PlayZone = "deck" | "recharge" | "discard" | "removed" | "in_play" | "hand" | "opponent_hand";

export type PlayZoneKey = PlayZone | `${PlayZone}|${PlayZone}` | `${PlayZone}|${PlayZone}|${PlayZone}` | `${PlayZone}|${PlayZone}|${PlayZone}|${PlayZone}`;

export type ResolveTimingKeyBase = "immediate" | "start_of_turn" | "end_of_turn";

export type ResolveTimingKey =
    | ResolveTimingKeyBase
    | `${ResolveTimingKeyBase}|${ResolveTimingKeyBase}`
    | `${ResolveTimingKeyBase}|${ResolveTimingKeyBase}|${ResolveTimingKeyBase}`
    | `${ResolveTimingKeyBase}|${ResolveTimingKeyBase}|${ResolveTimingKeyBase}|${ResolveTimingKeyBase}`;

export type ExpirationTypeKey = "indefinite" | "end_of_turn";

export type EquipmentType = "weapon" | "offhand" | "armor" | "accessory";

export type GrowthRates = 0.5 | 0.66 | 1 | 1.33 | 1.5 | 2;

export type Formula = string | "standard";

export type HitFormula = Formula | "always_hit";

export type EvaluationOperator = "==" | "!=" | "<" | "<=" | ">" | ">=" | "contains" | "!contains";

export type EvaluationRawValue = string | number | boolean;

export type EvaluationValue = EvaluationRawValue | EvaluationRawValue[];

export type CostTypeKey = "send_card_to_recharge";

export type QuestRewardKey = "draw_card" | "earn_victory_point";

export enum Controller {
    PLAYER = "player",
    OPPONENT = "opponent",
    ANY = "any",
    NONE = "none",
}

export type GameFormat = "3v3";

export type StatusKey = "immobilized";

export type FormulaModEffectTargetKey = "movement_speed" | "basic_attack_damage";

export interface ITargetEvaluation {
    property: string; // too large to type e.g. literally any property that exists on a valid TargetType (from TargetTypeKey, deep nested properties included)
    operator: EvaluationOperator;
    value: EvaluationValue;
}

export interface ITriggerEvaluation {
    trigger: TriggerKey;
    target_evaluation_and?: ITargetEvaluation[]; // all conditions must be true
    target_evaluation_or?: ITargetEvaluation[]; // at least one condition must be true
}

// Base stats for Summons
export interface IStats {
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
    STR: GrowthRates;
    END: GrowthRates;
    DEF: GrowthRates;
    INT: GrowthRates;
    SPI: GrowthRates;
    MDF: GrowthRates;
    SPD: GrowthRates;
    LCK: GrowthRates;
    ACC: GrowthRates;
}

export interface ICard {
    id: string; // unique card ID
    name: string;
    display_name: string;
    card_type: CardType;
    attribute: Attribute;
    rarity: Rarity;
    effects?: IEffect[];
    effects_expiration?: IExpirationType;
    flavor_text?: string;
    description?: string;
}

export interface IPlayableCard extends ICard {
    target?: ITarget;
    caster?: ICaster;
    space?: IPlaySpace;
    play_requirements: IPlayRequirements;
    resolve_requirements?: IResolveRequirements;
    trigger_requirements?: ITriggerRequirements;
    trigger: TriggerKey[];
    resolve_timing: ResolveTimingKey[];
    cost?: IPlayCost[];
    zone_after_resolve: PlayZoneKey;
    zone_after_destroy?: PlayZoneKey;
    speed: GameActionSpeed;
}

export interface IAdvanceCard extends IPlayableCard {
    speed: GameActionSpeed.ACTION;
    card_type: "advance";
}

export interface IPlayCost {
    type: CostTypeKey;
    amount: number;
    source: PlayZoneKey;
}

export interface IRequirements {
    controlled_role?: RoleInheritanceKey[];
    caster_valid?: boolean;
    target_valid?: boolean;
    space_valid?: boolean;
    in_play?: boolean;
    in_play_available?: boolean;
    controlled_card?: string; // card ID
}

export interface IPlayRequirements extends IRequirements {}

export interface IResolveRequirements extends IRequirements {}

export interface ITriggerRequirements extends IRequirements {
    custom_trigger?: ITriggerEvaluation[];
}

export interface IEffect {
    type: EffectTypeKey;
    source_id: string; // effect source ID
    specific_target?: string | ITarget; // target card ID, target object, target object property name
    specific_trigger?: TriggerKey[];
    specific_resolve_requirements?: IResolveRequirements;
    specific_expiration?: IExpirationType;
    value?: number;
}

export interface IExpirationType {
    type: ExpirationTypeKey;
}

export interface IDamageEffect extends IEffect {
    type: "damage";
    base_accuracy: number;
    hit_formula: HitFormula;
    damage_formula: Formula;
    damage_type: DamageType;
    damage_attribute: Attribute;
    base_power: number;
    can_crit: boolean;
    crit_multiplier: number;
    crit_formula: Formula;
}

export interface IHealingEffect extends IEffect {
    type: "healing";
    healing_formula: string;
    healing_type: DamageType;
    healing_attribute: Attribute;
    crit_multiplier: number;
    crit_formula: Formula;
    can_crit: boolean;
    base_power: number | null;
}

export interface IExtraAttackEffect extends IEffect {
    type: "extra_attack";
}

export interface ISpecialSummonEffect extends IEffect {
    type: "summon_special";
}

export interface IStatusEffect extends IEffect {
    type: "status";
    status: StatusKey;
    duration: number;
}

export interface IFormulaModEffect extends IEffect {
    type: "formula_mod";
    modification: string;
    modification_value: number | string;
    target_formula: FormulaModEffectTargetKey;
}

export interface IDebuffEffect extends IEffect {
    type: "debuff";
    modification: string;
    value: number;
    target_property: string;
}

export interface IBuffEffect extends IEffect {
    type: "buff";
    modification: string;
    value: number;
    target_property: string;
    mod_type: "static";
}

export interface ILevelUpEffect extends IEffect {
    type: "level_up";
}

export interface IDestroySelfEffect extends IEffect {
    type: "destroy_self";
}

export interface IDestroyEffect extends IEffect {
    type: "destroy";
}

export interface IInheritanceEffect extends IEffect {
    type: "inheritance";
}

export interface IAddUniqueCardToHandEffect extends IEffect {
    type: "add_unique_card_to_hand";
    card_id: string; // unique card ID to add to hand
    card_type: CardType; // type of the card to add
    amount: number; // number of cards to add
}

export interface IRoleChangeEffect extends IEffect {
    type: "role_change";
    role_id: string; // role card ID to change to
}

export interface ICaster {
    role_type?: RoleInheritanceKey[];
    min_level?: number;
    controlled_card?: string; // card ID
    caster_target?: ITarget;
}

export interface ITarget {
    type: TargetTypeKey;
    zone: PlayZoneKey;
    controller: Controller;
    amount: number | "any";
    range_from_caster?: number | "any" | null;
    target_evaluation_and?: ITargetEvaluation[]; // all conditions must be true
    target_evaluation_or?: ITargetEvaluation[]; // at least one condition must be true
}

export interface IPlaySpace extends IBoardSpace {
    range_from_caster: number | "any";
    designated_at_set: boolean;
    designated_at_play: boolean;
    designated_at_resolve: boolean;
}

export interface IActionCard extends IPlayableCard {
    card_type: "action";
    description: string;
    speed: GameActionSpeed.ACTION | GameActionSpeed.REACTION;
}

export interface ICounterCard extends IPlayableCard {
    card_type: "counter";
    description: string;
    speed: GameActionSpeed.COUNTER;
    set: boolean;
}

export interface IQuestCard extends IPlayableCard {
    card_type: "quest";
    description: string;
    speed: GameActionSpeed.ACTION;
    flavor_text?: string;
    objectives: IQuestCondition[];
    rewards: IEffect[];
    fail_conditions?: IQuestCondition[];
    zone_after_complete: PlayZoneKey;
    zone_after_fail: PlayZoneKey;
}

export interface IQuestCondition {
    condition_trigger: TriggerKey[];
    condition_evaluation: string; // e.g. ">= 3", "== 5", "contains('x')"
}

export interface ISummonCard extends ICard {
    card_type: "summon";
    species: SpeciesKey;
    base_stats: IStats;
    growth_rates: IGrowthRates;
    template_id: string; // summon template card ID
    opened_by: string; // player Id
    opened_date: string; // ISO date string
}

export interface ISummonTemplateCard extends ICard {
    card_type: "summon_template";
    species: SpeciesKey;
    base_stats: {
        [K in keyof IStats]: { min: number; max: number };
    };
    rarity_probability: Record<Rarity, { probability: number }>;
}

export interface IInheritedRoleRequirements {
    based_on?: string[]; // role card IDs
}

export interface IRoleRequirements {
    species?: SpeciesKey[];
    min_level?: number;
    role?: IInheritedRoleRequirements;
}

export interface IRoleCard extends ICard {
    card_type: "role";
    role_type: RoleInheritanceKey[];
    stat_modifiers: Partial<IStats>;
    tier: SummonTiers;
    requirements?: IRoleRequirements;
}

export interface IEquipmentCard extends ICard {
    card_type: "equipment";
    equipment_type: EquipmentType;
    stat_modifiers: Partial<IStats>;
}

export interface IWeaponCard extends IEquipmentCard {
    equipment_type: "weapon";
    base_power: number;
    attack_range: number;
    damage_stat: keyof IStats;
    damage_type: DamageType;
}

export interface IEquipmentSlot {
    weapon: string | null; // equipment card ID
    offhand: string | null;
    armor: string | null;
    accessory: string | null;
}

export interface ISummonSlotState {
    slot_index: number;
    summon_id: string | null;
    role_id: string | null;
    equipment_slot: IEquipmentSlot;
}

export interface ISummonSlotCard {
    card_id: string; // unique summon slot card ID
    summon: ISummonCard;
    role: IRoleCard | null;
    equipment: {
        weapon: IWeaponCard | null;
        offhand: IEquipmentCard | null;
        armor: IEquipmentCard | null;
        accessory: IEquipmentCard | null;
    };
}

export interface IAdvanceNamedSummonCard extends IPlayableCard {
    card_type: "advance_named_summon";
    base_stats: {
        STR: number | "inherited";
        END: number | "inherited";
        DEF: number | "inherited";
        INT: number | "inherited";
        SPI: number | "inherited";
        MDF: number | "inherited";
        SPD: number | "inherited";
        LCK: number | "inherited";
        ACC: number | "inherited";
    };
    growth_rates: {
        STR: GrowthRates | "inherited";
        END: GrowthRates | "inherited";
        DEF: GrowthRates | "inherited";
        INT: GrowthRates | "inherited";
        SPI: GrowthRates | "inherited";
        MDF: GrowthRates | "inherited";
        SPD: GrowthRates | "inherited";
        LCK: GrowthRates | "inherited";
        ACC: GrowthRates | "inherited";
    };
    role: string | "inherited"; // role card ID
    equipment: {
        weapon: string | "inherited" | null; // equipment card IDs
        offhand: string | "inherited" | null;
        armor: string | "inherited" | null;
        accessory: string | "inherited" | null;
    };
    speed: GameActionSpeed.ACTION;
    starting_position: IBoardSpace | "inherited";
}

export interface IBuildingCard extends IPlayableCard {
    card_type: "building";
    description: string;
    speed: GameActionSpeed.ACTION;
}

export type MainDeckCard = IActionCard | ICounterCard | IQuestCard | IBuildingCard;

export type InHandCard = ISummonSlotCard | MainDeckCard;

export type AdvanceDeckCard = IAdvanceCard | IAdvanceNamedSummonCard;

export interface IDehydratedDeck {
    id: string;
    name: string;
    owner: string; // player ID
    format: GameFormat;
    deck: {
        summons: ISummonSlotState[];
        main_deck: string[];
        advance_deck: string[];
    };
}

export interface IDeck {
    id: string;
    name: string;
    owner: string; // player ID
    format: GameFormat;
    deck: {
        summons: ISummonSlotCard[];
        main_deck: MainDeckCard[];
        advance_deck: AdvanceDeckCard[];
    };
}

export interface ICardInventoryItem {
    id: string; // unique card ID
    number_owned: number; // number of this card owned
}

export interface IPlayerData {
    id: string; // player ID
    name: string;
    decks: string[]; // deck IDs
    active_deck: string; // active deck ID
    owned_cards: ICardInventoryItem[];
}

export interface ISummonUnit extends ISummonSlotCard {
    unit_id: string; // unique summon unit ID (instance id)
    controller: Controller;
    x: number;
    y: number;
    level: number;
    current_stats: IStats;
    max_hp: number;
    current_hp: number;
    movement: number;
    remaining_movement: number;
    has_attacked: boolean;
    quests_completed: string[]; // quest card IDs
}

export interface IBuildingUnit {
    card_id: string; // unique building card ID
    unit_id: string; // unique building unit ID (instance id)
    controller: Controller;
    x: number;
    y: number;
    occupied_spaces: IBoardSpace[]; // spaces occupied by the building
}

export interface IBoardSpace {
    x: number;
    y: number;
    occupied: boolean;
    occupant: {
        summon: ISummonUnit | null;
        building: IBuildingUnit | null;
    };
    controller: Controller;
}

export interface IBoardState {
    width: number;
    height: number;
    spaces: IBoardSpace[][];
}

export enum GamePhase {
    START = "START",
    DRAW = "DRAW",
    LEVEL_UP = "LEVEL_UP",
    ACTION = "ACTION",
    END = "END",
}

export interface IPlayerZones {
    main_deck: MainDeckCard[];
    advance_deck: AdvanceDeckCard[];
    hand: InHandCard[];
    recharge: IPlayableCard[];
    discard: IPlayableCard[];
    removed: ICard[];
    in_play: ISummonUnit[] | ICounterCard[] | IBuildingUnit[];
}

export interface IGamePlayer {
    id: string; // player ID
    name: string;
    active_deck_id: string;
    active_deck: IDeck;
    zones: IPlayerZones;
    victory_points: number; // victory points earned by the player
    quests_completed: string[]; // quest card IDs completed by the player

    shuffleDeck(): void; // method to shuffle the main deck
    drawInitialSummonCards(): void; // method to draw initial summon cards
    drawCard(): InHandCard | null; // method to draw a card from the main deck
}

export enum GameStatus {
    STARTING = "starting",
    ONGOING = "ongoing",
    COMPLETED = "completed",
}

export interface IGameState {
    players: IGamePlayer[];
    turn_player: IGamePlayer;
    current_turn_phase: GamePhase;
    current_turn_number: number;
    board: IBoardState;
    game_status: GameStatus;
    winner?: IGamePlayer; // optional winner if the game is completed
    event_log: IEventLogEntry[];
    game_action_stack: (ITriggerEvent | ITriggerResponse | IResolutionEvent)[]; // trigger -> responses -> triggers -> responses -> resolutions -> triggers
}

export interface ITriggerEvent {
    trigger: TriggerKey;
    event_type: "trigger" | "response" | "resolution"; // type of the event
    source_id: string; // card ID that triggered the event
    target_id?: string; // optional target card ID
    additional_data?: Record<string, any>; // any additional data related to the event
    speed: GameActionSpeed; // speed of the effect that triggered the event
}

export interface ITriggerResponse extends ITriggerEvent {
    event_type: "response"; // this is a response to a trigger event
    responder_id: string; // card ID of the responder
    response_effects: IEffect[]; // effects that were triggered in response
    game_state_snapshot?: IGameState; // optional game state snapshot after the response
}

export interface IResolutionEvent extends ITriggerEvent {
    event_type: "resolution";
    resolved_effects: IEffect[]; // effects that were resolved
    game_state_snapshot?: IGameState; // optional game state snapshot after the resolution
}

export interface IEventLogEntry {
    entry: ITriggerEvent | ITriggerResponse | IResolutionEvent;
    timestamp: string; // ISO date string
    turn_number: number; // turn number when the event occurred
    turn_phase: GamePhase; // turn phase when the event occurred
    turn_player: IGamePlayer;
}
