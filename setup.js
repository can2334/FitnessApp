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
    `);

    // İlk veriyi ekleyelim
    await db.run("INSERT INTO meals (name, calories) VALUES ('İlk Öğün', 0)");

    console.log('✅ database.db başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

init();