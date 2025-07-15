# Tactical Card Game Demo

## 🎯 Project Vision

This is a tactical grid-based RPG card game featuring:

-   **Unique Summon Cards**: Each summon is procedurally generated with digital provenance
-   **Dynamic Role System**: Multi-tier advancement trees with 13 roles across 3 families
-   **Equipment Modularity**: Customize summons with weapons, armor, and accessories
-   **Data-Driven Design**: All game mechanics defined as interpretable data, not hardcoded logic
-   **Stack-Based Combat**: Precise timing control with Action/Reaction/Counter speeds

## 🏆 Current Status (Version 0.0.3)

### ✅ Completed Features

-   **Complete Alpha Set**: All 37 cards implemented with TypeScript type safety
-   **Type System**: Comprehensive interfaces with zero `any` types
-   **Build System**: Automated card database generation and validation
-   **Testing Framework**: Progress tracking and validation scripts
-   **Digital Provenance**: Unique summon cards with cryptographic signatures
-   **Role Advancement**: Multi-tier progression system with branching trees

### 📊 Implementation Progress

-   37/37 Alpha set cards implemented (100% complete)
-   89% play example coverage (17/19 cards working)
-   TypeScript compilation passes without errors
-   Build system generates 43KB card database successfully

### 🔨 Card Type Breakdown

-   **Role Cards**: 13 (30%) - Complete tier system
-   **Action Cards**: 10 (23%) - Core gameplay mechanics
-   **Summon Cards**: 6 (14%) - Species-based generation
-   **Advance Cards**: 5 (12%) - Role progression system
-   **Equipment**: 3 (7%) - Weapon foundation
-   **Quest Cards**: 2 (5%) - Objective mechanics
-   **Counter Cards**: 2 (5%) - Stack interaction
-   **Building Cards**: 2 (5%) - Persistent effects

### 🚧 Next Phase: Game Engine Core Loop

Ready to implement the authoritative game engine with:

-   Turn-based phase system (Draw → Level → Action → End)
-   Action validation and processing
-   Stack-based effect resolution
-   Game state management with zone tracking
-   Victory condition detection

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

**Complete documentation is available in the [docs](docs/) directory:**

| Document                                                        | Description                                   |
| --------------------------------------------------------------- | --------------------------------------------- |
| [**Project Overview**](docs/01-project-overview.md)             | Vision, architecture, and design philosophy   |
| [**Getting Started**](docs/02-getting-started.md)               | Installation, setup, and development workflow |
| [**Game Design**](docs/03-game-design.md)                       | Rules, mechanics, and gameplay systems        |
| [**Technical Architecture**](docs/04-technical-architecture.md) | Type system, data structures, and patterns    |
| [**Development Guide**](docs/05-development-guide.md)           | Implementation standards and workflows        |

## 🏗️ Development Status

**Current Phase**: Game Engine Core Loop Implementation

**Recent Achievements:**

-   ✅ Complete Alpha set (37/37 cards) with TypeScript type safety
-   ✅ Comprehensive role system (13 roles, 3 families)
-   ✅ Data-driven card architecture with automated build system
-   ✅ Digital provenance system for unique card tracking

**Next Priorities:**

-   🔄 Authoritative game engine implementation
-   🔄 Turn-based phase system (Draw → Level → Action → End)
-   � Stack-based effect resolution
-   🔄 Game state management with zone tracking

## 🎨 Design Philosophy

This project follows a **data-driven interpretation** approach:

-   **Game rules are data, not code** - All mechanics defined as structured data
-   **Engine interprets structured data** - Dynamic rule processing
-   **Content is configuration** - New features through data editing
-   **Extensibility through schema** - Easy addition of new mechanics

## 🤝 Contributing

This is currently a solo indie project, but the architecture is designed for collaboration. All code follows strict TypeScript conventions with comprehensive type safety.

## 📄 License

[License details here]

---

_Built with ❤️ using TypeScript, React, and Phaser 3_
