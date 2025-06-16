import { IPlayerInfo, ICardInfo, ISummonSlot } from "../../../data/db";
import db from "../../../data/db";
import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { BoardManager } from "../managers/BoardManager";

// SummonUnit type for real stats
interface SummonUnit {
    card: ICardInfo;
    x: number;
    y: number;
    sprite: Phaser.GameObjects.Arc;
    level: number;
    stats: Record<string, number>;
    maxHP: number;
    currentHP: number;
    movement: number;
    controller: "player" | "opponent";
    remainingMovement: number; // NEW: movement left this turn
    hasAttacked: boolean; // NEW: can attack this turn?
    attackRange?: number; // weapon range (default 1)
    equippedWeapon?: ICardInfo | null; // NEW: hydrated weapon
}

class PlayerZones {
    hand: ISummonSlot[];
    mainDeck: ICardInfo[];
    discard: ICardInfo[];
    recharge: ICardInfo[];
    advanceDeck: ICardInfo[];
    constructor(loadout: any) {
        this.hand = [loadout.deck.summon_slot_1, loadout.deck.summon_slot_2, loadout.deck.summon_slot_3];
        this.mainDeck = shuffle(loadout.deck.main_deck);
        this.discard = [];
        this.recharge = [];
        this.advanceDeck = loadout.deck.advance_deck;
    }
}

export function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

interface InPlayZone {
    cardInPlay: string | null;
    controller: string | null;
    hidden: boolean;
}

enum GamePhase {
    DRAW,
    LEVEL_UP,
    MAIN,
    END,
}

// Helper: Check if a card is a Summon card
function isSummonCard(cardOrSlot: ICardInfo | ISummonSlot) {
    if ((cardOrSlot as ISummonSlot).summon) {
        cardOrSlot = (cardOrSlot as ISummonSlot).summon as ICardInfo;
    }
    const cardType = (cardOrSlot as ICardInfo).card_type;
    return !!cardType && cardType.includes("summon");
}

export class Game extends Scene {
    playerInfo: IPlayerInfo;
    opponentInfo: IPlayerInfo;
    playerDeck: any;
    opponentDeck: any;

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    inPlayZone: InPlayZone[];
    playerZones: PlayerZones;
    opponentZones: PlayerZones;

    turn: number = 0;
    playersTurn: boolean;
    turnSummonUsed: boolean = false;
    cardDrawnThisTurn: boolean = false;
    phase: GamePhase = GamePhase.DRAW;

    turnPhaseText: Phaser.GameObjects.Text;
    advanceTurnbutton: Phaser.GameObjects.Text;

    handCardsContainer: Phaser.GameObjects.Container;
    mainDeckContainer: Phaser.GameObjects.Container;
    discardContainer: Phaser.GameObjects.Container;
    rechargeContainer: Phaser.GameObjects.Container;
    advanceDeckContainer: Phaser.GameObjects.Container;

    opponentHandCardsContainer: Phaser.GameObjects.Container;
    opponentMainDeckContainer: Phaser.GameObjects.Container;
    opponentDiscardContainer: Phaser.GameObjects.Container;
    opponentRechargeContainer: Phaser.GameObjects.Container;
    opponentAdvanceDeckContainer: Phaser.GameObjects.Container;

    inPlayZoneContainer: Phaser.GameObjects.Container;
    inPlayZoneBackground: Phaser.GameObjects.Rectangle;
    cardDetailsContainer: Phaser.GameObjects.Container;
    cardDetailsBackground: Phaser.GameObjects.Rectangle;
    cardActionsPanel: Phaser.GameObjects.Container;

    summonPlacementMode: boolean = false;
    summonCardToPlay: ISummonSlot | null = null;
    summonPlacementHighlights: Phaser.GameObjects.Rectangle[] = [];
    summonUnits: SummonUnit[] = [];

    boardManager: BoardManager;

    testMode: boolean = true; // Set to true for hotseat/test mode, false for normal play

    // --- Private fields for movement UI state ---
    private _summonMoveHighlights: Phaser.GameObjects.Shape[] = [];
    private _summonMoveModeUnit: SummonUnit | null = null;
    private _summonActionMenu: Phaser.GameObjects.Container | undefined;

    constructor() {
        super("Game");
    }

    init(data: { activePlayerInfo: IPlayerInfo; opponentPlayerInfo: IPlayerInfo }) {
        this.playerInfo = data.activePlayerInfo;
        this.opponentInfo = data.opponentPlayerInfo;

        if (!this.playerInfo || !this.opponentInfo) {
            console.error("Player or opponent information is missing");
            throw new Error("Player or opponent information is missing");
        }

        this.playerDeck = db.hydrateDeckById(this.playerInfo?.active_deck);
        this.opponentDeck = db.hydrateDeckById(this.opponentInfo?.active_deck);

        if (!this.playerDeck || !this.opponentDeck) {
            console.error("Player or opponent deck information is missing");
            throw new Error("Player or opponent deck information is missing");
        }
    }

