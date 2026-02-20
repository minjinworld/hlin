import { createBrowserClient } from "@supabase/ssr"; // 또는 너가 쓰던 createClient
// import { createClient } from "@supabase/supabase-js";  (프로젝트 방식에 맞춰)

export function createSupabaseBrowserClient() {
  // 서버에서 호출되면 "에러"가 아니라 "안 만들고" 그냥 반환 방식을 바꾸자
  if (typeof window === "undefined") return null;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
