import db from "../../../data/db";
import { IDeck, IGamePlayer, InHandCard, IPlayerData, IPlayerZones } from "../types/types";
import { generateInstanceId, isMainDeckCard, shuffleDeck } from "./helpers";

export default class GamePlayer implements IGamePlayer {
    id: string;
    name: string;
    active_deck_id: string;
    active_deck: IDeck;
    zones: IPlayerZones;
    victory_points: number = 0;
    quests_completed: string[] = [];

    constructor(playerData: IPlayerData) {
        this.id = playerData.id;
        this.name = playerData.name;
        this.active_deck_id = playerData.active_deck;
        this.active_deck = db.getFullDeckById(this.active_deck_id);
        this.zones = {} as IPlayerZones;
        this.zones.main_deck = [...this.active_deck.deck.main_deck];
        this.zones.advance_deck = [...this.active_deck.deck.advance_deck];
    }

    public shuffleDeck(): void {
        this.zones.main_deck = shuffleDeck(this.zones.main_deck);
    }

    public drawInitialSummonCards(): void {
        this.active_deck.deck.summons.forEach((card) => {
            card.card_id = generateInstanceId(card.summon.id);
            this.zones.hand.push(card);
        });
    }

    public drawCard(): InHandCard | null {
        if (this.zones.main_deck.length < 1) this.rechargeMainDeck();

        const drawnCard = this.zones.main_deck.pop();
        if (drawnCard) {
            this.zones.hand.push(drawnCard);
            return drawnCard as InHandCard;
        } else {
            return null;
        }
    }

    public rechargeMainDeck(): void {
        if (this.zones.recharge.length > 0) {
            const validRecharge = [...this.zones.recharge.filter((card) => isMainDeckCard(card))];
            this.zones.main_deck = shuffleDeck(validRecharge);
            this.zones.recharge = this.zones.recharge.filter((card) => !isMainDeckCard(card));
        }
    }
}
