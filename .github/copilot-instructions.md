# Github Copilot Instructions

This project is an indie game development project focused on creating a card game demo using Typescript based Phaser 3/React.
Currently, the project operates using stubbed data from the /data directory and user data defined directly in the application but the goal is to eventuall become a fully fledged
full-stack web application with a backend API and database including user authentication and authorization, multiplayer support, and a full card game engine.

All code is written in Typescript, React handles the website frontend, and Phaser 3 is used for the game itself.
The project is structured to separate the game logic from the UI logic, allowing for easier testing and maintenance.

When writing code, please follow these guidelines:

1. Use Typescript syntax and conventions.
2. Use Phaser 3 best practices for game development.
3. Use React best practices for UI development.
4. Follow the existing project structure and naming conventions.
5. Write clean, maintainable code with appropriate comments.
6. Use functional components and hooks in React.
7. Never use the `any` type; always specify or create a more precise type or interface.
8. Use Phaser 3's API for game logic and rendering.
9. For React components, ensure they are properly typed and use hooks where appropriate.
10. When creating new features, consider how they will integrate with the existing game state and UI.
11. Only implement and write code that is necessary for the current task or feature being worked on.
12. If you are unsure about a specific implementation, ask for clarification or refer to the project documentation.
13. Only implement and write code that has been approved by the prompter.
14. Never make assumptions regarding the project structure, existing code, intended functionality, design patterns, or any other aspect of the project. Always ask for clarification if needed.

# The Goal

The game being developed is a tactical grid based rpg card game with a fantasy theme. Players will be able to collect cards, build decks, and battle against each other or AI opponents at full realization.
Currently, we are focused on creating a demo that showcases the core gameplay mechanics with a user interface that allows me to test and interact with the game and eventually a small shippable product to gather feedback.

The demo will include:

- A deck builder UI for creating and managing decks.
- A card shop UI for purchasing and acquiring new cards. (fake currency for now)
- A card collection UI for viewing and managing collected cards.
- A game board UI for playing the game, including a grid-based layout for placing cards and interacting with them.
- A game engine that handles the core gameplay mechanics, including card interactions, turn management, and win/loss conditions.

# The Game Mechanics

Before players can battle, they must first collect cards, and build a deck.
Players can collect cards through various means, such as purchasing card packs from the card shop, earning cards through gameplay, or trading with other players via the Auction House (final state).

After collecting cards, players will create "decks", which are collections of cards for use in battles. There will be different decks for different formats later but right now we are focusing on 3v3 between two players.
A deck for the 3v3 format contains:
3 "summon slots"
a main deck
an "advance" deck

A "summon slot" is its own grouping of cards that consists of:

- 1 "summon" card that is placed in the slot and represents the main card for that slot.
- 1 "role" card that defines the tier 1 role or class of the summon (e.g., scout, magician, warrior, etc.).
- multiple "equipment" card slots that can be placed on the summon card to enhance its abilities or provide additional effects.
    - Equipment card slots include 1 weapon, 1 offhand, 1 armor, and 1 accessory slot.

"summon" cards are cards that players pull from packs that are randomly generated from summon templates and completely unique.
Each summon card generates base stats based on its species, and growth rates for each stat based on probability tables based on the rarity of the card.

The "role" card defines the initial class or role of the summon, which can affect its abilities and stats.

The "equipment" cards are additional cards that can be placed in the summon slot to enhance the summon's capability in battle.
Each equipment card has its own type (weapon, offhand, armor, accessory) and provides different bonuses or effects.
The weapon slot is most important as it defines the primary attack type, damage output, and attack range of the summon.

The combination of all these cards in a summon slot synthesize a summon card that players start with in their hands at the beginning of the game. Each summon card is then played in the game to create a "summon unit", more on this later.

The main deck is a collection of cards that players draw from during the game. Card types as of this writing include: Action cards, Building cards, Quest cards, Counter cards, and Reaction cards.

- Action cards are played during a player's main phase and have various effects, they usually have requirements to be played such as having a summon with a certain role and valid targets in play. Action cards usually are played, their effects resolve, and then move to either the Recharge or Discard piles, more on this later.
- Building cards are played during a player's main phase and represent permenants that provide ongoing effects on specific spaces on the game board. They can be placed on the board and remain in play until destroyed or removed by an effect. Building cards also have requirements to be played such as having valid spaces to place them on, or a summon with a certain role.
    - A special sub-type of Building card is the "Building - Trap" card, which is a building that is secretly placed facedown in the In Play Zone and can be activated when an opponent's summon moves into its space. When activated, it reveals its effect and resolves it, then is moved to the Recharge or Discard piles.
- Quest cards are played during a player's main phase and can vary a bit, but generally represent objectives that players can complete for rewards, or ways for players to level their summons faster than the normal rate. Quest cards are either resolved immediately and moved to the Recharge or Discard piles, or remain in play until completed.
- Counter cards must be played face down in the In Play Zone before they can be activated and resolved. Once they've been set in this way, any time their trigger condition is met, their controlling player can activate them to resolve their effect. Counter cards are usually played in response to an opponent's action or effect, and can be used to disrupt their plans or gain an advantage. Counter cards are moved to the Recharge or Discard piles after being activated.
- Reaction cards are played in response to an opponent's action or effect even from a player's hand, and can be used to disrupt their plans or gain an advantage.
  They can be played from the hand on a players turn, or set facedown in the In Play Zone and activated on your opponents turn. Reaction cards differ from Counter cards in that they don't have specific trigger conditions for activation but their effects are less potent.
  Reaction cards are moved to the Recharge or Discard piles after being activated.

