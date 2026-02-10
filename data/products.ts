// data/products.ts

export type ProductSize = {
  label: string;
  note?: string;
};

export type ProductDetailImage = {
  src: string;
  alt?: string;
};

export type Product = {
  slug: string; // URL에서 쓰는 유니크 slug (= baseSlug)
  baseSlug: string; // 라인 구분용 slug (shirts/pants + color)

  // 상세 페이지에서 쓰는 필드들
  category?: string;
  description?: string;
  sizes?: ProductSize[];

  name: string; // "Klassisch sleep wear shirts" | "Klassisch sleep wear pants"
  color: string; // "Water" | "Dried Cherry" ...
  colorHex: string; // 선택된 컬러칩(이 제품의 컬러) 색상
  price: string;
  image: string;

  /** 상세페이지용 full 이미지들 */
  detailImages?: ProductDetailImage[];

  group?: "new" | "more";
  relatedSlugs?: string[];
};

// 공통 옵션
const DEFAULT_CATEGORY = "things for sleep";
const DEFAULT_DESCRIPTION =
  "Made from 100% washed cotton, with a crisp and refreshing feel.";

const DEFAULT_SIZES: ProductSize[] = [
  { label: "M", note: "치수 예정" },
  { label: "L", note: "치수 예정" },
];

// 컬러 hex
const COLOR_HEX = {
  Riesling: "#FFD2CA",
  Water: "#9DAFD7",
  "French Blue": "#3A5999",
  Blueberry: "#3F475E",
  Chestnut: "#544437",
  Pistachio: "#C3B681",
  Bourbon: "#464447",
  "Dried Cherry": "#7F3337",
} as const;

/**
 * ✅ slug 규칙:
 * - shirts: klassisch-pyjama-shirts-{colorSlug}
 * - pants : klassisch-pyjama-pants-{colorSlug}
 * - slug === baseSlug (항상 유니크)
 *
 * ✅ colorSlug 규칙:
 * - 소문자 + 공백은 하이픈
 * - 예: "Dried Cherry" -> "dried-cherry"
 */
const colorToSlug = (color: string) =>
  color.trim().toLowerCase().replace(/\s+/g, "-");

const shirtsSlug = (color: string) =>
  `klassisch-pyjama-shirts-${colorToSlug(color)}`;
const pantsSlug = (color: string) =>
  `klassisch-pyjama-pants-${colorToSlug(color)}`;

export const PRODUCTS: Product[] = [
  // =========================
  // NEW ITEMS
  // =========================
  {
    baseSlug: shirtsSlug("Water"),
    slug: shirtsSlug("Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Water",
    colorHex: COLOR_HEX.Water,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Water.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "new",
    relatedSlugs: [
      pantsSlug("Water"),
      shirtsSlug("Riesling"),
      pantsSlug("Riesling"),
    ],
  },
  {
    baseSlug: pantsSlug("Water"),
    slug: pantsSlug("Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Water",
    colorHex: COLOR_HEX.Water,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Water.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "new",
    relatedSlugs: [
      shirtsSlug("Water"),
      shirtsSlug("Riesling"),
      pantsSlug("Riesling"),
    ],
  },
  {
    baseSlug: shirtsSlug("Riesling"),
    slug: shirtsSlug("Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Riesling",
    colorHex: COLOR_HEX.Riesling,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Riesling.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "new",
    relatedSlugs: [
      pantsSlug("Riesling"),
      shirtsSlug("Water"),
      pantsSlug("Water"),
    ],
  },
  {
    baseSlug: pantsSlug("Riesling"),
    slug: pantsSlug("Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Riesling",
    colorHex: COLOR_HEX.Riesling,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Riesling.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "new",
    relatedSlugs: [
      shirtsSlug("Riesling"),
      shirtsSlug("Water"),
      pantsSlug("Water"),
    ],
  },

  // =========================
  // MORE ITEMS
  // =========================
  {
    baseSlug: shirtsSlug("Blueberry"),
    slug: shirtsSlug("Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Blueberry",
    colorHex: COLOR_HEX.Blueberry,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Blueberry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "more",
    relatedSlugs: [
      pantsSlug("Blueberry"),
      shirtsSlug("Chestnut"),
      pantsSlug("Chestnut"),
    ],
  },
  {
    baseSlug: pantsSlug("Blueberry"),
    slug: pantsSlug("Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Blueberry",
    colorHex: COLOR_HEX.Blueberry,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Blueberry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "more",
    relatedSlugs: [
      shirtsSlug("Blueberry"),
      shirtsSlug("Chestnut"),
      pantsSlug("Chestnut"),
    ],
  },
  {
    baseSlug: shirtsSlug("Chestnut"),
    slug: shirtsSlug("Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Chestnut",
    colorHex: COLOR_HEX.Chestnut,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Chestnut.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "more",
    relatedSlugs: [
      pantsSlug("Chestnut"),
      shirtsSlug("Blueberry"),
      pantsSlug("Blueberry"),
    ],
  },
  {
    baseSlug: pantsSlug("Chestnut"),
    slug: pantsSlug("Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Chestnut",
    colorHex: COLOR_HEX.Chestnut,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Chestnut.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    group: "more",
    relatedSlugs: [
      shirtsSlug("Chestnut"),
      shirtsSlug("Blueberry"),
      pantsSlug("Blueberry"),
    ],
  },

  // =========================
  // 추가 컬러들 (group 없음 = shop 에서만 쓰거나 나중에 분류)
  // =========================
  {
    baseSlug: shirtsSlug("Pistachio"),
    slug: shirtsSlug("Pistachio"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Pistachio",
    colorHex: COLOR_HEX.Pistachio,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Pistachio.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],

    relatedSlugs: [
      pantsSlug("Pistachio"),
      shirtsSlug("Blueberry"),
      pantsSlug("Blueberry"),
    ],
  },
  {
    baseSlug: pantsSlug("Pistachio"),
    slug: pantsSlug("Pistachio"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Pistachio",
    colorHex: COLOR_HEX.Pistachio,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Pistachio.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: shirtsSlug("Bourbon"),
    slug: shirtsSlug("Bourbon"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Bourbon",
    colorHex: COLOR_HEX.Bourbon,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_Bourbon.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: pantsSlug("Bourbon"),
    slug: pantsSlug("Bourbon"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Bourbon",
    colorHex: COLOR_HEX.Bourbon,
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_Bourbon.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: shirtsSlug("Dried Cherry"),
    slug: shirtsSlug("Dried Cherry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "Dried Cherry",
    colorHex: COLOR_HEX["Dried Cherry"],
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_DriedCherry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: pantsSlug("Dried Cherry"),
    slug: pantsSlug("Dried Cherry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "Dried Cherry",
    colorHex: COLOR_HEX["Dried Cherry"],
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_DriedCherry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: shirtsSlug("French Blue"),
    slug: shirtsSlug("French Blue"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear shirts",
    color: "French Blue",
    colorHex: COLOR_HEX["French Blue"],
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_shirts_FrenchBlue.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
  {
    baseSlug: pantsSlug("French Blue"),
    slug: pantsSlug("French Blue"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,

    name: "Klassisch sleep wear pants",
    color: "French Blue",
    colorHex: "#B5D1BA", // 요청값 그대로
    price: "₩129,000",
    image: "/images/products/hlin_pyjama_pants_FrenchBlue.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
  },
];

/* =========================
 * DERIVED LISTS
 * ========================= */
export const NEW_ITEMS = PRODUCTS.filter((p) => p.group === "new");
export const MORE_ITEMS = PRODUCTS.filter((p) => p.group === "more");
export const SHOP_ITEMS = PRODUCTS;
