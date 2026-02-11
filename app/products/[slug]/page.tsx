import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PRODUCTS, COLOR_PALETTES } from "@/data/products";
import styles from "./page.module.css";
import CartButton from "@/components/product/CartButton";
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const incoming = decodeURIComponent(slug).trim().toLowerCase();

  const product = PRODUCTS.find(
    (p) => p.slug.trim().toLowerCase() === incoming,
  );

  if (!product) return notFound();

  // ✅ 1) 같은 타입(셔츠/팬츠)만 모아서 컬러칩 생성
  const variants = PRODUCTS.filter((p) => p.name === product.name);

  // ✅ 2) 데이터에 정의한 팔레트 순서대로 swatches 생성 (순서 고정)
  const paletteKey = product.paletteKey ?? "solid";
  const palette = COLOR_PALETTES[paletteKey] ?? COLOR_PALETTES.solid;

  const swatches = palette
    .map((c) => {
      const target = variants.find((v) => v.color === c.name);
      if (!target) return null; // 이 타입에 해당 컬러 제품이 없으면 칩 숨김
      return { name: c.name, hex: c.hex, slug: target.slug };
    })
    .filter(Boolean) as { name: string; hex: string; slug: string }[];

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
            <p className={styles.kicker}>: {product.category}</p>
          ) : null}
          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              {product.name} - {product.color}
            </h1>

            <p className={styles.price}>
              <span className={styles.krw}>₩</span>
              {product.price}
            </p>
          </div>
          {/* ✅ Colors (팔레트 순서 고정 + active는 테두리만) */}
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
                        className={`${styles.swatch} ${isActive ? styles.swatchActive : ""}`}
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
                <p className={styles.label}>Size guide (cm):</p>
                {/* <button type="button" className={styles.linkBtn}>
                  Size guide
                </button> */}
              </div>

              <div className={styles.sizes}>
                {product.sizes.map((s) => (
                  <div key={s.label} className={styles.sizeRow}>
                    <span className={styles.sizeLabel}>{s.label}</span>
                    <span className={styles.sizeNote}>{s.note ?? ""}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {/* CTA */}
          <CartButton
            slug={product.slug}
            inStock={product.inStock ?? false}
          />{" "}
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
