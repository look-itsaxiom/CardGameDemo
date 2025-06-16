## Unified Stat System

* **Endurance (END):** HP stat  
* **Strength (STR):** Determines physical weapon attack power  
* **Defense (DEF):** Reduces physical damage  
* **Intelligence (INT):** Determines magical weapon attack power  
* **Spirit (SPI):** Determines healing effectiveness  
* **Magic Defense (MDF):** Reduces magical damage  
* **Speed (SPD):** Determines movement maximum  
* **Luck (LCK):** Influences critical hit chance  
* **Accuracy (ACC):** Affects likelihood of hit success

### Character Template

**Properties:**

* **Name**: Character’s given name  
* **Species**: Chosen from available species (e.g., Gignen, Fae, Stoneheart, etc.).  
* **Base Stats**: Randomly generated within species-specific ranges:  
  * STR:  
  * END:  
  * DEF:  
  * INT:  
  * SPI:  
  * MDF:  
  * SPD:  
  * LCK:  
  * ACC:  
* **Base Growth Rates**: Randomly generated percentages (not species-dependent).  
* **Current Stats**: Base stats adjusted by level, growth rate, class, equipment, and other factors.  
* **Attribute:** One of the 6 elemental Attributes (or attributeless) that denotes weakness/resistance  
* **Role**: (e.g., Warrior, Mage, Titan, Elemental, Undead).  
* **Equipment (if capable of having some)**:   
  * Weapon  
  * Armor  
  * Offhand  
  * Accessory 1

### Stat Calculation System

**Stat Per Level Formula:**  
 **FinalStat \= (Base \+ floor(Level \* GrowthRate)) \* ClassMod% \+ Equipment**

### Core Stat Formulas

* HP  
  * 50 \+ floor(END ^ 1.5)  
* Basic Attack Damage  
  * STR \* (1 \+ Weapon Power / 100\) \* (User STR/Target DEF) \* Crit  
* Basic Attack To Hit  
  * Basic Attack Acc 90 \+ (ACC / 10\)  
* Movement Speed  
  * 2 \+ floor((SPD \- 10\) / 5\)  
* Critical Rate Chance  
  * % \= floor((LCK \* 0.3375) \+ 1.65)  
* To Hit:  
  * Ability Accuracy \+ (User ACC / 10)%

## Character Customization Framework

### Species

Below are the available species for characters in the game. Each species is defined by thematic traits and specific bonuses. Base stats are expressed as ranges to enable randomized character generation. Growth rates are not species-specific and are randomly generated separately.

Base Stat Generation

Each species has predefined ranges for base stats, reflecting their thematic strengths and weaknesses.

For example, Stonehearts excel in Endurance and Defense, while Demarkin favor Intelligence and Magic Defense.

Upon character generation, base stats are randomly generated within these ranges.

Gignen

* **Description:** Versatile and adaptive, Gignen are generalists suited to any role.  
* **Attribute**: Neutral  
* **Base Stat Ranges:**  
  * STR: 8–12  
  * END: 8–12  
  * DEF: 8–12  
  * INT: 8–12  
  * SPI: 8–12  
  * MDF: 8–12  
  * SPD: 8–12  
  * LCK: 8–12  
  * ACC: 8–12  
* **Total Stats:** Minimum: 72, Maximum: 108  
* **Quirk:** Growth rates tend to be higher for Gignen.  
  ---

Fae

* **Description:** Graceful and intelligent, Fae are well rounded for magical positions.  
* **Attribute**: Earth  
* **Base Stat Ranges:**  
  * STR: 6–10  
  * END: 6–10  
  * DEF: 6–10  
  * INT: 10–16  
  * SPI: 10–14  
  * MDF: 8–14  
  * SPD: 8–12  
  * LCK: 8–12  
  * ACC: 8–12  
* **Total Stats:** Minimum: 70, Maximum: 110  
  ---

Stoneheart

* **Description:** Stalwart and industrious, Stoneheart are natural craftsmen and warriors.  
* **Attribute**: Fire  
* **Base Stat Ranges:**  
  * STR: 8–14  
  * END: 10–16  
  * DEF: 10–14  
  * INT: 6–10  
  * SPI: 8–12  
  * MDF: 6–10  
  * SPD: 6–10  
  * LCK: 8–12  
  * ACC: 8–12  
