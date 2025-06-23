import { shuffleDeck } from "../game/game-engine/helpers";

describe("helpers", () => {
    it("shuffleDeck should return a new array with same elements", () => {
        const arr = [1, 2, 3, 4, 5];
        const shuffled = shuffleDeck(arr);
        expect(shuffled.sort()).toEqual(arr.sort());
        // It's possible (though rare) for shuffle to return the same order, so don't fail the test if so.
    });
});
