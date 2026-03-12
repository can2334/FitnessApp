"use client";
import React, { useState, useEffect, useRef, ReactNode } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Exercise {
  id: number;
  name: string;
  muscle: string;
  emoji: string;
  sets: number;
  reps: number;
  rest: number;
  calories: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleNames: { primary: string[]; secondary: string[] };
  correct: string[];
  wrong: string[];
  breath: string;
  tip: string;
}

interface WeeklyData { day: string; vol: number; kcal: number; }
interface WeightEntry { date: string; w: number; }
interface Meal { id: number; name: string; cal: number; protein: number; time: string; }
interface DaySchedule { day_index: number; is_rest: boolean; workout_id: null; }
interface GeneratedExercise { name: string; sets: number; reps: number; rest: number; tip?: string; }
interface GeneratedPlan {
  title: string;
  description: string;
  warmup?: string;
  exercises: GeneratedExercise[];
  cooldown?: string;
  frequency?: string;
  duration?: string;
}
type ModalType = "meal" | "weight" | "ai" | "exercise" | null;

// ─── EGZERSİZ VERİTABANI ─────────────────────────────────────────────────────
const EXERCISES: Exercise[] = [
  {
    id: 1, name: "Squat", muscle: "Bacak", emoji: "🦵", sets: 4, reps: 12, rest: 90, calories: 8,
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    muscleNames: { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Core"] },
    correct: ["Ayaklar omuz genişliğinde, parmaklar hafif dışa", "Diz ayak parmağıyla aynı yönde", "Sırt düz, göğüs yukarı", "Topuklar yerde, ağırlık topukta", "Kalça en az paralele iniyor"],
    wrong: ["Dizler içe çöküyor (valgus kollapsu)", "Topuklar yerden kalkıyor", "Sırt kamburlaşıyor", "Fazla öne eğilme"],
    breath: "İnerken nefes al → En altta tut → Çıkarken ver",
    tip: "Sanki arkana oturur gibi inin, dizlere değil kalçaya odaklanın",
  },
  {
    id: 2, name: "Bench Press", muscle: "Göğüs", emoji: "💪", sets: 4, reps: 10, rest: 120, calories: 7,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_shoulder"],
    muscleNames: { primary: ["Pectoralis Major"], secondary: ["Triceps", "Ön Deltoid"] },
    correct: ["Bar meme başı hizasına iniyor", "Kürek kemikleri birbirine yakın", "Dirsekler 45-75° açıda", "Ayaklar yerde sabit", "Bilek düz, kırılmıyor"],
    wrong: ["Bar boyuna veya karına iniyor", "Dirsekler tamamen yana açılıyor", "Kalça tezgahtan kalkıyor", "Bilek geriye kırılıyor"],
    breath: "İnerken nefes al → Göğüste tut → İterken ver",
    tip: "Bar indirirken 'yırtma' hareketi hayal et, daha fazla göğüs aktive olur",
  },
  {
    id: 3, name: "Deadlift", muscle: "Sırt", emoji: "🏋️", sets: 3, reps: 8, rest: 180, calories: 10,
    primaryMuscles: ["lower_back", "glutes", "hamstrings"],
    secondaryMuscles: ["traps", "core", "quads"],
    muscleNames: { primary: ["Erector Spinae", "Gluteus Maximus", "Hamstrings"], secondary: ["Trapezius", "Core"] },
    correct: ["Bar ayak ortası üzerinde", "Sırt düz, nötr omurga", "Kalça menteşe hareketi", "Bar bacaklara yapışık kalıyor", "Core boyunca sıkılı"],
    wrong: ["Sırt kamburlaşıyor — EN TEHLİKELİ HATA", "Bar vücuttan uzaklaşıyor", "Omuzlar geri gidiyor", "Diz bükülüp squat'a dönüyor"],
    breath: "Kaldırmadan derin al → Kaldırırken tut (Valsalva) → En üstte ver",
    tip: "Kaldırmadan önce 'yerden bastır' değil 'zemin ittir' diye düşün",
  },
  {
    id: 4, name: "Pull-up", muscle: "Sırt", emoji: "🔝", sets: 3, reps: 8, rest: 90, calories: 6,
    primaryMuscles: ["lats", "biceps"],
    secondaryMuscles: ["rear_shoulder", "core"],
    muscleNames: { primary: ["Latissimus Dorsi", "Biceps Brachii"], secondary: ["Arka Deltoid", "Core"] },
    correct: ["Kürek kemikleri önce aşağı çek, sonra kol bük", "Çene barın üstüne geliyor", "Tam aşağı inerek kollar açılıyor", "Core sıkılı, bacaklar çapraz", "Kontrollü iniş"],
    wrong: ["Sadece kollar çalışıyor, sırt devreye girmiyor", "Sallanarak momentum kullanımı", "Yarım hareket", "Boyun uzanarak çene değdirme"],
    breath: "Çıkarken ver → İnerken al",
    tip: "Barı dirseğine doğru çekiyormuş gibi düşün, bilek değil dirsek",
  },
  {
    id: 5, name: "Shoulder Press", muscle: "Omuz", emoji: "🙌", sets: 3, reps: 12, rest: 90, calories: 6,
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "traps"],
    muscleNames: { primary: ["Anterior & Medial Deltoid"], secondary: ["Triceps", "Trapezius"] },
    correct: ["Bar çene hizasından başlıyor", "Bel fazla kavislenmiyor", "Core sıkılı, dik duruş", "Baş bar geçerken hafif öne alınıyor", "Tam yukarı uzanıyor"],
    wrong: ["Bel aşırı kavislenip öne devrilme", "Dirsekler tamamen yana açılıyor", "Bacak yardımı ile itme (push press değilse)", "Yarım hareket"],
    breath: "İterken ver → İnerken al",
    tip: "Ayakta yaparken ayakları hafif önde-arkada koy, denge artar",
  },
  {
    id: 6, name: "Plank", muscle: "Core", emoji: "🧱", sets: 3, reps: 45, rest: 60, calories: 4,
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders", "glutes"],
    muscleNames: { primary: ["Rectus Abdominis", "Transverse Abdominis"], secondary: ["Omuzlar", "Gluteus"] },
    correct: ["Baştan topuğa düz bir çizgi", "Dirsekler omuz altında", "Core ve gluteus sıkılı", "Boyun nötr, yere bakıyor", "Nefes almaya devam"],
    wrong: ["Kalça yukarı çıkıyor", "Bel aşağı sarkıyor", "Boyun aşırı yukarı", "Nefes tutma — hata!"],
    breath: "Derin ve düzenli nefes — hiç tutma!",
    tip: "Her saniye biraz daha sık — son 5 saniyede her şeyi ver",
  },
  {
    id: 7, name: "Dumbbell Curl", muscle: "Bicep", emoji: "💪", sets: 3, reps: 15, rest: 60, calories: 5,
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    muscleNames: { primary: ["Biceps Brachii"], secondary: ["Brachialis", "Ön Kol"] },
    correct: ["Dirsekler gövdeye yapışık, sabit", "Yukarı çıkarken bilek döndürülüyor (supinasyon)", "Tam aşağı inerek tam kasılma", "Kontrollü yavaş iniş", "Dik duruş, sallanma yok"],
    wrong: ["Dirsekler öne gidiyor — momentum", "Sırt geriye yatıyor", "Hızlı ve sallantılı", "Yarım hareket"],
    breath: "Kaldırırken ver → İndirirken al",
    tip: "İniş (eksantrik) kısmını 3 saniyeye uzat — biceps daha fazla büyür",
  },
  {
    id: 8, name: "Lateral Raise", muscle: "Omuz", emoji: "🦅", sets: 3, reps: 15, rest: 60, calories: 4,
    primaryMuscles: ["side_shoulder"],
    secondaryMuscles: ["traps", "front_shoulder"],
    muscleNames: { primary: ["Medial (Yan) Deltoid"], secondary: ["Trapezius", "Ön Deltoid"] },
    correct: ["Kollar hafif önde, 30° açı — tam yana değil", "Dirsekler hafif bükük, sabit", "Küçük parmak yukarı döner (el şekli)", "90°'de dur, daha yukarı çıkma", "Kontrollü iniş, bırakma"],
    wrong: ["Kollar tam yana gidip trapeze kayıyor", "Dirsekler düz — yaralanma riski", "Sallanarak momentum", "Omuzlar kulağa doğru kalkıyor"],
    breath: "Kaldırırken ver → İndirirken al",
    tip: "Ellerini değil dirseklerini kaldırıyormuş gibi düşün — yan deltoid daha aktive",
  },
  {
    id: 9, name: "Romanian Deadlift", muscle: "Bacak", emoji: "🦵", sets: 3, reps: 10, rest: 120, calories: 9,
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "core"],
    muscleNames: { primary: ["Hamstrings", "Gluteus Maximus"], secondary: ["Alt Sırt", "Core"] },
    correct: ["Hafif diz bükümü, neredeyse düz bacak", "Kalça geriye itilir — menteşe hareketi", "Bar bacaklara yapışık iner", "Sırt düz boyunca", "Hamstring gerilince dur"],
    wrong: ["Sırt kamburlaşıyor", "Bar vücuttan uzaklaşıyor", "Dizler fazla bükülüyor — normal deadlift'e dönüyor", "Sadece bel bükülüyor"],
    breath: "İnerken al → Çıkarken ver",
    tip: "Hamstring'i 'yırtılacak gibi' hissedince mükemmel noktadasın",
  },
  {
    id: 10, name: "Push-up", muscle: "Göğüs", emoji: "🤸", sets: 3, reps: 15, rest: 60, calories: 5,
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "core", "front_shoulder"],
    muscleNames: { primary: ["Pectoralis Major"], secondary: ["Triceps", "Core", "Ön Deltoid"] },
    correct: ["Eller omuz genişliğinde veya biraz dışa", "Vücut baştan topuğa düz çizgi", "Göğüs yere değiyor ya da çok yakın", "Dirsekler 45° gövdeye yakın", "Core sıkılı"],
    wrong: ["Kalça yukarı çıkıyor veya aşağı sarkıyor", "Dirsekler tamamen yana açılıyor", "Yarım hareket", "Baş öne uzanıyor"],
    breath: "İnerken al → İterken ver",
    tip: "Yerleri 'dışa yırtıyormuş' gibi tut — göğüs daha çok aktive",
  },
];

