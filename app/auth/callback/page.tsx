// app/auth/callback/page.tsx
import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>로그인 처리 중…</div>}>
      <CallbackClient />
    </Suspense>
  );
}
