import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    urlOk: /^https?:\/\//.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
