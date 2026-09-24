This is a proposal for a website that I want to build. While many of the design choices are similar to a website program called "flocus", the idea is to offer many of these same features, completely free.

This project is called Zensite. It is a simple webapp that prompts the user to start a "focus session". This focus session's length will be determined by the user. Here is a list of the prompts that will be asked before the beginning of the focus session. After each question, I will provide the way in which the user can answer the prompt.

1. Are you ready to begin a focus session? : Button
2. What is your goal for this session? : String Input
3. How long will this session be? : Time Input
4. What ambience would you like for the session? : Drop down selection
5. Begin? : Button

Once the focus session begins, then the timer will begin. During this period, the user will have the option to choose an ambience play in the background. This ambience will loop while during the focus session.

Once the focus session is over, and alarm will sound and the user will be prompted a few more questions. The questions go as follows:

1. How would you rate your performance during this session? : Drop down selection, with slider styling
2. What notes do you have? : String Input
3. Start another session? : two Buttons (yes/no)

If yes: The website will take you back to the first page with the initial questions.
If no:  The website will prompt the user whether or not they want to save their notes.

This website is meant to both be reused many times over, and data friendly. It is crucial that all given data is deleted once the user closes the website. However, if a user wants to remember the journal prompts they were given, they will have the option to save a txt file of their focus session, mainly, their goals, progress, and any other notes they wrote down during their session.

A key feature of this web app is that the focus session will be able to utilize the "window within a window" function, to display the timer that is currently counting down, and all times unless the user closes the tab specifically (or the subsequent window within a window.)

``` Styles ```