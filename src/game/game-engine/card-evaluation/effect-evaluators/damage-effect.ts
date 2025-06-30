import { Parser } from "expr-eval";
import { IEffectContext, IEffectEvaluator } from ".";
import { IDamageEffect, IGameState, HitFormula, Formula, DamageType, Attribute, ISummonUnit } from "../../../types";

interface IDamageEffectContext extends IEffectContext {
    effect: IDamageEffect;
    game: IGameState;
    additional_data?: IDamageEvent;
}

export interface IDamageEvent {
    damage_caster?: ISummonUnit;
    damage_target: ISummonUnit;
}

const DEFAULT_HIT_CHANCE = 0.8; // Default hit chance if not specified in the effect

const damageEffectEvaluator: IEffectEvaluator = {
    evaluate({ effect, game, source_id, target_id, additional_data: damageEvent }: IDamageEffectContext): void {
        // Damage evaluation logic
        if (!effect || !game || !source_id || !target_id) {
            throw new Error("Invalid game context provided.");
        }

        const hit_formula: () => boolean =
            effect.hit_formula == "standard" ? () => Math.random() < (effect.base_accuracy || DEFAULT_HIT_CHANCE) : parseHitFormula(damageEvent, effect);

        // Call out to game engine to check if hit is successful?
        // If hit is successful, check for if can crit
        // Check if crit is successful
        // calculate damage
        // Check caster if any damage modifications are active
        // Check game state for any damage modifications are active
        // Check target for any damage modifications are active
        // Apply damage to target
        // Send damage trigger event to game engine
    },
};

const parseHitFormula = (damageEvent: IDamageEvent | undefined, effect: IDamageEffect): (() => boolean) => {
    // Flatten and sanitize context for expr-eval
    const context: Record<string, number | string> = {
        // Add relevant primitive properties from effect
        base_accuracy: effect.base_accuracy ?? DEFAULT_HIT_CHANCE,
        base_power: effect.base_power ?? 0,
        // Add more effect properties as needed, ensuring they are primitive types
        // Flatten caster and target stats if needed
        ...(damageEvent?.damage_caster
            ? Object.fromEntries(Object.entries(damageEvent.damage_caster).filter(([_, v]) => typeof v === "number" || typeof v === "string"))
            : {}),
        ...(damageEvent?.damage_target
            ? Object.fromEntries(Object.entries(damageEvent.damage_target).filter(([_, v]) => typeof v === "number" || typeof v === "string"))
            : {}),
    };
    const parser = new Parser();

    // Custom hit formula logic
    return () => Math.random() < parser.evaluate(effect.hit_formula, context);
};

export default damageEffectEvaluator;
