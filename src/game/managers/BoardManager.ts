import { ICardInfo } from "../../../data/db";
import Phaser from "phaser";

export const BOARD_WIDTH = 12;
export const BOARD_HEIGHT = 14;

export class BoardSpace {
    occupied: {
        summon: string | null;
        building: string | null;
    };
    controller: string | null;

    constructor(controller: string | null = null) {
        this.occupied = {
            summon: null,
            building: null,
        };
        this.controller = controller;
    }
}

export class BoardManager {
    scene: Phaser.Scene;
    board: BoardSpace[][];
    boardGrid: Phaser.GameObjects.Grid;
    zoneRects: Phaser.GameObjects.Rectangle[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.board = this.createBoard();
        this.boardGrid = this.drawGrid();
        this.drawZones();
    }

    createBoard(): BoardSpace[][] {
        const board: BoardSpace[][] = [];
        for (let h = 0; h < BOARD_HEIGHT; h++) {
            board[h] = [];
            for (let w = 0; w < BOARD_WIDTH; w++) {
                if (h < 3) {
                    board[h][w] = new BoardSpace("opponent");
                } else if (h > 10) {
                    board[h][w] = new BoardSpace("player");
                } else {
                    board[h][w] = new BoardSpace();
                }
            }
        }
        return board;
    }

    drawGrid(): Phaser.GameObjects.Grid {
        // Centered grid
        const grid = this.scene.add.grid(512, 360, BOARD_WIDTH * 32, BOARD_HEIGHT * 32, 32, 32, 0x000000, 0.1);
        return grid;
    }

    drawZones() {
        // Draw colored rectangles for player/opponent zones
        for (let h = 0; h < BOARD_HEIGHT; h++) {
            for (let w = 0; w < BOARD_WIDTH; w++) {
                let color: number | null = null;
                if (h < 3) {
                    color = 0xff0000; // red for top three rows
                } else if (h >= BOARD_HEIGHT - 3) {
                    color = 0x0000ff; // blue for bottom three rows
                }
                if (color !== null) {
                    const cellWidth = 32;
                    const cellHeight = 32;
                    const x = 512 - (BOARD_WIDTH * 32) / 2 + w * cellWidth + cellWidth / 2;
                    const y = 360 - (BOARD_HEIGHT * 32) / 2 + h * cellHeight + cellHeight / 2;
                    const rect = this.scene.add.rectangle(x, y, cellWidth, cellHeight, color, 0.2).setOrigin(0.5);
                    this.zoneRects.push(rect);
                }
            }
        }
    }

    getValidSummonSpaces(controller: "player" | "opponent"): { x: number; y: number }[] {
        const spaces: { x: number; y: number }[] = [];
        for (let h = 0; h < BOARD_HEIGHT; h++) {
            for (let w = 0; w < BOARD_WIDTH; w++) {
                if (this.board[h][w].controller === controller && !this.board[h][w].occupied.summon) {
                    spaces.push({ x: w, y: h });
                }
            }
        }
        return spaces;
    }

    highlightCells(cells: { x: number; y: number }[], color: number = 0x00ff00, alpha: number = 0.3): Phaser.GameObjects.Rectangle[] {
        // Returns highlight rectangles for given cells
        const highlights: Phaser.GameObjects.Rectangle[] = [];
        for (const { x, y } of cells) {
            const cellWidth = 32;
            const cellHeight = 32;
            const px = 512 - (BOARD_WIDTH * 32) / 2 + x * cellWidth + cellWidth / 2;
            const py = 360 - (BOARD_HEIGHT * 32) / 2 + y * cellHeight + cellHeight / 2;
            const rect = this.scene.add.rectangle(px, py, cellWidth, cellHeight, color, alpha).setOrigin(0.5);
            highlights.push(rect);
        }
        return highlights;
    }

    placeSummon(card: ICardInfo, x: number, y: number) {
        this.board[y][x].occupied.summon = card.id;
    }

    // --- Calculate valid move spaces for a Summon given its movement stat and position ---
    getValidMoveSpaces(startX: number, startY: number, movement: number): { x: number; y: number }[] {
        // BFS/flood fill for grid movement
        const visited = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false));
        const result: { x: number; y: number }[] = [];
        const queue: { x: number; y: number; dist: number }[] = [{ x: startX, y: startY, dist: 0 }];
        visited[startY][startX] = true;
        while (queue.length > 0) {
            const { x, y, dist } = queue.shift()!;
            if (dist > 0) result.push({ x, y }); // Exclude starting cell
            if (dist === movement) continue;
            for (const [dx, dy] of [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ]) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT && !visited[ny][nx] && !this.board[ny][nx].occupied.summon) {
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny, dist: dist + 1 });
                }
            }
        }
        return result;
    }
}
