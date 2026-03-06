import { useState, useEffect } from "react";
import { Activity, Droplets, Utensils, TrendingUp, Calendar, Bell, Plus, Flame, Zap, ChevronRight } from "lucide-react";

const useCountUp = (target: number, duration: number = 1200): number => {
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

const RadialProgress = ({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (value / max) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
};

const PulseRing = ({ color }: { color: string }) => (
  <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 0 0 ${color}`,
    animation: "pulse 2s infinite"
  }} />
);

export default function Dashboard() {
  const [activeDay, setActiveDay] = useState(2);
  const [water, setWater] = useState(1.5);
  const calories = useCountUp(420);
  const weight = useCountUp(785);

  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const workouts = [
    { name: "Bench Press", sets: 4, reps: 10, done: true },
    { name: "Shoulder Press", sets: 3, reps: 12, done: true },
    { name: "Tricep Dips", sets: 3, reps: 15, done: false },
    { name: "Lateral Raise", sets: 4, reps: 12, done: false },
  ];
  const meals = [
    { name: "Kaşarlı Poğaça", kcal: 330, time: "08:30" },
    { name: "Protein Shake", kcal: 90, time: "12:00" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0f; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 currentColor,0 0 0 0 currentColor} 50%{box-shadow:0 0 0 4px transparent,0 0 0 8px transparent} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { animation: fadeUp 0.6s ease both; }
        .card:nth-child(1){animation-delay:.05s} .card:nth-child(2){animation-delay:.1s}
        .card:nth-child(3){animation-delay:.15s} .card:nth-child(4){animation-delay:.2s}
        .btn-glow:hover { box-shadow: 0 0 20px rgba(34,197,94,0.4); transform: translateY(-1px); }
        .btn-glow { transition: all 0.2s ease; }
        .workout-row:hover { background: rgba(255,255,255,0.04) !important; }
        .day-btn:hover { background: rgba(255,255,255,0.08) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <main style={{
        minHeight: "100vh", background: "#080a0f",
        fontFamily: "'Syne', sans-serif", color: "#f0f0f0",
        padding: "28px", overflowX: "hidden"
      }}>
        {/* Noise overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#4ade80", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase" }}>
                ◆ FITNESS TRACKER
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
                Günaydın,{" "}
                <span style={{
                  background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>Umut</span> 👋
              </h1>
              <p style={{ color: "#52525b", fontSize: 13, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
                Bugün Push Day — Hadi gaz ver.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "10px", cursor: "pointer", color: "#a1a1aa",
                display: "flex", alignItems: "center", position: "relative"
              }}>
                <Bell size={18} />
                <span style={{
                  position: "absolute", top: 8, right: 8, width: 6, height: 6,
                  background: "#f43f5e", borderRadius: "50%"
                }} />
              </button>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 15
              }}>U</div>
            </div>
          </header>

          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { icon: <Flame size={18} />, label: "Günlük Kalori", value: calories, unit: "kcal", color: "#fb923c", max: 2200, radial: true },
              { icon: <Droplets size={18} />, label: "İçilen Su", value: (water * 10).toFixed(0), unit: "L", color: "#38bdf8", max: 30, radial: true },
              { icon: <Zap size={18} />, label: "Antrenman", value: "Push", unit: "Day", color: "#f43f5e", radial: false },
              { icon: <TrendingUp size={18} />, label: "Güncel Kilo", value: `${(weight/10).toFixed(1)}`, unit: "kg", color: "#4ade80", radial: false },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "20px", position: "relative", overflow: "hidden",
                backdropFilter: "blur(10px)"
              }}>
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 80, height: 80,
                  borderRadius: "50%", background: s.color, opacity: 0.06, filter: "blur(20px)"
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
                    <p style={{ fontSize: 11, color: "#52525b", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{s.label}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{s.value}</span>
                      <span style={{ fontSize: 11, color: "#52525b", fontFamily: "'DM Mono', monospace" }}>{s.unit}</span>
                    </div>
                  </div>
                  {s.radial && (
                    <RadialProgress value={typeof s.value === "string" ? parseInt(s.value) : s.value} max={s.max ?? 100} color={s.color} size={56} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WEEK BAR */}
          <div className="card" style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "14px 20px", marginBottom: 24,
            display: "flex", gap: 8, alignItems: "center"
          }}>
            <Calendar size={14} style={{ color: "#52525b", marginRight: 8 }} />
            {days.map((d, i) => (
              <button key={i} className="day-btn" onClick={() => setActiveDay(i)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeDay === i ? "rgba(74,222,128,0.15)" : "transparent",
                color: activeDay === i ? "#4ade80" : "#52525b",
                fontSize: 12, fontWeight: activeDay === i ? 700 : 400,
                fontFamily: "'Syne', sans-serif",
                outline: activeDay === i ? "1px solid rgba(74,222,128,0.3)" : "none",
                transition: "all 0.2s"
              }}>{d}</button>
            ))}
          </div>

          {/* MAIN GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

            {/* BESLENME */}
            <div className="card" style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <Utensils size={15} style={{ color: "#fb923c" }} /> Beslenme
                </h2>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#fb923c" }}>
                  {meals.reduce((a, m) => a + m.kcal, 0)} kcal
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {meals.map((meal, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{meal.name}</p>
                      <p style={{ fontSize: 10, color: "#52525b", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{meal.time}</p>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#fb923c", fontWeight: 500 }}>
                      {meal.kcal}
                    </span>
                  </div>
                ))}

                <button style={{
                  padding: "11px", background: "rgba(251,146,60,0.08)",
                  border: "1px dashed rgba(251,146,60,0.3)", borderRadius: 12,
                  color: "#fb923c", fontSize: 12, cursor: "pointer", fontFamily: "'Syne', sans-serif",
                  fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.2s"
                }}>
                  <Plus size={13} /> Öğün Ekle
                </button>
              </div>

              {/* Kalori bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#52525b", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
                  <span>Günlük hedef</span><span>420 / 2200 kcal</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(420/2200)*100}%`, background: "linear-gradient(90deg, #fb923c, #f43f5e)", borderRadius: 2, transition: "width 1.2s ease" }} />
                </div>
              </div>
            </div>

            {/* ANTRENMAN */}
            <div className="card" style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={15} style={{ color: "#f43f5e" }} /> Push Day
                </h2>
                <span style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 20,
                  background: "rgba(244,63,94,0.12)", color: "#f43f5e",
                  fontFamily: "'DM Mono', monospace", letterSpacing: 1
                }}>2/4 DONE</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {workouts.map((w, i) => (
                  <div key={i} className="workout-row" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                    background: w.done ? "rgba(244,63,94,0.06)" : "transparent",
                    border: `1px solid ${w.done ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)"}`,
                    transition: "all 0.2s"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5,
                        background: w.done ? "#f43f5e" : "rgba(255,255,255,0.06)",
                        border: w.done ? "none" : "1px solid rgba(255,255,255,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10
                      }}>
                        {w.done && "✓"}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: w.done ? "#71717a" : "#f0f0f0", textDecoration: w.done ? "line-through" : "none" }}>{w.name}</span>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#52525b" }}>
                      {w.sets}×{w.reps}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "50%", background: "linear-gradient(90deg, #f43f5e, #fb923c)", borderRadius: 2 }} />
                </div>
              </div>
            </div>

            {/* İSTATİSTİK */}
            <div className="card" style={{
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: 24
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <TrendingUp size={15} style={{ color: "#4ade80" }} /> İstatistik
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Antrenman/Hafta", value: "5", color: "#4ade80" },
                  { label: "Yağ Oranı", value: "%14", color: "#38bdf8" },
                  { label: "Seri", value: "12 gün", color: "#a78bfa" },
                  { label: "Toplam Set", value: "148", color: "#fb923c" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <p style={{ fontSize: 10, color: "#52525b", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: 0.5 }}>{s.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Su takip */}
              <div style={{
                background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: 14, padding: "14px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Droplets size={13} style={{ color: "#38bdf8" }} /> Su Takibi
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#38bdf8" }}>{water}L / 3L</span>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button key={i} onClick={() => setWater(parseFloat(((i + 1) * 0.375).toFixed(1)))} style={{
                      flex: 1, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                      background: i < Math.round(water / 0.375) ? "#38bdf8" : "rgba(56,189,248,0.1)",
                      transition: "all 0.2s"
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#3f3f46", fontFamily: "'DM Mono', monospace" }}>
              <PulseRing color="#4ade80" /> Senkronize
            </div>
          </div>

        </div>
      </main>
    </>
  );
}