# NYATA Version 0 — Architecture Decision Record

**Status:** Accepted design for the first vertical slice  
**Date:** 2026-11-07  
**Scope:** Android-first, offline-first personal goal tracker; future iOS support remains a compatibility constraint.

## 1. Decisions at a glance

| Area | Decision | Reversible fallback |
|---|---|---|
| App foundation | React Native + Expo + TypeScript, using Expo Router | React Navigation if Router becomes a blocker |
| Durable storage | `expo-sqlite`, with numbered SQL migrations | A repository adapter can move to another SQLite driver |
| State | React Context + `useReducer` for session/UI state; repositories are the source of truth | Add Zustand only if measured cross-screen coordination becomes painful |
| Dates | Store local calendar dates/times and an IANA timezone snapshot; use small pure date helpers and native `Date` only after explicit parsing | Introduce a date library only after a DST/recurrence spike proves its behavior |
| Notifications | `expo-notifications`, scheduled as persisted one-shot notifications per occurrence | A native notification adapter can replace Expo without changing domain code |
| Charts | `react-native-gifted-charts` behind a `ChartRenderer` adapter | Swap to another renderer or a small SVG renderer |
| Architecture | Feature UI → application/use cases → domain → repositories/platform ports | Keep ports stable if implementation changes |

The app deliberately has no backend, authentication, analytics, cloud sync, social features, screen-time APIs, or network dependency in Version 0.

## 2. Project structure and navigation

Create the project with the Expo Router template and TypeScript. Keep routes thin: a route composes a screen and injects dependencies; it does not calculate recurrence, award XP, or issue raw SQL.

```text
app/
  _layout.tsx                 # providers, theme, database bootstrap
  (tabs)/
    _layout.tsx               # bottom tab navigator
    index.tsx                 # Dashboard
    calendar.tsx              # Calendar + selected-day agenda
    tracking.tsx              # recurring-goal tracking
    settings.tsx              # settings and local-only explanation
  goals/new.tsx
  goals/[goalId].tsx          # view/edit only while not completed

src/
  domain/                     # pure types, recurrence, eligibility, XP, streaks
  application/                # use cases and DTOs used by screens
  data/
    db/                       # connection, migrations, seed/reset helpers
    repositories/             # Goal, Occurrence, Completion, Reminder, Settings
    sql/                      # parameterized queries
  platform/
    clock.ts                  # injectable now/timezone provider
    notifications.ts          # NotificationPort + Expo implementation
  features/                   # dashboard, calendar, tracking, settings UI/hooks
  components/                # accessible controls and layout primitives
  theme/                      # tokens, typography, dark theme
  charts/                     # chart model, adapter, renderer selection
  test/                       # fixtures and test database helpers
```

Navigation is a four-tab shell: Dashboard, Calendar, Tracking, Settings. Calendar owns the month selector and selected-day agenda; goal creation/detail is a pushed route. Tracking only queries recurring goals. Settings persists the daily XP target, theme preference, and notification preference.

Use Expo Router because it provides file-based routes and a straightforward path to iOS/web-compatible navigation. The route layer should depend on application interfaces, not on the router or SQLite.

## 3. Layer boundaries

- **UI/features:** renders state, validates obvious input for usability, calls use cases, and displays loading/empty/error/permission states.
- **Application:** coordinates transactions and adapters: `createGoal`, `ensureOccurrences`, `completeOccurrence`, `getDashboard`, `getTrackingSeries`, `reconcileReminders`, and settings use cases.
- **Domain:** pure deterministic rules. It knows nothing about React, SQLite, Expo, or notification IDs.
- **Persistence:** owns SQL, migrations, transactions, row mapping, and repository interfaces.
- **Platform:** owns Expo notifications, the clock/timezone provider, and future native implementations.

No screen imports `expo-sqlite` or `expo-notifications`. All writes go through a use case so completion and XP cannot be accidentally implemented twice.

## 4. SQLite schema

