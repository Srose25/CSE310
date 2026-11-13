# QA Instructions — NYATA Version 0

## Mission

Verify that Version 0 is useful, reliable, offline-capable, and consistent with the confirmed product decisions. Test on an Android emulator and, when possible, a physical Android device.

## Test strategy

### Functional flows

1. First launch with no data: verify intentional empty states and usable navigation.
2. Create a one-time goal with every supported field.
3. Create a recurring goal with a schedule, color, XP value, and reminder.
4. Confirm month view and day/agenda view show the correct goals.
5. Attempt to complete a timed goal early; verify it is blocked with a clear explanation.
6. Complete an eligible goal; verify XP, completion state, dashboard totals, and streak update.
7. Try to complete the same goal again; verify XP is not duplicated.
8. Confirm completed goals cannot be edited or undone.
9. Open Tracking; verify only recurring goals are available.
10. Verify line/bar modes and daily/weekly/monthly ranges.
11. Verify empty tracking state before any recurring completion data exists.
12. Configure, receive, reschedule, and cancel local reminders.
13. Deny notification permission; verify the app remains usable and explains the limitation.
14. Change the basic dark-mode setting; close and reopen the app; verify persistence.
15. Disable network access or use airplane mode; verify core flows still work.

### Boundary and failure cases

- Goals at midnight, near day boundaries, and with start time equal to due time.
- Recurring goals across month boundaries and daylight-saving changes where applicable.
- Zero XP, large XP, blank title, invalid time ranges, and duplicate reminder attempts.
- Deleting a goal with prior completion history.
- App restart while a reminder is scheduled.
- Android notification permission denied, notification channel disabled, and battery optimization enabled.
- Empty database, migration from an older schema, and corrupted/failed database operation handling.

## Quality checks

- Verify no data is lost after force-close and relaunch.
- Verify visual hierarchy, contrast, readable serif typography, dynamic text sizing, and touch-target size.
- Verify charts have labels or accessible summaries and do not crash with sparse data.
- Verify errors are understandable and recoverable.
- Check that one-time goals never leak into recurring tracking.

## Defect reporting

Every defect should include:

- title and severity
- device, Android version, and app build
- preconditions and exact steps
- expected result
- actual result
- screenshots or logs when useful
- reproducibility and suspected scope

## Exit criteria

Recommend release only when all critical and high-risk flows pass, no data-loss or duplicate-XP defects remain, offline use works, reminders have documented Android limitations, and the acceptance criteria in the main project plan are satisfied.
