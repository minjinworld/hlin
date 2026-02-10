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
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>{product.price}</p>
          </div>

          {/* Colors */}
          {product.colors?.length ? (
            <div className={styles.block}>
              <div className={styles.rowBetween}>
                <p className={styles.label}>Solid</p>
                <p className={styles.small}>Solid - {product.colors[0].name}</p>
              </div>

              <div className={styles.swatches}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    className={styles.swatch}
                    type="button"
                    aria-label={c.name}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
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
