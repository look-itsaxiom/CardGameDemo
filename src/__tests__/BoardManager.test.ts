import BoardManager from "../game/game-engine/BoardManager";

describe("BoardManager", () => {
    it("should initialize a board with correct dimensions", () => {
        const board = new BoardManager();
        expect(board.width).toBe(12);
        expect(board.height).toBe(14);
        expect(board.spaces.length).toBe(14);
        expect(board.spaces[0].length).toBe(12);
    });

    it("should have all spaces unoccupied at start", () => {
        const board = new BoardManager();
        for (let row of board.spaces) {
            for (let space of row) {
                expect(space.occupied).toBe(false);
                expect(space.occupant.summon).toBeNull();
                expect(space.occupant.building).toBeNull();
            }
        }
    });
});
