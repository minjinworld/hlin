// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const digitsOnly = (s: string) => s.replace(/\D/g, "");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      buyer, // { name, phone, email? }
      shipping, // { recipient_name, recipient_phone, postcode, address, address2? }
      memo,
      items,
      amount,
      currency,
      isGuest,
    } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "장바구니가 비어있어요." },
        { status: 400 },
      );
    }
    if (!buyer?.name || !buyer?.phone) {
      return NextResponse.json(
        { message: "주문자 정보를 입력해줘." },
        { status: 400 },
      );
    }
    if (
      !shipping?.recipient_name ||
      !shipping?.recipient_phone ||
      !shipping?.postcode ||
      !shipping?.address
    ) {
      return NextResponse.json(
        { message: "배송지 정보를 입력해줘." },
        { status: 400 },
      );
    }

    // 게스트 저장
    if (isGuest) {
      const { data, error } = await supabase
        .from("guest_orders")
        .insert({
          email: buyer.email ?? null,
          buyer_name: buyer.name,
          buyer_phone: digitsOnly(buyer.phone),

          recipient_name: shipping.recipient_name,
          recipient_phone: digitsOnly(shipping.recipient_phone),
          postcode: shipping.postcode,
          address: shipping.address,
          address2: shipping.address2 ?? null,

          memo: memo ?? null,
          items,
          amount: Number.isFinite(amount) ? amount : 0,
          currency: currency ?? "KRW",
          status: "draft",
        })
        .select("id")
        .single();

      if (error) {
        console.error(error);
        return NextResponse.json(
          { message: "DB 저장 실패(테이블/RLS/컬럼 확인)" },
          { status: 500 },
        );
      }

      return NextResponse.json({ id: data.id }, { status: 200 });
    }

    // ✅ 회원 주문 저장(원하면 여기서 orders 테이블 insert로 확장)
    return NextResponse.json(
      { message: "회원 주문 저장 로직은 다음 단계에서 붙이면 돼요." },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