* **Total Stats:** Minimum: 70, Maximum: 110  
  ---

Wilderling

* **Description:** Agile and primal, Beastkin possess keen senses and excel in physical prowess.  
* **Attribute**: Wind  
* **Base Stat Ranges:**  
  * STR: 10–16  
  * END: 8–12  
  * DEF: 6–10  
  * INT: 6–10  
  * SPI: 6–12  
  * MDF: 6–10  
  * SPD: 10–16  
  * LCK: 6–10  
  * ACC: 10–14  
* **Total Stats:** Minimum: 68, Maximum: 110  
  ---

Angar

* **Description:** Agile and celestial, Angarkin possess keen senses and excel in physical prowess.  
* **Attribute**: Light  
* **Base Stat Ranges:**  
  * STR: 8–16  
  * END: 8–12  
  * DEF: 6–12  
  * INT: 6–10  
  * SPI: 8–12  
  * MDF: 6–10  
  * SPD: 8–12  
  * LCK: 8–10  
  * ACC: 10–16  
* **Total Stats:** Minimum: 68, Maximum: 110  
  ---

Demar

* **Description:** Inventive and clever devils, Demarkin excel in crafting and magical support.  
* **Attribute**: Dark  
* **Base Stat Ranges:**  
  * STR: 4-10  
  * END: 6-10  
  * DEF: 6-10  
  * INT: 12-16  
  * SPI: 6-12  
  * MDF: 10-16  
  * SPD: 8-12  
  * LCK: 6-10  
  * ACC: 8-14  
* **Total Stats:** Minimum: 66, Maximum: 110  
  ---

Creptilis

* **Description:** Calculated and resilient, Creptilis balance endurance and defense while maintaining sharp focus in battle.  
* **Attribute**: Water  
* **Base Stat Ranges:**  
  * STR: 8–12  
  * END: 6-10  
  * DEF: 10–14  
  * INT: 6-10  
  * SPI: 8-16  
  * MDF: 10–14  
  * SPD: 8-14  
  * LCK: 6-10  
  * ACC: 6-10  
* **Total Stats:** Minimum: 68, Maximum: 110

### 

### Roles

#### Role-Based Growth Modifiers

The assigned role a given summon receives influences its stats in certain different ways. This effect on stats is immediate, and can be observed in the stat formula section of this document

Modifiers adjust the base stat increases by percentages:

Tier 1 or “Basic” Roles

* **\+25%:** Major boost to core stats.

Tier 2 Roles

* **\+35%:** Major boost to core stat.  
* **\+25%:** Minor boost to secondary stat.  
* **\+10%:** Minor boost to ternary stat

Tier 3 Roles

* **\+50%:** Major boost to core stats.  
* **\+25%:** Minor boost to secondary stat.  
* **\-30%:** Minor negative to unrelated stats due to specialization

Example Roles in the Adventurer Archetype

* **Tier 1 Classes:**  
  * **Warrior:** Specializes in physical combat.  
    * STR: \+25%  
    * END: \+25%  
  * **Magician:** Focuses on entry level magic.  
    * INT: \+25%  
    * SPI: \+25%  
  * **Scout:** Excels in speed and utility.  
    * SPD: \+25%  
    * LCK: \+25%  
* **Tier 2 Classes (Available to Promote into at Level 10+):**  
  * Warrior:   
    * **Knight:** Tanky defense and endurance.  
      * DEF: \+35%  
      * END: \+25%  
      * STR: \+10%  
    * **Berserker:** High physical damage output  
      * STR: \+35%  
      * SPD: \+25%  
      * END: \+10%  
  * Magician:   
    * **Elemental Mage:** Offensive elemental magic.  
      * INT: \+35%  
      * SPD: \+25%  
      * MDF: \+10%  
    * **Light Mage:** Healing magic, buffs and status condition cures  
      * SPI: \+35%  
      * MDF: \+25%  
      * LCK: \+10%  
    * **Dark Mage:** Offensive dark magic, de-buffs and status conditions  
      * INT: \+35%  
      * ACC: \+25%  
      * MDF: \+10%  
  * Scout:   
    * **Rogue:** High damage but low accuracy abilities  
      * ACC: \+35%  
      * LCK: \+25%  
      * SPD: \+10%  
    * **Explorer:** Excels in exploration and resource gathering  
      * SPD: \+35%  
      * LCK: \+25%  
      * END: \+10%  
