// app/auth/callback/CallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type PendingProfile = {
  full_name?: string;
  phone?: string;
  postcode?: string;
  address?: string;
  address2?: string;
};

type ProviderUserMetadata = {
  full_name?: string;
  name?: string;
  nickname?: string;
  preferred_username?: string;
};

type AppMetadata = {
  provider?: string; // "kakao" | "google" | ...
  providers?: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickProviderName(metaUnknown: unknown): string | null {
  if (!isRecord(metaUnknown)) return null;

  const meta = metaUnknown as ProviderUserMetadata;
  return (
    meta.full_name ??
    meta.name ??
    meta.nickname ??
    meta.preferred_username ??
    null
  );
}

function safeParsePending(raw: string | null): PendingProfile | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const p = parsed as Record<string, unknown>;
    const toStr = (x: unknown) => (typeof x === "string" ? x : undefined);

    return {
      full_name: toStr(p.full_name),
      phone: toStr(p.phone),
      postcode: toStr(p.postcode),
      address: toStr(p.address),
      address2: toStr(p.address2),
    };
  } catch {
    return null;
  }
}

// ✅ Kakao 웰컴 메시지 API 응답 타입
type KakaoWelcomeOk = { ok: true };
type KakaoWelcomeErr = {
  error: string;
  status?: number;
  kakao?: { code: number; msg: string };
};

function isKakaoProvider(appMetaUnknown: unknown): boolean {
  if (!isRecord(appMetaUnknown)) return false;
  const m = appMetaUnknown as AppMetadata;
  return (
    m.provider === "kakao" ||
    (Array.isArray(m.providers) && m.providers.includes("kakao"))
  );
}

export default function CallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) return;

    const run = async () => {
      const error = sp.get("error_description") || sp.get("error");
      if (error) {
        alert(decodeURIComponent(error));
        router.replace("/login");
        return;
      }

      const next = sp.get("next") ?? "/";

      const getSession = async () => {
        const { data, error: sErr } = await supabase.auth.getSession();
        if (sErr) console.warn("getSession error:", sErr);
        return data.session ?? null;
      };

      let session = await getSession();
      if (!session?.user) {
        await new Promise((r) => setTimeout(r, 400));
        session = await getSession();
      }

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const u = session.user;

      // pending_profile
      const raw = localStorage.getItem("pending_profile");
      const pending = safeParsePending(raw);

      // OAuth 기본 이름
      const providerName = pickProviderName(u.user_metadata);

      // ✅ profiles upsert
      const upsertPayload = {
        id: u.id,
        email: u.email ?? null,
        full_name: pending?.full_name ?? providerName,
        phone: pending?.phone ?? null,
        postcode: pending?.postcode ?? null,
        address: pending?.address ?? null,
        address2: pending?.address2 ?? null,
      };

      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(upsertPayload);

      if (upsertErr) console.warn("profiles upsert error:", upsertErr);

      if (raw) localStorage.removeItem("pending_profile");

      // ✅ (추가) 카카오 로그인 유저면 “나에게 카톡 보내기” 1회 실행
      const isKakao = isKakaoProvider(u.app_metadata);

      if (isKakao) {
        const sentKey = `kakao_welcome_sent:${u.id}`;
        const alreadySent = localStorage.getItem(sentKey);

        if (!alreadySent) {
          try {
            const res = await fetch("/api/kakao/send-welcome", {
              method: "POST",
            });

            const json = (await res.json().catch(() => null)) as
              | KakaoWelcomeOk
              | KakaoWelcomeErr
              | null;

            if (!res.ok) {
              console.warn("kakao welcome failed:", json);
            } else {
              localStorage.setItem(sentKey, "1");
            }
          } catch (e) {
            console.warn("kakao welcome fetch error:", e);
          }
        }
      }

      // ✅ profile 조회 후 추가 입력 필요하면 이동
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("phone,address,postcode,address2")
        .eq("id", u.id)
        .maybeSingle();

      if (pErr) console.warn("profiles select error:", pErr);

      const needsMore =
        !profile?.phone || !profile?.address || !profile?.postcode;

      if (needsMore) {
        router.replace(`/signup/complete?next=${encodeURIComponent(next)}`);
        return;
      }

      router.replace(next);
      router.refresh();
    };

    run();
  }, [router, sp]);

  return <div style={{ padding: 24 }}>로그인 처리 중…</div>;
}
