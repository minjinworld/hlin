// lib/adminAuth.ts
export function isAdmin(req: Request) {
  const headerPw = (req.headers.get("x-admin-password") ?? "").trim();
  const envPw = (process.env.ADMIN_PASSWORD ?? "").trim();

  // ✅ 서버에 ADMIN_PASSWORD 자체가 없으면 무조건 false (그리고 원인 명확)
  if (!envPw) return false;

  return headerPw.length > 0 && headerPw === envPw;
}
