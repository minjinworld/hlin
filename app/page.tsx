"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import ProductCard from "@/components/product/ProductCard";

import { NEW_ITEMS, MORE_ITEMS } from "@/data/products";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = async () => {
    const v = videoRef.current;
    if (!v) return;

    // 클릭은 사용자 제스처라 소리 재생 허용됨
    v.muted = !v.muted;
    setIsMuted(v.muted);

    // 일부 브라우저에서 muted 해제 후 play 재호출이 필요할 때가 있음
    try {
      await v.play();
    } catch {
      // 무시 (정책/상황에 따라 실패할 수 있음)
    }
  };

  return (
    <main className={styles.main}>
      {/* 1) Banner */}
      <section className={styles.banner}>
        <div
          className={styles.bannerWrap}
          aria-hidden="true"
          onClick={toggleSound}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleSound();
          }}
          style={{ cursor: "pointer" }}
        >
          <video
            ref={videoRef}
            className={styles.bannerVideo}
            src="/videos/pallet_move_left_audio.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
        </div>{" "}
      </section>

      <div className={styles.container}>
        {/* 2) Brand short description */}
        <section className={styles.brand}>
          <h2 className={styles.sectionTitle}>
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
          </h2>
          <p className={styles.brandText}>
            Things do not always belong to just one place. Some are worn indoors
            and taken outside, others come back home together. We are the same.
            Sometimes we appear at ease, and other times, we prefer to remain a
            little unfinished. <b>Hlín</b> will always be there with you.
          </p>
        </section>

        {/* 3) New arrivals */}
        <section className={styles.new}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>New</h2>
            <Link className={styles.sectionLink} href="/products">
              View all
            </Link>
          </div>

          <div className={styles.grid}>
            {NEW_ITEMS.map((item) => (
              <ProductCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                color={item.color}
                price={item.price}
                image={item.image}
                priority
              />
            ))}
          </div>
        </section>

        {/* 4) More arrivals */}
        <section className={styles.more}>
          <div className={styles.grid}>
            {MORE_ITEMS.map((item) => (
              <ProductCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                color={item.color}
                price={item.price}
                image={item.image}
                priority
              />
            ))}
          </div>

          <div className={styles.more_image}>
            <Image
              src="/images/visual/hlin_visual_image_12.PNG"
              alt="Hlín visual"
              width={1024}
              height={1536}
              className={styles.moreImg}
              unoptimized
              priority
            />
          </div>
        </section>

        {/* 4) Visual image */}
        <section className={styles.visual}>
          <div className={styles.visualMedia}>
            <Image
              src="/images/visual/hlin_visual_image_8.PNG"
              alt="Hlín visual"
              width={1024}
              height={1536}
              className={styles.visualImg}
              unoptimized
              priority
            />
            <Image
              src="/images/visual/hlin_visual_image_15.jpg"
              alt="Hlín visual"
              width={1024}
              height={1536}
              className={styles.visualImg}
              unoptimized
              priority
            />
            <Image
              src="/images/visual/hlin_visual_image_2.PNG"
              alt="Hlín visual"
              width={1024}
              height={1536}
              className={styles.visualImg}
              unoptimized
              priority
            />
          </div>
        </section>
      </div>
    </main>
  );
}
