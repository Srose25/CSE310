We will build an executable GUI based game using the programming language Rust. The goals for this project are to familiarize myself with the programming language itself, egui(the library we will use for everything GUI related), program a simple and satisfying game loop, and do so in a way that can be replicatable by me later on.

The Language:
We will be using Rust for this project. To create a GUI we will use the egui library.

The Game:
This game will be a basic Tamagotchi inspired/based game. There will be a small pet like creature called the sprite or character, and three buttons that will act as our controller. The buttons will be gui buttons on the screen. Any animations will also be handled by the gui system. The background will be white since the images we'll use will be comprised of black pixels.

The gui system should be used in immediate mode since there will be more movement than a basic app.

*IMPORTANT*: I will provide the pngs to overlay onto any buttons or sprites, do not generate any images for this project. The images will be pixelart, and will be 8x8, meaning they will need to be resized for the project.


The buttons - functionality

Button 1: This will be on the left side of the screen and will act as a move button, meaning, that whenever there are options on the menu, this button will move a cursor through the selection.
Button 2: This will be in the center of the screen and will act as a selection or action button.
Button 3: This will be on the right side of the screen and will act as a back button, meaning, that when you have selected something on the menu and would like to move back to a previous selection, this button will help you do that.

*IMPORTANT*: When it comes to the placement of the buttons, they should be placed in a row closer to the bottom of the screen to give way for the rest of the elements.


Menus:

We will add one menu for now. This menu will be a list of different emotes for the sprite character to do.

Animations:
-Shake -- Frame 2 of the sprite will be active while the gui system moves the character side to side.
-Jump -- Frame 2 of the sprite will be active while the gui system moves the character in jump like animation.
-Anger -- Frame 3 of the sprite will be active while the gui system moves the character side to side a short distance rapidly.


Idle Animation:

For Idle animations we need to use Frame 1 of the sprite. Frame 1 has the sprite facing left and should be used whenever the sprite moves left, and then when the sprite wants to move right we need to flip the sprite horizontally for the same effect.


Movement and character AI:

The character AI will be very basic, we need to create five points on the screen that the character will move to. A center point with 2 points to the left and 2 points to the right. The character will then randomly pick one of the five points to move toward. Once the character arrives at the spot it will "look around" (by flipping the current sprite frame back and forth a few times) and then wait for a random amount of time between 1-30 seconds before picking the next spot to move to.


Instructions:

Generate the code for this type of project with comments letting me know what each function is doing so I can read over it and familiarize myself with the language. For functions that need a png, use a dummy path and a comment that says "REPLACE WITH ACTUAL IMAGE" that lets me know to go through that portion and add the images. The things that require an image are the character sprite, button 1, button 2, and button 3. Once you have generated this first draft, save it to the RUST folder in CSE310, and  stand by to await the next set of instructions.