    create() {
        this.camera = this.cameras.main;

        this.background = this.add.image(512, 384, "background");
        this.turnPhaseText = this.add.text(700, 10, "");
        this.advanceTurnbutton = this.add
            .text(890, 720, "End Turn", { fontSize: "24px", color: "#fff" })
            .setInteractive()
            .on("pointerdown", () => {
                this.advanceTurn();
            });
        this.background.setAlpha(0.5);

        // Use BoardManager for board/grid
        this.boardManager = new BoardManager(this);

        this.inPlayZone = [];
        const inPlayZoneOrigin = [835, 360];
        this.inPlayZoneContainer = this.add.container(...inPlayZoneOrigin);
        this.inPlayZoneBackground = new Phaser.GameObjects.Rectangle(this, 0, 0, 250, 14 * 32, 0x000000, 0.1).setOrigin(0.5);
        this.inPlayZoneContainer.add(this.inPlayZoneBackground);

        this.cardDetailsContainer = this.add.container(160, 360);
        this.cardDetailsBackground = new Phaser.GameObjects.Rectangle(this, 0, 0, 305, 14 * 32, 0x000000, 0.1).setOrigin(0.5);
        this.cardDetailsContainer.add(this.cardDetailsBackground);

        this.playerZones = new PlayerZones(this.playerDeck);
        this.opponentZones = new PlayerZones(this.opponentDeck);

        this.playersTurn = true;

        // Only create containers ONCE
        if (!this.handCardsContainer) {
            this.handCardsContainer = this.add.container(0, 0);
        }
        if (this.testMode && !this.opponentHandCardsContainer) {
            this.opponentHandCardsContainer = this.add.container(0, 0);
        }

        // --- Render initial Summon hands for both players ---
        this.summonDraw(true);
        if (this.testMode) {
            this.summonDraw(false);
        }

        // Start game
        this.advanceTurn();

        // Initial hand rendering is handled by advanceTurn
        this.input.on("gameobjectdown", (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            if (this.summonPlacementMode && gameObject.getData("summonSpace") && this.summonCardToPlay) {
                const { x, y } = gameObject.getData("summonSpace");
                this.placeSummonUnit(this.summonCardToPlay, x, y);
                this.exitSummonPlacementMode();
                this.highlightMovableSummons(); // Highlight movable Summons after placement
            }
        });

        EventBus.emit("current-scene-ready", this);
        this.highlightMovableSummons(); // Initial highlight
    }

    update() {
        this.turnPhaseText.setText(`${this.playersTurn ? "Your" : "Opponent's "} Turn: ${this.turn} | Phase: ${GamePhase[this.phase]}`);
    }

    playerDraw() {
        if (this.playerZones.mainDeck.length > 0) {
            const drawnCard = this.playerZones.mainDeck.pop();
            if (drawnCard) {
                // Add to hand (mainDeck is ICardInfo[], hand is ISummonSlot[] for Summons, but for main deck, hand is just ICardInfo[])
                // If you want to support both, you may need to distinguish between Summon and non-Summon cards
                (this.playerZones as any).hand.push(drawnCard);
                // Redraw hand
                this.handCardsContainer.removeAll(true);
                for (let i = 0; i < this.playerZones.hand.length; i++) {
                    this.createCardInHand(this.playerZones.hand[i], i, this.playerZones.hand.length, true, this.playersTurn);
                }
            }
        }
    }

    opponentDraw() {
        if (this.opponentZones.mainDeck.length > 0) {
            const drawnCard = this.opponentZones.mainDeck.pop();
            if (drawnCard) {
                (this.opponentZones as any).hand.push(drawnCard);
                this.opponentHandCardsContainer.removeAll(true);
                for (let i = 0; i < this.opponentZones.hand.length; i++) {
                    this.createCardInHand(this.opponentZones.hand[i], i, this.opponentZones.hand.length, false, !this.playersTurn);
                }
            }
        }
    }

