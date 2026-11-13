We are currently working on the playable character in Conquest. Our three main tasks are to 1. Make a magnet that attracts resources to the player character, 2. The player movement will favor the direction of the mouse, and 3. adding an in-game crosshair made from a png file that we have.

1. Magnet:
Right now there are resources that are dropped from entities after a player breaks them. Those resource pellets simply heal the player right now, but we want to add different resources in the future. To make this a core component of the game that works in a fluid way, we need to add a magnet to the player character.

The way this will work is that the Player Character will be given two extra hitboxes that vary in size and level of magnetism. The first level will expand far from the player and have low magnetism, and the second level will be close to the player and have high magnetism to make it easier for the player to collect resources.

Identify the script that controls the player's hitboxes and add a new method that handles the logic for this magnet feature. Report back and let me know where I can find it so I may review it.

2. Player Movement: 
In the current version we have WASD handle movement inputs. The physics of movement make the movement feel floaty and slow, as if you are in space maneuvering a space craft. To make this a more fluid experience we want to prioritize movement when the player has their ship moving towards the direction of the mouse cursor.

To accomplish this we'll need to add a condition for movement that checks whether or not the keyboard inputs are pointing towards the general octagonal direction of the mouse's position.

Identify the script that controls the player's hitboxes and add a new method that handles the logic for this magnet feature. Report back and let me know where I can find it so I may review it.

3. Crosshair:
In the base version of the game we have, the mouse aim where to shoot for the player character. We need to add our crosshair png (named "crosshair1") to the position of the mouse, and hide the computer mouse.

Identify the script that controls the player's hitboxes and add a new method that handles the logic for this magnet feature. Report back and let me know where I can find it so I may review it.