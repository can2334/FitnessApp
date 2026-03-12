// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface WeightEntry {
  date: string;
  w: number;
}

export interface DayPlan {
  isRest: boolean;
  exercises: string[];
  note: string;
}

export type WeekPlan = Record<number, DayPlan>; // 0=Mon..6=Sun

export interface AppState {
  weights: WeightEntry[];
  targetWeight: number;
  water: number;
  waterGoal: number;
  waterLog: { time: string; amt: number }[];
  week: WeekPlan;
}

export type TabId = "weight" | "water" | "plan";