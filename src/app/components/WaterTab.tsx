"use client";
import React from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface WaterLogEntry {
  time: string;
  amt: number;
}

interface WaterTabProps {
  water: number;
  waterGoal: number;
  waterLog: WaterLogEntry[];
  onAdd: (amt: number) => void;
  onGoalChange: (delta: number) => void;
}

// ─── WATER CUP SVG ────────────────────────────────────────────────────────────
interface CupProps {
  filled: boolean;
  onClick: () => void;
}

function Cup({ filled, onClick }: CupProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      style={{ width: 34, height: 40, cursor: "pointer", flexShrink: 0, transition: "transform .15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
    >
      <svg viewBox="0 0 34 40" fill="none" width="100%" height="100%">
        <path
          d="M5 5 L7 33 Q8 37 17 37 Q26 37 27 33 L29 5 Z"
          fill={filled ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)"}
          stroke={filled ? "#38bdf8" : "#2a2a38"}
          strokeWidth={1.5}
        />
        {filled && (
          <path
            d="M7.5 23 L26.5 23 Q26.8 28 26 32 Q25 36 17 36 Q9 36 8 32 Q7.2 28 7.5 23 Z"
            fill="rgba(56,189,248,0.5)"
          />
        )}
        <line x1={3} y1={5} x2={31} y2={5} stroke={filled ? "#38bdf8" : "#2a2a38"} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── WATER TAB ────────────────────────────────────────────────────────────────
const QUICK_AMTS: { label: string; amt: number }[] = [
  { label: "+200ml", amt: 0.2 },
  { label: "+330ml", amt: 0.33 },
  { label: "+500ml", amt: 0.5 },
  { label: "+1L",    amt: 1.0 },
];

export function WaterTab({ water, waterGoal, waterLog, onAdd, onGoalChange }: WaterTabProps): React.ReactElement {
  const pct = Math.min((water / waterGoal) * 100, 100);
  const isGoalMet = water >= waterGoal;
  const totalCups = Math.min(Math.ceil(waterGoal / 0.25), 12);
  const filledCups = Math.floor(water / 0.25);

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: "20px 18px",
    marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: 3,
    color: "#44445a",
    textTransform: "uppercase",
    fontFamily: "'DM Mono',monospace",
    marginBottom: 8,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ── Hero ── */}
      <div style={{ ...cardStyle, border: isGoalMet ? "1px solid rgba(74,222,128,0.3)" : water > 0 ? "1px solid rgba(56,189,248,0.25)" : "1px solid rgba(255,255,255,0.07)" }}>
        <div style={labelStyle}>Bugünkü Su</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Unbounded',sans-serif",
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            color: isGoalMet ? "#4ade80" : "#38bdf8",
            transition: "color .3s",
          }}>
            {water.toFixed(1)}
          </span>
          <span style={{ fontSize: 18, color: "#44445a", fontFamily: "'DM Mono',monospace" }}>L</span>
          <span style={{ fontSize: 11, color: "#44445a", fontFamily: "'DM Mono',monospace", marginLeft: 4 }}>
            / {waterGoal.toFixed(1)}L hedef
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: "#1e1e28", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 4,
              background: isGoalMet
                ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                : "linear-gradient(90deg,#0ea5e9,#38bdf8)",
              transition: "width .5s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>

        {/* Cups */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {Array.from({ length: totalCups }).map((_, i) => (
            <Cup
              key={i}
              filled={i < filledCups}
              onClick={() => onAdd(i < filledCups ? -0.25 : 0.25)}
            />
          ))}
        </div>

        {/* Quick add */}
        <div style={{ display: "flex", gap: 6 }}>
          {QUICK_AMTS.map(({ label, amt }) => (
            <button
              key={amt}
              onClick={() => onAdd(amt)}
              style={{
                flex: 1,
                padding: "9px 4px",
                border: "1px solid rgba(56,189,248,0.25)",
                borderRadius: 10,
                background: "rgba(56,189,248,0.08)",
                color: "#38bdf8",
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.18)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.08)"; }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => onAdd(-0.25)}
            style={{
              padding: "9px 10px",
              border: "1px solid rgba(244,63,94,0.25)",
              borderRadius: 10,
              background: "rgba(244,63,94,0.08)",
              color: "#f43f5e",
              fontFamily: "'DM Mono',monospace",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.08)"; }}
          >
            −
          </button>
        </div>
      </div>

      {/* ── Goal setting ── */}
      <div style={cardStyle}>
        <div style={labelStyle}>🎯 Günlük Hedef</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => onGoalChange(-0.25)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #2a2a38", background: "#0d0d12", color: "#e8e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >−</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 28, fontWeight: 900, color: "#38bdf8", letterSpacing: -1 }}>
              {waterGoal.toFixed(2).replace(/\.?0+$/, "")}
            </span>
            <span style={{ fontSize: 13, color: "#44445a", fontFamily: "'DM Mono',monospace", marginLeft: 4 }}>L / gün</span>
          </div>
          <button
            onClick={() => onGoalChange(0.25)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #2a2a38", background: "#0d0d12", color: "#e8e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >+</button>
        </div>
      </div>

      {/* ── Log ── */}
      <div style={cardStyle}>
        <div style={labelStyle}>Su Geçmişi</div>
        {waterLog.length === 0 ? (
          <div style={{ fontSize: 12, color: "#44445a", textAlign: "center", padding: "10px 0" }}>Henüz giriş yok</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 160, overflowY: "auto" }}>
            {[...waterLog].reverse().map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 9,
                }}
              >
                <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono',monospace" }}>{entry.time}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", fontFamily: "'DM Mono',monospace" }}>
                  +{entry.amt >= 1 ? `${entry.amt.toFixed(1)}L` : `${Math.round(entry.amt * 1000)}ml`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}