// app/mypage/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

/**
 * ✅ 전제
 * - profiles: id(uuid=auth.user.id), email, full_name, phone, postcode, address, address2, is_admin
 * - addresses: id(uuid), user_id(uuid), label, recipient_name, phone, postcode, address, address2, is_default, created_at
 */

type OrderItem = {
  qty: number;
  name: string;
  price: number;
  productId: string;
};

type Order = {
  id: string;
  order_no: string;
  created_at: string;
  amount: number;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  items: OrderItem[];
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  postcode: string | null;
  address: string | null;
  address2: string | null;
  is_admin: boolean;
};

type AddressRow = {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  postcode: string | null;
  address: string | null;
  address2: string | null;
  is_default: boolean;
  created_at: string;
};

type AddressDraft = {
  label: string;
  recipient_name: string;
  phone: string;
  postcode: string;
  address: string;
  address2: string;
  is_default: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function toBool(v: unknown): boolean {
  return v === true;
}

function formatPhoneKR(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function parseProfileRow(v: unknown): ProfileRow | null {
  if (!isRecord(v)) return null;
  const id = toStr(v.id);
  if (!id) return null;

  return {
    id,
    email: toStr(v.email),
    full_name: toStr(v.full_name),
    phone: toStr(v.phone),
    postcode: toStr(v.postcode),
    address: toStr(v.address),
    address2: toStr(v.address2),
    is_admin: toBool(v.is_admin),
  };
}

function parseAddressRow(v: unknown): AddressRow | null {
  if (!isRecord(v)) return null;
  const id = toStr(v.id);
  const user_id = toStr(v.user_id);
  const created_at = toStr(v.created_at);
  if (!id || !user_id || !created_at) return null;

  return {
    id,
    user_id,
    label: toStr(v.label),
    recipient_name: toStr(v.recipient_name),
    phone: toStr(v.phone),
    postcode: toStr(v.postcode),
    address: toStr(v.address),
    address2: toStr(v.address2),
    is_default: toBool(v.is_default),
    created_at,
  };
}

function formatAddress(a: {
  postcode: string | null;
  address: string | null;
  address2: string | null;
}) {
  const line1 = [a.postcode ?? "", a.address ?? ""].filter(Boolean).join(" ");
  const line2 = a.address2 ?? "";
  return { line1: line1 || "—", line2: line2 || "" };
}

export default function MyPage() {
  const router = useRouter();

  // ✅ 여기서 supabase를 고정(useMemo)하지 말고,
  //    필요할 때마다 만들고 null이면 early return
  const getSupabase = () => {
    const sb = createSupabaseBrowserClient();
    return sb ?? null;
  };

  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);

  const [addrMode, setAddrMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addrDraft, setAddrDraft] = useState<AddressDraft>({
    label: "기본 배송지",
    recipient_name: "",
    phone: "",
    postcode: "",
    address: "",
    address2: "",
    is_default: true,
  });

  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  /* -------------------------------
     🔥 프로필 주소 → 배송지 자동 생성(딱 1회)
  -------------------------------- */
  const migrateProfileAddressToAddresses = async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    // 1) profiles에서 주소 읽기
    const { data: p, error: pErr } = await supabase
      .from("profiles")
      .select("full_name,phone,postcode,address,address2")
      .eq("id", userId)
      .maybeSingle();

    if (pErr) {
      console.warn("migrate: profile load error:", pErr);
      return;
    }
    if (!p?.postcode || !p?.address) return;

    // 2) addresses가 이미 있으면(1개라도) 마이그레이션 안 함
    const { data: a, error: aErr } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (aErr) {
      console.warn("migrate: addresses check error:", aErr);
      return;
    }
    if ((a ?? []).length > 0) return;

    // 3) 없으면 profiles 기반으로 기본 배송지 1개 생성
    const { error: insErr } = await supabase.from("addresses").insert({
      user_id: userId,
      label: "기본 배송지",
      recipient_name: p.full_name ?? "",
      phone: p.phone ?? "",
      postcode: p.postcode,
      address: p.address,
      address2: p.address2 ?? null,
      is_default: true,
    });

    if (insErr) {
      console.warn("migrate: insert error:", insErr);
    }
  };

  /* -------------------------------
     🔄 로더들
  -------------------------------- */
  const loadProfile = async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,postcode,address,address2,is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("profile load error:", error);
        setProfile(null);
        return;
      }

      const parsed = parseProfileRow(data as unknown);
      setProfile(parsed);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders/me", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { orders: Order[] };
        setOrders(json.orders ?? []);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    setAddrLoading(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select(
          "id,user_id,label,recipient_name,phone,postcode,address,address2,is_default,created_at",
        )
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("addresses load error:", error);
        setAddresses([]);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const parsed = rows
        .map((r) => parseAddressRow(r as unknown))
        .filter((x): x is AddressRow => x !== null);

      setAddresses(parsed);
    } finally {
      setAddrLoading(false);
    }
  };

  /* -------------------------------
     🔄 초기 로딩
  -------------------------------- */
  useEffect(() => {
    let alive = true;

    const init = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;

      if (!alive) return;

      if (!u) {
        router.replace("/login");
        return;
      }

      setUser(u);

      // ✅ 핵심: 배송지 자동 생성 먼저
      await migrateProfileAddressToAddresses(u.id);

      // 이후 로딩
      void loadProfile(u.id);
      void loadOrders();
      void loadAddresses(u.id);
    };

    void init();
    return () => {
      alive = false;
    };
  }, [router]); // ✅ supabase 제거 (getSupabase는 내부 함수라 deps 불필요)

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    const ok = confirm(
      "정말 탈퇴할까요?\n탈퇴하면 계정과 회원정보가 삭제되고 복구할 수 없습니다.",
    );
    if (!ok) return;

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        alert("로그인이 필요해요.");
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        alert(json?.message ?? "탈퇴 처리 중 오류가 발생했어요.");
        return;
      }

      await supabase.auth.signOut();
      alert("회원탈퇴가 완료되었어요.");
      router.replace("/");
      router.refresh();
    } catch (e) {
      alert("탈퇴 처리 중 오류가 발생했어요.");
      console.error(e);
    }
  };

  const openCreateAddress = () => {
    setAddrError(null);
    setAddrMode("create");
    setEditingId(null);
    setAddrDraft({
      label: "기본 배송지",
      recipient_name: profile?.full_name ?? "",
      phone: profile?.phone ? formatPhoneKR(profile.phone) : "",
      postcode: "",
      address: "",
      address2: "",
      is_default: addresses.length === 0,
    });
  };

  const openEditAddress = (a: AddressRow) => {
    setAddrError(null);
    setAddrMode("edit");
    setEditingId(a.id);
    setAddrDraft({
      label: a.label ?? "",
      recipient_name: a.recipient_name ?? "",
      phone: a.phone ? formatPhoneKR(a.phone) : "",
      postcode: a.postcode ?? "",
      address: a.address ?? "",
      address2: a.address2 ?? "",
      is_default: a.is_default,
    });
  };

  const closeAddressEditor = () => {
    setAddrError(null);
    setAddrMode("idle");
    setEditingId(null);
  };

  const validateAddressDraft = (d: AddressDraft) => {
    if (!d.recipient_name.trim()) return "받는 분 이름을 입력해줘.";
    if (!d.phone.trim()) return "연락처를 입력해줘.";
    if (!d.postcode.trim() || !d.address.trim())
      return "우편번호/주소를 입력해줘.";
    return null;
  };

  const reloadAddresses = async () => {
    if (!user) return;
    await loadAddresses(user.id);
  };

  const saveAddress = async () => {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    setAddrError(null);

    const errMsg = validateAddressDraft(addrDraft);
    if (errMsg) {
      setAddrError(errMsg);
      return;
    }

    setSavingAddr(true);
    try {
      // 기본 배송지면 기존 기본 내려주기
      if (addrDraft.is_default) {
        const { error: unsetErr } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (unsetErr) console.warn("unset default error:", unsetErr);
      }

      if (addrMode === "create") {
        const { error } = await supabase.from("addresses").insert({
          user_id: user.id,
          label: addrDraft.label.trim() ? addrDraft.label.trim() : null,
          recipient_name: addrDraft.recipient_name.trim(),
          phone: addrDraft.phone.trim(),
          postcode: addrDraft.postcode.trim(),
          address: addrDraft.address.trim(),
          address2: addrDraft.address2.trim()
            ? addrDraft.address2.trim()
            : null,
          is_default: addrDraft.is_default,
        });

        if (error) {
          console.warn("address insert error:", error);
          setAddrError("저장에 실패했어요. (addresses RLS/컬럼 확인)");
          return;
        }
      } else if (addrMode === "edit" && editingId) {
        const { error } = await supabase
          .from("addresses")
          .update({
            label: addrDraft.label.trim() ? addrDraft.label.trim() : null,
            recipient_name: addrDraft.recipient_name.trim(),
            phone: addrDraft.phone.trim(),
            postcode: addrDraft.postcode.trim(),
            address: addrDraft.address.trim(),
            address2: addrDraft.address2.trim()
              ? addrDraft.address2.trim()
              : null,
            is_default: addrDraft.is_default,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) {
          console.warn("address update error:", error);
          setAddrError("수정에 실패했어요. (addresses RLS/정책 확인)");
          return;
        }
      }

      closeAddressEditor();
      await reloadAddresses();
    } finally {
      setSavingAddr(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const ok = confirm("이 배송지를 삭제할까요?");
    if (!ok) return;

    const target = addresses.find((a) => a.id === id);
    const wasDefault = target?.is_default === true;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.warn("address delete error:", error);
      alert("삭제에 실패했어요. (RLS 정책 확인)");
      return;
    }

    const nextList = addresses.filter((a) => a.id !== id);

    // 기본 배송지 삭제했으면 첫 번째 승격
    if (wasDefault && nextList.length > 0) {
      const candidate = nextList[0];
      await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", candidate.id)
        .eq("user_id", user.id);
    }

    await reloadAddresses();
  };

  const primaryAddress =
    addresses.find((a) => a.is_default) ?? addresses[0] ?? null;

  return (
    <main
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "24px 16px",
        paddingTop: "120px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>My Page</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 14 }}>
            {user?.email ?? "—"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button type="button" onClick={handleLogout} style={btnGhost}>
            로그아웃
          </button>
          <button type="button" onClick={handleDeleteAccount} style={btnDanger}>
            회원탈퇴
          </button>

          {/* ✅ 관리자만 보이는 버튼 */}
          {profile?.is_admin ? (
            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              style={btnGhost}
            >
              관리자 주문관리 →
            </button>
          ) : null}
        </div>
      </header>

      {/* Summary */}
      <section style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <article style={{ ...cardStyle, padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontSize: 12, letterSpacing: 1, opacity: 0.55 }}>
                회원정보
              </div>
              <div
                style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.2 }}
              >
                {profileLoading
                  ? "불러오는 중…"
                  : (profile?.full_name ?? "Guest")}
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {profile?.phone
                  ? formatPhoneKR(profile.phone)
                  : "연락처 미등록"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Pill label={primaryAddress ? "배송지 설정" : "배송지 없음"} />
              <Pill label={`주문 ${orders.length}건`} />
            </div>
          </div>

          {primaryAddress && (
            <div style={{ marginTop: 12, ...softBox }}>
              <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 900 }}>
                기본 배송지
              </div>
              <div style={{ marginTop: 6, display: "grid", gap: 2 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>
                  {primaryAddress.recipient_name ?? "—"}{" "}
                  <span style={{ opacity: 0.6, fontWeight: 800 }}>
                    {primaryAddress.phone
                      ? `· ${formatPhoneKR(primaryAddress.phone)}`
                      : ""}
                  </span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {formatAddress(primaryAddress).line1}
                </div>
                {formatAddress(primaryAddress).line2 && (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {formatAddress(primaryAddress).line2}
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </section>

      {/* Profile + Address */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* 내 정보 */}
        <article style={cardStyle}>
          <div style={sectionHead}>
            <h2 style={sectionTitle}>내 정보</h2>
          </div>

          {profileLoading ? (
            <div style={{ opacity: 0.7 }}>불러오는 중…</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <Row label="이름" value={profile?.full_name ?? "—"} />
              <Row
                label="이메일"
                value={user?.email ?? profile?.email ?? "—"}
              />
              <Row
                label="연락처"
                value={profile?.phone ? formatPhoneKR(profile.phone) : "—"}
              />
              <Row
                label="주소"
                value={
                  profile?.address
                    ? `${formatAddress(profile).line1}${
                        formatAddress(profile).line2
                          ? ` · ${formatAddress(profile).line2}`
                          : ""
                      }`
                    : "—"
                }
                subtle
              />
            </div>
          )}
        </article>

        {/* 배송지 관리 */}
        <article style={cardStyle}>
          <div style={sectionHead}>
            <h2 style={sectionTitle}>배송지 관리</h2>

            <button
              type="button"
              onClick={openCreateAddress}
              style={btnPrimarySmall}
            >
              + 새 배송지
            </button>
          </div>

          {addrLoading ? (
            <div style={{ opacity: 0.7 }}>불러오는 중…</div>
          ) : (
            <>
              {addresses.length === 0 ? (
                <div style={{ ...softBox, opacity: 0.85 }}>
                  아직 등록된 배송지가 없어요. <b>새 배송지</b>를 추가해줘.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {addresses.map((a) => {
                    const addr = formatAddress(a);
                    return (
                      <div key={a.id} style={addrCard}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <div style={{ display: "grid", gap: 2 }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>
                                {a.label ?? "배송지"}
                              </div>
                              {a.is_default && <span style={badge}>기본</span>}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                opacity: 0.9,
                                fontWeight: 800,
                              }}
                            >
                              {a.recipient_name ?? "—"}
                              {a.phone ? (
                                <span style={{ opacity: 0.6, fontWeight: 800 }}>
                                  {" "}
                                  · {formatPhoneKR(a.phone)}
                                </span>
                              ) : null}
                            </div>
                            <div style={{ fontSize: 13, opacity: 0.75 }}>
                              {addr.line1}
                            </div>
                            {addr.line2 ? (
                              <div style={{ fontSize: 13, opacity: 0.75 }}>
                                {addr.line2}
                              </div>
                            ) : null}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              alignItems: "flex-end",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => openEditAddress(a)}
                              style={btnGhostSmall}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAddress(a.id)}
                              style={btnDangerSmall}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Editor */}
              {addrMode !== "idle" && (
                <div style={{ marginTop: 12, ...softBox }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      {addrMode === "create" ? "새 배송지 추가" : "배송지 수정"}
                    </div>
                    <button
                      type="button"
                      onClick={closeAddressEditor}
                      style={btnGhostSmall}
                    >
                      닫기
                    </button>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    <Field
                      label="배송지 이름"
                      value={addrDraft.label}
                      placeholder="예: 집 / 회사"
                      onChange={(v) =>
                        setAddrDraft((p) => ({ ...p, label: v }))
                      }
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <Field
                        label="받는 분"
                        value={addrDraft.recipient_name}
                        placeholder="이름"
                        onChange={(v) =>
                          setAddrDraft((p) => ({ ...p, recipient_name: v }))
                        }
                      />
                      <Field
                        label="연락처"
                        value={addrDraft.phone}
                        placeholder="010-0000-0000"
                        inputMode="numeric"
                        format={formatPhoneKR}
                        maxLength={13}
                        onChange={(v) =>
                          setAddrDraft((p) => ({ ...p, phone: v }))
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "160px 1fr",
                        gap: 10,
                      }}
                    >
                      <Field
                        label="우편번호"
                        value={addrDraft.postcode}
                        placeholder="우편번호"
                        onChange={(v) =>
                          setAddrDraft((p) => ({ ...p, postcode: v }))
                        }
                      />
                      <Field
                        label="기본주소"
                        value={addrDraft.address}
                        placeholder="주소"
                        onChange={(v) =>
                          setAddrDraft((p) => ({ ...p, address: v }))
                        }
                      />
                    </div>

                    <Field
                      label="상세주소"
                      value={addrDraft.address2}
                      placeholder="동/호수 등"
                      onChange={(v) =>
                        setAddrDraft((p) => ({ ...p, address2: v }))
                      }
                    />

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={addrDraft.is_default}
                        onChange={(e) =>
                          setAddrDraft((p) => ({
                            ...p,
                            is_default: e.target.checked,
                          }))
                        }
                      />
                      기본 배송지로 설정
                    </label>

                    {addrError && (
                      <div
                        style={{
                          color: "rgb(185, 28, 28)",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {addrError}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={closeAddressEditor}
                        style={btnGhost}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={saveAddress}
                        style={btnPrimary}
                        disabled={savingAddr}
                      >
                        {savingAddr ? "저장 중…" : "저장"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </article>
      </section>

      {/* Orders */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>주문 내역</h2>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            {ordersLoading ? "loading…" : `${orders.length} orders`}
          </span>
        </div>

        {ordersLoading ? (
          <div style={cardStyle}>불러오는 중…</div>
        ) : orders.length === 0 ? (
          <div style={cardStyle}>주문 내역이 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((o) => (
              <article key={o.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{o.order_no}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {new Date(o.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Pill label={`결제: ${o.payment_status}`} />
                  <Pill label={`배송: ${o.fulfillment_status}`} />
                  <Pill
                    label={`총액: ${o.amount.toLocaleString("ko-KR")} ${o.currency}`}
                  />
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {o.items?.map((it, idx) => (
                    <div
                      key={`${o.id}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 14,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {it.name}{" "}
                        <span style={{ opacity: 0.7 }}>× {it.qty}</span>
                      </div>
                      <div style={{ opacity: 0.8 }}>
                        {(it.price * it.qty).toLocaleString("ko-KR")}원
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* UI bits */

function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        fontSize: 12,
        fontWeight: 800,
        background: "white",
      }}
    >
      {label}
    </span>
  );
}

function Row({
  label,
  value,
  subtle,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #f1f1f1",
        background: subtle ? "#fcfcfc" : "white",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 900 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.85 }}>
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  inputMode,
  type,
  format,
  maxLength,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  format?: (v: string) => string;
  maxLength?: number;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(format ? format(raw) : raw);
        }}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          outline: "none",
          fontSize: 14,
          background: "white",
        }}
      />
    </label>
  );
}

/* styles */

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  background: "white",
};

const sectionHead: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 12,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
};

const softBox: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #f1f1f1",
  background: "#fcfcfc",
  padding: 12,
};

const addrCard: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #f1f1f1",
  background: "white",
  padding: 12,
};

const badge: React.CSSProperties = {
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(17,17,17,0.12)",
  background: "white",
  fontWeight: 900,
  opacity: 0.85,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const btnPrimarySmall: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 12,
};

const btnGhost: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhostSmall: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 12,
};

const btnDanger: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(185, 28, 28, 0.25)",
  background: "white",
  fontWeight: 700,
  cursor: "pointer",
  color: "rgb(185, 28, 28)",
};

const btnDangerSmall: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 10,
  border: "1px solid rgba(185, 28, 28, 0.25)",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
  color: "rgb(185, 28, 28)",
  fontSize: 12,
};
