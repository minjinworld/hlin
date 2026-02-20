export function isAdmin(req: Request) {
  const pw = req.headers.get("x-admin-password") ?? "";
  return pw.length > 0 && pw === (process.env.ADMIN_PASSWORD ?? "");
}
