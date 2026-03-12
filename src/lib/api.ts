// src/lib/api.ts
// localStorage'ı tamamen kaldırıp API route'larına bağlayan istemci fonksiyonları

import { MealRow, StatRow, WorkoutParsed } from "./db";

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type { MealRow, StatRow, WorkoutParsed };

export interface ScheduleEntry {
  id: number;
  day_index: number;
  workout_id: number | null;
  is_rest_day: number;
  workout: WorkoutParsed | null;
}

export interface StatsSummary {
  weight:        StatRow | null;
  water:         StatRow | null;
  water_goal:    StatRow | null;
  target_weight: StatRow | null;
}

// ─── MEALS ────────────────────────────────────────────────────────────────────
export const mealsApi = {
  async getToday(): Promise<MealRow[]> {
    const res = await fetch("/api/meals");
    const data = await res.json() as { meals: MealRow[] };
    return data.meals;
  },

  async add(name: string, calories: number, protein: number): Promise<MealRow> {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, calories, protein }),
    });
    const data = await res.json() as { meal: MealRow };
    return data.meal;
  },

  async remove(id: number): Promise<void> {
    await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
  },
};

// ─── STATS ────────────────────────────────────────────────────────────────────
export const statsApi = {
  async getSummary(): Promise<StatsSummary> {
    const res = await fetch("/api/stats");
    const data = await res.json() as { summary: StatsSummary };
    return data.summary;
  },

  async getHistory(type: "weight"): Promise<StatRow[]> {
    const res = await fetch(`/api/stats?type=${type}`);
    const data = await res.json() as { rows: StatRow[] };
    return data.rows;
  },

  // Kilo girişi — her giriş ayrı kayıt (tarih bazlı)
  async addWeight(value: number): Promise<StatRow> {
    const res = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "weight", value, unit: "kg" }),
    });
    const data = await res.json() as { stat: StatRow };
    return data.stat;
  },

  // Su — bugünkü değeri güncelle (upsert)
  async setWater(value: number): Promise<void> {
    await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "water", value, unit: "L", upsertToday: true }),
    });
  },

  // Su hedefi — upsert
  async setWaterGoal(value: number): Promise<void> {
    await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "water_goal", value, unit: "L", upsertToday: true }),
    });
  },

  // Hedef kilo — upsert
  async setTargetWeight(value: number): Promise<void> {
    await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "target_weight", value, unit: "kg", upsertToday: true }),
    });
  },

  async deleteWeight(id: number): Promise<void> {
    await fetch(`/api/stats?id=${id}`, { method: "DELETE" });
  },
};

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
export const scheduleApi = {
  async getAll(): Promise<ScheduleEntry[]> {
    const res = await fetch("/api/schedule");
    const data = await res.json() as { schedule: ScheduleEntry[] };
    return data.schedule;
  },

  async setRest(dayIndex: number, isRest: boolean): Promise<void> {
    await fetch("/api/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayIndex, isRest }),
    });
  },
};

// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
export const workoutsApi = {
  async saveDay(dayIndex: number, exercises: string[], note: string): Promise<WorkoutParsed> {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayIndex, exercises, note }),
    });
    const data = await res.json() as { workout: WorkoutParsed };
    return data.workout;
  },
};
