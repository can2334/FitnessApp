'use server'
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ─── DASHBOARD VERİSİ ────────────────────────────────────────────────────────
export async function getDashboardData() {
    const db = await getDb();

    const meals = await db.all('SELECT * FROM meals WHERE date(createdAt) = date("now")');
    const stats = await db.all('SELECT * FROM stats WHERE date = date("now")');
    const latestWeight = await db.get("SELECT * FROM stats WHERE type = 'weight' ORDER BY id DESC LIMIT 1");
    const allWorkouts = await db.all('SELECT id, title FROM workouts');

    const schedule = await db.all(`
    SELECT ws.day_index, ws.is_rest_day, ws.workout_id, w.title, w.exercises
    FROM weekly_schedule ws
    LEFT JOIN workouts w ON ws.workout_id = w.id
    ORDER BY ws.day_index
  `);

    const parsedSchedule = schedule.map((s: any) => ({
        ...s,
        exercises: s.exercises ? JSON.parse(s.exercises) : [],
    }));

    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const todaySchedule = parsedSchedule.find((s: any) => s.day_index === todayIndex);

    return {
        meals: meals || [],
        stats: stats || [],
        latestWeight: latestWeight?.value || null,
        allWorkouts: allWorkouts || [],
        weeklySchedule: parsedSchedule,
        currentWorkout: todaySchedule && !todaySchedule.is_rest_day ? todaySchedule : null,
        todayIsRest: todaySchedule?.is_rest_day === 1,
    };
}

// ─── ÖĞÜN ────────────────────────────────────────────────────────────────────
export async function addMeal(name: string, calories: number, protein: number = 0) {
    const db = await getDb();
    await db.run('INSERT INTO meals (name, calories, protein) VALUES (?, ?, ?)', [name, calories, protein]);
    revalidatePath('/');
}

export async function deleteMeal(id: number) {
    const db = await getDb();
    await db.run('DELETE FROM meals WHERE id = ?', [id]);
    revalidatePath('/');
}

// ─── SU ──────────────────────────────────────────────────────────────────────
export async function updateWater(amount: number) {
    const db = await getDb();
    await db.run("INSERT INTO stats (type, value, unit) VALUES ('water', ?, 'L')", [amount]);
    revalidatePath('/');
}

// ─── KİLO ────────────────────────────────────────────────────────────────────
export async function updateWeight(value: number) {
    const db = await getDb();
    await db.run("INSERT INTO stats (type, value, unit) VALUES ('weight', ?, 'kg')", [value]);
    revalidatePath('/');
}

// ─── ANTRENMAN ───────────────────────────────────────────────────────────────
export async function createWorkout(title: string, exercises: { name: string; sets: number; reps: number }[]) {
    const db = await getDb();
    await db.run('INSERT INTO workouts (title, exercises) VALUES (?, ?)', [title, JSON.stringify(exercises)]);
    revalidatePath('/');
}

export async function deleteWorkout(id: number) {
    const db = await getDb();
    await db.run('DELETE FROM workouts WHERE id = ?', [id]);
    await db.run('UPDATE weekly_schedule SET workout_id = NULL, is_rest_day = 1 WHERE workout_id = ?', [id]);
    revalidatePath('/');
}

// ─── HAFTALIK PROGRAM ────────────────────────────────────────────────────────
export async function updateDaySchedule(dayIndex: number, workoutId: number | null, isRestDay: boolean) {
    const db = await getDb();
    await db.run(
        'UPDATE weekly_schedule SET workout_id = ?, is_rest_day = ? WHERE day_index = ?',
        [workoutId, isRestDay ? 1 : 0, dayIndex]
    );
    revalidatePath('/');
}