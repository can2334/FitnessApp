// ─── DATABASE LAYER ───────────────────────────────────────────────────────────
// better-sqlite3 ile senkron SQLite erişimi
// npm install better-sqlite3 @types/better-sqlite3

import Database from "better-sqlite3";
import path from "path";

// DB dosyası proje kökünde fitness.db olarak durur
const DB_PATH = path.join(process.cwd(), "fitness.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  return _db;
}

// ─── MIGRATION ────────────────────────────────────────────────────────────────
function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      calories   INTEGER NOT NULL,
      protein    REAL    DEFAULT 0,
      createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stats (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      type  TEXT    NOT NULL,   -- 'weight' | 'water' | 'water_goal' | 'target_weight'
      value REAL    NOT NULL,
      unit  TEXT    NOT NULL,
      date  DATE    DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS weekly_schedule (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      day_index   INTEGER UNIQUE NOT NULL,  -- 0=Mon..6=Sun
      workout_id  INTEGER,
      is_rest_day INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT NOT NULL,
      exercises TEXT NOT NULL,   -- JSON string: string[]
      note      TEXT DEFAULT '',
      date      DATE DEFAULT CURRENT_DATE
    );

    -- Default weekly schedule (Tue, Thu, Sun = rest)
    INSERT OR IGNORE INTO weekly_schedule (day_index, is_rest_day)
    VALUES (0,0),(1,1),(2,0),(3,1),(4,0),(5,0),(6,1);
  `);
}

// ─── MEALS ────────────────────────────────────────────────────────────────────
export interface MealRow {
  id: number;
  name: string;
  calories: number;
  protein: number;
  createdAt: string;
}

export const mealsDb = {
  getAll(): MealRow[] {
    return getDb().prepare("SELECT * FROM meals ORDER BY createdAt DESC").all() as MealRow[];
  },
  getToday(): MealRow[] {
    return getDb()
      .prepare("SELECT * FROM meals WHERE date(createdAt) = date('now') ORDER BY createdAt ASC")
      .all() as MealRow[];
  },
  insert(name: string, calories: number, protein: number): MealRow {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO meals (name, calories, protein) VALUES (?, ?, ?)")
      .run(name, calories, protein);
    return db.prepare("SELECT * FROM meals WHERE id = ?").get(info.lastInsertRowid) as MealRow;
  },
  delete(id: number): void {
    getDb().prepare("DELETE FROM meals WHERE id = ?").run(id);
  },
};

// ─── STATS ────────────────────────────────────────────────────────────────────
export interface StatRow {
  id: number;
  type: string;
  value: number;
  unit: string;
  date: string;
}

export type StatType = "weight" | "water" | "water_goal" | "target_weight";

export const statsDb = {
  getByType(type: StatType): StatRow[] {
    return getDb()
      .prepare("SELECT * FROM stats WHERE type = ? ORDER BY date ASC, id ASC")
      .all(type) as StatRow[];
  },
  getLatest(type: StatType): StatRow | null {
    return (
      (getDb()
        .prepare("SELECT * FROM stats WHERE type = ? ORDER BY date DESC, id DESC LIMIT 1")
        .get(type) as StatRow) ?? null
    );
  },
  insert(type: StatType, value: number, unit: string): StatRow {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO stats (type, value, unit) VALUES (?, ?, ?)")
      .run(type, value, unit);
    return db.prepare("SELECT * FROM stats WHERE id = ?").get(info.lastInsertRowid) as StatRow;
  },
  upsertToday(type: StatType, value: number, unit: string): void {
    getDb()
      .prepare(`
        INSERT INTO stats (type, value, unit, date) VALUES (?, ?, ?, date('now'))
        ON CONFLICT DO NOTHING
      `)
      .run(type, value, unit);
    getDb()
      .prepare("UPDATE stats SET value = ? WHERE type = ? AND date = date('now')")
      .run(value, type);
  },
  delete(id: number): void {
    getDb().prepare("DELETE FROM stats WHERE id = ?").run(id);
  },
};

// ─── WEEKLY SCHEDULE ─────────────────────────────────────────────────────────
export interface ScheduleRow {
  id: number;
  day_index: number;
  workout_id: number | null;
  is_rest_day: number; // 0 | 1 — SQLite boolean
}

export const scheduleDb = {
  getAll(): ScheduleRow[] {
    return getDb()
      .prepare("SELECT * FROM weekly_schedule ORDER BY day_index ASC")
      .all() as ScheduleRow[];
  },
  setRest(dayIndex: number, isRest: boolean): void {
    getDb()
      .prepare("UPDATE weekly_schedule SET is_rest_day = ? WHERE day_index = ?")
      .run(isRest ? 1 : 0, dayIndex);
  },
  setWorkout(dayIndex: number, workoutId: number | null): void {
    getDb()
      .prepare("UPDATE weekly_schedule SET workout_id = ? WHERE day_index = ?")
      .run(workoutId, dayIndex);
  },
};

// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
export interface WorkoutRow {
  id: number;
  title: string;
  exercises: string; // JSON string
  note: string;
  date: string;
}

export interface WorkoutParsed extends Omit<WorkoutRow, "exercises"> {
  exercises: string[];
}

function parseWorkout(row: WorkoutRow): WorkoutParsed {
  return {
    ...row,
    exercises: (() => {
      try { return JSON.parse(row.exercises) as string[]; }
      catch { return row.exercises ? row.exercises.split(",").map((s) => s.trim()) : []; }
    })(),
  };
}

export const workoutsDb = {
  getAll(): WorkoutParsed[] {
    const rows = getDb()
      .prepare("SELECT * FROM workouts ORDER BY date DESC, id DESC")
      .all() as WorkoutRow[];
    return rows.map(parseWorkout);
  },
  getById(id: number): WorkoutParsed | null {
    const row = getDb().prepare("SELECT * FROM workouts WHERE id = ?").get(id) as WorkoutRow | undefined;
    return row ? parseWorkout(row) : null;
  },
  upsertForDay(dayIndex: number, exercises: string[], note: string): WorkoutParsed {
    const db = getDb();
    // Find existing workout linked to this day
    const schedule = db
      .prepare("SELECT workout_id FROM weekly_schedule WHERE day_index = ?")
      .get(dayIndex) as { workout_id: number | null } | undefined;

    const title = `Gün ${dayIndex + 1} Antrenman`;
    const exercisesJson = JSON.stringify(exercises);

    if (schedule?.workout_id) {
      // Update existing
      db.prepare("UPDATE workouts SET exercises = ?, note = ? WHERE id = ?")
        .run(exercisesJson, note, schedule.workout_id);
      return workoutsDb.getById(schedule.workout_id)!;
    } else {
      // Create new and link
      const info = db
        .prepare("INSERT INTO workouts (title, exercises, note) VALUES (?, ?, ?)")
        .run(title, exercisesJson, note);
      const newId = info.lastInsertRowid as number;
      db.prepare("UPDATE weekly_schedule SET workout_id = ? WHERE day_index = ?")
        .run(newId, dayIndex);
      return workoutsDb.getById(newId)!;
    }
  },
  delete(id: number): void {
    getDb().prepare("DELETE FROM workouts WHERE id = ?").run(id);
  },
};
