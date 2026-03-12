"use client";
import React, { useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Float } from "@react-three/drei";
import * as THREE from "three";

// ─── TYPES ────────────────────────────────────────────────────
type EquipmentKey = "BARBELL" | "DUMBBELL" | "BODYWEIGHT" | "CABLE" | "MACHINE" | "KETTLEBELL";

interface Exercise { id: string; name: string; anim: string; }
interface EquipmentData { label: string; color: string; muscles: Record<string, Exercise[]>; }

interface AnimState {
  // Gövde pozisyonu ve rotasyonu
  bodyY: number;
  bodyRotX: number; // vücudun tüm rotasyonu (yatma, push-up vs)
  bodyRotZ: number;
  bodyRotY: number;
  trunkBend: number;   // üst gövde öne eğimi (+ = öne, fizyolojik)
  pelvicTilt: number;

  // Omuzlar
  shoulderY: number;
  lShX: number;  // sol omuz X rotasyonu (+ = öne kaldır)
  lShZ: number;  // sol omuz Z (- = yana aç / abduction)
  lElbow: number; // dirsek bükme (+ = büküm)
  rShX: number;
  rShZ: number;
  rElbow: number;

  // Bacaklar — TAM BAĞIMSIZ eklemler
  // Hip+  = uyluk öne (fleksiyon, squat gibi)
  // Hip-  = uyluk arkaya (extension, kick-back)
  // Knee+ = diz bükülür (bacak arkaya katlanır — DOĞAL yön)
  // Ankle+= ayak ucu aşağı
  lHip: number;
  lKnee: number;
  lAnkle: number;
  rHip: number;
  rKnee: number;
  rAnkle: number;
}

interface HumanModelProps { animId: string; playing: boolean; equipment: EquipmentKey; }
interface SceneProps { animId: string; playing: boolean; equipment: EquipmentKey; }

// ─── MATERIALS ───────────────────────────────────────────────
const skinMat   = new THREE.MeshStandardMaterial({ color: "#c8956c", roughness: 0.8 });
const muscleMat = new THREE.MeshStandardMaterial({ color: "#b07850", roughness: 0.75 });
const deepMat   = new THREE.MeshStandardMaterial({ color: "#8a5c38", roughness: 0.8 });
const shortsMat = new THREE.MeshStandardMaterial({ color: "#1a1a2e", roughness: 0.95 });
const shoesMat  = new THREE.MeshStandardMaterial({ color: "#111", metalness: 0.3, roughness: 0.6 });
const hairMat   = new THREE.MeshStandardMaterial({ color: "#1a0a00", roughness: 0.9 });
const eyeMat    = new THREE.MeshStandardMaterial({ color: "#111" });
const weightMat = new THREE.MeshStandardMaterial({ color: "#222", metalness: 0.9, roughness: 0.2 });
const barMat    = new THREE.MeshStandardMaterial({ color: "#bbb", metalness: 0.95, roughness: 0.15 });
const plateMat  = new THREE.MeshStandardMaterial({ color: "#c0392b", metalness: 0.6, roughness: 0.4 });
const cableMat  = new THREE.MeshStandardMaterial({ color: "#333", metalness: 0.8, roughness: 0.3 });

