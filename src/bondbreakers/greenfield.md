# Greenfield Implementation Plan: Tactical RPG Card Game

## Overview

This document outlines the plan for a greenfield (from-scratch) implementation of the tactical grid-based RPG card game. The goal is to create a modern, maintainable, and scalable architecture that separates game logic, rendering, and UI, while preserving the legacy implementation for reference.

---

## 1. Project Structure & Separation of Concerns

- **Game Engine Layer (Phaser 3):**

  - Handles board rendering, animations, and user input for the tactical grid.
  - Contains only the logic for visualizing and interacting with the game state, not the rules themselves.

- **Game Logic Layer (Pure TypeScript):**

  - Contains all rules, state transitions, and core mechanics (turns, phases, card effects, win conditions).
  - No direct dependency on Phaser or React—this makes it testable and reusable.

- **UI Layer (React):**

  - Deck builder, card collection, shop, and game lobby.
  - Communicates with the game logic layer and passes state to the Phaser game for rendering.

- **Data Layer:**

  - Card definitions, player data, decks, etc. (stubbed for now, API/database later).

---

## 2. Core Modules & Responsibilities

### A. Game State & Rules Engine

- Pure TypeScript classes/types for:
  - Game state (players, decks, board, zones, turn/phase, etc.)
  - Card resolution and effect system (actions, triggers, requirements)
  - Summon stat calculation (growth rates, equipment, roles, etc.)
  - Turn/phase management and transitions
  - Win/loss conditions

### B. Board & Unit System

- Board manager: grid logic, movement, placement, valid cell calculation
- Summon unit manager: handles stat calculation, movement, attacks, and effects

### C. Card System

- Card registry: loads and hydrates card data
- Card effect system: resolves card actions, triggers, and requirements

### D. UI/UX

- React components for:

  - Deck builder
  - Card collection
  - Shop
  - Game lobby
  - Game HUD (hand, decks, zones, etc.)

- Phaser scene(s) for:
  - Board rendering
  - Summon/unit animations
  - Visual feedback for actions

### E. Integration Layer

- Bridges between React UI, game logic, and Phaser rendering
- Event bus or state management (e.g., Zustand, Redux, or custom context)

---

## 3. Development Phases

### Phase 1: Core Game Logic (No UI)

- Implement the game state, rules engine, and card system as pure TypeScript.
- Write unit tests for all core mechanics.

### Phase 2: Board & Unit Rendering

- Build the Phaser board and unit rendering system.
- Integrate with the game logic layer (e.g., via observer pattern or event bus).

### Phase 3: UI Integration

- Build React UI for deck builder, collection, and game HUD.
- Connect UI to game logic and Phaser scenes.

### Phase 4: Feature Expansion

- Add more card types, effects, and advanced mechanics.
- Prepare for backend integration (API, multiplayer, persistence).

---

## 4. Key Lessons from Legacy Implementation

- Avoid monolithic scenes: Split responsibilities into managers/services.
- Keep game rules and rendering separate: Pure logic is easier to test and maintain.
- Type everything: Use interfaces and types for all game entities.
- Event-driven architecture: Use an event bus or observer pattern for communication between layers.
- Composable, testable code: Write small, focused classes/functions.

---

## 5. Next Steps

1. Define the core TypeScript interfaces/types for game state, cards, and units.
2. Implement the pure game logic engine (turns, phases, actions, stat calculations).
3. Build a minimal Phaser board scene that can render the board and units based on game state.
4. Create React UI stubs for deck builder and game HUD.
5. Integrate everything via a clean event-driven or state management system.

---

## 6. Directory Structure (Proposed)

```text
bondbreakers/
  engine/           # Pure TypeScript game logic (rules, state, stat calc, etc.)
    GameEngine.ts
    types.ts
  scenes/           # New Phaser scenes
    GameScene.ts
    MainMenuScene.ts
    PreloaderScene.ts
    GameOverScene.ts
  managers/         # Board, card, and other managers
    BoardManager.ts
  ui/               # (Optional) New React components for the new implementation
    DeckBuilder.tsx
    GameHUD.tsx
  index.ts          # Entry point for the new implementation
```

---

## 7. Migration & Coexistence Strategy

- All new code lives in `bondbreakers/`.
- Legacy code in `src/game/` remains untouched for reference and fallback.
- Add a toggle in the main app to launch either the legacy or new implementation.
- Share data and types where possible; evolve types in the new implementation as needed.

---

## 8. Guiding Principles

- Use TypeScript best practices and strict typing.
- Keep logic, rendering, and UI concerns separate.
- Build for testability and future extensibility.
- Only implement what is necessary for the current phase.
- Document decisions and architecture as the project evolves.

---

## Dev Log

6/16/2025

### Progress Report

**Completed:**

- Defined all core TypeScript types and interfaces for cards, player state, board state, summon units, and overall game state in `engine/types.ts`.
- Designed a robust, extensible `IEffect` type and `EffectContext` for effect resolution.
- Implemented the `GameEngine` class in `engine/GameEngine.ts` with:
  - Game initialization (random first player, phase, turn)
  - Turn and phase management (`nextPhase`, `nextTurn`)
  - Level up logic for summons (`levelUpSummonsForCurrentPlayer`)
  - Effect resolution system (`resolveEffect`, `resolveCardEffect`) for `level_up`, `damage`, and `heal` effects.
- Created a Jest unit test file `engine/GameEngine.test.ts` with tests for:
  - Game initialization
  - Level up phase
  - Effect resolution for `level_up`, `damage`, and `heal`
- Set up Jest for TypeScript, including config files and scripts, and verified tests run and pass.
- All new code and tests are isolated under `/bondbreakers` to ensure clean separation from legacy implementation.

**In Progress / To Do:**

- Expand effect resolution to cover more effect types (stat buffs, draw, move, etc.).
- Implement card play logic and requirements checking.
- Add more comprehensive unit tests for additional mechanics and edge cases.
- Integrate with card registry/data layer for card lookups.
- Build out board management, summon placement, and movement logic.
- Connect the game logic to UI and rendering layers (React/Phaser).
- Add win/loss condition checks and game-end logic.
