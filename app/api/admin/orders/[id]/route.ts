// app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/adminAuth";

type FulfillmentStatus = "NEW" | "PACKING" | "SHIPPED" | "REFUNDED";
type PaymentStatus =
  | "CREATED"
  | "PAID"
  | "VIRTUAL_ACCOUNT_ISSUED"
  | "CANCELLED"
  | "FAILED";

function normalizeKey(v: string) {
  const k = decodeURIComponent(v ?? "").trim();
  // HL 주문번호는 대문자로 통일
  return /^HL/i.test(k) ? k.toUpperCase() : k;
}

function isOrderNoLike(v: string) {
  return /^HL[A-Z0-9]{6,20}$/i.test(v);
}

async function findOrderByKey(key: string) {
  const k = decodeURIComponent(key ?? "").trim();
  const keyUpper = k.toUpperCase();

  // 1) id로 먼저 찾기
  const byId = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", k)
    .maybeSingle();

  if (byId.error) return { data: null, error: byId.error };
  if (byId.data) return { data: byId.data, error: null };

  // 2) HL 형태면 order_no로 한 번 더
  if (isOrderNoLike(keyUpper)) {
    const byNo = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_no", keyUpper)
      .maybeSingle();

    if (byNo.error) return { data: null, error: byNo.error };
    if (byNo.data) return { data: byNo.data, error: null };
  }

  return { data: null, error: null };
}
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "비밀번호가 다릅니다." },
      { status: 401 },
    );
  }

  const key = normalizeKey(params.id);

  const { data, error } = await findOrderByKey(key);

  if (error) {
    return NextResponse.json(
      { error: "DB_READ_FAILED", detail: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, order: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "비밀번호가 다릅니다." },
      { status: 401 },
    );
  }

  const key = normalizeKey(params.id);

  const body = await req.json().catch(() => ({}));
  const { shippingCarrier, trackingNumber, fulfillmentStatus, paymentStatus } =
    body ?? {};

  // ✅ 어떤 키로 왔든 "진짜 id"를 먼저 확정
  const { data: order, error: findErr } = await findOrderByKey(key);

  if (findErr) {
    return NextResponse.json(
      { error: "DB_READ_FAILED", detail: findErr.message },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // paymentStatus 검증 + 반영
  if (paymentStatus !== undefined) {
    const allowed: PaymentStatus[] = [
      "CREATED",
      "PAID",
      "VIRTUAL_ACCOUNT_ISSUED",
      "CANCELLED",
      "FAILED",
    ];
    if (!allowed.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "INVALID_PAYMENT_STATUS" },
        { status: 400 },
      );
    }
    updates.payment_status = paymentStatus;
  }

  if (shippingCarrier !== undefined) {
    updates.shipping_carrier = shippingCarrier || null;
  }

  if (trackingNumber !== undefined) {
    updates.tracking_number = trackingNumber || null;
  }

  if (fulfillmentStatus !== undefined) {
    const allowed: FulfillmentStatus[] = [
      "NEW",
      "PACKING",
      "SHIPPED",
      "REFUNDED",
    ];
    if (!allowed.includes(fulfillmentStatus)) {
      return NextResponse.json(
        { error: "INVALID_FULFILLMENT_STATUS" },
        { status: 400 },
      );
    }
    updates.fulfillment_status = fulfillmentStatus;
  }

  // ✅ 출고완료(SHIPPED)는 결제완료(PAID)일 때만 허용
  if (updates.fulfillment_status === "SHIPPED") {
    const nextPay =
      (updates.payment_status as PaymentStatus | undefined) ??
      (order.payment_status as PaymentStatus | undefined);

    if (nextPay !== "PAID") {
      return NextResponse.json(
        { error: "결제완료(PAID) 주문만 출고 처리할 수 있어요." },
        { status: 400 },
      );
    }
  }

  // ✅ 업데이트는 무조건 id 기준으로만 (가장 안정적)
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", order.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "DB_UPDATE_FAILED", detail: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "주문을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, order: data });
}
