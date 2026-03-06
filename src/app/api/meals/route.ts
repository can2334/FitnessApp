import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
    const db = await openDb();
    const meals = await db.all('SELECT * FROM meals ORDER BY createdAt DESC');
    return NextResponse.json(meals);
}

export async function POST(req: Request) {
    const { name, calories } = await req.json();
    const db = await openDb();

    await db.run(
        'INSERT INTO meals (name, calories) VALUES (?, ?)',
        [name, calories]
    );

    return NextResponse.json({ success: true });
}