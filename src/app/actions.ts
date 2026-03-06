'use server'

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addMeal(formData: FormData) {
    const name = formData.get('name');
    const calories = formData.get('calories');

    const db = await getDb();
    await db.run(
        'INSERT INTO meals (name, calories) VALUES (?, ?)',
        [name, calories]
    );

    // Sayfayı yenilemeden veriyi güncellemesini sağlar
    revalidatePath('/');
}