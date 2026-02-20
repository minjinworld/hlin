// app/signup/complete/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export {}; // ✅ 이거 추가! (전역 선언 인식 안정화)

type DaumPostcodeData = {
  zonecode?: string;
  address?: string;
  addressType?: "R" | "J";
  bname?: string;
  buildingName?: string;
  apartment?: "Y" | "N";
};

type DaumPostcodeOptions = {
  oncomplete: (data: DaumPostcodeData) => void;
};

type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (
  options: DaumPostcodeOptions,
) => DaumPostcodeInstance;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  postcode: string | null;
  address: string | null;
  address2: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getDaumPostcodeCtor(): DaumPostcodeConstructor | null {
  const daum = window.daum;
  if (!isRecord(daum)) return null;

  const Postcode = daum["Postcode"];
  if (typeof Postcode !== "function") return null;

  // new Postcode(...) 를 쓰기 위해 생성자 타입으로 캐스팅
  return Postcode as unknown as DaumPostcodeConstructor;
}

function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨 + ctor가 실제로 존재할 때만 resolve
    if (getDaumPostcodeCtor()) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-daum-postcode="true"]',
    );
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();

      existing.addEventListener(
        "load",
        () => {
          existing.dataset.loaded = "true";
          resolve();
        },
        { once: true },
      );

      existing.addEventListener(
        "error",
        () => reject(new Error("daum script load error")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.dataset.daumPostcode = "true";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("daum script load error"));
    document.body.appendChild(script);
  });
}

function isPhoneValidKR(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return /^01[016789]-?\d{3,4}-?\d{4}$/.test(cleaned);
}

export default function SignupCompletePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addrError, setAddrError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;

      if (!alive) return;

      if (!u) {
        router.replace(
          `/login?next=${encodeURIComponent(
            `/signup/complete?next=${encodeURIComponent(next)}`,
          )}`,
        );
        return;
      }

      setUser(u);

      const { data: p, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,postcode,address,address2")
        .eq("id", u.id)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.warn("profile load error:", error);
        setProfile(null);
      } else {
        const row = (p ?? null) as ProfileRow | null;
        setProfile(row);

        setPhone(row?.phone ?? "");
        setPostcode(row?.postcode ?? "");
        setAddress(row?.address ?? "");
        setAddress2(row?.address2 ?? "");
      }

      setLoading(false);
    };

    init();

    return () => {
      alive = false;
    };
  }, [router, supabase, next]);

  const openPostcode = async () => {
    setAddrError(null);

    try {
      await loadDaumPostcodeScript();
      const Postcode = getDaumPostcodeCtor();

      if (!Postcode) {
        setAddrError("주소 검색 로딩에 실패했어요. 새로고침 후 다시 시도해줘.");
        return;
      }

      new Postcode({
        oncomplete: (data) => {
          setPostcode(data.zonecode ?? "");
          setAddress(data.address ?? "");

          setTimeout(() => {
            const el = document.getElementById("address2");
            if (el instanceof HTMLInputElement) el.focus();
          }, 0);
        },
      }).open();
    } catch {
      setAddrError("주소 검색 스크립트 로딩에 실패했어요. 네트워크 확인해줘.");
    }
  };

  const validate = (): boolean => {
    let ok = true;

    setPhoneError(null);
    setAddrError(null);

    if (!phone.trim() || !isPhoneValidKR(phone.trim())) {
      setPhoneError("전화번호 형식이 올바르지 않아요. (예: 010-1234-5678)");
      ok = false;
    }

    if (!postcode.trim() || !address.trim()) {
      setAddrError("우편번호/주소를 검색해서 입력해줘.");
      ok = false;
    }

    return ok;
  };

  const onSave = async () => {
    if (!user) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: phone.trim(),
          postcode: postcode.trim(),
          address: address.trim(),
          address2: address2.trim() ? address2.trim() : null,
        })
        .eq("id", user.id);

      if (error) {
        console.warn("profile update error:", error);
        setAddrError("저장에 실패했어요. 잠시 후 다시 시도해줘.");
        return;
      }

      router.replace(next);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: "24px 16px",
        paddingTop: "120px",
      }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          background: "white",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
          추가 정보 입력
        </h1>

        <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 13 }}>
          주문/배송을 위해 연락처와 주소가 필요해요.
        </p>

        {loading ? (
          <div style={{ marginTop: 14, opacity: 0.7 }}>불러오는 중…</div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {profile?.email ?? user?.email ?? "—"}
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900 }}>연락처</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="연락처"
                type="tel"
                autoComplete="tel"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: phoneError
                    ? "1px solid #ef4444"
                    : "1px solid #e5e7eb",
                  outline: "none",
                  fontSize: 14,
                }}
              />
              {phoneError && (
                <div style={{ color: "#ef4444", fontSize: 12 }}>
                  {phoneError}
                </div>
              )}
            </label>

            <div style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900 }}>주소</div>
                <button
                  type="button"
                  onClick={openPostcode}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  우편번호 찾기
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <input
                  value={postcode}
                  readOnly
                  placeholder="우편번호"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: addrError
                      ? "1px solid #ef4444"
                      : "1px solid #e5e7eb",
                    outline: "none",
                    fontSize: 14,
                    background: "#fafafa",
                  }}
                />
                <input
                  value={address}
                  readOnly
                  placeholder="기본주소"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: addrError
                      ? "1px solid #ef4444"
                      : "1px solid #e5e7eb",
                    outline: "none",
                    fontSize: 14,
                    background: "#fafafa",
                  }}
                />
                <input
                  id="address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="상세주소 (동/호수 등)"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    outline: "none",
                    fontSize: 14,
                  }}
                />
                {addrError && (
                  <div style={{ color: "#ef4444", fontSize: 12 }}>
                    {addrError}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              style={{
                marginTop: 6,
                padding: "12px 14px",
                borderRadius: 12,
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "저장 중..." : "저장하고 계속"}
            </button>

            <button
              type="button"
              onClick={() => router.replace(next)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                opacity: 0.7,
                padding: 6,
              }}
            >
              나중에 할게요
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
