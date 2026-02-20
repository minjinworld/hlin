"use client";

import { useState } from "react";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type LookupOrder = {
  id: string;
  order_no?: string | null;
  created_at: string;
  amount: number;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  shipping_carrier: string | null;
  tracking_number: string | null;
  items: OrderItem[];
  shipping_zip: string;
  shipping_addr1: string;
  shipping_addr2: string | null;
};

type LookupSuccess = {
  ok: true;
  order: LookupOrder;
};

type LookupError = {
  error: string;
  detail?: string;
};

type LookupResult = LookupSuccess | LookupError;

/* ------------------ 상태 한글 변환 ------------------ */

function getPaymentLabel(status: string) {
  switch (status) {
    case "CREATED":
      return "결제 대기";
    case "PAID":
      return "결제 완료";
    case "VIRTUAL_ACCOUNT_ISSUED":
      return "가상계좌 발급";
    case "CANCELLED":
      return "결제 취소";
    case "FAILED":
      return "결제 실패";
    default:
      return status;
  }
}

function getFulfillmentLabel(status: string) {
  switch (status) {
    case "NEW":
      return "주문 접수";
    case "PACKING":
      return "상품 준비 중";
    case "SHIPPED":
      return "출고 완료";
    case "REFUNDED":
      return "환불 완료";
    default:
      return status;
  }
}

/* ------------------ 페이지 ------------------ */

export default function OrderLookupPage() {
  const [orderNo, setOrderNo] = useState<string>("");
  const [last4, setLast4] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function submit() {
    if (!orderNo.trim() || last4.trim().length < 4) {
      alert("주문번호와 휴대폰 뒤 4자리를 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderNo: orderNo.trim(),
          phoneLast4: last4.trim(),
        }),
      });

      const data: LookupResult = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "NETWORK_ERROR" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>주문 조회</h1>
      <p style={{ marginTop: 10, opacity: 0.7 }}>
        주문번호와 휴대폰 번호 뒤 4자리로 주문 상태를 확인할 수 있습니다.
      </p>

      {/* 입력 영역 */}
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          placeholder="주문번호 (예: HL260219ABCD)"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        />

        <input
          value={last4}
          onChange={(e) => setLast4(e.target.value)}
          placeholder="휴대폰 번호 뒤 4자리"
          inputMode="numeric"
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "조회 중..." : "조회하기"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {result && "error" in result && (
        <p style={{ marginTop: 16, color: "#b00020" }}>
          {result.error === "NOT_MATCH"
            ? "입력한 정보가 일치하지 않습니다."
            : result.error === "NOT_FOUND"
              ? "해당 주문을 찾을 수 없습니다."
              : result.error === "NETWORK_ERROR"
                ? "네트워크 오류가 발생했습니다."
                : result.error}
        </p>
      )}

      {/* 주문 결과 */}
      {result && "ok" in result && (
        <div
          style={{
            marginTop: 22,
            border: "1px solid #e6e6e6",
            borderRadius: 16,
            padding: 18,
            background: "white",
          }}
        >
          {/* 주문번호 */}
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {result.order.order_no}
          </div>

          {/* 상태 */}
          <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
            결제 상태: {getPaymentLabel(result.order.payment_status)}
            {"  ·  "}
            배송 상태: {getFulfillmentLabel(result.order.fulfillment_status)}
          </div>

          {/* 금액 */}
          <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700 }}>
            ₩{result.order.amount.toLocaleString()} {result.order.currency}
          </div>

          {/* 송장 */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700 }}>배송 정보</div>

            <div style={{ marginTop: 6, fontSize: 14 }}>
              {result.order.tracking_number
                ? `${result.order.shipping_carrier ?? "택배사"} · ${
                    result.order.tracking_number
                  }`
                : "상품 준비 중입니다. 송장은 출고 후 안내됩니다."}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
