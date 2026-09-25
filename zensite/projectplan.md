This is a proposal for a website that I want to build. While many of the design choices are similar to a website program called "flocus", the idea is to offer many of these same features, completely free.

This project is called Zensite. It is a simple webapp that prompts the user to start a "focus session". This focus session's length will be determined by the user. Here is a list of the prompts that will be asked before the beginning of the focus session. After each question, I will provide the way in which the user can answer the prompt.

1. Are you ready to begin a focus session? : Button
2. What is your goal for this session? : String Input
3. How long will this session be? : Time Input
4. What ambience would you like for the session? : Drop down selection -- selection: provided by me
5. Begin? : Button

Once the focus session begins, then the timer will begin. During this period, the user will have the option to choose an ambience to play in the background. This ambience will loop while the focus session is running.

Once the focus session is over, an alarm will sound and the user will be prompted a few more questions. The questions go as follows:

1. How would you rate your performance during this session? : Drop down selection, with slider styling -- selection: 1-5
2. What notes do you have? : String Input
3. Start another session? : two Buttons (yes/no)

If yes: The website will take you back to the first page with the initial questions.
If no:  The website will prompt the user whether or not they want to save their notes.

This website is meant to both be reused many times over, and data friendly. It is crucial that all given data is deleted once the user closes the website. However, if a user wants to remember the journal prompts they were given, they will have the option to save a txt or json file of their focus session, mainly, their goals, progress, and any other notes they wrote down during their session.

A key feature of this web app is that the focus session will be able to utilize the "window within a window" function, to display the timer that is currently counting down, and all times unless the user closes the tab specifically (or the subsequent window within a window.)

``` Styles ```

The Style of this website is very simple. Since there won't be much content on the page itself, we will center all of the content to the middle of the page. The header and footer should also be connected in color with the main page. The header will have a settings buttons in the top right. That button will remain static across all pages.

Dynamic Elements:

This page will be fairly dynamic, since we want to make this a seamless experience for the user. There will be one page for the beginning prompts, a page for the actual timer, and a page for the ending prompts.

Instead of having a list of the question prompts, the questions will fade in and out dynamically after the previous question has been answered. Another dynamic element I would like to implement for the first question page is to have the website colors slowly gradient after each answered question. The colors will gradient from Color 1 - Color 5, which is specified down below.

For the timer page, we need a dynamic timer represented by a circle. As the timer counts down the circle will incrementally be reduced to show the passage of time. Similarly to the questions page, we will need to have the page change colors at specific intervals. At the halfway point, and as the timer is nearing the end. This will need to be accomplished through some internal math in our js script.

```Colors```
Colors were picked to reflect that of a sun set. These colors are solely to be used on the background. The text colors have not been chosen yet.
Color 1:#ee5f0c
Color 2:#ff2a00
Color 3:#ee004b
Color 4:#9800a3
Color 5:#17006a


```Page Outline```

Page 1: purpose: prompt user questions before beginning focus session
Page 1: dynamic elements: Fade questions in and out and change colors graudually

Page 2: purpose: begin timer, reflect the stated goal, and play any ambience the user chose
Page 2: dynamic elements: Timer is represented by a circle that incrementally reduces in the same way a timer would, and colors change at key points of the timer's life span

Page 3: purpose: prompt the user to reflect on their focus session
Page 3: dynamic elements: Fade questions in and out, but no changing colors, since we will keep it on Color 5

```Instructions```

Once you have reviewed the context, please pause and prompt me to respond. We will want to tackle this project one page at a time, slowly building up momentum. 

First we will build page 3, since it has the least amount of dynamic elements, then page 1, and finally page 2. Our stretch goal is to add a settings page that will have a link on all 3 pages, but is not required for our first version.

I will need to implement, test, and fine tune each page after we implement them, so you need to pause after each page to let me catch up. Are you ready to begin?