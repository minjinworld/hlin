import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function digitsOnly(v: string) {
  return (v ?? "").replaceAll(/[^0-9]/g, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { orderNo, phoneLast4 } = body ?? {};

  const no = String(orderNo ?? "").trim();
  const last4 = digitsOnly(String(phoneLast4 ?? "")).slice(-4);

  if (!no || last4.length !== 4) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_no, created_at, amount, currency, payment_status, fulfillment_status, shipping_carrier, tracking_number, items, shipping_zip, shipping_addr1, shipping_addr2, buyer_phone",
    )
    .eq("order_no", no)
    .maybeSingle();

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

  // ✅ 고객에게는 buyer_phone 같은 개인정보는 내려주지 말자
  const { buyer_phone, ...safe } = data;

  return NextResponse.json({ ok: true, order: safe });
}
