import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  option?: string;
  imageUrl?: string;
};

function calcAmount(items: CartItem[]) {
  return items.reduce((sum, it) => sum + Number(it.price) * Number(it.qty), 0);
}

function generateOrderNo() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HL${y}${m}${d}${random}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const {
    buyerName,
    buyerPhone,
    buyerEmail,
    shippingZip,
    shippingAddr1,
    shippingAddr2,
    shippingMemo,
    items,
  } = body ?? {};

  if (
    !buyerName ||
    !buyerPhone ||
    !shippingZip ||
    !shippingAddr1 ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  // ✅ 여기서 생성 (import 시점 X)
  const supabase = createSupabaseAdminClient();

  const orderId = `ord_${crypto.randomUUID()}`;
  const amount = calcAmount(items);

  // ✅ orderNo 유니크 충돌 대비: 최대 5번 재시도
  for (let i = 0; i < 5; i++) {
    const orderNo = generateOrderNo();

    const { error } = await supabase.from("orders").insert({
      id: orderId,
      order_no: orderNo,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail ?? null,
      shipping_zip: shippingZip,
      shipping_addr1: shippingAddr1,
      shipping_addr2: shippingAddr2 ?? null,
      shipping_memo: shippingMemo ?? null,
      items,
      amount,
      currency: "KRW",
      payment_status: "CREATED",
      fulfillment_status: "NEW",
    });

    if (!error) {
      return NextResponse.json({ ok: true, orderId, orderNo, amount });
    }

    // 유니크 충돌(23505)이면 재시도, 아니면 실패
    const msg = error.message ?? "";
    if (msg.includes("duplicate key") || msg.includes("23505")) continue;

    return NextResponse.json(
      { error: "DB_INSERT_FAILED", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: "ORDER_NO_COLLISION", detail: "order_no 생성 충돌이 반복됐어" },
    { status: 500 },
  );
}
