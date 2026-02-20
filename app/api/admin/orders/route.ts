// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "비밀번호가 다릅니다." },
      { status: 401 },
    );
  }

  // ✅ 함수 호출해서 클라이언트 생성
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
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
