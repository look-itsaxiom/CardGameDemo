import { Controller, IBoardSpace, IBoardState } from "../types";

export default class BoardManager implements IBoardState {
    width: number = 12;
    height: number = 14;
    spaces: IBoardSpace[][] = this.initializeBoardSpaces();

    private initializeBoardSpaces(): IBoardSpace[][] {
        // first 3 rows are player A's side, last 3 are player B's side
        const spaces: IBoardSpace[][] = [];
        for (let y = 0; y < this.height; y++) {
            const row: IBoardSpace[] = [];
            for (let x = 0; x < this.width; x++) {
                row.push({
                    x,
                    y,
                    occupied: false,
                    occupant: {
                        summon: null,
                        building: null,
                    },
                    controller: Controller.NONE,
                });
            }
            spaces.push(row);
        }
        return spaces;
    }
}
