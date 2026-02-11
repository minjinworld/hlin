import Link from "next/link";
import Image from "next/image";
import styles from "./ProductCard.module.css";

type Props = {
  slug: string;
  name: string;
  color: string;
  price: string;
  image: string;
  priority?: boolean;
  sizes?: string;
};

export default function ProductCard({
  slug,
  name,
  color,
  price,
  image,
  priority = false,
  sizes = "(max-width: 900px) 50vw, 25vw",
}: Props) {
  return (
    <Link href={`/products/${slug}`} className={styles.card}>
      <div className={styles.cardMedia}>
        <Image
          src={image}
          alt={name}
          width={1024}
          height={1536}
          sizes={sizes}
          unoptimized
          priority={priority}
          className={styles.cardImg}
        />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardName}>
          {name} - {color}
        </p>
        <p className={styles.cardMeta}>
          <span className={styles.krw}>₩</span>
          {price}
        </p>
      </div>
    </Link>
  );
}
