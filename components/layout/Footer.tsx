import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>HLIN</div>

        <div className={styles.flexBox}>
          <div className={styles.info}>
            <p>
              <span className={`${styles.subtitle} ${styles.founders}`}>
                Founders |
              </span>{" "}
              Minjin Lee — Gwanghyeon Kim
            </p>
            <p>
              <span className={`${styles.subtitle} ${styles.address}`}>
                Address |
              </span>{" "}
              256 Gaon-ro, Paju-si, Gyeonggi-do, Republic of Korea
            </p>
            <p>
              <span className={`${styles.subtitle} ${styles.email}`}>
                Email |
              </span>{" "}
              hausofhlin@gmail.com
            </p>
          </div>

          <div className={styles.bottom}>© 2026 HLIN. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
