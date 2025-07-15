# Technical Architecture

## Overview

The Card Game Demo implements a comprehensive TypeScript-based architecture designed for type safety, extensibility, and maintainability. The system uses data-driven design principles with strict separation of concerns between game logic, data structures, and user interface.

## Type System

### Core Architecture

The entire system is built around a comprehensive type system defined in `src/types/index.ts`, containing over 200 TypeScript interfaces with zero `any` types. This provides:

-   **Compile-time validation** of all game data
-   **IDE support** with full autocomplete and error detection
-   **Runtime safety** through TypeScript's type checking
-   **Self-documenting code** with type-based contracts

### Type Categories

#### Base Card System

```typescript
// Base card interface
interface Card {
    id: string;
    name: string;
    type: CardType;
    rarity: CardRarity;
    description: string;
    set?: string;
    cost?: number;
    attribute?: string;
}

// Extended card types
interface SummonCard extends Card {
    species: string;
    digitalSignature: DigitalSignature;
    baseStats: Stats;
    growthRates: GrowthRates;
    level: number;
    maxLevel: number;
    equipment: EquipmentSlots;
}

interface ActionCard extends Card {
    effects: Effect[];
    requirements: Requirement[];
    targets: TargetingRule[];
    speed: SpeedLevel;
    destinationPile: DestinationPile;
}
```

#### Game State Management

```typescript
interface GameState {
    players: Player[];
    board: Board;
    currentPlayer: PlayerId;
    phase: GamePhase;
    stack: StackItem[];
    victoryPoints: Record<PlayerId, number>;
    turnCount: number;
    gameStatus: GameStatus;
}

interface Player {
    id: PlayerId;
    name: string;
    hand: Card[];
    mainDeck: Card[];
    advanceDeck: Card[];
    discardPile: Card[];
    rechargePile: Card[];
    collection: Card[];
    decks: Deck[];
}
```

#### Effect System Types

```typescript
interface Effect {
    id: string;
    type: EffectType;
    parameters: EffectParameters;
    triggers: TriggerCondition[];
    requirements: Requirement[];
    targets: TargetingRule[];
    timing: EffectTiming;
    description: string;
}

interface TriggerCondition {
    event: TriggerEvent;
    source?: SourceFilter;
    target?: TargetFilter;
    timing: TriggerTiming;
    once?: boolean;
}
```

### Digital Provenance System

```typescript
interface DigitalSignature {
    cardId: string;
    timestamp: number;
    opener: PlayerId;
    signature: string;
    generationSeed: string;
    provenanceChain: ProvenanceLink[];
}

interface ProvenanceLink {
    action: ProvenanceAction;
    timestamp: number;
    player: PlayerId;
    signature: string;
}
```

## Data-Driven Architecture

### Philosophy

The system follows a **data-driven interpretation** model where:

-   **All game mechanics are data** - No hardcoded logic for individual cards
-   **Engine interprets structured data** - Rules are processed dynamically
-   **Content is configuration** - New mechanics through data editing
-   **Extensibility through schema** - New features expand data structures

### Build System

#### TypeScript to JSON Compilation

```
TypeScript Card Files → Type Validation → JSON Database
    ↓                      ↓                 ↓
Individual .ts files → Compile-time check → Master db.json
```

**Process:**

1. **Card Definition** - Each card is a TypeScript file with typed exports
2. **Type Validation** - TypeScript compiler ensures schema compliance
3. **Database Generation** - Build script compiles all cards to JSON
4. **Runtime Loading** - Game engine loads JSON database

#### File Organization

```
src/data/cards/
├── global/
│   ├── species/          # Summon species templates
│   └── player-gen/       # Player-generated cards
└── sets/
    └── alpha/            # Alpha set cards
        ├── action-cards/ # Action card implementations
        ├── role-cards/   # Role card definitions
        ├── equipment/    # Equipment card types
        └── ...
```

### Effect System Architecture

#### Stack-Based Resolution

The effect system uses a stack-based approach similar to trading card games:

```typescript
interface StackItem {
    id: string;
    effect: Effect;
    source: Card;
    player: PlayerId;
    targets: Target[];
    speed: SpeedLevel;
    timestamp: number;
}
```

**Resolution Process:**

1. **Action Submission** - Player submits action to engine
2. **Effect Creation** - Engine creates stack item from action
3. **Response Window** - Opponents can respond with faster effects
4. **Resolution** - Stack resolves LIFO with speed restrictions

#### Trigger System

```typescript
enum TriggerEvent {
    ON_PLAY = "ON_PLAY",
    ON_DEFEAT = "ON_DEFEAT",
    PHASE_START = "PHASE_START",
    PHASE_END = "PHASE_END",
    SUMMON_ENTERS_PLAY = "SUMMON_ENTERS_PLAY",
    DAMAGE_DEALT = "DAMAGE_DEALT",
    CARD_DRAWN = "CARD_DRAWN",
    // ... extensive trigger catalog
}
```

### Formula System

Game formulas are defined as data structures:

```typescript
interface Formula {
    id: string;
    expression: string;
    parameters: FormulaParameter[];
    description: string;
}

interface FormulaParameter {
    name: string;
    type: ParameterType;
    source: ParameterSource;
    default?: any;
}
```

