import { NextResponse } from "next/server";

export async function POST() {
  await new Promise((r) => setTimeout(r, 650));
  return NextResponse.json({ ok: true, id: `RES-${Math.random().toString(16).slice(2, 8)}` });
}
