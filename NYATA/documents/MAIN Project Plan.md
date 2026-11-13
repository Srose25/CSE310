# NYATA — Version 0 Main Project Plan

## 1. Purpose

Build an Android-first, offline-first habit and goal tracker that helps a user structure the day, complete goals, earn XP, receive reminders, and review recurring-goal progress.

Version 0 is a personal productivity app. Social features, cloud accounts, calendar integrations, and screen-time enforcement are explicitly deferred.

## 2. Confirmed product decisions

- Android is the first target. iOS is a later platform goal.
- The app must work fully offline and require no account or backend.
- Version 0 supports one-time and recurring goals.
- Goals are customizable and include title, description, date, start time, due time, recurrence, XP value, color, and completion state.
- A goal earns XP only after the user explicitly marks it complete.
- A timed goal cannot be completed before its allowed completion time.
- Completed goals cannot be edited or undone in Version 0.
- Users can customize their daily XP target and goal structure.
- Version 0 includes streaks.
- The calendar is in-app only: month view plus day/agenda view.
- Reminders are local notifications with per-goal timing and recurring reminder support.
- Notification delivery remains subject to Android permission, quiet hours, battery optimization, and OS notification settings.
- The tracking page covers recurring goals only; one-time goals do not appear in charts.
- Tracking supports line and bar chart modes plus daily, weekly, and monthly ranges.
- A new tracker with no recurring-goal data shows an intentional empty state rather than a blank/broken chart.
- No enduring XP, screen-time manipulation, export, social features, or cloud sync in Version 0.
- Required usable areas: Dashboard, Calendar/Goals, Tracking, and Settings.
- Visual direction: black, white, and gray with a distinguished serif-led interface and accessible contrast.

## 3. Recommended technical direction

Use React Native with Expo and TypeScript for a maintainable cross-platform foundation while developing Android first.

Recommended Version 0 stack:

- React Native + Expo + TypeScript
- Expo Router or an equivalent typed navigation structure
- `expo-sqlite` for durable local relational data
- `expo-notifications` for local scheduled notifications
- A small chart library compatible with React Native, selected during the architecture spike
- Jest plus React Native Testing Library for automated tests
- Android Studio/emulator and at least one physical Android device for notification testing

Why this direction: Expo provides a practical Android-first workflow while preserving a path to iOS; SQLite fits relational goals, recurring instances, completions, and XP history; local notifications match the offline requirement. Expo documents both persisted SQLite storage and local notification support. See the official references in Section 11.

Do not add authentication, a server, cloud sync, or a third-party analytics SDK in Version 0.

## 4. Scope and acceptance criteria

### Dashboard

- Opens to the current day.
- Shows today’s XP earned, daily XP target, progress toward target, completion count, and next actionable goal.
- Shows a clear empty state when no goals exist.
- Allows a user to mark an eligible goal complete.
- Updates XP and progress immediately after completion.

### Calendar and Goals

- Month view allows selecting a date.
- Day/agenda view lists goals in chronological order.
- User can create, view, and delete goals.
- Goal form supports all confirmed goal fields and validation.
- Recurring goals generate predictable occurrences without duplicating or corrupting history.
- A timed goal is not completable before its allowed time.
- A completed goal is visibly distinct and cannot be edited or undone.
- Reminder timing can be configured per goal.

### Tracking

- Only recurring goals are selectable for tracking.
- User can choose line or bar chart.
- User can choose daily, weekly, or monthly range.
- User can switch among recurring goals.
- Empty, loading, and error states are designed and tested.
- Streak calculations are consistent with the defined recurrence and completion rules.

### Settings

- Contains a basic dark-mode setting, enabled by default.
- Persists the setting across app restarts.
- Displays the Version 0 offline/local-only behavior clearly enough that users understand data is stored on the device.

### Quality and release

- Core domain logic has automated unit tests.
- Main user flows have integration/component tests.
- App can be installed and exercised on an Android emulator and physical Android device.
- No network is required for normal use.
- No known blocker remains in the acceptance criteria above.

## 5. Domain model

At minimum, model these concepts:

- `Goal`: id, title, description, date or recurrence rule, start time, due time, XP value, color, completion policy, created timestamp, archived/deleted state.
- `GoalOccurrence`: materialized or calculated instance of a recurring goal for a specific date, with eligibility and completion state.
- `Completion`: goal occurrence id, completed timestamp, awarded XP, and source metadata needed to prevent double-awarding.
- `UserSettings`: daily XP target, theme preference, notification preferences, and chart preference.
- `Reminder`: goal/occurrence association, trigger time, repeat metadata, OS notification identifier, enabled state.

XP must be awarded through one idempotent domain operation. A goal completion must never award XP twice.

## 6. Delivery sequence

1. Architecture spike: validate Expo Android build, SQLite setup, local notification scheduling, chart library, and date/recurrence approach.
2. App shell: navigation, theme tokens, typography, reusable controls, and screen placeholders.
3. Data layer: schema, migrations, repositories, seed/reset support for development.
4. Goal workflow: create, list, recurrence, timed eligibility, complete, XP calculation, streak calculation.
5. Calendar workflow: month selection and daily agenda.
6. Dashboard workflow: current-day summary and next goal.
7. Notifications: permission flow, local scheduling, rescheduling, cancellation, and settings behavior.
8. Tracking workflow: recurring-goal queries, range filters, line/bar charts, empty states.
9. Settings: theme persistence and local-only messaging.
10. Verification: automated tests, device testing, accessibility pass, performance pass, and release checklist.

## 7. Explicit non-goals

- Screen-time manipulation or app blocking
- Enduring XP
- User accounts or authentication
- Cloud backup or synchronization
- Apple/Google calendar integration
- Friends, sharing, competitions, or public profiles
- Data export
- Payments, ads, analytics, or monetization
- iOS release packaging

## 8. Risks and decisions to validate

- Android notification behavior varies with permission state and battery optimization. Test on emulator and physical hardware and document limitations.
- Recurrence and timezone logic can create duplicate or missed occurrences. Keep dates/timezones explicit and test daylight-saving transitions where practical.
- Local-only data has no automatic recovery. Make the limitation visible and keep schema migrations safe.
- “Cannot edit or undo completion” is a strict product rule; provide a clear confirmation and avoid accidental taps.
- Serif typography must remain legible at small sizes. Use a platform-available serif fallback and validate contrast and dynamic text sizes.

## 9. Definition of done for the sprint

Version 0 is done when a user can install the Android build, create one-time and recurring goals, see them in month and day views, receive local reminders, complete eligible goals for XP, view the dashboard, inspect recurring-goal charts, change the basic dark-mode setting, close/reopen the app without losing data, and complete the primary flows offline.

## 10. Agent handoff

- Architect: produce the technical design, data schema, recurrence/XP rules, navigation map, and spike decisions.
- Engineer: implement the approved design in small, test-backed increments and keep the app runnable after each increment.
- QA: turn this plan into a risk-based test strategy, verify acceptance criteria on Android, and report defects with reproducible evidence.

## 11. Official technical references

- [Expo SQLite documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo local and remote notifications overview](https://docs.expo.dev/push-notifications/what-you-need-to-know/)
- [Expo notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo local-first guide](https://docs.expo.dev/guides/local-first/)
- [React Native Android environment setup](https://reactnative.dev/docs/environment-setup?platform=android)
