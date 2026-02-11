"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import MenuSlotText from "./MenuSlotText";
import { useCart } from "@/context/CartContext";
import SearchPanel from "./SearchPanel";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  // 장바구니 뱃지
  const { count } = useCart();

  // 검색 기능
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className={styles.header_area}>
        <div className={styles.left_box}>
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            {/* logo svg 그대로 */}
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
                <Link
                  href="/shop"
                  className={`${styles.menuLink} ${styles.shop}`}
                >
                  <MenuSlotText text="shop" />
                </Link>
              </li>
              <li className={styles.menu}>
                <Link
                  href="/"
                  className={`${styles.menuLink} ${styles.archives}`}
                >
                  <MenuSlotText text="archives" />
                </Link>
              </li>
              <li className={styles.menu}>
                <Link
                  href="/"
                  className={`${styles.menuLink} ${styles.editorial}`}
                >
                  <MenuSlotText text="editorial" />
                </Link>
              </li>
              <li className={styles.menu}>
                <Link href="/" className={`${styles.menuLink} ${styles.about}`}>
                  <MenuSlotText text="about" />
                </Link>
              </li>
              <li className={styles.menu}>
                <Link
                  href="/"
                  className={`${styles.menuLink} ${styles.information}`}
                >
                  <MenuSlotText text="information" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={`${styles.right_box} ${styles.user_box}`}>
          <ul className={styles.list_box}>
            <li className={styles.user_list}>
              <button
                type="button"
                style={{ cursor: "pointer" }}
                className={styles.menuLink}
                onClick={() => setIsSearchOpen(true)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.3519 11.2766C11.5472 11.0813 11.8637 11.0813 12.0589 11.2766L14.7445 13.9621C14.9396 14.1574 14.9397 14.4739 14.7445 14.6692C14.5492 14.8644 14.2327 14.8643 14.0374 14.6692L11.3519 11.9836C11.1566 11.7883 11.1566 11.4718 11.3519 11.2766Z"
                    fill="#181818"
                  />
                  <path
                    d="M6.49088 2.44254C8.46647 1.91318 10.5748 2.47786 12.0212 3.92398C13.4675 5.37027 14.0329 7.47858 13.5036 9.45426C12.9741 11.43 11.4305 12.9737 9.45474 13.5031C7.47907 14.0324 5.37076 13.467 3.92447 12.0207C2.47835 10.5743 1.91367 8.46598 2.44303 6.49039C2.9725 4.51499 4.51547 2.97201 6.49088 2.44254ZM11.3141 4.63101C10.1204 3.43752 8.38017 2.97146 6.74967 3.40836C5.11936 3.84536 3.84585 5.11887 3.40885 6.74918C2.97195 8.37968 3.438 10.1199 4.6315 11.3136C5.82516 12.5073 7.56537 12.9741 9.19596 12.5373C10.8266 12.1003 12.1008 10.8261 12.5378 9.19547C12.9746 7.56488 12.5078 5.82468 11.3141 4.63101Z"
                    fill="#181818"
                  />
                </svg>
              </button>
            </li>
            <li className={styles.user_list}>
              <Link href="/" className={styles.menuLink}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.2917 13.9353C13.2917 12.8912 12.6444 11.9561 11.6667 11.5896C9.70266 10.8535 7.53809 10.8536 5.57397 11.5896C4.59623 11.9561 3.948 12.8912 3.948 13.9353V14.2234C3.94812 14.4232 4.11045 14.5847 4.3103 14.5847H12.9304C13.1301 14.5845 13.2916 14.4231 13.2917 14.2234V13.9353ZM14.2917 14.2234C14.2916 14.9754 13.6823 15.5845 12.9304 15.5847H4.3103C3.55818 15.5847 2.94812 14.9755 2.948 14.2234V13.9353C2.948 12.4744 3.85443 11.1669 5.22241 10.6541C7.41295 9.83308 9.82679 9.83308 12.0173 10.6541C13.3854 11.1669 14.2917 12.4743 14.2917 13.9353V14.2234Z"
                    fill="#181818"
                  />
                  <path
                    d="M8.62015 1.99658C9.66046 1.99664 10.6398 2.4876 11.2627 3.3208L11.3399 3.42432C11.9547 4.24668 12.1845 5.29428 11.9698 6.29834L11.9219 6.52393C11.7099 7.51448 11.0641 8.35784 10.1631 8.8208C9.19481 9.3182 8.04551 9.3182 7.07718 8.8208C6.17604 8.35788 5.53037 7.51461 5.3184 6.52393L5.27054 6.29834C5.05584 5.29439 5.28479 4.24667 5.89945 3.42432L5.97757 3.3208C6.60053 2.48754 7.57978 1.99658 8.62015 1.99658ZM8.62015 2.99658C7.89507 2.99658 7.21251 3.33872 6.77836 3.91943L6.70023 4.02295C6.25836 4.61416 6.0937 5.36758 6.24808 6.08936L6.29593 6.31494C6.44515 7.01216 6.89999 7.60535 7.53422 7.93115C8.21575 8.28123 9.02458 8.28123 9.70609 7.93115C10.3401 7.60534 10.7942 7.012 10.9434 6.31494L10.9922 6.08936C11.1466 5.3675 10.9811 4.6142 10.5391 4.02295L10.4619 3.91943C10.0278 3.33875 9.34517 2.99664 8.62015 2.99658Z"
                    fill="#181818"
                  />
                </svg>
              </Link>
            </li>
            <li className={styles.user_list}>
              <Link href="/cart" className={styles.menuLink}>
                <div className={styles.cartWrapper}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.3871 5.65818C12.2425 3.47247 10.9299 2 9.02781 2C7.0812 2 5.74638 3.47247 5.6129 5.65818H4V16H14V5.65818H12.3871ZM8.99444 2.72473C10.4627 2.72473 11.4082 3.81758 11.5195 5.65818H6.4694C6.58064 3.81758 7.51502 2.72473 8.99444 2.72473ZM13.2658 15.2523H4.7119V6.40592H13.2658V15.2523Z"
                      fill="#181818"
                      stroke="#181818"
                      strokeWidth="0.1"
                    />
                  </svg>
                  {count > 0 && (
                    <span className={styles.cartBadge}>{count}</span>
                  )}
                </div>
              </Link>
            </li>
            <li className={styles.user_list}>
              {/* ✅ 여기 클릭하면 메뉴 열림/닫힘 */}
              <button
                type="button"
                style={{ cursor: "pointer" }}
                className={styles.m_menu_btn}
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4" y="5" width="10" height="0.8" fill="#181818" />
                  <rect x="4" y="12" width="10" height="0.8" fill="#181818" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ✅ 오버레이(뒤 클릭하면 닫힘) */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.open : ""}`}
        onClick={closeMenu}
      />

      {/* ✅ 메뉴 박스: open이면 left:0 */}
      <div className={`${styles.m_menu_box} ${isMenuOpen ? styles.open : ""}`}>
        <ul className={styles.list_box}>
          <li className={styles.menu}>
            <Link
              href="/shop"
              className={`${styles.menuLink} ${styles.shop}`}
              onClick={closeMenu}
            >
              <MenuSlotText text="shop" />
            </Link>
          </li>
          <li className={styles.menu}>
            <Link
              href="/"
              className={`${styles.menuLink} ${styles.archives}`}
              onClick={closeMenu}
            >
              <MenuSlotText text="archives" />
            </Link>
          </li>
          <li className={styles.menu}>
            <Link
              href="/"
              className={`${styles.menuLink} ${styles.editorial}`}
              onClick={closeMenu}
            >
              <MenuSlotText text="editorial" />
            </Link>
          </li>
          <li className={styles.menu}>
            <Link
              href="/"
              className={`${styles.menuLink} ${styles.about}`}
              onClick={closeMenu}
            >
              <MenuSlotText text="about" />
            </Link>
          </li>
          <li className={styles.menu}>
            <Link
              href="/"
              className={`${styles.menuLink} ${styles.information}`}
              onClick={closeMenu}
            >
              <MenuSlotText text="information" />
            </Link>
          </li>
        </ul>
      </div>

      <SearchPanel open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
