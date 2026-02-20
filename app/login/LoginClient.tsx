"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

/** ✅ Daum Postcode 최소 타입 정의 (any 제거) */
type DaumPostcodeResult = {
  zonecode?: string; // 우편번호
  address?: string; // 기본주소
};

type DaumPostcodeOptions = {
  oncomplete: (data: DaumPostcodeResult) => void;
};

type DaumPostcodeConstructor = new (options: DaumPostcodeOptions) => {
  open: () => void;
};

type Props = {
  next: string;
};

export default function LoginClient({ next }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : undefined;

  // ✅ auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ password confirm
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // ✅ profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ address (postcode + address + detail)
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState(""); // 기본주소
  const [address2, setAddress2] = useState(""); // 상세주소

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // ✅ Daum script ready (로드 전 버튼 막기)
  const [postcodeReady, setPostcodeReady] = useState(false);

  const pwMismatch =
    mode === "signup" &&
    passwordConfirm.length > 0 &&
    password !== passwordConfirm;

  const openPostcode = () => {
    const Postcode = window.daum?.Postcode as
      | DaumPostcodeConstructor
      | undefined;

    if (!Postcode) {
      console.warn("Daum postcode script not loaded yet.");
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
  };

  const signInOAuth = async (provider: "google" | "kakao") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        ...(provider === "kakao"
          ? { scopes: "account_email talk_message" }
          : {}),
      },
    });

    if (error) alert(error.message);
  };

  const signInPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Email not confirmed") {
          alert("이메일 인증이 완료되지 않았습니다. 메일함에서 인증 해주세요.");
          return;
        }
        alert(error.message);
        return;
      }

      router.replace(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const signUpPassword = async () => {
    setLoading(true);

    try {
      if (!fullName || !phone || !address || !postcode) {
        alert("이름/연락처/주소(우편번호 포함) 입력");
        return;
      }

      // 비밀번호 확인 미스매치 방어
      if (!passwordConfirm || password !== passwordConfirm) {
        return;
      }

      // 1) 회원가입
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        alert(signUpError.message);
        return;
      }

      // 2) 세션 안정화
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          alert(`로그인 처리 실패: ${signInErr.message}`);
          return;
        }
      }

      // 3) 유저 정보 확실히 가져오기
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        alert(`유저 정보를 가져오지 못했어요: ${userErr?.message ?? ""}`);
        return;
      }

      const userId = userData.user.id;

      // 4) profiles upsert
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        postcode: postcode || null,
        address,
        address2: address2 || null,
      });

      if (profileError) {
        console.error("profiles upsert error:", profileError);
        alert(`프로필 저장 실패: ${profileError.message}`);
        return;
      }

      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === "signin") return signInPassword();
    return signUpPassword();
  };

  return (
    <>
      {/* ✅ 다음 우편번호 스크립트 로드 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onLoad={() => setPostcodeReady(true)}
      />

      <div style={wrap}>
        <div style={card}>
          <h2 style={title}>{mode === "signin" ? "Sign in" : "Sign up"}</h2>

          <form onSubmit={onSubmit} style={form}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (이메일)"
              type="email"
              autoComplete="email"
              style={input}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (비밀번호)"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              style={input}
            />

            {mode === "signup" && (
              <>
                <div style={{ display: "grid", gap: 8 }}>
                  <input
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirm Password (비밀번호 확인)"
                    type="password"
                    autoComplete="new-password"
                    style={{
                      ...input,
                      border: pwMismatch
                        ? "1px solid rgba(220, 38, 38, 0.5)"
                        : input.border,
                    }}
                  />
                  {pwMismatch && <p style={errorText}>비밀번호가 다릅니다.</p>}
                </div>

                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Name (이름)"
                  type="text"
                  autoComplete="name"
                  style={input}
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (연락처)"
                  type="tel"
                  autoComplete="tel"
                  style={input}
                />

                <div style={addrBox}>
                  <div style={addrRow}>
                    <input
                      value={postcode}
                      readOnly
                      placeholder="Postcode (우편번호)"
                      style={{ ...input, margin: 0 }}
                    />
                    <button
                      type="button"
                      onClick={openPostcode}
                      style={addrBtn}
                      disabled={loading || !postcodeReady}
                      title={
                        postcodeReady
                          ? "주소찾기"
                          : "주소찾기 스크립트 로딩 중…"
                      }
                    >
                      주소찾기
                    </button>
                  </div>

                  <input
                    value={address}
                    readOnly
                    placeholder="Address (기본주소)"
                    style={input}
                  />

                  <input
                    id="address2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Detail (상세주소)"
                    type="text"
                    autoComplete="address-line2"
                    style={input}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              style={{
                ...primaryBtn,
                opacity:
                  loading ||
                  (mode === "signup" && (pwMismatch || !passwordConfirm))
                    ? 0.6
                    : 1,
              }}
              disabled={
                loading ||
                (mode === "signup" && (pwMismatch || !passwordConfirm))
              }
            >
              {loading
                ? "처리 중..."
                : mode === "signin"
                  ? "이메일로 로그인"
                  : "이메일로 회원가입"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signin" ? "signup" : "signin"));
                setPasswordConfirm("");
              }}
              style={textBtn}
              disabled={loading}
            >
              {mode === "signin" ? "회원가입" : "로그인"}
            </button>
          </form>

          <div style={divider}>
            <span style={dividerLine} />
            <span style={dividerText}>간편 로그인</span>
            <span style={dividerLine} />
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <button
              onClick={() => signInOAuth("google")}
              style={googleBtn}
              disabled={loading}
            >
              <GoogleIcon />
              <span>Google로 계속하기</span>
            </button>

            <button
              onClick={() => signInOAuth("kakao")}
              style={kakaoBtn}
              disabled={loading}
            >
              <KakaoIcon />
              <span>Kakao로 계속하기</span>
            </button>
          </div>

          {mode === "signup" ? (
            <p style={hint}>
              가입 후 가입한 메일함에서 인증 링크를 눌러주세요.
            </p>
          ) : (
            <p style={hint}>
              메일 인증이 켜져 있으면, 가입 후 인증을 완료해야 로그인돼.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* styles */
const wrap: React.CSSProperties = {
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  background: "#fafafa",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  padding: "40px 32px",
  borderRadius: 24,
  border: "1px solid #f1f1f1",
  boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
  background: "white",
};

const title: React.CSSProperties = {
  textAlign: "center",
  fontSize: 20,
  fontWeight: 500,
  marginBottom: 28,
  letterSpacing: -0.3,
};

const form: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginBottom: 18,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #eaeaea",
  outline: "none",
  fontSize: 14,
};

const primaryBtn: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 16,
  border: "none",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  background: "#111",
  color: "#fff",
};

const textBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  opacity: 0.7,
  padding: 6,
};

const divider: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 28,
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: "#eee",
};

const dividerText: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.5,
  letterSpacing: 1,
};

const baseBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: "14px 18px",
  borderRadius: 16,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const googleBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#ffffff",
  border: "1px solid #dadce0",
  color: "#3c4043",
};

const kakaoBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#FEE500",
  border: "none",
  color: "#181818",
};

const hint: React.CSSProperties = {
  marginTop: 18,
  fontSize: 12,
  opacity: 0.6,
  textAlign: "center",
  lineHeight: 1.5,
};

const errorText: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.4,
  color: "rgb(220, 38, 38)",
};

const addrBox: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 12,
  borderRadius: 16,
  border: "1px solid #f1f1f1",
  background: "#fff",
};

const addrRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
  alignItems: "center",
};

const addrBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #eaeaea",
  background: "#fff",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/* icons */
function GoogleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 16, height: 16, flexShrink: 0 }}
    >
      <path
        d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109"
        fill="#4285F4"
      />
      <path
        d="M16.2863 30C20.1434 30 23.3814 28.7555 25.7466 26.6089L21.2386 23.1865C20.0323 24.011 18.4132 24.5866 16.2863 24.5866C12.5086 24.5866 9.30225 22.1444 8.15929 18.7688L7.99176 18.7827L3.58208 22.1272L3.52441 22.2843C5.87359 26.8577 10.699 30 16.2863 30Z"
        fill="#34A853"
      />
      <path
        d="M8.15964 18.7688C7.85806 17.8977 7.68352 16.9643 7.68352 15.9999C7.68352 15.0354 7.85806 14.1021 8.14377 13.231L8.13578 13.0455L3.67083 9.64734L3.52475 9.71544C2.55654 11.6132 2.00098 13.7444 2.00098 15.9999C2.00098 18.2555 2.55654 20.3865 3.52475 22.2843L8.15964 18.7688"
        fill="#FBBC05"
      />
      <path
        d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133"
        fill="#EB4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }}>
      <path
        fill="#000"
        d="M12 3C6.48 3 2 6.58 2 10.9c0 2.77 1.74 5.2 4.37 6.62L5.5 21l3.96-2.17c.82.12 1.66.17 2.54.17 5.52 0 10-3.58 10-7.9S17.52 3 12 3z"
      />
    </svg>
  );
}
