# Project Master Plan: Tactical Card Game Demo

## Vision

Deliver a robust, extensible, and data-driven tactical RPG card game demo. The MVP is a self-contained, local snapshot of the larger product, focused on the core gameplay loop, data models, and extensibility. This demo will serve as the foundation for future expansion into a full-stack, multiplayer, authoritative-server product.

## MVP Goals

-   All game data (cards, decks, board, etc.) is defined in TypeScript interfaces and/or static JSON, not hardcoded logic.
-   The game engine is modular, with strict separation between game logic (engine/state) and UI (Phaser/React).
-   The core gameplay loop (turns, phases, actions, triggers, stack, win/loss) is fully implemented and testable.
-   The system is designed for easy extension: new cards, mechanics, or rules can be added by editing data, not code.
-   UI is functional and clear, using React for menus/collection/deckbuilder and Phaser 3 for the board/gameplay.
-   No backend, authentication, or real-time multiplayer—just local, stubbed data and single-session play.

## Core Design Pillars

1. **Data-Driven Game Logic**

    - All card effects, requirements, triggers, and rules are defined in structured data (JSON/TypeScript), not as bespoke scripts per card.
    - The engine interprets this data to drive all gameplay mechanics.

2. **Separation of Concerns**

    - Game logic (engine/state) is completely decoupled from UI (Phaser/React).
    - The UI is a “dumb” renderer and input collector, never the source of truth.

3. **Authoritative Server Mindset**
    - The architecture treats the game engine as the “server” and the UI as “clients” that submit actions and receive state updates.
    - This enables a future transition to a true backend authoritative server with minimal refactor.

## Design Ethos: Interpretation Over Hardcoding

This project is built on the principle that the rules, effects, and content of the game are not hardcoded, but interpreted from structured data. The engine is an interpreter, not a collection of bespoke scripts. This means:

-   **Every card, effect, and rule is defined as data.** The engine reads and interprets this data to drive gameplay, rather than relying on custom code for each new mechanic.
-   **Adding or changing content is a matter of editing data, not writing new logic.** This empowers designers (me) and future developers (still me) to expand the game without deep engine changes.
-   **The system is future-proof and extensible.** New mechanics, card types, or even whole new game modes can be introduced by extending the data schema and interpreter, not by rewriting the core.
-   **Separation of concerns is absolute.** The UI is a client that submits actions and renders state; the engine is the sole authority on game rules and state transitions.
-   **This approach is chosen to enable rapid iteration, robust testing, and a clear path to multiplayer and live service features.**

The goal is to create a living, evolving game system that can grow and adapt as new ideas emerge, without ever becoming brittle or unmaintainable.

## System Breakdown & Architecture Overview

### 1. Data Layer

-   **Card Definitions:** All card types, effects, triggers, requirements, and stats defined in JSON or TypeScript interfaces.
-   **Decks & Collections:** Player decks, collections, and stubbed user data.
-   **Board & Zones:** Board layout, zones, and initial state.

### 2. Game Engine (Authoritative Logic)

-   **State Management:** Holds the canonical game state (board, hands, decks, discard, etc.).
-   **Action Interpreter:** Receives user actions (play card, move unit, attack, etc.), validates them, and applies state changes.
-   **Effect/Trigger System:** Evaluates triggers, requirements, and resolves effects using data definitions.
-   **Stack & Priority:** Manages the stack, responses, and resolution order.
-   **Stat Calculation:** Computes unit stats, damage, healing, and other derived values from data.
-   **Victory/End Conditions:** Checks for win/loss/draw and game over.

### 3. UI Layer

-   **React UI:** Deck builder, card collection, menus, and game setup.
-   **Phaser 3 Board:** Visualizes the board, units, and in-play actions.
-   **UI-State Sync:** Subscribes to game state updates and renders accordingly. Sends user actions to the engine.

### 4. Extensibility & Testing

-   **Data-Driven Expansion:** New cards, effects, and mechanics added via data, not code changes.
-   **Unit & Integration Tests:** Test game logic, state transitions, and effect resolution.
-   **Debug Tools:** UI for inspecting state, simulating actions, and visualizing the stack.

### 5. Future-Proofing

