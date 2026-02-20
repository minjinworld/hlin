// app/admin/layout.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      // ✅ 핵심: supabase가 없으면(=서버/예외상황 방어) 그냥 종료
      if (!supabase) {
        if (alive) setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !profile?.is_admin) {
          router.replace("/");
          return;
        }

        if (!alive) return;
        setAllowed(true);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [router, supabase]);

  if (loading) return <div style={{ padding: 24 }}>관리자 확인 중…</div>;
  if (!allowed) return null;

  return <>{children}</>;
}
