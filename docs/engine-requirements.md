# Game Engine Functional Requirements

## Overview

This document defines the complete functionality that the Card Game Demo engine must implement to be considered feature-complete for the 3v3 tactical card game.

## Core Game Loop

### Turn Structure
1. **Draw Phase**: Draw 1 card (skip on turn 1)
2. **Level Phase**: All player's summons gain 1 level
3. **Action Phase**: Play cards, move units, attack, use abilities
4. **End Phase**: Hand limit enforcement, cleanup effects

### Victory Conditions
- **Defeat Enemy Summons**: 1 VP per Tier 1, 2 VP per Tier 2+ summon
- **Direct Territory Attack**: 1 VP for attacking empty enemy territory
- **Quest Completion**: Variable VP from completed quest cards
- **First to 3 Victory Points wins**

## Card System

### Card Types and Processing
- **Summon Cards**: Unique cards with digital signatures and species-based stats
- **Action Cards**: Immediate effects, go to discard or recharge pile
- **Building Cards**: Permanent structures with ongoing effects
- **Quest Cards**: Objectives with completion rewards
- **Counter Cards**: Face-down responses to specific triggers
- **Reaction Cards**: Fast responses playable from hand or face-down
- **Equipment Cards**: Enhance summon capabilities (weapon, armor, accessory, offhand)
- **Role Cards**: Define summon class and stat modifiers
- **Advance Cards**: Upgrade summons to higher tiers or named characters

### Deck Management
- **Main Deck**: Draw source, shuffled when empty by moving recharge pile
- **Advance Deck**: Always available when requirements met
- **Hand**: No max size, discard to 6 at end of turn
- **Discard Pile**: Permanent removal (buildings, counters, quests)
- **Recharge Pile**: Recycled into main deck (actions, reactions)
- **In Play Zone**: Active cards affecting game state

## Summon System

### Summon Slot Synthesis
- **Summon Card**: Base stats, growth rates, species traits
- **Role Card**: Stat modifiers, tier progression, abilities
- **Equipment Set**: Weapon (required), armor, accessory, offhand
- **Final Unit**: Combined stats with calculated bonuses

### Stat Calculation
```
FinalStat = (BaseStat + Floor(Level × GrowthRate) × RoleModifier) + EquipmentBonus
MaxHP = 50 + Floor(END^1.5)
Movement = 2 + Floor((SPD - 10) / 5)
ToHitChance = BaseAccuracy + (ACC / 10)
CritChance = Floor((LCK × 0.3375) + 1.65)
```

### Level Progression
- **Starting Level**: 5
- **Maximum Level**: 20
- **Level Sources**: Turn leveling, quest rewards, building effects
- **Growth Rates**: Minimal, Steady, Normal, Gradual, Accelerated, Exceptional

## Combat System

### Attack Resolution
1. **Range Validation**: Check weapon range and positioning
2. **Hit Calculation**: Roll against accuracy + modifiers
3. **Critical Hit Check**: Roll against luck-based crit chance
4. **Damage Calculation**: Apply weapon power and stat formulas
5. **Damage Application**: Reduce target HP, trigger defeat if ≤ 0

### Combat Formulas
```
BasicAttack = STR × (1 + WeaponPower/100) × (STR/TargetDEF) × CritMultiplier
MagicalAttack = INT × (1 + SpellPower/100) × (INT/TargetMDF) × CritMultiplier
RangedAttack = ((STR+ACC)/2) × (1 + WeaponPower/100) × (STR/TargetDEF) × CritMultiplier
```

## Effect System

### Effect Resolution Stack
- **Speed Levels**: Action (slowest) → Reaction → Counter (fastest)
- **Stack Order**: Last In, First Out (LIFO) resolution
- **Speed Lock**: Higher speeds prevent lower speeds from responding
- **Response Windows**: Players can respond when they have priority

### Trigger System
- **Event Detection**: Monitor game state changes for trigger conditions
- **Context Preservation**: Maintain trigger source, target, and parameters
- **Response Queueing**: Add triggered effects to resolution stack
- **Timing Rules**: Phase restrictions and speed requirements

### Effect Types
- **Immediate Effects**: Resolve instantly (damage, healing, stat changes)
- **Ongoing Effects**: Persist until removed (stat bonuses, abilities)
- **Delayed Effects**: Activate at future timing (end of turn, next phase)
- **Triggered Effects**: Activate on specific conditions (on attack, on summon)

## Board Management