Use foreign keys, ISO-8601 UTC timestamps for audit timestamps, and ISO `YYYY-MM-DD` local dates for occurrence identity. Store user-entered local times as `HH:mm` strings; do not store a fabricated UTC timestamp for a future local schedule.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  xp_value INTEGER NOT NULL CHECK(xp_value > 0),
  start_date TEXT NOT NULL,             -- local YYYY-MM-DD
  end_date TEXT,                        -- null = no end date
  start_time TEXT,                      -- local HH:mm
  due_time TEXT,                        -- local HH:mm
  recurrence_kind TEXT NOT NULL CHECK(recurrence_kind IN ('once','daily','weekly','monthly')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1 CHECK(recurrence_interval > 0),
  weekdays_mask INTEGER,                -- bit 0 Monday ... bit 6 Sunday; weekly only
  month_day INTEGER,                    -- 1..31; monthly only
  timezone_id TEXT NOT NULL,             -- IANA ID captured at creation/edit
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE goal_occurrences (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  local_date TEXT NOT NULL,
  timezone_id TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  UNIQUE(goal_id, local_date)
);

CREATE TABLE completions (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL UNIQUE REFERENCES goal_occurrences(id),
  completed_at TEXT NOT NULL,
  completion_source TEXT NOT NULL DEFAULT 'user',
  xp_value INTEGER NOT NULL
);

CREATE TABLE xp_ledger (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL UNIQUE REFERENCES goal_occurrences(id),
  amount INTEGER NOT NULL CHECK(amount > 0),
  reason TEXT NOT NULL DEFAULT 'goal_completion',
  awarded_at TEXT NOT NULL
);

CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL REFERENCES goal_occurrences(id) ON DELETE CASCADE,
  reminder_at_local TEXT NOT NULL,      -- local ISO datetime, no offset
  timezone_id TEXT NOT NULL,
  os_notification_id TEXT,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_at TEXT NOT NULL,
  UNIQUE(occurrence_id, reminder_at_local)
);

CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_occurrences_date ON goal_occurrences(local_date);
CREATE INDEX idx_occurrences_goal_date ON goal_occurrences(goal_id, local_date);
CREATE INDEX idx_completions_completed_at ON completions(completed_at);
CREATE INDEX idx_reminders_enabled_at ON reminders(enabled, reminder_at_local);
```

`goals` contains the durable definition. `goal_occurrences` is a materialized read/interaction unit, not duplicated goal history. `completions` and `xp_ledger` are append-only facts. A completed occurrence is immutable in Version 0; the UI must not expose edit or undo actions. Deleting an uncompleted goal is allowed; deleting a goal cascades its uncompleted/related local records according to the database policy. If product later needs audit-preserving deletion, replace the cascade with an archive/tombstone migration.

Migrations live in `src/data/db/migrations/001_initial.sql`, `002_...sql`, etc. On open: enable foreign keys, run migrations in one transaction, then verify the schema version. Never reset production data. A development-only reset/seed helper must be explicit and unavailable from release UI.

## 5. Recurrence and occurrence generation

The first slice supports `once`, `daily`, `weekly`, and `monthly`, with an interval. Weekly uses a weekday bitmask; monthly uses a day number. A monthly day that does not exist in a month is skipped, not clamped. `start_date`, optional `end_date`, and the timezone captured with the goal bound the schedule.

Use a pure function:

```ts
generateOccurrenceDates(rule: RecurrenceRule, from: LocalDate, through: LocalDate): LocalDate[]
```

Generate the requested date range deterministically from the rule; do not derive future recurrence from the last generated row. On app start, opening Calendar, opening Tracking, and after a local-date rollover, run `ensureOccurrences` for every active recurring goal from the earlier of its start date and the query start through a bounded horizon (recommended: today + 90 days). Backfill from the last known query range when a user opens an older date. The unique `(goal_id, local_date)` constraint makes retries safe.

Occurrence identity is stable: UUID `occurrence.id` is created once and reused. A goal edit that changes recurrence affects only future uncompleted occurrences after a transaction; completed history is never rewritten. For Version 0, prefer disabling the edit form after completion of an occurrence and document that rule clearly.

Date/time policy:

- “Today” is derived from the current device timezone at the time of the query.
- A goal stores the timezone ID used when its schedule was created/last edited.
- Date-only recurrence uses the goal’s timezone, so travel can change which local day is current without changing historical `local_date` values.
- If the device timezone changes, show a non-blocking notice and reconcile future reminders using the new device timezone; do not rewrite past occurrences. A future occurrence’s stored `timezone_id` is updated only by an explicit user reschedule/edit.
- DST gaps/overlaps are handled by a tested local-datetime resolver: nonexistent times move to the next valid instant; ambiguous times choose the earlier instant. The resolver is isolated so a date library can be added later.

## 6. Timed completion, XP, and streaks

### Eligibility and completion

The application computes `completionNotBefore` for the occurrence’s local date:

1. `due_time` if present;
2. otherwise `start_time` if present;
3. otherwise the start of the local date.

This makes “after the scheduled time has passed” explicit and conservative. An occurrence is eligible when `now` in the goal timezone is at or after that instant and the occurrence has no completion. If the goal has both start and due times, start is display/scheduling context and due time is the completion gate in Version 0. This is a deliberately reversible decision to validate in the first usability test.

`completeOccurrence(occurrenceId, now)` runs one database transaction:

1. Load the occurrence and goal; reject if missing, archived, or already completed.
2. Recompute eligibility from the injected clock; reject early completion.
3. Insert `completions` with the goal’s XP snapshot.
4. Insert one matching `xp_ledger` row.
5. Commit and return the completion plus awarded XP.

The unique constraints on `completions.occurrence_id` and `xp_ledger.occurrence_id` are the final idempotency guard. A repeated tap, retry after an app restart, or duplicate notification response returns “already completed” and never awards XP again. XP is calculated from the stored snapshot, not a later goal edit.

Missed goals are not auto-completed and earn no XP. They remain visible as missed in agenda/tracking calculations once their local day has ended.

### Streaks

Only recurring goals have streaks. For a selected recurring goal and a local date range, get scheduled occurrences in chronological order. A completed scheduled occurrence extends the streak; a past scheduled occurrence without completion breaks it; future occurrences do not break it. Dates with no scheduled occurrence are ignored, so a weekly goal can maintain a streak across non-scheduled days. The current streak is the length of the trailing completed run ending at the latest completed occurrence, stopping at the first past scheduled miss. This definition is independent of the number of calendar days elapsed and is tested for daily, weekly, monthly, gaps, and timezone boundaries.

## 7. Local notifications

Use an internal `NotificationPort`:

```ts
interface NotificationPort {
  getPermissionState(): Promise<PermissionState>;
  requestPermission(): Promise<PermissionState>;
  schedule(input: LocalNotificationInput): Promise<string>;
  cancel(osNotificationId: string): Promise<void>;
}
```

The Expo adapter uses `expo-notifications`; the domain never sees Expo types. Schedule one-shot notifications for materialized occurrences rather than relying on OS repeating rules. Each scheduled row stores the OS identifier, the occurrence, local trigger time, timezone, and enabled state.

`reconcileReminders` is idempotent:

1. Ensure the Android notification channel exists.
2. Read permission and exact-alarm status where applicable.
3. For enabled future reminders, cancel persisted OS IDs whose payload no longer matches the desired schedule.
4. Schedule missing desired reminders and persist returned IDs in the same logical reconciliation.
5. Cancel reminders for completed, deleted, disabled, or past occurrences.

Call reconciliation after database bootstrap, app resume, goal/reminder edit, settings change, local-date rollover, and after a failed scheduling attempt when the app next becomes active. Never claim a reminder was delivered; show a permission/OS-limitation explanation instead.

Android behavior to document in Settings/help: Android 13+ requires notification permission; Android 8+ uses user-configurable channels; exact timing can require exact-alarm permission and newer Android versions may deny it; Doze, battery optimization, manufacturer policies, quiet hours, and user-disabled channels can delay or suppress alerts. Local notifications remain local; no push token or network call is needed. Test notification behavior on an emulator and a physical Android device.

## 8. State and data flow

Use React Context providers for `AppServices` and feature-local `useReducer` state for loading/success/error/form state. Repositories remain the durable source of truth. After a successful write, the use case emits a small in-memory invalidation event; affected screens refetch their query rather than maintaining competing copies of goal state.

Example flow:

```text
Calendar screen
  -> completeOccurrence use case
  -> domain eligibility + SQLite transaction
  -> invalidation event
  -> Dashboard/Calendar/Tracking refetch
