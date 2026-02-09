"use client";

import styles from "./MenuSlotText.module.css";

type Props = {
  text: string;
};

export default function MenuSlotText({ text }: Props) {
  return (
    <span className={styles.wrap}>
      <span className={styles.viewport}>
        <span className={styles.stack}>
          {/* 기본 */}
          <span className={`${styles.item} ${styles.normal}`}>{text}</span>

          {/* hover */}
          <span className={`${styles.item} ${styles.hover}`}>{text}</span>
        </span>
      </span>
    </span>
  );
}
