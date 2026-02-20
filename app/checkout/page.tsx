"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { PRODUCTS, type Product } from "@/data/products";
import { useCart, type CartItem } from "@/context/CartContext";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

import styles from "./page.module.css";

const formatKRW = (n: number) => new Intl.NumberFormat("ko-KR").format(n);

const priceToNumber = (s: string) => {
  const n = Number(s.replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
};

type Line = { item: CartItem; product: Product };

type AddressRow = {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  postcode: string | null;
  address: string | null;
  address2: string | null;
  is_default: boolean;
  created_at: string;
};

function formatAddress(a: {
  postcode: string | null;
  address: string | null;
  address2: string | null;
}) {
  const line1 = [a.postcode ?? "", a.address ?? ""].filter(Boolean).join(" ");
  const line2 = a.address2 ?? "";
  return { line1: line1 || "—", line2: line2 || "" };
}

function formatPhoneKR(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, count } = useCart();

  const lines: Line[] = items.flatMap((it) => {
    const p = PRODUCTS.find((x) => x.slug === it.slug);
    return p ? [{ item: it, product: p }] : [];
  });

  const subtotal = lines.reduce(
    (sum, l) => sum + priceToNumber(l.product.price) * l.item.qty,
    0,
  );

  const shippingFee = subtotal > 0 ? 0 : 0; // 일단 무료배송
  const total = subtotal + shippingFee;

  // 배송지 (회원용)
  const [addrLoading, setAddrLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // 주문자/요청사항
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [memo, setMemo] = useState("");

  const [placing, setPlacing] = useState(false);

  // ✅ 게스트 모드
  const [isGuest, setIsGuest] = useState(false);

  // ✅ 게스트 배송지 입력 폼 상태
  const [guestEmail, setGuestEmail] = useState("");
  const [guestRecipient, setGuestRecipient] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPostcode, setGuestPostcode] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestAddress2, setGuestAddress2] = useState("");

  // ✅ “주문자 정보와 동일”
  const [sameAsBuyer, setSameAsBuyer] = useState(false);

  // ✅ derived: 선택된 주소 (useEffect들보다 먼저!)
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  // ✅ 주문자 정보 동일 체크 시 자동 복사
  useEffect(() => {
    if (!sameAsBuyer) return;

    if (isGuest) {
      setBuyerName(guestRecipient);
      setBuyerPhone(guestPhone);
      return;
    }

    if (selectedAddress) {
      setBuyerName(selectedAddress.recipient_name ?? "");
      setBuyerPhone(
        selectedAddress.phone ? formatPhoneKR(selectedAddress.phone) : "",
      );
    }
  }, [
    sameAsBuyer,
    isGuest,
    guestRecipient,
    guestPhone,
    selectedAddressId,
    selectedAddress,
  ]);

  // ✅ 초기 로딩: 회원이면 addresses 불러오고, 아니면 게스트로
  useEffect(() => {
    let alive = true;

    const init = async () => {
      // 장바구니 비었으면 다시 cart로
      if (!lines.length) {
        router.replace("/cart");
        return;
      }

      setAddrLoading(true);

      const sb = createSupabaseBrowserClient();

      // ✅ 빌드/서버 상황: supabase 생성 불가면 게스트로
      if (sb == null) {
        if (!alive) return;
        setIsGuest(true);
        setAddresses([]);
        setSelectedAddressId("");
        setAddrLoading(false);
        return;
      }

      try {
        const { data: sessionRes } = await sb.auth.getSession();
        const user = sessionRes.session?.user;

        // ✅ 비회원 허용
        if (!user) {
          if (!alive) return;
          setIsGuest(true);
          setAddresses([]);
          setSelectedAddressId("");
          return;
        }

        // ✅ 회원이면 addresses 로딩
        const { data, error } = await sb
          .from("addresses")
          .select(
            "id,user_id,label,recipient_name,phone,postcode,address,address2,is_default,created_at",
          )
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("checkout addresses load error:", error);
          if (alive) setAddresses([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as AddressRow[]) : [];
        if (!alive) return;

        setIsGuest(false);
        setAddresses(rows);

        const defaultAddr = rows.find((a) => a.is_default) ?? rows[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);

          // 주문자정보 기본값 세팅
          setBuyerName(defaultAddr.recipient_name ?? "");
          setBuyerPhone(
            defaultAddr.phone ? formatPhoneKR(defaultAddr.phone) : "",
          );
        } else {
          setSelectedAddressId("");
        }
      } finally {
        if (alive) setAddrLoading(false);
      }
    };

    init();
    return () => {
      alive = false;
    };
  }, [router, lines.length]);

  const isGuestShippingValid =
    guestRecipient.trim() &&
    guestPhone.trim() &&
    guestPostcode.trim() &&
    guestAddress.trim();

  const isMemberShippingValid = !!selectedAddress;

  const placeOrder = async () => {
    if (!lines.length) return;

    // ✅ 배송지 검증: 게스트/회원 분리
    if (isGuest) {
      if (!guestRecipient.trim()) return alert("받는 분 이름을 입력해줘.");
      if (!guestPhone.trim()) return alert("받는 분 연락처를 입력해줘.");
      if (!guestPostcode.trim() || !guestAddress.trim())
        return alert("우편번호/주소를 입력해줘.");
    } else {
      if (!selectedAddress) return alert("배송지를 선택해줘.");
    }

    // ✅ 주문자 검증
    if (!buyerName.trim()) return alert("주문자 이름을 입력해줘.");
    if (!buyerPhone.trim()) return alert("주문자 연락처를 입력해줘.");

    setPlacing(true);
    try {
      const payload = {
        isGuest,
        buyer: {
          name: buyerName.trim(),
          phone: buyerPhone.trim(),
          email: isGuest ? guestEmail.trim() || null : null,
        },
        shipping: isGuest
          ? {
              recipient_name: guestRecipient.trim(),
              recipient_phone: guestPhone.trim(),
              postcode: guestPostcode.trim(),
              address: guestAddress.trim(),
              address2: guestAddress2.trim() || null,
            }
          : {
              recipient_name:
                selectedAddress!.recipient_name ?? buyerName.trim(),
              recipient_phone: selectedAddress!.phone ?? buyerPhone.trim(),
              postcode: selectedAddress!.postcode!,
              address: selectedAddress!.address!,
              address2: selectedAddress!.address2 ?? null,
            },
        memo: memo.trim() || null,
        items: lines.map((l) => ({
          slug: l.product.slug,
          name: l.product.name,
          color: l.product.color,
          size: l.item.size ?? null,
          qty: l.item.qty,
          unit_price: priceToNumber(l.product.price),
        })),
        amount: total,
        currency: "KRW",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.message ?? "저장 실패");
        return;
      }

      alert(`저장 완료! 주문ID: ${json?.id ?? "-"}`);
      alert("결제 준비중입니다.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>결제</h1>
        <Link href="/cart" className={styles.back}>
          ← Cart로 돌아가기
        </Link>
      </header>

      <div className={styles.grid}>
        {/* LEFT */}
        <section className={styles.left}>
          {/* 배송지 */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.h2}>배송지</h2>

              {!isGuest ? (
                <Link href="/mypage" className={styles.link}>
                  배송지 관리 →
                </Link>
              ) : (
                <span className={styles.muted}>비회원 주문</span>
              )}
            </div>

            {isGuest ? (
              <div className={styles.form}>
                <label className={styles.field}>
                  <span>받는 분</span>
                  <input
                    value={guestRecipient}
                    onChange={(e) => setGuestRecipient(e.target.value)}
                    placeholder="받는 분 이름"
                  />
                </label>

                <label className={styles.field}>
                  <span>연락처</span>
                  <input
                    value={guestPhone}
                    onChange={(e) =>
                      setGuestPhone(formatPhoneKR(e.target.value))
                    }
                    placeholder="010-0000-0000"
                    inputMode="numeric"
                    maxLength={13}
                  />
                </label>

                <div className={styles.twoCol}>
                  <label className={styles.field}>
                    <span>우편번호</span>
                    <input
                      value={guestPostcode}
                      onChange={(e) => setGuestPostcode(e.target.value)}
                      placeholder="우편번호"
                    />
                  </label>

                  <label className={styles.field}>
                    <span>기본주소</span>
                    <input
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      placeholder="주소"
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>상세주소</span>
                  <input
                    value={guestAddress2}
                    onChange={(e) => setGuestAddress2(e.target.value)}
                    placeholder="동/호수 등"
                  />
                </label>

                <label className={styles.field}>
                  <span>이메일(선택)</span>
                  <input
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="receipt@email.com"
                    inputMode="email"
                  />
                </label>
              </div>
            ) : addrLoading ? (
              <div className={styles.muted}>불러오는 중…</div>
            ) : addresses.length === 0 ? (
              <div className={styles.notice}>
                등록된 배송지가 없어요. <b>My Page</b>에서 배송지를 추가해줘.
              </div>
            ) : (
              <div className={styles.addrList}>
                {addresses.map((a) => {
                  const addr = formatAddress(a);
                  return (
                    <label key={a.id} className={styles.addrItem}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === a.id}
                        onChange={() => {
                          setSelectedAddressId(a.id);
                          setBuyerName(a.recipient_name ?? "");
                          setBuyerPhone(a.phone ? formatPhoneKR(a.phone) : "");
                        }}
                      />
                      <div className={styles.addrBody}>
                        <div className={styles.addrTop}>
                          <div className={styles.addrLabel}>
                            {a.label ?? "배송지"}
                            {a.is_default ? (
                              <span className={styles.badge}>기본</span>
                            ) : null}
                          </div>
                          <div className={styles.addrName}>
                            {a.recipient_name ?? "—"}
                            {a.phone ? (
                              <span className={styles.addrPhone}>
                                {" "}
                                · {formatPhoneKR(a.phone)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className={styles.addrLine}>{addr.line1}</div>
                        {addr.line2 ? (
                          <div className={styles.addrLine}>{addr.line2}</div>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 주문자 정보 */}
          <div className={styles.card}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={sameAsBuyer}
                onChange={(e) => setSameAsBuyer(e.target.checked)}
              />
              주문자 정보 동일
            </label>

            <h2 className={styles.h2}>주문자 정보</h2>

            <div className={styles.form}>
              <label className={styles.field}>
                <span>이름</span>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="주문자 이름"
                />
              </label>

              <label className={styles.field}>
                <span>연락처</span>
                <input
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(formatPhoneKR(e.target.value))}
                  placeholder="010-0000-0000"
                  inputMode="numeric"
                  maxLength={13}
                />
              </label>

              <label className={styles.field}>
                <span>요청사항</span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 문 앞에 놔주세요"
                  rows={3}
                />
              </label>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className={styles.right}>
          <div className={styles.card}>
            <h2 className={styles.h2}>주문 요약</h2>

            <div className={styles.summaryList}>
              {lines.map(({ item, product }) => (
                <div
                  key={`${item.slug}-${item.size ?? ""}`}
                  className={styles.sumRow}
                >
                  <div className={styles.thumb}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={160}
                      height={200}
                      unoptimized
                      className={styles.thumbImg}
                    />
                  </div>

                  <div className={styles.sumInfo}>
                    <div className={styles.sumName}>
                      {product.name} - {product.color}
                    </div>
                    <div className={styles.sumMeta}>
                      {item.size ? `Size ${item.size} · ` : ""}
                      Qty {item.qty}
                    </div>
                  </div>

                  <div className={styles.sumPrice}>
                    ₩{formatKRW(priceToNumber(product.price) * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.totals}>
              <div className={styles.tRow}>
                <span>상품 {count}개</span>
                <span>₩{formatKRW(subtotal)}</span>
              </div>
              <div className={styles.tRow}>
                <span>배송비</span>
                <span>₩{formatKRW(shippingFee)}</span>
              </div>
              <div className={styles.tRowStrong}>
                <span>총 결제금액</span>
                <span>₩{formatKRW(total)}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.payBtn}
              onClick={placeOrder}
              disabled={
                placing ||
                !lines.length ||
                (isGuest ? !isGuestShippingValid : !isMemberShippingValid)
              }
            >
              {placing ? "처리 중…" : "결제하기"}
            </button>

            {isGuest ? (
              !isGuestShippingValid ? (
                <div className={styles.warn}>
                  배송지 정보를 모두 입력해주세요.
                </div>
              ) : null
            ) : !selectedAddress ? (
              <div className={styles.warn}>
                배송지가 없으면 결제를 진행할 수 없어요.
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
