PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  xp_value INTEGER NOT NULL CHECK(xp_value > 0),
  start_date TEXT NOT NULL,
  end_date TEXT,
  start_time TEXT,
  due_time TEXT,
  recurrence_kind TEXT NOT NULL CHECK(recurrence_kind IN ('once','daily','weekly','monthly')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1 CHECK(recurrence_interval > 0),
  weekdays_mask INTEGER,
  month_day INTEGER,
  timezone_id TEXT NOT NULL,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goal_occurrences (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  local_date TEXT NOT NULL,
  timezone_id TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  UNIQUE(goal_id, local_date)
);

CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL UNIQUE REFERENCES goal_occurrences(id),
  completed_at TEXT NOT NULL,
  completion_source TEXT NOT NULL DEFAULT 'user',
  xp_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS xp_ledger (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL UNIQUE REFERENCES goal_occurrences(id),
  amount INTEGER NOT NULL CHECK(amount > 0),
  reason TEXT NOT NULL DEFAULT 'goal_completion',
  awarded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  occurrence_id TEXT NOT NULL REFERENCES goal_occurrences(id) ON DELETE CASCADE,
  reminder_at_local TEXT NOT NULL,
  timezone_id TEXT NOT NULL,
  os_notification_id TEXT,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
  updated_at TEXT NOT NULL,
  UNIQUE(occurrence_id, reminder_at_local)
);

CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_occurrences_date ON goal_occurrences(local_date);
CREATE INDEX IF NOT EXISTS idx_occurrences_goal_date ON goal_occurrences(goal_id, local_date);
CREATE INDEX IF NOT EXISTS idx_completions_completed_at ON completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_reminders_enabled_at ON reminders(enabled, reminder_at_local);
