export type TriggerKeyBase =
    | "on_draw_attempt_deck_empty"
    | "on_card_drawn"
    | "on_opp_card_drawn"
    | "on_game_start"
    | "on_start_turn"
    | "on_start_draw_phase"
    | "on_end_draw_phase"
    | "on_start_level_phase"
    | "on_end_level_phase"
    | "on_start_action_phase"
    | "on_end_action_phase"
    | "on_start_end_phase"
    | "on_end_turn"
    | "on_summon"
    | "on_summon_damage"
    | "on_summon_damage_by_this_effect"
    | "on_summon_destroyed"
    | "on_summon_destroyed_by_this_effect"
    | "on_summon_removed_from_game"
    | "on_effect_cost_paid"
    | "on_play"
    | "on_summon_in_occupied_space"
    | "on_level_up"
    | "on_trigger_response";

export type TriggerKey =
    | TriggerKeyBase
    | `${TriggerKeyBase}|${TriggerKeyBase}`
    | `${TriggerKeyBase}|${TriggerKeyBase}|${TriggerKeyBase}`
    | `${TriggerKeyBase}|${TriggerKeyBase}|${TriggerKeyBase}|string}`;
