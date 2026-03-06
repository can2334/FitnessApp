"use client";
import { useState, useEffect, useTransition } from "react";
import { Activity, Droplets, Utensils, TrendingUp, Flame, Zap, Plus, Trash2, X, Scale, Calendar, ChevronDown } from "lucide-react";
import {
  getDashboardData, addMeal, deleteMeal,
  updateWater, updateWeight,
  createWorkout, updateDaySchedule
} from "./actions";

// ─── YARDIMCI BİLEŞENLER ─────────────────────────────────────────────────────
const useCountUp = (target: number, duration = 1200): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

const RadialProgress = ({ value, max, color, size = 56 }: { value: number; max: number; color: string; size?: number }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(value / max, 1) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
    </svg>
  );
};

// Modal wrapper
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
  }}>
    <div style={{
      background: "#111318", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20, padding: 28, width: "100%", maxWidth: 480,
      maxHeight: "90vh", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ placeholder, value, onChange, type = "text" }: any) => (
  <input
    type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{
      width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
      color: "#f0f0f0", fontSize: 13, outline: "none", fontFamily: "inherit"
    }}
  />
);

const Btn = ({ onClick, children, color = "#4ade80", disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "10px 20px", background: color === "red" ? "rgba(244,63,94,0.15)" : `rgba(${color === "#4ade80" ? "74,222,128" : "56,189,248"},0.15)`,
    border: `1px solid ${color === "red" ? "rgba(244,63,94,0.3)" : `${color}44`}`,
    borderRadius: 10, color: color === "red" ? "#f43f5e" : color,
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    opacity: disabled ? 0.5 : 1, transition: "all 0.2s"
  }}>{children}</button>
);

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [water, setWater] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Modaller
  const [modal, setModal] = useState<"meal" | "workout" | "weight" | "schedule" | null>(null);

  // Öğün formu
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealProtein, setMealProtein] = useState("");

  // Kilo formu
  const [weightVal, setWeightVal] = useState("");

  // Antrenman formu
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [exercises, setExercises] = useState([{ name: "", sets: "", reps: "" }]);

  const fetchData = async () => {
    const d = await getDashboardData();
    setData(d);
    const totalWater = d.stats.filter((s: any) => s.type === "water").reduce((a: number, c: any) => a + c.value, 0);
    setWater(parseFloat(totalWater.toFixed(2)));
  };

  useEffect(() => { fetchData(); }, []);

  const totalKcal = data?.meals?.reduce((a: number, m: any) => a + m.calories, 0) || 0;
  const calories = useCountUp(totalKcal);
  const currentWeight = data?.latestWeight || 0;
  const weightDisplay = useCountUp(Math.round(currentWeight * 10));

  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const selectedDaySchedule = data?.weeklySchedule?.find((s: any) => s.day_index === activeDay);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleAddMeal = () => {
    if (!mealName || !mealCal) return;
    startTransition(async () => {
      await addMeal(mealName, Number(mealCal), Number(mealProtein || 0));
      setMealName(""); setMealCal(""); setMealProtein("");
      setModal(null); fetchData();
    });
  };

  const handleDeleteMeal = (id: number) => {
    startTransition(async () => { await deleteMeal(id); fetchData(); });
  };

  const handleWater = (amt: number) => {
    startTransition(async () => {
      setWater(w => parseFloat((w + amt).toFixed(2)));
      await updateWater(amt);
    });
  };

  const handleWeight = () => {
    if (!weightVal) return;
    startTransition(async () => {
      await updateWeight(Number(weightVal));
      setWeightVal(""); setModal(null); fetchData();
    });
  };

  const handleCreateWorkout = () => {
    if (!workoutTitle) return;
    const validEx = exercises.filter(e => e.name).map(e => ({ name: e.name, sets: Number(e.sets) || 3, reps: Number(e.reps) || 10 }));
    startTransition(async () => {
      await createWorkout(workoutTitle, validEx);
      setWorkoutTitle(""); setExercises([{ name: "", sets: "", reps: "" }]);
      setModal(null); fetchData();
    });
  };

  const handleScheduleChange = (dayIndex: number, workoutId: number | null, isRest: boolean) => {
    startTransition(async () => {
      await updateDaySchedule(dayIndex, workoutId, isRest);
      fetchData();
    });
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0f; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card { animation: fadeUp 0.5s ease both; }
        input::placeholder { color: #52525b; }
        input:focus { border-color: rgba(74,222,128,0.4) !important; }
        .del-btn:hover { opacity: 1 !important; }
        .day-pill:hover { background: rgba(255,255,255,0.06) !important; }
        .water-btn:hover { transform: scale(1.05); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#080a0f", fontFamily: "'Syne', sans-serif", color: "#f0f0f0", padding: "24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#4ade80", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>◆ FITNESS TRACKER</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
                Günaydın, <span style={{ background: "linear-gradient(135deg,#4ade80,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Can</span> 👋
              </h1>
              <p style={{ color: "#3f3f46", fontSize: 12, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                {data?.todayIsRest ? "🛋️ Bugün dinlenme günü" : data?.currentWorkout ? `Bugün: ${data.currentWorkout.title}` : "Program atanmamış"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => setModal("schedule")} color="#a78bfa">
                <Calendar size={14} style={{ display: "inline", marginRight: 6 }} />Program Düzenle
              </Btn>
              <Btn onClick={() => setModal("workout")}>
                <Plus size={14} style={{ display: "inline", marginRight: 6 }} />Antrenman Ekle
              </Btn>
            </div>
          </header>

          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { icon: <Flame size={16} />, label: "KALORİ", value: calories, unit: "kcal", color: "#fb923c", max: 2500, radial: true },
              { icon: <Droplets size={16} />, label: "SU", value: water.toFixed(1), unit: "L", color: "#38bdf8", max: 3, radial: true },
              { icon: <Zap size={16} />, label: "ANTRENMAN", value: data?.todayIsRest ? "Off" : (data?.currentWorkout?.title?.split(" ")[0] || "—"), unit: "", color: "#f43f5e" },
              {
                icon: <Scale size={16} />, label: "KİLO", value: currentWeight ? `${(weightDisplay / 10).toFixed(1)}` : "—", unit: "kg", color: "#4ade80",
                action: () => setModal("weight")
              },
            ].map((s, i) => (
              <div key={i} className="card" onClick={s.action} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18, padding: "18px", cursor: s.action ? "pointer" : "default",
                transition: "border-color 0.2s", position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: -16, right: -16, width: 60, height: 60, borderRadius: "50%", background: s.color, opacity: 0.07, filter: "blur(16px)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ fontSize: 9, color: "#3f3f46", letterSpacing: 2, fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>{s.label}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>{s.value}</span>
                      <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{s.unit}</span>
                    </div>
                  </div>
                  {s.radial && <RadialProgress value={parseFloat(String(s.value))} max={s.max!} color={s.color} />}
                </div>
                {s.action && <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>GÜNCELLE ↗</div>}
              </div>
            ))}
          </div>

          {/* HAFTA BARI */}
          <div className="card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 6 }}>
            {days.map((d, i) => {
              const dayData = data?.weeklySchedule?.find((s: any) => s.day_index === i);
              const isRest = dayData?.is_rest_day === 1;
              const isActive = activeDay === i;
              return (
                <button key={i} className="day-pill" onClick={() => setActiveDay(i)} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: isActive ? "rgba(74,222,128,0.12)" : "transparent",
                  outline: isActive ? "1px solid rgba(74,222,128,0.25)" : "none",
                  color: isActive ? "#4ade80" : isRest ? "#3f3f46" : "#71717a",
                  fontSize: 12, fontWeight: isActive ? 700 : 400, fontFamily: "'Syne',sans-serif",
                  transition: "all 0.15s", textAlign: "center"
                }}>
                  <div>{d}</div>
                  <div style={{ fontSize: 8, marginTop: 3, color: isActive ? "#4ade8099" : "#2d2d2d", fontFamily: "'DM Mono',monospace" }}>
                    {isRest ? "OFF" : (dayData?.title?.split(" ")[0] || "—")}
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

            {/* BESLENME */}
            <div className="card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
                  <Utensils size={14} color="#fb923c" /> Beslenme
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#fb923c", fontFamily: "'DM Mono',monospace" }}>{totalKcal} kcal</span>
                  <button onClick={() => setModal("meal")} style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 8, padding: "4px 10px", color: "#fb923c", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>+ Ekle</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 280, overflowY: "auto" }}>
                {data?.meals?.length === 0 && <p style={{ color: "#3f3f46", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Henüz öğün eklenmedi</p>}
                {data?.meals?.map((meal: any) => (
                  <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{meal.name}</p>
                      <p style={{ fontSize: 10, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>
                        {new Date(meal.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        {meal.protein > 0 && ` · ${meal.protein}g protein`}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#fb923c", fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{meal.calories}</span>
                      <button className="del-btn" onClick={() => handleDeleteMeal(meal.id)} style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", opacity: 0.5, transition: "opacity 0.2s" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kalori bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((totalKcal / 2500) * 100, 100)}%`, background: "linear-gradient(90deg,#fb923c,#f43f5e)", borderRadius: 2, transition: "width 0.8s ease" }} />
                </div>
                <p style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{totalKcal} / 2500 kcal</p>
              </div>
            </div>

            {/* ANTRENMAN */}
            <div className="card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
                  <Activity size={14} color="#f43f5e" />
                  {selectedDaySchedule?.is_rest_day ? "Dinlenme Günü 🛋️" : (selectedDaySchedule?.title || "Program Yok")}
                </h2>
                {selectedDaySchedule?.is_rest_day === 0 && selectedDaySchedule?.exercises?.length > 0 && (
                  <span style={{ fontSize: 10, padding: "3px 8px", background: "rgba(244,63,94,0.1)", color: "#f43f5e", borderRadius: 20, fontFamily: "'DM Mono',monospace" }}>
                    {selectedDaySchedule.exercises.length} HAREKET
                  </span>
                )}
              </div>

              {selectedDaySchedule?.is_rest_day === 1 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#3f3f46", fontSize: 12 }}>
                  <p>Bu gün dinlenme günü.</p>
                  <p style={{ fontSize: 10, marginTop: 6, fontFamily: "'DM Mono',monospace" }}>Programı düzenlemek için "Program Düzenle" butonunu kullan.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 280, overflowY: "auto" }}>
                  {(!selectedDaySchedule?.exercises || selectedDaySchedule.exercises.length === 0) && (
                    <p style={{ color: "#3f3f46", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Bu güne program atanmamış</p>
                  )}
                  {selectedDaySchedule?.exercises?.map((ex: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{ex.name}</span>
                      <span style={{ fontSize: 10, color: "#52525b", fontFamily: "'DM Mono',monospace" }}>{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SU TAKİBİ */}
            <div className="card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
                <Droplets size={14} color="#38bdf8" /> Su Takibi
              </h2>

              <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", letterSpacing: -0.5 }}>{water.toFixed(1)}L</span>
                  <span style={{ fontSize: 11, color: "#38bdf866", fontFamily: "'DM Mono',monospace" }}>/ 3.0L hedef</span>
                </div>
                {/* Progress */}
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${Math.min((water / 3) * 100, 100)}%`, background: "#38bdf8", borderRadius: 2, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0.25, 0.25, 0.5, 0.5, 1.0].map((amt, i) => (
                    <button key={i} className="water-btn" onClick={() => handleWater(amt)} style={{
                      flex: 1, height: 36, background: "#38bdf8", border: "none", borderRadius: 8,
                      color: "#000814", fontWeight: 800, fontSize: 10, cursor: "pointer",
                      fontFamily: "'DM Mono',monospace", transition: "transform 0.15s"
                    }}>+{amt >= 1 ? "1L" : `${amt * 1000}ml`}</button>
                  ))}
                </div>
              </div>

              {/* Su özeti */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>
                <span>Bugün içilen</span>
                <span style={{ color: water >= 3 ? "#4ade80" : "#38bdf8" }}>{water >= 3 ? "✓ Hedefe ulaşıldı!" : `${(3 - water).toFixed(1)}L kaldı`}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", fontSize: 10, color: "#2d2d2d", fontFamily: "'DM Mono',monospace", gap: 6, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            Senkronize {isPending && "· kaydediliyor..."}
          </div>
        </div>
      </main>

      {/* ─── MODAL: ÖĞÜN EKLE ─── */}
      {modal === "meal" && (
        <Modal title="Öğün Ekle" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input placeholder="Öğün adı (ör: Yulaf ezmesi)" value={mealName} onChange={(e: any) => setMealName(e.target.value)} />
            <Input placeholder="Kalori (kcal)" value={mealCal} onChange={(e: any) => setMealCal(e.target.value)} type="number" />
            <Input placeholder="Protein (g) — opsiyonel" value={mealProtein} onChange={(e: any) => setMealProtein(e.target.value)} type="number" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setModal(null)} color="red">İptal</Btn>
              <Btn onClick={handleAddMeal} disabled={!mealName || !mealCal}>Ekle</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: KİLO GÜNCELLE ─── */}
      {modal === "weight" && (
        <Modal title="Kilo Güncelle" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 12, color: "#52525b" }}>
              Mevcut kilo: <strong style={{ color: "#f0f0f0" }}>{data?.latestWeight ? `${data.latestWeight} kg` : "Kayıt yok"}</strong>
            </p>
            <Input placeholder="Yeni kilo (ör: 78.5)" value={weightVal} onChange={(e: any) => setWeightVal(e.target.value)} type="number" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setModal(null)} color="red">İptal</Btn>
              <Btn onClick={handleWeight} disabled={!weightVal}>Kaydet</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: ANTRENMAN OLUŞTUR ─── */}
      {modal === "workout" && (
        <Modal title="Yeni Antrenman Programı" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input placeholder="Program adı (ör: Push Day, Bacak Günü)" value={workoutTitle} onChange={(e: any) => setWorkoutTitle(e.target.value)} />

            <p style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>Hareketler:</p>
            {exercises.map((ex, i) => (
              <div key={i} style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 2 }}>
                  <Input placeholder="Hareket adı" value={ex.name} onChange={(e: any) => {
                    const updated = [...exercises]; updated[i].name = e.target.value; setExercises(updated);
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input placeholder="Set" value={ex.sets} type="number" onChange={(e: any) => {
                    const updated = [...exercises]; updated[i].sets = e.target.value; setExercises(updated);
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input placeholder="Tek" value={ex.reps} type="number" onChange={(e: any) => {
                    const updated = [...exercises]; updated[i].reps = e.target.value; setExercises(updated);
                  }} />
                </div>
                {exercises.length > 1 && (
                  <button onClick={() => setExercises(exercises.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer" }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <button onClick={() => setExercises([...exercises, { name: "", sets: "", reps: "" }])} style={{
              padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: 10, color: "#71717a", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
            }}>+ Hareket Ekle</button>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setModal(null)} color="red">İptal</Btn>
              <Btn onClick={handleCreateWorkout} disabled={!workoutTitle}>Oluştur</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: HAFTALIK PROGRAM ─── */}
      {modal === "schedule" && (
        <Modal title="Haftalık Program Düzenle" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {days.map((day, i) => {
              const dayData = data?.weeklySchedule?.find((s: any) => s.day_index === i);
              const isRest = dayData?.is_rest_day === 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ width: 32, fontSize: 12, fontWeight: 700, color: "#71717a" }}>{day}</span>

                  {/* Rest toggle */}
                  <button onClick={() => handleScheduleChange(i, isRest ? (dayData?.workout_id || null) : null, !isRest)} style={{
                    padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                    background: isRest ? "rgba(74,222,128,0.12)" : "rgba(244,63,94,0.1)",
                    color: isRest ? "#4ade80" : "#f43f5e"
                  }}>{isRest ? "OFF" : "AKTİF"}</button>

                  {/* Workout select */}
                  {!isRest && (
                    <div style={{ flex: 1, position: "relative" }}>
                      <select
                        value={dayData?.workout_id || ""}
                        onChange={(e) => handleScheduleChange(i, e.target.value ? Number(e.target.value) : null, false)}
                        style={{
                          width: "100%", padding: "6px 10px", background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                          color: "#f0f0f0", fontSize: 12, outline: "none", fontFamily: "inherit", cursor: "pointer"
                        }}
                      >
                        <option value="">— Program seç —</option>
                        {data?.allWorkouts?.map((w: any) => (
                          <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={() => setModal(null)}>Tamam</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}