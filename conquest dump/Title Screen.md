# Title Screen

Now that we have made some decent progress on the game, we need to create a title screen.

For the title screen we need two main elements the Headline, and the selection menu. The headline will use the Conquest Title Screen.png file, located in Image Renders folder. The selection menu will have the following options.

1.Play
2.Settings
3.Quit

We will worry about the settings menu in a future update.

Play will take you immediately to our Game scene, and quit will prompt you again with "are you sure?" and then close the application if the user confirms.

We will use the RostavePersonalUse-Eaylz.otf for the menu selection.

Lastly, we need need to use some of our starfield background pngs to fill the screen in the background. Use "Stars Far.png", "Stars Mid.png", and "Stars Near.png" for the effect. This background needs to move, and we'll take inspiration from how the game moves the three(i.e Stars Near moves the fastest, Stars Mid the second fastest, and Stars Far moving the slowest.). The direction the stars should be moving should be in a downward motion, to give the effect of moving upward. 

To understand how the Stars move in the background check out World.tscn. The same "scroll_scale"s should be applied to the title screen animation.


When the game begins this Title Screen must be the first scene to show up. The game scene should fade in and the title screen scene should fade out, when the play option is selected.

When you are done implementing the Title Screen, provide a quick guide to testing this scene so that I can take a look at it. Also let me know what files were changed in the process of implementing this feature. Use good coding practices and write comments so it is clear what the program is doing.