# Game Mechanics Overview

## Game Flow

### Turn Structure

Each player's turn consists of four phases:

1. **Draw Phase**: Draw 1 card from Main Deck (skipped on first turn)
2. **Level Phase**: All player's summons gain 1 level
3. **Action Phase**: Player can perform actions with restrictions
4. **End Phase**: Discard down to 6 cards if over hand limit

### Action Phase Restrictions

-   **One Turn Summon**: Only one summon can be played per turn
-   **One Attack**: Each summon can only attack once per turn
-   **Movement**: Summons can move up to their movement speed per turn
-   **Summon Draws**: Playing a summon triggers drawing 3 cards

## Victory Conditions

Players win by accumulating **3 Victory Points (VP)** through:

-   **Tier 1 Summon Defeat**: 1 VP when opponent's Tier 1 summon is destroyed
-   **Tier 2+ Summon Defeat**: 2 VP when opponent's Tier 2+ summon is destroyed
-   **Direct Attack**: 1 VP when attacking opponent's territory with no defending summons
-   **Quest Completion**: Variable VP from specific quest cards

### Tiebreakers

1. Player with most summons in play wins
2. If tied, game is a draw

## Board System

### Grid Layout

-   **12x14 grid** with coordinate system (0,0) at bottom-left
-   **Territory Control**: Each player controls first 3 rows on their side
-   **Unclaimed Territory**: Middle rows between player territories

### Movement

-   **Movement Speed**: Calculated as `MV = 2 + Floor((SPD - 10) / 5)`
-   **Split Movement**: Can move before/after attacking during Action Phase
-   **Diagonal Movement**: Allowed with standard distance calculation

## Card Types and Zones

### Card Types

-   **Summon Cards**: Unique generated units placed on the board
-   **Action Cards**: Single-use effects that resolve immediately
-   **Equipment Cards**: Enhance summons (weapon, offhand, armor, accessory)
-   **Building Cards**: Permanent effects on specific board spaces
-   **Quest Cards**: Objectives that provide rewards when completed
-   **Counter Cards**: Face-down responses to specific triggers
-   **Reaction Cards**: Quick responses playable from hand or face-down

### Zone System

-   **Hand**: Cards available for play (6 card limit at end of turn)
-   **Main Deck**: Draw source and card storage
-   **Advance Deck**: Role advancement cards (separate from hand)
-   **Discard Pile**: Spent cards that don't return to deck
-   **Recharge Pile**: Spent cards that shuffle back into Main Deck when empty
-   **In Play Zone**: Active cards affecting the game
-   **Game Board**: Physical unit and building placement

## Stat System

### Core Stats

-   **STR** (Strength): Physical attack damage
-   **END** (Endurance): Health calculation base
-   **DEF** (Defense): Physical damage reduction
-   **INT** (Intelligence): Magical attack damage
-   **SPI** (Spirit): Healing effectiveness
-   **MDF** (Magic Defense): Magical damage reduction
-   **SPD** (Speed): Movement speed calculation
-   **ACC** (Accuracy): Hit chance bonus
-   **LCK** (Luck): Critical hit chance

### Calculated Properties

-   **Max HP**: `50 + Floor(END ^ 1.5)`
-   **Movement**: `2 + Floor((SPD - 10) / 5)`
-   **Crit Chance**: `Floor((LCK × 0.3375) + 1.65)`
-   **To Hit**: `Base Accuracy + (ACC / 10)`

## Combat System

### Attack Resolution

1. **Target Selection**: Choose valid target within range
2. **Hit Calculation**: Roll against to-hit percentage
3. **Critical Check**: Roll against critical hit chance
4. **Damage Calculation**: Apply damage formula
5. **Damage Application**: Reduce target HP

### Damage Formulas

**Physical Weapon Attack**:

```
STR × (1 + Weapon Power / 100) × (STR / Target DEF) × Crit Multiplier
```

**Magical Attack**:

```
INT × (1 + Base Power / 100) × (INT / Target MDF) × Crit Multiplier
```

**Ranged Attack** (Bow weapons):

```
((STR + ACC) / 2) × (1 + Weapon Power / 100) × (STR / Target DEF) × Crit Multiplier
```

### Healing Formula

```
SPI × (1 + Base Power / 100) × Crit Multiplier
```

## Effect System

### Trigger Types

-   **On Play**: When card enters play
-   **On Attack**: When unit attacks
-   **On Damage**: When unit takes damage
-   **Phase Triggers**: During specific game phases
-   **Condition Triggers**: When game state conditions are met

### Speed Levels

-   **Action Speed**: Only during Action Phase with priority
-   **Reaction Speed**: Any time with priority
-   **Counter Speed**: Automatic response to specific triggers

### Stack Resolution

1. Effects enter the stack in Last-In-First-Out order
2. Players can respond until no more responses are added
3. Stack resolves from top to bottom
4. Each resolution may trigger new effects

## Level System

### Summon Progression

-   **Starting Level**: All summons start at level 5
-   **Maximum Level**: Level 20 (except special effects)
-   **Leveling**: Gain 1 level during each Level Phase
-   **Stat Growth**: Apply growth rates to base stats

### Growth Rates

-   **Minimal**: +1 every 2 levels (0.5 per level)
-   **Steady**: +2 every 3 levels (0.66 per level)
-   **Normal**: +1 every level (1.0 per level)
-   **Gradual**: +1 per level + 1 every 3 levels (1.33 per level)
-   **Accelerated**: +1 per level + 1 every 2 levels (1.5 per level)
-   **Exceptional**: +2 every level (2.0 per level)

### Stat Calculation

```
Final Stat = (Base Stat + Floor(Level × Growth Rate)) × Role Modifier + Equipment Bonus
```

## Role System

### Role Families

-   **Warrior**: Physical combat focus (STR, END, DEF)
-   **Scout**: Speed and precision (SPD, LCK, ACC)
-   **Magician**: Magical abilities (INT, SPI, MDF)

### Advancement Trees

-   **Tier 1**: Base roles (Common rarity)
-   **Tier 2**: Specializations (Uncommon rarity)
-   **Tier 3**: Masters (Rare rarity, unique effects)

### Role Modifiers

Roles apply multipliers to calculated stats:

-   Base stats are calculated first
-   Role modifiers are applied as multipliers
-   Equipment bonuses are added last

## Deck Construction

### 3v3 Format

**Summon Slots** (3 total):

-   1 Summon card (unique generated)
-   1 Role card (Tier 1 starting role)
-   4 Equipment cards (weapon, offhand, armor, accessory)

**Main Deck**:

-   Action cards
-   Building cards
-   Quest cards
-   Counter cards
-   Reaction cards

**Advance Deck**:

-   Role advancement cards
-   Named Summon cards
-   Available when requirements are met

This system creates strategic depth through multiple interconnected mechanics while maintaining clear, data-driven rules.
