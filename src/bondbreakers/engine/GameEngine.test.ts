import { GameEngine } from "./GameEngine";
import { GamePhase, IGameState, ISummonUnit, IPlayerState, IActionCard, IEffect, EffectContext } from "./types";

describe("GameEngine", () => {
    function makeTestState(): IGameState {
        const playerA: IPlayerState = {
            id: "A",
            name: "Alice",
            hand: [],
            mainDeck: [],
            advanceDeck: [],
            discardPile: [],
            rechargePile: [],
            victoryPoints: 0,
            summonSlots: [],
        };
        const playerB: IPlayerState = {
            id: "B",
            name: "Bob",
            hand: [],
            mainDeck: [],
            advanceDeck: [],
            discardPile: [],
            rechargePile: [],
            victoryPoints: 0,
            summonSlots: [],
        };
        const summonA: ISummonUnit = {
            id: "summonA",
            cardId: "summonCardA",
            controller: "A",
            x: 0,
            y: 0,
            level: 5,
            stats: {},
            maxHP: 10,
            currentHP: 10,
            movement: 2,
            remainingMovement: 2,
            hasAttacked: false,
        };
        const summonB: ISummonUnit = {
            id: "summonB",
            cardId: "summonCardB",
            controller: "B",
            x: 1,
            y: 1,
            level: 5,
            stats: {},
            maxHP: 10,
            currentHP: 10,
            movement: 2,
            remainingMovement: 2,
            hasAttacked: false,
        };
        return {
            players: [playerA, playerB],
            board: { width: 2, height: 2, spaces: [] },
            summonUnits: [summonA, summonB],
            turn: 1,
            currentPlayer: "A",
            phase: GamePhase.DRAW,
            inPlayZone: [],
        };
    }

    it("initializes with correct first player and phase", () => {
        const state = makeTestState();
        const engine = new GameEngine(state);
        expect(engine.state.currentPlayer).toBe("A");
        expect(engine.state.phase).toBe(GamePhase.DRAW);
        expect(engine.state.turn).toBe(1);
    });

    it("levels up all current player's summons in LevelUP phase", () => {
        const state = makeTestState();
        const engine = new GameEngine(state);
        engine.levelUpSummonsForCurrentPlayer();
        expect(engine.state.summonUnits[0].level).toBe(6); // summonA
        expect(engine.state.summonUnits[1].level).toBe(5); // summonB
    });

    it("resolves a level_up effect on a target summon", () => {
        const state = makeTestState();
        const engine = new GameEngine(state);
        const effect: IEffect = { type: "level_up", value: 2 };
        const context: EffectContext = { sourcePlayerId: "A", sourceCardId: "card1", targets: ["summonA"] };
        engine.resolveEffect(effect, context);
        expect(engine.state.summonUnits[0].level).toBe(7);
    });

    it("resolves a damage effect on a target summon", () => {
        const state = makeTestState();
        const engine = new GameEngine(state);
        const effect: IEffect = { type: "damage", value: 3 };
        const context: EffectContext = { sourcePlayerId: "A", sourceCardId: "card1", targets: ["summonB"] };
        engine.resolveEffect(effect, context);
        expect(engine.state.summonUnits[1].currentHP).toBe(7);
    });

    it("resolves a heal effect on a target summon (capped at maxHP)", () => {
        const state = makeTestState();
        state.summonUnits[0].currentHP = 5;
        const engine = new GameEngine(state);
        const effect: IEffect = { type: "heal", value: 10 };
        const context: EffectContext = { sourcePlayerId: "A", sourceCardId: "card1", targets: ["summonA"] };
        engine.resolveEffect(effect, context);
        expect(engine.state.summonUnits[0].currentHP).toBe(10);
    });
});
