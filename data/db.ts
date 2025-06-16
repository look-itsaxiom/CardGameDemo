import db_raw from "./db.json";

// --- Improved Interfaces ---
export interface ICardBaseStats {
    STR?: number;
    END?: number;
    DEF?: number;
    INT?: number;
    SPI?: number;
    MDF?: number;
    SPD?: number;
    LCK?: number;
    ACC?: number;
    [key: string]: number | undefined;
}

export interface IGrowthRates {
    [stat: string]: number | undefined;
}

export interface IEffect {
    type?: string;
    value?: number;
    [key: string]: any;
}

export type CardType =
    | "summon"
    | "summon_template"
    | "action"
    | "quest"
    | "counter"
    | "building"
    | "equipment"
    | "role"
    | "advance"
    | "advance_named_summon"
    | string;

export type Attribute = "neutral" | "fire" | "earth" | "light" | "dark" | "wind" | "water" | string;

export interface ICardInfo {
    id: string;
    name?: string;
    display_name?: string;
    description?: string;
    species?: string;
    card_type?: CardType;
    attribute?: Attribute;
    rarity?: string;
    flavor_text?: string;
    base_stats?: ICardBaseStats;
    growth_rates?: IGrowthRates;
    effects?: IEffect[];
    play_requirements?: Record<string, any>;
    resolve_requirements?: Record<string, any>;
    trigger_requirements?: Record<string, any>;
    trigger?: string[];
    resolve_timing?: string[];
    zoneAfterResolve?: string;
    zoneAfterDestroy?: string;
    equipment_type?: string;
    stat_modifiers?: Record<string, number>;
    base_power?: number;
    attack_range?: number;
    damage_stat?: string;
    damage_type?: string;
    cost?: Record<string, any>;
    role_type?: string[];
    requirements?: Record<string, any>;
    tier?: number;
    template_id?: string;
    opened_date?: string;
    opened_by?: string;
    rank?: number;
    [key: string]: any;
}

export interface ISummonSlot {
    summon: string | ICardInfo;
    role: string;
    equipment: IEquipmentSlots;
}

export interface IEquipmentSlots {
    weapon: string | ICardInfo;
    armor: string | ICardInfo;
    accessory: string | ICardInfo;
}

export interface I3v3Deck {
    summon_slot_1: ISummonSlot;
    summon_slot_2: ISummonSlot;
    summon_slot_3: ISummonSlot;
    main_deck: (string | ICardInfo)[];
    advance_deck: (string | ICardInfo)[];
}

export interface I3v3DeckLoadoutInfo {
    id: string;
    name: string;
    owner: string;
    format: string;
    deck: I3v3Deck;
}

export interface IPlayerInfo {
    id: string;
    name: string;
    decks: string[];
    active_deck: string;
    owned_cards: IOwnedCardTracker[];
}

export interface IOwnedCardTracker {
    card_id: string;
    number_owned: number;
}

const db = JSON.parse(JSON.stringify(db_raw));

export const getPlayers = () => {
    return db.players;
};

export const getPlayerById = (id: string) => {
    return db.players.find((player: IPlayerInfo) => player.id === id);
};

export const getDecksByPlayerId = (id: string) => {
    const player = getPlayerById(id);
    return player ? player.decks : [];
};

export const getDeckById = (id: string) => {
    const decks = db.decks;
    return decks.find((deck: I3v3DeckLoadoutInfo) => deck.id === id);
};

export const hydrateDeckById = (id: string) => {
    const cards = db.cards;
    const decks = db.decks;
    const deck = decks.find((deck: I3v3DeckLoadoutInfo) => deck.id === id);

    if (!deck) return null;

    const summonSlots = [deck.deck.summon_slot_1, deck.deck.summon_slot_2, deck.deck.summon_slot_3];

    summonSlots.forEach((slot) => {
        slot.summon = cards.find((card: ICardInfo) => card.id === slot.summon);
        slot.equipment.weapon = cards.find((card: ICardInfo) => card.id === slot.equipment.weapon);
        slot.equipment.armor = cards.find((card: ICardInfo) => card.id === slot.equipment.armor);
        slot.equipment.accessory = cards.find((card: ICardInfo) => card.id === slot.equipment.accessory);
    });

    deck.deck.main_deck.forEach((cardId: string, index: string | number) => {
        const card = cards.find((card: ICardInfo) => card.id === cardId);
        if (card) {
            deck.deck.main_deck[index] = card;
        }
    });

    deck.deck.advance_deck.forEach((cardId: string, index: string | number) => {
        const card = cards.find((card: ICardInfo) => card.id === cardId);
        if (card) {
            deck.deck.advance_deck[index] = card;
        }
    });

    return deck;
};

export const getCardById = (id: string) => {
    const cards = db.cards;
    return cards.find((card: ICardInfo) => card.id === id);
};

interface Idb {
    getPlayers: () => IPlayerInfo[];
    getPlayerById: (id: string) => IPlayerInfo;
    getDecksByPlayerId: (id: string) => string[];
    getCardById: (id: string) => ICardInfo;
    getDeckById: (id: string) => I3v3DeckLoadoutInfo;
    hydrateDeckById: (id: string) => any;
}

export default {
    getPlayers,
    getPlayerById,
    getDecksByPlayerId,
    getCardById,
    getDeckById,
    hydrateDeckById,
} as Idb;
