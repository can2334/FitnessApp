import { Activity, Droplets, Utensils, TrendingUp, Calendar, Bell } from 'lucide-react';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Üst Başlık */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold italic tracking-tighter">FITNESS-APP / DASHBOARD</h1>
          <div className="flex gap-4">
            <Bell className="text-zinc-400 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-green-500" />
          </div>
        </header>

        {/* 1. Özet Kartları (Dashboard Bölümü) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Utensils size={20} />} title="Günün Kalorisi" value="420" unit="kcal" color="text-orange-500" />
          <StatCard icon={<Droplets size={20} />} title="İçilen Su" value="1.5" unit="Litre" color="text-blue-500" />
          <StatCard icon={<Activity size={20} />} title="Bugünkü Antrenman" value="Push Day" unit="" color="text-red-500" />
          <StatCard icon={<TrendingUp size={20} />} title="Güncel Kilo" value="78.5" unit="kg" color="text-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 2. Beslenme & Kalori Hesaplama */}
          <section className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils className="text-orange-500" size={18} /> Beslenme
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm bg-zinc-800 p-3 rounded-lg">
                <span>Kaşarlı Poğaça</span>
                <span className="font-mono">330 kcal</span>
              </div>
              <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-all">
                + Öğün Ekle
              </button>
            </div>
          </section>

          {/* 3. Spor Programı (PPL Yapısı) */}
          <section className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-red-500" size={18} /> Spor Programı (Push)
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Bench Press</span>
                <span className="text-zinc-400">4 Set x 10 Tekrar</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Shoulder Press</span>
                <span className="text-zinc-400">3 Set x 12 Tekrar</span>
              </div>
            </div>
          </section>

          {/* 4. İstatistik & Ölçüler */}
          <section className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-green-500" size={18} /> İstatistik
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-xs text-zinc-400">Antrenman/Hafta</p>
                <p className="text-xl font-bold text-green-400">5</p>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <p className="text-xs text-zinc-400">Yağ Oranı</p>
                <p className="text-xl font-bold text-blue-400">%14</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

// Yardımcı Bileşen
function StatCard({ icon, title, value, unit, color }: any) {
  return (
    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-zinc-400 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-zinc-500 uppercase">{unit}</span>
      </div>
    </div>
  );
}