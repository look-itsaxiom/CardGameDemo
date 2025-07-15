# Game Design

## Overview

The Card Game Demo is a tactical grid-based RPG card game featuring strategic 3v3 combat, unique summon generation, and dynamic role progression. Players build decks, collect cards, and engage in turn-based battles using a comprehensive effect system.

## Core Mechanics

### Game Format: 3v3 Tactical Combat

**Victory Conditions:**

-   First player to reach **3 Victory Points (VP)** wins
-   VP sources:
    -   Tier 1 Summon defeat: 1 VP
    -   Tier 2+ Summon defeat: 2 VP
    -   Direct territory attack: 1 VP
    -   Quest completion: Variable VP

**Tiebreakers:**

1. Player with most summons in play
2. If still tied, game is a draw

### Turn Structure

Each turn consists of four phases:

1. **Draw Phase** - Draw 1 card from Main Deck (skipped on first turn)
2. **Level Phase** - All player's summons gain 1 level
3. **Action Phase** - Perform actions with specific restrictions
4. **End Phase** - Discard down to 6 cards if over hand limit

### Action Phase Restrictions

-   **One Turn Summon** - Only one summon can be played per turn
-   **Summon Draws** - Playing a summon triggers drawing 3 cards
-   **One Attack** - Each summon can only attack once per turn
-   **Movement** - Summons can move up to their movement speed per turn
-   **Split Actions** - Movement can be split before/after attacking

## Board System

### Grid Layout

-   **12x14 grid** with coordinate system (0,0) at bottom-left
-   **Territory Control** - Each player controls first 3 rows on their side
-   **Unclaimed Territory** - Middle rows between player territories
-   **Diagonal Movement** - Allowed with standard distance calculation

### Zone System

**Player Zones:**

-   **Hand** - Cards available for play (6 card limit at turn end)
-   **Main Deck** - Primary draw source, shuffled when searched
-   **Advance Deck** - Role advancement cards (separate from hand)
-   **Discard Pile** - Spent cards that don't return to deck
-   **Recharge Pile** - Spent cards that shuffle back when Main Deck empty

**Shared Zones:**

-   **In Play Zone** - Active cards affecting the game
-   **Game Board** - Physical placement of units and buildings

## Card Types

### Summon Cards

**Unique Generation System:**

-   Generated from species templates with stat ranges
-   Each card has unique digital signature with timestamp
-   Base stats + growth rates determine progression
-   Equipment slots: 1 weapon, 1 offhand, 1 armor, 1 accessory

### Role Cards

**Three Family System:**

-   **Warrior Family** - Physical combat specialists
-   **Scout Family** - Speed and ranged combat
-   **Magician Family** - Magical abilities and support

**Tier Progression:**

-   **Tier 1** - Basic roles (Warrior, Scout, Magician)
-   **Tier 2** - Specialized roles (Berserker, Rogue, Dark Mage, etc.)
-   **Tier 3** - Elite roles with multi-path access (Paladin, Warlock, etc.)

### Equipment Cards

**Equipment Types:**

-   **Weapon** - Defines attack type, damage, and range
-   **Offhand** - Secondary weapons or shields
-   **Armor** - Defensive bonuses and special effects
-   **Accessory** - Utility effects and stat modifications

### Action Cards

**Single-Use Effects:**

-   Require specific summon roles or conditions
-   Various speeds: Action, Reaction, Counter
-   Move to Discard or Recharge pile after use

### Building Cards

**Persistent Board Effects:**

-   Occupy specific board spaces
-   Provide ongoing effects while in play
-   Can be destroyed by effects or attacks
-   Special subtype: Trap buildings (played face-down)

### Quest Cards

**Objective-Based Rewards:**

-   Remain in play until completed or failed
-   Provide VP, levels, or other rewards
-   Can have ongoing effects while active

### Counter/Reaction Cards

**Response Mechanics:**

-   **Counter Cards** - Must be set face-down, trigger on specific conditions
-   **Reaction Cards** - Can be played from hand or set face-down
-   Enable strategic responses to opponent actions

## Stat System

### Core Stats

-   **STR** (Strength) - Physical attack damage
-   **END** (Endurance) - Health calculation base
-   **DEF** (Defense) - Physical damage reduction
-   **INT** (Intelligence) - Magical attack damage
-   **SPI** (Spirit) - Healing effectiveness
-   **MDF** (Magic Defense) - Magical damage reduction
-   **SPD** (Speed) - Movement speed calculation
-   **ACC** (Accuracy) - Hit chance bonus
-   **LCK** (Luck) - Critical hit chance

### Growth Rates

**Rate Types:**

-   **Minimal** - 1 point every 2 levels
-   **Steady** - 2 points every 3 levels
-   **Normal** - 1 point every level
-   **Gradual** - 1 point + bonus every 3 levels
-   **Accelerated** - 1 point + bonus every 2 levels
-   **Exceptional** - 2 points every level

