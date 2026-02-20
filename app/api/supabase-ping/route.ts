import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  try {
    const res = await fetch(`${url}/rest/v1/`, { method: "GET" });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : JSON.stringify(e);

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
