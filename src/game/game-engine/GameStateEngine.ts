import {
    IGameState,
    IGamePlayer,
    GamePhase,
    IBoardState,
    GameStatus,
    IEventLogEntry,
    ITriggerEvent,
    GameActionSpeed,
    InHandCard,
    IPlayableCard,
    IResolutionEvent,
    ITriggerResponse,
} from "../types";
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
    action_priority: IGamePlayer;
    current_action_speed: GameActionSpeed = GameActionSpeed.ACTION;
    board: IBoardState = new BoardManager();
    game_status: GameStatus = GameStatus.STARTING;
    event_log: IEventLogEntry[] = [];
    game_action_stack: (ITriggerEvent | ITriggerResponse | IResolutionEvent)[] = [];
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
        this.action_priority = this.turn_player;

        this.game_status = GameStatus.ONGOING;
        this.current_turn_number = 1;

        // send start game trigger
        this.sendTrigger({
            trigger: "on_game_start",
            event_type: "trigger",
            source_id: "game_engine",
            speed: GameActionSpeed.ACTION,
        });

        this.executeTurn();
    }

    public executeTurn(): void {
        // send start turn trigger
        this.sendTrigger({
            trigger: "on_start_turn",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });
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
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });

        if (this.current_turn_number > 1) {
            const drawnCard: InHandCard | null = this.turn_player.drawCard();
            if (drawnCard) {
                // send card drawn trigger
                const cardDrawnTrigger: ITriggerEvent = {
                    trigger: "on_card_drawn",
                    event_type: "trigger",
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
                    event_type: "trigger",
                    source_id: this.turn_player.id,
                    speed: GameActionSpeed.REACTION,
                };
                this.sendTrigger(noCardsLeftTrigger);
            }
        }

        // send end draw phase trigger
        this.sendTrigger({
            trigger: "on_end_draw_phase",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });
    }

    public levelUpPhase(): void {
        this.current_turn_phase = GamePhase.LEVEL_UP;

        // send start level up trigger
        this.sendTrigger({
            trigger: "on_start_level_phase",
            event_type: "trigger",
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
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.ACTION,
        });
    }

    public actionPhase(): void {
        this.current_turn_phase = GamePhase.ACTION;
        this.action_priority = this.turn_player;

        // send action phase trigger
        this.sendTrigger({
            trigger: "on_start_action_phase",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });
    }

    public endTurn(): void {
        this.sendTrigger({
            trigger: "on_end_action_phase",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });

        this.current_turn_phase = GamePhase.END;
        this.current_action_speed = GameActionSpeed.REACTION;

        this.sendTrigger({
            trigger: "on_start_end_phase",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });

        this.sendTrigger({
            trigger: "on_end_turn",
            event_type: "trigger",
            source_id: this.turn_player.id,
            speed: GameActionSpeed.REACTION,
        });

        // After the end of the turn, switch to the next player
        this.current_turn_number++;
        this.turn_player = this.turn_player === this.playerA ? this.playerB : this.playerA;
        // Reset action priority and current action speed
        this.executeTurn();
    }

    public sendTrigger(trigger: ITriggerEvent): void {
        // Logic to send the trigger to all subscribers
        // This could be a simple event emitter or a more complex pub/sub system
        console.log("Trigger sent:", trigger);

        this.game_action_stack.push(trigger);

        // evaluate trigger responses
        this.evaluateTriggerResponses(trigger);

        console.log(this.game_action_stack);

        this.resolveGameActionStack();
    }

    public evaluateTriggerResponses(triggerEvent: ITriggerEvent): void {
        // Helper to evaluate a single player's zones for trigger responses
        const evaluatePlayerZonesForTriggers = (player: IGamePlayer) => {
            (Object.keys(player.zones) as (keyof typeof player.zones)[]).forEach((zoneKey) => {
                const zone = player.zones[zoneKey];
                zone.forEach((card) => {
                    // Type guard: check if card is IPlayableCard (has play_requirements, trigger, etc.)
                    if (typeof (card as IPlayableCard).play_requirements !== "undefined" && Array.isArray((card as IPlayableCard).trigger)) {
                        const playableCard = card as IPlayableCard;
                        // Evaluate trigger requirements if present
                        // ignoring this check for now because it needs to be broken out and handled
                        playableCard.trigger.forEach((trigger) => {
                            if (trigger === triggerEvent.trigger) {
                                // handle trigger
                                console.log(`Trigger ${triggerEvent.trigger} matched for card ${playableCard.display_name} (player: ${player.name})`);
                                this.game_action_stack.push({
                                    ...triggerEvent,
                                    event_type: "response",
                                    responder_id: playableCard.id,
                                    response_effects: playableCard.effects || [],
                                    game_state_snapshot: JSON.parse(JSON.stringify(this)), // Deep copy of the game state
                                });
                                this.sendTrigger({
                                    trigger: "on_trigger_response",
                                    event_type: "trigger",
                                    source_id: playableCard.id,
                                    additional_data: {
                                        original_trigger: triggerEvent,
                                        response_card: playableCard,
                                    },
                                    speed: GameActionSpeed.REACTION,
                                });
                            }
                        });
                    }
                });
            });
        };

        // Turn player (action_priority) responds first
        evaluatePlayerZonesForTriggers(this.action_priority);

        // Then the other player gets a chance to respond
        const otherPlayer = this.players.find((p) => p !== this.action_priority);
        if (otherPlayer) {
            evaluatePlayerZonesForTriggers(otherPlayer);
        }
    }

    public resolveGameActionStack(): void {
        while (this.game_action_stack.length > 0) {
            const gameAction = this.game_action_stack.pop() as ITriggerEvent | ITriggerResponse | IResolutionEvent | undefined;
            switch (gameAction?.event_type) {
                case "trigger":
                    // Handle trigger events
                    console.log("Resolving trigger:", gameAction);
                    // Here you would implement the logic to resolve the trigger
                    this.event_log.push({
                        entry: this.game_action_stack.pop() as ITriggerEvent,
                        timestamp: new Date().toISOString(),
                        turn_number: this.current_turn_number,
                        turn_phase: this.current_turn_phase,
                        turn_player: this.turn_player,
                    });
                    break;
                case "response":
                    // Handle trigger responses
                    console.log("Resolving response:", gameAction);
                    // Here you would implement the logic to resolve the response
                    break;
                case "resolution":
                    // Handle resolution events
                    console.log("Resolving resolution event:", gameAction);
                    // Here you would implement the logic to resolve the resolution
                    break;
                default:
                    console.warn(`Unknown game action type: ${(gameAction as any)?.event_type}`);
            }
        }
    }
}

export default GameStateEngine;
