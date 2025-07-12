# Tactical Card Game Demo

A data-driven tactical RPG card game built with TypeScript, React, and Phaser 3. This project demonstrates a robust, extensible architecture for complex card game mechanics with a focus on type safety and maintainability.

![screenshot](screenshot.png)

## 🎯 Project Vision

This is a tactical grid-based RPG card game featuring:

-   **Unique Summon Cards**: Each summon is procedurally generated with digital provenance
-   **Dynamic Role System**: Multi-tier advancement trees with 13 roles across 3 families
-   **Equipment Modularity**: Customize summons with weapons, armor, and accessories
-   **Data-Driven Design**: All game mechanics defined as interpretable data, not hardcoded logic
-   **Stack-Based Combat**: Precise timing control with Action/Reaction/Counter speeds

## 🚀 Quick Start

### Requirements

-   [Node.js](https://nodejs.org) (v16 or higher)
-   npm or yarn package manager

### Installation

```bash
git clone [repository-url]
cd CardGameDemo
npm install
```

### Development

```bash
npm run dev        # Start development server
npm run build      # Create production build
npm run dev-nolog  # Development without analytics
```

The development server runs on `http://localhost:8080`

## 📁 Project Structure

```
src/
├── types/           # Core TypeScript interfaces and types
├── data/            # Game data (cards, species, etc.)
│   ├── cards/       # Card definitions organized by set
│   ├── species/     # Summon species templates
│   └── legacy-data/ # Legacy JSON data (being migrated)
├── engine/          # Game logic and state management
├── game/            # Phaser 3 game scenes and logic
└── components/      # React UI components
```

## 🎮 Game Systems

### Core Mechanics

-   **3v3 Battles**: Strategic combat with 3 summons per player
-   **Grid-Based Movement**: Tactical positioning on a 12x14 board
-   **Turn-Based Phases**: Draw → Level → Action → End
-   **Victory Conditions**: First to 3 Victory Points wins

### Card Types

-   **Summon Cards**: Unique creatures with procedural stats
-   **Role Cards**: Define classes and advancement paths
-   **Equipment Cards**: Weapons, armor, and accessories
-   **Action Cards**: Spells and abilities for tactical play
-   **Building Cards**: Persistent board effects
-   **Quest Cards**: Objectives for bonus rewards

### Role System

Three families with tier-based advancement:

-   **Warrior Family**: Warrior → Berserker/Knight → Paladin/Sentinel
-   **Scout Family**: Scout → Rogue/Explorer (terminal)
-   **Magician Family**: Magician → Element/Light/Dark Mage → Warlock

## 🔧 Technical Architecture

### Type System

All game entities are strongly typed in `src/types/index.ts`:

-   Digital provenance for unique cards
-   Species system for procedural generation
-   Effect system for data-driven mechanics
-   Board state and game actions

### Data-Driven Design

Game mechanics are defined as structured data:

-   Card effects as interpretable JSON
-   Role families for dynamic queries
-   Formula-based stat calculations
-   Trigger/response event system

### Stack-Based Resolution

Combat uses a stack system similar to trading card games:

-   Action/Reaction/Counter speed levels
-   Priority-based player responses
-   Precise timing control for complex interactions

## 📚 Documentation

-   **[Architecture Overview](docs/architecture/)** - Technical design and patterns
-   **[Game Systems](docs/game-systems/)** - Detailed mechanics and rules
-   **[Development Guide](docs/development/)** - Implementation guidelines
-   **[Role System](docs/game-systems/role-system.md)** - Complete role advancement trees

## 🏗️ Development Status

**Current Phase**: Alpha Set Implementation

-   ✅ Core type system and architecture
-   ✅ Complete role system (13 roles, 3 families)
-   ✅ Data-driven card framework
-   🔄 Card implementation (Action cards in progress)
-   🔄 Game engine integration
-   📋 UI development (planned)

## 🎨 Design Philosophy

This project follows a **data-driven interpretation** approach:

-   Game rules are data, not code
-   The engine interprets structured data to drive gameplay
-   Adding content means editing data files, not writing logic
-   Enables rapid iteration and easy extensibility

## 🤝 Contributing

This is currently a solo indie project, but the architecture is designed for collaboration. All code follows strict TypeScript conventions with comprehensive type safety.

## 📄 License

[License details here]

---

_Built with ❤️ using TypeScript, React, and Phaser 3_
