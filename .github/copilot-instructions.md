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
- Quest cards are played during a player's main phase and can vary a bit, but generally represent objectives that players can complete for rewards, or ways for players to level their summons faster than the normal rate. Quest cards are either resolved immediately and moved to the Recharge or Discard piles, or remain in play until completed or failed.
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

## Play Mechanics

As the game progresses through each phase of a player's turn, there are many opportunities for players to respond to actions and effects.
When a player plays a card or activates an effect, it goes into the In Play Zone and is revealed to the opponent. At this time, the opponent has the opportunity to respond with any Counter or Reaction cards they have in their hand or set in the In Play Zone.
This brings up the important concepts of "Triggers", "Requirements", "Responses", "Resolutions", and the "Stack". As well as other important concepts such as "Priority" and "Speed".

### Triggers

Triggers are signals that occur throughout the game that indicate a specific event has occurred that allows cards or effects that require that event to be played or activated in response.
For example, a Counter card may have a trigger condition of "When an opponent plays a Summon card", which means that when the opponent plays a Summon card, the player can respond by playing that Counter card.
Or a Trigger may be as specific as "During the End Phase of your opponent's third turn after this card was set", which means that the player can respond by activating that Counter card during the End Phase of their opponent's third turn after the card was set.
A very common Trigger is "On Play", which simply means "When this card is played" or technically "When this card successfully enters the In Play Zone".
However, even this simple Trigger can be nuanced, take for example an "On Play" Trigger that listens for an opponent healing a Summon. This Trigger is not as simple and shouldn't be evaluated the same way despite having the same name.
Triggers are many and varied, and are a key part of the game's strategy and depth. They must contain useful information for trigger evaluation, such as but not limited to: the player who caused the trigger, the card that caused the trigger, the target of the effect that caused the trigger, and any other potentially relevant information.
This piece of information is referred to as "Trigger Context", and will be one of the most important pieces of implementation for a robust, data driven, extendable card game.

### Responses

Responses are the actions that cards or effects take when their trigger conditions are met (called Requirements), usually in the form of a Player playing or activating a card or effect in response to a trigger.
Responses enter the "Stack" to be resolved in a specific order, usually Last In First Out (LIFO) unless a card effect has changed the nature of that interaction.
Responses are sort of just flag indicators that another effect needs to be resolved, and are not the actual resolution of the effect itself.
As with almost everything else in the game, responses also generate Trigger events that in turn can generate more responses, and so on. This is the continually building construct we refer to as the "Stack".

### Resolutions

Resolutions are what follow Responses, and are the actual effects that cards or effects take when they are resolved from the Stack.
When the Stack has reached a point where no more Responses are being added, the topmost Response on the Stack is resolved, and its effect is applied to the game state.
This may in turn generate more Trigger events that in turn can generate more Responses, however once the Stack has entered a Resolving state, Responses cannot be added until all Resolutions have been resolved and the Stack is empty again.
Once emptied, any pending Trigger events are evaluated and any Responses generated are added to the Stack, and the process continues until no more Responses are being added to the Stack.

### Priority and Speed

Priority and Speed are two concepts that determine when a player can create Responses to Trigger events.
Priority is a concept that determines which player has the right to respond to a Trigger event first. Priority can be determined by which Player acted last, and which Player's turn it is.
For instance, if Player A plays a card during their turn, Player B has Priority to respond to that Trigger event first. Then, Player A can respond to any Trigger events generated by Player B's Response, and so on.
Or in another example, if Player A plays a card during their turn, Player B is given Priority to respond but has no Responses to make, then Player A is free to make a Response to their own Trigger providing the Requirements are correct.

Speed is an example of one of these Requirements but exists on a global scale. It is both a property of cards and effects, as well as a property of the game state itself.
The three Speed levels are: Action, Reaction, and Counter named after the card types that typically represent them.
Action is the slowest Speed, and can only be played during a player's Action Phase when they have Priority. It is the primary Speed of the game, and usually represents the first action taken in a chain of events.
The Action Speed is very relevant, in that almost every action taken in the game falls under this category. Moving a unit, attacking, playing a Summon, initiating the end of a phase, etc. are all examples of Actions. (unless otherwise specified by a card effect)
Reaction is a middle Speed, and can be played during either player's turn when they have Priority. It is usually played in response to an Action, and represents a quick reaction to an event.
Reactions will most likely take up the majority of Responses on the Stack, as they are the most versatile Speed and can be played in a variety of situations.
For example, a player could play a Reaction from their hand in response to an opponent moving a unit, or even in response to an opponent initiating the end of their turn.
Counter is the fastest Speed, and can be played during either player's turn whenever its trigger condition is met. It is usually played in response to an Action or Reaction, and represents a quick and decisive counter to an event.

The levels of Speed are important because each Speed that is added to the Stack creates a "Speed Lock" that prevents any lower Speed Responses from being added to the Stack until all Responses of that Speed have been resolved.
For example, if an Action is added to the Stack, then a Reaction is added to the Stack, then no more Action Responses can be added to the Stack until the Reaction has been resolved.
But, in the same example, if a Counter is added to the Stack after the Reaction, then no more Action or Reaction Responses can be added to the Stack until the Counter and any additional Counter Speed Responses have been resolved.

The Speed Lock is a key part of the game turn phases as well, as Action Speed is only accessible during a player's Action Phase on their turn. Actions cannot be taken during Draw, Level, or End Phases.

### Play Eligibility

With all these varying concepts at play, it is important to determine when a player is eligible to play a card or activate an effect.
Each card or effect has its own set of Requirements that must be met in order for it to be played or activated and making sure these Requirements are met is crucial to the integrity of the game.
Additionally, making these Requirements data driven and easily extendable is important for the longevity of the game.
Players being aware of when they can play cards or activate effects is also important for the flow of the game, and making sure that players are not confused or frustrated by being unable to play cards or activate effects when they think they should be able to.

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

# Example Play session

Player A logs in and is presented with the main menu of the game. After reviewing what's new, they decide to queue for a game.
They select the game type 3v3 and are presented with a deck selection screen. Already having a deck built, they select it and confirm their choice.
After a short wait, they are matched against Player B and the game begins.

The game begins with a coin flip, with each player randomly assigned to Heads or Tails. Player A wins the coin flip, and is presented the option to go first or second.
Player A chooses to go first, and the 12x14 game board is animatedly "built" in front of them, with each player's territory highlighted on their respective sides of the board.
Each player's 3 Summon Cards are shown in each player's hands and the game begins.

Turn 1 - Player A:
As Player A is going first, they do not draw a card during their Draw Phase.
Similarly, as they have no Summons in play, nothing happens during their Level Phase.
Player A enters their Action Phase and surveys their Summons in hand: a Gignen Warrior, a Gignen Scout, and a Gignen Magician.
They decide on the Gignen Warrior and using their Turn Summon, they initiate playing the card by selecting it and selecting a valid space in their territory: space coordinate (5,2). ((0,0) would be the bottom left space of the board)
The Summon Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Summon Unit materializes on the game board and its stats and properties are calculated:
Player A's Summon: Species: Gignen, Role: Warrior, Level 5, HP 96/96, MV 2, STR 18, END 13, DEF 15, INT 15, SPI 13, MDF 11, SPD 12, LCK 19, ACC 12, Growth Rates: STR 1.33, END 1, DEF 1, INT 0.66, SPI 1, MDF 0.66, SPD 0.5, LCK 2, ACC 0.66, Equipment: "Heirloom Sword" (034-heirloom_sword-Alpha)
Successfully performing their Turn Summon, Player A draws their 3 Summon Draws, adding them to their hand: "Sharpened Blade", "Healing Hands", and "Rush". All Action cards with various effects and requirements.
Player A selects the now playable "Sharpened Blade" Action card which has the requirement of having a Warrior Summon in play, and targets their Gignen Warrior for its effect.
Player A's "Sharpened Blade" enters the In Play Zone and with no response available from Player B, resolves its effect: "Target Weapon equipped to a Warrior based Summon gains +10 Base Power."
Player A's Gignen Warrior's Weapon "Heirloom Sword"'s Base Power increases from 30 to 40 indefinitely.
Once the effect resolves, "Sharpened Blade" is moved to Player A's Recharge Pile.
Finally, Player A selects their Gignen Warrior and moves it 2 spaces forward into unclaimed territory (5,4), and initiates ending their Action Phase.
Player A enters their End Phase, with no responses to resolve, Player A's turn ends and Player B's turn begins.