// ─── EXERCISES DB ────────────────────────────────────────────
const EXERCISES: Record<EquipmentKey, EquipmentData> = {
  BARBELL: { label: "🏋️ Barbell", color: "#e74c3c", muscles: {
    "Göğüs": [
      { id:"bb_bench",name:"Barbell Bench Press",anim:"bench_press" },
      { id:"bb_incline",name:"Incline Bench Press",anim:"incline_press" },
      { id:"bb_decline",name:"Decline Bench Press",anim:"decline_press" },
      { id:"bb_closegrip",name:"Close Grip Bench Press",anim:"close_grip_bench" },
    ],
    "Sırt": [
      { id:"bb_deadlift",name:"Deadlift",anim:"deadlift" },
      { id:"bb_row",name:"Bent Over Row",anim:"bent_row" },
      { id:"bb_sumo",name:"Sumo Deadlift",anim:"sumo_deadlift" },
      { id:"bb_rack",name:"Rack Pull",anim:"deadlift" },
      { id:"bb_gm",name:"Good Morning",anim:"good_morning" },
    ],
    "Bacak": [
      { id:"bb_squat",name:"Back Squat",anim:"squat" },
      { id:"bb_frontsquat",name:"Front Squat",anim:"squat" },
      { id:"bb_rdl",name:"Romanian Deadlift",anim:"rdl" },
      { id:"bb_lunge",name:"Barbell Lunge",anim:"lunge" },
      { id:"bb_hipthrust",name:"Hip Thrust",anim:"hip_thrust" },
      { id:"bb_hack",name:"Hack Squat",anim:"squat" },
    ],
    "Omuz": [
      { id:"bb_ohp",name:"Overhead Press",anim:"ohp" },
      { id:"bb_pushpress",name:"Push Press",anim:"ohp" },
      { id:"bb_uprightrow",name:"Upright Row",anim:"upright_row" },
    ],
    "Kol": [
      { id:"bb_curl",name:"Barbell Curl",anim:"bb_curl" },
      { id:"bb_skull",name:"Skull Crusher",anim:"skull_crusher" },
      { id:"bb_revcurl",name:"Reverse Curl",anim:"bb_curl" },
      { id:"bb_preacher",name:"Preacher Curl",anim:"preacher_curl" },
    ],
  }},
  DUMBBELL: { label: "🔩 Dumbbell", color: "#e67e22", muscles: {
    "Göğüs": [
      { id:"db_fly",name:"Dumbbell Fly",anim:"db_fly" },
      { id:"db_press",name:"DB Bench Press",anim:"db_bench_press" },
      { id:"db_pullover",name:"Dumbbell Pullover",anim:"pullover" },
      { id:"db_inclinefly",name:"Incline DB Fly",anim:"db_fly" },
      { id:"db_inclinepress",name:"Incline DB Press",anim:"incline_press" },
    ],
    "Sırt": [
      { id:"db_row",name:"One Arm DB Row",anim:"db_row" },
      { id:"db_sealrow",name:"Seal Row",anim:"db_row" },
      { id:"db_renegade",name:"Renegade Row",anim:"renegade_row" },
      { id:"db_shrug",name:"Dumbbell Shrug",anim:"shrug" },
    ],
    "Bacak": [
      { id:"db_goblet",name:"Goblet Squat",anim:"goblet_squat" },
      { id:"db_rdl",name:"DB Romanian DL",anim:"rdl" },
      { id:"db_lunge",name:"Dumbbell Lunge",anim:"lunge" },
      { id:"db_stepup",name:"Step Up",anim:"step_up" },
      { id:"db_hipthrust",name:"DB Hip Thrust",anim:"hip_thrust" },
      { id:"db_bulgarian",name:"Bulgarian Split Squat",anim:"split_squat" },
      { id:"db_sumo",name:"DB Sumo Squat",anim:"squat" },
    ],
    "Omuz": [
      { id:"db_lateral",name:"Lateral Raise",anim:"lateral_raise" },
      { id:"db_front",name:"Front Raise",anim:"front_raise" },
      { id:"db_press",name:"DB Shoulder Press",anim:"db_ohp" },
      { id:"db_reardelt",name:"Rear Delt Fly",anim:"rear_delt_fly" },
      { id:"db_arnold",name:"Arnold Press",anim:"arnold_press" },
      { id:"db_uprightrow",name:"DB Upright Row",anim:"upright_row" },
    ],
    "Kol": [
      { id:"db_curl",name:"Dumbbell Curl",anim:"db_curl" },
      { id:"db_hammer",name:"Hammer Curl",anim:"db_curl" },
      { id:"db_inclinecurl",name:"Incline Curl",anim:"incline_curl" },
      { id:"db_concentration",name:"Concentration Curl",anim:"concentration_curl" },
      { id:"db_kickback",name:"Tricep Kickback",anim:"tricep_kickback" },
      { id:"db_ohtricep",name:"Overhead Tricep Ext",anim:"overhead_tricep" },
    ],
  }},
  BODYWEIGHT: { label: "🤸 Vücut Ağırlığı", color: "#27ae60", muscles: {
    "Göğüs": [
      { id:"bw_pushup",name:"Push Up",anim:"pushup" },
      { id:"bw_wide",name:"Wide Push Up",anim:"pushup" },
      { id:"bw_diamond",name:"Diamond Push Up",anim:"pushup" },
      { id:"bw_pike",name:"Pike Push Up",anim:"pike_pushup" },
      { id:"bw_dip",name:"Chest Dip",anim:"dip" },
      { id:"bw_decline",name:"Decline Push Up",anim:"pushup" },
    ],
    "Sırt": [
      { id:"bw_pullup",name:"Pull Up",anim:"pullup" },
      { id:"bw_chinup",name:"Chin Up",anim:"chinup" },
      { id:"bw_invertedrow",name:"Inverted Row",anim:"inverted_row" },
      { id:"bw_superman",name:"Superman Hold",anim:"superman" },
      { id:"bw_backext",name:"Back Extension",anim:"back_extension" },
    ],
    "Bacak": [
      { id:"bw_squat",name:"Bodyweight Squat",anim:"squat" },
      { id:"bw_pistol",name:"Pistol Squat",anim:"pistol_squat" },
      { id:"bw_lunge",name:"Bodyweight Lunge",anim:"lunge" },
      { id:"bw_jumpsquat",name:"Jump Squat",anim:"jump_squat" },
      { id:"bw_glutebridge",name:"Glute Bridge",anim:"glute_bridge" },
      { id:"bw_calf",name:"Calf Raise",anim:"calf_raise" },
      { id:"bw_nordic",name:"Nordic Curl",anim:"nordic_curl" },
      { id:"bw_wallsit",name:"Wall Sit",anim:"wall_sit" },
      { id:"bw_stepup",name:"Step Up",anim:"step_up" },
      { id:"bw_split",name:"Split Squat",anim:"split_squat" },
    ],
    "Karın": [
      { id:"bw_crunch",name:"Crunch",anim:"crunch" },
      { id:"bw_plank",name:"Plank",anim:"plank" },
      { id:"bw_sideplank",name:"Side Plank",anim:"side_plank" },
      { id:"bw_legraise",name:"Leg Raise",anim:"leg_raise" },
      { id:"bw_bicycle",name:"Bicycle Crunch",anim:"bicycle_crunch" },
      { id:"bw_mountainclimber",name:"Mountain Climber",anim:"mountain_climber" },
      { id:"bw_russiantwist",name:"Russian Twist",anim:"russian_twist" },
      { id:"bw_vup",name:"V-Up",anim:"v_up" },
      { id:"bw_hollow",name:"Hollow Hold",anim:"hollow_hold" },
      { id:"bw_toestobar",name:"Toes to Bar",anim:"toes_to_bar" },
      { id:"bw_abwheel",name:"Ab Wheel Rollout",anim:"ab_wheel" },
    ],
    "Kol": [
      { id:"bw_tricepdip",name:"Tricep Dip",anim:"dip" },
      { id:"bw_closepu",name:"Close Grip Push Up",anim:"pushup" },
      { id:"bw_handstandpu",name:"Handstand Push Up",anim:"handstand_pu" },
    ],
  }},
  CABLE: { label: "🔗 Kablo", color: "#8e44ad", muscles: {
    "Göğüs": [
      { id:"cable_crossover",name:"Cable Crossover",anim:"cable_fly" },
      { id:"cable_lowfly",name:"Low Cable Fly",anim:"cable_fly" },
      { id:"cable_highfly",name:"High Cable Fly",anim:"cable_fly" },
      { id:"cable_press",name:"Cable Chest Press",anim:"machine_press" },
    ],
    "Sırt": [
      { id:"cable_pulldown",name:"Lat Pulldown",anim:"lat_pulldown" },
      { id:"cable_seatedrow",name:"Seated Cable Row",anim:"seated_row" },
      { id:"cable_facepull",name:"Face Pull",anim:"face_pull" },
      { id:"cable_straightarm",name:"Straight Arm Pulldown",anim:"straight_arm_pd" },
      { id:"cable_singlerow",name:"Single Arm Cable Row",anim:"db_row" },
    ],
    "Omuz": [
      { id:"cable_lateral",name:"Cable Lateral Raise",anim:"lateral_raise" },
      { id:"cable_front",name:"Cable Front Raise",anim:"front_raise" },
      { id:"cable_reardelt",name:"Cable Rear Delt Fly",anim:"rear_delt_fly" },
      { id:"cable_upright",name:"Cable Upright Row",anim:"upright_row" },
      { id:"cable_shrug",name:"Cable Shrug",anim:"shrug" },
    ],
    "Kol": [
      { id:"cable_curl",name:"Cable Curl",anim:"db_curl" },
      { id:"cable_hammer",name:"Cable Hammer Curl",anim:"db_curl" },
      { id:"cable_ohcurl",name:"Overhead Cable Curl",anim:"overhead_curl" },
      { id:"cable_pushdown",name:"Tricep Pushdown",anim:"cable_pushdown" },
      { id:"cable_ohtricep",name:"Cable Overhead Tricep",anim:"overhead_tricep" },
      { id:"cable_kickback",name:"Cable Kickback",anim:"tricep_kickback" },
    ],
    "Karın": [
      { id:"cable_crunch",name:"Cable Crunch",anim:"cable_crunch" },
      { id:"cable_woodchop",name:"Cable Woodchop",anim:"woodchop" },
      { id:"cable_pallof",name:"Pallof Press",anim:"pallof" },
    ],
  }},
  MACHINE: { label: "⚙️ Makine", color: "#2980b9", muscles: {
    "Göğüs": [
      { id:"m_chestpress",name:"Chest Press Machine",anim:"machine_press" },
      { id:"m_pecdeck",name:"Pec Deck Fly",anim:"cable_fly" },
      { id:"m_smithbench",name:"Smith Machine Bench",anim:"bench_press" },
    ],
    "Sırt": [
      { id:"m_latpulldown",name:"Machine Lat Pulldown",anim:"lat_pulldown" },
      { id:"m_seatedrow",name:"Machine Seated Row",anim:"seated_row" },
      { id:"m_tbarrow",name:"T-Bar Row Machine",anim:"bent_row" },
      { id:"m_backext",name:"Back Extension",anim:"back_extension" },
    ],
    "Bacak": [
      { id:"m_legpress",name:"Leg Press",anim:"leg_press" },
      { id:"m_legext",name:"Leg Extension",anim:"leg_extension" },
      { id:"m_legcurl",name:"Leg Curl",anim:"leg_curl" },
      { id:"m_adductor",name:"Hip Adductor",anim:"hip_adductor" },
      { id:"m_abductor",name:"Hip Abductor",anim:"hip_adductor" },
      { id:"m_calf",name:"Calf Press Machine",anim:"calf_raise" },
      { id:"m_hacksquat",name:"Hack Squat Machine",anim:"squat" },
      { id:"m_smithsquat",name:"Smith Machine Squat",anim:"squat" },
      { id:"m_hipthrust",name:"Hip Thrust Machine",anim:"hip_thrust" },
    ],
    "Omuz": [
      { id:"m_shoulderpress",name:"Machine Shoulder Press",anim:"db_ohp" },
      { id:"m_lateral",name:"Machine Lateral Raise",anim:"lateral_raise" },
      { id:"m_reardelt",name:"Machine Rear Delt Fly",anim:"rear_delt_fly" },
    ],
    "Kol": [
      { id:"m_preacher",name:"Machine Preacher Curl",anim:"preacher_curl" },
      { id:"m_triceppress",name:"Machine Tricep Press",anim:"cable_pushdown" },
    ],
  }},
  KETTLEBELL: { label: "🫙 Kettlebell", color: "#16a085", muscles: {
    "Tüm Vücut": [
      { id:"kb_swing",name:"Kettlebell Swing",anim:"kb_swing" },
      { id:"kb_cleanpress",name:"Clean & Press",anim:"ohp" },
      { id:"kb_snatch",name:"Kettlebell Snatch",anim:"kb_snatch" },
      { id:"kb_turkishgetup",name:"Turkish Get Up",anim:"kb_swing" },
      { id:"kb_windmill",name:"KB Windmill",anim:"woodchop" },
    ],
    "Bacak": [
      { id:"kb_goblet",name:"KB Goblet Squat",anim:"goblet_squat" },
      { id:"kb_sumo",name:"KB Sumo Squat",anim:"squat" },
      { id:"kb_rdl",name:"KB Romanian DL",anim:"rdl" },
      { id:"kb_lunge",name:"KB Lunge",anim:"lunge" },
      { id:"kb_split",name:"KB Split Squat",anim:"split_squat" },
    ],
    "Omuz & Kol": [
      { id:"kb_press",name:"KB Overhead Press",anim:"db_ohp" },
      { id:"kb_halo",name:"KB Halo",anim:"kb_halo" },
      { id:"kb_curl",name:"KB Curl",anim:"db_curl" },
      { id:"kb_tricep",name:"KB Tricep Extension",anim:"overhead_tricep" },
    ],
    "Karın": [
      { id:"kb_aroundworld",name:"Around the World",anim:"kb_halo" },
      { id:"kb_russiantwist",name:"KB Russian Twist",anim:"russian_twist" },
    ],
  }},
};

