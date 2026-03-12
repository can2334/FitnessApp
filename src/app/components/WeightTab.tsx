"use client";
import React from "react";
import { WeightEntry } from "../types";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "20px 18px",
    marginBottom: 12,
  } as React.CSSProperties,
  label: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#44445a",
    textTransform: "uppercase" as const,
    fontFamily: "'DM Mono',monospace",
    marginBottom: 6,
  },
  input: {
    flex: 1,
    padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 12,
    color: "#e8e8f0",
    fontSize: 14,
    fontFamily: "'DM Mono',monospace",
    outline: "none",
    transition: "border-color .2s",
  } as React.CSSProperties,
};

// ─── WEIGHT CHART ─────────────────────────────────────────────────────────────
interface WeightChartProps {
  entries: WeightEntry[];
  targetWeight: number;
}

function WeightChart({ entries, targetWeight }: WeightChartProps): React.ReactElement | null {
  if (entries.length < 2) return null;

  const W = 320;
  const H = 88;
  const allVals = [...entries.map((e) => e.w), targetWeight];
  const minV = Math.min(...allVals) - 1;
  const maxV = Math.max(...allVals) + 1;
  const toY = (v: number): number => H - ((v - minV) / (maxV - minV)) * H;
  const toX = (i: number): number =>
    entries.length === 1 ? W / 2 : (i / (entries.length - 1)) * (W - 20) + 10;

  const pts: [number, number][] = entries.map((e, i) => [toX(i), toY(e.w)]);
  const pathD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const targetY = toY(targetWeight);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wGrad)" />
      <path d={pathD} fill="none" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {targetY > 2 && targetY < H - 2 && (
        <>
          <line x1={0} y1={targetY} x2={W} y2={targetY} stroke="#ff8c00" strokeWidth={1} strokeDasharray="5,4" opacity={0.6} />
          <text x={W - 4} y={targetY - 4} textAnchor="end" fill="#ff8c00" fontSize={8} fontFamily="monospace">Hedef</text>
        </>
      )}
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={4} fill="#4ade80" stroke="#060608" strokeWidth={1.5} />
          <text x={x} y={H + 14} textAnchor="middle" fill="#44445a" fontSize={7} fontFamily="monospace">{entries[i].date}</text>
          <text x={x} y={y - 7} textAnchor="middle" fill="#4ade80" fontSize={7} fontFamily="monospace">{entries[i].w}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── WEIGHT TAB ───────────────────────────────────────────────────────────────
interface WeightTabProps {
  entries: WeightEntry[];
  targetWeight: number;
  onAdd: (val: number) => void;
  onRemove: (idx: number) => void;
  onTargetChange: (delta: number) => void;
}

export function WeightTab({
  entries,
  targetWeight,
  onAdd,
  onRemove,
  onTargetChange,
}: WeightTabProps): React.ReactElement {
  const [inputVal, setInputVal] = React.useState<string>("");
  const current = entries.length > 0 ? entries[entries.length - 1].w : null;
  const first = entries.length > 0 ? entries[0].w : null;
  const diff = current !== null && first !== null ? +(current - first).toFixed(1) : null;

  const handleAdd = (): void => {
    const v = parseFloat(inputVal);
    if (isNaN(v) || v < 20 || v > 300) return;
    onAdd(v);
    setInputVal("");
  };

  // diff badge colors
  const diffColor = diff === null ? "#44445a" : diff < 0 ? "#4ade80" : diff > 0 ? "#f43f5e" : "#44445a";
  const diffBg = diff === null ? "transparent" : diff < 0 ? "rgba(74,222,128,0.12)" : diff > 0 ? "rgba(244,63,94,0.12)" : "transparent";
  const diffBorder = diff === null ? "1px solid #1e1e28" : diff < 0 ? "1px solid rgba(74,222,128,0.3)" : diff > 0 ? "1px solid rgba(244,63,94,0.3)" : "1px solid #1e1e28";

  // target distance
  const renderTargetHint = (): React.ReactElement => {
    if (current === null) return <span style={{ color: "#44445a" }}>—</span>;
    const d = +(current - targetWeight).toFixed(1);
    if (Math.abs(d) < 0.05)
      return <span style={{ color: "#4ade80", fontWeight: 700 }}>✓ Hedefe ulaştın!</span>;
    if (d > 0)
      return <span style={{ color: "#f43f5e", fontWeight: 700 }}>▼ {d.toFixed(1)} kg ver</span>;
    return <span style={{ color: "#38bdf8", fontWeight: 700 }}>▲ {Math.abs(d).toFixed(1)} kg al</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Hero numbers ── */}
      <div style={{ ...S.card, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={S.label}>Mevcut Kilo</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 54, fontWeight: 900, letterSpacing: -3, lineHeight: 1, color: "#fff" }}>
              {current !== null ? current.toFixed(1) : "—"}
            </span>
            <span style={{ fontSize: 18, color: "#44445a", fontFamily: "'DM Mono',monospace" }}>kg</span>
          </div>
        </div>
        {diff !== null && (
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            color: diffColor, background: diffBg, border: diffBorder,
            fontFamily: "'DM Mono',monospace",
          }}>
            {diff > 0 ? `+${diff}` : diff} kg
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      {entries.length >= 2 && (
        <div style={{ ...S.card }}>
          <div style={S.label}>📈 İlerleme Grafiği</div>
          <WeightChart entries={entries} targetWeight={targetWeight} />
        </div>
      )}

      {/* ── Log list ── */}
      <div style={{ ...S.card }}>
        <div style={S.label}>Geçmiş Girişler</div>
        {entries.length === 0 ? (
          <div style={{ fontSize: 12, color: "#44445a", textAlign: "center", padding: "12px 0" }}>Henüz giriş yok</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {[...entries].reverse().map((e, ri) => {
              const idx = entries.length - 1 - ri;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono',monospace" }}>{e.date}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono',monospace" }}>{e.w.toFixed(1)} kg</span>
                  <button
                    onClick={() => onRemove(idx)}
                    style={{ background: "none", border: "none", color: "#2a2a38", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px", transition: "color .15s" }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.color = "#f43f5e")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.color = "#2a2a38")}
                  >×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Yeni kilo (kg)"
            style={S.input}
          />
          <button
            onClick={handleAdd}
            disabled={inputVal === ""}
            style={{
              padding: "11px 20px",
              background: "rgba(74,222,128,0.15)",
              border: "1px solid rgba(74,222,128,0.35)",
              borderRadius: 12,
              color: "#4ade80",
              fontFamily: "'Unbounded',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              opacity: inputVal === "" ? 0.5 : 1,
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >
            + EKLE
          </button>
        </div>
      </div>

      {/* ── Target ── */}
      <div style={{ ...S.card }}>
        <div style={S.label}>🎯 Hedef Kilo</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => onTargetChange(-0.5)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #2a2a38", background: "#0d0d12", color: "#e8e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >−</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 28, fontWeight: 900, color: "#ff8533", letterSpacing: -1 }}>
              {targetWeight.toFixed(1)}
            </span>
            <span style={{ fontSize: 13, color: "#44445a", fontFamily: "'DM Mono',monospace", marginLeft: 4 }}>kg</span>
          </div>
          <button
            onClick={() => onTargetChange(0.5)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #2a2a38", background: "#0d0d12", color: "#e8e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >+</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
          {renderTargetHint()}
        </div>
      </div>
    </div>
  );
}