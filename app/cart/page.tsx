"use client";

import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, type Product } from "@/data/products";
import { useCart, type CartItem } from "@/context/CartContext";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const formatKRW = (n: number) => new Intl.NumberFormat("ko-KR").format(n);

const priceToNumber = (s: string) => {
  const n = Number(s.replaceAll(",", ""));
  return Number.isFinite(n) ? n : 0;
};

type Line = {
  item: CartItem;
  product: Product;
};

export default function CartPage() {
  const { items, setQty, removeItem, count } = useCart();

  const lines: Line[] = items.flatMap((it) => {
    const p = PRODUCTS.find((x) => x.slug === it.slug);
    return p ? [{ item: it, product: p }] : [];
  });

  const total = lines.reduce((sum, l) => {
    return sum + priceToNumber(l.product.price) * l.item.qty;
  }, 0);

  const router = useRouter();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Cart ({count})</h1>

      <div className={styles.list}>
        {lines.map(({ item, product }) => (
          <div key={`${item.slug}-${item.size ?? ""}`} className={styles.row}>
            <Link
              href={`/products/${product.slug}`}
              className={styles.mediaLink}
            >
              <div className={styles.media}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={800}
                  unoptimized
                  className={styles.image}
                />
              </div>
            </Link>

            <div className={styles.info}>
              <Link
                href={`/products/${product.slug}`}
                className={styles.nameLink}
              >
                <div className={styles.name}>
                  {product.name} - {product.color}
                </div>
              </Link>
              <div className={styles.meta}>
                Price: <span className={styles.krw}>₩</span>
                {formatKRW(priceToNumber(product.price) * item.qty)}
              </div>{" "}
              {item.size ? (
                <div className={styles.meta}>Size: {item.size}</div>
              ) : null}
              <div className={styles.qtyRow}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQty(item.slug, item.qty - 1, item.size)}
                  aria-label="Decrease quantity"
                >
                  –
                </button>

                <div className={styles.qtyValue}>{item.qty}</div>

                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQty(item.slug, item.qty + 1, item.size)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.slug, item.size)}
              className={styles.removeBtn}
              aria-label="Remove item"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        {!lines.length ? (
          <p className={styles.empty}>
            <b>장바구니가 비어있어요</b>
            <br />
            Add items to see them here.
          </p>
        ) : null}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.checkoutBtn}
          onClick={() => router.push("/checkout")}
          disabled={!lines.length}
        >
          Check out
        </button>

        <div className={styles.total}>
          <span className={styles.krw}>₩</span>
          {formatKRW(total)}
        </div>
      </div>
    </main>
  );
}
