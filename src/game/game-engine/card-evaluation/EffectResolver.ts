import { EffectTypeKey, IDamageEffect, IEffect, IGameState, IResolutionEvent } from "../../types";
import { IEffectEvaluator, IEffectContext, IEvaluatorRegObject } from "./effect-evaluators";
import effectEvaluators from "./effect-evaluators";

class EffectResolver {
    private static instance: EffectResolver;
    private evaluatorRegistry: Map<EffectTypeKey, IEffectEvaluator>;

    private constructor() {
        // construct evaluator register
        this.evaluatorRegistry = new Map<EffectTypeKey, IEffectEvaluator>();
        this.registerDefaultEvaluators();
    }

    public static getInstance(): EffectResolver {
        if (!EffectResolver.instance) {
            EffectResolver.instance = new EffectResolver();
        }
        return EffectResolver.instance;
    }

    public registerDefaultEvaluators(): void {
        effectEvaluators.forEach((evaluatorRegObj: IEvaluatorRegObject) => {
            this.evaluatorRegistry.set(evaluatorRegObj.regKey as EffectTypeKey, evaluatorRegObj.evaluator);
        });
    }

    public getEvaluator(type: EffectTypeKey): IEffectEvaluator {
        if (!this.evaluatorRegistry.has(type)) {
            throw new Error(`No evaluator registered for effect type: ${type}`);
        }
        return this.evaluatorRegistry.get(type)!;
    }

    public resolveEffect(event: IResolutionEvent, game: IGameState): void {
        // Logic to resolve a single effect
        if (!event || !game) {
            throw new Error("Invalid event or game state provided.");
        }

        event.resolved_effects.forEach((effect: IEffect) => {
            if (!effect || !effect.type) {
                throw new Error("Invalid effect provided.");
            }

            const evaluator: IEffectEvaluator = this.getEvaluator(effect.type as EffectTypeKey);
            const effectContext = {
                effect: effect,
                game: game,
                source_id: event.source_id,
                target_id: event.target_id,
                additional_data: event.additional_data,
            } as IEffectContext;
            evaluator.evaluate(effectContext);
        });
    }
}

export default EffectResolver;