```

This avoids an additional state library in Version 0 and keeps the fallback simple. If a later feature requires complex cross-screen optimistic state, introduce Zustand behind feature hooks; do not make UI components depend directly on it.

## 9. Tracking and chart adapter

Choose `react-native-gifted-charts` for Version 0 because it supports line and bar charts in React Native and is suitable for an Expo spike. Treat it as replaceable: chart components receive only the app-owned model below.

```ts
type TrackingPoint = {
  date: string;              // local YYYY-MM-DD
  label: string;
  completed: number;         // 0 or 1 for a goal occurrence
  xp: number;
};

type TrackingSeries = {
  goalId: string;
  goalTitle: string;
  range: 'daily' | 'weekly' | 'monthly';
  points: TrackingPoint[];
  streak: number;
};

interface ChartRendererProps {
  series: TrackingSeries;
  mode: 'line' | 'bar';
}
```

`trackingRepository` returns a complete date-bucket series, including zero-value buckets, only for recurring goals. `ChartRenderer` maps that model to library props. A custom empty state is rendered before the chart when there are no recurring goals or no completed data; do not rely on library behavior for empty input. The adapter is the only place allowed to import the chart package.

Fallback: replace Gifted Charts with a renderer built on `react-native-svg`, or another maintained Expo-compatible library, without changing tracking queries or feature screens. The architecture spike must verify line/bar rendering, accessibility labels, dynamic width, and Android release build compatibility before committing the dependency.

## 10. Testing strategy and minimum coverage

Use Jest for pure domain and application tests, React Native Testing Library for screen/component behavior, and a real temporary SQLite database for repository/migration tests. Platform adapters use contract tests with fakes; run manual device tests for OS behavior that cannot be reliably mocked.

Minimum domain coverage is **90% line and branch coverage** for `src/domain`, with every rule below represented by named tests:

- recurrence generation for once/daily/weekly/monthly, intervals, bounds, invalid monthly dates, DST boundary fixtures, and timezone changes;
- completion eligibility before/at/after the gate;
- transactional completion awards XP once, including retry/duplicate calls;
- missed goals award no XP;
- streaks for consecutive schedules, missed schedule, non-scheduled gaps, future occurrences, and monthly schedules;
- tracking excludes one-time goals and returns zero-filled ranges/intentional empty state;
- migration from an empty database and migration idempotency.

Integration/component tests must cover month/day navigation, calendar query dates, dashboard next actionable goal, form validation, completed-goal immutability, settings persistence after provider remount/restart simulation, chart mode/range selection, and notification permission-denied state. Notification scheduling/rescheduling/cancellation is verified through a fake `NotificationPort` plus one physical-device smoke test.

Every test uses an injected `Clock` and explicit timezone/date fixtures. Avoid tests that depend on the host machine’s current date or timezone.

## 11. Android development/build workflow

1. Install Node LTS, Android Studio, Android SDK/platform tools, an emulator, and JDK version required by the selected Expo SDK.
2. Create the project with the Expo Router TypeScript template and pin compatible package versions using `npx expo install`.
3. Start the shell with `npx expo start`; use Expo Go for UI-only work and SQLite experiments.
4. Create a development build when testing native notification behavior or any config-plugin/native module change. Expo’s current guidance notes that Android push functionality is not available in Expo Go from SDK 53 onward; local notifications may be available there, but the real notification path must be validated in a development build.
5. Use `npx expo run:android` for local native builds. Use a release variant for notification launch behavior and final smoke checks; debug notification launches can have different splash behavior.
6. Validate on an Android emulator and one physical device, including permission denied, channel disabled, app restart, device reboot, timezone change, date rollover, Doze/battery optimization, and missed reminder cases.
7. Keep native configuration in `app.json`/`app.config.ts` and config plugins; commit migration files and setup notes. Do not add remote notification credentials or a backend.

The first spike must prove: app boots, SQLite persists through restart, a development build schedules/cancels a local notification, and the selected chart library renders both modes on Android.

## 12. Risks, tradeoffs, and reversible decisions

- **Local-only durability:** uninstall/device loss loses data. Version 0 should state this clearly; cloud backup is explicitly deferred.
- **Timezone/DST complexity:** local dates are product data, while reminders are instants. Keep conversion in one tested module and preserve the original local date.
- **Occurrence horizon:** a bounded horizon avoids an unbounded table but requires reconciliation. The unique key makes extending the horizon safe.
- **Exact alarms:** exact timing can be unavailable or policy-restricted. The UI must communicate approximate delivery rather than promise it.
- **Completed-goal immutability:** it protects XP history but makes corrections impossible. This is a confirmed Version 0 rule and should remain isolated in the completion use case so a future correction workflow can be added by migration.
- **Native dependency surface:** Expo speeds delivery but config plugins require rebuilds. Keep platform services behind ports and use Expo Go only for JS/UI work.
- **Chart dependency:** a chart library can become stale or limit accessibility. The adapter and app-owned series model make replacement low-risk.
- **Completion gate interpretation:** using due time when present is conservative but may differ from user expectation. Keep `completionNotBefore` as one domain policy and validate it early.

## 13. Prioritized implementation sequence

1. Architecture spike: Expo Router boot, Android emulator/device, `expo-sqlite`, notification development build, date resolver, and chart renderer.
2. App shell: tabs, dark theme, serif typography, accessible controls, service provider, and error boundary.
3. Database: migrations, repositories, test database, seed/reset helper, and schema verification.
4. Domain: recurrence generator, occurrence materialization, completion transaction, XP idempotency, eligibility, and streaks.
5. Goal workflow: create/list/view/delete, validation, one-time/recurring rules, and completed-state lock.
6. Calendar: month selection, selected-day agenda, chronological sorting, and navigation tests.
7. Dashboard: today’s XP/target, completion count, and next actionable goal.
8. Notifications: permission flow, channel/exact-alarm status, reconciliation, reschedule/cancel, and device verification.
9. Tracking: recurring-only query, zero-filled ranges, line/bar adapter, filters, streak, and empty state.
10. Settings and release hardening: target/theme/notification preferences, local-only messaging, accessibility, restart/date/timezone/device tests.

### Open questions

- Should a timed goal become eligible at its start time rather than its due time? Version 0 currently chooses due time when present.
- Should a completed occurrence lock only that occurrence, or should editing a recurring goal be disabled after any completion? The implementation should initially lock only completed history and protect future rows transactionally; confirm UX during the first vertical slice.
- Is a 90-day future occurrence horizon sufficient for calendar navigation, or should it be configurable?
- Which Android API levels and device manufacturers are in the beta matrix?
- Should a missed recurring occurrence appear as a chart zero, a distinct missed value, or only affect streaks? The current adapter uses `completed: 0` and keeps missed styling a UI decision.

### Build this first — Engineer checklist

- [ ] Create the Expo Router TypeScript app and commit the first Android boot.
- [ ] Add `expo-sqlite`, run migration 001, and prove persistence after restart.
- [ ] Implement the injected clock/timezone module and recurrence tests before UI recurrence work.
- [ ] Implement `completeOccurrence` as the only XP-awarding path and test duplicate calls.
- [ ] Add a fake notification port, then an Expo adapter and development-build smoke test.
- [ ] Add the chart adapter with hard-coded sample series before wiring tracking queries.
- [ ] Keep a short change summary, tests run, known limitations, and manual Android steps in each implementation increment.

## References

- [Expo Router introduction](https://docs.expo.dev/router/introduction/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo notification behavior and limitations](https://docs.expo.dev/push-notifications/what-you-need-to-know/)
- [Expo notification troubleshooting](https://docs.expo.dev/push-notifications/faq/)
- [react-native-gifted-charts repository](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)
