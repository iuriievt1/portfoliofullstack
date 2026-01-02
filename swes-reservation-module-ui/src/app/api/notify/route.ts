import { NextResponse } from "next/server";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const required = ["employeeId", "employeeName", "itemId", "itemName", "date"] as const;
    for (const k of required) {
      if (!body?.[k]) {
        return NextResponse.json({ message: `Missing field: ${k}` }, { status: 400 });
      }
    }

    // simulation latency
    await sleep(450);

    // optional: small failure chance to demonstrate error UI
    const fail = Math.random() < 0.12;
    if (fail) {
      return NextResponse.json(
        { message: "Simulated email provider error. Please retry." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Email notification queued (simulated) for ${body.employeeName} — ${body.itemId}`,
    });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Notify error" }, { status: 500 });
  }
}