* **Tier 3 Classes (Available Level 20):**   
  * Knight:  
    * **Sentinel**: Overpowering Defensive capabilities  
      * DEF: \+50%  
      * END: \+50%  
      * MDF: \+25%  
      * SPD: \-30%  
    * **Paladin**: Mixes defensive and healing capabilities. Gains abilities to restore health while tanking damage  
      * MDF: \+50%  
      * SPI: \+50%  
      * DEF: \+25%  
      * STR: \-30%  
    * **Dread Knight**: Mixes defensive and dark magic. Gains abilities to debuff enemies and inflict status conditions   
      * END: \+50%  
      * MDF: \+50%  
      * INT: \+25%  
      * LCK: \-30%  
  * Berserker:  
    * **Warlord**: Highest consistent physical damage output  
      * STR: \+50%  
      * SPD: \+50%  
      * LCK: \+25%  
      * MDF: \-30%  
    * **Battle Dancer**: Agile, critical-hit-focused melee fighter  
      * SPD: \+50%  
      * LCK: \+50%  
      * ACC: \+25%  
      * DEF: \-30%  
    * **Spellblade**: Combines physical prowess with magical damage  
      * STR: \+50%  
      * INT: \+50%  
      * SPD: \+25%  
      * ACC: \-30%  
  * Red Mage:  
    * **Sorcerer**: Mastery over elemental magic  and multi-target elemental attacks   
      * INT: \+50%  
      * SPD: \+50%  
      * ACC: \+25%  
      * DEF: \-30%  
    * **Spellblade**: Combines physical prowess with magical damage. Uses elemental attacks infused in melee strikes.   
      * STR: \+50%  
      * INT: \+50%  
      * SPD: \+25%  
      * ACC: \-30%  
    * **Sage**: Capable of both elemental and light schools of magic  
      * INT: \+50%  
      * SPI: \+50%  
      * ACC: 25%  
      * END: \-30%  
  * White Mage:  
    * **Priest**: Combines healing, buffs, and powerful support magic  
      * SPI: \+50%  
      * INT: \+50%  
      * LCK: \+25%  
      * STR: \-30%  
    * **Paladin**: Mixes defensive and healing capabilities. Gains abilities to restore health while tanking damage  
      * MDF: \+50%  
      * SPI: \+50%  
      * DEF: \+25%  
      * STR: \-30%  
    * **Sage**: Capable of red & white schools of magic  
      * INT: \+50%  
      * SPI: \+50%  
      * ACC: \+25%  
      * END: \-30%  
  * Black Mage:  
    * **Warlock**: Specializes in dark magic with debuffs  
      * INT: \+50%  
      * ACC: \+50%  
      * MDF: \+25%  
      * LCK: \-30%  
    * **Dread Knight**: Mixes defensive and dark magic. Gains abilities to debuff enemies and inflict status conditions  
      * END: \+50%  
      * MDF: \+50%  
      * INT: \+25%  
      * LCK: \-30%  
    * **Shadowblade**: Uses dark magic to inflict debuffs on top of high damaging abilities  
      * INT: \+50%  
      * ACC: \+50%  
      * SPD: \+25%  
      * DEF: \-30%  
  * Rouge:  
    * **Assassin**: Precision-focused abilities, excelling in one-hit critical strikes.  
      * ACC: \+50%  
      * LCK: \+50%  
      * STR: \+25%  
      * END: \-30%  
    * **Battle Dancer**: Agile, critical-hit-focused melee fighter  
      * SPD: \+50%  
      * LCK: \+50%  
      * ACC: \+25%  
      * DEF: \-30%  
    * **Shadowblade**: Uses dark magic to inflict debuffs on top of high damaging abilities   
      * INT: \+50%  
      * ACC: \+50%  
      * SPD: \+25%  
      * DEF: \-30%  
  * Explorer:  
    * **Ranger**: Utilizes abilities to support combat and exploration.   
      * SPD: \+50%  
      * END: \+50%  
      * ACC: \+25%  
      * LCK: \-30%  
    * **Trailblazer**: Pinnacle of Exploration, Resource Gathering, and Wayfinding.  
      * SPD: \+50%  
      * LCK: \+50%  
      * SPI: \+25%  
      * ACC: \-30%

