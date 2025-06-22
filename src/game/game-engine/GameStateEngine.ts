import { IGameState, IGamePlayer, GamePhase, IBoardState, GameStatus, IEventLogEntry, ITriggerEvent, GameActionSpeed, InHandCard } from "../types/types";
import BoardManager from "./BoardManager";
import GamePlayer from "./GamePlayer";
import db from "../../../data/db";

class GameStateEngine implements IGameState {
    playerA: IGamePlayer;
    playerB: IGamePlayer;
    players: IGamePlayer[] = [];
    turn_player: IGamePlayer;
    current_turn_phase: GamePhase = GamePhase.START;
    current_turn_number: number = 0;
    turn_player_can_act: boolean = false;
    response_priority: IGamePlayer | null = null;
    current_action_speed: GameActionSpeed = GameActionSpeed.ACTION;
    board: IBoardState = new BoardManager();
    game_status: GameStatus = GameStatus.STARTING;
    event_log: IEventLogEntry[] = [];
    game_action_stack: ITriggerEvent[];
    winner: IGamePlayer;

    constructor(playerAId: string, playerBId: string) {
        // Initialize player objects with their data
        const playerAData = db.getPlayerData(playerAId);
        const playerBData = db.getPlayerData(playerBId);

        this.playerA = new GamePlayer(playerAData);
        this.playerB = new GamePlayer(playerBData);

        this.players.push(this.playerA, this.playerB);
    }

    public startGame(): void {
        // Shuffle main decks and add summon cards to player hand zones
        this.players.forEach((player) => {
            player.shuffleDeck();
        });

        this.players.forEach((player) => {
            player.drawInitialSummonCards();
        });

        // Determine who goes first by flipping a coin
        const firstPlayerIndex = Math.floor(Math.random() * this.players.length);
        this.turn_player = this.players[firstPlayerIndex];

        this.game_status = GameStatus.ONGOING;
        this.current_turn_number = 1;

        // send start game trigger
        const startGameTrigger: ITriggerEvent = {
            trigger: "on_game_start",
            source_id: "game_engine",
            speed: GameActionSpeed.ACTION,
        };

        this.sendTrigger(startGameTrigger);

        // Enter the game loop
        while (this.game_status === GameStatus.ONGOING) {
            this.executeTurn();
        }
    }

    public executeTurn(): void {
        this.drawPhase();
        this.levelUpPhase();
        this.actionPhase();
    }

    public drawPhase(): void {
        this.current_action_speed = GameActionSpeed.REACTION;
        this.current_turn_phase = GamePhase.DRAW;

        // send start draw phase trigger
        this.sendTrigger({
            trigger: "on_start_draw_phase",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });

        if (this.current_turn_number > 1) {
            const drawnCard: InHandCard | null = this.turn_player.drawCard();
            if (drawnCard) {
                // send card drawn trigger
                const cardDrawnTrigger: ITriggerEvent = {
                    trigger: "on_card_drawn",
                    source_id: this.turn_player.id,
                    additional_data: {
                        drawn_card: drawnCard,
                        draw_reason: "draw_phase",
                    },
                    speed: GameActionSpeed.REACTION,
                };
                this.sendTrigger(cardDrawnTrigger);
            } else {
                // send trigger for no cards left to draw
                const noCardsLeftTrigger: ITriggerEvent = {
                    trigger: "on_draw_attempt_deck_empty",
                    source_id: this.turn_player.id,
                    speed: GameActionSpeed.REACTION,
                };
                this.sendTrigger(noCardsLeftTrigger);
            }
        }

        // send end draw phase trigger
        this.sendTrigger({
            trigger: "on_end_draw_phase",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });
    }

    public levelUpPhase(): void {
        this.current_turn_phase = GamePhase.LEVEL_UP;

        // send start level up trigger
        this.sendTrigger({
            trigger: "on_start_level_phase",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.ACTION,
        });

        // Logic for leveling up players, if applicable
        // This could involve checking conditions and updating player states
        // For now, we just log the level up phase
        console.log(`${this.turn_player.name} is in the level up phase.`);

        // send end level up trigger
        this.sendTrigger({
            trigger: "on_end_level_phase",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.ACTION,
        });
    }

    public actionPhase(): void {
        this.current_turn_phase = GamePhase.ACTION;

        // send action phase trigger
        const actionPhaseTrigger: ITriggerEvent = {
            trigger: "on_start_action_phase",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        };

        this.sendTrigger(actionPhaseTrigger);

        this.turn_player_can_act = true;
    }

    public endTurn(): void {}

    public sendTrigger(trigger: ITriggerEvent): void {
        // Logic to send the trigger to all subscribers
        // This could be a simple event emitter or a more complex pub/sub system
        console.log("Trigger sent:", trigger);
    }
}