### Grid System
- **Dimensions**: 12×14 grid (144 total spaces)
- **Player Territories**: Rows 0-2 (Player 1), Rows 11-13 (Player 2)
- **Neutral Territory**: Rows 3-10
- **Positioning**: (0,0) at bottom-left corner

### Movement Rules
- **Movement Points**: Based on SPD stat calculation
- **Path Finding**: Manhattan distance, no diagonal movement
- **Collision**: Cannot move through or onto occupied spaces
- **Turn Limitation**: Use all movement in single turn, cannot split attacks

### Building Placement
- **Territory Restrictions**: Must place in controlled territory unless specified
- **Space Requirements**: Multi-space buildings need contiguous areas
- **Occupancy**: Buildings occupy spaces and may affect movement
- **Destruction**: Buildings can be destroyed by effects or unit defeat

## Advanced Mechanics

### Role Advancement
- **Tier Progression**: Tier 1 → Tier 2 → Tier 3 or Named Summons
- **Requirements**: Level thresholds, completed actions, specific conditions
- **Stat Recalculation**: Apply new role modifiers to all stats
- **Ability Changes**: Gain new abilities, modify existing ones

### Equipment Synthesis
- **Compatibility**: Validate equipment works with summon species
- **Stat Bonuses**: Flat bonuses added after role calculation
- **Special Effects**: Equipment may grant abilities or modify mechanics
- **Digital Signatures**: Maintain cryptographic integrity of unique items

### Named Summons
- **Unique Characters**: Predefined powerful units with special abilities
- **Material Requirements**: Consume specific summons and conditions
- **Enhanced Stats**: Superior stat progression and unique effects
- **Lore Integration**: Connected to game world and story elements

## Zone Management

### Card Zones
- **Hand**: Private zone, no size limit during turn
- **Deck Zones**: Main deck, advance deck, discard pile, recharge pile
- **Play Zones**: In play zone, board positions
- **Hidden Zones**: Face-down counters and reactions

### Zone Transfer Rules
- **Search Effects**: Shuffle deck after searching unless specified
- **Pile Management**: Automatic recharge-to-main-deck when empty
- **Visibility**: Public vs private zone information
- **Persistence**: Card memory across zone changes

## Input Validation

### Action Validation
- **Phase Restrictions**: Actions only available in appropriate phases
- **Resource Checks**: Verify sufficient resources (cards, movement, attacks)
- **Requirement Validation**: Check card requirements and targeting
- **Permission Validation**: Confirm player owns relevant game objects

### State Consistency
- **Invariant Checking**: Verify game state rules are maintained
- **Rollback Capability**: Undo invalid state changes
- **Error Recovery**: Gracefully handle and report invalid inputs
- **Deterministic Behavior**: Same inputs produce same outputs

## Performance Requirements

### Response Time
- **Action Processing**: < 10ms for simple actions
- **Effect Resolution**: < 50ms for complex effect chains
- **State Updates**: < 5ms for state mutations
- **Query Operations**: < 1ms for state reading

### Memory Management
- **Stable Usage**: No memory leaks during extended play
- **Efficient Storage**: Minimal memory overhead for game objects
- **Garbage Collection**: Proper cleanup of removed game objects
- **Scalability**: Handle multiple concurrent games

## API Design

### Public Interface
```typescript
interface GameEngine {
  // State access
  getState(): Readonly<GameState>
  getConfig(): Readonly<GameEngineConfig>
  
  // Action processing
  processAction(action: GameAction): ActionResult
  validateAction(action: GameAction): ValidationResult
  
  // Effect system
  processEffectStack(): Promise<StackResult>
  submitPlayerResponse(response: PlayerResponse): ResponseResult
  
  // Query operations
  getValidTargets(cardId: string, playerId: PlayerId): string[]
  checkVictoryConditions(): PlayerId | null
}
```

### Error Handling
- **Structured Errors**: Clear error types and messages
- **Validation Results**: Detailed feedback on validation failures
- **Recovery Guidance**: Suggestions for fixing invalid actions
- **Debug Information**: Detailed state for troubleshooting

## Integration Points

### External Systems
- **User Interface**: React components for game visualization
- **Network Layer**: Multiplayer communication protocol
- **Data Persistence**: Save/load game state functionality
- **Analytics**: Game event tracking and metrics

### Extension Points
- **Card Effects**: Plugin system for new card mechanics
- **Game Modes**: Support for different game formats
- **Rule Variations**: Configurable game rules and mechanics
- **Content Expansion**: New card sets and mechanics

This functional specification ensures the game engine will be complete, performant, and maintainable when fully implemented.
