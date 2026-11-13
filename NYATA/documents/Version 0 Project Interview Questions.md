# Version 0 Project Interview Questions

Please answer each yes/no question by changing `[ ]` to `[y]` or `[n]` (y=yes, n=no). Add short answers below the questions that request details.

## Product scope

1. [y] Should Version 0 focus on a single-user experience and defer all social/accountability features to Version 0.2?
2. [y] Should Version 0 support recurring goals as well as one-time goals?
3. [y] Should users be able to create goals for specific dates and times, rather than only assigning goals to a day?
4. [y] Should completing a goal require an explicit user confirmation such as a “Complete” button?
5. [n] Should users be able to edit or undo a goal completion after earning XP?
6. [y] Should XP values be manually chosen by the user for each goal?
7. [y] Should Version 0 include streaks in addition to XP and goal completion history?
8. [y] Should users be able to customize the daily XP target or daily goal structure?

## Platform and access

9. [n] Should we build Version 0 for iOS first?
10. [y] Should we build an Android version at the same time?
11. [y] Should the first release be a local prototype that works without an account or cloud sync?
12. [n] If an account is required, should email/password authentication be included in Version 0?
13. [y] Should the app support dark mode only, matching the black, white, and gray aesthetic?
14. [y] Should the interface use a serif font throughout the app?

## Calendar and notifications

15. [y] Should Version 0 include a month calendar view?
16. [y] Should Version 0 also include a day or agenda view for the next tasks?
17. [y] Should users be able to schedule local push notifications for planned goals?
18. [y] Should reminders repeat automatically for recurring goals?
19. [y] Should users be able to configure notification timing per goal?

## Tracking and data

20. [y] Should Version 0 include both line and bar chart options?
21. [y] Should users be able to choose which goals appear in a chart?
22. [y] Should charts show daily, weekly, and monthly ranges?
23. [n] Should “enduring XP” be included in Version 0, even though screen-time manipulation is planned for Version 0.1?
24. [n] Should users be able to export their goal and XP history in Version 0?

## Technical and release decisions

25. [y] Should we prioritize the fastest path to a maintainable cross-platform mobile app over native platform-specific implementations?
26. [n] Should the project use a managed backend service for authentication and data storage rather than a custom server in Version 0?
27. [y] Should we include automated unit and integration tests before the first usable prototype?
28. [n] Should we target a small private beta rather than public app-store release for this sprint?

## Short-answer questions

29. **Target devices:** If the answer to platform questions is not simply “iOS first” or “both,” which devices and operating systems must work?

At this moment in time I want to avoid an IOS first approach since I don't develop on a Macbook. As an end product, I would love to get it on the apple store, but in due time. For version 0 we need to focus on an android first approach.

30. **Goal model:** What fields should a goal have at minimum? For example: title, description, date, start time, due time, recurrence, XP value, color, and completion state.

All of those should be implemented in a goal, and they should be customizable for the user.

31. **XP rules:** Should XP be awarded immediately on completion, only after the scheduled time, or according to another rule? What should happen when a goal is missed?

XP should be rewarded after the user checks a selection that marks the goal as completed. If the goal is timed, then the user will be able to complete the goal after the time is passed.

32. **Calendar scope:** Should Version 0 integrate with Apple/Google calendars, or should it provide an in-app calendar only?

Version 0 should just be an in app calendar. Later versions will be integrated with Google and Apple calendars.

33. **Notification behavior:** What reminder behavior matters most for the first version, and are there any quiet hours or notification limits?

Reminders will behave like default reminders. Quiet hours or notification blockers should be able to block the reminder notifications.

34. **Charts:** Which recurring-goal metrics should be tracked, and what should the default chart show on first launch?

The launch tracker shouldn't show anything since there isn't any data yet. The only goals that can be seen in the tracker are recurring goals. One time goals won't be able to be tracked.

35. **Privacy and data:** Are there any data-retention, privacy, or offline-use requirements beyond keeping user data private?

The app should completely be able to be used offline. There isn't anything we should need to access online. In later versions we can implement a cloud feature that saves data for a certain user, but that will be later.

36. **Definition of done:** What must be working for you to consider Version 0 successful at the end of this sprint?

1.Dashboard page needs to be operational
2.Calendar needs to be working(monthly view and daily view)
3.Tracking page should work
4.Settings page with a basic dark mode setting inside.