// ─── ANIMATION ENGINE ────────────────────────────────────────
// Açı sözleşmesi (Three.js sağ el koordinat sistemi):
//   Hip+   = uyluk öne kaldırılır (fleksiyon)  → bacak ileri
//   Knee+  = diz bükülür (bacak arkaya katlanır) → DOĞAL yön
//   Trunk+ = gövde öne eğilir
function calcAnim(id: string, t: number): AnimState {
  const p    = (Math.sin(t * 2.5) + 1) / 2;   // 0..1
  const s    = Math.sin(t * 2.5);               // -1..1
  const slow = (Math.sin(t * 1.2) + 1) / 2;    // yavaş

  const B: AnimState = {
    bodyY: 1.15, bodyRotX: 0, bodyRotZ: 0, bodyRotY: 0,
    trunkBend: 0, pelvicTilt: 0,
    shoulderY: 0.5,
    lShX: 0.12, lShZ: -0.18, lElbow: 0.15,
    rShX: 0.12, rShZ:  0.18, rElbow: 0.15,
    lHip: 0, lKnee: 0, lAnkle: 0,
    rHip: 0, rKnee: 0, rAnkle: 0,
  };

  switch (id) {
    // ── SQUAT / GOBLET SQUAT ──────────────────────────────────
    case "squat": return { ...B,
      bodyY: 1.15 - p * 0.60,
      trunkBend: p * 0.18,
      lHip: p * 1.55, lKnee: p * 1.55, lAnkle: p * 0.35,
      rHip: p * 1.55, rKnee: p * 1.55, rAnkle: p * 0.35,
    };
    case "goblet_squat": return { ...B,
      bodyY: 1.15 - p * 0.58,
      trunkBend: p * 0.10,
      lShX: 0.45, lShZ: -0.28, lElbow: 1.35,
      rShX: 0.45, rShZ:  0.28, rElbow: 1.35,
      lHip: p * 1.5, lKnee: p * 1.5, lAnkle: p * 0.3,
      rHip: p * 1.5, rKnee: p * 1.5, rAnkle: p * 0.3,
    };
    case "pistol_squat": return { ...B,
      bodyY: 1.0 - p * 0.55,
      trunkBend: p * 0.25,
      // sol bacak squat yapar, sağ bacak öne uzatılır
      lHip: p * 1.6, lKnee: p * 1.6, lAnkle: p * 0.3,
      rHip: -p * 1.2, rKnee: 0, rAnkle: -p * 0.2,
    };
    case "jump_squat": return { ...B,
      bodyY: 1.15 - p * 0.50 + (p > 0.9 ? (p-0.9)*5*0.5 : 0),
      lHip: p * 1.4, lKnee: p * 1.4, lAnkle: p * 0.3,
      rHip: p * 1.4, rKnee: p * 1.4, rAnkle: p * 0.3,
    };

    // ── DEADLIFT / RDL ───────────────────────────────────────
    case "deadlift": return { ...B,
      bodyY: 1.15 - slow * 0.42,
      trunkBend: slow * 0.95,
      lShX: 0.8, lShZ: -0.15, lElbow: 0,
      rShX: 0.8, rShZ:  0.15, rElbow: 0,
      lHip: slow * 0.55, lKnee: slow * 0.45,
      rHip: slow * 0.55, rKnee: slow * 0.45,
    };
    case "rdl": return { ...B,
      bodyY: 1.15 - slow * 0.28,
      trunkBend: slow * 1.15,
      lShX: 0.75, lShZ: -0.12, lElbow: 0,
      rShX: 0.75, rShZ:  0.12, rElbow: 0,
      lHip: slow * 0.18, lKnee: slow * 0.12,
      rHip: slow * 0.18, rKnee: slow * 0.12,
    };
    case "sumo_deadlift": return { ...B,
      bodyY: 1.05 - slow * 0.48,
      trunkBend: slow * 0.80,
      lShX: 0.8, rShX: 0.8, lElbow: 0, rElbow: 0,
      lHip: slow * 0.60, lKnee: slow * 0.50,
      rHip: slow * 0.60, rKnee: slow * 0.50,
    };
    case "good_morning": return { ...B,
      bodyY: 1.10 - slow * 0.12,
      trunkBend: slow * 1.05,
      lHip: slow * 0.08, lKnee: slow * 0.05,
      rHip: slow * 0.08, rKnee: slow * 0.05,
    };

    // ── BENCH PRESS / CHEST ──────────────────────────────────
    case "bench_press": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI / 2,
      lShX: -Math.PI/2 + p*1.1, lShZ: -0.35, lElbow: (1-p)*1.2,
      rShX: -Math.PI/2 + p*1.1, rShZ:  0.35, rElbow: (1-p)*1.2,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "incline_press": return { ...B,
      bodyY: 0.52, bodyRotX: -Math.PI/3.5,
      lShX: -Math.PI/2.5 + p*1.0, lShZ: -0.30, lElbow: (1-p)*1.1,
      rShX: -Math.PI/2.5 + p*1.0, rShZ:  0.30, rElbow: (1-p)*1.1,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "decline_press": return { ...B,
      bodyY: 0.25, bodyRotX: -Math.PI/2.2,
      lShX: -Math.PI/1.8 + p*1.1, lShZ: -0.35, lElbow: (1-p)*1.2,
      rShX: -Math.PI/1.8 + p*1.1, rShZ:  0.35, rElbow: (1-p)*1.2,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "close_grip_bench": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI/2,
      lShX: -Math.PI/2 + p*1.1, lShZ: -0.08, lElbow: (1-p)*1.4,
      rShX: -Math.PI/2 + p*1.1, rShZ:  0.08, rElbow: (1-p)*1.4,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "db_bench_press": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI/2,
      lShX: -Math.PI/2 + p*1.0, lShZ: -0.40, lElbow: (1-p)*1.3,
      rShX: -Math.PI/2 + p*1.0, rShZ:  0.40, rElbow: (1-p)*1.3,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "db_fly": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI/2,
      lShX: -Math.PI/2, lShZ: -(1-p)*1.4, lElbow: (1-p)*0.5,
      rShX: -Math.PI/2, rShZ:  (1-p)*1.4, rElbow: (1-p)*0.5,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };
    case "cable_fly": return { ...B,
      lShX: 0.3, lShZ: -p*1.3, lElbow: (1-p)*0.5,
      rShX: 0.3, rShZ:  p*1.3, rElbow: (1-p)*0.5,
    };
    case "machine_press": return { ...B,
      lShX: 0.25, lShZ: -0.35, lElbow: (1-p)*1.5,
      rShX: 0.25, rShZ:  0.35, rElbow: (1-p)*1.5,
    };
    case "pullover": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI/2,
      lShX: -Math.PI + p*1.3, lShZ: -0.15, lElbow: p*0.5,
      rShX: -Math.PI + p*1.3, rShZ:  0.15, rElbow: p*0.5,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };

    // ── OVERHEAD / SHOULDER ──────────────────────────────────
    case "ohp": case "db_ohp": return { ...B,
      lShX: -Math.PI + p*1.5, lShZ: -0.22, lElbow: (1-p)*1.3,
      rShX: -Math.PI + p*1.5, rShZ:  0.22, rElbow: (1-p)*1.3,
      shoulderY: 0.52,
    };
    case "arnold_press": return { ...B,
      lShX: -Math.PI*0.7 + p*1.3, lShZ: -p*0.3, lElbow: (1-p)*1.5,
      rShX: -Math.PI*0.7 + p*1.3, rShZ:  p*0.3, rElbow: (1-p)*1.5,
      shoulderY: 0.52,
    };
    case "lateral_raise": return { ...B,
      lShX: 0, lShZ: -p*1.45, lElbow: p*0.28,
      rShX: 0, rShZ:  p*1.45, rElbow: p*0.28,
    };
    case "front_raise": return { ...B,
      lShX: p*1.65, lShZ: -0.12, lElbow: 0.08,
      rShX: p*1.65, rShZ:  0.12, rElbow: 0.08,
    };
    case "rear_delt_fly": return { ...B,
      trunkBend: 0.85, bodyY: 1.02,
      lShX: 0.18, lShZ: -p*1.45, lElbow: 0.18,
      rShX: 0.18, rShZ:  p*1.45, rElbow: 0.18,
      shoulderY: 0.46,
    };
    case "upright_row": return { ...B,
      lShX: p*1.55, lShZ: -p*0.48, lElbow: p*1.75,
      rShX: p*1.55, rShZ:  p*0.48, rElbow: p*1.75,
    };
    case "shrug": return { ...B,
      lShX: 0.12, lShZ: -0.12, lElbow: 0.1,
      rShX: 0.12, rShZ:  0.12, rElbow: 0.1,
      shoulderY: 0.5 + p*0.12,
    };
    case "face_pull": return { ...B,
      lShX: 0, lShZ: -p*0.75, lElbow: p*1.75,
      rShX: 0, rShZ:  p*0.75, rElbow: p*1.75,
    };

    // ── BACK / ROWS ──────────────────────────────────────────
    case "bent_row": return { ...B,
      bodyY: 1.02, trunkBend: 0.82,
      lShX: 0.65 + p*0.78, lShZ: -0.18, lElbow: p*1.45,
      rShX: 0.65 + p*0.78, rShZ:  0.18, rElbow: p*1.45,
      shoulderY: 0.46,
      lHip: 0.2, lKnee: 0.18, rHip: 0.2, rKnee: 0.18,
    };
    case "db_row": return { ...B,
      bodyY: 1.02, trunkBend: 0.88,
      lShX: 0.75, lShZ: -0.12, lElbow: 0.12,   // destek kol
      rShX: 0.72 + p*0.88, rShZ: 0.15, rElbow: p*1.45,
      shoulderY: 0.46,
    };
    case "seated_row": return { ...B,
      bodyY: 0.86,
      trunkBend: -p*0.18,
      lShX: 0.55 + p*0.78, lShZ: -0.12, lElbow: p*1.55,
      rShX: 0.55 + p*0.78, rShZ:  0.12, rElbow: p*1.55,
      lHip: 0.28, lKnee: 0.28, rHip: 0.28, rKnee: 0.28,
    };
    case "lat_pulldown": return { ...B,
      lShX: -Math.PI*0.78 + p*1.15, lShZ: -0.44, lElbow: p*1.45,
      rShX: -Math.PI*0.78 + p*1.15, rShZ:  0.44, rElbow: p*1.45,
      trunkBend: -p*0.12,
    };
    case "pullup": case "chinup": return { ...B,
      bodyY: 1.32 + p*0.48,
      lShX: -Math.PI + (1-p)*0.95, lShZ: -0.38, lElbow: (1-p)*1.45,
      rShX: -Math.PI + (1-p)*0.95, rShZ:  0.38, rElbow: (1-p)*1.45,
      lHip: 0, lKnee: p*0.55, rHip: 0, rKnee: p*0.55,
    };
    case "inverted_row": return { ...B,
      bodyY: 0.50, bodyRotX: -Math.PI/2,
      lShX: -Math.PI/2 + p*0.98, lShZ: -0.38, lElbow: p*1.45,
      rShX: -Math.PI/2 + p*0.98, rShZ:  0.38, rElbow: p*1.45,
    };
    case "straight_arm_pd": return { ...B,
      lShX: -Math.PI*0.58 + p*1.45, lShZ: -0.18, lElbow: 0.08,
      rShX: -Math.PI*0.58 + p*1.45, rShZ:  0.18, rElbow: 0.08,
    };
    case "renegade_row": return { ...B,
      bodyY: 0.62, bodyRotX: -Math.PI/2 + 0.1,
      lShX: -Math.PI/2 + 0.1, lShZ: -0.33, lElbow: 1.38,
      rShX: -Math.PI/2 + 0.1 + p*0.88, rShZ: 0.15, rElbow: p*1.55,
    };
    case "superman": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      lShX: -Math.PI + p*0.48, lShZ: -0.15, lElbow: 0,
      rShX: -Math.PI + p*0.48, rShZ:  0.15, rElbow: 0,
      lHip: -p*0.28, lKnee: 0, rHip: -p*0.28, rKnee: 0,
    };
    case "back_extension": return { ...B,
      bodyY: 0.62, bodyRotX: -Math.PI/2.5,
      trunkBend: (1-p)*0.88,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };

    // ── CURLS ────────────────────────────────────────────────
    case "bb_curl": case "db_curl": return { ...B,
      lShX: 0.08, lShZ: -0.18, lElbow: p*2.18,
      rShX: 0.08, rShZ:  0.18, rElbow: p*2.18,
    };
    case "overhead_curl": return { ...B,
      lShX: -Math.PI+0.28, lShZ: -0.28, lElbow: p*1.75,
      rShX: -Math.PI+0.28, rShZ:  0.28, rElbow: p*1.75,
    };
    case "incline_curl": return { ...B,
      bodyY: 0.56, bodyRotX: -Math.PI/4,
      lShX: 0.28, lShZ: -0.18, lElbow: p*1.98,
      rShX: 0.28, rShZ:  0.18, rElbow: p*1.98,
    };
    case "concentration_curl": return { ...B,
      bodyY: 0.96, trunkBend: 0.48,
      lShX: 1.18, lShZ: 0.55, lElbow: p*2.18,
      rShX: 0.08, rShZ: 0.18, rElbow: 0.18,
      lHip: 0.35, lKnee: 0.35, rHip: 0.35, rKnee: 0.35,
    };
    case "preacher_curl": return { ...B,
      bodyY: 1.02, trunkBend: 0.28,
      lShX: 1.08, lShZ: -0.18, lElbow: p*1.98,
      rShX: 1.08, rShZ:  0.18, rElbow: p*1.98,
    };

    // ── TRICEP ───────────────────────────────────────────────
    case "skull_crusher": return { ...B,
      bodyY: 0.38, bodyRotX: -Math.PI/2,
      lShX: -Math.PI/2, lShZ: -0.14, lElbow: p*1.75,
      rShX: -Math.PI/2, rShZ:  0.14, rElbow: p*1.75,
    };
    case "cable_pushdown": return { ...B,
      lShX: 0.48, lShZ: -0.13, lElbow: p*1.98,
      rShX: 0.48, rShZ:  0.13, rElbow: p*1.98,
    };
    case "overhead_tricep": return { ...B,
      lShX: -Math.PI+0.18, lShZ: -0.13, lElbow: p*1.98,
      rShX: -Math.PI+0.18, rShZ:  0.13, rElbow: p*1.98,
    };
    case "tricep_kickback": return { ...B,
      bodyY: 1.02, trunkBend: 0.78,
      lShX: 0.78, lShZ: -0.08, lElbow: (1-p)*1.75,
      rShX: 0.78, rShZ:  0.08, rElbow: (1-p)*1.75,
      shoulderY: 0.46,
      lHip: 0.18, lKnee: 0.15, rHip: 0.18, rKnee: 0.15,
    };

    // ── LUNGE / SPLIT ────────────────────────────────────────
    case "lunge": return { ...B,
      bodyY: 1.02 - p*0.28,
      // Sol öne adım, sağ diz yere iner
      lHip: p*1.18, lKnee: p*0.30, lAnkle: p*0.15,
      rHip: -p*0.45, rKnee: p*1.12, rAnkle: -p*0.35,
    };
    case "split_squat": return { ...B,
      bodyY: 1.02 - slow*0.38,
      lHip: slow*1.28, lKnee: slow*0.25, lAnkle: slow*0.12,
      rHip: -slow*0.42, rKnee: slow*1.25, rAnkle: -slow*0.38,
    };
    case "step_up": return { ...B,
      bodyY: 1.05 + p*0.18,
      lHip: p*0.88, lKnee: p*0.55, lAnkle: p*0.18,
      rHip: -p*0.28, rKnee: p*0.18, rAnkle: 0,
    };

    // ── HIP THRUST / GLUTE BRIDGE ────────────────────────────
    case "hip_thrust": return { ...B,
      bodyY: 0.56, bodyRotX: -Math.PI/2.2,
      // yatarken dizler 90° bükülü, kalça yukarı-aşağı
      lHip: -(1-p)*1.18, lKnee: (1-p)*1.45,
      rHip: -(1-p)*1.18, rKnee: (1-p)*1.45,
      pelvicTilt: p*0.45,
    };
    case "glute_bridge": return { ...B,
      bodyY: 0.32, bodyRotX: -Math.PI/2,
      lHip: -(1-p)*1.25, lKnee: (1-p)*1.52, lAnkle: 0,
      rHip: -(1-p)*1.25, rKnee: (1-p)*1.52, rAnkle: 0,
      pelvicTilt: p*0.38,
    };

    // ── LEG PRESS / MACHINE LEGS ─────────────────────────────
    case "leg_press": return { ...B,
      bodyY: 0.42, bodyRotX: -Math.PI/2.5,
      lShX: 0.28, lShZ: -0.18, lElbow: 0.48,
      rShX: 0.28, rShZ:  0.18, rElbow: 0.48,
      // ayaklar platforma basıyor, diz bükülüyor
      lHip: -(1-p)*1.48, lKnee: (1-p)*1.72,
      rHip: -(1-p)*1.48, rKnee: (1-p)*1.72,
    };
    case "leg_extension": return { ...B,
      bodyY: 0.86,
      // oturur pozisyon: kalça ~90° fleksiyonda, diz açılıp kapanır
      lHip: 1.52, lKnee: (1-p)*1.52,
      rHip: 1.52, rKnee: (1-p)*1.52,
    };
    case "leg_curl": return { ...B,
      bodyY: 0.44, bodyRotX: -Math.PI/1.85,
      // yüzüstü, diz bükülür
      lHip: 0, lKnee: p*1.95,
      rHip: 0, rKnee: p*1.95,
    };
    case "hip_adductor": return { ...B,
      bodyY: 0.86,
      lHip: 1.45, lKnee: 1.45, rHip: 1.45, rKnee: 1.45,
      lShX: 0.08, rShX: 0.08,
    };

    // ── CALF / ANKLE ─────────────────────────────────────────
    case "calf_raise": return { ...B,
      bodyY: 1.15 + p*0.08,
      lAnkle: p*0.58, rAnkle: p*0.58,
    };

    // ── NORDIC / WALL SIT ────────────────────────────────────
    case "nordic_curl": return { ...B,
      bodyY: 0.62 - slow*0.28, bodyRotX: -Math.PI/5,
      trunkBend: slow*1.08,
      lHip: 0, lKnee: 0.08, rHip: 0, rKnee: 0.08,
    };
    case "wall_sit": return { ...B,
      bodyY: 0.70, bodyRotX: Math.PI/10,
      // Sandalye pozisyonu: kalça 90°, diz 90°
      lHip: 1.50, lKnee: 1.50,
      rHip: 1.50, rKnee: 1.50,
    };

    // ── PUSH UP / DIP ────────────────────────────────────────
    case "pushup": return { ...B,
      bodyY: 0.56, bodyRotX: -Math.PI/2 + 0.14,
      lShX: -Math.PI/2 + p*0.88, lShZ: -0.33, lElbow: (1-p)*1.18,
      rShX: -Math.PI/2 + p*0.88, rShZ:  0.33, rElbow: (1-p)*1.18,
      lHip: 0, lKnee: 0.08, rHip: 0, rKnee: 0.08,
    };
    case "pike_pushup": return { ...B,
      bodyY: 0.82, bodyRotX: -Math.PI/3,
      trunkBend: 0.78,
      lShX: -Math.PI/2 + p*0.78, lShZ: -0.28, lElbow: (1-p)*1.18,
      rShX: -Math.PI/2 + p*0.78, rShZ:  0.28, rElbow: (1-p)*1.18,
    };
    case "dip": return { ...B,
      bodyY: 1.08 - p*0.38,
      lShX: 0.38, lShZ: -0.18, lElbow: p*1.55,
      rShX: 0.38, rShZ:  0.18, rElbow: p*1.55,
      lHip: 0, lKnee: 0.48, rHip: 0, rKnee: 0.48,
    };
    case "handstand_pu": return { ...B,
      bodyY: 2.20, bodyRotX: Math.PI,
      lShX: 0.05, lShZ: -0.22, lElbow: p*1.28,
      rShX: 0.05, rShZ:  0.22, rElbow: p*1.28,
      lHip: 0, lKnee: 0, rHip: 0, rKnee: 0,
    };

    // ── AB / CORE ────────────────────────────────────────────
    case "crunch": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      trunkBend: p*0.98,
      lHip: 1.18, lKnee: 1.38, rHip: 1.18, rKnee: 1.38,
    };
    case "plank": return { ...B,
      bodyY: 0.52, bodyRotX: -Math.PI/2 + 0.12,
      lShX: -Math.PI/2+0.04, lShZ: -0.33, lElbow: 1.52,
      rShX: -Math.PI/2+0.04, rShZ:  0.33, rElbow: 1.52,
      lHip: 0, lKnee: 0.06, rHip: 0, rKnee: 0.06,
    };
    case "side_plank": return { ...B,
      bodyY: 0.46, bodyRotX: -Math.PI/2, bodyRotZ: Math.PI/2,
      lShX: -Math.PI/2, lShZ: -0.05, lElbow: 1.52,
      rShX: -Math.PI,   rShZ:  0.05, rElbow: 0,
    };
    case "leg_raise": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      lHip: -p*1.45, lKnee: p*0.22,
      rHip: -p*1.45, rKnee: p*0.22,
    };
    case "bicycle_crunch": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2, trunkBend: 0.58,
      lHip: -p*1.28, lKnee: p*1.45,
      rHip: -(1-p)*1.28, rKnee: (1-p)*1.45,
    };
    case "russian_twist": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      trunkBend: 0.48, bodyRotY: s*0.48,
      lHip: 0.78, lKnee: 0.88, rHip: 0.78, rKnee: 0.88,
    };
    case "v_up": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      trunkBend: p*1.28,
      lHip: -p*1.45, lKnee: 0,
      rHip: -p*1.45, rKnee: 0,
    };
    case "mountain_climber": return { ...B,
      bodyY: 0.60, bodyRotX: -Math.PI/2+0.1,
      lShX: -Math.PI/2+0.18, lShZ: -0.33, lElbow: 1.38,
      rShX: -Math.PI/2+0.18, rShZ:  0.33, rElbow: 1.38,
      lHip: -(1-p)*1.15, lKnee: (1-p)*1.32,
      rHip: -p*1.15,     rKnee: p*1.32,
    };
    case "hollow_hold": return { ...B,
      bodyY: 0.30, bodyRotX: -Math.PI/2,
      trunkBend: 0.28,
      lShX: -Math.PI+0.18, rShX: -Math.PI+0.18,
      lHip: -slow*1.18, rHip: -slow*1.18,
    };
    case "toes_to_bar": return { ...B,
      bodyY: 1.42 + p*0.28,
      lShX: -Math.PI+0.1, lShZ: -0.38, lElbow: 0.18,
      rShX: -Math.PI+0.1, rShZ:  0.38, rElbow: 0.18,
      lHip: -p*1.75, lKnee: 0, rHip: -p*1.75, rKnee: 0,
    };
    case "ab_wheel": return { ...B,
      bodyY: 0.72 - slow*0.28, bodyRotX: -Math.PI/3,
      trunkBend: slow*1.08,
      lShX: -Math.PI/2.5, lShZ: -0.18, lElbow: 0.08,
      rShX: -Math.PI/2.5, rShZ:  0.18, rElbow: 0.08,
      lHip: 0, lKnee: 0.08, rHip: 0, rKnee: 0.08,
    };
    case "cable_crunch": return { ...B,
      bodyY: 0.68, trunkBend: p*1.18,
      lElbow: p*0.78, rElbow: p*0.78,
      lHip: 0.78, lKnee: 0.78, rHip: 0.78, rKnee: 0.78,
    };
    case "woodchop": return { ...B,
      bodyRotY: s*0.68,
      lShX: 0.48+s*0.48, rShX: 0.48+s*0.48,
      lElbow: 0.18, rElbow: 0.18,
    };
    case "pallof": return { ...B,
      lShX: 0.08, rShX: 0.08,
      lElbow: p*1.75, rElbow: p*1.75,
      bodyRotY: s*0.08,
    };

    // ── KETTLEBELL ───────────────────────────────────────────
    case "kb_swing": return { ...B,
      bodyY: 1.05 - slow*0.28, trunkBend: slow*0.88,
      lShX: p*1.38, lShZ: -0.13, lElbow: 0.08,
      rShX: p*1.38, rShZ:  0.13, rElbow: 0.08,
      lHip: slow*0.42, lKnee: slow*0.38,
      rHip: slow*0.42, rKnee: slow*0.38,
    };
    case "kb_snatch": return { ...B,
      bodyY: 1.1 - (1-p)*0.28, trunkBend: (1-p)*0.68,
      lShX: -Math.PI*p, lShZ: -0.18, lElbow: (1-p)*0.55,
      rShX: -Math.PI*p, rShZ:  0.18, rElbow: (1-p)*0.55,
    };
    case "kb_halo": return { ...B,
      lShX: -0.48+s*0.48, lShZ: s*0.95, lElbow: 1.18,
      rShX: -0.48-s*0.28, rShZ: -s*0.75, rElbow: 1.18,
    };

    default: return B;
  }
}

