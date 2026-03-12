// src/app/api/workouts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { workoutsDb } from "../../../lib/db";

// GET /api/workouts  → tüm antrenmanlar
export async function GET(): Promise<NextResponse> {
  try {
    const workouts = workoutsDb.getAll();
    return NextResponse.json({ workouts });
  } catch (err) {
    console.error("[GET /api/workouts]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST /api/workouts  { dayIndex, exercises, note }
// Bir güne egzersiz listesi kaydet (upsert)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as {
      dayIndex?: number;
      exercises?: string[];
      note?: string;
    };

    const { dayIndex, exercises, note = "" } = body;

    if (typeof dayIndex !== "number" || !Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "dayIndex ve exercises zorunlu" },
        { status: 400 }
      );
    }
    if (dayIndex < 0 || dayIndex > 6) {
      return NextResponse.json({ error: "dayIndex 0-6 arası olmalı" }, { status: 400 });
    }

    const workout = workoutsDb.upsertForDay(dayIndex, exercises, note);
    return NextResponse.json({ workout }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workouts]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// DELETE /api/workouts?id=2
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id zorunlu" }, { status: 400 });
    workoutsDb.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/workouts]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
