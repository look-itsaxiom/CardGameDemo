import GameStateEngine from "../game/game-engine/GameStateEngine";

describe("GameStateEngine", () => {
    it("should initialize and start a game without errors", () => {
        const engine = new GameStateEngine("playerA", "playerB");
        expect(engine.players.length).toBe(2);
        expect(engine.turn_player).toBeDefined();
        expect(engine.current_turn_number).toBe(0);
        expect(engine.game_status).toBeDefined();
    });
});
