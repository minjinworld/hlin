"use client";

import { useCart } from "@/context/CartContext";
import styles from "./CartButton.module.css";

export default function CartButton({
  slug,
  inStock = true,
}: {
  slug: string;
  inStock?: boolean;
}) {
  const { addItem } = useCart();

  const onClick = () => {
    if (!inStock) {
      alert("현재 품절입니다.");
      return;
    }
    addItem(slug, 1);
    alert("장바구니에 담겼습니다.");
  };

  return (
    <button type="button" onClick={onClick} className={styles.cta}>
      {inStock ? "Add to cart" : "Sold out"}
    </button>
  );
}
