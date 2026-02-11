"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/data/products";
import styles from "./SearchPanel.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchPanel({ open, onClose }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return PRODUCTS.filter((p) =>
      `${p.name} ${p.color}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      {/* overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.open : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.panel} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
            autoFocus
          />
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <div className={styles.results}>
          {results.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              onClick={onClose}
              className={styles.item}
            >
              <div className={styles.thumb}>
                <Image
                  src={p.image}
                  alt={p.name}
                  width={300}
                  height={400}
                  unoptimized
                />
              </div>
              <div>
                <div className={styles.name}>
                  {p.name} - {p.color}
                </div>
                <div className={styles.price}>₩{p.price}</div>
              </div>
            </Link>
          ))}

          {!results.length && query && (
            <p className={styles.empty}>No results found.</p>
          )}
        </div>
      </aside>
    </>
  );
}
