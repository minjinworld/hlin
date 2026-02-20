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
  order_no: string | null;

  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;

  shipping_zip: string;
  shipping_addr1: string;
  shipping_addr2: string | null;
  shipping_memo: string | null;

  items: OrderItem[];
  amount: number;
  currency: string;

  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;

  shipping_carrier: string | null;
  tracking_number: string | null;

  created_at: string;
  updated_at: string;
};

type OrdersSuccess = { orders: OrderRow[] };
type OrdersError = { error: string; detail?: string };

function isOrdersSuccess(data: unknown): data is OrdersSuccess {
  return (
    typeof data === "object" &&
    data !== null &&
    "orders" in data &&
    Array.isArray((data as { orders: unknown }).orders)
  );
}

function formatKST(iso: string): string {
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

function sumItems(items: OrderItem[]) {
  const qty = items.reduce((s, it) => s + Number(it.qty ?? 0), 0);

  const names = items.map((it) => it.name).filter(Boolean);

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

  const [q, setQ] = useState("");
  const [onlyUnshipped, setOnlyUnshipped] = useState(true);
  const [payFilter, setPayFilter] = useState<PaymentStatus | "ALL">("ALL");

  async function load(): Promise<void> {
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

      const data: unknown = await res.json();

      if (!res.ok) {
        if (typeof data === "object" && data !== null && "error" in data) {
          const err = data as OrdersError;
          throw new Error(`${err.error}\n${err.detail ?? ""}`);
        }
        throw new Error("불러오기 실패");
      }

      if (isOrdersSuccess(data)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      alert(message);
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

  return (
    <main style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <h1>관리자 · 주문 관리</h1>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
        />
        <button onClick={load} disabled={loading}>
          {loading ? "불러오는 중..." : "불러오기"}
        </button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {filtered.map((o) => {
          const { qty, title } = sumItems(o.items);

          return (
            <li key={o.id} style={{ marginBottom: 16 }}>
              <div>
                <Link href={`/admin/orders/${o.id}`}>{o.order_no ?? o.id}</Link>
              </div>

              <div>
                {o.buyer_name} · {o.buyer_phone}
              </div>

              <div>
                상품: {title} · {qty}개
              </div>

              <div>₩{Number(o.amount).toLocaleString()}</div>

              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {formatKST(o.created_at)}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