    // Highlight playable Summon cards and add click handler
    // Update createCardInHand to accept ISummonSlot for hand
    createCardInHand(cardOrSlot: ICardInfo | ISummonSlot, index: number, total: number, isPlayerHand: boolean, isActiveHand: boolean) {
        let card: ICardInfo;
        let equippedWeapon: ICardInfo | null = null;
        if ((cardOrSlot as ISummonSlot).summon) {
            card = (cardOrSlot as ISummonSlot).summon as ICardInfo;
            equippedWeapon = (cardOrSlot as ISummonSlot).equipment?.weapon as ICardInfo;
        } else {
            card = cardOrSlot as ICardInfo;
        }
        const cardWidth = 100;
        const cardHeight = 150;
        const screenWidth = this.scale.width;
        const handY = isPlayerHand ? this.scale.height - cardHeight / 2 - 20 : cardHeight / 2 + 20;
        const gutter = 10;
        const totalWidth = total * cardWidth + (total - 1) * gutter;
        const startX = (screenWidth - totalWidth) / 2 + cardWidth / 2;
        const x = startX + index * (cardWidth + gutter);
        let highlightRect: Phaser.GameObjects.Rectangle | null = null;
        // Highlight if playable (only for active hand)
        if (isSummonCard(cardOrSlot) && !this.turnSummonUsed && isActiveHand) {
            highlightRect = this.add.rectangle(x, handY, cardWidth + 12, cardHeight + 12, 0xfff700, 0.25).setOrigin(0.5);
            if (isPlayerHand) {
                this.handCardsContainer.add(highlightRect);
            } else {
                this.opponentHandCardsContainer.add(highlightRect);
            }
        }
        const cardRect = this.add.rectangle(x, handY, cardWidth, cardHeight, 0xffffff, 0.85).setStrokeStyle(2, 0x000000).setOrigin(0.5);
        cardRect
            .setInteractive()
            .on("pointerover", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: false, repeat: 0 });
                if (highlightRect) {
                    this.tweens.add({ targets: highlightRect, alpha: 0.5, duration: 100, yoyo: false, repeat: 0 });
                }
                this.showCardDetails(card);
            })
            .on("pointerout", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1, scaleY: 1, duration: 100, yoyo: false, repeat: 0 });
                if (highlightRect) {
                    this.tweens.add({ targets: highlightRect, alpha: 0.25, duration: 100, yoyo: false, repeat: 0 });
                }
                this.hideCardDetails();
            });
        // Playable Summon card click (only for active hand)
        if (isSummonCard(cardOrSlot) && !this.turnSummonUsed && isActiveHand) {
            cardRect.setStrokeStyle(2, 0xfff700);
            cardRect.on("pointerdown", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: false, repeat: 0 });
                this.enterSummonPlacementMode(cardOrSlot, cardRect); // Pass slot
            });
        }
        const cardLabel = card.display_name || card.name || "Card";
        const cardText = this.add
            .text(x, handY - cardHeight / 2 + 10, cardLabel, {
                fontSize: "16px",
                color: "#000",
                fontFamily: "Arial",
                align: "center",
                wordWrap: { width: cardWidth - 10 },
            })
            .setOrigin(0.5, 0);
        if (highlightRect) {
            if (isPlayerHand) {
                this.handCardsContainer.add(highlightRect);
            } else {
                this.opponentHandCardsContainer.add(highlightRect);
            }
        }
        if (isPlayerHand) {
            this.handCardsContainer.add(cardRect);
            this.handCardsContainer.add(cardText);
        } else {
            this.opponentHandCardsContainer.add(cardRect);
            this.opponentHandCardsContainer.add(cardText);
        }
    }

    // Create card in opponent hand (for test mode)
    createCardInOpponentHand(card: ICardInfo, index: number, total: number, startX: number, handY: number) {
        const cardWidth = 100;
        const cardHeight = 150;
        const x = startX + index * (cardWidth + 10);
        let highlightRect: Phaser.GameObjects.Rectangle | null = null;
        if (isSummonCard(card) && !this.turnSummonUsed && !this.playersTurn && this.testMode) {
            highlightRect = this.add.rectangle(x, handY, cardWidth + 12, cardHeight + 12, 0xfff700, 0.25).setOrigin(0.5);
            this.opponentHandCardsContainer.add(highlightRect);
        }
        const cardRect = this.add.rectangle(x, handY, cardWidth, cardHeight, 0xffffff, 0.85).setStrokeStyle(2, 0x000000).setOrigin(0.5);
        cardRect
            .setInteractive()
            .on("pointerover", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: false, repeat: 0 });
                if (highlightRect) {
                    this.tweens.add({ targets: highlightRect, alpha: 0.5, duration: 100, yoyo: false, repeat: 0 });
                }
                this.showCardDetails(card);
            })
            .on("pointerout", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1, scaleY: 1, duration: 100, yoyo: false, repeat: 0 });
                if (highlightRect) {
                    this.tweens.add({ targets: highlightRect, alpha: 0.25, duration: 100, yoyo: false, repeat: 0 });
                }
                this.hideCardDetails();
            });
        if (isSummonCard(card) && !this.turnSummonUsed && !this.playersTurn && this.testMode) {
            cardRect.setStrokeStyle(2, 0xfff700);
            cardRect.on("pointerdown", () => {
                this.tweens.add({ targets: cardRect, scaleX: 1.1, scaleY: 1.1, duration: 100, yoyo: false, repeat: 0 });
                this.enterSummonPlacementMode(card, cardRect);
            });
        }
        const cardLabel = card.display_name || card.name || "Card";
        const cardText = this.add
            .text(x, handY - cardHeight / 2 + 10, cardLabel, {
                fontSize: "16px",
                color: "#000",
                fontFamily: "Arial",
                align: "center",
                wordWrap: { width: cardWidth - 10 },
            })
            .setOrigin(0.5, 0);
        if (highlightRect) this.opponentHandCardsContainer.add(highlightRect);
        this.opponentHandCardsContainer.add(cardRect);
        this.opponentHandCardsContainer.add(cardText);
    }

    // Utility: Map growth rate value to symbol
    getGrowthSymbol(val: number | undefined): string {
        if (val === undefined) return "";
        if (val === 0.5) return "--";
        if (val === 0.66) return "-";
        if (val === 1.0) return "_";
        if (val === 1.33) return "+";
        if (val === 1.5) return "++";
        if (val === 2.0) return "*";
        return val.toString();
    }

    // Utility: Render card details in the cardDetailsContainer
    showCardDetails(cardOrUnit: ICardInfo | SummonUnit) {
        // If background already exists, just clear children except bg
        let bg = this.cardDetailsContainer.getAt(0) as Phaser.GameObjects.Rectangle;
        if (!bg) {
            const width = 280;
            const height = 340;
            bg = this.add.rectangle(0, 0, width, height, 0xffffff, 0.95).setStrokeStyle(2, 0x888888).setOrigin(0.5);
            this.cardDetailsContainer.add(bg);
        }
        // Remove all except bg
        while (this.cardDetailsContainer.length > 1) this.cardDetailsContainer.removeAt(1, true);
        const width = 280;
        const height = 340;
        let yPos = -height / 2 + 16;
        const addText = (text: string, style: any = {}) => {
            const t = this.add
                .text(0, yPos, text, { fontSize: "16px", color: "#222", fontFamily: "Arial", align: "center", wordWrap: { width: width - 24 }, ...style })
                .setOrigin(0.5, 0);
            this.cardDetailsContainer.add(t);
            yPos += t.height + 6;
        };
        // If SummonUnit, show current stats
        const isUnit = (obj: any): obj is SummonUnit => "level" in obj && "stats" in obj;
        if (isUnit(cardOrUnit)) {
            const unit = cardOrUnit;
            const card = unit.card;
            addText((card.display_name || card.name || "Card") + `  (Lv.${unit.level})`, { fontSize: "20px", fontStyle: "bold", color: "#222" });
            if (card.species) addText(`Species: ${card.species}`);
            if (card.card_type) addText(`Type: ${card.card_type}`);
            if (card.attribute) addText(`Attribute: ${card.attribute}`);
            if (card.rarity) addText(`Rarity: ${card.rarity}`);
            if (card.description) addText(card.description, { fontSize: "14px", color: "#444" });
            // 3x3 Stat Grid (current stats)
            const statOrder = ["STR", "END", "DEF", "INT", "SPI", "MDF", "SPD", "LCK", "ACC"];
            yPos += 4;
            const statGridY = yPos;
            const cellW = 90,
                cellH = 24;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const stat = statOrder[row * 3 + col];
                    const val = unit.stats[stat] !== undefined ? unit.stats[stat] : "";
                    const tx = -width / 2 + 16 + col * cellW + cellW / 2;
                    const ty = statGridY + row * cellH;
                    const t = this.add.text(tx, ty, `${stat}: ${val}`, { fontSize: "14px", color: "#222", fontFamily: "Arial" }).setOrigin(0.5, 0);
                    this.cardDetailsContainer.add(t);
                }
            }
            yPos = statGridY + 3 * cellH + 6;
            addText(`HP: ${unit.currentHP} / ${unit.maxHP}`);
            addText(`Movement: ${unit.movement}`);
            if (card.effects && card.effects.length > 0) {
                addText("Effects:", { fontWeight: "bold", fontSize: "15px", color: "#333" });
                for (const effect of card.effects) {
                    addText(`  ${effect.type || JSON.stringify(effect)}`);
                }
            }
            if (card.flavor_text) addText(`"${card.flavor_text}"`, { fontStyle: "italic", color: "#666", fontSize: "13px" });
        } else {
            // ...existing code for ICardInfo...
            const card = cardOrUnit;
            addText(card.display_name || card.name || "Card", { fontSize: "20px", fontStyle: "bold", color: "#222" });
            if (card.species) addText(`Species: ${card.species}`);
            if (card.card_type) addText(`Type: ${card.card_type}`);
            if (card.attribute) addText(`Attribute: ${card.attribute}`);
            if (card.rarity) addText(`Rarity: ${card.rarity}`);
            if (card.description) addText(card.description, { fontSize: "14px", color: "#444" });
            const statOrder = ["STR", "END", "DEF", "INT", "SPI", "MDF", "SPD", "LCK", "ACC"];
            if (card.base_stats) {
                yPos += 4;
                const statGridY = yPos;
                const cellW = 90,
                    cellH = 24;
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const stat = statOrder[row * 3 + col];
                        const val = card.base_stats[stat] !== undefined ? card.base_stats[stat] : "";
                        const growth = card.growth_rates ? this.getGrowthSymbol(card.growth_rates[stat]) : "";
                        const tx = -width / 2 + 16 + col * cellW + cellW / 2;
                        const ty = statGridY + row * cellH;
                        const t = this.add
                            .text(tx, ty, `${stat}: ${val}${growth ? " " + growth : ""}`, { fontSize: "14px", color: "#222", fontFamily: "Arial" })
                            .setOrigin(0.5, 0);
                        this.cardDetailsContainer.add(t);
                    }
                }
                yPos = statGridY + 3 * cellH + 6;
            }
            if (card.effects && card.effects.length > 0) {
                addText("Effects:", { fontWeight: "bold", fontSize: "15px", color: "#333" });
                for (const effect of card.effects) {
                    addText(`  ${effect.type || JSON.stringify(effect)}`);
                }
            }
            if (card.flavor_text) addText(`"${card.flavor_text}"`, { fontStyle: "italic", color: "#666", fontSize: "13px" });
        }
    }

    hideCardDetails() {
        // Only clear info, keep bg
        while (this.cardDetailsContainer.length > 1) this.cardDetailsContainer.removeAt(1, true);
    }

    enterSummonPlacementMode(cardOrSlot: ICardInfo | ISummonSlot, _cardRect: Phaser.GameObjects.Rectangle) {
        if (this.turnSummonUsed) {
            // Clean up any leftover highlights if user tries to enter again
            this.summonPlacementHighlights.forEach((r) => r.destroy());
            this.summonPlacementHighlights = [];
            return;
        }
        if ((cardOrSlot as ISummonSlot).summon) {
            this.summonCardToPlay = cardOrSlot as ISummonSlot;
        } else {
            return;
        }
        this.summonPlacementMode = true;
        // Highlight valid spaces for the current turn's player
        const controller = this.playersTurn ? "player" : "opponent";
        const validSpaces = this.boardManager.getValidSummonSpaces(controller);
        console.log(`Valid summon spaces for ${controller}:`, validSpaces); // DEBUG
        // If no valid spaces, show a message (optional)
        if (validSpaces.length === 0) {
            // Optionally show a message to the user
            return;
        }
        const highlightColor = this.playersTurn ? 0x00ff00 : 0xff0000;
        this.summonPlacementHighlights = this.boardManager.highlightCells(validSpaces, highlightColor, 0.3);
        this.summonPlacementHighlights.forEach((rect) => {
            rect.setInteractive();
            rect.setData(
                "summonSpace",
                validSpaces.find((s) => {
                    const px = 512 - (12 * 32) / 2 + s.x * 32 + 16;
                    const py = 360 - (14 * 32) / 2 + s.y * 32 + 16;
                    return rect.x === px && rect.y === py;
                }),
            );
        });
    }

    exitSummonPlacementMode() {
        this.summonPlacementMode = false;
        this.summonCardToPlay = null;
        this.summonPlacementHighlights.forEach((r) => r.destroy());
        this.summonPlacementHighlights = [];
        // Also clear any leftover move/attack highlights
        if (this._summonMoveHighlights) {
            this._summonMoveHighlights.forEach((h) => h.destroy());
            this._summonMoveHighlights = [];
        }
    }

    // --- Exit move/attack mode ---
    exitSummonMoveMode() {
        if (this._summonMoveHighlights) {
            for (const g of this._summonMoveHighlights) g.destroy();
            this._summonMoveHighlights = [];
        }
        // Remove ONLY pointerdown listeners for move/attack selection
        for (const unit of this.summonUnits) {
            if (unit.sprite.off) {
                unit.sprite.off("pointerdown");
            }
        }
        this._summonMoveModeUnit = null;
        this.input.off("gameobjectdown", this._onMoveSpaceClick, this);
    }

    // --- After placing or updating Summons, always call this to ensure hover works ---
    createSummonUnitHover() {
        for (const unit of this.summonUnits) {
            // Remove any previous hover listeners to avoid duplicates
            if (unit.sprite.off) {
                unit.sprite.off("pointerover");
                unit.sprite.off("pointerout");
            }
            unit.sprite.setInteractive();
            unit.sprite.on("pointerover", () => {
                this.showCardDetails(unit);
            });
            unit.sprite.on("pointerout", () => {
                this.hideCardDetails();
            });
        }
    }

    placeSummonUnit(slot: ISummonSlot, x: number, y: number) {
        const card = slot.summon as ICardInfo;
        const equippedWeapon = slot.equipment?.weapon as ICardInfo;
        // Place a visible circle on the grid
        const isPlayer = this.playersTurn;
        const color = isPlayer ? 0x00aaff : 0xff2222;
        const cellWidth = 32;
        const cellHeight = 32;
        const px = 512 - (12 * 32) / 2 + x * cellWidth + cellWidth / 2;
        const py = 360 - (14 * 32) / 2 + y * cellHeight + cellHeight / 2;
        const circle = this.add.circle(px, py, 14, color, 0.8).setStrokeStyle(2, 0x000000);
        const level = 5;
        const { stats, maxHP, movement } = this.calculateSummonStats(card, level);
        const controller: "player" | "opponent" = isPlayer ? "player" : "opponent";
        // Use equipped weapon for range and power if present
        const attackRange = equippedWeapon?.attack_range ?? card.attack_range ?? 1;
        const summonUnit: SummonUnit = {
            card,
            x,
            y,
            sprite: circle,
            level,
            stats,
            maxHP,
            currentHP: maxHP,
            movement,
            controller,
            remainingMovement: movement,
            hasAttacked: false,
            attackRange,
            equippedWeapon,
        };
        this.summonUnits.push(summonUnit);
        this.boardManager.board[y][x].occupied.summon = card.id;
        // Remove from hand (by slot)
        const zones = isPlayer ? this.playerZones : this.opponentZones;
        const handIdx = zones.hand.findIndex((c) => (c.summon as ICardInfo)?.id === card.id);
        if (handIdx !== -1) {
            zones.hand.splice(handIdx, 1);
        }
        // Redraw correct hand
        if (isPlayer) {
            this.handCardsContainer.removeAll(true);
            for (let i = 0; i < this.playerZones.hand.length; i++) {
                this.createCardInHand(this.playerZones.hand[i], i, this.playerZones.hand.length, true, this.playersTurn);
            }
        } else if (this.testMode) {
            this.opponentHandCardsContainer.removeAll(true);
            for (let i = 0; i < this.opponentZones.hand.length; i++) {
                this.createCardInHand(this.opponentZones.hand[i], i, this.opponentZones.hand.length, false, !this.playersTurn);
            }
        }
        this.turnSummonUsed = true;
        this.exitSummonPlacementMode(); // This will clear highlights
        this.createSummonUnitHover();
        // --- Summon draw: refill Summon hand after playing a Summon ---
        this.summonDraw(isPlayer);
    }

    // Update summonDraw to support both players
    summonDraw(isPlayer: boolean) {
        // No-op: Summon hand is fixed at start, no further draws
        // Only redraw hand UI
        if (isPlayer) {
            this.handCardsContainer.removeAll(true);
            for (let i = 0; i < this.playerZones.hand.length; i++) {
                this.createCardInHand(this.playerZones.hand[i], i, this.playerZones.hand.length, true, this.playersTurn);
            }
        } else if (this.testMode) {
            this.opponentHandCardsContainer.removeAll(true);
            for (let i = 0; i < this.opponentZones.hand.length; i++) {
                this.createCardInHand(this.opponentZones.hand[i], i, this.opponentZones.hand.length, false, !this.playersTurn);
            }
        }
    }

    // Utility: Get the zones and hand for the current turn
    getActiveZonesAndHand() {
        if (!this.testMode) {
            return this.playersTurn ? this.playerZones : this.opponentZones;
        } else {
            // In test mode, always allow acting for the current turn's player
            return this.playersTurn ? this.playerZones : this.opponentZones;
        }
    }

    // Utility: Is it the local player's turn (for UI highlights, etc.)
    isActivePlayerTurn() {
        return this.playersTurn || this.testMode;
    }

    // --- Stat calculation helpers ---
    calculateSummonStats(card: ICardInfo, level: number): { stats: Record<string, number>; maxHP: number; movement: number } {
        const classMod = 1;
        const statOrder = ["STR", "END", "DEF", "INT", "SPI", "MDF", "SPD", "LCK", "ACC"];
        const stats: Record<string, number> = {};
        for (const stat of statOrder) {
            const base = card.base_stats?.[stat] ?? 0;
            const growth = card.growth_rates?.[stat] ?? 0;
            stats[stat] = Math.floor(base + Math.floor(level * growth)) * classMod;
        }
        const maxHP = 50 + Math.floor(Math.pow(stats.END, 1.5));
        const movement = 2 + Math.floor((stats.SPD - 10) / 5);
        return { stats, maxHP, movement };
    }

    // --- Level up all summons and recalculate stats ---
    levelUpAllSummons() {
        for (const unit of this.summonUnits) {
            unit.level += 1;
            const { stats, maxHP, movement } = this.calculateSummonStats(unit.card, unit.level);
            unit.stats = stats;
            // Optionally heal or keep currentHP capped at new max
            unit.currentHP = Math.min(unit.currentHP + (maxHP - unit.maxHP), maxHP);
            unit.maxHP = maxHP;
            unit.movement = movement;
            unit.remainingMovement = movement; // Reset movement on level up
        }
    }

    // --- Reset movement and attack for all summons of the current controller at turn start ---
    resetSummonMovementForTurn(controller: "player" | "opponent") {
        for (const unit of this.summonUnits) {
            if (unit.controller === controller) {
                unit.remainingMovement = unit.movement;
                unit.hasAttacked = false; // Reset attack at turn start
            }
        }
    }

    advanceTurn() {
        if (this.phase === GamePhase.DRAW) {
            this.turnSummonUsed = false;
            // Reset movement for all Summons of the current controller
            const controller: "player" | "opponent" = this.playersTurn ? "player" : "opponent";
            this.resetSummonMovementForTurn(controller);
            // Draw a card for the active player at the start of their turn, EXCEPT for the very first turn
            if (!(this.turn === 0 && this.playersTurn)) {
                if (this.playersTurn) {
                    this.playerDraw();
                } else {
                    this.opponentDraw();
                }
            }
            // Clear any leftover summon highlights at the start of turn
            this.summonPlacementHighlights.forEach((r) => r.destroy());
            this.summonPlacementHighlights = [];
            this.phase = GamePhase.LEVEL_UP;
            this.advanceTurn();
        } else if (this.phase === GamePhase.LEVEL_UP) {
            if (this.playersTurn) {
                this.levelUpAllSummons();
            }
            this.phase = GamePhase.MAIN;
            console.log(this);
        } else if (this.phase === GamePhase.MAIN) {
            this.phase = GamePhase.END;
            this.advanceTurn();
        } else if (this.phase === GamePhase.END) {
            this.turn++;
            this.playersTurn = !this.playersTurn;
            this.phase = GamePhase.DRAW;
            this.advanceTurn();
        }
    }

    // --- Highlight Summons for menu selection only ---
    highlightMovableSummons() {
        if (!this._summonMoveHighlights) this._summonMoveHighlights = [];
        for (const g of this._summonMoveHighlights) g.destroy();
        this._summonMoveHighlights = [];
        const controller: "player" | "opponent" = this.playersTurn ? "player" : "opponent";
        for (const unit of this.summonUnits) {
            if (unit.controller === controller && (unit.remainingMovement > 0 || !unit.hasAttacked)) {
                const glow = this.add.circle(unit.sprite.x, unit.sprite.y, 18, 0x00ffcc, 0.18).setDepth(unit.sprite.depth - 1);
                this._summonMoveHighlights.push(glow);
                unit.sprite.setInteractive();
                unit.sprite.on("pointerdown", () => {
                    this.showSummonActionMenu(unit);
                });
            } else {
                unit.sprite.disableInteractive();
            }
        }
    }

    // --- Enter action mode for a Summon (move or attack) ---
    enterSummonActionMode(unit: SummonUnit) {
        this.exitSummonMoveMode(); // Clean up any previous
        this._summonMoveModeUnit = unit;
        // If can move, highlight move spaces
        if (unit.remainingMovement > 0) {
            const validSpaces = this.boardManager.getValidMoveSpaces(unit.x, unit.y, unit.remainingMovement);
            this._summonMoveHighlights = this.boardManager.highlightCells(validSpaces, 0x00ffcc, 0.35);
            for (const rect of this._summonMoveHighlights) {
                rect.setInteractive();
                rect.setData(
                    "moveSpace",
                    validSpaces.find((s) => {
                        const px = rect.x;
                        const py = rect.y;
                        const cellWidth = 32,
                            cellHeight = 32;
                        const expectedX = 512 - (12 * 32) / 2 + s.x * cellWidth + cellWidth / 2;
                        const expectedY = 360 - (14 * 32) / 2 + s.y * cellHeight + cellHeight / 2;
                        return px === expectedX && py === expectedY;
                    }),
                );
            }
        }
        // If can attack, highlight enemy units in range
        if (!unit.hasAttacked) {
            const enemiesInRange = this.summonUnits.filter(
                (other) => other.controller !== unit.controller && this.manhattanDist(unit.x, unit.y, other.x, other.y) <= (unit.attackRange ?? 1),
            );
            for (const enemy of enemiesInRange) {
                const atkGlow = this.add.circle(enemy.sprite.x, enemy.sprite.y, 18, 0xff3300, 0.35).setDepth(enemy.sprite.depth - 1);
                this._summonMoveHighlights.push(atkGlow);
                enemy.sprite.setInteractive();
                enemy.sprite.on("pointerdown", () => {
                    this.attackWithSummon(unit, enemy);
                });
            }
        }
        // Listen for clicks on highlighted spaces
        this.input.on("gameobjectdown", this._onMoveSpaceClick, this);
        // Show action menu
        this.showSummonActionMenu(unit);
    }

    // --- Handler for clicking a move space (reuse for move/attack mode) ---
    _onMoveSpaceClick(_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (!this._summonMoveModeUnit) return;
        if (gameObject.getData("moveSpace")) {
            const { x, y } = gameObject.getData("moveSpace");
            this.moveSummonUnit(this._summonMoveModeUnit, x, y);
            this.exitSummonMoveMode();
            this.highlightMovableSummons();
        }
    }

    // --- Manhattan distance helper ---
    manhattanDist(x1: number, y1: number, x2: number, y2: number) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    // --- Attack logic ---
    attackWithSummon(attacker: SummonUnit, defender: SummonUnit) {
        // --- To Hit ---
        const acc = attacker.stats.ACC ?? 0;
        const toHit = 90 + acc / 10; // percent
        const hitRoll = Math.random() * 100;
        let hit = hitRoll < toHit;
        // --- Crit ---
        const lck = attacker.stats.LCK ?? 0;
        const critRate = Math.floor(lck * 0.3375 + 1.65);
        const critRoll = Math.random() * 100;
        let isCrit = false;
        if (hit && critRoll < critRate) isCrit = true;
        // --- Damage ---
        let damage = 0;
        if (hit) {
            const str = attacker.stats.STR ?? 0;
            const def = defender.stats.DEF ?? 1; // avoid div by 0
            // Use equipped weapon's base_power if present
            const weaponPower = attacker.equippedWeapon?.base_power ?? attacker.card.base_power ?? 0;
            const critMult = isCrit ? 1.5 : 1.0;
            damage = Math.round(str * (1 + weaponPower / 100) * (str / def) * critMult);
            defender.currentHP -= damage;
        }
        attacker.hasAttacked = true;
        // Show popup
        this.showAttackPopup(defender.sprite.x, defender.sprite.y, hit, isCrit, damage);
        // Remove if dead
        if (defender.currentHP <= 0) {
            this.boardManager.board[defender.y][defender.x].occupied.summon = null;
            defender.sprite.destroy();
            this.summonUnits = this.summonUnits.filter((u) => u !== defender);
        }
        this.exitSummonMoveMode();
        this.highlightMovableSummons();
    }

    // --- Show attack result popup ---
    showAttackPopup(x: number, y: number, hit: boolean, crit: boolean, damage: number) {
        let text = "Miss!";
        if (hit) {
            text = crit ? `CRIT! -${damage}` : `-${damage}`;
        }
        const popup = this.add
            .text(x, y - 24, text, {
                fontSize: crit ? "22px" : "18px",
                color: crit ? "#ff0" : hit ? "#fff" : "#f44",
                fontStyle: crit ? "bold" : "normal",
                stroke: "#000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        this.tweens.add({
            targets: popup,
            y: y - 48,
            alpha: 0,
            duration: 900,
            onComplete: () => popup.destroy(),
        });
    }

    // --- Show action menu for a Summon ---
    showSummonActionMenu(unit: SummonUnit) {
        this.hideSummonActionMenu();
        // Create a container for the menu
        const menu = this.add.container();
        const menuX = unit.sprite.x + 30;
        const menuY = unit.sprite.y - 30;
        // Background
        const bg = this.add.rectangle(menuX, menuY, 90, 90, 0x222222, 0.95).setOrigin(0.5);
        menu.add(bg);
        let btnY = menuY - 20;
        // Move button
        if (unit.remainingMovement > 0) {
            const moveBtn = this.add
                .text(menuX, btnY, "Move", { fontSize: "18px", color: "#fff", backgroundColor: "#444" })
                .setOrigin(0.5)
                .setInteractive()
                .on("pointerdown", () => {
                    this.hideSummonActionMenu();
                    this.enterSummonMoveMode(unit);
                });
            menu.add(moveBtn);
            btnY += 28;
        }
        // Only show Attack if there is a valid target in range
        const enemiesInRange = this.summonUnits.filter(
            (other) => other.controller !== unit.controller && this.manhattanDist(unit.x, unit.y, other.x, other.y) <= (unit.attackRange ?? 1),
        );
        if (!unit.hasAttacked && enemiesInRange.length > 0) {
            const attackBtn = this.add
                .text(menuX, btnY, "Attack", { fontSize: "18px", color: "#fff", backgroundColor: "#a33" })
                .setOrigin(0.5)
                .setInteractive()
                .on("pointerdown", () => {
                    this.hideSummonActionMenu();
                    this.enterSummonAttackMode(unit);
                });
            menu.add(attackBtn);
            btnY += 28;
        }
        // Cancel button
        const cancelBtn = this.add
            .text(menuX, btnY, "Cancel", { fontSize: "16px", color: "#fff", backgroundColor: "#666" })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.hideSummonActionMenu();
                this.highlightMovableSummons();
            });
        menu.add(cancelBtn);
        this._summonActionMenu = menu;
    }

    hideSummonActionMenu() {
        if (this._summonActionMenu) {
            this._summonActionMenu.destroy();
            this._summonActionMenu = undefined;
            // Always restore Summon interactivity after menu closes
            this.highlightMovableSummons();
        }
    }

    // --- Move a Summon to a new space ---
    moveSummonUnit(unit: SummonUnit, newX: number, newY: number) {
        // Remove from old board position
        this.boardManager.board[unit.y][unit.x].occupied.summon = null;
        // Calculate distance BEFORE updating unit.x/unit.y
        const dist = Math.abs(unit.x - newX) + Math.abs(unit.y - newY);
        // Move sprite visually
        const cellWidth = 32,
            cellHeight = 32;
        const px = 512 - (12 * 32) / 2 + newX * cellWidth + cellWidth / 2;
        const py = 360 - (14 * 32) / 2 + newY * cellHeight + cellHeight / 2;
        unit.sprite.x = px;
        unit.sprite.y = py;
        // Update SummonUnit position
        unit.x = newX;
        unit.y = newY;
        // Mark new board position
        this.boardManager.board[newY][newX].occupied.summon = unit.card.id;
        // Decrement remaining movement by distance moved (Manhattan distance)
        unit.remainingMovement = Math.max(0, unit.remainingMovement - dist);
    }

    // --- Enter move mode for a Summon (from menu) ---
    enterSummonMoveMode(unit: SummonUnit) {
        this.exitSummonMoveMode();
        this._summonMoveModeUnit = unit;
        const validSpaces = this.boardManager.getValidMoveSpaces(unit.x, unit.y, unit.remainingMovement);
        this._summonMoveHighlights = this.boardManager.highlightCells(validSpaces, 0x00ffcc, 0.35);
        for (const rect of this._summonMoveHighlights) {
            rect.setInteractive();
            rect.setData(
                "moveSpace",
                validSpaces.find((s) => {
                    const px = rect.x;
                    const py = rect.y;
                    const cellWidth = 32,
                        cellHeight = 32;
                    const expectedX = 512 - (12 * 32) / 2 + s.x * cellWidth + cellWidth / 2;
                    const expectedY = 360 - (14 * 32) / 2 + s.y * cellHeight + cellHeight / 2;
                    return px === expectedX && py === expectedY;
                }),
            );
        }
        this.input.on("gameobjectdown", this._onMoveSpaceClick, this);
    }

    // --- Enter attack mode for a Summon (from menu) ---
    enterSummonAttackMode(unit: SummonUnit) {
        this.exitSummonMoveMode();
        this._summonMoveModeUnit = unit;
        // Highlight enemy units in range
        const enemiesInRange = this.summonUnits.filter(
            (other) => other.controller !== unit.controller && this.manhattanDist(unit.x, unit.y, other.x, other.y) <= (unit.attackRange ?? 1),
        );
        for (const enemy of enemiesInRange) {
            const atkGlow = this.add.circle(enemy.sprite.x, enemy.sprite.y, 18, 0xff3300, 0.35).setDepth(enemy.sprite.depth - 1);
            this._summonMoveHighlights.push(atkGlow);
            enemy.sprite.setInteractive();
            enemy.sprite.on("pointerdown", () => {
                this.attackWithSummon(unit, enemy);
            });
        }
    }
}
