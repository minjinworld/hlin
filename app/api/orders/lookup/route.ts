import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

function digitsOnly(v: string) {
  return (v ?? "").replaceAll(/[^0-9]/g, "");
}

type OrderLookupRow = {
  id: string;
  order_no: string;
  created_at: string;
  amount: number;
  currency: string;
  payment_status: string;
  fulfillment_status: string;
  shipping_carrier: string | null;
  tracking_number: string | null;
  items: unknown; // items 컬럼이 jsonb면 unknown이 안전 (원하면 더 구체화 가능)
  shipping_zip: string;
  shipping_addr1: string;
  shipping_addr2: string | null;
  buyer_phone: string;
};

type SafeOrderLookupRow = Omit<OrderLookupRow, "buyer_phone">;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { orderNo, phoneLast4 } = body ?? {};

  const no = String(orderNo ?? "").trim();
  const last4 = digitsOnly(String(phoneLast4 ?? "")).slice(-4);

  if (!no || last4.length !== 4) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  // ✅ 여기서 생성 (import 시점 X)
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, created_at, amount, currency, payment_status, fulfillment_status, shipping_carrier, tracking_number, items, shipping_zip, shipping_addr1, shipping_addr2, buyer_phone",
    )
    .eq("order_no", no)
    .maybeSingle<OrderLookupRow>();

  if (error) {
    return NextResponse.json(
      { error: "DB_ERROR", detail: error.message },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const buyerLast4 = digitsOnly(data.buyer_phone).slice(-4);
  if (buyerLast4 !== last4) {
    return NextResponse.json({ error: "NOT_MATCH" }, { status: 401 });
  }

  // ✅ buyer_phone 제거 (any 없이)
  const { buyer_phone: _buyerPhone, ...safe } = data;

  return NextResponse.json({
    ok: true,
    order: safe satisfies SafeOrderLookupRow,
  });
}
