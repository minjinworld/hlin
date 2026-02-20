// lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required.`);
  return v;
}

/**
 * ✅ 관리자(API 서버)용: Service Role Key 사용
 * - route handler / server action 에서만 import해서 사용
 * - client component에서 절대 import 금지
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * ✅ 기존 코드 호환용 export
 * - 예전에 import { supabaseAdmin } 쓰던 파일들 그대로 살리기
 * - "import 시점 생성"이긴 하지만, 서버에서 env가 존재하는 한 안전.
 *   (Vercel에도 env 넣어놔야 함)
 */
export const supabaseAdmin = createSupabaseAdminClient();