const WEEKLY_DATA: WeeklyData[] = [
  { day: "Pzt", vol: 65, kcal: 420 }, { day: "Sal", vol: 40, kcal: 280 },
  { day: "Çrş", vol: 80, kcal: 510 }, { day: "Prş", vol: 55, kcal: 350 },
  { day: "Cum", vol: 90, kcal: 580 }, { day: "Cmt", vol: 30, kcal: 210 },
  { day: "Paz", vol: 0,  kcal: 0   },
];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// ─── KAS HARİTASI ─────────────────────────────────────────────────────────────
function MuscleMap({ primary = [], secondary = [] }: { primary?: string[]; secondary?: string[] }) {
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

// ─── EGZERSİZ ANİMASYONU ─────────────────────────────────────────────────────
function ExerciseAnimation({ exerciseName }: { exerciseName: string }) {
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
          <rect x={-8 + lx - 5} y={ly - 2.5} width="10" height="5" rx="1.5"
            fill="#ff5000" transform={`rotate(${-raiseAngle}, ${-8 + lx}, ${ly})`} />
          <line x1="8" y1="0" x2={8 - lx} y2={ly} stroke="#ff8c00" strokeWidth="3" strokeLinecap="round" />
          <rect x={8 - lx - 5} y={ly - 2.5} width="10" height="5" rx="1.5"
            fill="#ff5000" transform={`rotate(${raiseAngle}, ${8 - lx}, ${ly})`} />
          <path d={`M -8 0 A 15 15 0 0 0 ${-8 + lx * 0.5} ${ly * 0.5}`} fill="none" stroke="#ff500044" strokeWidth="1" />
          <text x="18" y="0" fill="#ff500099" fontSize="6" fontFamily="monospace">{Math.round(raiseAngle)}°</text>
          <line x1="-8" y1="0" x2="-36" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,2" />
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
          <line x1="-43" y1="-2" x2="35" y2="-2" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
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
          <text x="50" y="60" textAnchor="middle" fill="#ff500066" fontSize="8" fontFamily="monospace">
            {exerciseName}
          </text>
        )}
      </svg>
    </div>
  );
}

