import { IGameState, GamePhase, IPlayerState, ISummonUnit, IBoardState, Card, IEffect, EffectContext } from "./types";

/**
 * GameEngine is the core rules engine for the tactical RPG card game.
 * It manages game state, turn/phase transitions, and all core mechanics.
 * This class is pure TypeScript and has no dependency on Phaser or React.
 */
export class GameEngine {
    public state: IGameState;

    constructor(initialState: IGameState) {
        // Randomly decide who goes first if not set
        if (!initialState.currentPlayer && initialState.players.length > 0) {
            const firstIdx = Math.floor(Math.random() * initialState.players.length);
            initialState.currentPlayer = initialState.players[firstIdx].id;
        }
        // Set initial phase if not set
        if (!initialState.phase) {
            initialState.phase = GamePhase.DRAW;
        }
        // Set turn to 1 if not set
        if (!initialState.turn) {
            initialState.turn = 1;
        }
        this.state = initialState;
    }

    // --- Turn & Phase Management ---

    nextPhase(): void {
        // Advance to the next phase in the order: DRAW -> LEVEL_UP -> MAIN -> END -> (next turn)
        const phaseOrder = [GamePhase.DRAW, GamePhase.LEVEL_UP, GamePhase.MAIN, GamePhase.END];
        const currentIdx = phaseOrder.indexOf(this.state.phase);
        if (currentIdx < phaseOrder.length - 1) {
            this.state.phase = phaseOrder[currentIdx + 1];
        } else {
            this.nextTurn();
        }
    }

    nextTurn(): void {
        // Advance to the next player's turn, reset per-turn state, and start at DRAW phase
        const playerIds = this.state.players.map((p) => p.id);
        const currentIdx = playerIds.indexOf(this.state.currentPlayer);
        const nextIdx = (currentIdx + 1) % playerIds.length;
        this.state.currentPlayer = playerIds[nextIdx];
        this.state.turn += 1;
        this.state.phase = GamePhase.DRAW;
        // Optionally: reset per-turn flags, etc.
    }

    /**
     * Starts the first player's turn (skips draw), processes LevelUP phase, and enters Main phase.
     * This is intended for the very first turn of the game.
     */
    startFirstTurn(): void {
        // Set phase to LEVEL_UP
        this.state.phase = GamePhase.LEVEL_UP;
        // Level up all summons controlled by the current player
        this.levelUpSummonsForCurrentPlayer();
        // Enter MAIN phase
        this.state.phase = GamePhase.MAIN;
    }

    /**
     * Levels up all summons controlled by the current player (in play).
     */
    levelUpSummonsForCurrentPlayer(): void {
        const playerId = this.state.currentPlayer;
        for (const summon of this.state.summonUnits) {
            if (summon.controller === playerId) {
                summon.level += 1;
                // Optionally: recalculate stats, HP, etc. here
            }
        }
    }

    // --- Card Play & Resolution ---

    playCard(playerId: string, cardId: string, targetIds?: string[]): void {
        // Handle playing a card from hand, including requirements and effects
        // Implement card play logic here
    }

    resolveCardEffect(card: Card, context: EffectContext): void {
        // If the card has effects, resolve each
        if ("effects" in card && Array.isArray(card.effects)) {
            for (const effect of card.effects) {
                this.resolveEffect(effect, context);
            }
        }
    }

    /**
     * Resolves a single effect using the provided context.
     */
    resolveEffect(effect: IEffect, context: EffectContext): void {
        switch (effect.type) {
            case "level_up": {
                // Level up all target summons
                if (context.targets) {
                    for (const targetId of context.targets) {
                        const summon = this.state.summonUnits.find((s) => s.id === targetId);
                        if (summon) {
                            summon.level += effect.value ?? 1;
                            // Optionally: recalculate stats, HP, etc.
                        }
                    }
                }
                break;
            }
            case "damage": {
                // Deal damage to all target summons
                if (context.targets) {
                    for (const targetId of context.targets) {
                        const summon = this.state.summonUnits.find((s) => s.id === targetId);
                        if (summon) {
                            summon.currentHP -= effect.value ?? 0;
                            if (summon.currentHP < 0) summon.currentHP = 0;
                        }
                    }
                }
                break;
            }
            case "heal": {
                // Heal all target summons
                if (context.targets) {
                    for (const targetId of context.targets) {
                        const summon = this.state.summonUnits.find((s) => s.id === targetId);
                        if (summon) {
                            summon.currentHP += effect.value ?? 0;
                            if (summon.currentHP > summon.maxHP) summon.currentHP = summon.maxHP;
                        }
                    }
                }
                break;
            }
            // Add more effect types as needed
            default:
                // No-op for unknown/custom effects
                break;
        }
    }

    // --- Summon Management ---

    summonToBoard(playerId: string, summonId: string, x: number, y: number): void {
        // Place a summon unit on the board
        // Implement summon placement logic here
    }

    moveSummon(summonUnitId: string, x: number, y: number): void {
        // Move a summon unit on the board
        // Implement movement logic here
    }

    attackWithSummon(attackerId: string, targetId: string): void {
        // Handle a summon unit attacking another unit
        // Implement attack logic here
    }

    // --- Utility & State Mutation ---

    getCurrentPlayer(): IPlayerState {
        return this.state.players.find((p) => p.id === this.state.currentPlayer)!;
    }

    getOpponentPlayer(): IPlayerState {
        return this.state.players.find((p) => p.id !== this.state.currentPlayer)!;
    }

    // Add more methods as needed for win/loss, stat calculation, etc.
}