// ─── HUMAN MODEL ─────────────────────────────────────────────
function HumanModel({ animId, playing, equipment }: HumanModelProps) {
  const [t, setT] = useState<number>(0);
  useFrame((s) => { if (playing) setT(s.clock.getElapsedTime()); });

  const a = calcAnim(animId, t);
  const hasBarbell  = equipment === "BARBELL";
  const hasDumbbell = equipment === "DUMBBELL" || equipment === "KETTLEBELL";
  const hasCable    = equipment === "CABLE";

  const renderArm = (side: 1 | -1) => {
    const L = side === 1;
    const shX = L ? a.lShX : a.rShX;
    const shZ = L ? a.lShZ : a.rShZ;
    const elb = L ? a.lElbow : a.rElbow;
    const pos: [number,number,number] = [side * 0.225, a.shoulderY, 0];
    return (
      <group key={side} position={pos}>
        {/* Omuz topu */}
        <mesh material={skinMat}><sphereGeometry args={[0.092, 16, 16]}/></mesh>
        <group rotation={[shX, 0, shZ]}>
          {/* Üst kol */}
          <mesh position={[0,-0.22,0]} material={muscleMat} castShadow>
            <capsuleGeometry args={[0.065, 0.36, 8, 12]}/>
          </mesh>
          <mesh position={[L?0.022:-0.022,-0.17,0.06]} material={deepMat}>
            <sphereGeometry args={[0.052,8,8]}/>
          </mesh>
          {/* Dirsek */}
          <group position={[0,-0.42,0]} rotation={[elb,0,0]}>
            <mesh material={skinMat}><sphereGeometry args={[0.056,12,12]}/></mesh>
            {/* Ön kol */}
            <mesh position={[0,-0.19,0]} material={muscleMat} castShadow>
              <capsuleGeometry args={[0.052, 0.30, 8, 12]}/>
            </mesh>
            {/* El */}
            <group position={[0,-0.36,0]}>
              <mesh material={skinMat}><boxGeometry args={[0.09,0.078,0.042]}/></mesh>
              {hasDumbbell && (
                <group position={[0,-0.11,0]} rotation={[0,0,Math.PI/2]}>
                  <mesh material={weightMat}><cylinderGeometry args={[0.034,0.034,0.27,10]}/></mesh>
                  <mesh position={[0.12,0,0]} material={weightMat}><cylinderGeometry args={[0.078,0.078,0.058,12]}/></mesh>
                  <mesh position={[-0.12,0,0]} material={weightMat}><cylinderGeometry args={[0.078,0.078,0.058,12]}/></mesh>
                </group>
              )}
              {hasCable && (
                <group position={[0,-0.1,0]}>
                  <mesh material={cableMat} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.052,0.011,8,16]}/></mesh>
                  <mesh position={[0,-0.08,0]} material={cableMat}><cylinderGeometry args={[0.005,0.005,0.38,6]}/></mesh>
                </group>
              )}
            </group>
          </group>
        </group>
      </group>
    );
  };

  // Bacak — tam bağımsız eklem sistemi
  const renderLeg = (side: 1 | -1) => {
    const L = side === 1;
    const hip   = L ? a.lHip   : a.rHip;
    const knee  = L ? a.lKnee  : a.rKnee;
    const ankle = L ? a.lAnkle : a.rAnkle;
    return (
      <group key={side} position={[side * 0.130, -0.10, 0]}>
        {/* Kalça eklemi — hip açısı SADECE burada */}
        <mesh material={skinMat} castShadow><sphereGeometry args={[0.076,12,12]}/></mesh>
        <group rotation={[hip, 0, 0]}>
          {/* Uyluk */}
          <mesh position={[0,-0.25,0]} material={muscleMat} castShadow>
            <capsuleGeometry args={[0.092, 0.44, 8, 12]}/>
          </mesh>
          <mesh position={[0,-0.22,0.065]} material={deepMat}>
            <sphereGeometry args={[0.065,8,8]}/>
          </mesh>
          {/* Diz eklemi — knee açısı SADECE burada, bağımsız */}
          <group position={[0,-0.46,0]}>
            <mesh material={skinMat}><sphereGeometry args={[0.072,12,12]}/></mesh>
            <group rotation={[knee, 0, 0]}>
              {/* Baldır */}
              <mesh position={[0,-0.23,0]} material={muscleMat} castShadow>
                <capsuleGeometry args={[0.076, 0.40, 8, 12]}/>
              </mesh>
              <mesh position={[0,-0.19,-0.055]} material={deepMat}>
                <sphereGeometry args={[0.060,8,8]}/>
              </mesh>
              {/* Ayak bileği */}
              <group position={[0,-0.44,0]}>
                <mesh material={skinMat}><sphereGeometry args={[0.055,10,10]}/></mesh>
                <group rotation={[ankle,0,0]}>
                  {/* Ayak */}
                  <mesh position={[0,-0.038,0.10]} material={shoesMat} castShadow>
                    <boxGeometry args={[0.142,0.070,0.27]}/>
                  </mesh>
                  <mesh position={[0,-0.078,0.10]} material={shoesMat}>
                    <boxGeometry args={[0.152,0.030,0.29]}/>
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group position={[0, a.bodyY, 0]} rotation={[a.bodyRotX, a.bodyRotY, a.bodyRotZ]}>
      {/* PELVIS */}
      <group rotation={[a.pelvicTilt, 0, 0]}>
        <mesh material={shortsMat} castShadow><boxGeometry args={[0.38,0.18,0.22]}/></mesh>

        {/* TORSO */}
        <group position={[0,0.08,0]} rotation={[a.trunkBend, 0, 0]}>
          {/* Karın */}
          <mesh position={[0,0.18,0]} material={muscleMat} castShadow>
            <capsuleGeometry args={[0.155,0.22,8,16]}/>
          </mesh>
          {/* Göğüs */}
          <mesh position={[0,0.44,0.01]} material={muscleMat} castShadow>
            <capsuleGeometry args={[0.176,0.24,8,16]}/>
          </mesh>
          <mesh position={[ 0.10,0.43,0.09]} material={deepMat} castShadow><sphereGeometry args={[0.090,12,12]}/></mesh>
          <mesh position={[-0.10,0.43,0.09]} material={deepMat} castShadow><sphereGeometry args={[0.090,12,12]}/></mesh>
          {/* Trapez */}
          <mesh position={[0,0.63,-0.04]} material={deepMat} castShadow>
            <capsuleGeometry args={[0.12,0.12,8,8]}/>
          </mesh>
          {/* Boyun */}
          <mesh position={[0,0.69,0.02]} material={skinMat} castShadow>
            <capsuleGeometry args={[0.070,0.12,8,8]}/>
          </mesh>
          {/* Kafa */}
          <group position={[0,0.83,0]}>
            <mesh material={skinMat} castShadow><sphereGeometry args={[0.170,24,24]}/></mesh>
            <mesh position={[0,0.12,-0.02]} material={hairMat}><sphereGeometry args={[0.138,16,16]}/></mesh>
            <mesh position={[ 0.066,0.032,0.145]} material={eyeMat}><sphereGeometry args={[0.025,8,8]}/></mesh>
            <mesh position={[-0.066,0.032,0.145]} material={eyeMat}><sphereGeometry args={[0.025,8,8]}/></mesh>
            <mesh position={[0,-0.014,0.168]} material={skinMat}><sphereGeometry args={[0.018,8,8]}/></mesh>
            <mesh position={[ 0.170,0,0]} material={skinMat}><sphereGeometry args={[0.040,8,8]}/></mesh>
            <mesh position={[-0.170,0,0]} material={skinMat}><sphereGeometry args={[0.040,8,8]}/></mesh>
          </group>
          {/* KOLLAR */}
          {renderArm(1)}
          {renderArm(-1)}
          {/* BARBELL */}
          {hasBarbell && (
            <group position={[0,0.10,0.15]}>
              <mesh material={barMat} rotation={[0,0,Math.PI/2]}>
                <cylinderGeometry args={[0.018,0.018,1.60,12]}/>
              </mesh>
              {([-0.67,-0.54,0.54,0.67] as number[]).map((x,i)=>(
                <mesh key={i} material={plateMat} position={[x,0,0]} rotation={[0,0,Math.PI/2]}>
                  <cylinderGeometry args={[0.158,0.158,0.050,16]}/>
                </mesh>
              ))}
            </group>
          )}
        </group>
      </group>
      {/* BACAKLAR */}
      {renderLeg(1)}
      {renderLeg(-1)}
    </group>
  );
}

