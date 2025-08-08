# Tactical Card Game Demo

## 🎯 Project Vision

This is a tactical grid-based RPG card game featuring:

-   **Unique Summon Cards**: Each summon is procedurally generated with digital provenance
-   **Dynamic Role System**: Multi-tier advancement trees with 13 roles across 3 families
-   **Equipment Modularity**: Customize summons with weapons, armor, and accessories
-   **Data-Driven Design**: All game mechanics defined as interpretable data, not hardcoded logic
-   **Stack-Based Combat**: Precise timing control with Action/Reaction/Counter speeds

## ⚠️ Current Status (Version 0.0.3) - **REALITY CHECK**

### ✅ Actually Completed Features

-   **Card Data Definitions**: All 37 cards defined with comprehensive TypeScript interfaces
-   **Build System**: Automated card database generation (43KB JSON output)
-   **Project Architecture**: Sound 9-component engine design with proper separation
-   **Type Definitions**: Comprehensive interfaces in `src/types/index.ts`
-   **Data Structure**: Well-organized card definitions across 57 TypeScript files

### 🚨 Current Issues

-   **51 TypeScript compilation errors** across 7 core engine files
-   **Build process fails** due to type errors and incomplete implementations
-   **No functional tests** exist despite documentation claims
-   **Core game engine incomplete** - many methods are stubs or empty implementations
-   **Stack-based resolution system** has framework but lacks working logic

### 📊 Actual Implementation Status

-   37/37 Alpha set cards **DEFINED** (data structures complete)
-   **0% functional game engine** (does not compile or run)
-   **Unknown play coverage** (no tests to validate functionality)
-   Card database generation **WORKS** (only working build process)

### 🔨 Card Type Breakdown

-   **Role Cards**: 13 (30%) - Complete tier system
-   **Action Cards**: 10 (23%) - Core gameplay mechanics
-   **Summon Cards**: 6 (14%) - Species-based generation
-   **Advance Cards**: 5 (12%) - Role progression system
-   **Equipment**: 3 (7%) - Weapon foundation
-   **Quest Cards**: 2 (5%) - Objective mechanics
-   **Counter Cards**: 2 (5%) - Stack interaction
-   **Building Cards**: 2 (5%) - Persistent effects

### 🚧 Next Phase: Fix Foundation Issues

**Priority 1: Make It Compile**
-   Fix 51 TypeScript compilation errors in engine components
-   Complete stub method implementations in core systems
-   Resolve type definition inconsistencies

**Priority 2: Implement Core Systems**
-   Complete stack-based effect resolution logic
-   Implement turn-based phase progression  
-   Add functional action validation and processing
-   Create comprehensive testing framework

**Priority 3: Validate Functionality**
-   Build working game engine that can execute basic game flow
-   Create integration tests for component interactions
-   Verify card effects actually work as designed

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
npm run build      # Production build
npm run build-nolog # Production build without gryzor.co logging
npm run test       # Run tests
```

**Working commands:**
```bash
npm run build:cards # Generate card database (works)
npm run test:cli    # CLI tester (may not work due to engine issues)
```

### Deployment

The game is automatically deployed to GitHub Pages using GitHub Actions:

- **Live Demo**: [https://look-itsaxiom.github.io/CardGameDemo/](https://look-itsaxiom.github.io/CardGameDemo/)
- **Auto-deployment**: Triggered on every push to `main` branch
- **Build artifact**: Production build uploaded to `gh-pages` branch

The deployment workflow:
1. Installs dependencies with `npm ci`
2. Builds the project with `npm run build-nolog`
3. Uploads the `dist/` folder to GitHub Pages
4. Makes the game accessible at the GitHub Pages URL

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

**Current Phase**: Foundation Repair & Implementation  
**Actual Version**: Pre-Alpha (Architecture Only)

**Current Reality:**
- ✅ Excellent architectural design and comprehensive type definitions
- ✅ Complete card data definitions (37 cards) with working build system  
- ❌ TypeScript compilation fails with 51 errors across engine components
- ❌ Core game engine functionality incomplete (mostly stub implementations)
- ❌ No functional testing despite documentation claims
- ❌ Stack-based resolution system exists but doesn't actually work

**Next Priorities:**

1. 🔧 **Fix Compilation Issues** - Resolve 51 TypeScript errors
2. 🔧 **Complete Core Implementations** - Fill in stub methods in engine components
3. 🔧 **Add Testing Infrastructure** - Create tests to validate functionality
4. 🔧 **Implement Stack Resolution** - Complete effect execution pipeline

**Realistic Timeline:**
- **Fix compilation**: 1-2 weeks
- **Basic engine functionality**: 4-6 weeks  
- **Feature-complete engine**: 8-12 weeks

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
