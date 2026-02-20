"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type FulfillmentStatus = "NEW" | "PACKING" | "SHIPPED" | "REFUNDED";
type PaymentStatus =
  | "CREATED"
  | "PAID"
  | "VIRTUAL_ACCOUNT_ISSUED"
  | "CANCELLED"
  | "FAILED";

type OrderRow = {
  id: string;
  order_no: string | null; // ✅ HL... 주문번호(추가)

  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string | null;

  shipping_zip: string;
  shipping_addr1: string;
  shipping_addr2?: string | null;
  shipping_memo?: string | null;

  items: Array<{ productId: string; name: string; price: number; qty: number }>;
  amount: number;
  currency: string;

  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;

  shipping_carrier?: string | null;
  tracking_number?: string | null;

  created_at: string;
  updated_at: string;
};

type OrdersResponse =
  | { orders: OrderRow[] }
  | { error: string; detail?: string };

function formatKST(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sumItems(items: OrderRow["items"]) {
  const qty = items?.reduce((s, it) => s + Number(it.qty || 0), 0) ?? 0;
  const names = (items ?? []).map((it) => it.name).filter(Boolean);
  const title =
    names.length === 0
      ? "-"
      : names.length === 1
        ? names[0]
        : `${names[0]} 외 ${names.length - 1}개`;
  return { qty, title };
}

export default function AdminOrdersPage() {
  const [pw, setPw] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  // UX controls
  const [q, setQ] = useState("");
  const [onlyUnshipped, setOnlyUnshipped] = useState(true);
  const [payFilter, setPayFilter] = useState<PaymentStatus | "ALL">("ALL");

  // 인라인 입력 state
  const [edit, setEdit] = useState<
    Record<string, { carrier: string; tracking: string }>
  >({});

  async function load() {
    if (!pw.trim()) {
      alert("관리자 비밀번호를 입력해줘");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });

      const data = (await res.json()) as OrdersResponse;

      if (!res.ok) {
        const msg =
          "error" in data
            ? `${data.error}\n${data.detail ?? ""}`
            : "불러오기 실패";
        throw new Error(msg);
      }

      if ("orders" in data) setOrders(data.orders ?? []);
      else setOrders([]);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (onlyUnshipped && o.fulfillment_status === "SHIPPED") return false;
      if (payFilter !== "ALL" && o.payment_status !== payFilter) return false;

      if (!keyword) return true;

      // ✅ 검색도 order_no 포함 (HL...로 검색되게)
      const phoneA = o.buyer_phone.replaceAll("-", "");
      const phoneB = keyword.replaceAll("-", "");

      return (
        o.id.toLowerCase().includes(keyword) ||
        (o.order_no ?? "").toLowerCase().includes(keyword) ||
        o.buyer_name.toLowerCase().includes(keyword) ||
        phoneA.includes(phoneB)
      );
    });
  }, [orders, q, onlyUnshipped, payFilter]);

  async function saveTracking(order: OrderRow) {
    if (!pw.trim()) return alert("관리자 비밀번호를 먼저 입력하세요.");

    const current = edit[order.id] ?? {
      carrier: order.shipping_carrier ?? "",
      tracking: order.tracking_number ?? "",
    };

    const carrier = current.carrier.trim();
    const tracking = current.tracking.trim();
    if (!tracking) return alert("송장번호를 입력하세요.");

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-password": pw,
      },
      body: JSON.stringify({
        shippingCarrier: carrier || null,
        trackingNumber: tracking,
        fulfillmentStatus: "PACKING" satisfies FulfillmentStatus,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      detail?: string;
    };

    if (!res.ok) {
      alert(`${data.error ?? "업데이트 실패"}\n${data.detail ?? ""}`);
      return;
    }

    await load();
    alert("송장 저장 완료(출고 처리 전)");
  }

  async function markShipped(order: OrderRow) {
    if (!pw.trim()) return alert("관리자 비밀번호를 먼저 입력하세요.");

    const current = edit[order.id] ?? {
      carrier: order.shipping_carrier ?? "",
      tracking: order.tracking_number ?? "",
    };
    const hasTracking = (current.tracking || "").trim().length > 0;

    if (!hasTracking) {
      alert("송장번호가 없으면 출고 처리할 수 없습니다. 송장을 저장하세요.");
      return;
    }

    const ok = confirm("택배사 인계 완료로 처리할까요? (상태: SHIPPED)");
    if (!ok) return;

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-password": pw,
      },
      body: JSON.stringify({
        fulfillmentStatus: "SHIPPED" satisfies FulfillmentStatus,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      detail?: string;
    };

    if (!res.ok) {
      alert(`${data.error ?? "출고 처리 실패"}\n${data.detail ?? ""}`);
      return;
    }

    await load();
    alert("출고 처리 완료 (SHIPPED)");
  }

  async function cancelShipment(order: OrderRow) {
    if (!pw.trim()) return alert("관리자 비밀번호를 먼저 입력하세요.");

    const ok = confirm("출고처리를 취소하고 송장 정보를 삭제할까요?");
    if (!ok) return;

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-admin-password": pw,
      },
      body: JSON.stringify({
        shippingCarrier: null,
        trackingNumber: null,
        fulfillmentStatus: "PACKING" satisfies FulfillmentStatus,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      detail?: string;
    };

    if (!res.ok) {
      alert(`${data.error ?? "취소 실패"}\n${data.detail ?? ""}`);
      return;
    }

    setEdit((prev) => {
      const next = { ...prev };
      delete next[order.id];
      return next;
    });

    await load();
    alert("출고 취소 완료(송장 삭제됨)");
  }

  return (
    <main style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>관리자 · 주문 관리</h1>
        <div style={{ fontSize: 13, opacity: 0.7 }}>미출고 기본 필터 ON</div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              minWidth: 220,
            }}
          />
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              cursor: "pointer",
              background: "white",
            }}
          >
            {loading ? "불러오는 중..." : "불러오기"}
          </button>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색: HL주문번호 / 주문ID / 이름 / 전화"
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              flex: 1,
              minWidth: 240,
            }}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={onlyUnshipped}
              onChange={(e) => setOnlyUnshipped(e.target.checked)}
            />
            미출고만
          </label>

          <select
            value={payFilter}
            onChange={(e) =>
              setPayFilter(e.target.value as PaymentStatus | "ALL")
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
            }}
          >
            <option value="ALL">결제상태: 전체</option>
            <option value="CREATED">CREATED</option>
            <option value="PAID">PAID</option>
            <option value="VIRTUAL_ACCOUNT_ISSUED">
              VIRTUAL_ACCOUNT_ISSUED
            </option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div style={{ fontSize: 13, opacity: 0.7 }}>
          표시: <b>{filtered.length}</b>건 / 전체 <b>{orders.length}</b>건
        </div>

        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {filtered.map((o) => {
            const { qty, title } = sumItems(o.items);
            const form = edit[o.id] ?? {
              carrier: o.shipping_carrier ?? "",
              tracking: o.tracking_number ?? "",
            };
            const isShipped = o.fulfillment_status === "SHIPPED";

            return (
              <li
                key={o.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 14,
                  padding: 14,
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    {/* ✅ 링크 텍스트는 HL 주문번호로 */}
                    <div style={{ fontWeight: 700 }}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        style={{ textDecoration: "underline" }}
                      >
                        {o.order_no ?? o.id}
                      </Link>
                    </div>

                    {/* ✅ 내부 id도 작은 글씨로 보이게(선택) */}
                    <div style={{ fontSize: 12, opacity: 0.5 }}>
                      internal id: {o.id}
                    </div>

                    <div style={{ fontSize: 14 }}>
                      <b>{o.buyer_name}</b> · {o.buyer_phone} ·{" "}
                      {formatKST(o.created_at)}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                      {o.shipping_zip} {o.shipping_addr1}{" "}
                      {o.shipping_addr2 ?? ""}
                      {o.shipping_memo ? ` / 메모: ${o.shipping_memo}` : ""}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>
                      상품: {title} · 총 {qty}개
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6, minWidth: 230 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid #ddd",
                          background: isShipped ? "#111" : "#fff",
                          color: isShipped ? "#fff" : "#111",
                          fontSize: 12,
                        }}
                      >
                        {o.fulfillment_status}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        ₩{Number(o.amount).toLocaleString()}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.75,
                        textAlign: "right",
                      }}
                    >
                      결제: {o.payment_status} / {o.currency}
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                      <input
                        value={form.carrier}
                        onChange={(e) =>
                          setEdit((prev) => ({
                            ...prev,
                            [o.id]: { ...form, carrier: e.target.value },
                          }))
                        }
                        placeholder="택배사 (예: CJ대한통운)"
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 10,
                        }}
                      />
                      <input
                        value={form.tracking}
                        onChange={(e) =>
                          setEdit((prev) => ({
                            ...prev,
                            [o.id]: { ...form, tracking: e.target.value },
                          }))
                        }
                        placeholder="송장번호"
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 10,
                        }}
                      />

                      <div style={{ display: "grid", gap: 8 }}>
                        {/* 송장 저장 */}
                        <button
                          onClick={() => saveTracking(o)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 700,
                            border: "1px solid #cfe6ff",
                            background: isShipped ? "#eaf4ff" : "#dff0ff",
                            color: isShipped ? "#7aa7d9" : "#2b6cb0",
                            transition: "0.15s ease",
                          }}
                        >
                          송장 저장
                        </button>

                        {/* 인계 완료 */}
                        <button
                          onClick={() => markShipped(o)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 800,
                            border: "1px solid #cfe6ff",
                            background: isShipped ? "#eaf4ff" : "#cbe7ff",
                            color: isShipped ? "#7aa7d9" : "#1e5fa8",
                            transition: "0.15s ease",
                          }}
                        >
                          인계 완료(출고 처리)
                        </button>

                        {/* 출고 취소 */}
                        {(o.tracking_number ||
                          o.shipping_carrier ||
                          o.fulfillment_status === "SHIPPED") && (
                          <button
                            onClick={() => cancelShipment(o)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              cursor: "pointer",
                              fontWeight: 600,
                              border: "1px solid #ffd4d4",
                              background: isShipped ? "#fff1f1" : "#ffe4e4",
                              color: isShipped ? "#c27a7a" : "#c53030",
                              transition: "0.15s ease",
                            }}
                          >
                            출고 취소(송장 삭제)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