// ─── MODAL WRAPPER ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0c0c12", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 20, padding: 24, width: "100%", maxWidth: wide ? 680 : 460, maxHeight: "92vh", overflowY: "auto" }}>
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
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f0f0f0", fontSize: 13, outline: "none", fontFamily: "'DM Mono',monospace" }} />
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
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
  const waterTarget = isWorkoutDay ? 1.0 : 3.0;
  const waterGoal = 3.0;

  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: "Yulaf Ezmesi", cal: 320, protein: 12, time: "08:30" },
    { id: 2, name: "Tavuk + Pirinç", cal: 540, protein: 45, time: "13:00" },
  ]);
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealProtein, setMealProtein] = useState("");

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_index: i, is_rest: i === 1 || i === 3 || i === 6, workout_id: null }))
  );
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiLevel, setAiLevel] = useState("orta");
  const [aiMuscle, setAiMuscle] = useState("Bacak");
  const [aiGoal, setAiGoal] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const [modal, setModal] = useState<ModalType>(null);

  // ── Timer ──
  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  useEffect(() => {
    if (restTimer > 0) restRef.current = setTimeout(() => setRestTimer(r => r - 1), 1000);
    return () => clearTimeout(restRef.current);
  }, [restTimer]);

  // ── HATA DÜZELTMESİ 1: s parametresine number tipi eklendi ──
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const totalMealCal = meals.reduce((a: number, m: Meal) => a + m.cal, 0);
  const burnedCal = Object.keys(done).reduce((acc: number, k: string) => {
    const ex = EXERCISES.find((e: Exercise) => e.id === parseInt(k.split("-")[0]));
    return acc + (ex ? ex.calories : 0);
  }, 0);
  const filtered = filterMuscle === "Tümü" ? EXERCISES : EXERCISES.filter((e: Exercise) => e.muscle === filterMuscle);
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].w : 0;

  // ── HATA DÜZELTMESİ 2: parseFloat ile number tipine dönüştürüldü ──
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
    setMeals(p => [...p, { id: Date.now(), name: mealName, cal: Number(mealCal), protein: Number(mealProtein || 0), time: `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}` }]);
    setMealName(""); setMealCal(""); setMealProtein(""); setModal(null);
  };

  const addWeight = () => {
    if (!weightInput) return;
    const today = new Date();
    const label = `${String(today.getDate()).padStart(2,"0")}.${String(today.getMonth()+1).padStart(2,"0")}`;
    setWeightLog(p => [...p, { date: label, w: parseFloat(weightInput) }]);
    setWeightInput(""); setModal(null);
  };

  // ── HATA DÜZELTMESİ 3 + GEMİNİ API: Anthropic yerine /api/gemini kullanılıyor ──
  const generateAIPlan = async () => {
    setAiLoading(true);
    setGeneratedPlan(null);
    try {
      const prompt = `Sen bir kişisel fitness koçusun. Bana JSON formatında antrenman programı oluştur.

Parametreler:
- Hedef kas grubu: ${aiMuscle}
- Seviye: ${aiLevel}
- Ek hedef: ${aiGoal || "genel güç ve kas gelişimi"}

SADECE şu JSON formatını döndür, başka hiçbir şey yazma:
{
  "title": "Program başlığı",
  "description": "1-2 cümle açıklama",
  "warmup": "Isınma önerisi",
  "exercises": [
    { "name": "Egzersiz adı", "sets": 3, "reps": 12, "rest": 90, "tip": "Önemli bir ipucu" }
  ],
  "cooldown": "Soğuma önerisi",
  "frequency": "Haftada kaç gün",
  "duration": "Tahmini süre (dk)"
}

Egzersizler şunlardan seç (yoksa benzerini yaz): Squat, Bench Press, Deadlift, Pull-up, Shoulder Press, Plank, Dumbbell Curl, Lateral Raise, Romanian Deadlift, Push-up.
${aiLevel === "başlangıç" ? "3-4 egzersiz, düşük set/rep" : aiLevel === "orta" ? "4-5 egzersiz, orta yoğunluk" : "5-6 egzersiz, yüksek yoğunluk"}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const text: string = data.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const plan: GeneratedPlan = JSON.parse(clean);
      setGeneratedPlan(plan);
    } catch {
      setGeneratedPlan({ title: "Hata", description: "Plan oluşturulamadı, tekrar dene.", exercises: [] });
    }
    setAiLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07070d; }
        input::placeholder { color: #3f3f46; }
        input:focus, select:focus { border-color: rgba(255,80,0,0.5) !important; outline: none; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,80,0,0.3); border-radius: 2px; }
        select option { background: #0c0c12; color: #f0f0f0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .card-hover:hover { border-color: rgba(255,80,0,0.3) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#07070d", fontFamily: "'Syne',sans-serif", color: "#f0f0f0", overflowX: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(255,80,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,80,0,0.02) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(255,80,0,0.08) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", paddingBottom: 100 }}>

          {/* ── HEADER ── */}
          <header style={{ padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#ff5000", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>◆ AI FITNESS TRACKER</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                Günaydın,{" "}
                <span style={{ background: "linear-gradient(135deg,#ff5000,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sporcu</span> ⚡
              </h1>
            </div>
            <button onClick={() => setModal("ai")} style={{ padding: "8px 14px", background: "linear-gradient(135deg,rgba(255,80,0,0.2),rgba(255,140,0,0.15))", border: "1px solid rgba(255,80,0,0.4)", borderRadius: 10, color: "#ff8c00", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 5 }}>
              🤖 AI Program
            </button>
          </header>

          {/* ── REST TIMER ── */}
          {restTimer > 0 && (
            <div style={{ margin: "0 20px 12px", padding: "10px 18px", background: "rgba(255,80,0,0.08)", border: "1px solid rgba(255,80,0,0.35)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: "#ff5000", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>⏱ Dinlenme</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ff8c00", fontFamily: "'DM Mono',monospace" }}>{fmt(restTimer)}</span>
            </div>
          )}

          {/* ── SU UYARISI ── */}
          {isWorkoutDay && water < waterTarget && (
            <div style={{ margin: "0 20px 12px", padding: "10px 18px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>Spor günü minimum 1L su!</div>
                <div style={{ fontSize: 10, color: "#38bdf866", fontFamily: "'DM Mono',monospace" }}>{water.toFixed(1)}L içtin — {(waterTarget - water).toFixed(1)}L daha iç</div>
              </div>
            </div>
          )}

          {/* ── TABS ── */}
          <div style={{ display: "flex", margin: "8px 20px 16px", gap: 3, background: "rgba(255,255,255,0.03)", padding: 3, borderRadius: 12 }}>
            {[
              { id: "dashboard", label: "🏠 Ana" },
              { id: "workout", label: "💪 Antrenman" },
              { id: "weight", label: "⚖️ Kilo" },
              { id: "stats", label: "📊 İstatistik" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "8px 4px", border: "none", cursor: "pointer", borderRadius: 9, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: tab === t.id ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "transparent", color: tab === t.id ? "#fff" : "#444", boxShadow: tab === t.id ? "0 4px 14px rgba(255,80,0,0.28)" : "none" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ════════ DASHBOARD ════════ */}
          {tab === "dashboard" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { label: "KALORİ", val: totalMealCal, unit: "kcal", max: 2500, color: "#fb923c", dec: 0, action: undefined as (() => void) | undefined },
                  { label: "SU", val: water, unit: "L", max: 3, color: "#38bdf8", dec: 1, action: undefined as (() => void) | undefined },
                  { label: "YAKILAN", val: burnedCal, unit: "kcal", max: 600, color: "#f43f5e", dec: 0, action: undefined as (() => void) | undefined },
                  { label: "KİLO", val: currentWeight, unit: "kg", max: 120, color: "#4ade80", dec: 1, action: (() => setModal("weight")) as (() => void) | undefined },
                ] as { label: string; val: number; unit: string; max: number; color: string; dec: number; action?: () => void }[]).map((s, i) => {
                  const r = 20; const circ = 2 * Math.PI * r;
                  const prog = Math.min(Number(s.val) / s.max, 1) * circ;
                  return (
                    <div key={i} className="card-hover" onClick={s.action} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "14px 16px", cursor: s.action ? "pointer" : "default", position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
                      <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: "50%", background: s.color, opacity: 0.07, filter: "blur(16px)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: 8, color: "#3f3f46", letterSpacing: 2.5, fontFamily: "'DM Mono',monospace", marginBottom: 5, textTransform: "uppercase" }}>{s.label}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>{s.dec ? Number(s.val).toFixed(s.dec) : s.val}</span>
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
                  const s = weekSchedule.find((x: DaySchedule) => x.day_index === i);
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setIsWorkoutDay(w => !w)} style={{ padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", background: isWorkoutDay ? "rgba(255,80,0,0.15)" : "rgba(255,255,255,0.06)", color: isWorkoutDay ? "#ff8c00" : "#555", transition: "all 0.2s" }}>
                      {isWorkoutDay ? "🏋️ Spor Günü" : "🛋️ Dinlenme"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#38bdf8", letterSpacing: -1, fontFamily: "'DM Mono',monospace" }}>{water.toFixed(1)}L</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: water >= waterGoal ? "#4ade80" : water >= waterTarget ? "#ff8c00" : "#38bdf8", fontFamily: "'DM Mono',monospace" }}>
                      {water >= waterGoal ? "✓ Harika!" : water >= waterTarget ? `✓ Spor min. tamam` : `⚠ ${(waterTarget - water).toFixed(1)}L daha içmeli!`}
                    </div>
                    <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>Hedef: {waterGoal}L {isWorkoutDay && "| Spor min: 1L"}</div>
                  </div>
                </div>
                <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ height: "100%", width: `${Math.min((water / waterGoal) * 100, 100)}%`, background: water >= waterGoal ? "#4ade80" : water >= waterTarget ? "#38bdf8" : "#f43f5e", borderRadius: 3, transition: "all 0.5s ease" }} />
                  {isWorkoutDay && (
                    <div style={{ position: "absolute", top: 0, left: `${(waterTarget / waterGoal) * 100}%`, width: 2, height: "100%", background: "#ff8c00", opacity: 0.8 }} />
                  )}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {[0.25, 0.25, 0.5, 0.5, 1.0].map((amt, i) => (
                    <button key={i} onClick={() => setWater(w => parseFloat(Math.min(w + amt, 5).toFixed(2)))} style={{ flex: 1, height: 32, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 7, color: "#38bdf8", fontWeight: 800, fontSize: 9, cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "transform 0.15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
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
                    <button onClick={() => setModal("meal")} style={{ padding: "4px 10px", background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 7, color: "#fb923c", fontSize: 11, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>+ Ekle</button>
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
                        <button onClick={() => setMeals(p => p.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", color: "#3f3f46", cursor: "pointer", fontSize: 16 }} onMouseEnter={e => e.currentTarget.style.color = "#f43f5e"} onMouseLeave={e => e.currentTarget.style.color = "#3f3f46"}>×</button>
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

          {/* ════════ ANTRENMAN ════════ */}
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
                  return (
                    <div key={ex.id} style={{ background: allDone ? "rgba(255,80,0,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${allDone ? "rgba(255,80,0,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s" }}>
                      <div onClick={() => setExpanded(isExp ? null : ex.id)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: allDone ? "rgba(255,80,0,0.18)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                          {allDone ? "✅" : ex.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: allDone ? "#ff8c00" : "#f0f0f0", marginBottom: 2 }}>{ex.name}</div>
                          <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>
                            {ex.muscle} · {ex.sets}×{ex.reps}{ex.muscle === "Core" ? "sn" : ""} · {ex.rest}sn
                          </div>
                          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                            {ex.muscleNames.primary.map(m => (
                              <span key={m} style={{ fontSize: 8, padding: "1px 6px", background: "rgba(255,80,0,0.12)", color: "#ff8c00", borderRadius: 10, fontFamily: "'DM Mono',monospace" }}>{m}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#ff5000" : "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{doneCount}/{ex.sets}</div>
                          <button onClick={e => { e.stopPropagation(); setSelectedEx(ex); setModal("exercise"); }} style={{ fontSize: 9, padding: "3px 8px", background: "rgba(255,80,0,0.1)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 6, color: "#ff8c00", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
                            Form
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
                            <input type="number" value={exWeights[ex.id] ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExWeights((w: Record<number, string>) => ({ ...w, [ex.id]: e.target.value }))} placeholder="0" style={{ width: 64, padding: "6px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f0f0f0", fontSize: 13, fontFamily: "'DM Mono',monospace", outline: "none", textAlign: "center" }} />
                            <span style={{ fontSize: 9, color: "#2d2d2d", fontFamily: "'DM Mono',monospace" }}>~{ex.calories} kcal/set</span>
                          </div>
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                            {Array.from({ length: ex.sets }, (_, i) => {
                              const isDone = done[`${ex.id}-${i}`];
                              return (
                                <button key={i} onClick={() => toggleSet(ex.id, i, ex.rest)} style={{ padding: "9px 14px", border: "none", cursor: "pointer", borderRadius: 8, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: isDone ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.06)", color: isDone ? "#fff" : "#444", boxShadow: isDone ? "0 3px 10px rgba(255,80,0,0.28)" : "none", transform: isDone ? "scale(1.05)" : "scale(1)" }}>
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

          {/* ════════ KİLO TAKİBİ ════════ */}
          {tab === "weight" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "MEVCUT", val: `${currentWeight}`, unit: "kg", color: "#4ade80" },
                  { label: "HEDEF", val: `${targetWeight}`, unit: "kg", color: "#ff8c00" },
                  // ── HATA DÜZELTMESİ 2: weightDiff artık number, > operatörü çalışır ──
                  { label: "FARK", val: weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`, unit: "kg", color: weightDiff < 0 ? "#4ade80" : "#f43f5e" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, letterSpacing: 2, color: "#3f3f46", fontFamily: "'DM Mono',monospace", marginBottom: 6, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -1, fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{s.unit}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700 }}>📈 Kilo Grafiği</h2>
                  <button onClick={() => setModal("weight")} style={{ padding: "5px 12px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, color: "#4ade80", fontSize: 11, cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>+ Giriş</button>
                </div>

                {weightLog.length > 1 && (() => {
                  const W = 280, H = 100;
                  const minW = Math.min(...weightLog.map((e: WeightEntry) => e.w)) - 1;
                  const maxW = Math.max(...weightLog.map((e: WeightEntry) => e.w)) + 1;
                  const pts = weightLog.map((e: WeightEntry, i: number) => {
                    const x = (i / (weightLog.length - 1)) * W;
                    const y = H - ((e.w - minW) / (maxW - minW)) * H;
                    return { x, y, ...e };
                  });
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
                      {[0, 0.25, 0.5, 0.75, 1].map(p => (
                        <line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      ))}
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
                <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📋 Kayıtlar</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {[...weightLog].reverse().map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono',monospace" }}>{e.date}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono',monospace" }}>{e.w} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🎯 Hedef Kilo</h2>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="number" value={targetWeight} onChange={e => setTargetWeight(parseFloat(e.target.value))} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0f0f0", fontSize: 16, fontFamily: "'DM Mono',monospace", outline: "none", fontWeight: 700 }} />
                  <span style={{ fontSize: 13, color: "#555", fontFamily: "'DM Mono',monospace" }}>kg</span>
                  <div style={{ fontSize: 13, color: currentWeight > targetWeight ? "#f43f5e" : "#4ade80", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                    {currentWeight > targetWeight ? `▼ ${(currentWeight - targetWeight).toFixed(1)}kg ver` : `✓ Hedefe ${(targetWeight - currentWeight).toFixed(1)}kg kaldı`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ İSTATİSTİK ════════ */}
          {tab === "stats" && (
            <div className="fade-up" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>HAFTALIK ÖZET</div>

              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 90, marginBottom: 12 }}>
                  {WEEKLY_DATA.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: d.vol > 0 ? "linear-gradient(180deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.04)", height: `${d.vol}%`, boxShadow: d.vol > 70 ? "0 0 10px rgba(255,80,0,0.3)" : "none", transition: "height 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 8, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{d.day}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: "#2d2d2d", textAlign: "center", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: 2 }}>Antrenman Yoğunluğu</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { emoji: "📅", val: "5", unit: "antrenman", label: "Bu Hafta" },
                  { emoji: "⏱️", val: fmt(timerSec), unit: "aktif süre", label: "Bugün" },
                  { emoji: "🔥", val: String(burnedCal), unit: "kcal yakıldı", label: "Antrenman" },
                  { emoji: "💧", val: `${water.toFixed(1)}L`, unit: "su", label: isWorkoutDay && water >= 1 ? "✓ Min tamam" : "Bugün" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 14px" }}>
                    <div style={{ fontSize: 18, marginBottom: 7 }}>{s.emoji}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 2, fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                    <div style={{ fontSize: 8, color: "#3f3f46", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace" }}>{s.unit}</div>
                    <div style={{ fontSize: 9, color: "#ff5000", marginTop: 3, fontFamily: "'DM Mono',monospace" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>GÜNLÜK KALORİ</div>
                {WEEKLY_DATA.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, color: "#3f3f46", width: 24, textAlign: "right", fontFamily: "'DM Mono',monospace" }}>{d.day}</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "linear-gradient(90deg,#ff5000,#ffd700)", borderRadius: 3, width: `${(d.kcal / 600) * 100}%`, transition: "width 0.7s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#555", width: 55, fontFamily: "'DM Mono',monospace" }}>{d.kcal} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 520, background: "rgba(7,7,13,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 20px 16px", display: "flex", justifyContent: "space-around", zIndex: 100 }}>
          {[{ id: "dashboard", e: "🏠", l: "Ana" }, { id: "workout", e: "💪", l: "Antrenman" }, { id: "weight", e: "⚖️", l: "Kilo" }, { id: "stats", e: "📊", l: "İstatistik" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "3px 14px", transition: "all 0.2s" }}>
              <span style={{ fontSize: 18, transition: "transform 0.2s", transform: tab === t.id ? "scale(1.25)" : "scale(1)", display: "block" }}>{t.e}</span>
              <span style={{ fontSize: 8, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: tab === t.id ? "#ff5000" : "#2d2d2d", fontWeight: tab === t.id ? 700 : 400 }}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════ MODAL: EGZERSİZ FORM KILAVUZU ════ */}
      {modal === "exercise" && selectedEx && (
        <Modal title={`${selectedEx.emoji} ${selectedEx.name} — Form Rehberi`} onClose={() => setModal(null)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>Hareket Animasyonu</div>
                <ExerciseAnimation exerciseName={selectedEx.name} />
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>Kas Haritası</div>
                <div style={{ background: "rgba(255,80,0,0.04)", border: "1px solid rgba(255,80,0,0.15)", borderRadius: 14, padding: 10, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MuscleMap primary={selectedEx.primaryMuscles} secondary={selectedEx.secondaryMuscles} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(255,80,0,0.08)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>🔴 Primer Kaslar</div>
                {selectedEx.muscleNames.primary.map(m => (
                  <div key={m} style={{ fontSize: 12, color: "#ff8c00", fontWeight: 700, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#888", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>🟡 Sekonder Kaslar</div>
                {selectedEx.muscleNames.secondary.map(m => (
                  <div key={m} style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 3 }}>• {m}</div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#4ade80", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>✅ DOĞRU FORM</div>
              {selectedEx.correct.map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: "#d4d4d4", marginBottom: 6, lineHeight: 1.5, paddingLeft: 4 }}>{tip}</div>
              ))}
            </div>

            <div style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#f43f5e", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>❌ YANLIŞ FORM — Kaçın!</div>
              {selectedEx.wrong.map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: "#d4d4d4", marginBottom: 6, lineHeight: 1.5, paddingLeft: 4 }}>{tip}</div>
              ))}
            </div>

            <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#38bdf8", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>💨 NEFES TEKNİĞİ</div>
              <div style={{ fontSize: 13, color: "#d4d4d4", lineHeight: 1.6 }}>{selectedEx.breath}</div>
            </div>

            <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ffd700", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>💡 PRO İPUCU</div>
              <div style={{ fontSize: 13, color: "#d4d4d4", lineHeight: 1.6 }}>{selectedEx.tip}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* ════ MODAL: AI PROGRAM ════ */}
      {modal === "ai" && (
        <Modal title="🤖 AI Antrenman Programı" onClose={() => setModal(null)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono',monospace", lineHeight: 1.6 }}>
              Sana özel antrenman programı oluşturuyorum. Seviyeni ve hedef kas grubunu seç.
            </p>

            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>SEVİYE</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["başlangıç", "orta", "ileri"].map(l => (
                  <button key={l} onClick={() => setAiLevel(l)} style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: 10, fontSize: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: aiLevel === l ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.05)", color: aiLevel === l ? "#fff" : "#555", boxShadow: aiLevel === l ? "0 4px 12px rgba(255,80,0,0.28)" : "none", textTransform: "capitalize" }}>
                    {l === "başlangıç" ? "🌱 Başlangıç" : l === "orta" ? "🔥 Orta" : "⚡ İleri"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>HEDEF KAS GRUBU</div>
              {/* ── HATA DÜZELTMESİ 3: Çift border kaldırıldı, tek border kullanılıyor ── */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Bacak", "Göğüs", "Sırt", "Omuz", "Core", "Bicep", "Tricep", "Tam Vücut"].map(m => (
                  <button key={m} onClick={() => setAiMuscle(m)} style={{ padding: "7px 13px", cursor: "pointer", borderRadius: 50, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: aiMuscle === m ? "rgba(255,80,0,0.2)" : "rgba(255,255,255,0.05)", color: aiMuscle === m ? "#ff8c00" : "#555", border: aiMuscle === m ? "1px solid rgba(255,80,0,0.4)" : "1px solid transparent" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>EK HEDEF (opsiyonel)</div>
              <FInput placeholder="Örn: kilo vermek, güç artışı, kas kütlesi..." value={aiGoal} onChange={e => setAiGoal(e.target.value)} />
            </div>

            <button onClick={generateAIPlan} disabled={aiLoading} style={{ padding: "13px", background: aiLoading ? "rgba(255,80,0,0.1)" : "linear-gradient(135deg,#ff5000,#ff8c00)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 800, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: 0.5, boxShadow: aiLoading ? "none" : "0 6px 20px rgba(255,80,0,0.35)", transition: "all 0.3s", opacity: aiLoading ? 0.7 : 1 }}>
              {aiLoading ? "🤖 Program oluşturuluyor..." : "🚀 Program Oluştur"}
            </button>

            {generatedPlan && (
              <div style={{ background: "rgba(255,80,0,0.04)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s ease" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#ff8c00", marginBottom: 4 }}>{generatedPlan.title}</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{generatedPlan.description}</div>
                </div>

                {generatedPlan.warmup && (
                  <div style={{ padding: "10px 14px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10 }}>
                    <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 4 }}>Isınma</div>
                    <div style={{ fontSize: 12, color: "#ccc" }}>{generatedPlan.warmup}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 9, color: "#ff5000", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>Egzersizler</div>
                  {generatedPlan.exercises?.map((ex, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{ex.name}</div>
                        {ex.tip && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.4 }}>💡 {ex.tip}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#ff8c00", fontFamily: "'DM Mono',monospace" }}>{ex.sets}×{ex.reps}</div>
                        <div style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'DM Mono',monospace" }}>{ex.rest}sn dinlenme</div>
                      </div>
                    </div>
                  ))}
                </div>

                {generatedPlan.cooldown && (
                  <div style={{ padding: "10px 14px", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10 }}>
                    <div style={{ fontSize: 9, color: "#38bdf8", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 4 }}>Soğuma</div>
                    <div style={{ fontSize: 12, color: "#ccc" }}>{generatedPlan.cooldown}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  {[{ label: "Frekans", val: generatedPlan.frequency }, { label: "Süre", val: generatedPlan.duration }].map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 8, color: "#3f3f46", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", marginBottom: 3, textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#ff8c00" }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ════ MODAL: ÖĞÜN ════ */}
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

      {/* ════ MODAL: KİLO GİRİŞ ════ */}
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