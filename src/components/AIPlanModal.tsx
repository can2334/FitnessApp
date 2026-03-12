"use client";
import React, { useState } from "react";
import { EXERCISES } from "../app/data/exercises";

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  tip?: string;
  why?: string;
  common_mistake?: string;
  alternative?: string;
}

interface GeneratedPlan {
  title: string;
  description: string;
  warmup?: string;
  exercises: GeneratedExercise[];
  cooldown?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0c0c12", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 600, maxHeight: "92vh", overflowY: "auto" }}>
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
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f0f0f0", fontSize: 13, outline: "none", fontFamily: "'DM Mono',monospace" }} />
  );
}

export function AIPlanModal({ onClose, apiKey }: { onClose: () => void; apiKey?: string }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLevel, setAiLevel] = useState("orta");
  const [aiMuscle, setAiMuscle] = useState("Bacak");
  const [aiGoal, setAiGoal] = useState("");
  const [aiEquipment, setAiEquipment] = useState("tam donanımlı salon");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);

  const generateAIPlan = async () => {
    setAiLoading(true);
    setGeneratedPlan(null);

    try {
      const prompt = `Sen profesyonel bir fitness koçusun. Kişiye özel, detaylı antrenman programı oluştur.

Kullanıcı bilgileri:
- Hedef kas grubu: ${aiMuscle}
- Seviye: ${aiLevel}
- Ekipman: ${aiEquipment}
- Ek hedef: ${aiGoal || "genel güç ve kas gelişimi"}

SADECE aşağıdaki JSON formatını döndür, başka hiçbir şey yazma, markdown backtick kullanma:
{
  "title": "Program başlığı (kısa ve motive edici)",
  "description": "2-3 cümle, bu programın neden etkili olduğunu açıkla",
  "warmup": "5-10 dakika ısınma detayları",
  "exercises": [
    {
      "name": "Egzersiz adı",
      "sets": 4,
      "reps": 12,
      "rest": 90,
      "tip": "Bu hareketi doğru yapmak için 1 kritik ipucu",
      "why": "Bu egzersiz neden bu programa dahil edildi, hangi kasları nasıl çalıştırıyor",
      "common_mistake": "En sık yapılan 1 hata ve nasıl önleneceği",
      "alternative": "Ekipman yoksa veya zor gelirse alternatif egzersiz"
    }
  ],
  "cooldown": "5 dakika soğuma ve esneme detayları",
  "frequency": "Haftada kaç gün, hangi günler",
  "duration": "Toplam tahmini süre dakika olarak",
  "notes": "Bu programa özel 1-2 önemli not veya uyarı"
}

Seviyeye göre egzersiz sayısı:
- başlangıç: 4-5 egzersiz, düşük yoğunluk, temel hareketler
- orta: 5-6 egzersiz, orta yoğunluk, compound + isolation
- ileri: 6-8 egzersiz, yüksek yoğunluk, ileri teknikler

Mevcut egzersiz havuzu (bunlardan seç, yoksa benzer yaz): Squat, Bench Press, Deadlift, Pull-up, Shoulder Press, Plank, Dumbbell Curl, Lateral Raise, Romanian Deadlift, Push-up, Tricep Dips, Barbell Row.

Ekipman "${aiEquipment}" ise buna uygun egzersizler seç.
Türkçe yaz.`;

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
      setGeneratedPlan({
        title: "Hata oluştu",
        description: "Plan oluşturulamadı. API bağlantısını kontrol edip tekrar dene.",
        exercises: [],
      });
    }
    setAiLoading(false);
  };

  // Egzersiz için veritabanında eşleşen kaydı bul
  const findExercise = (name: string) => {
    return EXERCISES.find(e =>
      e.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(e.name.toLowerCase())
    );
  };

  return (
    <Modal title="🤖 AI Antrenman Programı" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {!generatedPlan ? (
          <>
            <p style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono',monospace", lineHeight: 1.6 }}>
              Sana özel, detaylı antrenman programı oluşturuyorum. Her hareket için neden seçildiği, doğru form ipuçları ve alternatifler dahil.
            </p>

            {/* Seviye */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>SEVİYE</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["başlangıç", "orta", "ileri"].map(l => (
                  <button key={l} onClick={() => setAiLevel(l)} style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", borderRadius: 10, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: aiLevel === l ? "linear-gradient(135deg,#ff5000,#ff8c00)" : "rgba(255,255,255,0.05)", color: aiLevel === l ? "#fff" : "#555", boxShadow: aiLevel === l ? "0 4px 12px rgba(255,80,0,0.28)" : "none" }}>
                    {l === "başlangıç" ? "🌱 Başlangıç" : l === "orta" ? "🔥 Orta" : "⚡ İleri"}
                  </button>
                ))}
              </div>
            </div>

            {/* Kas grubu */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>HEDEF KAS GRUBU</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Bacak", "Göğüs", "Sırt", "Omuz", "Core", "Bicep", "Tricep", "Tam Vücut", "Üst Vücut", "Alt Vücut"].map(m => (
                  <button key={m} onClick={() => setAiMuscle(m)} style={{ padding: "7px 13px", cursor: "pointer", borderRadius: 50, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: aiMuscle === m ? "rgba(255,80,0,0.2)" : "rgba(255,255,255,0.05)", color: aiMuscle === m ? "#ff8c00" : "#555", border: aiMuscle === m ? "1px solid rgba(255,80,0,0.4)" : "1px solid transparent" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Ekipman */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>EKİPMAN</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["tam donanımlı salon", "dumbbell", "yalnızca vücut ağırlığı", "barbell + rack", "kettlebell"].map(eq => (
                  <button key={eq} onClick={() => setAiEquipment(eq)} style={{ padding: "7px 13px", cursor: "pointer", borderRadius: 50, fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, transition: "all 0.2s", background: aiEquipment === eq ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.05)", color: aiEquipment === eq ? "#38bdf8" : "#555", border: aiEquipment === eq ? "1px solid rgba(56,189,248,0.4)" : "1px solid transparent" }}>
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Ek hedef */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#ff5000", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>EK HEDEF (opsiyonel)</div>
              <FInput placeholder="Örn: kilo vermek, güç artışı, atletizm, hipertrofi..." value={aiGoal} onChange={e => setAiGoal(e.target.value)} />
            </div>

            <button onClick={generateAIPlan} disabled={aiLoading} style={{ padding: "14px", background: aiLoading ? "rgba(255,80,0,0.1)" : "linear-gradient(135deg,#ff5000,#ff8c00)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 800, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "'Syne',sans-serif", letterSpacing: 0.5, boxShadow: aiLoading ? "none" : "0 6px 20px rgba(255,80,0,0.35)", transition: "all 0.3s", opacity: aiLoading ? 0.7 : 1 }}>
              {aiLoading ? "🤖 Detaylı program hazırlanıyor..." : "🚀 Program Oluştur"}
            </button>
          </>
        ) : (
          // SONUÇ GÖSTERİMİ
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Başlık */}
            <div style={{ background: "rgba(255,80,0,0.06)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#ff8c00", marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>{generatedPlan.title}</div>
              <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>{generatedPlan.description}</div>
            </div>

            {/* Isınma */}
            {generatedPlan.warmup && (
              <div style={{ padding: "12px 16px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>🔥 ISINMA</div>
                <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{generatedPlan.warmup}</div>
              </div>
            )}

            {/* Egzersizler — genişletilebilir kartlar */}
            <div>
              <div style={{ fontSize: 9, color: "#ff5000", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>
                💪 EGZERSİZLER ({generatedPlan.exercises?.length || 0} hareket)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {generatedPlan.exercises?.map((ex, i) => {
                  const dbEx = findExercise(ex.name);
                  const isExpanded = expandedEx === i;
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      {/* Başlık satırı */}
                      <div onClick={() => setExpandedEx(isExpanded ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,80,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                            {dbEx?.emoji || "🏋️"}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{ex.name}</div>
                            <div style={{ fontSize: 9, color: "#555", fontFamily: "'DM Mono',monospace" }}>
                              {ex.sets} set × {ex.reps} tekrar · {ex.rest}sn dinlenme
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#ff8c00", fontFamily: "'DM Mono',monospace" }}>
                            {ex.sets}×{ex.reps}
                          </span>
                          <span style={{ color: "#444", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {/* Genişletilmiş detaylar */}
                      {isExpanded && (
                        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ paddingTop: 12 }} />

                          {/* Neden bu egzersiz */}
                          {ex.why && (
                            <div style={{ padding: "10px 12px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10 }}>
                              <div style={{ fontSize: 9, color: "#38bdf8", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 5 }}>📌 NEDEN BU HAREKET?</div>
                              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{ex.why}</div>
                            </div>
                          )}

                          {/* İpucu */}
                          {ex.tip && (
                            <div style={{ padding: "10px 12px", background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10 }}>
                              <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 5 }}>💡 FORM İPUCU</div>
                              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{ex.tip}</div>
                            </div>
                          )}

                          {/* Sık hata */}
                          {ex.common_mistake && (
                            <div style={{ padding: "10px 12px", background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)", borderRadius: 10 }}>
                              <div style={{ fontSize: 9, color: "#f43f5e", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 5 }}>⚠️ EN SIK HATA</div>
                              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{ex.common_mistake}</div>
                            </div>
                          )}

                          {/* Alternatif */}
                          {(ex.alternative || dbEx?.alternatives) && (
                            <div style={{ padding: "10px 12px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10 }}>
                              <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 5 }}>🔄 ALTERNATİF</div>
                              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6, marginBottom: 6 }}>
                                {ex.alternative || "—"}
                              </div>
                              {dbEx?.alternatives && (
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {dbEx.alternatives.slice(0, 3).map(alt => (
                                    <span key={alt} style={{ fontSize: 9, padding: "2px 8px", background: "rgba(74,222,128,0.1)", color: "#4ade80", borderRadius: 10, fontFamily: "'DM Mono',monospace" }}>{alt}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Video linki */}
                          {dbEx?.videoId && (
                            <a
                              href={`https://www.youtube.com/watch?v=${dbEx.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: "9px 14px", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: 8, color: "#ff4444", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
                            >
                              ▶ {dbEx.videoTitle} — YouTube
                            </a>
                          )}
                          {!dbEx?.videoId && (
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " nasıl yapılır teknik")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: "9px 14px", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: 8, color: "#ff4444", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
                            >
                              🔍 YouTube&apos;da Ara: {ex.name}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Soğuma */}
            {generatedPlan.cooldown && (
              <div style={{ padding: "12px 16px", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12 }}>
                <div style={{ fontSize: 9, color: "#38bdf8", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>🧊 SOĞUMA</div>
                <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{generatedPlan.cooldown}</div>
              </div>
            )}

            {/* Notlar */}
            {generatedPlan.notes && (
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                <div style={{ fontSize: 9, color: "#888", letterSpacing: 2, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>📝 NOTLAR</div>
                <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{generatedPlan.notes}</div>
              </div>
            )}

            {/* Frekans + Süre */}
            <div style={{ display: "flex", gap: 8 }}>
              {[{ label: "Frekans", val: generatedPlan.frequency, icon: "📅" }, { label: "Süre", val: generatedPlan.duration, icon: "⏱" }].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 8, color: "#3f3f46", letterSpacing: 1.5, fontFamily: "'DM Mono',monospace", marginBottom: 4, textTransform: "uppercase" }}>{s.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ff8c00" }}>{s.val || "—"}</div>
                </div>
              ))}
            </div>

            {/* Yeniden oluştur butonu */}
            <button onClick={() => setGeneratedPlan(null)} style={{ padding: "11px", background: "rgba(255,80,0,0.1)", border: "1px solid rgba(255,80,0,0.3)", borderRadius: 12, color: "#ff8c00", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif" }}>
              ← Yeni Program Oluştur
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}