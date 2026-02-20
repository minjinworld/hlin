import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      {
        error: "비밀번호가 다릅니다.",
      },
      { status: 401 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { error: "DB_FETCH_FAILED", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ orders: data ?? [] });
}
