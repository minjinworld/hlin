// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", detail: "비밀번호가 다릅니다." },
      { status: 401 },
    );
  }

  // ✅ 관리자 supabase 클라이언트 생성 (env 누락 방어)
  let supabase: ReturnType<typeof createSupabaseAdminClient> | null = null;

  try {
    supabase = createSupabaseAdminClient();
  } catch (e) {
    return NextResponse.json(
      {
        error: "SUPABASE_ADMIN_CLIENT_INIT_FAILED",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      {
        error: "SUPABASE_ADMIN_ENV_MISSING",
        detail:
          "Supabase admin env is missing on server. Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

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

  return NextResponse.json({ orders: data ?? [] }, { status: 200 });
}