// ─── EXERCISE RESOLVER ───────────────────────────────────────
function resolveExercise(exerciseName: string): { animId: string; equipment: EquipmentKey } {
  const lower = exerciseName.toLowerCase();
  for (const [eqKey, eqData] of Object.entries(EXERCISES) as [EquipmentKey, EquipmentData][]) {
    for (const exList of Object.values(eqData.muscles)) {
      for (const ex of exList) {
        if (ex.name.toLowerCase() === lower) return { animId: ex.anim, equipment: eqKey };
      }
    }
  }
  const isBarbell = lower.includes("barbell");
  const isDumbbell = lower.includes("dumbbell") || lower.includes("db ") || lower.includes("arnold") || lower.includes("hammer");
  const isCable = lower.includes("cable") || lower.includes("pulldown") || lower.includes("face pull");
  const isMachine = lower.includes("machine") || lower.includes("leg press") || lower.includes("leg extension") || lower.includes("leg curl");
  const isKB = lower.includes("kettlebell") || lower.includes("kb ") || lower.includes("swing") || lower.includes("turkish");
  const equipment: EquipmentKey = isBarbell?"BARBELL":isDumbbell?"DUMBBELL":isCable?"CABLE":isMachine?"MACHINE":isKB?"KETTLEBELL":"BODYWEIGHT";
  let animId = "squat";
  if (lower.includes("bench")) animId = "bench_press";
  else if (lower.includes("deadlift") && lower.includes("sumo")) animId = "sumo_deadlift";
  else if (lower.includes("romanian") || lower.includes("rdl")) animId = "rdl";
  else if (lower.includes("deadlift")) animId = "deadlift";
  else if (lower.includes("squat")) animId = lower.includes("goblet")?"goblet_squat":"squat";
  else if (lower.includes("lunge")) animId = "lunge";
  else if (lower.includes("row") && lower.includes("bent")) animId = "bent_row";
  else if (lower.includes("row") && lower.includes("seated")) animId = "seated_row";
  else if (lower.includes("overhead press") || lower.includes("ohp") || lower.includes("shoulder press")) animId = "ohp";
  else if (lower.includes("curl") && lower.includes("preacher")) animId = "preacher_curl";
  else if (lower.includes("curl")) animId = "db_curl";
  else if (lower.includes("tricep") && lower.includes("pushdown")) animId = "cable_pushdown";
  else if (lower.includes("tricep")) animId = "overhead_tricep";
  else if (lower.includes("lateral raise")) animId = "lateral_raise";
  else if (lower.includes("front raise")) animId = "front_raise";
  else if (lower.includes("face pull") || lower.includes("rear delt")) animId = "rear_delt_fly";
  else if (lower.includes("pulldown") || lower.includes("pull down")) animId = "lat_pulldown";
  else if (lower.includes("pull up") || lower.includes("pullup")) animId = "pullup";
  else if (lower.includes("chin up") || lower.includes("chinup")) animId = "chinup";
  else if (lower.includes("dip")) animId = "dip";
  else if (lower.includes("push up") || lower.includes("pushup")) animId = "pushup";
  else if (lower.includes("fly") || lower.includes("flye")) animId = lower.includes("cable")?"cable_fly":"db_fly";
  else if (lower.includes("hip thrust")) animId = "hip_thrust";
  else if (lower.includes("glute bridge")) animId = "glute_bridge";
  else if (lower.includes("leg press")) animId = "leg_press";
  else if (lower.includes("leg extension")) animId = "leg_extension";
  else if (lower.includes("leg curl")) animId = "leg_curl";
  else if (lower.includes("plank") && lower.includes("side")) animId = "side_plank";
  else if (lower.includes("plank")) animId = "plank";
  else if (lower.includes("crunch")) animId = "crunch";
  else if (lower.includes("leg raise")) animId = "leg_raise";
  else if (lower.includes("russian twist")) animId = "russian_twist";
  else if (lower.includes("mountain climber")) animId = "mountain_climber";
  else if (lower.includes("swing")) animId = "kb_swing";
  else if (lower.includes("shrug")) animId = "shrug";
  else if (lower.includes("good morning")) animId = "good_morning";
  else if (lower.includes("calf")) animId = "calf_raise";
  else if (lower.includes("step up")) animId = "step_up";
  return { animId, equipment };
}

