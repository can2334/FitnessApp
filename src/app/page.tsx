"use client";
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { EXERCISES, WEEKLY_DATA, DAYS, Exercise } from "./data/exercises";
import { ExerciseFormModal } from "../components/ExerciseFormModal";
import { AIPlanModal } from "../components/AIPlanModal";

interface WeightEntry { date: string; w: number; }
interface Meal { id: number; name: string; cal: number; protein: number; time: string; }
interface DaySchedule { day_index: number; is_rest: boolean; workout_id: null; }
type ModalType = "meal" | "weight" | "ai" | "exercise" | null;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0c0c12", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,80,0,0.1)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 8, color: "#ff5000", cursor: "pointer", fontSize: 16, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FInput({ placeholder, value, onChange, type = "text" }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f0f0f0", fontSize: 13, outline: "none", fontFamily: "'DM Mono',monospace" }} />
  );
}

export default function FitnessApp() {
  const [tab, setTab] = useState("dashboard");
  const [timerOn, setTimerOn] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const restRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [filterMuscle, setFilterMuscle] = useState("Tümü");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [exWeights, setExWeights] = useState<Record<number, string>>({});
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const [weightLog, setWeightLog] = useState<WeightEntry[]>([
    { date: "01.03", w: 80.2 }, { date: "05.03", w: 79.8 },
    { date: "08.03", w: 79.5 }, { date: "10.03", w: 79.1 },
    { date: "12.03", w: 78.8 },
  ]);
  const [weightInput, setWeightInput] = useState("");
  const [targetWeight, setTargetWeight] = useState(75);

  const [water, setWater] = useState(1.25);
  const [isWorkoutDay, setIsWorkoutDay] = useState(true);
  const waterGoal = 3.0;
  const waterTarget = isWorkoutDay ? 1.0 : 3.0;

  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: "Yulaf Ezmesi", cal: 320, protein: 12, time: "08:30" },
    { id: 2, name: "Tavuk + Pirinç", cal: 540, protein: 45, time: "13:00" },
  ]);
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealProtein, setMealProtein] = useState("");

  const [weekSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_index: i, is_rest: i === 1 || i === 3 || i === 6, workout_id: null }))
  );
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [modal, setModal] = useState<ModalType>(null);

  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  useEffect(() => {
    if (restTimer > 0) restRef.current = setTimeout(() => setRestTimer(r => r - 1), 1000);
    return () => clearTimeout(restRef.current);
  }, [restTimer]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const totalMealCal = meals.reduce((a, m) => a + m.cal, 0);
  const burnedCal = Object.keys(done).reduce((acc, k) => {
    const ex = EXERCISES.find(e => e.id === parseInt(k.split("-")[0]));
    return acc + (ex ? ex.calories : 0);
  }, 0);
  const filtered = filterMuscle === "Tümü" ? EXERCISES : EXERCISES.filter(e => e.muscle === filterMuscle);
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].w : 0;
  const weightDiff = weightLog.length > 1
    ? parseFloat((weightLog[weightLog.length - 1].w - weightLog[0].w).toFixed(1))
    : 0;

  const toggleSet = (exId: number, idx: number, rest: number) => {
    const k = `${exId}-${idx}`;
    setDone(prev => {
      const n = { ...prev };
      if (n[k]) delete n[k]; else { n[k] = true; setRestTimer(rest); }
      return n;
    });
  };

  const addMeal = () => {
    if (!mealName || !mealCal) return;
    const now = new Date();
    setMeals(p => [...p, { id: Date.now(), name: mealName, cal: Number(mealCal), protein: Number(mealProtein || 0), time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` }]);
    setMealName(""); setMealCal(""); setMealProtein(""); setModal(null);
  };

  const addWeight = () => {
    if (!weightInput) return;
    const today = new Date();
    const label = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}`;
    setWeightLog(p => [...p, { date: label, w: parseFloat(weightInput) }]);
    setWeightInput(""); setModal(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070d; }
        input::placeholder { color: #3f3f46; }
        input:focus { border-color: rgba(255,80,0,0.5) !important; outline: none; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,80,0,0.3); border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .card-hover:hover { border-color: rgba(255,80,0,0.3) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07070d", fontFamily: "'Syne',sans-serif", color: "#f0f0f0", overflowX: "hidden" }}>
        {/* BG efektleri */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(255,80,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,80,0,0.02) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(255,80,0,0.08) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", paddingBottom: 100 }}>

          {/* HEADER */}
          <header style={{ padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#ff5000", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>◆ AI FITNESS TRACKER</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                Günaydın, <span style={{ background: "linear-gradient(135deg,#ff5000,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sporcu</span> ⚡
              </h1>
            </div>
            <button onClick={() => setModal("ai")} style={{ padding: "8px 14px", background: "linear-gradient(135deg,rgba(255,80,0,0.2),rgba(255,140,0,0.15))", border: "1px solid rgba(255,80,0,0.4)", borderRadius: 10, color: "#ff8c00", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
              🤖 AI Program
            </button>
          </header>

          {/* REST TIMER */}
          {restTimer > 0 && (
            <div style={{ margin: "0 20px 12px", padding: "10px 18px", background: "rgba(255,80,0,0.08)", border: "1px solid rgba(255,80,0,0.35)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: "#ff5000", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>⏱ Dinlenme</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ff8c00", fontFamily: "'DM Mono',monospace" }}>{fmt(restTimer)}</span>
            </div>
          )}

          {/* SU UYARISI */}
          {isWorkoutDay && water < waterTarget && (
            <div style={{ margin: "0 20px 12px", padding: "10px 18px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>Spor günü minimum 1L su!</div>
                <div style={{ fontSize: 10, color: "#38bdf866", fontFamily: "'DM Mono',monospace" }}>{water.toFixed(1)}L içtin — {(waterTarget - water).toFixed(1)}L daha iç</div>
              </div>
            </div>
          )}

          {/* TABS */}
          <div style={{ display: "flex", margin: "8px 20px 16px", gap: 3, background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: 12 }}>
            {[{ id: "dashboard", label: "🏠 Ana" }, { id: "workout", label: "💪 Antrenman" }, { id: "weight", label: "⚖️ Kilo" }, { id: "stats", label: "📊 İstatistik" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 4px", border: "none", cursor: "pointer", borderRadius: 9, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: tab === t.id ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "transparent", color: tab === t.id ? "#fff" : "#444", boxShadow: tab === t.id ? "0 4px 14px rgba(255,80,0,0.28)" : "none" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════ DASHBOARD ══════ */}
          {tab === "dashboard" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Stat kartları */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { label: "KALORİ", val: totalMealCal, unit: "kcal", max: 2500, color: "#fb923c", dec: 0, action: undefined as (() => void) | undefined },
                  { label: "SU", val: water, unit: "L", max: 3, color: "#38bdf8", dec: 1, action: undefined as (() => void) | undefined },
                  { label: "YAKILAN", val: burnedCal, unit: "kcal", max: 600, color: "#f43f5e", dec: 0, action: undefined as (() => void) | undefined },
                  { label: "KİLO", val: currentWeight, unit: "kg", max: 120, color: "#4ade80", dec: 1, action: (() => setModal("weight")) as (() => void) | undefined },
                ] as { label: string; val: number; unit: string; max: number; color: string; dec: number; action?: () => void }[]).map((s, i) => {
                  const r = 20; const circ = 2 * Math.PI * r;
                  const prog = Math.min(s.val / s.max, 1) * circ;
                  return (
                    <div key={i} className="card-hover" onClick={s.action} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 16px", cursor: s.action ? "pointer" : "default", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
                      <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: s.color, opacity: 0.07, filter: "blur(16px)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: 8, color: "#3f3f46", letterSpacing: 2.5, fontFamily: "'DM Mono',monospace", marginBottom: 5, textTransform: "uppercase" }}>{s.label}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>{s.dec ? s.val.toFixed(s.dec) : s.val}</span>
                            <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{s.unit}</span>
                          </div>
                        </div>
                        <svg width={50} height={50} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                          <circle cx={25} cy={25} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                          <circle cx={25} cy={25} r={r} fill="none" stroke={s.color} strokeWidth={4} strokeDasharray={`${prog} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
                        </svg>
                      </div>
                      {s.action && <div style={{ fontSize: 8, color: "#2d2d2d", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>GÜNCELLE ↗</div>}
                    </div>
                  );
                })}
              </div>

              {/* Timer */}
              <div style={{ background: "rgba(255,80,0,0.05)", border: "1px solid rgba(255,80,0,0.15)", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#ff5000", fontFamily: "'DM Mono',monospace", marginBottom: 8, textTransform: "uppercase" }}>ANTRENMAN SÜRESİ</div>
                <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, marginBottom: 14, fontVariantNumeric: "tabular-nums", fontFamily: "'DM Mono',monospace" }}>{fmt(timerSec)}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={() => setTimerOn(a => !a)} style={{ padding: "10px 24px", border: timerOn ? "1px solid rgba(255,80,0,0.4)" : "none", cursor: "pointer", borderRadius: 50, fontSize: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, background: timerOn ? "rgba(255,80,0,0.15)" : "linear-gradient(135deg,#ff5000,#ff8c00)", color: "#fff", boxShadow: timerOn ? "none" : "0 4px 16px rgba(255,80,0,0.3)", transition: "all 0.2s" }}>
                    {timerOn ? "⏸ Durdur" : "▶ Başlat"}
                  </button>
                  <button onClick={() => { setTimerSec(0); setTimerOn(false); }} style={{ padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", borderRadius: 50, fontSize: 12, fontFamily: "'Syne',sans-serif", background: "transparent", color: "#555" }}>↺</button>
                </div>
              </div>

              {/* Hafta barı */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "8px 10px", display: "flex", gap: 3 }}>
                {DAYS.map((d, i) => {
                  const s = weekSchedule.find(x => x.day_index === i);
                  const isActive = activeDay === i;
                  return (
                    <button key={i} onClick={() => setActiveDay(i)} style={{ flex: 1, padding: "8px 2px", borderRadius: 8, border: "none", cursor: "pointer", background: isActive ? "rgba(255,80,0,0.14)" : "transparent", outline: isActive ? "1px solid rgba(255,80,0,0.3)" : "none", color: isActive ? "#ff8c00" : s?.is_rest ? "#2d2d2d" : "#555", fontSize: 10, fontWeight: isActive ? 700 : 400, fontFamily: "'Syne',sans-serif", transition: "all 0.15s", textAlign: "center" }}>
                      <div>{d}</div>
                      <div style={{ fontSize: 7, marginTop: 2, color: isActive ? "#ff500066" : "#2d2d2d", fontFamily: "'DM Mono',monospace" }}>{s?.is_rest ? "OFF" : "●"}</div>
                    </button>
                  );
                })}
              </div>

              {/* Su Takibi */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${water < waterTarget && isWorkoutDay ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: 18, transition: "border-color 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700 }}>💧 Su Takibi</h2>
                  <button onClick={() => setIsWorkoutDay(w => !w)} style={{ padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", background: isWorkoutDay ? "rgba(255,80,0,0.15)" : "rgba(255,255,255,0.06)", color: isWorkoutDay ? "#ff8c00" : "#555" }}>
                    {isWorkoutDay ? "🏋️ Spor Günü" : "🛋️ Dinlenme"}
                  </button>
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#38bdf8", letterSpacing: -1, fontFamily: "'DM Mono',monospace" }}>{water.toFixed(1)}L</span>
                <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", margin: "12px 0" }}>
                  <div style={{ height: "100%", width: `${Math.min((water / waterGoal) * 100, 100)}%`, background: water >= waterGoal ? "#4ade80" : "#38bdf8", borderRadius: 3, transition: "all 0.5s ease" }} />
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {[0.25, 0.25, 0.5, 0.5, 1.0].map((amt, i) => (
                    <button key={i} onClick={() => setWater(w => parseFloat(Math.min(w + amt, 5).toFixed(2)))} style={{ flex: 1, height: 32, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 7, color: "#38bdf8", fontWeight: 800, fontSize: 9, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                      +{amt >= 1 ? "1L" : `${amt * 1000}ml`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beslenme */}
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700 }}>🍽️ Beslenme</h2>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#fb923c", fontFamily: "'DM Mono',monospace" }}>{totalMealCal} kcal</span>
                    <button onClick={() => setModal("meal")} style={{ padding: "4px 10px", background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 7, color: "#fb923c", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+ Ekle</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {meals.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</p>
                        <p style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{m.time}{m.protein > 0 && ` · ${m.protein}g protein`}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#fb923c", fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{m.cal}</span>
                        <button onClick={() => setMeals(p => p.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", fontSize: 16 }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((totalMealCal / 2500) * 100, 100)}%`, background: "linear-gradient(90deg,#fb923c,#f43f5e)", borderRadius: 2, transition: "width 0.7s" }} />
                </div>
                <p style={{ fontSize: 8, color: "#3f3f46", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{totalMealCal} / 2500 kcal</p>
              </div>
            </div>
          )}

          {/* ══════ ANTRENMAN ══════ */}
          {tab === "workout" && (
            <div className="fade-up" style={{ padding: "0 20px" }}>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 14, scrollbarWidth: "none" }}>
                {["Tümü", "Bacak", "Göğüs", "Sırt", "Omuz", "Core", "Bicep", "Tricep"].map(g => (
                  <button key={g} onClick={() => setFilterMuscle(g)} style={{ padding: "6px 13px", border: "none", cursor: "pointer", borderRadius: 50, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.2s", background: filterMuscle === g ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.05)", color: filterMuscle === g ? "#fff" : "#555", boxShadow: filterMuscle === g ? "0 4px 12px rgba(255,80,0,0.28)" : "none" }}>
                    {g}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(ex => {
                  const doneCount = Array.from({ length: ex.sets }, (_, i) => done[`${ex.id}-${i}`]).filter(Boolean).length;
                  const allDone = doneCount === ex.sets;
                  const isExp = expanded === ex.id;
                  const diffColor = ex.difficulty === "başlangıç" ? "#4ade80" : ex.difficulty === "orta" ? "#ff8c00" : "#f43f5e";
                  return (
                    <div key={ex.id} style={{ background: allDone ? "rgba(255,80,0,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${allDone ? "rgba(255,80,0,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s" }}>
                      <div onClick={() => setExpanded(isExp ? null : ex.id)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: allDone ? "rgba(255,80,0,0.18)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                          {allDone ? "✅" : ex.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: allDone ? "#ff8c00" : "#f0f0f0", marginBottom: 2 }}>{ex.name}</div>
                          <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>
                            {ex.muscle} · {ex.sets}×{ex.reps} · {ex.rest}sn
                          </div>
                          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                            {ex.muscleNames.primary.map(m => (
                              <span key={m} style={{ fontSize: 8, padding: "1px 6px", background: "rgba(255,80,0,0.12)", color: "#ff8c00", borderRadius: 10, fontFamily: "'DM Mono',monospace" }}>{m}</span>
                            ))}
                            <span style={{ fontSize: 8, padding: "1px 6px", background: `rgba(0,0,0,0.3)`, color: diffColor, borderRadius: 10, fontFamily: "'DM Mono',monospace", border: `1px solid ${diffColor}44` }}>
                              {ex.difficulty}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#ff5000" : "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{doneCount}/{ex.sets}</div>
                          <button onClick={e => { e.stopPropagation(); setSelectedEx(ex); setModal("exercise"); }} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,80,0,0.1)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 6, color: "#ff8c00", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                            Form 📋
                          </button>
                        </div>
                      </div>

                      <div style={{ height: 2, background: "rgba(255,255,255,0.04)", margin: "0 16px" }}>
                        <div style={{ height: "100%", background: "linear-gradient(90deg,#ff5000,#ff8c00)", width: `${(doneCount / ex.sets) * 100}%`, transition: "width 0.4s ease" }} />
                      </div>

                      {isExp && (
                        <div style={{ padding: "14px 16px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 9, letterSpacing: 1, color: "#3f3f46", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>Ağırlık (kg)</span>
                            <input type="number" value={exWeights[ex.id] ?? ""} onChange={(e) => setExWeights(w => ({ ...w, [ex.id]: e.target.value }))} placeholder="0" style={{ width: 64, padding: "6px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f0f0f0", fontSize: 13, fontFamily: "'DM Mono',monospace", outline: "none", textAlign: "center" }} />
                            <span style={{ fontSize: 9, color: "#2d2d2d", fontFamily: "'DM Mono',monospace" }}>~{ex.calories} kcal/set</span>
                          </div>
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            {Array.from({ length: ex.sets }, (_, i) => {
                              const isDone = done[`${ex.id}-${i}`];
                              return (
                                <button key={i} onClick={() => toggleSet(ex.id, i, ex.rest)} style={{ padding: "9px 14px", border: "none", cursor: "pointer", borderRadius: 8, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: isDone ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.06)", color: isDone ? "#fff" : "#444", transform: isDone ? "scale(1.05)" : "scale(1)" }}>
                                  SET {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════ KİLO ══════ */}
          {tab === "weight" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "MEVCUT", val: `${currentWeight}`, color: "#4ade80" },
                  { label: "HEDEF", val: `${targetWeight}`, color: "#ff8c00" },
                  { label: "FARK", val: weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`, color: weightDiff < 0 ? "#4ade80" : "#f43f5e" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, letterSpacing: 2, color: "#3f3f46", fontFamily: "'DM Mono',monospace", marginBottom: 6, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -1, fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>kg</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700 }}>📈 Kilo Grafiği</h2>
                  <button onClick={() => setModal("weight")} style={{ padding: "5px 12px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, color: "#4ade80", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+ Giriş</button>
                </div>
                {weightLog.length > 1 && (() => {
                  const W = 280, H = 100;
                  const minW = Math.min(...weightLog.map(e => e.w)) - 1;
                  const maxW = Math.max(...weightLog.map(e => e.w)) + 1;
                  const pts = weightLog.map((e, i) => ({ x: (i / (weightLog.length - 1)) * W, y: H - ((e.w - minW) / (maxW - minW)) * H, ...e }));
                  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;
                  const targetY = H - ((targetWeight - minW) / (maxW - minW)) * H;
                  return (
                    <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {targetY > 0 && targetY < H && (
                        <>
                          <line x1={0} y1={targetY} x2={W} y2={targetY} stroke="#ff8c00" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                          <text x={W - 2} y={targetY - 3} textAnchor="end" fill="#ff8c00" fontSize="7" fontFamily="monospace">Hedef</text>
                        </>
                      )}
                      <path d={areaD} fill="url(#wg)" />
                      <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r={4} fill="#4ade80" />
                          <text x={p.x} y={H + 14} textAnchor="middle" fill="#3f3f46" fontSize="7" fontFamily="monospace">{p.date}</text>
                          <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#4ade80" fontSize="7" fontFamily="monospace">{p.w}</text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>

              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎯 Hedef Kilo</h2>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="number" value={targetWeight} onChange={e => setTargetWeight(parseFloat(e.target.value))} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0f0f0", fontSize: 16, fontFamily: "'DM Mono',monospace", outline: "none", fontWeight: 700 }} />
                  <span style={{ fontSize: 13, color: "#555", fontFamily: "'DM Mono',monospace" }}>kg</span>
                  <div style={{ fontSize: 12, color: currentWeight > targetWeight ? "#f43f5e" : "#4ade80", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                    {currentWeight > targetWeight ? `▼ ${(currentWeight - targetWeight).toFixed(1)}kg` : `✓ ${(targetWeight - currentWeight).toFixed(1)}kg kaldı`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════ İSTATİSTİK ══════ */}
          {tab === "stats" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 90, marginBottom: 12 }}>
                  {WEEKLY_DATA.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: d.vol > 0 ? "linear-gradient(180deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.04)", height: `${d.vol}%`, transition: "height 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 8, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{d.day}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: "#2d2d2d", textAlign: "center", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: 2 }}>Haftalık Yoğunluk</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { emoji: "📅", val: "5", unit: "antrenman", label: "Bu Hafta" },
                  { emoji: "⏱️", val: fmt(timerSec), unit: "aktif süre", label: "Bugün" },
                  { emoji: "🔥", val: String(burnedCal), unit: "kcal yakıldı", label: "Antrenman" },
                  { emoji: "💧", val: `${water.toFixed(1)}L`, unit: "su", label: "Bugün" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 14px" }}>
                    <div style={{ fontSize: 18, marginBottom: 7 }}>{s.emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 2, fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                    <div style={{ fontSize: 8, color: "#3f3f46", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace" }}>{s.unit}</div>
                    <div style={{ fontSize: 9, color: "#ff5000", marginTop: 3, fontFamily: "'DM Mono',monospace" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 520, background: "rgba(7,7,13,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 20px 16px", display: "flex", justifyContent: "space-around", zIndex: 100 }}>
          {[{ id: "dashboard", e: "🏠", l: "Ana" }, { id: "workout", e: "💪", l: "Antrenman" }, { id: "weight", e: "⚖️", l: "Kilo" }, { id: "stats", e: "📊", l: "İstatistik" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "3px 14px" }}>
              <span style={{ fontSize: 18, transition: "transform 0.2s", transform: tab === t.id ? "scale(1.25)" : "scale(1)", display: "block" }}>{t.e}</span>
              <span style={{ fontSize: 8, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: tab === t.id ? "#ff5000" : "#2d2d2d", fontWeight: tab === t.id ? 700 : 400 }}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MODALLER */}
      {modal === "exercise" && selectedEx && (
        <ExerciseFormModal exercise={selectedEx} onClose={() => setModal(null)} />
      )}

      {modal === "ai" && (
        <AIPlanModal onClose={() => setModal(null)} />
      )}

      {modal === "meal" && (
        <Modal title="🍽️ Öğün Ekle" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FInput placeholder="Öğün adı" value={mealName} onChange={e => setMealName(e.target.value)} />
            <FInput placeholder="Kalori (kcal)" value={mealCal} onChange={e => setMealCal(e.target.value)} type="number" />
            <FInput placeholder="Protein (g) — opsiyonel" value={mealProtein} onChange={e => setMealProtein(e.target.value)} type="number" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
              <button onClick={() => setModal(null)} style={{ padding: "9px 18px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, color: "#f43f5e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>İptal</button>
              <button onClick={addMeal} disabled={!mealName || !mealCal} style={{ padding: "9px 18px", background: "rgba(255,80,0,0.15)", border: "1px solid rgba(255,80,0,0.3)", borderRadius: 10, color: "#ff8c00", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace", opacity: (!mealName || !mealCal) ? 0.4 : 1 }}>Ekle</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "weight" && (
        <Modal title="⚖️ Kilo Girişi" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono',monospace" }}>Mevcut: <strong style={{ color: "#f0f0f0" }}>{currentWeight} kg</strong></p>
            <FInput placeholder="Yeni kilo (örn: 78.5)" value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
              <button onClick={() => setModal(null)} style={{ padding: "9px 18px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, color: "#f43f5e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>İptal</button>
              <button onClick={addWeight} disabled={!weightInput} style={{ padding: "9px 18px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, color: "#4ade80", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace", opacity: !weightInput ? 0.4 : 1 }}>Kaydet</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}