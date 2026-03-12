import React from "react";

export function MuscleMap({ primary = [], secondary = [] }: { primary?: string[]; secondary?: string[] }) {
  const isPrimary = (m: string) => primary.includes(m);
  const isSecondary = (m: string) => secondary.includes(m);
  const getColor = (m: string) => isPrimary(m) ? "#ff5000" : isSecondary(m) ? "#ff8c0088" : "rgba(255,255,255,0.07)";
  const getStroke = (m: string) => isPrimary(m) ? "#ff8c00" : isSecondary(m) ? "#ff5000" : "rgba(255,255,255,0.12)";

  return (
    <svg viewBox="0 0 100 200" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="50" cy="13" rx="10" ry="11" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <rect x="45" y="22" width="10" height="7" fill="rgba(255,255,255,0.07)" />
      <ellipse cx="28" cy="36" rx="11" ry="6" fill={getColor("shoulders")} stroke={getStroke("shoulders")} strokeWidth="0.8" />
      <ellipse cx="72" cy="36" rx="11" ry="6" fill={getColor("shoulders")} stroke={getStroke("shoulders")} strokeWidth="0.8" />
      <ellipse cx="22" cy="38" rx="7" ry="5" fill={getColor("side_shoulder")} stroke={getStroke("side_shoulder")} strokeWidth="0.8" />
      <ellipse cx="78" cy="38" rx="7" ry="5" fill={getColor("side_shoulder")} stroke={getStroke("side_shoulder")} strokeWidth="0.8" />
      <ellipse cx="30" cy="32" rx="6" ry="4" fill={getColor("front_shoulder")} stroke={getStroke("front_shoulder")} strokeWidth="0.8" />
      <ellipse cx="70" cy="32" rx="6" ry="4" fill={getColor("front_shoulder")} stroke={getStroke("front_shoulder")} strokeWidth="0.8" />
      <path d="M38 28 L62 28 L65 52 L35 52 Z" fill={getColor("chest")} stroke={getStroke("chest")} strokeWidth="0.8" />
      <line x1="50" y1="28" x2="50" y2="52" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <rect x="38" y="53" width="24" height="28" rx="3" fill={getColor("core")} stroke={getStroke("core")} strokeWidth="0.8" />
      <line x1="38" y1="62" x2="62" y2="62" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <line x1="38" y1="71" x2="62" y2="71" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <line x1="50" y1="53" x2="50" y2="81" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <path d="M35 28 L23 48 L35 55 Z" fill={getColor("lats")} stroke={getStroke("lats")} strokeWidth="0.8" />
      <path d="M65 28 L77 48 L65 55 Z" fill={getColor("lats")} stroke={getStroke("lats")} strokeWidth="0.8" />
      <rect x="36" y="82" width="28" height="12" rx="2" fill={getColor("lower_back")} stroke={getStroke("lower_back")} strokeWidth="0.8" />
      <path d="M39 26 L50 22 L61 26 L50 32 Z" fill={getColor("traps")} stroke={getStroke("traps")} strokeWidth="0.8" />
      <rect x="18" y="30" width="8" height="24" rx="4" fill={getColor("biceps")} stroke={getStroke("biceps")} strokeWidth="0.8" />
      <rect x="74" y="30" width="8" height="24" rx="4" fill={getColor("biceps")} stroke={getStroke("biceps")} strokeWidth="0.8" />
      <rect x="13" y="32" width="7" height="22" rx="3.5" fill={getColor("triceps")} stroke={getStroke("triceps")} strokeWidth="0.8" />
      <rect x="80" y="32" width="7" height="22" rx="3.5" fill={getColor("triceps")} stroke={getStroke("triceps")} strokeWidth="0.8" />
      <rect x="14" y="56" width="7" height="20" rx="3" fill={getColor("forearms")} stroke={getStroke("forearms")} strokeWidth="0.8" />
      <rect x="79" y="56" width="7" height="20" rx="3" fill={getColor("forearms")} stroke={getStroke("forearms")} strokeWidth="0.8" />
      <path d="M38 82 L50 87 L62 82 L64 96 L36 96 Z" fill={getColor("glutes")} stroke={getStroke("glutes")} strokeWidth="0.8" />
      <rect x="38" y="97" width="11" height="38" rx="5" fill={getColor("quads")} stroke={getStroke("quads")} strokeWidth="0.8" />
      <rect x="51" y="97" width="11" height="38" rx="5" fill={getColor("quads")} stroke={getStroke("quads")} strokeWidth="0.8" />
      <rect x="39" y="99" width="10" height="34" rx="4" fill={getColor("hamstrings")} stroke={getStroke("hamstrings")} strokeWidth="0.8" />
      <rect x="51" y="99" width="10" height="34" rx="4" fill={getColor("hamstrings")} stroke={getStroke("hamstrings")} strokeWidth="0.8" />
      <rect x="39" y="137" width="10" height="25" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      <rect x="51" y="137" width="10" height="25" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      {primary.length > 0 && (
        <>
          <circle cx="8" cy="172" r="3" fill="#ff5000" />
          <text x="14" y="175" fill="#ff8c00" fontSize="5" fontFamily="monospace">Primer kas</text>
        </>
      )}
      {secondary.length > 0 && (
        <>
          <circle cx="8" cy="182" r="3" fill="#ff8c0088" />
          <text x="14" y="185" fill="#888" fontSize="5" fontFamily="monospace">Sekonder kas</text>
        </>
      )}
    </svg>
  );
}