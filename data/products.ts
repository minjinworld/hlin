// data/products.ts

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductSize = {
  label: string;
  note?: string;
};

export type ProductDetailImage = {
  src: string;
  alt?: string;
};

export type Product = {
  slug: string; // URL에서 쓰는 유니크 slug
  baseSlug: string; // 기존 제품 기준 slug (라인 구분용)

  // ✅ 상세 페이지에서 쓰는 필드들
  category?: string; // product.category
  description?: string; // product.description
  colors?: ProductColor[]; // product.colors
  sizes?: ProductSize[]; // product.sizes

  name: string;
  color: string;
  price: string;
  image: string;

  /** ✅ 상세페이지용 full 이미지들 */
  detailImages?: {
    src: string;
    alt?: string;
  }[];

  group: "new" | "more";
  relatedSlugs?: string[]; // related 계산용
};

const makeSlug = (baseSlug: string, color: string) =>
  `${baseSlug}-${color.toLowerCase()}`;

// 공통 옵션(일단 전체 제품 공통으로 쓰고 싶으면 이렇게)
const DEFAULT_CATEGORY = "things for sleep";
const DEFAULT_DESCRIPTION =
  "Made from 100% washed cotton, with a crisp and refreshing feel.";

const SOLID_COLORS: ProductColor[] = [
  { name: "Riesling", hex: "#FFD2CA" },
  { name: "Water", hex: "#9DAFD7" },
  { name: "French Blue", hex: "#3A5999" },
  { name: "Blueberry", hex: "#3F475E" },
  { name: "Chestnut", hex: "#544437" },
];

const DEFAULT_SIZES: ProductSize[] = [
  { label: "M", note: "치수 예정" },
  { label: "L", note: "치수 예정" },
];

export const PRODUCTS: Product[] = [
  /* =========================
   * NEW ITEMS
   * ========================= */
  {
    baseSlug: "klassisch-pyjama-french-blue",
    slug: makeSlug("klassisch-pyjama-french-blue", "Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Water",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Water.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],
    group: "new",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-baby-pink", "Water"),
      makeSlug("klassisch-pyjama-navy", "Riesling"),
      makeSlug("klassisch-pyjama-olive", "Riesling"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-baby-pink",
    slug: makeSlug("klassisch-pyjama-baby-pink", "Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Water",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Water.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "new",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-french-blue", "Water"),
      makeSlug("klassisch-pyjama-navy", "Riesling"),
      makeSlug("klassisch-pyjama-olive", "Riesling"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-navy",
    slug: makeSlug("klassisch-pyjama-navy", "Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Riesling",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Riesling.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "new",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-olive", "Riesling"),
      makeSlug("klassisch-pyjama-french-blue", "Water"),
      makeSlug("klassisch-pyjama-baby-pink", "Water"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-olive",
    slug: makeSlug("klassisch-pyjama-olive", "Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Riesling",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Riesling.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "new",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-navy", "Riesling"),
      makeSlug("klassisch-pyjama-french-blue", "Water"),
      makeSlug("klassisch-pyjama-baby-pink", "Water"),
    ],
  },

  /* =========================
   * MORE ITEMS
   * ========================= */
  {
    baseSlug: "klassisch-pyjama-french-blue",
    slug: makeSlug("klassisch-pyjama-french-blue", "Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Blueberry",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Blueberry.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "more",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-baby-pink", "Blueberry"),
      makeSlug("klassisch-pyjama-navy", "Chestnut"),
      makeSlug("klassisch-pyjama-olive", "Chestnut"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-baby-pink",
    slug: makeSlug("klassisch-pyjama-baby-pink", "Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Blueberry",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Blueberry.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "more",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-french-blue", "Blueberry"),
      makeSlug("klassisch-pyjama-navy", "Chestnut"),
      makeSlug("klassisch-pyjama-olive", "Chestnut"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-navy",
    slug: makeSlug("klassisch-pyjama-navy", "Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Chestnut",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Chestnut.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "more",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-olive", "Chestnut"),
      makeSlug("klassisch-pyjama-french-blue", "Blueberry"),
      makeSlug("klassisch-pyjama-baby-pink", "Blueberry"),
    ],
  },
  {
    baseSlug: "klassisch-pyjama-olive",
    slug: makeSlug("klassisch-pyjama-olive", "Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    colors: SOLID_COLORS,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Chestnut",
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Chestnut.jpg",
    detailImages: [
      {
        src: "/images/products/hlin_subpage.jpg",
        alt: "detailImages",
      },
    ],

    group: "more",
    relatedSlugs: [
      makeSlug("klassisch-pyjama-navy", "Chestnut"),
      makeSlug("klassisch-pyjama-french-blue", "Blueberry"),
      makeSlug("klassisch-pyjama-baby-pink", "Blueberry"),
    ],
  },
];

/* =========================
 * DERIVED LISTS
 * ========================= */
export const NEW_ITEMS = PRODUCTS.filter((p) => p.group === "new");
export const MORE_ITEMS = PRODUCTS.filter((p) => p.group === "more");
