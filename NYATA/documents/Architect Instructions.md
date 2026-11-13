# Architect Instructions — NYATA Version 0

## Mission

Design the technical foundation for an Android-first, offline-first goal tracker. The design must support a future iOS client and future cloud/social features without introducing those features now.

## Required outputs

Create an architecture decision record covering:

1. React Native/Expo/TypeScript project structure and navigation.
2. SQLite schema, indexes, migrations, and repository boundaries.
3. Goal recurrence representation and occurrence-generation strategy.
4. Timed-goal eligibility rules, completion rules, idempotent XP awarding, and streak calculation.
5. Local notification scheduling, rescheduling, cancellation, permission handling, and OS limitations.
6. State-management approach and separation between UI, domain logic, persistence, and platform services.
7. Chart-library choice and the data adapter that keeps chart components replaceable.
8. Testing strategy and minimum coverage for domain logic.
9. Android build/development workflow, including when a development build is required.
10. Risks, tradeoffs, and decisions that must remain reversible.

## Constraints

- No backend, authentication, cloud sync, analytics, social features, or screen-time APIs.
- All core use cases work offline.
- Completed goals cannot be edited or undone in Version 0.
- Only recurring goals feed tracking charts.
- Avoid putting business rules directly in screen components.
- Avoid date/time libraries or dependencies unless their timezone and recurrence behavior is understood and tested.

## Acceptance checks

- Another engineer can implement the first vertical slice from the design without guessing the data model.
- The schema can represent one-time and recurring goals without rewriting completion history.
- Re-running completion or notification scheduling is safe and idempotent.
- The design explains what happens across app restart, date change, timezone change, and missed reminders.
- Every major dependency has a reason for inclusion and a fallback.

## Handoff format

End with a prioritized implementation sequence, open questions, and a short “build this first” checklist for the Engineer.
