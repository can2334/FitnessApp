"use client";
import React, { useState } from "react";
import { Exercise } from "../app/data/exercises";
import { MuscleMap } from "./MuscleMap";
// Embed modunu import ediyoruz — sidebar'sız, sadece 3D canvas
import { Exercise3DEmbed } from "./Exercise3D";

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        style={{
          background: "#0c0c12",
          border: "1px solid rgba(255,80,0,0.2)",
          borderRadius: 20, padding: 24,
          width: "100%", maxWidth: wide ? 700 : 460,
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#fff" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,80,0,0.1)", border: "1px solid rgba(255,80,0,0.2)",
              borderRadius: 8, color: "#ff5000", cursor: "pointer",
              fontSize: 16, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ExerciseFormModal({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"form">("form");

  const difficultyColor =
    exercise.difficulty === "başlangıç" ? "#4ade80"
    : exercise.difficulty === "orta" ? "#ff8c00"
    : "#f43f5e";

  const difficultyLabel =
    exercise.difficulty === "başlangıç" ? "🌱 Başlangıç"
    : exercise.difficulty === "orta" ? "🔥 Orta"
    : "⚡ İleri";

  return (
    <Modal title={`${exercise.emoji} ${exercise.name}`} onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Özet Bilgi ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, padding: "3px 10px", background: "rgba(255,80,0,0.12)", color: "#ff8c00", borderRadius: 20, fontFamily: "monospace" }}>
            {exercise.muscle}
          </span>
          <span style={{ fontSize: 10, padding: "3px 10px", background: "rgba(0,0,0,0.3)", color: difficultyColor, borderRadius: 20, border: `1px solid ${difficultyColor}44`, fontFamily: "monospace" }}>
            {difficultyLabel}
          </span>
          {exercise.equipment.map((e: string) => (
            <span key={e} style={{ fontSize: 10, padding: "3px 10px", background: "rgba(255,255,255,0.04)", color: "#888", borderRadius: 20, fontFamily: "monospace" }}>
              🏋️ {e}
            </span>
          ))}
        </div>

        {/* ── Tab Seçici ── */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10 }}>
          {(
            [
              { id: "form", label: "📋 3D Rehber" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "7px 4px", border: "none", cursor: "pointer",
                borderRadius: 7, fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                background: activeTab === t.id ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "transparent",
                color: activeTab === t.id ? "#fff" : "#666",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ FORM REHBERİ ══ */}
        {activeTab === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>

              {/* 3D Motor */}
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
                  3D Form Analizi
                </div>
                <div style={{ height: 280, borderRadius: 14, overflow: "hidden" }}>
                  {/* ✅ Doğru kullanım: exerciseName prop'u ile */}
                  <Exercise3DEmbed exerciseName={exercise.name} />
                </div>
              </div>

              {/* Anatomi */}
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
                  Anatomi
                </div>
                <div style={{ background: "rgba(255,80,0,0.04)", border: "1px solid rgba(255,80,0,0.15)", borderRadius: 14, padding: 10, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MuscleMap primary={exercise.primaryMuscles} secondary={exercise.secondaryMuscles} />
                </div>
              </div>
            </div>

            {/* Kas Bilgileri */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(255,80,0,0.08)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
                  🔴 Ana Kaslar
                </div>
                {exercise.muscleNames.primary.map((m: string) => (
                  <div key={m} style={{ fontSize: 12, color: "#ff8c00", fontWeight: 700, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#888", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
                  🟡 Yan Kaslar
                </div>
                {exercise.muscleNames.secondary.map((m: string) => (
                  <div key={m} style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
            </div>

            {/* Teknik İpuçları */}
            <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4ade80", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 10 }}>
                ✅ Teknik İpuçları
              </div>
              {exercise.correct.map((tip: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "#4ade80", fontSize: 11, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "#d4d4d4", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Nefes & Pro İpucu */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#38bdf8", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
                  💨 NEFES
                </div>
                <div style={{ fontSize: 12, color: "#d4d4d4", lineHeight: 1.4 }}>{exercise.breath}</div>
              </div>
              <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ffd700", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
                  💡 PRO İPUCU
                </div>
                <div style={{ fontSize: 12, color: "#d4d4d4", lineHeight: 1.4 }}>{exercise.tip}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}