"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { WeightTab } from "./components/WeightTab";
import { WaterTab }  from "./components/WaterTab";
import { PlanTab }   from "./components/PlanTab";
import {
  mealsApi, statsApi, scheduleApi, workoutsApi,
  MealRow, StatRow, ScheduleEntry,
} from "../lib/api";
import { TabId, WeekPlan } from "./types";

function fmtDate(d = new Date()): string {
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmtTime(d = new Date()): string {
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function scheduleToWeekPlan(schedule: ScheduleEntry[]): WeekPlan {
  const week: WeekPlan = {};
  for (let i = 0; i < 7; i++) {
    const entry = schedule.find((s) => s.day_index === i);
    week[i] = {
      isRest:    entry ? entry.is_rest_day === 1 : i===1||i===3||i===6,
      exercises: entry?.workout?.exercises ?? [],
      note:      entry?.workout?.note      ?? "",
    };
  }
  return week;
}

function Toast({ message, visible }: { message: string; visible: boolean }): React.ReactElement {
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%",
      transform:`translateX(-50%) translateY(${visible?0:80}px)`,
      background:"#111118", border:"1px solid #2a2a38", borderRadius:12,
      padding:"10px 22px", fontSize:12, fontFamily:"'DM Mono',monospace",
      fontWeight:600, color:"#e8e8f0", zIndex:999,
      transition:"transform .3s cubic-bezier(.4,0,.2,1)", pointerEvents:"none",
      whiteSpace:"nowrap",
    }}>
      {message}
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }: { icon:string; label:string; active:boolean; onClick:()=>void }): React.ReactElement {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"10px 4px",
      border: active?"1px solid rgba(255,77,0,0.5)":"1px solid #1e1e28",
      borderRadius:12, cursor:"pointer",
      fontFamily:"'Unbounded',sans-serif", fontSize:7.5, fontWeight:700,
      transition:"all .2s",
      background: active
        ? "linear-gradient(145deg,rgba(255,77,0,0.2),rgba(255,133,51,0.12))"
        : "#0d0d12",
      color: active?"#ff8533":"#44445a",
      display:"flex", flexDirection:"column", alignItems:"center", gap:5,
    }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      {label}
    </button>
  );
}

