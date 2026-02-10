import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PRODUCTS } from "@/data/products";
import styles from "./page.module.css";

// Before{라우팅 안됐던 이유}:
// type Props = { params: { slug: string } };
// export default function ProductDetailPage({ params }: Props) {
//   const incoming = params.slug;
// }

// Next.js(App Router + Turbopack 최신 규칙)가 이렇게 취급함:
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  // ✅ Next 최신 규칙: params는 Promise일 수 있음 → await로 풀기
  const { slug } = await params;

  const incoming = decodeURIComponent(slug).trim().toLowerCase();

  const product = PRODUCTS.find(
    (p) => p.slug.trim().toLowerCase() === incoming,
  );

  if (!product) return notFound();

  // ✅ 1) 같은 타입(셔츠/팬츠)만 모아서 컬러칩 생성
  const variants = PRODUCTS.filter((p) => p.name === product.name);

  // color -> hex (여긴 네가 원하면 data로 옮겨도 되는데 일단 페이지에서 써도 됨)
  const COLOR_HEX: Record<string, string> = {
    Riesling: "#FFD2CA",
    Water: "#9DAFD7",
    "French Blue": "#3A5999",
    Blueberry: "#3F475E",
    Chestnut: "#544437",
    Pistachio: "#C3B681",
    Bourbon: "#464447",
    "Dried Cherry": "#7F3337",
  };

  // ✅ 2) variants에서 컬러별로 "해당 컬러의 제품 slug" 뽑기
  const swatches = Array.from(new Set(variants.map((v) => v.color))).map(
    (colorName) => {
      const target = variants.find((v) => v.color === colorName); // 같은 name 안이라 1개면 충분
      return {
        name: colorName,
        hex: COLOR_HEX[colorName] ?? "#ddd",
        slug: target?.slug ?? product.slug, // 안전장치
      };
    },
  );

  // ✅ 3) 현재 컬러를 맨 앞으로
  swatches.sort((a, b) => {
    if (a.name === product.color) return -1;
    if (b.name === product.color) return 1;
    return a.name.localeCompare(b.name);
  });
  const related =
    product.relatedSlugs?.flatMap((s) => {
      const found = PRODUCTS.find((p) => p.slug === s);
      return found ? [found] : [];
    }) ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        {/* LEFT: hero image */}
        <section className={styles.media}>
          <Image
            src={product.image}
            alt={product.name}
            width={1200}
            height={1600}
            priority
            unoptimized
            className={styles.heroImg}
          />

          {product.description ? (
            <p className={styles.desc}>{product.description}</p>
          ) : null}
        </section>

        {/* RIGHT: product info */}
        <aside className={styles.info}>
          {product.category ? (
            <p className={styles.kicker}>{product.category}</p>
          ) : null}

          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              {product.name} - {product.color}
            </h1>
            <p className={styles.price}>{product.price}</p>
          </div>

          {/* ✅ Colors (라인별 자동 생성 + 현재 컬러 맨앞) */}
          {swatches.length ? (
            <div className={styles.block}>
              <div className={styles.rowBetween}>
                <p className={styles.label}>Solid</p>
                <p className={styles.small}>Solid - {product.color}</p>
              </div>

              <div className={styles.swatches}>
                {swatches.map((c) => {
                  const isActive = c.name === product.color;
                  return (
                    <Link
                      key={c.slug}
                      href={`/products/${c.slug}`}
                      className={styles.swatchLink}
                      aria-label={c.name}
                      title={c.name}
                      prefetch={false}
                    >
                      <span
                        className={`${styles.swatch} ${
                          isActive ? styles.swatchActive : ""
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Sizes */}
          {product.sizes?.length ? (
            <div className={styles.block}>
              <div className={styles.rowBetween}>
                <p className={styles.label}>Recommended sizes (cm):</p>
                <button type="button" className={styles.linkBtn}>
                  Size guide
                </button>
              </div>

              <div className={styles.sizes}>
                {product.sizes.map((s) => (
                  <div key={s.label} className={styles.sizeRow}>
                    <span className={styles.sizeLabel}>{s.label}</span>
                    <span className={styles.sizeNote}>{s.note ?? ""}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.linkBtnLeft}>
                View all sizes
              </button>
            </div>
          ) : null}

          {/* CTA */}
          <button className={styles.cta} type="button">
            Add to cart
          </button>

          {/* Accordions */}
          <div className={styles.accordions}>
            <button className={styles.accordion} type="button">
              <span>Details</span>
              <span>+</span>
            </button>
            <button className={styles.accordion} type="button">
              <span>Care</span>
              <span>+</span>
            </button>
            <button className={styles.accordion} type="button">
              <span>Quality and impact</span>
              <span>+</span>
            </button>
          </div>

          {/* Related */}
          {related.length ? (
            <div className={styles.related}>
              <p className={styles.relatedTitle}>Related products</p>
              <div className={styles.relatedGrid}>
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/products/${rp.slug}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedMedia}>
                      <Image
                        src={rp.image}
                        alt={rp.name}
                        width={600}
                        height={800}
                        unoptimized
                        className={styles.relatedImg}
                      />
                    </div>
                    <p className={styles.relatedName}>{rp.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      {/* DETAIL IMAGES (FULL ONLY) */}
      {product.detailImages?.length ? (
        <section className={styles.detail}>
          {product.detailImages.map((img, idx) => (
            <div key={idx} className={styles.full}>
              <Image
                src={img.src}
                alt={img.alt ?? product.name}
                width={2400}
                height={1600}
                unoptimized
                className={styles.detailImg}
              />
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}