The "advance" deck is a collection of cards that players can play during the game to "advance" or promote their summons to roles of higher tiers or to Named Summons.
Regardless, cards in the advance deck have strict requirements for summons to meet before they can be played but are always available to the player when their summons meet them.
Players being able to advance their summons is a key part of the game and allows players to change their gameplay strategy on the fly. Right now, the advance deck cards are very vanilla in that they pretty much only represent stat boosts but I'd like to see interesting interactions and effects later.

I have designed a small card pool that directly reflects a play session example I wrote early on in the project, you can find it in the Concept.md file in the root of the project.

For more details on the various properties that make up the different card types, please refer to the entries in the /data/db.json file for each card type.

Players will need to balance selecting cards for their decks based on the summons individual talents and the cards they have available to them.

Once players have their decks ready, they can start a game and play against an opponent.

The game is arranged into multiple zones and turns are taken in a phase-based system.
Each player has a Hand, a Main Deck, an Advance Deck, a Discard Pile, a Recharge Pile, and 3 rows of the game board that represent territory they control.
The other zones are the In Play Zone, and the 12x14 Game Board square grid that represents the battlefield. As mentioned, the first 3 rows on both sides are the territory controlled by each player, and the rows between are referred to as "unclaimed" territory.

1. The Hand is where players keep the cards they draw from their Main Deck, there is no maximum hand size but players must discard down to 6 cards at the end of their turn if they have more than that.
2. The Main Deck is where players draw cards from at the start of their turn, and during the game when they perform a "Turn Summon".
   It is shuffled at the start of the game and whenever it is searched through to add a specific card to the player's hand or when a card is moved to the Discard Pile directly from it.
   The general rule of practice is when a player would need to pick up and search through the Main Deck to find a card to resolve an effect, they should shuffle the deck afterwards.

    - When the Main Deck is depleted and a draw is required, the player attempts to shuffle their Recharge Pile into their Main Deck. If the Recharge Pile is also empty, then that draw attempt fails.

3. The Advance Deck is where players keep their cards that can be played to advance their summons.
   These cards are almost an extension of the player's hand but removed into their own zone since it isn't always that they're requirements are met for use.
   However, when those requirements are met, players can play cards from their Advance Deck at any time during their Action Phase.
4. The Discard Pile and Recharge Pile are where cards go when they are removed from play or resolved.

- Which Pile they go to is usually indicated on the card itself or by the effect that removed them but if not, each card type has a default behavior:
    - Counter, Building, and Quest go to the Discard Pile when resolved.
    - Action and Reaction cards go to the Recharge Pile when activated.
    - Summon cards and other unique cards are removed from play completely (not a zone) when they leave the In Play Zone.
- As mentioned, the Recharge Pile is shuffled into the Main Deck when it is depleted and a draw is required.

5. The In Play Zone is where cards that are currently active in the game reside. This includes Summons, Buildings, Counters, Quests and any other cards that have been played and are affecting the game state.
6. The Game Board is where the Summons and Buildings are placed during the game. It is a 12x14 grid with each player controlling the first 3 rows on their side of the board.

The player's turn is decided by a coin flip at the start of the game, and each turn consists of the following phases:

1. Draw Phase: For every turn after the first, a player draws 1 card from their Main Deck and adds it to their hand.
2. Level Phase: All Summons the turn player controls currently in play gain 1 level.
3. Action Phase: The only restrictions on this phase are that a player is only able to perform a normal turn summon once per turn, Summons In Play can only attack once per turn, and can move spaces up to their movement speed value per turn.

- ex. A summon with a movement speed of 2 can choose to move 1 space, then attack, the player can perform other actions, and then that summon can finish their remaining movement at any point during the Action Phase.
- Player can only play a single Summon per turn unless otherwise specified by a card effect, this single summon is refered to as a "Turn Summon" and triggers what is called "Summon Draws". When a "Turn Summon" resolves, the player draws 3 cards from their main deck into their hand.
- Beyond these restrictions, players can perform any number of actions during this phase assuming they have the resources and meet the requirements or trigger conditions to do so.

4. End Phase: Once a player has run out of actions to perform, they designate the end of their turn and the End Phase begins and resolves.

- If the turn player has more than 6 cards in their hand, they'll need to send cards to the Recharge pile until they have 6 cards left in hand.
- Once the End Phase resolves, the next player's turn begins.

The primary objective of the game is to accrue 3 Victory Points (VP) by defeating the opponent's Summons, completing certain Quest cards, or by making a direct attack on the opponent's territory while there are no opposing Summons inside it.

