"use client";
import React, { useState, KeyboardEvent } from "react";
import { DayPlan, WeekPlan } from "../types.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS_FULL: string[] = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DAYS_SHORT: string[] = ["PTS", "SAL", "ÇAR", "PER", "CUM", "CTS", "PAZ"];

function getTodayIdx(): number {
  const d = new Date().getDay(); // 0 = Sunday
  return d === 0 ? 6 : d - 1;
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface PlanTabProps {
  week: WeekPlan;
  onSetRest: (dayIdx: number, isRest: boolean) => void;
  onAddExercise: (dayIdx: number, name: string) => void;
  onRemoveExercise: (dayIdx: number, exIdx: number) => void;
  onUpdateNote: (dayIdx: number, note: string) => void;
}

// ─── DAY ROW ─────────────────────────────────────────────────────────────────
interface DayRowProps {
  dayIdx: number;
  plan: DayPlan;
  isToday: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSetRest: (isRest: boolean) => void;
  onAddExercise: (name: string) => void;
  onRemoveExercise: (exIdx: number) => void;
  onUpdateNote: (note: string) => void;
}

function DayRow({
  dayIdx,
  plan,
  isToday,
  isExpanded,
  onToggle,
  onSetRest,
  onAddExercise,
  onRemoveExercise,
  onUpdateNote,
}: DayRowProps): React.ReactElement {
  const [exInput, setExInput] = useState<string>("");

  const handleAdd = (): void => {
    const val = exInput.trim();
    if (!val) return;
    onAddExercise(val);
    setExInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  const previewText = plan.isRest
    ? "— Dinlenme günü"
    : plan.exercises.length > 0
    ? plan.exercises.join(", ")
    : "Egzersiz ekle...";

  const borderColor = isToday
    ? "rgba(255,77,0,0.4)"
    : plan.isRest
    ? "rgba(255,255,255,0.05)"
    : plan.exercises.length > 0
    ? "rgba(74,222,128,0.25)"
    : "rgba(255,255,255,0.06)";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color .2s",
      }}
    >
      {/* Header row */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 14px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Day name */}
        <div
          style={{
            fontFamily: "'Unbounded',sans-serif",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
            color: isToday ? "#ff8533" : "#44445a",
            minWidth: 32,
          }}
        >
          {DAYS_SHORT[dayIdx]}
        </div>

        {/* Badge */}
        {isToday && (
          <span
            style={{
              fontSize: 7,
              padding: "3px 8px",
              borderRadius: 20,
              background: "rgba(255,77,0,0.15)",
              color: "#ff4d00",
              border: "1px solid rgba(255,77,0,0.35)",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            BUGÜN
          </span>
        )}
        {plan.isRest && !isToday && (
          <span
            style={{
              fontSize: 7,
              padding: "3px 8px",
              borderRadius: 20,
              background: "#1e1e28",
              color: "#44445a",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            OFF
          </span>
        )}
        {!plan.isRest && !isToday && plan.exercises.length > 0 && (
          <span
            style={{
              fontSize: 7,
              padding: "3px 8px",
              borderRadius: 20,
              background: "rgba(74,222,128,0.1)",
              color: "#4ade80",
              border: "1px solid rgba(74,222,128,0.25)",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {plan.exercises.length} HAREKET
          </span>
        )}

        {/* Preview */}
        <div
          style={{
            flex: 1,
            fontSize: 11,
            color: plan.isRest || plan.exercises.length === 0 ? "#2a2a38" : "#e8e8f0",
            fontStyle: plan.exercises.length === 0 && !plan.isRest ? "italic" : "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {previewText}
        </div>

        {/* Chevron */}
        <span
          style={{
            fontSize: 9,
            color: "#44445a",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Mode switch */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onSetRest(false); }}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 9,
                border: !plan.isRest ? "1px solid rgba(74,222,128,0.4)" : "1px solid #1e1e28",
                background: !plan.isRest ? "rgba(74,222,128,0.12)" : "transparent",
                color: !plan.isRest ? "#4ade80" : "#44445a",
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              💪 Antrenman
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSetRest(true); }}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 9,
                border: plan.isRest ? "1px solid rgba(255,255,255,0.2)" : "1px solid #1e1e28",
                background: plan.isRest ? "rgba(255,255,255,0.07)" : "transparent",
                color: plan.isRest ? "#e8e8f0" : "#44445a",
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              😴 Dinlenme
            </button>
          </div>

          {!plan.isRest && (
            <>
              {/* Exercise list */}
              {plan.exercises.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {plan.exercises.map((ex, ei) => (
                    <div
                      key={ei}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 11px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Unbounded',sans-serif",
                          fontSize: 8,
                          color: "#44445a",
                          minWidth: 18,
                        }}
                      >
                        {ei + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: 12, color: "#e8e8f0" }}>{ex}</span>
                      <button
                        onClick={() => onRemoveExercise(ei)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2a2a38",
                          cursor: "pointer",
                          fontSize: 16,
                          lineHeight: 1,
                          padding: "0 2px",
                          transition: "color .15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f43f5e"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#2a2a38"; }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add exercise input */}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  value={exInput}
                  onChange={(e) => setExInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Egzersiz ekle  (örn: Squat 4×10)"
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    color: "#e8e8f0",
                    fontSize: 12,
                    fontFamily: "'DM Mono',monospace",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleAdd}
                  disabled={exInput.trim() === ""}
                  style={{
                    padding: "9px 14px",
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    borderRadius: 10,
                    color: "#4ade80",
                    fontFamily: "'Unbounded',sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: exInput.trim() === "" ? 0.5 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  + EKLE
                </button>
              </div>

              {/* Note */}
              <textarea
                value={plan.note}
                onChange={(e) => onUpdateNote(e.target.value)}
                placeholder="Notlar, ağırlıklar, hedefler..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,77,0,0.15)",
                  borderRadius: 10,
                  color: "#e8e8f0",
                  fontSize: 11,
                  fontFamily: "'DM Mono',monospace",
                  outline: "none",
                  resize: "none",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,77,0,0.4)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,77,0,0.15)"; }}
              />
            </>
          )}

          {plan.isRest && (
            <div style={{ textAlign: "center", fontSize: 12, color: "#44445a", padding: "6px 0" }}>
              😴 Dinlenme günü — Vücudun şarj oluyor!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PLAN TAB ─────────────────────────────────────────────────────────────────
export function PlanTab({ week, onSetRest, onAddExercise, onRemoveExercise, onUpdateNote }: PlanTabProps): React.ReactElement {
  const [expandedDay, setExpandedDay] = useState<number | null>(getTodayIdx());
  const todayIdx = getTodayIdx();

  // Summary stats
  const workoutDays = Object.values(week).filter((d) => !d.isRest).length;
  const restDays = 7 - workoutDays;
  const totalExercises = Object.values(week).reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <div>
      {/* Week summary chips */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {([
          { label: "Antrenman", val: workoutDays, color: "#ff8533" },
          { label: "Dinlenme",  val: restDays,    color: "#44445a" },
          { label: "Egzersiz",  val: totalExercises, color: "#4ade80" },
        ] as { label: string; val: number; color: string }[]).map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Unbounded',sans-serif",
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: -1,
                color: s.color,
                marginBottom: 3,
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 8,
                color: "#44445a",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Day rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DAYS_FULL.map((_, dayIdx) => (
          <DayRow
            key={dayIdx}
            dayIdx={dayIdx}
            plan={week[dayIdx]}
            isToday={dayIdx === todayIdx}
            isExpanded={expandedDay === dayIdx}
            onToggle={() => setExpandedDay((prev) => (prev === dayIdx ? null : dayIdx))}
            onSetRest={(isRest) => onSetRest(dayIdx, isRest)}
            onAddExercise={(name) => onAddExercise(dayIdx, name)}
            onRemoveExercise={(exIdx) => onRemoveExercise(dayIdx, exIdx)}
            onUpdateNote={(note) => onUpdateNote(dayIdx, note)}
          />
        ))}
      </div>
    </div>
  );
}