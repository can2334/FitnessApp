// src/app/api/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { scheduleDb, workoutsDb } from "../../../lib/db";

// GET /api/schedule  → tüm hafta + her günün workout'u
export async function GET(): Promise<NextResponse> {
  try {
    const schedule = scheduleDb.getAll();

    // Her günün workout'unu da çek
    const enriched = schedule.map((day) => ({
      ...day,
      workout: day.workout_id ? workoutsDb.getById(day.workout_id) : null,
    }));

    return NextResponse.json({ schedule: enriched });
  } catch (err) {
    console.error("[GET /api/schedule]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// PATCH /api/schedule  { dayIndex, isRest }
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { dayIndex?: number; isRest?: boolean };
    const { dayIndex, isRest } = body;

    if (typeof dayIndex !== "number" || typeof isRest !== "boolean") {
      return NextResponse.json({ error: "dayIndex ve isRest zorunlu" }, { status: 400 });
    }
    if (dayIndex < 0 || dayIndex > 6) {
      return NextResponse.json({ error: "dayIndex 0-6 arası olmalı" }, { status: 400 });
    }

    scheduleDb.setRest(dayIndex, isRest);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/schedule]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
