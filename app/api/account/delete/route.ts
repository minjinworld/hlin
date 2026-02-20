import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json(
      { message: "서버 환경변수가 설정되지 않았어요." },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!token) {
    return NextResponse.json(
      { message: "인증 토큰이 없어요." },
      { status: 401 },
    );
  }

  // 1) 토큰으로 “누가 요청했는지” 확인 (anon으로 검증)
  const publicClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } =
    await publicClient.auth.getUser(token);

  const user = userData?.user;

  if (userError || !user) {
    return NextResponse.json(
      { message: "인증에 실패했어요." },
      { status: 401 },
    );
  }

  // 2) Service Role로 실제 삭제 (RLS 무시됨)
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // (선택) profiles 먼저 삭제
  const { error: profileDelError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileDelError) {
    return NextResponse.json(
      { message: "회원정보 삭제에 실패했어요." },
      { status: 500 },
    );
  }

  // auth user 삭제
  const { error: delError } = await admin.auth.admin.deleteUser(user.id);

  if (delError) {
    return NextResponse.json(
      { message: "계정 삭제에 실패했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
