"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

import { PRODUCTS } from "@/data/products";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TabKey = "sleepwear" | "home" | "the-body" | "gifting";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sleepwear", label: "Sleepwear" },
  { key: "home", label: "Home" },
  { key: "the-body", label: "The body" },
  { key: "gifting", label: "Gifting" },
];

export default function ShopPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const tab = (sp.get("tab") as TabKey) ?? "sleepwear";

  const items = useMemo(() => {
    // ✅ 지금은 PRODUCTS에 shopCategory 같은 필드가 없으니까 "임시 필터"
    // - 지금 데이터가 전부 잠옷이면 sleepwear에서 다 보여주게
    // - 나머지 탭은 비워두기 (나중에 데이터 추가하면 여기만 교체하면 됨)
    if (tab === "sleepwear") return PRODUCTS;
    if (tab === "home") return [];
    if (tab === "the-body") return [];
    if (tab === "gifting") return [];
    return PRODUCTS;
  }, [tab]);

  const setTab = (next: TabKey) => {
    router.push(`/shop?tab=${next}`, { scroll: false });
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>All products</h1>

        {/* 탭/필터 UI */}
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
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className={styles.card}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={1024}
                    height={1536}
                    unoptimized
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>
                    {item.name} - {item.color}
                  </p>
                  <p className={styles.cardMeta}>{item.price}</p>
                </div>
              </Link>
            ))}
          </div>

          {!items.length ? (
            <p className={styles.empty}>
              <b>상품 준비중</b> <br />
              No items in this category yet.
            </p>
          ) : null}
        </div>
      </main>
    </main>
  );
}
