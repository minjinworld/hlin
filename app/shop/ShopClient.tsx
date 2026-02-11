"use client";

import styles from "./page.module.css";
import { SHOP_ITEMS } from "@/data/products";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";

type TabKey = "sleepwear" | "home" | "the-body" | "gifting";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sleepwear", label: "Sleepwear" },
  { key: "home", label: "Home" },
  { key: "the-body", label: "The body" },
  { key: "gifting", label: "Gifting" },
];

const isTabKey = (v: string | null): v is TabKey => {
  return (
    v === "sleepwear" || v === "home" || v === "the-body" || v === "gifting"
  );
};

export default function ShopClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const raw = sp.get("tab");
  const tab: TabKey = isTabKey(raw) ? raw : "sleepwear";

  const items = useMemo(() => {
    if (tab === "sleepwear") return SHOP_ITEMS;
    return [];
  }, [tab]);

  const setTab = (next: TabKey) => {
    router.push(`/shop?tab=${next}`, { scroll: false });
  };

  return (
    <>
      <nav className={styles.tabs} aria-label="Shop categories">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`${styles.tab} ${tab === t.key ? styles.active : ""}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {items.map((item) => (
              <ProductCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                color={item.color}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>

          {!items.length && (
            <p className={styles.empty}>
              <b>상품 준비중</b>
              <br />
              No items in this category yet.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