// ─── EMBED (Modal için) ───────────────────────────────────────
export function Exercise3DEmbed({ exerciseName }: { exerciseName: string }) {
  const { animId, equipment } = resolveExercise(exerciseName);
  const [playing, setPlaying] = useState<boolean>(true);
  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <Canvas shadows camera={{ position:[3.5,2.2,3.5], fov:45 }} style={{ background:"#05050a", borderRadius:14 }}>
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[3,5,3]} intensity={1.2} color="#fff5e0" castShadow />
        <pointLight position={[-3,3,-2]} intensity={0.5} color="#4488ff" />
        <pointLight position={[0,1,4]} intensity={0.3} color="#ff6633" />
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.06}>
          <HumanModel animId={animId} playing={playing} equipment={equipment} />
        </Float>
        <Grid position={[0,-0.01,0]} infiniteGrid cellSize={0.15} cellThickness={0.8} cellColor="#0d0d18" sectionColor="#1a1a30" fadeDistance={12}/>
        <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={9} target={[0,1.2,0]}/>
      </Canvas>
      <button onClick={()=>setPlaying(!playing)} style={{ position:"absolute", bottom:10, right:10, background:"rgba(5,5,15,0.85)", border:"1px solid rgba(255,80,0,0.3)", borderRadius:8, color:"#ff5000", padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:700 }}>
        {playing ? "⏸" : "▶"}
      </button>
    </div>
  );
}

