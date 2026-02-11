import { Suspense } from "react";
import styles from "./page.module.css";
import ShopClient from "./ShopClient";

export default function ShopPage() {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>All products</h1>
      </header>

      <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
        <ShopClient />
      </Suspense>
    </main>
  );
}
