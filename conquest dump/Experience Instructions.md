# Experience Points

We need to implement the experience points system into Conquest. At this moment we have 5 different xp pngs that reflect the amount of xp they should grant. Here is the scaling we have right now.

1. 1 xp point / XP_Pellet_1.png
2. 2 xp points / XP_Pellet_2.png
3. 5 xp points / XP_Pellet_5.png
4. 9 xp points / XP_Pellet_9.png
5. 15 xp points / XP_Pellet_15.png

When a player picks up an experience point the points should simply add the value to the player's experience meter. For the players experience level they should have an experience meter that will get larger throughout the game's progression.

A simple scaling would look something like this:

level 0: Starting point
Level 1: 50 xp to level up
Level 2: 100 xp to level up
Level 3: 150 xp to level up
Level 4: 200 xp to level up
Level 5: 300 xp to level up
Level 6: 600 xp to level up
Level 7: 1200 xp to level up
Level 8: 2000 xp to level up
Level 9: 4000 xp to level up
level 10: 8000 xp to level up

etc.

The reason for this steep first level is due to how often xp points should be dropping. For each small asteroid(meteor1.png), 1-3 experience points should drop. For each medium asteroid(meteor2.png) there should be a 5 xp drop. Enemy ships will drop anywhere from 9 xp to 15 xp. The deciscion for how much xp is granted will be determined at random, within the parameters already established. 

When the decision is made then the rendering process must draw the xp sprites in the most efficient way possible. Meaning that the largest XP sprite will be drawn first, and then work it's way down the sprite list until you can only draw the 1 xp point sprites to award the player the correct amount of xp points

For each level up, there should be some utility points awarded automatically. These utility points include the HP, shield, and bullet damage.

You may come up with the HP, shield, and bullet damage upgrade scaling, but please document that scaling up to level 10 in a markdown file that shows both what file this scaling and data lives.


When you are done implementing the changes, report back what files you've changed so I may review them. Write comments as well, clarifying the changes. If you need to write new scripts or make a new game element then report that as well.