// ─── SCENE ───────────────────────────────────────────────────
function Scene({ animId, playing, equipment }: SceneProps) {
  return (
    <>
      <color attach="background" args={["#050508"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3,5,3]} intensity={1.2} color="#fff5e0" castShadow />
      <pointLight position={[-3,3,-2]} intensity={0.5} color="#4488ff" />
      <pointLight position={[0,1,4]} intensity={0.3} color="#ff6633" />
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.06}>
        <HumanModel animId={animId} playing={playing} equipment={equipment} />
      </Float>
      <Grid position={[0,-0.01,0]} infiniteGrid cellSize={0.15} cellThickness={0.8} cellColor="#0d0d18" sectionColor="#1a1a30" fadeDistance={12}/>
      <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={9} target={[0,1.2,0]}/>
    </>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export default function FitnessExplorer() {
  const [activeEquipment, setActiveEquipment] = useState<EquipmentKey>("BARBELL");
  const [activeMuscle, setActiveMuscle] = useState<string>("Göğüs");
  const [activeExercise, setActiveExercise] = useState<Exercise>(EXERCISES.BARBELL.muscles["Göğüs"][0]);
  const [playing, setPlaying] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const equipData = EXERCISES[activeEquipment];
  const muscleGroups = Object.keys(equipData.muscles);
  const exerciseList = equipData.muscles[activeMuscle] ?? [];
  const accent = equipData.color;

  const total = useMemo(() =>
    Object.values(EXERCISES).reduce((a,eq)=>a+Object.values(eq.muscles).reduce((b,ex)=>b+ex.length,0),0),[]);

  const handleEquip = (eq: EquipmentKey) => {
    setActiveEquipment(eq);
    const m = Object.keys(EXERCISES[eq].muscles)[0];
    setActiveMuscle(m);
    setActiveExercise(EXERCISES[eq].muscles[m][0]);
  };
  const handleMuscle = (m: string) => {
    setActiveMuscle(m);
    setActiveExercise(EXERCISES[activeEquipment].muscles[m][0]);
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#05050a", fontFamily:"'DM Sans','Inter',sans-serif", color:"#e0e0f0", overflow:"hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width:sidebarOpen?272:0, minWidth:sidebarOpen?272:0, transition:"all 0.3s", overflow:"hidden", background:"#0a0a12", borderRight:"1px solid #1a1a2e", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid #111122" }}>
          <div style={{ fontSize:10, color:"#444466", fontWeight:700, letterSpacing:3, marginBottom:4 }}>FITNESS 3D</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>Hareket Kütüphanesi</div>
          <div style={{ fontSize:11, color:"#444466", marginTop:4 }}>{total}+ animasyon</div>
        </div>
        <div style={{ padding:"10px 10px 8px", borderBottom:"1px solid #111122" }}>
          <div style={{ fontSize:10, color:"#444466", fontWeight:700, letterSpacing:2, marginBottom:8 }}>EKİPMAN</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {(Object.keys(EXERCISES) as EquipmentKey[]).map(k=>(
              <button key={k} onClick={()=>handleEquip(k)} style={{ background:activeEquipment===k?EXERCISES[k].color+"22":"transparent", border:`1px solid ${activeEquipment===k?EXERCISES[k].color:"#222233"}`, borderRadius:6, color:activeEquipment===k?EXERCISES[k].color:"#666688", padding:"5px 8px", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                {EXERCISES[k].label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding:"10px 10px 8px", borderBottom:"1px solid #111122" }}>
          <div style={{ fontSize:10, color:"#444466", fontWeight:700, letterSpacing:2, marginBottom:8 }}>KAS GRUBU</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {muscleGroups.map(m=>(
              <button key={m} onClick={()=>handleMuscle(m)} style={{ background:activeMuscle===m?accent+"28":"transparent", border:`1px solid ${activeMuscle===m?accent:"#1e1e30"}`, borderRadius:6, color:activeMuscle===m?accent:"#555577", padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
          {exerciseList.map(ex=>(
            <button key={ex.id} onClick={()=>setActiveExercise(ex)} style={{ display:"block", width:"100%", textAlign:"left", background:activeExercise.id===ex.id?accent+"18":"transparent", border:`1px solid ${activeExercise.id===ex.id?accent+"66":"transparent"}`, borderRadius:7, color:activeExercise.id===ex.id?"#fff":"#8888aa", padding:"8px 12px", cursor:"pointer", fontSize:13, marginBottom:3, fontWeight:activeExercise.id===ex.id?700:400 }}>
              {activeExercise.id===ex.id&&<span style={{ display:"inline-block",width:6,height:6,borderRadius:"50%",background:accent,marginRight:8,verticalAlign:"middle" }}/>}
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ padding:"12px 20px", borderBottom:"1px solid #111122", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#07070f" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:"transparent", border:"1px solid #222233", borderRadius:6, color:"#666688", padding:"5px 10px", cursor:"pointer", fontSize:14 }}>
              {sidebarOpen?"◀":"▶"}
            </button>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{activeExercise.name}</div>
              <div style={{ fontSize:11, color:accent, fontWeight:600, marginTop:1 }}>{equipData.label} · {activeMuscle}</div>
            </div>
          </div>
          <button onClick={()=>setPlaying(!playing)} style={{ background:playing?accent+"22":"#111122", border:`1px solid ${playing?accent:"#222233"}`, borderRadius:8, color:playing?accent:"#666688", padding:"7px 18px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            {playing?"⏸ DURDUR":"▶ BAŞLAT"}
          </button>
        </div>
        <div style={{ flex:1, position:"relative" }}>
          <Canvas shadows camera={{ position:[3.5,2.2,3.5], fov:45 }} style={{ background:"#05050a" }}>
            <Scene animId={activeExercise.anim} playing={playing} equipment={activeEquipment}/>
          </Canvas>
          <div style={{ position:"absolute", bottom:18, left:18, background:"rgba(5,5,15,0.85)", border:`1px solid ${accent}33`, borderRadius:10, padding:"10px 16px", fontSize:12, color:"#8888aa", lineHeight:1.8 }}>
            <div style={{ color:accent, fontWeight:700, marginBottom:3 }}>KONTROLLER</div>
            <div>🖱 Döndür: Sol tık + sürükle</div>
            <div>🔍 Zoom: Tekerlek</div>
          </div>
          <div style={{ position:"absolute", top:16, right:16, background:"rgba(5,5,15,0.75)", border:"1px solid #1a1a2e", borderRadius:8, padding:"8px 14px", fontSize:11, color:"#444466", fontWeight:700, letterSpacing:2 }}>
            3D · {activeExercise.anim?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}