-   **Server-Client Split:** Engine is designed to run headless (server-side) or in-browser (client-side) with the same API.
-   **Networking Ready:** All user actions are serializable and replayable for multiplayer or server validation.

---

## Key Design Clarifications & Discoveries

### Summon Card System

-   **Digital Provenance:** Each Summon card generated from packs has a unique digital signature with timestamp and opener identity, creating immutable provenance chains for trading/collecting.
-   **Dynamic Equipment:** Equipment can be modified during gameplay on Summon Units, but Summon Slot configurations in decks serve as starting loadouts.
-   **Modular Roles:** Roles function like equipment - modifiable in deck building and changeable during gameplay via Advance cards.
-   **True Uniqueness:** No duplicate summons possible; even statistically identical summons are fundamentally different due to unique generation signatures.

### Equipment & Role Card Economy

-   **Equipment as Collectibles:** Equipment cards are their own card type with rarities, pulled from packs independently of summons.
-   **Role Card Tiers:** Tier 1 roles (Warrior, Magician, Scout) are provided; Tier 2+ roles and their Advance cards must be collected.
-   **Role Advancement Paths:**
    -   Tier 1 → Tier 2: Linear progression (1-3 options per Tier 1)
    -   Tier 2 → Tier 3: Branching convergence with significant overlap
    -   Example: Paladin accessible via Warrior→Knight→Paladin OR Magician→Light Mage→Paladin
    -   Multi-path Tier 3 roles satisfy requirements from multiple source trees
-   **Tier Lock Requirements:** Advance cards typically require specific tier prerequisites (Tier 2 Advance needs Tier 1 role, etc.)

### Game State Isolation

-   **No Persistence:** Battle outcomes don't permanently affect card properties or player collections.
-   **Future "Ranking Up":** Card progression mechanics planned but outside demo scope.
-   **Pure Game State:** All modifications during gameplay are temporary state changes, not permanent card alterations.

### Technical Integration Notes

-   **boardgame.io Integration:** Perfect fit for turn-based phases, authoritative state, and multiplayer support. Game phases map directly to boardgame.io phases.
-   **Effect System Approach:** Considering json-rules-engine vs custom event/trigger system for data-driven effects. Custom approach may be better for stack-based resolution with speed levels and priority passing.

---

## ✅ COMPLETED: Top-Level Entity Map & Relationships

**Status: Complete** - See `src/types/index.ts` for full implementation.

**Delivered:**

-   Complete type system covering all game entities and relationships
-   Digital provenance system for unique Summon cards with timestamps and signatures
-   Role advancement tree structure with tier-based progression and branching convergence
-   Equipment and Role card economies as independent collectible systems
-   boardgame.io-compatible GameState structure
-   Stack-based trigger/response system foundation
-   Comprehensive action system for player interactions

**Key Relationships Mapped:**

-   Player → Collection → Cards (with unique provenance for Summons)
-   Deck → SummonSlots → (Summon + Role + Equipment) synthesis
-   GameState → Zones → Units (runtime entities with dynamic equipment/roles)
-   Effects → Triggers → Stack → Resolution (data-driven effect system)

---

## 🚧 CURRENT: Card & Effect Implementation

**Status: In Progress** - Implementing concrete card data using the established type system.

**Goal:** Create actual card data objects for all cards in the play example, validate the type system works for complex mechanics, and establish patterns for data-driven card effects.

**Acceptance Criteria:**

-   Species definitions for Gignen, Fae, Stoneheart, Wilderling with stat ranges and trait effects
-   Role cards for Warrior, Magician, Scout (Tier 1) and advancement roles (Berserker, Knight, etc.)
-   Equipment cards with proper stat bonuses and special effects
-   Action cards from play example (Sharpened Blade, Blast Bolt, Healing Hands, etc.)
-   Building cards (Dark Altar, Gignen Country) with complex delayed/ongoing effects
-   Quest cards with objectives, rewards, and failure conditions
-   All cards validate against TypeScript interfaces and demonstrate extensibility

**Key Technical Decisions Made:**

-   **Effect System Architecture:** Custom trigger/response system with stack-based resolution over json-rules-engine for better control of timing and priority
-   **Board System:** Grid Engine compatible with typed layers (Ground/Units) for pathfinding integration
-   **Ongoing Effects:** Dedicated tracking system for persistent and delayed effects at game state level
-   **Role Advancement:** Bidirectional tree structure supporting branching convergence at Tier 3