### Calculated Properties

**Formulas:**

-   **Final Stat** = `(BaseStat + Floor(Level × GrowthRate)) × RoleModifier + EquipmentBonus`
-   **Max HP** = `50 + Floor(END ^ 1.5)`
-   **Movement** = `2 + Floor((SPD - 10) / 5)`
-   **Crit Chance** = `Floor((LCK × 0.3375) + 1.65)`
-   **To Hit** = `BaseAccuracy + (ACC / 10)`

## Combat System

### Attack Resolution

1. **Target Selection** - Choose valid target within range
2. **Hit Calculation** - Roll against calculated to-hit percentage
3. **Critical Check** - Roll against critical hit chance
4. **Damage Calculation** - Apply damage formula based on attack type
5. **Effect Application** - Apply damage and any additional effects

### Damage Types

**Physical Damage:**

-   **Formula** = `STR × (1 + WeaponPower / 100) × (STR / TargetDEF) × CritMultiplier`
-   **Attributes** - Wind, Earth, Fire, Water, Light, Dark, Neutral

**Magical Damage:**

-   **Formula** = `INT × (1 + BasePower / 100) × (INT / TargetMDF) × CritMultiplier`
-   **Attributes** - Same as physical, affects resistances

**Healing:**

-   **Formula** = `SPI × (1 + BasePower / 100) × CritMultiplier`
-   **Can Critical** - Uses same crit chance as attacks

## Effect System

### Stack-Based Resolution

**Speed Levels:**

-   **Action** - Slowest, only during Action Phase
-   **Reaction** - Medium speed, can interrupt actions
-   **Counter** - Fastest, can respond to anything

**Stack Rules:**

-   Last In, First Out (LIFO) resolution
-   Speed locks prevent lower speeds from responding
-   Players alternate priority for responses

### Trigger System

**Trigger Types:**

-   **On Play** - When card enters play
-   **On Defeat** - When summon is destroyed
-   **Phase Triggers** - During specific turn phases
-   **Condition Triggers** - When game state conditions are met

### Requirements System

**Requirement Types:**

-   **Role Requirements** - Must control specific role types
-   **Board Requirements** - Board state conditions
-   **Resource Requirements** - Cost or level requirements
-   **Timing Requirements** - Phase or speed restrictions

## Deck Construction

### Deck Format: 3v3

**Summon Slots (3):**

-   1 Summon card (unique generated)
-   1 Role card (defines class)
-   4 Equipment cards (weapon, offhand, armor, accessory)

**Main Deck:**

-   Action cards for tactical play
-   Building cards for board control
-   Quest cards for objectives
-   Counter/Reaction cards for responses

**Advance Deck:**

-   Role advancement cards
-   Named Summon transformation cards
-   Available when requirements are met

### Collection System

**Card Acquisition:**

-   Purchase card packs from shop
-   Earn through gameplay rewards
-   Future: Trade via auction house

**Rarity System:**

-   Common, Uncommon, Rare, Epic, Legendary
-   Affects stat generation and growth rates
-   Determines pack pull rates

## Advanced Mechanics

### Digital Provenance

**Unique Card Tracking:**

-   Each summon has cryptographic signature
-   Timestamp and opener identity recorded
-   Creates immutable ownership chain
-   Enables secure trading system

### Named Summons

**Elite Transformations:**

-   Summons can advance to unique named forms
-   Inherit certain properties from base summon
-   Gain special abilities and enhanced stats
-   Provide unique action cards

### Ongoing Effects

**Persistent Systems:**

-   Buildings provide continuous effects
-   Quest objectives track progress
-   Status effects last multiple turns
-   Role bonuses apply throughout game

### Multi-Path Advancement

**Tier 3 Convergence:**

-   Some roles accessible via multiple paths
-   Example: Paladin via Warrior→Knight or Magician→Light Mage
-   Provides strategic flexibility in deck building
-   Enables varied playstyles with same end goal

## Strategic Depth

### Decision Points

**Deck Building:**

-   Balance between role families
-   Equipment synergies with summon stats
-   Card velocity vs. power level
-   Advance deck specialization

**Gameplay:**

-   Resource management (cards, positioning)
-   Timing of responses and counters
-   Risk vs. reward in advancement
-   Board control vs. direct aggression

### Counterplay

**Response Systems:**

-   Counter cards punish specific strategies
-   Reaction cards provide tactical flexibility
-   Equipment choices affect matchups
-   Board positioning creates opportunities

This comprehensive game design creates deep strategic gameplay while maintaining accessibility through clear rules and intuitive mechanics. The combination of tactical positioning, resource management, and dynamic card interactions provides rich decision-making at every level of play.
