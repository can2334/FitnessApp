"use client";
import React, { useState, useEffect, useRef } from "react";

export function ExerciseAnimation({ exerciseName }: { exerciseName: string }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frameRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!playing) return;
    frameRef.current = setInterval(() => setFrame(f => (f + 1) % 60), 50);
    return () => clearInterval(frameRef.current);
  }, [playing]);

  const t = (frame / 60) * Math.PI * 2;
  const phase = Math.sin(t);
  const phase01 = (phase + 1) / 2;

  const animations: Record<string, () => React.ReactElement> = {
    "Squat": () => {
      const hipY = 60 + phase01 * 28;
      return (
        <g transform="translate(50,20)">
          <line x1="0" y1="0" x2={phase01 * -8} y2="30" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <circle cx={phase01 * -8} cy="30" r="4" fill="#ff5000" />
          <line x1={phase01 * -8} y1="30" x2={-18 + phase01 * 2} y2={hipY} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1={-18 + phase01 * 2} y1={hipY} x2="-20" y2="90" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1={phase01 * -8} y1="30" x2={18 - phase01 * 2} y2={hipY} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1={18 - phase01 * 2} y1={hipY} x2="20" y2="90" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <circle cx={phase01 * -4} cy="-10" r="8" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <line x1="-30" y1="90" x2="30" y2="90" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="25" y={hipY + 4} fill="#ff500099" fontSize="6" fontFamily="monospace">{Math.round(phase01 * 100)}%</text>
        </g>
      );
    },
    "Bench Press": () => {
      const barY = 40 - phase01 * 18;
      return (
        <g transform="translate(50,50)">
          <rect x="-35" y="20" width="70" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
          <rect x="-20" y="-5" width="40" height="25" rx="5" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <line x1="-38" y1={barY} x2="38" y2={barY} stroke="#ff5000" strokeWidth="4" strokeLinecap="round" />
          <rect x="-42" y={barY - 8} width="6" height="16" rx="2" fill="#ff5000" />
          <rect x="36" y={barY - 8} width="6" height="16" rx="2" fill="#ff5000" />
          <line x1="-18" y1="5" x2="-30" y2={barY} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="5" x2="30" y2={barY} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-16" r="8" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <text x="35" y={barY - 10} fill="#ff500099" fontSize="6" fontFamily="monospace">{Math.round(phase01 * 100)}%</text>
        </g>
      );
    },
    "Dumbbell Curl": () => {
      const curlAngle = phase01 * 110;
      const rad = (curlAngle * Math.PI) / 180;
      const handX = -Math.cos(rad) * 30;
      const handY = Math.sin(rad) * 30;
      return (
        <g transform="translate(50,30)">
          <line x1="0" y1="0" x2="0" y2="50" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1="-12" y1="10" x2="-12" y2="40" stroke="#ff8c0088" strokeWidth="3" strokeLinecap="round" />
          <line x1="-12" y1="40" x2={-12 + handX * 0.8} y2={40 - handY * 0.8} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <rect x={-12 + handX * 0.8 - 8} y={40 - handY * 0.8 - 3} width="16" height="6" rx="2" fill="#ff5000" />
          <circle cx="-12" cy="10" r="3" fill="#ff5000" />
          <circle cx="-12" cy="40" r="3" fill="#ff8c00" />
          <circle cx="0" cy="-10" r="8" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <text x="10" y="40" fill="#ff500099" fontSize="6" fontFamily="monospace">{Math.round(curlAngle)}°</text>
        </g>
      );
    },
    "Lateral Raise": () => {
      const raiseAngle = phase01 * 90;
      const rad = (raiseAngle * Math.PI) / 180;
      const lx = -Math.cos(rad) * 28;
      const ly = -Math.sin(rad) * 28;
      return (
        <g transform="translate(50,40)">
          <line x1="0" y1="-20" x2="0" y2="40" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-30" r="8" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <line x1="-8" y1="0" x2={-8 + lx} y2={ly} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <rect x={-8 + lx - 5} y={ly - 2.5} width="10" height="5" rx="1.5" fill="#ff5000" transform={`rotate(${-raiseAngle}, ${-8 + lx}, ${ly})`} />
          <line x1="8" y1="0" x2={8 - lx} y2={ly} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <rect x={8 - lx - 5} y={ly - 2.5} width="10" height="5" rx="1.5" fill="#ff5000" transform={`rotate(${raiseAngle}, ${8 - lx}, ${ly})`} />
          <text x="18" y="0" fill="#ff500099" fontSize="6" fontFamily="monospace">{Math.round(raiseAngle)}°</text>
        </g>
      );
    },
    "Plank": () => {
      const breathe = 1 + phase01 * 0.04;
      return (
        <g transform="translate(50,55)">
          <line x1="-35" y1="0" x2="30" y2="0" stroke="#ff8c00" strokeWidth="4" strokeLinecap="round" />
          <line x1="-25" y1="0" x2="-25" y2="18" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1="-10" y1="0" x2="-10" y2="18" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1="-25" y1="18" x2="-5" y2="18" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="0" x2="35" y2="12" stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <circle cx="-43" cy="0" r="8" fill="none" stroke="#ff8c00" strokeWidth="2" />
          <rect x="-5" y={-4 * breathe} width="20" height={8 * breathe} rx="3" fill={`rgba(255,80,0,${0.2 + phase01 * 0.15})`} />
          <text x="-10" y="-10" fill="#ff500099" fontSize="6" fontFamily="monospace">nefes</text>
        </g>
      );
    },
  };

  const renderAnimation = animations[exerciseName] as (() => React.ReactElement) | undefined;

  return (
    <div style={{ background: "rgba(255,80,0,0.04)", border: "1px solid rgba(255,80,0,0.15)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px 0" }}>
        <span style={{ fontSize: 10, letterSpacing: 2, color: "#ff5000", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>
          {renderAnimation ? "ANİMASYON" : "HAREKET"}
        </span>
        <button onClick={() => setPlaying(p => !p)} style={{ background: "rgba(255,80,0,0.12)", border: "1px solid rgba(255,80,0,0.3)", borderRadius: 6, padding: "3px 10px", color: "#ff8c00", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
          {playing ? "⏸" : "▶"}
        </button>
      </div>
      <svg viewBox="0 0 100 120" style={{ width: "100%", height: 160, display: "block" }}>
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="120" fill="url(#grid)" />
        {renderAnimation ? renderAnimation() : (
          <text x="50" y="60" textAnchor="middle" fill="#ff500066" fontSize="8" fontFamily="monospace">{exerciseName}</text>
        )}
      </svg>
    </div>
  );
}