### Growth Rate System

Each stat is assigned a growth rate upon character generation, defining how much it increases per level. Growth rates are determined randomly using the following probabilities:

* **Minimal \-- (5% Chance):** 0.5 

* **Steady \- (20% Chance):** 0.66

* **Normal \_ (40% Chance):** 1.0

* **Gradual \+ (20% Chance):** 1.33

* **Accelerated \++ (10% Chance):** 1.5

* **Exceptional \* (5% Chance):** 2.0

**Gignen Exception:**

Gignen units must always have at least two stats assigned the "Accelerated" growth tier. If fewer than two are rolled, non-Accelerated stats are randomly upgraded to Accelerated with preference toward SPI.

## Gameplay

On Game Zones:  
The game is played on a 12x14 square grid, with the first two rows on each side representing each player’s owned territory and the space between is defined as “unclaimed territory”. A small area off to the side represents the “In Play” Card Zone detailed in the section after this one, and behind either player’s owned territory are designated locations for their main deck, advance deck, recharge pile, and discard pile.

On Card Zones:

The main card zones are:

1. Hand

2. In Play

3. Main Deck

4. Advance Deck

5. Recharge Pile

6. Discard Pile

Each card zone represents a different state of being and can be accessed by card effects if specified. Action Cards go from the Hand to In Play, when "played" or "activated" and will always denote whether they go to the Recharge Pile or Discard Pile when they leave "In Play" (if they do)

Some persistent cards like Buildings, Trap Buildings, and Counter Cards. Can be face-up or face-down depending on card type in the In Play Zone before being activated.

On Turn Structure:

1. Draw Phase

   1. Turn player draws one card from main deck, if no cards are present in main deck then shuffle the Recharge pile, place it in the deck zone, and draw one card from it.

2. Level Phase

   1. Any summons the turn player controls on the field level up by one level to a maximum of level 20

