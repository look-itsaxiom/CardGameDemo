import { IEffect, IGameState } from "../../../types";
import damageEffectEvaluator from "./damage-effect";

export interface IEffectEvaluator {
    evaluate(context: IEffectContext): void;
}

export interface IEffectContext {
    effect: IEffect;
    game: IGameState;
    source_id: string; // ID of the source of the effect
    target_id?: string; // Optional ID of the target of the effect
    additional_data?: any; // Optional additional data for the effect
}

export interface IEvaluatorRegObject {
    regKey: string;
    evaluator: IEffectEvaluator;
}

export default [
    {
        regKey: "damage",
        evaluator: damageEffectEvaluator as IEffectEvaluator,
    },
] as IEvaluatorRegObject[];
