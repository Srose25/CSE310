# Engineer Instructions — NYATA Version 0

## Mission

Implement the approved architecture as a reliable Android-first mobile app. Keep the app runnable after every increment and use tests to protect domain behavior.

## Implementation order

1. Create the Expo/React Native/TypeScript app and confirm Android build/run.
2. Add navigation, design tokens, dark theme, serif typography, and reusable accessible controls.
3. Implement SQLite initialization, migrations, repositories, and development reset/seed helpers.
4. Implement goal creation and validation for all required fields.
5. Implement one-time and recurring occurrences, timed eligibility, completion, XP, and streak logic.
6. Implement month calendar and day/agenda views.
7. Implement dashboard summaries and next-actionable-goal behavior.
8. Implement local reminder scheduling, per-goal timing, recurring reminders, permission handling, and cancellation.
9. Implement recurring-goal tracking with line/bar modes, date ranges, filtering, and empty states.
10. Implement settings persistence and final polish.

## Engineering rules

- Keep domain logic independent of React components and OS APIs.
- Award XP through one idempotent operation; never increment XP in multiple UI paths.
- Store enough data to explain why a completion and XP award occurred.
- Make recurrence calculations deterministic and testable with an injected clock/date.
- Treat notification identifiers as persisted data so reminders can be cancelled or rescheduled.
- Use parameterized SQL and migrations; do not rely on destructive schema resets outside development helpers.
- Build offline first. Do not add network calls or telemetry.
- Include loading, empty, validation, permission-denied, and error states.
- Make touch targets, text scaling, contrast, labels, and focus behavior accessible.
- Do not implement Version 0.1 or 0.2 features unless explicitly requested.

## Required tests

- XP is awarded exactly once.
- A timed goal cannot be completed too early.
- One-time goals do not appear in tracking.
- Recurring goals produce the expected occurrences and streaks.
- Month/day navigation shows the correct goals.
- Settings survive an app restart.
- Notification scheduling/rescheduling/cancellation calls the platform adapter correctly.
- Empty tracker state appears when no recurring data exists.

## Handoff expectations

Each increment should include a concise change summary, tests run, known limitations, and manual Android verification steps. Keep architecture notes and setup instructions current as implementation decisions settle.