function LoadingScreen(): React.ReactElement {
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"#060608", color:"#44445a", fontFamily:"'DM Mono',monospace", fontSize:12 }}>
      <div style={{ width:40, height:40, border:"2px solid #1e1e28", borderTop:"2px solid #ff4d00", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      Yükleniyor...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

export default function FitnessTrackerPage(): React.ReactElement {
  const [tab, setTab]         = useState<TabId>("weight");
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState<{ msg:string; visible:boolean }>({ msg:"", visible:false });

  const [weightRows, setWeightRows]     = useState<StatRow[]>([]);
  const [targetWeight, setTargetWeight] = useState<number>(75);
  const [water, setWater]               = useState<number>(0);
  const [waterGoal, setWaterGoal]       = useState<number>(2.5);
  const [waterLog, setWaterLog]         = useState<{ time:string; amt:number }[]>([]);
  const [week, setWeek]                 = useState<WeekPlan>({});

  const waterDebounce     = useRef<ReturnType<typeof setTimeout>|null>(null);
  const waterGoalDebounce = useRef<ReturnType<typeof setTimeout>|null>(null);
  const noteDebounce      = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((msg: string): void => {
    setToast({ msg, visible:true });
    setTimeout(() => setToast((t) => ({ ...t, visible:false })), 2200);
  }, []);

  useEffect(() => {
    async function loadAll(): Promise<void> {
      try {
        const [summary, weightHistory, schedule] = await Promise.all([
          statsApi.getSummary(),
          statsApi.getHistory("weight"),
          scheduleApi.getAll(),
        ]);
        setWeightRows(weightHistory);
        if (summary.target_weight) setTargetWeight(summary.target_weight.value);
        if (summary.water)         setWater(summary.water.value);
        if (summary.water_goal)    setWaterGoal(summary.water_goal.value);
        setWeek(scheduleToWeekPlan(schedule));
      } catch (err) {
        console.error(err);
        showToast("⚠️ Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [showToast]);

  const handleAddWeight = useCallback(async (val: number): Promise<void> => {
    try {
      const stat = await statsApi.addWeight(val);
      setWeightRows((prev) => [...prev, stat]);
      showToast("✅ Kilo kaydedildi!");
    } catch { showToast("❌ Kilo kaydedilemedi"); }
  }, [showToast]);

  const handleRemoveWeight = useCallback(async (idx: number): Promise<void> => {
    const row = weightRows[idx];
    if (!row) return;
    try {
      await statsApi.deleteWeight(row.id);
      setWeightRows((prev) => prev.filter((_, i) => i !== idx));
    } catch { showToast("❌ Silinemedi"); }
  }, [weightRows, showToast]);

  const handleTargetChange = useCallback((delta: number): void => {
    setTargetWeight((prev) => {
      const next = Math.max(30, Math.round((prev+delta)*10)/10);
      statsApi.setTargetWeight(next).catch(console.error);
      return next;
    });
  }, []);

  const handleAddWater = useCallback((amt: number): void => {
    setWater((prev) => {
      const next = Math.max(0, Math.round((prev+amt)*100)/100);
      if (amt > 0) setWaterLog((l) => [...l, { time:fmtTime(), amt }]);
      else         setWaterLog((l) => l.slice(0,-1));
      if (waterDebounce.current) clearTimeout(waterDebounce.current);
      waterDebounce.current = setTimeout(() => statsApi.setWater(next).catch(console.error), 600);
      if (next >= waterGoal && prev < waterGoal)
        setTimeout(() => showToast("🎉 Günlük su hedefine ulaştın!"), 50);
      return next;
    });
  }, [waterGoal, showToast]);

  const handleWaterGoalChange = useCallback((delta: number): void => {
    setWaterGoal((prev) => {
      const next = Math.max(0.5, Math.round((prev+delta)*100)/100);
      if (waterGoalDebounce.current) clearTimeout(waterGoalDebounce.current);
      waterGoalDebounce.current = setTimeout(() => statsApi.setWaterGoal(next).catch(console.error), 600);
      return next;
    });
  }, []);

  const handleSetRest = useCallback(async (dayIdx: number, isRest: boolean): Promise<void> => {
    setWeek((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], isRest } }));
    try { await scheduleApi.setRest(dayIdx, isRest); }
    catch { showToast("❌ Kaydedilemedi"); }
  }, [showToast]);

  const handleAddExercise = useCallback(async (dayIdx: number, name: string): Promise<void> => {
    const updated = [...(week[dayIdx]?.exercises??[]), name];
    setWeek((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], exercises:updated } }));
    try { await workoutsApi.saveDay(dayIdx, updated, week[dayIdx]?.note??""); }
    catch { showToast("❌ Egzersiz kaydedilemedi"); }
  }, [week, showToast]);

  const handleRemoveExercise = useCallback(async (dayIdx: number, exIdx: number): Promise<void> => {
    const updated = week[dayIdx].exercises.filter((_, i) => i !== exIdx);
    setWeek((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], exercises:updated } }));
    try { await workoutsApi.saveDay(dayIdx, updated, week[dayIdx]?.note??""); }
    catch { showToast("❌ Silinemedi"); }
  }, [week, showToast]);

  const handleUpdateNote = useCallback((dayIdx: number, note: string): void => {
    setWeek((prev) => ({ ...prev, [dayIdx]: { ...prev[dayIdx], note } }));
    const ex = noteDebounce.current.get(dayIdx);
    if (ex) clearTimeout(ex);
    noteDebounce.current.set(dayIdx, setTimeout(() => {
      workoutsApi.saveDay(dayIdx, week[dayIdx]?.exercises??[], note).catch(console.error);
    }, 800));
  }, [week]);

  const weightEntries = weightRows.map((r) => ({ date:fmtDate(new Date(r.date)), w:r.value }));

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;700;900&family=DM+Mono:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html,body{height:100%;overflow:hidden;background:#060608;}
        input::placeholder,textarea::placeholder{color:#2a2a38;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,77,0,0.25);border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:-120, right:-120, width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,77,0,0.07) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:0, left:-80, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(56,189,248,0.05) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,77,0,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,77,0,0.018) 1px,transparent 1px)", backgroundSize:"44px 44px" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'DM Mono',monospace", color:"#e8e8f0" }}>
        <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
          <div style={{ fontSize:8, letterSpacing:4, color:"#ff4d00", marginBottom:4 }}>◆ FIT TRACKER</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div style={{ fontFamily:"'Unbounded',sans-serif", fontSize:22, fontWeight:800, letterSpacing:-1, color:"#fff" }}>
              Günaydın,{" "}
              <span style={{ background:"linear-gradient(90deg,#ff4d00,#ff8533)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Sporcu</span> ⚡
            </div>
            <div style={{ fontSize:9, color:"#44445a", textAlign:"right", lineHeight:1.7 }}>
              {new Date().toLocaleDateString("tr-TR",{weekday:"short"})}<br/>
              {new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"short"})}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:5, padding:"14px 20px 10px", flexShrink:0 }}>
          <TabBtn icon="⚖️" label="KİLO"  active={tab==="weight"} onClick={()=>setTab("weight")} />
          <TabBtn icon="💧" label="SU"    active={tab==="water"}  onClick={()=>setTab("water")}  />
          <TabBtn icon="📅" label="PLAN"  active={tab==="plan"}   onClick={()=>setTab("plan")}   />
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"4px 20px 28px", animation:"fadeUp .3s ease both" }}>
          {tab==="weight" && <WeightTab entries={weightEntries} targetWeight={targetWeight} onAdd={handleAddWeight} onRemove={handleRemoveWeight} onTargetChange={handleTargetChange} />}
          {tab==="water"  && <WaterTab  water={water} waterGoal={waterGoal} waterLog={waterLog} onAdd={handleAddWater} onGoalChange={handleWaterGoalChange} />}
          {tab==="plan"   && <PlanTab   week={week} onSetRest={handleSetRest} onAddExercise={handleAddExercise} onRemoveExercise={handleRemoveExercise} onUpdateNote={handleUpdateNote} />}
        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </>
  );
}
