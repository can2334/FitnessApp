import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
    const db = await openDb();
    const workouts = await db.all('SELECT * FROM workouts');

    // JSON string olan egzersizleri objeye çeviriyoruz
    const formatted = workouts.map(w => ({
        ...w,
        exercises: JSON.parse(w.exercises || '[]')
    }));

    return NextResponse.json(formatted);
}