---

## ⚠️ PRE-IMPLEMENTATION: Data Organization & Validation

Before implementing concrete card data, establish the foundation for maintainable, extensible data management:

### Data Organization Strategy

**File Structure:** Organize card data by type and functionality, not arbitrary groupings. Each card type gets its own directory with logical subdivisions:

-   Species templates separate from instance cards
-   Equipment organized by slot type for easy reference
-   Role cards grouped by tier for advancement tree clarity
-   Action/Building/Quest cards as top-level categories

**Naming & ID Conventions:** Consistent naming prevents conflicts and enables programmatic discovery:

-   File names use kebab-case for readability
-   Card IDs follow structured format for easy parsing
-   Species/Role references use simple, memorable identifiers
-   Unique cards use UUID format for guaranteed uniqueness

**Reference Management:** All inter-card references must be validated and maintainable:

-   Species IDs must reference actual species definitions
-   Role advancement paths must be bidirectionally consistent
-   Equipment restrictions must align with summon/role capabilities
-   Effect parameters must use standardized condition/targeting system

### Data Validation Framework

**Type Safety:** TypeScript interfaces provide compile-time validation:

-   No `any` types allowed - everything must be properly typed
-   Effect parameters validated against standardized schemas
-   Reference integrity checked at build time
-   Card data must implement proper interfaces without exceptions

**Runtime Validation:** Additional checks for data integrity:

-   Formula strings validated for syntax and variable references
-   Targeting conditions verified against game state structure
-   Trigger/effect combinations tested for logical consistency
-   Card interaction chains validated end-to-end

**Testing Strategy:** Multi-layered validation approach:

-   Unit tests for individual card effects and conditions
-   Integration tests for card interaction sequences
-   End-to-end tests reproducing the complete play example
-   Performance tests for effect resolution under load

### Implementation Checkpoints

Before moving to engine implementation, validate:

-   [ ] All cards from play example are fully implemented and tested
-   [ ] Type system handles all complex mechanics without exceptions
-   [ ] Effect resolution produces expected results in all test cases
-   [ ] Card data organization scales for future expansion
-   [ ] Performance meets requirements for real-time gameplay
-   [ ] Documentation accurately reflects implemented behavior

---

## Next: Game Engine Core Loop

-   **Goal:** Outline and implement the main phases and state transitions (Draw, Level, Action, End, etc.), and define how user actions are submitted, validated, and resolved by the engine.
-   **Acceptance Criteria:**
    -   The full turn cycle is implemented and matches the play example.
    -   Actions (play card, move, attack, etc.) are submitted as data and processed by the engine.
    -   The stack, triggers, and resolutions are handled according to the rules.
    -   The engine can be run headless for testing.

## Next: UI & Client Integration

-   **Goal:** Connect React and Phaser 3 to the engine, so that the UI reflects game state and user actions are sent to the engine, not handled directly in the UI.
-   **Acceptance Criteria:**
    -   UI updates in response to state changes from the engine.
    -   All user actions (clicks, drags, selections) are sent as data to the engine.
    -   No game logic is duplicated in the UI layer.
    -   The UI can be swapped or updated without breaking the engine.

## Next: Testing & Debugging Tools

-   **Goal:** Provide tools for testing and debugging the game logic, including unit/integration tests and a debug UI for inspecting state and simulating actions.
-   **Acceptance Criteria:**
    -   Core engine logic is covered by automated tests.
    -   Developers can inspect the stack, triggers, and state transitions in real time.
    -   Simulated actions and test scenarios can be run without the full UI.

## Next: Roadmap to Full Product

-   **Goal:** Identify the steps needed to evolve the MVP into a full-stack, multiplayer, live product, including backend, networking, and live ops features.
-   **Acceptance Criteria:**
    -   A clear migration path from local MVP to server-authoritative multiplayer is documented.
    -   Key backend features (auth, persistence, matchmaking, etc.) are listed.
    -   The architecture supports future live updates and content drops.

---

_This document is a living master plan. Each section will be expanded and refined as the project evolves._
