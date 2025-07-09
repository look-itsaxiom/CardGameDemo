import DATA_RAW from "./db.json";
import {
    ICard,
    IPlayerData,
    IDehydratedDeck,
    IDeck,
    MainDeckCard,
    AdvanceDeckCard,
    ISummonSlotState,
    ISummonSlotCard,
    ISummonCard,
    IRoleCard,
    IEquipmentCard,
    IWeaponCard,
} from "../src/game/types/types";

interface IDBSchema {
    cards: ICard[];
    players: IPlayerData[];
    decks: IDehydratedDeck[];
}

class Database {
    private data: IDBSchema;
    constructor(data: IDBSchema) {
        this.data = data;
    }

    getPlayerData(playerId: string): IPlayerData {
        const player = this.data.players.find((p) => p.id === playerId);
        if (!player) {
            throw new Error(`Player with ID ${playerId} not found`);
        }
        return player;
    }

    getDeckById(deckId: string): IDehydratedDeck {
        const deck = this.data.decks.find((d) => d.id === deckId);
        if (!deck) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }
        return deck;
    }

    getFullDeckById(deckId: string): IDeck {
        const deckLoadout = this.getDeckById(deckId);
        const deck: IDeck = {} as IDeck;
        deck.id = deckLoadout.id;
        deck.name = deckLoadout.name;
        deck.owner = deckLoadout.owner;
        deck.format = deckLoadout.format;
        deck.deck.main_deck = deckLoadout.deck.main_deck.map((card_id: string) => {
            const card = this.data.cards.find((c) => c.id === card_id);
            if (!card) {
                throw new Error(`Card with ID ${card_id} not found in deck ${deckId}`);
            }
            return card as MainDeckCard;
        });
        deck.deck.advance_deck = deckLoadout.deck.advance_deck.map((card_id: string) => {
            const card = this.data.cards.find((c) => c.id === card_id);
            if (!card) {
                throw new Error(`Card with ID ${card_id} not found in deck ${deckId}`);
            }
            return card as AdvanceDeckCard;
        });
        deck.deck.summons = deckLoadout.deck.summons.map((summon_slot: ISummonSlotState) => {
            const summonSlotCard: ISummonSlotCard = {} as ISummonSlotCard;
            const { summon_id, role_id, equipment_slot } = summon_slot;
            const summonCard = this.data.cards.find((c) => c.id === summon_id);
            const roleCard = role_id ? this.data.cards.find((c) => c.id === role_id) : null;
            const { weapon, offhand, armor, accessory } = equipment_slot;
            const weaponCard = weapon ? this.data.cards.find((c) => c.id === weapon) : null;
            const offhandCard = offhand ? this.data.cards.find((c) => c.id === offhand) : null;
            const armorCard = armor ? this.data.cards.find((c) => c.id === armor) : null;
            const accessoryCard = accessory ? this.data.cards.find((c) => c.id === accessory) : null;

            summonSlotCard.summon = summonCard as ISummonCard;
            summonSlotCard.role = roleCard ? (roleCard as IRoleCard) : null;
            summonSlotCard.equipment = {
                weapon: weaponCard ? (weaponCard as IWeaponCard) : null,
                offhand: offhandCard ? (offhandCard as IEquipmentCard) : null,
                armor: armorCard ? (armorCard as IEquipmentCard) : null,
                accessory: accessoryCard ? (accessoryCard as IEquipmentCard) : null,
            };

            return summonSlotCard;
        });

        return deck;
    }
}

const db = new Database(DATA_RAW as IDBSchema);

export default db;
