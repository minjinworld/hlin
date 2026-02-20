// app/api/orders/me/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }

  const email = auth.user.email ?? null;
  if (!email) {
    return NextResponse.json({ orders: [] }, { status: 200 });
  }

  // ✅ "내 주문만" (buyer_email 기준)
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("buyer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
