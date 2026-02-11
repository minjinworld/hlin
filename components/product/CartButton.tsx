"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./CartButton.module.css";

type Props = {
  slug: string;
  inStock: boolean;
  sizeOptions?: string[]; // ["M","L"] 같은 라벨만
};

export default function CartButton({ slug, inStock, sizeOptions = [] }: Props) {
  const { addItem } = useCart();

  const options = useMemo(() => {
    // 중복 제거 + 공백 제거
    return Array.from(new Set(sizeOptions.map((s) => s.trim()))).filter(
      Boolean,
    );
  }, [sizeOptions]);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    options[0],
  );

  const handleClick = () => {
    if (!inStock) {
      alert("현재 품절입니다.");
      return;
    }

    // 옵션이 있는 상품이면 사이즈 선택 필수
    if (options.length > 0 && !selectedSize) {
      alert("사이즈를 선택해주세요.");
      return;
    }

    addItem(slug, 1, selectedSize);
    alert("장바구니에 담겼어요!");
  };

  return (
    <div className={styles.wrap}>
      {/* ✅ Size 선택 UI */}
      {options.length > 0 ? (
        <div className={styles.sizeBlock}>
          <p className={styles.sizeLabel}>Size</p>
          <div className={styles.sizeBtns}>
            {options.map((s) => {
              const active = s === selectedSize;
              return (
                <button
                  key={s}
                  type="button"
                  className={`${styles.sizeBtn} ${
                    active ? styles.sizeBtnActive : ""
                  }`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ✅ CTA */}
      <button
        type="button"
        className={`${styles.cta} ${!inStock ? styles.soldout : ""}`}
        onClick={handleClick}
      >
        {inStock ? "Add to cart" : "Sold out"}
      </button>
    </div>
  );
}
