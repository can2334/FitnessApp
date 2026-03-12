"use client";
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Grid, Float } from "@react-three/drei";
import * as THREE from "three";

const bodyMat = new THREE.MeshStandardMaterial({ color: "#ff5000", metalness: 0.7, roughness: 0.2 });
const jointMat = new THREE.MeshStandardMaterial({ color: "#ff8c00", metalness: 0.9, roughness: 0.1 });
const weightMat = new THREE.MeshStandardMaterial({ color: "#111", metalness: 0.8, roughness: 0.4 });

function HumanoidModel({ phase01, exerciseName }: { phase01: number; exerciseName: string }) {
  const name = exerciseName.toLowerCase();
  
  // Hareket Tespitleri
  const isSquat = name.includes("squat");
  const isBench = name.includes("bench");
  const isCurl = name.includes("curl");
  const isPress = name.includes("press") && !isBench;

  // --- MATEMATİKSEL ANİMASYON MOTORU ---
  // Vücut Pozisyonu
  const bodyY = isSquat ? 1.2 - phase01 * 0.7 : isBench ? 0.4 : 1.2;
  const bodyRotX = isBench ? -Math.PI / 2 : 0;

  // Bacak Hareketleri (Squat)
  const kneeRot = isSquat ? phase01 * 1.3 : 0;
  const ankleRot = isSquat ? -phase01 * 0.5 : 0;

  // Kol Hareketleri
  // Bench/Press için itiş, Curl için bükülme
  const shoulderRot = isBench ? -Math.PI / 2 + (phase01 * 1.2) : isPress ? -Math.PI + (phase01 * 1.5) : 0.2;
  const elbowRot = isCurl ? phase01 * 2.2 : isBench || isPress ? (1 - phase01) * 1.2 : 0.3;

  return (
    <group position={[0, bodyY, 0]} rotation={[bodyRotX, 0, 0]}>
      {/* PELVİS / ALT GÖVDE */}
      <mesh material={bodyMat} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
      </mesh>

      {/* ÜST GÖVDE & KAFA */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.35, 0]} material={bodyMat} castShadow>
          <capsuleGeometry args={[0.18, 0.4, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.75, 0]} material={jointMat}>
          <sphereGeometry args={[0.14, 32, 32]} />
        </mesh>

        {/* KOLLAR */}
        {[1, -1].map((side) => (
          <group key={side} position={[side * 0.28, 0.5, 0]} rotation={[shoulderRot, 0, side * 0.2]}>
            {/* Üst Kol */}
            <mesh position={[0, -0.2, 0]} material={jointMat}>
              <capsuleGeometry args={[0.06, 0.35]} />
            </mesh>
            {/* Dirsek ve Ön Kol */}
            <group position={[0, -0.35, 0]} rotation={[elbowRot, 0, 0]}>
              <mesh position={[0, -0.2, 0]} material={bodyMat}>
                <capsuleGeometry args={[0.05, 0.3]} />
              </mesh>
              {/* ELDEKİ AĞIRLIKLAR */}
              {(isCurl || isBench || isPress) && (
                <group position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <mesh material={weightMat}>
                    <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
                  </mesh>
                  <mesh material={weightMat} position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.6]} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        ))}
      </group>

      {/* BACAKLAR */}
      {[1, -1].map((side) => (
        <group key={side} position={[side * 0.15, -0.1, 0]} rotation={[kneeRot, 0, 0]}>
          {/* Üst Bacak */}
          <mesh position={[0, -0.25, 0]} material={jointMat}>
            <capsuleGeometry args={[0.09, 0.45]} />
          </mesh>
          {/* Diz ve Alt Bacak */}
          <group position={[0, -0.45, 0]} rotation={[-kneeRot * 1.5, 0, 0]}>
            <mesh position={[0, -0.25, 0]} material={bodyMat}>
              <capsuleGeometry args={[0.08, 0.45]} />
            </mesh>
            {/* Ayak Bileği ve Ayak */}
            <group position={[0, -0.45, 0]} rotation={[ankleRot, 0, 0]}>
              <mesh position={[0, -0.05, 0.1]} material={jointMat}>
                <boxGeometry args={[0.18, 0.08, 0.3]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

// ... Scene ve Exercise3D kısımları aynı kalabilir, hızı biraz arttıralım:
function Scene({ exerciseName, playing }: { exerciseName: string; playing: boolean }) {
  const [phase01, setPhase01] = useState(0);

  useFrame((state) => {
    if (!playing) return;
    // Hızı egzersize göre ayarlayabiliriz
    const speed = exerciseName.toLowerCase().includes("plank") ? 0.5 : 2.5;
    const t = state.clock.getElapsedTime() * speed;
    setPhase01((Math.sin(t) + 1) / 2);
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <Stage intensity={0.6} environment="city" shadows="contact" adjustCamera>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
          <HumanoidModel phase01={phase01} exerciseName={exerciseName} />
        </Float>
      </Stage>
      <Grid position={[0, -0.01, 0]} infiniteGrid cellSize={0.1} cellThickness={1} cellColor="#151515" sectionColor="#252525" fadeDistance={15} />
      <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={10} target={[0, 1, 0]} />
    </>
  );
}

export default function Exercise3D({ exerciseName }: { exerciseName: string }) {
  const [playing, setPlaying] = useState(true);

  return (
    <div style={{ background: "#080808", border: "1px solid #333", borderRadius: 18, overflow: "hidden", position: "relative", width: "100%", height: 400 }}>
      <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, display: "flex", width: "calc(100% - 32px)", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
        <span style={{ fontSize: 10, color: "#ff5000", fontWeight: "bold", fontFamily: "monospace", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 4 }}>
          3D ENGINE // {exerciseName.toUpperCase()}
        </span>
        <button onClick={() => setPlaying(!playing)} style={{ background: "#ff500022", border: "1px solid #ff500055", borderRadius: 6, color: "#ff5000", padding: "4px 10px", cursor: "pointer", fontSize: 11, pointerEvents: "auto" }}>
          {playing ? "DURDUR" : "BAŞLAT"}
        </button>
      </div>
      <Canvas shadows camera={{ position: [4, 2, 4], fov: 45 }}>
        <Scene exerciseName={exerciseName} playing={playing} />
      </Canvas>
    </div>
  );
}