- When a Tier 1 Summon drops to 0 HP, it is removed from the In Play Zone and from the game completely. At that time, the player opposing the player who controlled the defeated Summon gains 1 VP.
- When a Tier 2 Summon drops to 0 HP, it is removed from the In Play Zone and from the game completely. At that time, the player opposing the player who controlled the defeated Summon gains 2 VP.
- When a Summon you control is within your opponent's territory and there are no opposing Summons in that territory, you can make a direct attack on the opponent's territory to gain 1 VP.
- Some card effects can grant or remove VP from players.

- When a player reaches 3 VP, they win the game.
- If both players reach 3 VP at the same time, the player with the most Summons in play wins the game.
- If both players reach 3 VP at the same time and have the same number of Summons in play, then the game is a draw.

# Core Gameplay Formulas

Once a Summon is placed on the board, it becomes a "Summon Unit" and gains a set of stats and properties that are derived from the Summon card's base stats and growth rates.
Summon Units always start at level 5 and can level up to a maximum of level 20.
In order to determine all the properties of a Summon Unit, we need to calculate its current stats based on its level, base stats, growth rates, and any equipment bonuses.
To calculate the stats of a Summon Unit, we need to consider the following:

There are 9 stats that a Summon has:
STR, END, DEF, INT, SPI, MDF, SPD, ACC, and LCK
Strength (STR) - Affects the damage dealt by physical attacks.
Endurance (END) - Affects the maximum HP of the Summon Unit.
Defense (DEF) - Affects the damage taken from physical attacks.
Intelligence (INT) - Affects the damage dealt by magical attacks.
Spirit (SPI) - Affects the effectiveness of healing and support abilities.
Magic Defense (MDF) - Affects the damage taken from magical attacks.
Speed (SPD) - Affects the movement speed of the Summon Unit.
Accuracy (ACC) - Affects the chance to hit with attacks.
Luck (LCK) - Affects various random elements in the game, mainly critical hits.

When a player opens a Summon card from a pack, the card's base stats are generated based on its species and rarity. But it also receives a growth rate for each stat that is randomly generated based on the rarity of the card.
Note: Because these summon cards become unique at generation, they are created with a unique ID and stored in the database essentially as a brand new card!

The growth rates are used to determine how much each stat increases when the Summon Unit levels up.

The formula for caculating a stat at a given level is as follows:
FinalStat = (BaseStat + (Floor(Level x GrowthRate)) x Role Modifier) + Equipment Bonus + (Other Bonuses)

The growth rates are as follows:
Minimal - Stat grows by 1 every 2 levels.
Steady - Stat grows by 2 every 3 levels.
Normal - Stat grows by 1 every level.
Gradual - Stat grows by 1 every level, with an additional bonus of 1 every 3 levels.
Accelerated - Stat grows by 1 every level, with an addtional bonus of 1 every 2 levels.
Exceptional - Stat grows by 2 every level.

Growth Rates have a Bell Curve distribution, meaning it's most likely to get a Normal growth rate, and least likely to get an Exceptional or Minimal growth rate.
As the rarity of the card increases, the chance of getting a Minimal growth rate decreases and the chance of getting a higher growth rate increases.

The Role Modifier is a multiplier that applies when a Role is applied to a Summon slot.
Roles don't contribute to the growth of stats but represent a boost to them as a whole since Roles can change during a game.

Now that we have determined the Current Stats of a Summon Unit at a given level, we can calculate its other properties such as:

- Max HP: MaxHP = 50 + Floor(END ^ 1.5)
- Movement Speed: MV = 2 + Floor((SPD - 10) / 5)
- Basic Attack To Hit Chance: ToHit = 90 + (ACC / 10)
- Basic Attack Damage: Damage = STR x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT
    - IF_CRIT is a multiplier that applies when a critical hit occurs, 1.5x damage.
- Attack Range: Determined by the Weapon card equipped to the Summon Unit.
- Critical Hit Chance: CritChance = Floor((LCK x 0.3375) + 1.65)
- Standard Ability To Hit Chance: AbilityToHit = AbilityAccuracy + (ACC / 10)

Now that we have all these properties, we have a fully realized Summon Unit ready for battle in game.

# Additional Notes

In the future, my vision for this game is a fully realized multiplayer experience with microtransactions with in game currency to purchase card packs and cosmetic items.
I also want to implement an auction house system for players to use in game currency to trade cards with each other.
I have a lot of faith in this project and I believe it has the potential to be a great game but a lot hinges on the execution to create something that can be extended over time to create new and interesting mechanics and archetypes as the game evolves.

Here are the phases of this project:

1. Create a demo that showcases the core gameplay mechanics and UI. We're currently here in this phase.
2. Create a small shippable product to gather feedback and iterate on the design.
3. Implement a full card game engine to support the core gameplay mechanics and UI.
4. Implement a backend API and database to support user authentication, multiplayer support, and card collection.
5. Implement a full multiplayer experience with matchmaking and leaderboards.
6. Continue to iterate on the game design and mechanics based on player feedback and data.
7. Implement microtransactions and an auction house system for players to trade cards with each other.
8. Expand the game with new card types, mechanics, and archetypes to keep the game fresh and engaging.
   ???
   Profit
