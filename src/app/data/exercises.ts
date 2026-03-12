export interface Exercise {
  id: number;
  name: string;
  muscle: string;
  emoji: string;
  sets: number;
  reps: number;
  rest: number;
  calories: number;
  difficulty: "başlangıç" | "orta" | "ileri";
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleNames: { primary: string[]; secondary: string[] };
  correct: string[];
  wrong: string[];
  breath: string;
  tip: string;
  alternatives: string[];
  videoId?: string; // YouTube video ID
  videoTitle?: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: 1, name: "Squat", muscle: "Bacak", emoji: "🦵", sets: 4, reps: 12, rest: 90, calories: 8,
    difficulty: "orta", equipment: ["Barbell", "Rack"],
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    muscleNames: { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Core"] },
    correct: ["Ayaklar omuz genişliğinde, parmaklar hafif dışa", "Diz ayak parmağıyla aynı yönde", "Sırt düz, göğüs yukarı", "Topuklar yerde, ağırlık topukta", "Kalça en az paralele iniyor"],
    wrong: ["Dizler içe çöküyor (valgus kollapsu)", "Topuklar yerden kalkıyor", "Sırt kamburlaşıyor", "Fazla öne eğilme"],
    breath: "İnerken nefes al → En altta tut → Çıkarken ver",
    tip: "Sanki arkana oturur gibi inin, dizlere değil kalçaya odaklanın",
    alternatives: ["Goblet Squat", "Leg Press", "Bulgarian Split Squat", "Box Squat"],
    videoId: "ultWZbUMPL8",
    videoTitle: "Squat Tekniği",
  },
  {
    id: 2, name: "Bench Press", muscle: "Göğüs", emoji: "💪", sets: 4, reps: 10, rest: 120, calories: 7,
    difficulty: "orta", equipment: ["Barbell", "Bench"],
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_shoulder"],
    muscleNames: { primary: ["Pectoralis Major"], secondary: ["Triceps", "Ön Deltoid"] },
    correct: ["Bar meme başı hizasına iniyor", "Kürek kemikleri birbirine yakın", "Dirsekler 45-75° açıda", "Ayaklar yerde sabit", "Bilek düz, kırılmıyor"],
    wrong: ["Bar boyuna veya karına iniyor", "Dirsekler tamamen yana açılıyor", "Kalça tezgahtan kalkıyor", "Bilek geriye kırılıyor"],
    breath: "İnerken nefes al → Göğüste tut → İterken ver",
    tip: "Bar indirirken 'yırtma' hareketi hayal et, daha fazla göğüs aktive olur",
    alternatives: ["Dumbbell Press", "Push-up", "Cable Fly", "Incline Press"],
    videoId: "vcBig73ojpE",
    videoTitle: "Bench Press Tekniği",
  },
  {
    id: 3, name: "Deadlift", muscle: "Sırt", emoji: "🏋️", sets: 3, reps: 8, rest: 180, calories: 10,
    difficulty: "ileri", equipment: ["Barbell"],
    primaryMuscles: ["lower_back", "glutes", "hamstrings"],
    secondaryMuscles: ["traps", "core", "quads"],
    muscleNames: { primary: ["Erector Spinae", "Gluteus Maximus", "Hamstrings"], secondary: ["Trapezius", "Core"] },
    correct: ["Bar ayak ortası üzerinde", "Sırt düz, nötr omurga", "Kalça menteşe hareketi", "Bar bacaklara yapışık kalıyor", "Core boyunca sıkılı"],
    wrong: ["Sırt kamburlaşıyor — EN TEHLİKELİ HATA", "Bar vücuttan uzaklaşıyor", "Omuzlar geri gidiyor", "Diz bükülüp squat'a dönüyor"],
    breath: "Kaldırmadan derin al → Kaldırırken tut (Valsalva) → En üstte ver",
    tip: "Kaldırmadan önce 'yerden bastır' değil 'zemin ittir' diye düşün",
    alternatives: ["Romanian Deadlift", "Trap Bar Deadlift", "Sumo Deadlift", "Kettlebell Deadlift"],
    videoId: "op9kVnSso6Q",
    videoTitle: "Deadlift Tekniği",
  },
  {
    id: 4, name: "Pull-up", muscle: "Sırt", emoji: "🔝", sets: 3, reps: 8, rest: 90, calories: 6,
    difficulty: "orta", equipment: ["Pull-up Bar"],
    primaryMuscles: ["lats", "biceps"],
    secondaryMuscles: ["rear_shoulder", "core"],
    muscleNames: { primary: ["Latissimus Dorsi", "Biceps Brachii"], secondary: ["Arka Deltoid", "Core"] },
    correct: ["Kürek kemikleri önce aşağı çek, sonra kol bük", "Çene barın üstüne geliyor", "Tam aşağı inerek kollar açılıyor", "Core sıkılı, bacaklar çapraz", "Kontrollü iniş"],
    wrong: ["Sadece kollar çalışıyor, sırt devreye girmiyor", "Sallanarak momentum kullanımı", "Yarım hareket", "Boyun uzanarak çene değdirme"],
    breath: "Çıkarken ver → İnerken al",
    tip: "Barı dirseğine doğru çekiyormuş gibi düşün, bilek değil dirsek",
    alternatives: ["Lat Pulldown", "Assisted Pull-up", "Band Pull-up", "Inverted Row"],
    videoId: "eGo4IYlbE5g",
    videoTitle: "Pull-up Tekniği",
  },
  {
    id: 5, name: "Shoulder Press", muscle: "Omuz", emoji: "🙌", sets: 3, reps: 12, rest: 90, calories: 6,
    difficulty: "orta", equipment: ["Barbell veya Dumbbell"],
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "traps"],
    muscleNames: { primary: ["Anterior & Medial Deltoid"], secondary: ["Triceps", "Trapezius"] },
    correct: ["Bar çene hizasından başlıyor", "Bel fazla kavislenmiyor", "Core sıkılı, dik duruş", "Baş bar geçerken hafif öne alınıyor", "Tam yukarı uzanıyor"],
    wrong: ["Bel aşırı kavislenip öne devrilme", "Dirsekler tamamen yana açılıyor", "Bacak yardımı ile itme", "Yarım hareket"],
    breath: "İterken ver → İnerken al",
    tip: "Ayakta yaparken ayakları hafif önde-arkada koy, denge artar",
    alternatives: ["Dumbbell Shoulder Press", "Arnold Press", "Cable Press", "Landmine Press"],
    videoId: "2yjwXTZQDDI",
    videoTitle: "Shoulder Press Tekniği",
  },
  {
    id: 6, name: "Plank", muscle: "Core", emoji: "🧱", sets: 3, reps: 45, rest: 60, calories: 4,
    difficulty: "başlangıç", equipment: ["Ekipman yok"],
    primaryMuscles: ["core"],
    secondaryMuscles: ["shoulders", "glutes"],
    muscleNames: { primary: ["Rectus Abdominis", "Transverse Abdominis"], secondary: ["Omuzlar", "Gluteus"] },
    correct: ["Baştan topuğa düz bir çizgi", "Dirsekler omuz altında", "Core ve gluteus sıkılı", "Boyun nötr, yere bakıyor", "Nefes almaya devam"],
    wrong: ["Kalça yukarı çıkıyor", "Bel aşağı sarkıyor", "Boyun aşırı yukarı", "Nefes tutma"],
    breath: "Derin ve düzenli nefes — hiç tutma!",
    tip: "Her saniye biraz daha sık — son 5 saniyede her şeyi ver",
    alternatives: ["Side Plank", "Dead Bug", "Ab Wheel", "Hollow Hold"],
    videoId: "pSHjTRCQxIw",
    videoTitle: "Plank Tekniği",
  },
  {
    id: 7, name: "Dumbbell Curl", muscle: "Bicep", emoji: "💪", sets: 3, reps: 15, rest: 60, calories: 5,
    difficulty: "başlangıç", equipment: ["Dumbbell"],
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    muscleNames: { primary: ["Biceps Brachii"], secondary: ["Brachialis", "Ön Kol"] },
    correct: ["Dirsekler gövdeye yapışık, sabit", "Yukarı çıkarken bilek döndürülüyor", "Tam aşağı inerek tam kasılma", "Kontrollü yavaş iniş", "Dik duruş, sallanma yok"],
    wrong: ["Dirsekler öne gidiyor — momentum", "Sırt geriye yatıyor", "Hızlı ve sallantılı", "Yarım hareket"],
    breath: "Kaldırırken ver → İndirirken al",
    tip: "İniş kısmını 3 saniyeye uzat — biceps daha fazla büyür",
    alternatives: ["Barbell Curl", "Hammer Curl", "Cable Curl", "Concentration Curl"],
    videoId: "ykJmrZ5v0Oo",
    videoTitle: "Dumbbell Curl Tekniği",
  },
  {
    id: 8, name: "Lateral Raise", muscle: "Omuz", emoji: "🦅", sets: 3, reps: 15, rest: 60, calories: 4,
    difficulty: "başlangıç", equipment: ["Dumbbell"],
    primaryMuscles: ["side_shoulder"],
    secondaryMuscles: ["traps", "front_shoulder"],
    muscleNames: { primary: ["Medial (Yan) Deltoid"], secondary: ["Trapezius", "Ön Deltoid"] },
    correct: ["Kollar hafif önde, 30° açı", "Dirsekler hafif bükük, sabit", "Küçük parmak yukarı döner", "90°'de dur, daha yukarı çıkma", "Kontrollü iniş"],
    wrong: ["Kollar tam yana gidip trapeze kayıyor", "Dirsekler düz", "Sallanarak momentum", "Omuzlar kulağa doğru kalkıyor"],
    breath: "Kaldırırken ver → İndirirken al",
    tip: "Ellerini değil dirseklerini kaldırıyormuş gibi düşün",
    alternatives: ["Cable Lateral Raise", "Machine Lateral Raise", "Face Pull", "Upright Row"],
    videoId: "3VcKaXpzqRo",
    videoTitle: "Lateral Raise Tekniği",
  },
  {
    id: 9, name: "Romanian Deadlift", muscle: "Bacak", emoji: "🦵", sets: 3, reps: 10, rest: 120, calories: 9,
    difficulty: "orta", equipment: ["Barbell veya Dumbbell"],
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "core"],
    muscleNames: { primary: ["Hamstrings", "Gluteus Maximus"], secondary: ["Alt Sırt", "Core"] },
    correct: ["Hafif diz bükümü, neredeyse düz bacak", "Kalça geriye itilir — menteşe hareketi", "Bar bacaklara yapışık iner", "Sırt düz boyunca", "Hamstring gerilince dur"],
    wrong: ["Sırt kamburlaşıyor", "Bar vücuttan uzaklaşıyor", "Dizler fazla bükülüyor", "Sadece bel bükülüyor"],
    breath: "İnerken al → Çıkarken ver",
    tip: "Hamstring'i 'yırtılacak gibi' hissedince mükemmel noktadasın",
    alternatives: ["Good Morning", "Leg Curl", "Nordic Curl", "Kettlebell Swing"],
    videoId: "7j-2w6S-CBk",
    videoTitle: "Romanian Deadlift Tekniği",
  },
  {
    id: 10, name: "Push-up", muscle: "Göğüs", emoji: "🤸", sets: 3, reps: 15, rest: 60, calories: 5,
    difficulty: "başlangıç", equipment: ["Ekipman yok"],
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "core", "front_shoulder"],
    muscleNames: { primary: ["Pectoralis Major"], secondary: ["Triceps", "Core", "Ön Deltoid"] },
    correct: ["Eller omuz genişliğinde veya biraz dışa", "Vücut baştan topuğa düz çizgi", "Göğüs yere değiyor ya da çok yakın", "Dirsekler 45° gövdeye yakın", "Core sıkılı"],
    wrong: ["Kalça yukarı çıkıyor veya aşağı sarkıyor", "Dirsekler tamamen yana açılıyor", "Yarım hareket", "Baş öne uzanıyor"],
    breath: "İnerken al → İterken ver",
    tip: "Yerleri 'dışa yırtıyormuş' gibi tut — göğüs daha çok aktive",
    alternatives: ["Incline Push-up", "Decline Push-up", "Diamond Push-up", "Archer Push-up"],
    videoId: "IODxDxX7oi4",
    videoTitle: "Push-up Tekniği",
  },
  {
    id: 11, name: "Tricep Dips", muscle: "Tricep", emoji: "💥", sets: 3, reps: 12, rest: 60, calories: 5,
    difficulty: "başlangıç", equipment: ["Parallel Bars veya Bench"],
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["chest", "front_shoulder"],
    muscleNames: { primary: ["Triceps Brachii"], secondary: ["Pectoralis Major", "Ön Deltoid"] },
    correct: ["Gövde dik, hafif öne eğim", "Dirsekler arkaya gidiyor, yana açılmıyor", "Omuzlar aşağıda sabit", "Tam aşağı inip tam yukarı çıkış", "Core sıkılı"],
    wrong: ["Omuzlar yukarı çıkıyor (trapez kullanımı)", "Dirsekler yana açılıyor", "Yarım hareket", "Fazla öne eğilme"],
    breath: "İnerken al → Çıkarken ver",
    tip: "Dirseklerin yönüne dikkat et — arkaya gitmeli",
    alternatives: ["Skull Crusher", "Tricep Pushdown", "Close Grip Bench Press", "Overhead Extension"],
    videoId: "0326dy_-CzM",
    videoTitle: "Tricep Dips Tekniği",
  },
  {
    id: 12, name: "Barbell Row", muscle: "Sırt", emoji: "🏋️", sets: 4, reps: 10, rest: 90, calories: 8,
    difficulty: "orta", equipment: ["Barbell"],
    primaryMuscles: ["lats", "traps"],
    secondaryMuscles: ["biceps", "rear_shoulder", "lower_back"],
    muscleNames: { primary: ["Latissimus Dorsi", "Trapezius"], secondary: ["Biceps", "Arka Deltoid", "Alt Sırt"] },
    correct: ["Gövde ~45° eğim", "Bar karın hizasına çekiliyor", "Kürek kemikleri birbirine yaklaşıyor", "Sırt düz, nötr omurga", "Kontrollü iniş"],
    wrong: ["Sırt kamburlaşıyor", "Momentum ile sallayarak çekmek", "Bar göğse çekiliyor", "Dirsekler çok yana açılıyor"],
    breath: "Çekerken ver → İndirirken al",
    tip: "Dirseğini cebine sokar gibi düşün — sırt kasları daha çok aktive",
    alternatives: ["Dumbbell Row", "Cable Row", "T-Bar Row", "Chest Supported Row"],
    videoId: "G8l_8chR5BE",
    videoTitle: "Barbell Row Tekniği",
  },
];

export const WEEKLY_DATA = [
  { day: "Pzt", vol: 65, kcal: 420 },
  { day: "Sal", vol: 40, kcal: 280 },
  { day: "Çrş", vol: 80, kcal: 510 },
  { day: "Prş", vol: 55, kcal: 350 },
  { day: "Cum", vol: 90, kcal: 580 },
  { day: "Cmt", vol: 30, kcal: 210 },
  { day: "Paz", vol: 0,  kcal: 0   },
];

export const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];