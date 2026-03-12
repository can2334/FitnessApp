"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AppState, TabId, WeekPlan } from "./types";
import { WeightTab } from "./components/WeightTab";
import { WaterTab }  from "./components/WaterTab";
import { PlanTab }   from "./components/PlanTab";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const LS_KEY = "fittracker_v2";

function buildDefaultWeek(): WeekPlan {
  const week: WeekPlan = {};
  for (let i = 0; i < 7; i++) {
    week[i] = {
      isRest: i === 1 || i === 3 || i === 6,
      exercises: [],
      note: "",
    };
  }
  return week;
}

function loadState(): AppState {
  const defaultState: AppState = {
    weights: [],
    targetWeight: 75,
    water: 0,
    waterGoal: 2.5,
    waterLog: [],
    week: buildDefaultWeek(),
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState;
    const parsed: Partial<AppState> = JSON.parse(raw);
    // Ensure all week days exist
    const week = parsed.week ?? buildDefaultWeek();
    for (let i = 0; i < 7; i++) {
      if (!week[i]) week[i] = { isRest: false, exercises: [], note: "" };
      week[i].exercises = week[i].exercises ?? [];
      week[i].note      = week[i].note ?? "";
    }
    return { ...defaultState, ...parsed, week };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function fmtDate(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

function fmtTime(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; visible: boolean; }
function Toast({ message, visible }: ToastProps): React.ReactElement {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
        background: "#111118",
        border: "1px solid #2a2a38",
        borderRadius: 12,
        padding: "10px 22px",
        fontSize: 12,
        fontFamily: "'DM Mono',monospace",
        fontWeight: 600,
        color: "#e8e8f0",
        zIndex: 999,
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
interface TabBtnProps {
  id: TabId;
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}
function TabBtn({ icon, label, active, onClick }: TabBtnProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 4px",
        border: active ? "1px solid rgba(255,77,0,0.5)" : "1px solid #1e1e28",
        borderRadius: 12,
        cursor: "pointer",
        fontFamily: "'Unbounded',sans-serif",
        fontSize: 7.5,
        fontWeight: 700,
        letterSpacing: 0.5,
        transition: "all .2s",
        background: active
          ? "linear-gradient(145deg,rgba(255,77,0,0.2),rgba(255,133,51,0.12))"
          : "#0d0d12",
        color: active ? "#ff8533" : "#44445a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function FitnessTrackerPage(): React.ReactElement {
  const [state, setState] = useState<AppState>(loadState);
  const [tab, setTab] = useState<TabId>("weight");
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: "", visible: false });

  // Persist on every state change
  useEffect(() => { saveState(state); }, [state]);

  const showToast = useCallback((msg: string): void => {
    setToast({ msg, visible: true });
    const id = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
  }, []);

  // ── Weight handlers ────────────────────────────────────────────────────────
  const handleAddWeight = useCallback((val: number): void => {
    setState((prev) => ({
      ...prev,
      weights: [...prev.weights, { date: fmtDate(), w: val }],
    }));
    showToast("✅ Kilo kaydedildi!");
  }, [showToast]);

  const handleRemoveWeight = useCallback((idx: number): void => {
    setState((prev) => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleTargetChange = useCallback((delta: number): void => {
    setState((prev) => ({
      ...prev,
      targetWeight: Math.max(30, Math.round((prev.targetWeight + delta) * 10) / 10),
    }));
  }, []);

  // ── Water handlers ─────────────────────────────────────────────────────────
  const handleAddWater = useCallback((amt: number): void => {
    setState((prev) => {
      const newWater = Math.max(0, Math.round((prev.water + amt) * 100) / 100);
      const newLog = amt > 0
        ? [...prev.waterLog, { time: fmtTime(), amt }]
        : prev.waterLog.slice(0, -1);
      const metGoal = newWater >= prev.waterGoal && prev.water < prev.waterGoal;
      if (metGoal) setTimeout(() => showToast("🎉 Günlük su hedefine ulaştın!"), 50);
      return { ...prev, water: newWater, waterLog: newLog };
    });
  }, [showToast]);

  const handleWaterGoalChange = useCallback((delta: number): void => {
    setState((prev) => ({
      ...prev,
      waterGoal: Math.max(0.5, Math.round((prev.waterGoal + delta) * 100) / 100),
    }));
  }, []);

  // ── Plan handlers ──────────────────────────────────────────────────────────
  const handleSetRest = useCallback((dayIdx: number, isRest: boolean): void => {
    setState((prev) => ({
      ...prev,
      week: { ...prev.week, [dayIdx]: { ...prev.week[dayIdx], isRest } },
    }));
  }, []);

  const handleAddExercise = useCallback((dayIdx: number, name: string): void => {
    setState((prev) => ({
      ...prev,
      week: {
        ...prev.week,
        [dayIdx]: {
          ...prev.week[dayIdx],
          exercises: [...prev.week[dayIdx].exercises, name],
        },
      },
    }));
  }, []);

  const handleRemoveExercise = useCallback((dayIdx: number, exIdx: number): void => {
    setState((prev) => ({
      ...prev,
      week: {
        ...prev.week,
        [dayIdx]: {
          ...prev.week[dayIdx],
          exercises: prev.week[dayIdx].exercises.filter((_, i) => i !== exIdx),
        },
      },
    }));
  }, []);

  const handleUpdateNote = useCallback((dayIdx: number, note: string): void => {
    setState((prev) => ({
      ...prev,
      week: { ...prev.week, [dayIdx]: { ...prev.week[dayIdx], note } },
    }));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;700;900&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        html, body { height: 100%; overflow: hidden; background: #060608; }
        input::placeholder, textarea::placeholder { color: #2a2a38; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,77,0,0.25); border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,77,0,0.07) 0%,transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.05) 0%,transparent 65%)" }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,77,0,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,77,0,0.018) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
      </div>

      {/* App shell */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          margin: "0 auto",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Mono',monospace",
          color: "#e8e8f0",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ fontSize: 8, letterSpacing: 4, color: "#ff4d00", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>
            ◆ FIT TRACKER
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div
              style={{
                fontFamily: "'Unbounded',sans-serif",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 1.1,
                color: "#fff",
              }}
            >
              Günaydın,{" "}
              <span style={{ background: "linear-gradient(90deg,#ff4d00,#ff8533)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Sporcu
              </span>{" "}
              ⚡
            </div>
            <div style={{ fontSize: 9, color: "#44445a", textAlign: "right", lineHeight: 1.7, fontFamily: "'DM Mono',monospace" }}>
              {new Date().toLocaleDateString("tr-TR", { weekday: "short" })}<br />
              {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 5, padding: "14px 20px 10px", flexShrink: 0 }}>
          <TabBtn id="weight" icon="⚖️" label="KİLO"  active={tab === "weight"} onClick={() => setTab("weight")} />
          <TabBtn id="water"  icon="💧" label="SU"    active={tab === "water"}  onClick={() => setTab("water")}  />
          <TabBtn id="plan"   icon="📅" label="PLAN"  active={tab === "plan"}   onClick={() => setTab("plan")}   />
        </div>

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 20px 28px",
            animation: "fadeUp .3s ease both",
          }}
        >
          {tab === "weight" && (
            <WeightTab
              entries={state.weights}
              targetWeight={state.targetWeight}
              onAdd={handleAddWeight}
              onRemove={handleRemoveWeight}
              onTargetChange={handleTargetChange}
            />
          )}
          {tab === "water" && (
            <WaterTab
              water={state.water}
              waterGoal={state.waterGoal}
              waterLog={state.waterLog}
              onAdd={handleAddWater}
              onGoalChange={handleWaterGoalChange}
            />
          )}
          {tab === "plan" && (
            <PlanTab
              week={state.week}
              onSetRest={handleSetRest}
              onAddExercise={handleAddExercise}
              onRemoveExercise={handleRemoveExercise}
              onUpdateNote={handleUpdateNote}
            />
          )}
        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </>
  );
}