// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { statsDb, StatType } from "../../..//lib/db";

const VALID_TYPES: StatType[] = ["weight", "water", "water_goal", "target_weight"];

// GET /api/stats?type=weight
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const type = req.nextUrl.searchParams.get("type") as StatType | null;

    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({ error: "Geçersiz type" }, { status: 400 });
      }
      const rows = statsDb.getByType(type);
      const latest = statsDb.getLatest(type);
      return NextResponse.json({ rows, latest });
    }

    // Tüm özet — her type için latest
    const summary = Object.fromEntries(
      VALID_TYPES.map((t) => [t, statsDb.getLatest(t)])
    );
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST /api/stats  { type, value, unit, upsertToday? }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as {
      type?: string;
      value?: number;
      unit?: string;
      upsertToday?: boolean;
    };

    const { type, value, unit = "", upsertToday = false } = body;

    if (!type || !VALID_TYPES.includes(type as StatType)) {
      return NextResponse.json({ error: "Geçersiz type" }, { status: 400 });
    }
    if (typeof value !== "number") {
      return NextResponse.json({ error: "value sayı olmalı" }, { status: 400 });
    }

    const t = type as StatType;

    if (upsertToday) {
      statsDb.upsertToday(t, value, unit);
      const latest = statsDb.getLatest(t);
      return NextResponse.json({ stat: latest });
    }

    const stat = statsDb.insert(t, value, unit);
    return NextResponse.json({ stat }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/stats]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// DELETE /api/stats?id=3
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "id zorunlu" }, { status: 400 });
    statsDb.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/stats]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
