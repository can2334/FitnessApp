import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function init() {
  try {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database,
    });

    console.log('🛠️ Veritabanı oluşturuluyor...');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        calories INTEGER,
        protein REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        exercises TEXT,
        date DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        value REAL,
        unit TEXT,
        date DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS weekly_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_index INTEGER UNIQUE,
        workout_id INTEGER,
        is_rest_day INTEGER DEFAULT 0,
        FOREIGN KEY (workout_id) REFERENCES workouts(id)
      );
    `);

    // Varsayılan haftalık program (0=Pzt ... 6=Paz)
    const defaultSchedule = [
      { day: 0, rest: 0 }, // Pazartesi - antrenman
      { day: 1, rest: 0 }, // Salı - antrenman
      { day: 2, rest: 1 }, // Çarşamba - dinlenme
      { day: 3, rest: 0 }, // Perşembe - antrenman
      { day: 4, rest: 0 }, // Cuma - antrenman
      { day: 5, rest: 1 }, // Cumartesi - dinlenme
      { day: 6, rest: 1 }, // Pazar - dinlenme
    ];

    for (const s of defaultSchedule) {
      await db.run(
        `INSERT OR IGNORE INTO weekly_schedule (day_index, is_rest_day) VALUES (?, ?)`,
        [s.day, s.rest]
      );
    }

    await db.run("INSERT INTO meals (name, calories) VALUES ('İlk Öğün', 0)");

    console.log('✅ database.db başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

init();