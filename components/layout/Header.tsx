import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <div className={styles.header_area}>
      <div className={styles.left_box}>
        <Link href="/" className={styles.logo}>
          <svg
            width="68"
            height="20"
            viewBox="0 0 68 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50.2333 20V0H55.2908L62.315 11.8881H62.3712V0H67.4287V20H62.3712L55.347 8.11189H55.2908V20H50.2333Z"
              fill="#181818"
            />
            <path d="M40.1662 0H45.2237V20H40.1662V0Z" fill="#181818" />
            <path
              d="M22.0036 0H27.061V15.8881H35.9959V20H22.0036V0Z"
              fill="#181818"
            />
            <path
              d="M0 0H5.05746V7.83217H11.9412V0H16.9987V20H11.9412V11.9441H5.05746V20H0V0Z"
              fill="#181818"
            />
          </svg>
        </Link>
        <div className={styles.menu_box}>
          <ul className={styles.list_box}>
            <li className={styles.menu}>
              <Link href="/">shop</Link>
            </li>
            <li className={styles.menu}>
              <Link href="/">archives</Link>
            </li>
            <li className={styles.menu}>
              <Link href="/">editorial</Link>
            </li>
            <li className={styles.menu}>
              <Link href="/">about</Link>
            </li>
            <li className={styles.menu}>
              <Link href="/">information</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`${styles.right_box} ${styles.user_box}`}>
        <ul className={styles.list_box}>
          <li className={styles.user_list}>
            <Link href="/">Search</Link>
          </li>
          <li className={styles.user_list}>
            <Link href="/">Login</Link>
          </li>
          <li className={styles.user_list}>
            <Link href="/">Cart</Link>
          </li>
        </ul>
      </div>

      <div className={styles.m_box}>
        <div className={styles.m_menu}>
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_121_296)">
              <path
                d="M9.38709 4.65818C9.24249 2.47247 7.92992 1 6.02781 1C4.0812 1 2.74638 2.47247 2.6129 4.65818H1V15H11V4.65818H9.38709ZM5.99444 1.72473C7.46274 1.72473 8.40823 2.81758 8.51946 4.65818H3.4694C3.58064 2.81758 4.51502 1.72473 5.99444 1.72473ZM10.2658 14.2523H1.7119V5.40592H10.2658V14.2523Z"
                fill="#181818"
                stroke="#181818"
                stroke-width="0.1"
              />
            </g>
            <defs>
              <clipPath id="clip0_121_296">
                <rect width="12" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className={styles.m_menu}>
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="1" y="4" width="10" height="0.8" fill="#181818" />
            <rect x="1" y="11" width="10" height="0.8" fill="#181818" />
          </svg>
        </div>
      </div>
    </div>
  );
}
