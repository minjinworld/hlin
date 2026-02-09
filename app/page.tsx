import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* 1) Banner */}
      <section className={styles.banner}>
        {/* 배너 이미지(있으면) */}
        <div className={styles.bannerWrap} aria-hidden="true">
          {/* <Image
            src="/images/visual/main_banner_0.jpg"
            alt=""
            width={3840}
            height={1400}
            className={styles.bannerImg}
            unoptimized
            priority
          /> */}
          <video
            className={styles.bannerVideo}
            src="/videos/pallet_move_left.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
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
            {/* 더미 카드 4개 (나중에 ProductCard로 교체 가능) */}
            {NEW_ITEMS.map((item) => (
              <Link
                key={item.slug}
                // href={`/products/${item.slug}`
                href="#"
                className={styles.card}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={1024}
                    height={1536}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    unoptimized
                    priority
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>
                    {item.name} - {item.color}
                  </p>
                  <p className={styles.cardMeta}>{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4) More arrivals */}
        <section className={styles.more}>
          <div className={styles.grid}>
            {/* 더미 카드 4개 (나중에 ProductCard로 교체 가능) */}
            {MORE_ITEMS.map((item) => (
              <Link
                key={item.slug}
                // href={`/products/${item.slug}`
                href="#"
                className={styles.card}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={1024}
                    height={1536}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    unoptimized
                    priority
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>
                    {item.name} - {item.color}
                  </p>
                  <p className={styles.cardMeta}>{item.price}</p>
                </div>
              </Link>
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

const NEW_ITEMS = [
  {
    slug: "klassisch-pyjama-french-blue",
    name: "Klassisch sleep wear shirts",
    color: "Water",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Water.png",
  },
  {
    slug: "klassisch-pyjama-baby-pink",
    name: "Klassisch sleep wear pants",
    color: "Water",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Water.png",
  },
  {
    slug: "klassisch-pyjama-navy",
    name: "Klassisch sleep wear shirts",
    color: "Riesling",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Riesling.png",
  },
  {
    slug: "klassisch-pyjama-olive",
    name: "Klassisch sleep wear pants",
    color: "Riesling",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Riesling.png",
  },
];

const MORE_ITEMS = [
  {
    slug: "klassisch-pyjama-french-blue",
    name: "Klassisch sleep wear shirts",
    color: "Blueberry",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Blueberry.png",
  },
  {
    slug: "klassisch-pyjama-baby-pink",
    name: "Klassisch sleep wear pants",
    color: "Blueberry",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Blueberry.png",
  },
  {
    slug: "klassisch-pyjama-navy",
    name: "Klassisch sleep wear shirts",
    color: "Chestnut",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Chestnut.png",
  },
  {
    slug: "klassisch-pyjama-olive",
    name: "Klassisch sleep wear pants",
    color: "Chestnut",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Chestnut.png",
  },
];