Turn 2 - Player B:
Player B begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card they draw is "Drain Touch".
With no Summons in play, nothing happens during their Level Phase.
Player B enters their Action Phase and inspects their Summons in hand: a Stoneheart Warrior, a Fae Magician, and a Wilderling Scout.
Player B selects the Fae Magician and using their Turn Summon, they initiate playing the card by selecting it and selecting a valid space in their territory: space coordinate (5,11).
The Summon Card enters the In Play Zone, revealing it to Player A and prompting a response. With no response available from Player A, the Summon Unit materializes on the game board and its stats and properties are calculated:
Player B's Summon: Species: Fae, Role: Magician, Level 5, HP 96/96, MV 3, STR 13, END 13, DEF 15, INT 19, SPI 20, MDF 16, SPD 15, LCK 13, ACC 14, Growth Rates: STR 1, END 1, DEF 1, INT 1.33, SPI 1.33, MDF 1, SPD 1, LCK 1, ACC 1.33, Equipment: "Apprentice's Wand" (035-apprentices_wand-Alpha)
Successfully performing their Turn Summon, Player B draws their 3 Summon Draws, adding them to their hand: "Blast Bolt", "Dark Altar", and "Ensnare". 2 Action cards and a Building card.
Reading the requirements for Blast Bolt, Player B moves their Fae Magician to (5,10) to be within its range, then selects the now playable "Blast Bolt" Action card which has the requirement of having a Magician Summon in play, designates their Magician as the caster, and targets Player A's Gignen Warrior for its effect.
Player B's "Blast Bolt" enters the In Play Zone and with no response available from Player A, resolves its damaging effect.
Because Blast Bolt has a base accuracy of 85 and its hit formula is designated to use the default standard one, we first need to determine if the attack hits:
ToHit = 85 + (Player B's Fae Magician ACC / 10) = 85 + (14 / 10) = 86.4%
A random number between 1 and 100 is generated, if it's less than or equal to 86.4, the attack hits. The random number generated is 42, so the attack hits.
Because Blast Bolt's effect is designated as one that can crit, we need to determine if the attack crits. Blast Bolt designates to use the standard crit formula and its crit multiplier is 1.5x damage.
CritChance = Floor((Player B's Fae Magician LCK x 0.3375) + 1.65) = Floor((13 x 0.3375) + 1.65) = Floor(4.3875 + 1.65) = Floor(6.0375) = 6%
A random number between 1 and 100 is generated, if it's less than or equal to 6, the attack crits. The random number generated is 73, so the attack does not crit.
Now we can calculate the damage dealt by the attack using the formula designated by the card: "caster.INT x (1 + base_power /100) x (caster.INT / target.MDF)"
Blast Bolt has a base power of 60 and the type of damage it deals is magical fire attribute damage.
Damage = Player B's Fae Magician INT x (1 + Blast Bolt base power / 100) x (Player B's Fae Magician INT / Player A's Gignen Warrior MDF)
Damage = 19 x (1 + 60 / 100) x (19 / 11) = 19 x 1.6 x 1.7272 = 52.45408
The damage is rounded down to 52.
The last step in determining damage dealt is to apply any additional factors that may modify the damage dealt. This could be ongoing effects from other cards, resistances or weaknesses to certain damage types, or any other relevant factors.
In this case, there are no additional factors to consider, so the final damage dealt is 52.
Player A's Gignen Warrior takes 52 damage, reducing its HP from 96 to 44.
Once the effect resolves, "Blast Bolt" is moved to Player B's Discard Pile, as designated by the card.
Player B selects their Fae Magician and uses the remaining movement it has to move it 2 spaces back into their territory (5,12), and initiates ending their Action Phase.
Player B enters their End Phase, with no responses to resolve, Player B's turn ends and Player A's turn begins.

Turn 3 - Player A:
Player A begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card they draw is "Gignen Country".
With their Gignen Warrior in play, it levels up from 5 to 6 during their Level Phase.
Player A's Gignen Warrior's stats are recalculated for level 6 per its Growth Rates: HP 50/102, MV 2, STR 19, END 14, DEF 16, INT 15, SPI 14, MDF 11, SPD 13, LCK 21, ACC 12
Player A notes that their Warrior didn't stay at 44 HP, but rather the damage it has recieved was retained and its max HP increased.
Player A's turn continues into their Action Phase, they inspect their hand to formulate a plan.
Player A begins by using their Turn Summon to play their Gignen Magician, selecting a valid space in their territory: space coordinate (4,2).
The Summon Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Summon Unit materializes on the game board and its stats and properties are calculated:
Player A's Summon: Species: Gignen, Role: Magician, Level 5, HP 96/96, MV 3, STR 16, END 13, DEF 13, INT 16, SPI 15, MDF 15, SPD 15, LCK 22, ACC 11, Growth Rates: STR 1.33, END 1, DEF 0.5, INT 1.33, SPI 1.33, MDF 1, SPD 1, LCK 2, ACC 0.5, Equipment: "Apprentice's Wand" (036-apprentices*wand-Alpha)
Successfully performing their Turn Summon, Player A draws their 3 Summon Draws, adding them to their hand: "Nearwood Forest Expedition", "Rush", and "Adventurous Spirit". A Quest card, and 2 Action cards.
Now meeting the requirements to play "Healing Hands" by controlling a Magician based Summon as designated on the card, Player A selects it, designates their Magician as the caster, and targets their Gignen Warrior for the card's effect.
Player A's "Healing Hands" enters the In Play Zone and with no response available from Player B, resolves its healing effect.
Because Healing Hands is a healing effect, no to hit calculation is necessary unless designated by the card, which it is not.
Healing Hands does designate that the heal can crit, so we need to determine if the heal crits. Healing Hands designates to use the standard crit formula and its crit multiplier is 1.5x healing.
CritChance = Floor((Player A's Gignen Magician LCK x 0.3375) + 1.65) = Floor((22 x 0.3375) + 1.65) = Floor(7.425 + 1.65) = Floor(9.075) = 9%
A random number between 1 and 100 is generated, if it's less than or equal to 9, the heal crits. The random number generated is 8, so the heal does crit.
Now we can calculate the amount healed using the formula designated by the card: "caster.SPI * (1 + base*power /100)"
Healing Hands has a base power of 40 and the type of heal it provides is magical light attribute healing.
Heal Amount = Player A's Gignen Magician SPI * (1 + Healing Hands base power / 100)
Heal Amount = 15 _ (1 + 40 / 100) = 15 _ 1.4 = 21
The last step in determining the amount healed is to apply any additional factors that may modify the heal amount. This could be ongoing effects from other cards, resistances or weaknesses to certain heal types, or any other relevant factors.
In this case, there are no additional factors to consider, so the final amount healed is 21.
Because the heal critted, we apply the crit multiplier of 1.5x to the heal amount: 21 \* 1.5 = 31.5, rounded down to 31.
Player A's Gignen Warrior heals 31 HP, increasing its HP from 50/102 to 81/102.
Once the effect resolves, "Healing Hands" is moved to Player A's Discard Pile, as designated by the card.
Player A then decides to play the Building card "Gignen Country", selecting the card from their hand and selecting valid spaces that meet the card's required dimensions. (4,2), (5,2), (6,2), (4,1), (5,1), (6,1)
The Building Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Building becomes active on the board.
Player A's "Gignen Country" is now in play, providing its ongoing effect: "While occupying all Gignen based Summons you control receive an additional level whenever they level up."
Player A then moves their Gignen Warrior 2 spaces backward into their territory (5,2), positioning both their Summons within the Gignen Country occupied spaces.
Player A then selects the Quest card "Nearwood Forest Expedition" from their hand and plays it.
The Quest Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Quest becomes active.
Player A's "Nearwood Forest Expedition" is now in play, activating its objective for completion: "Control target Warrior, Scout, or Magician based Summon whose current level is under 10."
Player A currently controls a Gignen Warrior level 6 and a Gignen Magician level 5, so they meet the objective's requirement. Player A selects their Gignen Warrior as the target for the Quest's effect.
With the objective met, Player A completes the Quest, triggering its reward effect: "Target Summon gains 2 levels". With no response available from Player B, the effect resolves.
Player A's Gignen Warrior levels up from 6 to 8 during the resolution of the Quest's effect.
Because Player A's Gignen Warrior is within the Gignen Country, each level up it recieved from the Quest also triggered the Gignen Country's effect, so it levels up an additional 2 levels from 6 to 8, then from 8 to 10.
Player A's Gignen Warrior's stats are recalculated for level 10 per its Growth Rates: HP 132/153, MV 3, STR 31, END 22, DEF 20, INT 18, SPI 18, MDF 14, SPD 15, LCK 29, ACC 15
With the Quest completed, Nearwood Forest Expedition is moved to Player A's Recharge Pile, as designated by the card.
Player A then selects a card from their Advance Deck, "Berserker Rage", now eligible to be played as they control a tier 1 Warrior based Summon that is level 10 or higher.
Player A selects "Berserker Rage" from their Advance Deck and targets their Gignen Warrior for the card's effect.
Player A's "Berserker Rage" enters the In Play Zone and with no response available from Player B, resolves its role change effect.
Player A's Gignen Warrior's Role changes from Warrior to Berserker indefinitely. The Berserker's Role has different stat modifiers and triggers stat recalculation.
Player A's Gignen Berserker's stats are recalculated for level 10 per its Growth Rates and new Role Modifier: HP 146/167, MV 3, STR 40, END 24, DEF 20, INT 18, SPI 18, MDF 14, SPD 18, LCK 29, ACC 15
Player A finishes their turn by initiating the end of their Action Phase, and entering their End Phase. With no responses to resolve, Player A's turn ends and Player B's turn begins.

Turn 4 - Player B:
Player B begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card they draw is "Dramatic Return!".
With their Fae Magician in play, it levels up from 5 to 6 during their Level Phase.
Player B's Fae Magician's stats are recalculated for level 6 per its Growth Rates: HR 102/102, MV 3, STR 14, END 14, DEF 16, INT 26, SPI 27, MDF 17, SPD 16, LCK 14, ACC 15
Player B begins their Action Phase by using their Turn Summon to play their Wilderling Scout, selecting a valid space in their territory: space coordinate (6,11).
The Summon Card enters the In Play Zone, revealing it to Player A and prompting a response. With no response available from Player A, the Summon Unit materializes on the game board and its stats and properties are calculated:
Player B's Summon: Species: Wilderling, Role: Scout, HP 114/114 Level 5, MV 5, STR 18, END 16, DEF 12, INT 13, SPI 13, MDF 10, SPD 28, LCK 18, ACC 23, Growth Rates: STR 0.66, END 1, DEF 1, INT 1.5, SPI 0.5, MDF 0.66, SPD 2, LCK 1.5, ACC 2, Equipment: "Hunting Bow" (036-hunting_bow-Alpha)
Successfully performing their Turn Summon, Player B draws their 3 Summon Draws, adding them to their hand: "Graverobbing", "Dual Shot", and "Spell Recall". A Counter card, and 2 Action cards.
Player B selects "Dramatic Return!" from their hand, and sets it face down in the In Play Zone.
With no response available from Player A, "Dramatic Return!" is now face down in the In Play Zone, ready to be activated when its trigger condition is met.
Player B then selects "Graverobbing" from their hand, and sets it face down in the In Play Zone.
With no response available from Player A, "Graverobbing" is now face down in the In Play Zone, ready to be activated when its trigger condition is met.
Player B notes that they are unable to move either of their units far enough to enter either of their unit's weapon ranges to attack Player A's Gignen Berserker, so they decide to end their Action Phase.
Player B enters their End Phase, with no responses to resolve, Player B's turn ends and Player A's turn begins.

Turn 5 - Player A:
Player A begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card they draw is "Tempest Slash".
With their Gignen Berserker and Gignen Magician in play, they both level up during their Level Phase.
Player A's Gignen Berserker levels up from 10 to 11, then from 11 to 12 during their Level Phase due to the Gignen Country's effect.
Player A's Gignen Berserker's stats are recalculated for level 12 per its Growth Rates: HP 169/190, MV 4, STR 44, END 27, DEF 22, INT 19, SPI 20, MDF 15, SPD 20, LCK 33, ACC 16
Player A's Gignen Magician levels up from 5 to 6, then from 6 to 7 during their Level Phase due to the Gignen Country's effect.
Player A's Gignen Magician's stats are recalculated for level 7 per its Growth Rates: HP 108/108, MV 3, STR 19, END 15, DEF 14, INT 24, SPI 22, MDF 17, SPD 17, LCK 26, ACC 12
Player A begins their Action Phase by inspecting their hand to formulate a plan.
Player A uses their Turn Summon to play their Gignen Scout, selecting a valid space in their territory: space coordinate (6,1)
The Summon Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Summon Unit materializes on the game board and its stats and properties are calculated:
Player A's Summon: Species: Gignen, Role: Scout, Level 5, HP 120/120, MV 4, STR 15, END 17, DEF 13, INT 15, SPI 16, MDF 14, SPD 23, LCK 27, ACC 16, Growth Rates: STR 1, END 1.33, DEF 1, INT 1, SPI 1, MDF 1, SPD 1.33, LCK 2, ACC 1.33, Equipment: "Hunting Bow" (037-hunting_bow-Alpha)
Successfully performing their Turn Summon, Player A draws their 3 Summon Draws, however their Main Deck is out of cards, so they must shuffle their Recharge Pile to form a new Main Deck, then draw their 3 Summon Draws.
Still not having enough cards for all 3 draws, Player A draws as many as they can, adding them to their hand: "Nearwood Forest Expedition" and "Sharpen Blade". A Quest card and an Action card.
Player A then selects "Rush" from their hand, selecting their Gignen Berserker as the target for the card's effect.
Player A's "Rush" enters the In Play Zone and with no response available from Player B, resolves its effects.
Rush has multiple effects, it first doubles the target's movement speed until the end of the turn, then it cuts the target's DEF in half until the end of the opponent's next turn.
Player A's Gignen Berserker's movement speed is doubled from 4 to 8 until the end of the turn.
Player A's Gignen Berserker's DEF is halved from 22 to 11 until the end of Player B's next turn.
Once the effect resolves, "Rush" is moved to Player A's Recharge Pile.
Next, Player A selects "Tempest Slash" from their hand, selecting their Gignen Berserker as the target for the card's effect.
Player A's "Tempest Slash" enters the In Play Zone and with no response available from Player B, resolves its effects.
First, it adds an additional movement to the target's movement speed until the end of the turn, then it adds an additional damaging effect to the target's next basic attack until the end of the turn.
Player A's Gignen Berserker's movement speed is increased from 8 to 9 until the end of the turn.
Player A's Gignen Berserker's next basic weapon attack will deal Tempest Slash's additional damage effect formula, which is "caster.STR x (1 + base_power /100) x (caster.STR / target.DEF)" with a base power of 30 and the type of damage it deals is physical wind attribute damage.
Additionally, if the attack is a critical hit, Tempest Slash's effect damage is also doubled.
Once the effect resolves, "Tempest Slash" is moved to Player A's Discard Pile.
Now that Player A's Gignen Berserker has a movement speed of 9, they select it and move it across the entire board to (4,11) to be within basic attack range of Player B's Fae Magician and within enemy territory.
Player A then selects their Gignen Berserker and initiates a basic attack against Player B's Fae Magician.
First, we need to determine if the attack hits:
ToHit = 90 + (Player A's Gignen Berserker ACC / 10) = 90 + (16 / 10) = 91.6%
A random number between 1 and 100 is generated, if it's less than or equal to 91.6, the attack hits. The random number generated is 27, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player A's Gignen Berserker LCK x 0.3375) + 1.65) = Floor((33 x 0.3375) + 1.65) = Floor(11.1375 + 1.65) = Floor(12.7875) = 12%
A random number between 1 and 100 is generated, if it's less than or equal to 12, the attack crits. The random number generated is 45, so the attack does not crit.
Now we can calculate the damage dealt, first by the weapon attack using the basic attack damage formula for the equipped weapon: "STR x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = Player A's Gignen Berserker STR x (1 + Weapon Power / 100) x (Player A's Gignen Berserker STR / Player B's Fae Magician DEF) x IF_CRIT
Damage = 44 x (1 + 40 / 100) x (44 / 16) x 1 = 44 x 1.4 x 2.75 x 1 = 169.7
The damage is rounded down to 169.
Then add the additional damage effect from Tempest Slash using its formula: "caster.STR x (1 + base_power /100) x (caster.STR / target.DEF)"
Tempest Slash Damage = Player A's Gignen Berserker STR x (1 + Tempest Slash base power / 100) x (Player A's Gignen Berserker STR / Player B's Fae Magician DEF)
Tempest Slash Damage = 44 x (1 + 30 / 100) x (44 / 16) = 44 x 1.3 x 2.75 = 157.3
The damage is rounded down to 157.
The last step in determining damage dealt is to apply any additional factors that may modify the damage dealt. This could be ongoing effects from other cards, resistances or weaknesses to certain damage types, or any other relevant factors.
In this case, there are no additional factors to consider, so the final damage dealt is 169 + 157 = 326.
Player B's Fae Magician takes 326 damage, reducing its HP from 102 to -224.
Because Player B's Fae Magician's HP has dropped to 0 or below, it is defeated and removed from the game.
Player A is awarded 1 Victory Point for defeating an opponent's Summon Unit.
Player B activates their face down Counter card "Dramatic Return!" in response to their Fae Magician being defeated.
Player B's "Dramatic Return!" enters the In Play Zone and with no response available from Player A, resolves its effect.
Dramatic Return!'s effect is to return a defeated Summon back to the board within that player's territory with 10% HP.
Player B selects their Fae Magician as the target for the effect, and selects a valid space in their territory: space coordinate (5,12).
Player B's Fae Magician is returned to the board at (5,12) with 10% HP, which is 10.2 rounded down to 10 HP.
Player A finishes their turn by moving their other Summons: their Gignen Magician moves 3 spaces forward to (4,5), and their Gignen Scout moves 4 spaces forward to (6,6).
Player A is able to make an attack with their Gignen Scout against Player B's Wilderling Scout due to its weapon's high range.
First, we need to determine if the attack hits:
ToHit = 90 + (Player A's Gignen Scout ACC / 10) = 90 + (16 / 10) = 91.6%
A random number between 1 and 100 is generated, if it's less than or equal to 91.6, the attack hits. The random number generated is 49, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player A's Gignen Scout LCK x 0.3375) + 1.65) = Floor((27 x 0.3375) + 1.65) = Floor(9.1125 + 1.65) = Floor(10.7625) = 10%
A random number between 1 and 100 is generated, if it's less than or equal to 10, the attack crits. The random number generated is 71, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "((STR + ACC) / 2) x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = ((Player A's Gignen Scout STR + Player A's Gignen Scout ACC) / 2) x (1 + Weapon Power / 100) x (Player A's Gignen Scout STR / Player B's Wilderling Scout DEF) x IF_CRIT
Damage = ((15 + 16) / 2) x (1 + 30 / 100) x (15 / 12) x 1 = (31 / 2) x 1.3 x 1.25 x 1 = 15.5 x 1.3 x 1.25 x 1 = 25.1875
The damage is rounded down to 25.
Player B's Wilderling Scout takes 25 damage, reducing its HP from 114 to 89.
Player A enters their End Phase, with no responses to resolve, Player A's turn ends and Player B's turn begins.

Turn 6 - Player B:
Player B begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card they draw is "Life Alchemy".
With their Fae Magician and Wilderling Scout in play, they both level up during their Level Phase.
Player B's Fae Magician levels up from 6 to 7 during their Level Phase.
Player B's Fae Magician's stats are recalculated for level 7 per its Growth Rates: HP 10/108, MV 3, STR 15, END 15, DEF 17, INT 27, SPI 29, MDF 18, SPD 18, LCK 15, ACC 17
Player B's Wilderling Scout levels up from 5 to 6 during their Level Phase.
Player B's Wilderling Scout's stats are recalculated for level 6 per its Growth Rates: HP 89/120, MV 6, STR 18, END 17, DEF 13, INT 15, SPI 14, MDF 10, SPD 31, LCK 20, ACC 25
Player B begins their Action Phase by inspecting their hand to formulate a plan and grins to themselves.
Player B selects "Ensnare" from their hand, requiring a Scout based Summon to be in play, designates their Wilderling Scout as the caster, and targets Player A's Gignen Berserker for the card's effect.
Player B's "Ensnare" enters the In Play Zone and with no response available from Player A, resolves its effect.
Ensnare's effect causes the caster to make a ranged attack against a target Summon, and if it hits, the target is potentially immobilized until the end of the opponent's next turn.
First, we need to determine if the ranged attack effect hits. Ensnare designates its own unique hit formula to be used: "base_accuracy + (caster.ACC / 10) + (caster.LCK / 10)"
Ensnare has a base accuracy of 75.
ToHit = 75 + (Player B's Wilderling Scout ACC / 10) + (Player B's Wilderling Scout LCK / 10) = 75 + (25 / 10) + (20 / 10) = 75 + 2.5 + 2 = 79.5%
A random number between 1 and 100 is generated, if it's less than or equal to 79.5, the attack hits. The random number generated is 47, so the attack hits.
Ensnare designates that this damage can crit, that its crit multipier is 1.5x damage, and that it uses the standard crit formula.
CritChance = Floor((Player B's Wilderling Scout LCK x 0.3375) + 1.65) = Floor((20 x 0.3375) + 1.65) = Floor(6.75 + 1.65) = Floor(8.4) = 8%
A random number between 1 and 100 is generated, if it's less than or equal to 8, the attack crits. The random number generated is 50, so the attack does not crit.
Now we can calculate the damage dealt by this effect using the formula designated by the card: "caster.STR x (1 + base_power / 100) x (caster.STR / target.DEF)"
Ensnare has a base power of 25, the type of damage it deals is physical neutral attribute damage.
Damage = Player B's Wilderling Scout STR x (1 + Ensnare base power / 100) x (Player B's Wilderling Scout STR / Player A's Gignen Berserker DEF)
Damage = 18 x (1 + 25 / 100) x (18 / 11) = 18 x 1.25 x 1.6363 = 36.81825
The damage is rounded down to 36.
The last step in determining damage dealt is to apply any additional factors that may modify the damage dealt. This could be ongoing effects from other cards, resistances or weaknesses to certain damage types, or any other relevant factors.
In this case, there are no additional factors to consider, so the final damage dealt is 36.
Player A's Gignen Berserker takes 36 damage, reducing its HP from 169 to 133.
Because the attack from this card's effect hit, the next part of the effect responds to that trigger condition and its effect is applied.
The second effect of Ensnare gives the target a 30% chance to save against being immobilized, otherwise they are immobilized until the end of the opponent's next turn.
SaveChance = 30%
A random number between 1 and 100 is generated, if it's less than or equal to 30, the target saves. The random number generated is 65 so the target does not save.
Player A's Gignen Berserker is immobilized until the end of Player A's next turn.
Once the effect resolves, "Ensnare" is moved to Player B's Discard Pile, as designated by the card.
The last play going to their plan, Player B selects "Dark Altar" from their hand, selecting valid spaces that meet the card's required dimensions. (4,11), (3,11), (3,12), (4,12)
The Building Card enters the In Play Zone, revealing it to Player A and prompting a response. With no response available from Player A, the Building becomes active on the board.
Player B's "Dark Altar" is now in play, Player A notes their Berserker is currently within the Dark Altar's occupied spaces and immobilized.
Dark Altar's effect is a multi-stage one: "At the end of your next turn, destroy this building and any Summons occupying its spaces.
If any Summons are destroyed this way, target Magician based Summon you control becomes level 20 and you can immediately Advance Summon using it as a target."
Player B then selects "Drain Touch" from their hand, selecting their Fae Magician as the caster and targeting the in range Gignen Berserker for the card's effect.
Player B's "Drain Touch" enters the In Play Zone and with no response available from Player A, resolves its damaging and healing effect.
Drain Touch has a two part effect, first it deals damage to a target, then it heals the caster for half the damage dealt.
First, we need to determine if the attack hits using the standard hit formula designated by the card: "base_accuracy + (caster.ACC / 10)"
Drain Touch has a base accuracy of 90.
ToHit = 90 + (Player B's Fae Magician ACC / 10) = 90 + (17 / 10) = 91.7%
A random number between 1 and 100 is generated, if it's less than or equal to 91.7, the attack hits. The random number generated is 77, so the attack hits.
Drain Touch designates that this damage can crit, that its crit multipier is 1.5x damage, and that it uses the standard crit formula.
CritChance = Floor((Player B's Fae Magician LCK x 0.3375) + 1.65) = Floor((15 x 0.3375) + 1.65) = Floor(5.0625 + 1.65) = Floor(6.7125) = 6%
A random number between 1 and 100 is generated, if it's less than or equal to 6, the attack crits. The random number generated is 33, so the attack does not crit.
Now we can calculate the damage dealt using the formula designated by the card: "caster.INT x (1 + base_power /100) x (caster.INT / target.MDF)"
Drain Touch has a base power of 30 and the type of damage it deals is magical dark attribute damage.
Damage = Player B's Fae Magician INT x (1 + Drain Touch base power / 100) x (Player B's Fae Magician INT / Player A's Gignen Berserker MDF)
Damage = 27 x (1 + 30 / 100) x (27 / 15) = 27 x 1.3 x 1.8 = 63.18
The damage is rounded down to 63.
The last step in determining damage dealt is to apply any additional factors that may modify the damage dealt. This could be ongoing effects from other cards, resistances or weaknesses to certain damage types, or any other relevant factors.
In this case, there are no additional factors to consider, so the final damage dealt is 63.
Player A's Gignen Berserker takes 63 damage, reducing its HP from 133 to 70.
The second part of Drain Touch's effect triggers off the damage dealt, healing the caster for a designated formula: "damage_dealt _ 0.5"
Heal Amount = Damage Dealt _ 0.5 = 63 \* 0.5 = 31.5
The heal amount is rounded down to 31.
Player B's Fae Magician heals 31 HP, increasing its HP from 10/108 to 41/108.
Once the effect resolves, "Drain Touch" is moved to Player B's Discard Pile, as designated by the card.
Player B then moves their Fae Magician 2 spaces back into their territory (5,13), and moves their Wilderling Scout 3 spaces diagonally forward to (3,8).
Player B selects "Dual Shot" from their hand, selecting their Wilderling Scout as the target for the card's effect.
Player B's "Dual Shot" enters the In Play Zone and with no response available from Player A, resolves its effect.
Dual Shot's effect allows the caster to make two basic attacks instead of one this turn.
Once the effect resolves, "Dual Shot" is moved to Player B's Recharge Pile, as designated by the card.
Player B's uses both of their basic attacks against Player A's Gignen Magician, who is within weapon range.
First, we need to determine if the first attack hits:
ToHit = 90 + (Player B's Wilderling Scout ACC / 10) = 90 + (25 / 10) = 92.5%
A random number between 1 and 100 is generated, if it's less than or equal to 92.5, the attack hits. The random number generated is 57, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player B's Wilderling Scout LCK x 0.3375) + 1.65) = Floor((20 x 0.3375) + 1.65) = Floor(6.75 + 1.65) = Floor(8.4) = 8%
A random number between 1 and 100 is generated, if it's less than or equal to 8, the attack crits. The random number generated is 77, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "((STR + ACC) / 2) x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = ((Player B's Wilderling Scout STR + Player B's Wilderling Scout ACC) / 2) x (1 + Weapon Power / 100) x (Player B's Wilderling Scout STR / Player A's Gignen Magician DEF) x IF_CRIT
Damage = ((18 + 25) / 2) x (1 + 30 / 100) x (18 / 14) x 1 = (43 / 2) x 1.3 x 1.2857 x 1 = 21.5 x 1.3 x 1.2857 x 1 = 35.942855
The damage is rounded down to 35.
Player A's Gignen Magician takes 35 damage, reducing its HP from 108 to 73.
Now we need to determine if the second attack hits:
ToHit = 90 + (Player B's Wilderling Scout ACC / 10) = 90 + (25 / 10) = 92.5%
A random number between 1 and 100 is generated, if it's less than or equal to 92.5, the attack hits. The random number generated is 3, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player B's Wilderling Scout LCK x 0.3375) + 1.65) = Floor((20 x 0.3375) + 1.65) = Floor(6.75 + 1.65) = Floor(8.4) = 8%
A random number between 1 and 100 is generated, if it's less than or equal to 8, the attack crits. The random number generated is 10, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "((STR + ACC) / 2) x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = ((Player B's Wilderling Scout STR + Player B's Wilderling Scout ACC) / 2) x (1 + Weapon Power / 100) x (Player B's Wilderling Scout STR / Player A's Gignen Magician DEF) x IF_CRIT
Damage = ((18 + 25) / 2) x (1 + 30 / 100) x (18 / 14) x 1 = (43 / 2) x 1.3 x 1.2857 x 1 = 21.5 x 1.3 x 1.2857 x 1 = 35.942855
The damage is rounded down to 35.
Player A's Gignen Magician takes 35 damage, reducing its HP from 73 to 38.
Player B enters their End Phase, with no responses to resolve, Player B's turn ends and Player A's turn begins.

Turn 7 - Player A:
Player A begins their turn by drawing a card from their Main Deck, however their Main Deck is out of cards, so they must shuffle their Recharge Pile to form a new Main Deck, then draw their card, adding it to their hand during their Draw Phase. I don't think they have any cards?
Player A begins their Level Phase, their Gignen Berserker levels from 12 to 13, their Gignen Magician levels from 7 to 8, and their Gignen Scout levels from 5 to 6.
Player A's Gignen Berserker's stats are recalculated for level 13 per its Growth Rates: HP 78/203, MV 4, STR 46, END 28, DEF 23, INT 20, SPI 21, MDF 16, SPD 20, LCK 35, ACC 17
Player A's Gignen Magician's stats are recalculated for level 8 per its Growth Rates: HP 44/114, MV 3, STR 20, END 16, DEF 15, INT 25, SPI 24, MDF 18, SPD 18, LCK 28, ACC 13
Player A's Gignen Scout's stats are recalculated for level 6 per its Growth Rates: HP 126/126, MV 4, STR 16, END 18, DEF 14, INT 16, SPI 17, MDF 15, SPD 24, LCK 30, ACC 17
Player A begins their Action Phase by inspecting their hand to formulate a plan to rescue their immobilized Berserker.
Player A moves their Gignen Scout back 3 spaces to (6,2) to be within Gignen Country and out of weapon range of Player B's Wilderling Scout.
Player A selects "Nearwood Forest Expedition" from their hand and plays it, targeting their Gignen Scout for the Quest's effect.
The Quest Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Quest becomes active.
Player A's "Nearwood Forest Expedition" is now in play, activating its objective for completion: "Control target Warrior, Scout, or Magician based Summon whose current level is under 10."
Player A currently controls a Gignen Berserker level 13, a Gignen Magician level 8, and a Gignen Scout level 6, so they meet the objective's requirement. Player A selects their Gignen Scout as the target for the Quest's effect.
With the objective met, Player A completes the Quest, triggering its reward effect: "Target Summon gains 2 levels". With no response available from Player B, the effect resolves.
Player A's Gignen Scout levels up from 6 to 7, then 7 to 8 during the resolution of the Quest's effect.
Additionally, because Player A's Gignen Scout is within the Gignen Country, each level up it recieved from the Quest also triggered the Gignen Country's effect, so it levels up an additional 2 levels from 6 to 7, then from 7 to 8, then from 8 to 9, then from 9 to 10.
Player A's Gignen Scout's stats are recalculated for level 10 per its Growth Rates: HP 167/167, MV 6, STR 20, END 24, DEF 18, INT 20, SPI 21, MDF 19, SPD 31, LCK 40, ACC 23
With the Quest completed, Nearwood Forest Expedition is moved to Player A's Recharge Pile, as designated by the card.
Player A then selects the now eligible Named Summon "Alrecht Barkstep, Scoutmaster" from their Advance Deck and plays it, their Gignen Scout being a valid target for the card's effect.
Alrecht Barkstep, Scoutmaster requires a tier 1 Scout based Summon that has completed a Quest as material, and Player A's Gignen Scout meets those requirements.
The Named Summon Card enters the In Play Zone, revealing it to Player B and prompting a response. With no response available from Player B, the Named Summon materializes on the game board and its stats and properties are calculated using some properties inherited from the target Summon used as material:
Player A's Summon: Species: Gignen, Role: Rogue, Level 10, HP 132/132, MV 7, STR 24, END 19, DEF 14, INT 13, SPI 13, MDF 14, SPD 35, LCK 37, ACC 43, Growth Rates: STR 1.33, END 1, DEF 0.66, INT 0.5, SPI 0.5, MDF 0.66, SPD 1.5, LCK 1.5, ACC 2, Equipment: Inherited from Gignen Scout
Named Summons do not trigger Summon Draws, so Player A does not draw any cards.
Named Summons inherit certain designated properties from the target Summon used as material, in this case, Alrecht Barkstep, Scoutmaster inherits the Gignen Scout's equipment: "Hunting Bow" (037-hunting_bow-Alpha) and position on the board: (6,2).
Alrecht Barkstep, Scoutmaster also has an effect that triggers when it enters play and on the beginning of its controller's turn that adds its unique Action card "Follow Me!" to its controller's hand.
Player A's "Follow Me!" enters their hand, and with no response available from Player B, the effect resolves.
Player A then selects "Follow Me!" from their hand, selecting Alrecht Barkstep, Scoutmaster as the caster and their Gignen Berserker as the target for the card's effect.
Follow Me! enters the In Play Zone and with no response available from Player B, resolves its effect.
Follow Me!'s effect changes the position of the target Summon to a space adjacent to the caster. And because the effect specifies that it changes the position of the target rather than moving it, the target being immobilized does not prevent the effect from resolving.
Player A selects a valid space adjacent to Alrecht Barkstep, Scoutmaster: (6,3) and moves their Gignen Berserker to that space.
Since inherting the Gignen Scout's position and game state, technically Alrecht Barkstep, Scoutmaster has moved 3 spaces already this turn. However, its Movement Speed is now 7 so Player A moves the additional 4 spaces to (5,6)
Now in attack range of Player B's Wilderling Scout, Player A initates a basic attack using Alrecht Barkstep, Scoutmaster.
First, we need to determine if the attack hits:
ToHit = 90 + (Player A's Alrecht Barkstep, Scoutmaster ACC / 10) = 90 + (43 / 10) = 94.3%
A random number between 1 and 100 is generated, if it's less than or equal to 94.3, the attack hits. The random number generated is 52, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player A's Alrecht Barkstep, Scoutmaster LCK x 0.3375) + 1.65) = Floor((37 x 0.3375) + 1.65) = Floor(12.4875 + 1.65) = Floor(14.1375) = 14%
A random number between 1 and 100 is generated, if it's less than or equal to 14, the attack crits. The random number generated is 20, so the attack does crit.
Now we can calculate the damage dealt, first by the weapon attack using the basic attack damage formula for the equipped weapon: "((STR+ACC)/2) x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = ((Player A's Alrecht Barkstep, Scoutmaster STR + Player A's Alrecht Barkstep, Scoutmaster ACC) / 2) x (1 + Weapon Power / 100) x (Player A's Alrecht Barkstep, Scoutmaster STR / Player B's Wilderling Scout DEF) x IF_CRIT
Damage = ((24 + 43) / 2) x (1 + 30 / 100) x (24 / 13) x 1.5 = (67 / 2) x 1.3 x 1.8461538461538463 x 1.5 = 33.5 x 1.3 x 1.8461538461538463 x 1.5 = 130.5
The damage is rounded down to 130.
Check for any additional factors that may modify the damage dealt. In this case, there are no additional factors to consider, so the final damage dealt is 130.
Player B's Wilderling Scout takes 130 damage, reducing its HP from 89 to -41.
Because Player B's Wilderling Scout's HP has dropped to 0 or below, it is defeated and removed from the game.
Player A is awarded 1 Victory Point for defeating an opponent's Summon Unit. They now have 2 Victory Points.
Player B activates their face down Counter card "Graverobbing" in response to their Wilderling Scout being defeated.
Player B's "Graverobbing" enters the In Play Zone and with no response available from Player A, resolves its effect.
Graverobbing's effect nullifies the gain of a Victory Point from defeating a Summon Unit, and has an additional activation cost of discarding a card from your hand.
Player B discards "Spell Recall" from their hand to pay the cost of Graverobbing.
The effect of Graverobbing then nullifies the Victory Point gain from Player A's defeat of Player B's Wilderling Scout, so Player A does not gain a Victory Point.
Player A remains at 1 Victory Point.
Graverobbing is then moved to Player B's Discard Pile, as designated by the card.
Player A selects their Gignen Magician and moves it 2 spaces forward to (4,7), steadily advancing towards Player B's territory.
Player A initiates the end of their turn, the immobilize status effect on their Gignen Berserker ends and Player A's turn ends, prompting Player B's turn to begin.

Turn 8 - Player B:
Player B begins their turn by drawing a card from their Main Deck, adding it to their hand during their Draw Phase. The card is "Magician's Sanctum".
With their Fae Magician in play, it levels up during their Level Phase.
Player B's Fae Magician levels up from 7 to 8 during their Level Phase.
Player B's Fae Magician's stats are recalculated for level 8 per its Growth Rates: HP 41/114, MV 3, STR 16, END 16, DEF 18, INT 29, SPI 30, MDF 19, SPD 18, LCK 16, ACC 18
Player B begins their Action Phase, beginning to worry about the board state.
Player B uses their Turn Summon to play their Stoneheart Warrior, selecting a valid space in their territory: (4,12). Inside of the Dark Altar's occupied spaces.
The Summon Card enters the In Play Zone, revealing it to Player A and prompting a response. With no response available from Player A, the Summon materializes on the game board and its stats and properties are calculated:
Player B's Summon: Species: Stoneheart, Role: Warrior, Level 5, HP 146/146 STR 14, END 12, DEF 11, INT 6, SPI 11, MDF 8, SPD 9, LCK 11, ACC 9, Growth Rates: STR 1.33, END 1, DEF 1, INT 1, SPI 1.33, MDF 1.5, SPD 1, LCK 0.66, ACC 1.5, Equipment: "Heirloom Sword" (038-heirloom_sword-Alpha) 
Successfully performing their Turn Summon, Player B draws their 3 Summon Draws but does not have quite enough cards in their Main Deck to draw 3, so they draw 2 cards instead then shuffle their Recharge Pile to form a new Main Deck and draw their last card.
Player B's Summon Draws are "Obliterate", "Stonewarden's Command", and "Blast Bolt". 2 Action Cards and a Reaction Card.
Player B moves their Fae Magician a space forward to (5,12) to be adjacent to their Stoneheart Warrior.
Player B selects "Life Alchemy" from their hand, selecting their Fae Magician as the caster and their Stoneheart Warrior as the target for the card's effect.
Player B's "Life Alchemy" enters the In Play Zone and with no response available from Player A, resolves its effect.
Life Alchemy has a two part effect, first it deals damage to a target Summon the player controls, then heals another target Summon that player controls the same amount.
The hit formula designated by the damaging effect on Life Alchemy indicates that it always hits, so no to hit check is necessary.
Life Alchemy also indicates that this damage cannot crit and is both neutral type and attribute.
The damage dealt is equal to 25% of the target's max HP.
Damage = Player B's Stoneheart Warrior HP x 0.25 = 146 x 0.25 = 36.5
The damage is rounded down to 36.
Player B's Stoneheart Warrior takes 36 damage, reducing its HP from 146 to 110.
Then the healing effect of Life Alchemy is applied to Player B's Fae Magician, healing it for the same amount of damage dealt.
Heal Amount = Damage Dealt = 36
Player B's Fae Magician heals 36 HP, increasing its HP from 41/114 to 77/114.
Once the effect resolves, "Life Alchemy" is moved to Player B's Discard Pile, as designated by the card.
Player B then moves their Magician another 2 spaces forward to (4, 10), placing them in weapon ranged attack range of Player A's Gignen Magician.
Player B initiates a basic attack using their Fae Magician against Player A's Gignen Magician.
First, we need to determine if the attack hits:
ToHit = 90 + (Player B's Fae Magician ACC / 10) = 90 + (18 / 10) = 91.8%
A random number between 1 and 100 is generated, if it's less than or equal to 91.8, the attack hits. The random number generated is 40, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player B's Fae Magician LCK x 0.3375) + 1.65) = Floor((16 x 0.3375) + 1.65) = Floor(5.4 + 1.65) = Floor(7.05) = 7%
A random number between 1 and 100 is generated, if it's less than or equal to 7, the attack crits. The random number generated is 74, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "INT x (1 + Weapon Power / 100) x (INT / Target MDF) x IF_CRIT"
Damage = Player B's Fae Magician INT x (1 + Weapon Power / 100) x (Player B's Fae Magician INT / Player A's Gignen Magician MDF) x IF_CRIT
Damage = Player B's Fae Magician INT x (1 + 30 / 100) x (Player B's Fae Magician INT / Player A's Gignen Magician MDF) x 1
Damage = 29 x (1 + 30 / 100) x (29 / 18) x 1 = 29 x 1.3 x 1.6111111111111112 x 1 = 76.66666666666667
The damage is rounded down to 76.
Player A's Gignen Magician takes 76 damage, reducing its HP from 38 to -38.
Because Player A's Gignen Magician's HP has dropped to 0 or below, it is defeated and removed from the game.
Player B is awarded 1 Victory Point for defeating an opponent's Summon Unit. They now have 1 Victory Point.
Player B then selects "Magician's Sanctum" from their hand, selecting their Fae Magician as the target for the card's effect.
Player B's "Magician's Sanctum" enters the In Play Zone and with no response available from Player A, resolves its effect.
Magician's Sanctum's effect allows the Magician to add half of their DEF to their MDF or half of their MDF to their DEF when calculating damage until the end of the opponent's next turn.
It comes with the caveat that if the Magician moves, the effect ends immediately.
Player B initiates the end of their turn, which triggers the beginning of Dark Altar's chain of effects.
Player A is given the opportunity to respond, but with no response available, the effect resolves.
Player B's Dark Altar is destroyed, their Stoneheart Warrior destroyed along with it, as it occupied the Dark Altar's spaces.
Dark Altar is moved to Player B's Discard Pile, as designated by the card.
Player B's Stoneheart Warrior is removed from the game, as it was destroyed by the effect of Dark Altar.
Due to Dark Altar's effect destroying a Summon, Player B is able to select their Fae Magician as the target for the effect, which levels it up to level 20.
Additionally, Player A is awarded 1 Victory Point for Player B's Stoneheart Warrior being destroyed, bringing Player A's total to 2 Victory Points.
Finally, Player B is given the opportunity to Advance Summon immediately providing their Fae Magician is a valid target.
Player B selects the advance card "Shadow Pact" from their Advance Deck, now eligible to be played due to the Fae Magician being level 20 and via the effect of Dark Altar.
The Named Summon Card enters the In Play Zone, revealing it to Player A and prompting a response. With no response available from Player A, the effect resolves.
Player B's Fae Magician's Role changes from Magician to Warlock indefinitely. The Warlock's Role has different stat modifiers and triggers stat recalculation.
Player B's Fae Magician's stats are recalculated for level 20 per its Growth Rates: HP 167/198, MV 6, STR 28, END 28, DEF 30, INT 83, SPI 40, MDF 41, SPD 30, LCK 35, ACC 60
Once the effect resolves, "Shadow Pact" is moved to Player B's Discard Pile as designated by the card.
Player B enters their End Phase, with no responses to resolve, Player B's turn ends and Player A's turn begins.

Turn 9 - Player A:
Player A begins their turn in their Draw Phase, however there are no cards left in their Main Deck or Recharge Pile so nothing occurs during this phase.
Alrecht Barkstep, Scoutmaster's effect adds "Follow Me!" to Player A's hand at the beginning of their turn, so Player A adds "Follow Me!" to their hand.
Player A begins their Level Phase, their Gignen Berserker levels up from 13 to 14, and Alrecht Barkstep, Scoutmaster levels up from 10 to 11.
Player A's Gignen Berserker's stats are recalculated for level 14 per its Growth Rates: HP 84/206, MV 4, STR 48, END 29, DEF 24, INT 21, SPI 22, MDF 17, SPD 21, LCK 37, ACC 18
Player A's Alrecht Barkstep, Scoutmaster's stats are recalculated for level 11 per its Growth Rates: HP 139/139, MV 7, STR 25, END 20, DEF 15, INT 13, SPI 13, MDF 15, SPD 37, LCK 39, ACC 45
Player A begins their Action Phase, knowing that this is likely their last turn.
Player A selects Alrecht Barkstep, Scoutmaster and moves it 2 spaces forward to (4,8), placing it in weapon range of Player B's Fae Magician.
Player A initiates a basic attack using Alrecht Barkstep, Scoutmaster against Player B's Fae Magician.
First, we need to determine if the attack hits:
ToHit = 90 + (Player A's Alrecht Barkstep, Scoutmaster ACC / 10) = 90 + (45 / 10) = 94.5%
A random number between 1 and 100 is generated, if it's less than or equal to 94.5, the attack hits. The random number generated is 86, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player A's Alrecht Barkstep, Scoutmaster LCK x 0.3375) + 1.65) = Floor((39 x 0.3375) + 1.65) = Floor(13.1625 + 1.65) = Floor(14.8125) = 14%
A random number between 1 and 100 is generated, if it's less than or equal to 14, the attack crits. The random number generated is 40, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "((STR + ACC) / 2) x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = ((Player A's Alrecht Barkstep, Scoutmaster STR + Player A's Alrecht Barkstep, Scoutmaster ACC) / 2) x (1 + Weapon Power / 100) x (Player A's Alrecht Barkstep, Scoutmaster STR / Player B's Fae Magician DEF) x IF_CRIT
Due to the current effect of Magician's Sanctum, Player B's Fae Magician's DEF for this calculation is increased by half of its MDF.
Player B's Fae Magician MDF is 41, so its DEF is increased by 20.5, rounded to 20.
Player B's Fae Magician's DEF is treated as 50 for this calculation.
Damage = ((25 + 45) / 2) x (1 + 30 / 100) x (25 / 50) x 1 = (70 / 2) x 1.3 x 0.5 x 1 = 35 x 1.3 x 0.5 x 1 = 22.75
The damage is rounded down to 22.
Player B's Fae Magician takes 22 damage, reducing its HP from 167 to 145.
Check for any additional factors that may modify the damage dealt. In this case, there are no additional factors to consider, so the final damage dealt is 22.
Player A then selects "Follow Me!" from their hand, selecting Alrecht Barkstep, Scoutmaster as the caster and their Gignen Berserker as the target for the card's effect.
Follow Me! enters the In Play Zone and with no response available from Player B, resolves its effect.
Follow Me!'s effect changes the position of the target Summon to a space adjacent to the caster.
Player A selects the space in front of Alrecht Barkstep, Scoutmaster: (4,9) and moves their Gignen Berserker to that space, thus bringing their Berserker into weapon range to attack Player B's Fae Magician.
Player A initiates a basic attack using their Gignen Berserker against Player B's Fae Magician.
First, we need to determine if the attack hits:
ToHit = 90 + (Player A's Gignen Berserker ACC / 10) = 90 + (18 / 10) = 91.8%
A random number between 1 and 100 is generated, if it's less than or equal to 91.8, the attack hits. The random number generated is 40, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player A's Gignen Berserker LCK x 0.3375) + 1.65) = Floor((37 x 0.3375) + 1.65) = Floor(12.4875 + 1.65) = Floor(14.1375) = 14%
A random number between 1 and 100 is generated, if it's less than or equal to 14, the attack crits. The random number generated is 19, so the attack does not crit.
Now we can calculate the damage dealt using the basic attack damage formula for the equipped weapon: "STR x (1 + Weapon Power / 100) x (STR / Target DEF) x IF_CRIT"
Damage = Player A's Gignen Berserker STR x (1 + Weapon Power / 100) x (Player A's Gignen Berserker STR / Player B's Fae Magician DEF) x IF_CRIT
Due to the current effect of Magician's Sanctum, Player B's Fae Magician's DEF is calculated as 50.
Damage = Player A's Gignen Berserker STR x (1 + 30 / 100) x (Player A's Gignen Berserker STR / Player B's Fae Magician DEF) x 1
Damage = 48 x (1 + 30 / 100) x (48 / 50) x 1 = 48 x 1.3 x 0.96 x 1 = 60.672
The damage is rounded down to 60.
Player B's Fae Magician takes 60 damage, reducing its HP from 145 to 85.
Check for any additional factors that may modify the damage dealt. In this case, there are no additional factors to consider, so the final damage dealt is 60.
Out of options, Player A is only able to move their Gignen Berserker 4 spaces away to (5,5) to avoid being attacked by Player B's Fae Magician.
Player A enters their End Phase, the effects of Magician's Sanctum end, Player A's turn ends and Player B's turn begins.

Turn 10 - Player B:
Player B begins their turn in their Draw Phase, drawing a card from their Main Deck, adding it to their hand. The card is "Drain Touch".
Warlock's Role effect triggers at the Draw Phase, adding the unique Counter Card "Nightmare Pain" to Player B's hand.
Player B begins their Level Phase, their Fae Magician is already at the max level 20, so it does not level up.
Player B begins their Action Phase, debating which target to pursue to end the game.
Player B selects their Fae Magician and moves it 2 spaces forward to (4,7), placing it in weapon range of Player A's Gignen Berserker.
Player B selects "Blast Bolt" from their hand, selecting their Fae Magician as the caster and Player A's Gignen Berserker as the target for the card's effect.
Player B's "Blast Bolt" enters the In Play Zone and with no response available from Player A, resolves its damaging effect.
Because Blast Bolt has a base accuracy of 85 and its hit formula is designated to use the default standard one, we first need to determine if the attack hits:
ToHit = 85 + (Player B's Fae Magician ACC / 10) = 85 + (18 / 10) = 86.8%
A random number between 1 and 100 is generated, if it's less than or equal to 86.8, the attack hits. The random number generated is 17, so the attack hits.
Next we determine if the attack crits using the standard crit formula for basic attacks:
CritChance = Floor((Player B's Fae Magician LCK x 0.3375) + 1.65) = Floor((16 x 0.3375) + 1.65) = Floor(5.4 + 1.65) = Floor(7.05) = 7%
A random number between 1 and 100 is generated, if it's less than or equal to 7, the attack crits. The random number generated is 93, so the attack does not crit.
Now we can calculate the damage dealt by the damaging effect of Blast Bolt using the damage formula for the card: "INT x (1 + Weapon Power / 100) x (INT / Target MDF) x IF_CRIT"
Damage = Player B's Fae Magician INT x (1 + Weapon Power / 100) x (Player B's Fae Magician INT / Player A's Gignen Berserker MDF) x IF_CRIT
Damage = Player B's Fae Magician INT x (1 + 30 / 100) x (Player B's Fae Magician INT / Player A's Gignen Berserker MDF) x 1
Damage = 83 x (1 + 30 / 100) x (83 / 17) x 1 = 83 x 1.3 x 4.882352941176471 x 1 = 502.6666666666667
The damage is rounded down to 502.
Player A's Gignen Berserker takes 502 damage, reducing its HP from 84 to -418.
Because Player A's Gignen Berserker's HP has dropped to 0 or below, it is defeated and removed from the game.
Player B is awarded 2 Victory points for defeating an opponent's tier 2 or higher Summon Unit. They now have 3 Victory Points.
Player A is given the opportunity to respond, but with no response available, Player B wins the game by reaching 3 Victory Points.

Game Over - Player B Wins!

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