**Examples:**

-   **Damage Calculation**: `"STR * (1 + weaponPower / 100) * (STR / targetDEF)"`
-   **Heal Amount**: `"SPI * (1 + basePower / 100) * critMultiplier"`
-   **Movement Speed**: `"2 + floor((SPD - 10) / 5)"`

## Engine Architecture

### Authoritative Design

The game engine acts as an authoritative server even in single-player mode:

```
UI Layer (React + Phaser) → Action Submission → Game Engine
                                                      ↓
                                              State Validation
                                                      ↓
                                              Effect Processing
                                                      ↓
                                              State Update
                                                      ↓
                                              Event Emission
                                                      ↓
UI Layer (React + Phaser) ← State Synchronization ←
```

### Core Engine Components

#### State Manager

```typescript
class GameStateManager {
    private state: GameState;
    private eventEmitter: EventEmitter;

    submitAction(action: GameAction): ActionResult;
    getState(): GameState;
    subscribeToChanges(callback: StateChangeHandler): void;
    validateAction(action: GameAction): ValidationResult;
}
```

#### Effect Interpreter

```typescript
class EffectInterpreter {
    private formulaEngine: FormulaEngine;
    private triggerManager: TriggerManager;

    processEffect(effect: Effect, context: EffectContext): EffectResult;
    evaluateFormula(formula: Formula, context: FormulaContext): number;
    checkRequirements(
        requirements: Requirement[],
        context: GameContext
    ): boolean;
}
```

#### Stack Manager

```typescript
class StackManager {
    private stack: StackItem[];
    private currentSpeed: SpeedLevel;

    addToStack(effect: Effect, context: EffectContext): void;
    resolveStack(): StackResolution[];
    canAddEffect(effect: Effect, speed: SpeedLevel): boolean;
}
```

## UI Architecture

### React Integration

```typescript
// Game state hook
const useGameState = () => {
    const [state, setState] = useState<GameState>();

    useEffect(() => {
        const unsubscribe = gameEngine.subscribeToChanges(setState);
        return unsubscribe;
    }, []);

    return state;
};

// Action submission hook
const useGameActions = () => {
    const submitAction = useCallback((action: GameAction) => {
        return gameEngine.submitAction(action);
    }, []);

    return { submitAction };
};
```

### Phaser 3 Integration

```typescript
class GameScene extends Phaser.Scene {
    private gameState: GameState;
    private actionHandler: ActionHandler;

    init() {
        this.gameState = gameEngine.getState();
        gameEngine.subscribeToChanges(this.updateDisplay.bind(this));
    }

    handlePlayerAction(action: GameAction) {
        const result = this.actionHandler.submitAction(action);
        if (!result.success) {
            this.showError(result.error);
        }
    }
}
```

## Testing Architecture

### Type-Safe Testing

```typescript
describe("Card Implementation", () => {
    it("should validate card type compliance", () => {
        const card: ActionCard = healingHands;
        expect(card.type).toBe(CardType.ACTION);
        expect(card.effects).toBeDefined();
    });

    it("should process effect correctly", () => {
        const context = createEffectContext();
        const result = effectInterpreter.processEffect(
            card.effects[0],
            context
        );
        expect(result.success).toBe(true);
    });
});
```

### Build Validation

```typescript
// Automated validation during build
const validateCardDatabase = () => {
    const cards = loadAllCards();
    const errors = [];

    for (const card of cards) {
        if (!validateCardSchema(card)) {
            errors.push(`Invalid card schema: ${card.id}`);
        }
    }

    return errors;
};
```

## Performance Considerations

### Memory Management

-   **Immutable State Updates** - State changes create new objects
-   **Efficient Diffing** - Only changed components re-render
-   **Lazy Loading** - Cards loaded on demand
-   **Memory Pooling** - Reuse objects for frequent operations

### Optimization Strategies

```typescript
// Memoized selectors
const selectPlayerHand = createSelector(
    (state: GameState) => state.players,
    (state: GameState) => state.currentPlayer,
    (players, currentPlayer) =>
        players.find((p) => p.id === currentPlayer)?.hand || []
);

// Efficient card filtering
const filterCardsByType = (cards: Card[], type: CardType) => {
    return cards.filter((card) => card.type === type);
};
```

## Future Scalability

### Network Architecture Readiness

The architecture is designed to support multiplayer expansion:

```typescript
// Network-ready action structure
interface NetworkAction {
    playerId: PlayerId;
    action: GameAction;
    timestamp: number;
    signature: string;
}

// Serializable game state
interface SerializableGameState {
    gameId: string;
    players: SerializablePlayer[];
    board: SerializableBoard;
    turn: number;
    phase: GamePhase;
}
```

### Modular Expansion

New features can be added through:

-   **Type Extension** - New interfaces extending base types
-   **Effect System** - New trigger types and effect processors
-   **Data Schema** - Additional card types and properties
-   **UI Components** - New React components for features

This architecture provides a solid foundation for both current development and future expansion, emphasizing type safety, maintainability, and extensibility throughout the system.
