export type CardType = "summon" | "summon_template" | "action" | "quest" | "counter" | "building" | "equipment" | "role" | "advance" | "advance_named_summon";

export type ActionSpeed = "Action" | "Reaction" | "Counter";

export type Attribute = "neutral" | "fire" | "earth" | "light" | "dark" | "wind" | "water";

export type Rarity = "common" | "uncommon" | "rare" | "legend";

export type SummonTiers = 1 | 2 | 3;

export type RoleInheritanceKey = "warrior" | "magician" | "scout" | "any";

export type SpeciesKey = "gignen" | "fae" | "stoneheart" | "wilderling" | "demar" | "angar" | "creptilis";

export type DamageType = "physical" | "magical" | "neutral";

export type EffectTypeKey =
  | "summon_special"
  | "buff"
  | "debuff"
  | "formula_mod"
  | "status"
  | "extra_attack"
  | "healing"
  | "damage"
  | "add_unique_action_card_to_hand"
  | "level_up"
  | "change_target_zone_to_hand";

export type TriggerKeyBase =
  | "on_summon_damage"
  | "on_summon_removed_controlled"
  | "on_cost_paid"
  | "on_play"
  | "on_player_next_turn_end_phase"
  | "on_summon_damage_by_this_effect";

export type TriggerKey =
  | TriggerKeyBase
  | `${TriggerKeyBase}|${TriggerKeyBase}`
  | `${TriggerKeyBase}|${TriggerKeyBase}|${TriggerKeyBase}`
  | `${TriggerKeyBase}|${TriggerKeyBase}|${TriggerKeyBase}|${TriggerKeyBase}`;

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

export type StatusKey = "immobilized";

export type FormulaModEffectTargetKey = "movement_speed" | "basic_attack_damage";

export interface ITargetEvaluation {
  property: string; // too large to type e.g. literally any property that exists on a valid TargetType (from TargetTypeKey, deep nested properties included)
  operator: EvaluationOperator;
  value: EvaluationValue;
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
}

export interface IPlayableCard extends ICard {
  target?: ITarget;
  caster?: ICaster;
  space?: IPlaySpace;
  play_requirements: IPlayRequirements;
  resolve_requirements?: IResolveRequirements;
  trigger: TriggerKey[];
  resolve_timing: ResolveTimingKey[];
  cost?: IPlayCost[];
  zone_after_resolve: PlayZoneKey;
  speed: ActionSpeed;
}

export interface IAdvanceCard extends IPlayableCard {
  speed: "Action";
  card_type: "advance" | "advance_named_summon";
}

export interface IPlayRequirements {
  controlled_role?: RoleInheritanceKey[];
  caster_valid?: boolean;
  target_valid?: boolean;
  In_Play_Available?: boolean;
}

export interface IPlayCost {
  type: CostTypeKey;
  amount: number;
  source: PlayZoneKey;
}

export interface IResolveRequirements {
  controlled_role?: RoleInheritanceKey[];
  target_valid?: boolean;
  in_play?: boolean;
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
  levels: number;
}

export interface ICaster {
  role_type?: RoleInheritanceKey[];
  min_level?: number;
  controlled_card?: string; // card ID
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
  speed: "Action" | "Reaction";
}

export interface ICounterCard extends IPlayableCard {
  card_type: "counter";
  description: string;
  speed: "Counter";
  set: boolean;
}

export interface IQuestCard extends IPlayableCard {
  card_type: "quest";
  description: string;
  speed: "Action";
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

export type Card = ISummonCard | ISummonTemplateCard | IRoleCard | IEquipmentCard;
