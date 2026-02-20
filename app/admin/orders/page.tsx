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

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type OrderRow = {
  id: string;

  // ✅ 고객용 주문번호 (HL...)
  order_no?: string | null;

  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string | null;

  shipping_zip: string;
  shipping_addr1: string;
  shipping_addr2?: string | null;
  shipping_memo?: string | null;

  items: OrderItem[];
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

// ✅ 상태 한글 + 컬러
function getFulfillmentMeta(status: FulfillmentStatus) {
  switch (status) {
    case "NEW":
      return { label: "신규", bg: "#f3f4f6", color: "#555", border: "#e5e7eb" };
    case "PACKING":
      return {
        label: "포장중",
        bg: "#2fb766",
        color: "#ffffff",
        border: "#2fb766",
      };
    case "SHIPPED":
      return { label: "출고완료", bg: "#111", color: "#fff", border: "#111" };
    case "REFUNDED":
      return {
        label: "환불",
        bg: "#ffe4e4",
        color: "#c53030",
        border: "#ffd4d4",
      };
  }
}

// ✅ 결제상태 라벨
function getPaymentLabel(status: PaymentStatus) {
  switch (status) {
    case "CREATED":
      return "결제 대기(주문 생성됨)";
    case "PAID":
      return "결제 완료";
    case "VIRTUAL_ACCOUNT_ISSUED":
      return "가상계좌 발급(입금 대기)";
    case "FAILED":
      return "결제 실패";
    case "CANCELLED":
      return "결제 취소";
    default:
      return status;
  }
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
      alert("관리자 비밀번호를 입력하세요.");
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

    // ✅ 결제완료만 송장 저장/출고 진행
    if (order.payment_status !== "PAID") {
      alert("결제완료(PAID) 주문만 송장 저장/출고 진행할 수 있어요.");
      return;
    }

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
    alert("송장 저장 완료 (아직 출고 처리 전)");
  }

  async function markShipped(order: OrderRow) {
    if (!pw.trim()) return alert("관리자 비밀번호를 먼저 입력하세요.");

    if (order.payment_status !== "PAID") {
      alert("결제완료(PAID) 주문만 출고 처리할 수 있어요.");
      return;
    }

    const current = edit[order.id] ?? {
      carrier: order.shipping_carrier ?? "",
      tracking: order.tracking_number ?? "",
    };
    const hasTracking = (current.tracking || "").trim().length > 0;
    if (!hasTracking) {
      alert("송장번호가 없으면 출고 처리할 수 없음. 송장 선저장.");
      return;
    }

    const ok = confirm("택배사 인계 완료로 처리할까요? (상태: 출고완료)");
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
    alert("출고 처리 완료 (출고완료)");
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

  function btnStyle({
    tone,
    disabled,
  }: {
    tone: "blue" | "blueStrong" | "red";
    disabled: boolean;
  }) {
    if (tone === "blue") {
      return {
        padding: "10px 12px",
        borderRadius: 10,
        fontWeight: 700,
        border: "1px solid #cfe6ff",
        background: disabled ? "#f2f6fa" : "#dff0ff",
        color: disabled ? "#9aa5b1" : "#2b6cb0",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "0.15s ease",
      } as const;
    }
    if (tone === "blueStrong") {
      return {
        padding: "10px 12px",
        borderRadius: 10,
        fontWeight: 800,
        border: "1px solid #cfe6ff",
        background: disabled ? "#f2f6fa" : "#cbe7ff",
        color: disabled ? "#9aa5b1" : "#1e5fa8",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "0.15s ease",
      } as const;
    }
    return {
      padding: "10px 12px",
      borderRadius: 10,
      fontWeight: 700,
      border: "1px solid #ffd4d4",
      background: disabled ? "#fff6f6" : "#ffe4e4",
      color: disabled ? "#b7a0a0" : "#c53030",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "0.15s ease",
    } as const;
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
            placeholder="검색: HL주문번호 / ord_ / 이름 / 전화"
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
            <option value="CREATED">결제 대기(주문 생성됨)</option>
            <option value="PAID">결제 완료</option>
            <option value="VIRTUAL_ACCOUNT_ISSUED">
              가상계좌 발급(입금 대기)
            </option>
            <option value="FAILED">결제 실패</option>
            <option value="CANCELLED">결제 취소</option>
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
            const meta = getFulfillmentMeta(o.fulfillment_status);

            const hasOrderNo = (o.order_no ?? "").trim().length > 0;
            const displayNo = hasOrderNo ? (o.order_no as string) : o.id;

            return (
              <li
                key={o.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 14,
                  padding: 14,
                  background: isShipped ? "#fafcff" : "white",
                  opacity: isShipped ? 0.9 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    {/* ✅ HL 링크 + 내부 주문ID(원래 ord_)도 같이 보여줌 */}
                    <div
                      style={{
                        fontWeight: 800,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 400 }}>
                        {formatKST(o.created_at)}
                      </div>

                      <Link
                        href={`/admin/orders/${o.id}`}
                        style={{ textDecoration: "underline" }}
                      >
                        {displayNo}
                      </Link>
                      <span style={{ fontSize: 12, opacity: 0.65 }}>
                        내부 주문ID: {o.id}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 400 }}>
                      {o.buyer_name}
                      <br />
                      {o.buyer_phone}{" "}
                    </div>

                    <div
                      style={{ fontSize: 13, opacity: 0.8, fontWeight: 400 }}
                    >
                      {o.shipping_zip} {o.shipping_addr1}{" "}
                      {o.shipping_addr2 ?? ""}
                      <br />
                      {o.shipping_memo ? `- 메모: ${o.shipping_memo}` : ""}
                    </div>

                    <div
                      style={{ fontSize: 13, opacity: 0.85, fontWeight: 400 }}
                    >
                      상품: {title} · 총 {qty}개
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6, minWidth: 280 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        {meta.label}
                      </span>

                      <span style={{ fontSize: 14, fontWeight: 800 }}>
                        ₩{Number(o.amount).toLocaleString()}
                      </span>
                    </div>

                    {/* ✅ 결제: CREATED -> 한국어 라벨 */}
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.75,
                        textAlign: "right",
                      }}
                    >
                      결제상태: {getPaymentLabel(o.payment_status)} /{" "}
                      {o.currency}
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
                        disabled={isShipped}
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 10,
                          background: isShipped ? "#f6f7f9" : "white",
                          color: isShipped ? "#9aa5b1" : "#111",
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
                        disabled={isShipped}
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: 10,
                          background: isShipped ? "#f6f7f9" : "white",
                          color: isShipped ? "#9aa5b1" : "#111",
                        }}
                      />

                      <div style={{ display: "grid", gap: 8 }}>
                        <button
                          disabled={isShipped}
                          onClick={() => saveTracking(o)}
                          style={btnStyle({
                            tone: "blue",
                            disabled: isShipped,
                          })}
                        >
                          송장 저장
                        </button>

                        <button
                          disabled={isShipped}
                          onClick={() => markShipped(o)}
                          style={btnStyle({
                            tone: "blueStrong",
                            disabled: isShipped,
                          })}
                        >
                          인계 완료(출고 처리)
                        </button>

                        {(o.tracking_number ||
                          o.shipping_carrier ||
                          o.fulfillment_status === "SHIPPED") && (
                          <button
                            onClick={() => cancelShipment(o)}
                            style={btnStyle({ tone: "red", disabled: false })}
                          >
                            출고 취소(송장 삭제)
                          </button>
                        )}
                      </div>

                      {isShipped && (
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.65,
                            textAlign: "right",
                          }}
                        >
                          <b>출고완료 건 수정시 출고 취소 후 진행.</b>
                        </div>
                      )}
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