3. Action Phase

   1. Turn Player can perform the following actions:

      1. Move a summon up to it's SPD stat in spaces on the battlefield, can be broken into multiple actions (ex. SPD: 3, move 1 forward, move 2 left)

      2. Command a summon to perform a weapon attack on a valid target in range of the weapon that unit is equipped with, once per summon

      3. Play an action card if the activation requirements are met (ex. class based action cards require a a summon derived from, or of that class to be controlled by the turn player on the battlefield and may have range requirements as well, Building action cards require unoccupied spaces in turn player's territory equal to their space cost, Quest action cards require a summon controlled by the turn player that meets their requirements)

4. End Phase

   1. Turn Players turn ends and the next player's turn begins

Card effects that reference anyone of these phases will resolve or trigger within them as designated by the card description.

On Counter Action Cards:

* Counter Action Cards must be placed **face-down into the In Play Zone** before they can resolve.  
* When their trigger condition is met, they are revealed and resolved.  
* Counter Cards **cannot** be played directly from the hand.

Trap Buildings

* Trap Buildings are a subtype of Building cards.  
* May be placed in unclaimed territory.  
* Played face-down in the In Play Zone.  
* Opponent sees only the face-down card.  
* The owning player secretly marks the board spaces affected.  
* Revealed and resolved when the trap trigger occurs.

On Winning (Or losing) the Game:

The first player who accumulates 3 victory points wins the match. When a Tier 1 summon drops to 0 hp and dies, the opposing player gains a victory point. When a Tier 2 or higher summon drops to 0 hp and dies, the opposing player gains 2 victory points. The final way a player can gain a victory point is by having one of their summons make a direct attack against the opposing player. This can only be done if the attacking player’s summon is:

* Within the opposing player’s territory  
* There are no summons within the opposing player’s territory

On Card Acquisition:

Cards are acquired by players with in-game currency through various methods such as

* purchasing packs from the in-game store from themed sets such as a "Dark Rites" themed set having a card pool full of dark magic class based action cards, structures, equipment, summons, etc. 

* purchasing individual cards / items from other players via the auction house

* completing solo content milestones (not a full story mode but maybe an arcade mode for beginners)

Rarity System Reimagined:

* Instead of "Common" \= weak, you could say Commons vary wildly, but Rares are more consistent or peak in key stats.  
* Adds excitement even to opening low-rarity cards ("Did I get a 'god roll'?").

On Deck Building and Loadouts:

When designing a "Deck" or "Loadout", a player will select a certain amount of summons to load into their Summon Slots, these Summons will have base stats, growth rates for each stat, a class, an attribute, and in rarer cases they'll have passive or active abilities. The amount of Summon Slots can change based on the game mode they're building the Deck for, could be 3v3, could be 5v5 or maybe even a Battle Royale mode\! The Summon Slots will be the Summoning Cards players start with at the beginning of the game that trigger summon draws.

Once their Summon Slots are set, they'll choose cards from their card pool that'll make up the main deck they'll be drawing from through out the game. The main deck is made up of Quest Cards, Building Cards, Class Action Cards, Counter Action Cards and more types as the game develops. I'm imagining a main deck will consist of around 10-30 cards, but that number may increase if we want to allow a player to be able to have multiples of the same card in a deck. Players will need to pick cards that support and are compatible with their summons while creating a robust strategy against others

Finally, they'll construct their Promote deck. The Promote deck is a side deck that is made up of Tier 2, Tier 3, and Named summon cards that your summons promote into when the conditions on the card is met. This deck is much smaller in size, and is probably restricted to maybe 5-10 cards

Once a player has crafted their deck that meets validity rules to the game mode they've specified the deck is for, then they're ready to queue up for a game against other players online or maybe test out their new creation against an AI opponent before jumping into matchmaking

On Card Raising:

When a player receives a card fresh out of a pack, it'll always be Rank 0\. As the player uses that card, it'll accumulate experience and eventually Rank Up. As the card Ranks Up, so does it's effectiveness but this may vary depending on the card itself. The hope of this is that even common cards can rival rare ones when Ranked Up enough and used properly. I imagine this will take a lot of balancing though.

Summons growth rates and base stats may increase as they Rank Up, they may acquire new abilities or achieve ones that only rarer versions had at Rank 0

Equipment will grow more and more powerful as it Ranks Up but may have to be maintained

Action Cards that previously went to the Discard may start going to Recharge when they reach a certain Rank

Building Cards may take less space than they did before

etc. etc.

I think the key here is to not have so much variability that people think it's just completely unfair that they don't know what they'll get but enough variability that people will enjoy the thrill of chasing after that one perfect card of the one they like

On Archetypes:

This concept is still new and being experimented with. The idea is pushing the game’s summons beyond a limited set of humanoid adventurers and into the realm of monsters. In doing so the need to strip away the idea of summons having a “class or race” was needed and the idea of the Advance deck only containing cards that Promote an existing summon’s class needed to evolve to accommodate other growth strategies archetypes may have. Similar to how different archetypes in Yugioh may focus on fusion summoning vs synchro summoning or in Magic how Izzet decks function differently than Orzov and have different goals and pathways to winning

**Archetypes** (not to be confused with Roles or Species) represent thematic or stylistic identity. Over time, cards within an Archetype may evolve in different ways, leading to more personalization and role diversity.

## Card Schemas

### Action Cards

Type  
Rarity  
Target type  
Range  
Effects  
Attribute  
Name  
Id  
Requirements  
onResolve  
Metadata

### Buildings

Type  
Rarity  
Name  
Id  
Requirements  
onResolve  
on

## Example Play v1

here's an example play flow i guess:

both players sit across from each other on a grid based playing field (hex based? square based? 8x8? 5x5?) that is divided into 3 sections, one for each player and a unclaimed territory between them (the size of which is undecided but i imagine the unclaimed is the largest section)

players starting hand consists of their "summon cards" (their 3 monsters in this example)

players determine turn order by coin flip or rock paper scissors whatever

player A (player who is going first) does not draw a card because they are going first.

player A plays their summon card for the turn which summons a Gignen warrior level 5, the summon allows them to draw 3 cards from their deck (all summons do unless otherwise stated)

player A plays the "Sharpened Blade" warrior action card they drew on their warrior, increasing it's weapon power by 10\. After the action card resolves, it is placed in the Recharge pile or the Discard pile as designated by the properties of the action card.

with no targets within the warriors melee range, player A moves their newly summoned warrior the number of spaces equal to it's SPD stat and with nothing else they're able to do, ends their turn

player B begins their turn by drawing a card because they did not go first

player B plays a summon card which summons a Fae magician level 5, the summon allows them to draw 3 cards from their deck

player B's summoned magician has a SPD of 2, they utilize this by moving forward one space which puts them in range to play the magician Action card "Blast Bolt" an ability card with a base damage value, fire attribute, a significant range value, and accuracy value as properties. Whether the ability hits is calculated using the accuracy property and player B's magician's ACC stat. The action card resolves as damage is calculated and applied to the target: player A's warrior, through its damage formula consisting of player B's magician's INT stat, player A's warrior's MDF stat, attribute interaction, Crit chance, and any other affecting factors. Blast Bolt dealt 10 damage to player A's warrior, significant damage that is subtracted from player A's warrior's HP. After resolving, Blast Bolt is placed in the Discard pile as specified on the card.

player B then uses the rest of their magician's movement to move back one space and ends their turn.

player A begins their turn by drawing a card

the start of player A's turn triggers the level up of any summons they have on the field, causing their warrior to level from 5 to 6\. this increase affects the summons's stats

player A plays a summon card which summons a Gignen Magician level 5, player A chooses a space close to their warrior. the summon allows player A to draw 3 cards from their deck

player A plays the magician Action card "Healing Hands" an ability card with a base healing value, light attribute, and a range value specified as melee range only. As it is a magician Action card, the caster is their newly summoned magician, and the target is their warrior. the action card resolves as healing is calculated and applied to the target through its healing formula consisting of player A's magician's SPI stat, attribute interaction, crit chance, and any other affecting factors. Healing Hands heals the warrior 6 HP which is added to the warrior's HP. After resolving, Healing Hands is placed in the Discard pile as specified on the card.

player A then plays the Building Card: "Gignen Country" which affects a certain number of spaces on the board within player A's side of the playing field. "Gignen Country"'s specific affect is that any Gignen summons within those spaces receive double the amount of levels while occupying those spaces. Despite the Building Card resolving, it is not sent to either the Recharge Pile or Discard Pile due to the nature of its card type.

player A quickly follows this by playing the Quest Card: "Nearwood Forest Expedition" which increases any summon's level by 2 as long as the level it is currently at is under 10\. The Quest card resolves as player A selects their warrior as the Quest Card's target. Due to the compounding affect of Gignen Country on the space player A's warrior is occupying, the warrior's level shoots up to 10\. Nearwood Forest Expedition is placed in the Recharge pile after resolution.

because player A's warrior meets the conditions (level 10, STR stat \> n) the player is able to use a card from their Extra/Promotion/Class/whatever deck to upgrade their warrior to a Berserker

player A plays the warrior action card "Rush" which doubles the SPD of a summon, increasing the damage of the first attack they'll make on their turn at the cost of a significant decrease in their DEF. Using their Berserker's newfound SPD and running out of cards in their hand, player A moves their Berserker across the field to come within range of player B's Magician. Rush resolves and it is sent to the Discard pile.

player A plays their last card other than their last summon in their hand, a generic action card "Melee Weapon Attack". This is a generic action card that I'm not even sure if it should be a card or if this should be an action that's just always available to a given summon? Anyway, it resolves and the damage formula is calculated as normal taking into account weapon damage value, player A's berserker's STR, player B's magician's DEF, crit chance, and any other affecting factors (like Rush). With Rush active, the berserker being a promoted class and significantly higher level than the magician, and magician's being classically low DEF, player B's magician is wiped out in a single massive blow.

Having defeated an enemy summon, player A receives a victory point, one of 3 they'll need to win the game. Additionally, for getting the killing blow on an enemy the berserker grows another level, bringing them up to level 11\.

player B's magician being defeated triggers a Counter action card in their hand: the extremely rare "Dramatic Return\!" These action cards are ones that activate only on a specific trigger, usually from your hand or maybe I want a "I set one card face down" kind of dramatics but I can decide that later.

Dramatic Return\! allows a defeated summon to return to the owner's battlefield with 10% HP (but does not retrigger summon draws and victory points are still awarded for the defeat of the summon). The Counter action resolves and player B's magician is returned to the battlefield weakened but alive.

player A out of things to do during their turn can only end their turn with their berserker deep in enemy territory and the resources in their hand depleted.

player B begins their turn by drawing a card from their deck

the start of player B's turn triggers the level up of any summons they have on the field, causing their magician to level from 5 to 6\. this increase affects the summons's stats

player B plays their next summon card from their hand, summoning a Wilderling Scout level 5 and triggering their summon draws (drawing 3 cards)

player B plays the scout action card "Ensnare", which resolves using ACC and LCK vs the target's SPD to restrict the movement of another summon for a turn. player B targets player A's berserker and is successful in stopping player A's berserker from being able to move from that spot until the end of player B's next turn. The card goes to the discard pile after resolving as indicated on the card

player B then plays the Building Card "Dark Altar" on the spaces player A's berserker and player B's magician are occupying. Dark Altar is a card that allows the transformation of a magician into the highest tier without needing to level them by means of sacrifice of another summon. As always, Building Cards can only be played on spaces within the player's own side of the battlefield, and the original intended use of Dark Altar is to sacrifice one of your own summons to push a magician summon of yours to tier 3 class level eligibility but the card reads "At the end of your next turn, this building, and any summons within the spaces it occupies, are destroyed. If a summon was destroyed by this effect, target magic-based summon you control becomes level 20 and you can immediately promote/whatever verbiage for bringing out a Tier 3 Class that is based on the Dark Mage class tree as long as it is suitable for that summon." This distinction means that player A's berserker will still qualify as satisfying the conditions for Dark Altar's secondary effect to take place as long as player A's berserker stays within the Dark Altar's occupied spaces despite not being owned by player B.

player B plays the magician action card "Drain Touch" which does exactly what you think it does, uses INT against MDF and heals the caster equal to half of the damage it dealt to the target. The target being player A's berserker. Drain Touch resolves and is placed into the Discard pile.

player B then moves their magician out of the Dark Altar spaces and a bit towards the unclaimed territory in the middle of the battlefield.

player B then moves their Scout into the unclaimed territory, and is able to move enough to be in range to (again this is where it gets a little fuzzy if I want this to be an action card or just something a given summon is able to do) use a "Ranged Weapon Attack" based on the range of player B's Scout's equipped weapon. The weapon attack resolves using the Scouts ACC to check if the attack hits, and their STR, weapon power value, the target's DEF, crit chance, and any other factors to determine damage. The target in this case is player A's Magician.

with nothing else to do on their turn player B ends their turn.

player A begins their turn by drawing a card from their deck

the start of player A's turn triggers the level up of any summons they have on the field, causing their berserker to level from 11 to 12, and their magician to level from 5 to 7

player A plays their last summon, a Gignen scout within the spaces of their Gignen Country Building effect. The summon triggers their summon draws (3 cards) however this brings them to the end of their deck. Upon reaching the end of the deck, the recharge pile is shuffled and replaces the deck. 

player A plays the Quest Card: "Nearwood Forest Expedition" after drawing it from the recharge pile shuffling back into the deck during the summon draws. This Quest card increases any summon's level by 2 as long as the level it is currently at is under 10\. The Quest card resolves as player A selects their scout as the Quest Card's target. Due to the compounding affect of Gignen Country on the space player A's warrior is occupying, the warrior's level shoots up to 9\. Nearwood Forest Expedition is placed in the Recharge pile after resolution.

player A plays the scout action card "Adventurous Spirit" allowing them to add a Quest action card from their deck, recharge, or discard pile. player A selects "Nearwood Forest Expedition" and adds it back to their hand

player A plays the Quest Card: "Nearwood Forest Expedition" again, once again targeting their scout. The quest card resolves and brings player A's scout's level to 11

now that they were able to make their scout meet the conditions, a level 10 scout that has completed two or more Quest Cards, player A promotes their scout into the rare named summon "Alrecht Barkstep" from their promotion/class/whatever deck. On entering the battlefield, Alrecht adds a unique action card to its controller's hand: "Follow Me\!"

player A plays the action card "Follow Me\!", which reads "move target summon you control to an unoccupied space adjacent to an Alrecht Barkstep summon you control." player A targets their berserker to bring them back to player A's territory in a space next to Alrecht Barkstep on their side of the field

Because player B's Ensnare effect specifically reduces the berserker's movement to 0 until the end of player B's next turn, it does not hinder or obstruct the movement effect of Alrecht Barkstep moving player A's berserker

player A moves Alrecht Barkstep into unclaimed territory and uses a ranged weapon attack against player B's scout

player A moves their magician into unclaimed territory but is unable to get into range to use a ranged weapon attack

player A ends their turn unable to move their berserker

player B begins their turn by drawing a card from their deck

the start of player B's turn triggers the level up of any summons they have on the field, causing their magician to level from 6 to 7, and their scout from 5 to 6

player B plays their final summon card, summoning a Stoneheart Warrior Level 5 inside their Dark Altar Building occupied spaces. The summon triggers summon draws however player B does not have enough cards left in their deck and no cards in the Recharge pile so they are only able to draw 2

player B plays a magician action card "Spell Recall" which allows them to return a magician action card from either their recharge pile or discard pile if they send a card from their hand or the top of their deck to the recharge pile. player B selects "Blast Bolt", selecting one of the cards in their hand to place in their Recharge pile.

player B plays a magician action card "Life Alchemy" which allows them to target one summon they control, drain 25% of their current HP and add it to the current HP of another summon they control. player B selects their warrior to drain HP from to give to their magician. after the card resolves, it is placed into the Discard pile.

player B plays a scout action card "Dual Shot" which allows target scout based summon to make two weapon attacks instead of one per turn

player B uses their magician to make a ranged weapon attack against Alrecht Barkstep, then moves the magician back into their territory (but away from the Dark Altar spaces)

player B uses their scout to make two ranged weapon attacks against Alrecht Barkstep, destroying the summon in the process after one of the attacks was a critical hit. This awards player B two victory points for destroying a promoted unit, and causes the scout to increase in level by 2\. The scout's level rises from 6 to 8

player B moves their scout back into their own territory slightly

player B ends their turn which triggers the effect of Dark Altar. Dark Altar is destroyed alongside player B's warrior which causes multiple simultaneous effects: a victory point is awarded to player A due to the destruction of one of player B's summons, player B's magician levels up to level 20 and is given the opportunity to promote immediately to a Tier 3 or below class, player B has a Counter action card in hand that is triggered by the destruction of one of their summons. I legitimately don't know how to handle the ordering of simultaneous triggers like this.... so I'm gonna ignore it for now

player A is awarded a victory point bringing their total to 2 out of the 3 needed to win the game

player B's magician is brought to level 20 and player B promotes them to a Warlock

player B plays the triggered Counter action card in their hand "Graverobbing" which allows them to return a card from the discard pile to their hand. player B selects Ensnare to return to their hand.

player A begins their turn and triggers their recharge pile shuffling and replacing their missing deck then drawing a card

the start of player A's turn triggers the level up of any summons they have on the field, causing their berserker to level from 12 to 14 due to Gignen Country, and their magician to level from 7 to 8

player A moves their magician in a hail mary towards player B's scout barely making it within range to perform a ranged weapon attack. The attack hits but does not do enough damage to take out the scout.

hoping for a miracle, player A moves their berserker as much as their SPD allows towards unclaimed territory but cannot reach any target for a melee weapon attack and ends their turn.

player B begins their turn unable to draw a card triggering their Recharge pile to shuffle replacing their deck then draws a card

the start of player B's turn triggers the level up of any summons they have on the field, causing their scout to level from 6 to 7 but as their Warlock is already max level, they do not level up.

player B moves their Warlock in range of player A's magician

player B plays Blast Bolt. The action card resolves as damage is calculated and applied to the target: player A's magician, through its damage formula consisting of player B's Warlock's INT stat, player A's magician's MDF stat, attribute interaction, Crit chance, and any other affecting factors. Blast Bolt deals a very large amount of damage that is subtracted from player A's magician's HP reducing it to 0\. After resolving, Blast Bolt is placed in the Discard pile as specified on the card.

player B is awarded their third victory point and thus wins the game.