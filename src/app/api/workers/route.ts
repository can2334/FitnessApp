import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = await getDb();
    const workouts = await db.all('SELECT * FROM workouts');

    // JSON string olan egzersizleri objeye çeviriyoruz
    const formatted = workouts.map(w => ({
        ...w,
        exercises: JSON.parse(w.exercises || '[]')
    }));

    return NextResponse.json(formatted);
}