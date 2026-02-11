// data/products.ts

/* =========================
 * TYPES
 * ========================= */

export type ProductSize = {
  label: string;
  note?: string;
};

export type ProductDetailImage = {
  src: string;
  alt?: string;
};

export type ColorPaletteKey = "solid"; // 나중에 확장 가능

export type ColorSwatch = {
  name: string;
  hex: string;
};

export type Product = {
  inStock?: boolean; // 재고 여부
  slug: string; // URL 유니크 slug
  baseSlug: string; // 라인 구분 slug

  category?: string;
  description?: string;
  sizes?: ProductSize[];

  name: string;
  color: string;
  colorHex: string;
  price: string;
  image: string;

  detailImages?: ProductDetailImage[];

  paletteKey?: ColorPaletteKey; // ✅ 컬러칩 순서 기준

  group?: "new" | "more";
  relatedSlugs?: string[];
};

/* =========================
 * COLOR PALETTE (칩 순서 기준)
 * ========================= */

export const COLOR_PALETTES: Record<ColorPaletteKey, ColorSwatch[]> = {
  solid: [
    { name: "Riesling", hex: "#FFD2CA" },
    { name: "Water", hex: "#9DAFD7" },
    { name: "French Blue", hex: "#3A5999" },
    { name: "Blueberry", hex: "#3F475E" },
    { name: "Pistachio", hex: "#C3B681" },
    { name: "Pear", hex: "#B5D1BA" },
    { name: "Chestnut", hex: "#544437" },
    { name: "Bourbon", hex: "#464447" },
    { name: "Dried Cherry", hex: "#7F3337" },
  ],
};

/* =========================
 * DEFAULT OPTIONS
 * ========================= */

const DEFAULT_CATEGORY = "things for sleep";

const DEFAULT_DESCRIPTION =
  "Made from 100% washed cotton, with a crisp and refreshing feel.";

const DEFAULT_SIZES: ProductSize[] = [
  { label: "M", note: "Size details will be updated soon." },
  { label: "L", note: "Size details will be updated soon." },
];

/* =========================
 * COLOR HEX MAP
 * ========================= */

const COLOR_HEX = {
  Riesling: "#FFD2CA",
  Water: "#9DAFD7",
  "French Blue": "#3A5999",
  Blueberry: "#3F475E",
  Chestnut: "#544437",
  Pistachio: "#C3B681",
  Bourbon: "#464447",
  "Dried Cherry": "#7F3337",
  Pear: "#B5D1BA",
} as const;

/* =========================
 * SLUG HELPERS
 * ========================= */

const colorToSlug = (color: string) =>
  color.trim().toLowerCase().replace(/\s+/g, "-");

const shirtsSlug = (color: string) =>
  `klassisch-pyjama-shirts-${colorToSlug(color)}`;

const pantsSlug = (color: string) =>
  `klassisch-pyjama-pants-${colorToSlug(color)}`;

/* =========================
 * PRODUCTS
 * ========================= */

export const PRODUCTS: Product[] = [
  // =========================
  // NEW ITEMS
  // =========================

  {
    inStock: true,
    baseSlug: shirtsSlug("Water"),
    slug: shirtsSlug("Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Water",
    colorHex: COLOR_HEX.Water,
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Water.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
    group: "new",
    relatedSlugs: [
      pantsSlug("Water"),
      shirtsSlug("Riesling"),
      pantsSlug("Riesling"),
    ],
  },

  {
    inStock: true,
    baseSlug: pantsSlug("Water"),
    slug: pantsSlug("Water"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Water",
    colorHex: COLOR_HEX.Water,
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Water.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
    group: "new",
    relatedSlugs: [
      shirtsSlug("Water"),
      shirtsSlug("Riesling"),
      pantsSlug("Riesling"),
    ],
  },

  {
    inStock: false,
    baseSlug: shirtsSlug("Riesling"),
    slug: shirtsSlug("Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Riesling",
    colorHex: COLOR_HEX.Riesling,
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Riesling.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
    group: "new",
    relatedSlugs: [
      pantsSlug("Riesling"),
      shirtsSlug("Water"),
      pantsSlug("Water"),
    ],
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Riesling"),
    slug: pantsSlug("Riesling"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Riesling",
    colorHex: COLOR_HEX.Riesling,
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Riesling.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
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
    inStock: false,
    baseSlug: shirtsSlug("Blueberry"),
    slug: shirtsSlug("Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Blueberry",
    colorHex: COLOR_HEX.Blueberry,
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Blueberry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
    group: "more",
    relatedSlugs: [
      pantsSlug("Blueberry"),
      shirtsSlug("Chestnut"),
      pantsSlug("Chestnut"),
    ],
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Blueberry"),
    slug: pantsSlug("Blueberry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Blueberry",
    colorHex: COLOR_HEX.Blueberry,
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Blueberry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
    group: "more",
    relatedSlugs: [
      shirtsSlug("Blueberry"),
      shirtsSlug("Chestnut"),
      pantsSlug("Chestnut"),
    ],
  },

  // =========================
  // EXTRA COLORS
  // =========================

  {
    inStock: false,
    baseSlug: shirtsSlug("Pistachio"),
    slug: shirtsSlug("Pistachio"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Pistachio",
    colorHex: COLOR_HEX.Pistachio,
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Pistachio.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Pistachio"),
    slug: pantsSlug("Pistachio"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Pistachio",
    colorHex: COLOR_HEX.Pistachio,
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Pistachio.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: shirtsSlug("French Blue"),
    slug: shirtsSlug("French Blue"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "French Blue",
    colorHex: COLOR_HEX["French Blue"],
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_FrenchBlue.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("French Blue"),
    slug: pantsSlug("French Blue"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "French Blue",
    colorHex: "#B5D1BA", // 예외값 유지
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_FrenchBlue.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },
  {
    inStock: false,
    baseSlug: shirtsSlug("Chestnut"),
    slug: shirtsSlug("Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Chestnut",
    colorHex: COLOR_HEX["Chestnut"],
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Chestnut.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Chestnut"),
    slug: pantsSlug("Chestnut"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Chestnut",
    colorHex: "#544437", // 예외값 유지
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Chestnut.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },
  {
    inStock: false,
    baseSlug: shirtsSlug("Dried Cherry"),
    slug: shirtsSlug("Dried Cherry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Dried Cherry",
    colorHex: COLOR_HEX["Dried Cherry"],
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_DriedCherry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Dried Cherry"),
    slug: pantsSlug("Dried Cherry"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Dried Cherry",
    colorHex: "#7F3337", // 예외값 유지
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_DriedCherry.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },
  {
    inStock: false,
    baseSlug: shirtsSlug("Bourbon"),
    slug: shirtsSlug("Bourbon"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Bourbon",
    colorHex: COLOR_HEX["Bourbon"],
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Bourbon.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Bourbon"),
    slug: pantsSlug("Bourbon"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Bourbon",
    colorHex: "#464447", // 예외값 유지
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Bourbon.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },
  {
    inStock: false,
    baseSlug: shirtsSlug("Pear"),
    slug: shirtsSlug("Pear"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear shirts",
    color: "Pear",
    colorHex: COLOR_HEX["Pear"],
    price: "89,000",
    image: "/images/products/hlin_pyjama_shirts_Pear.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },

  {
    inStock: false,
    baseSlug: pantsSlug("Pear"),
    slug: pantsSlug("Pear"),
    category: DEFAULT_CATEGORY,
    description: DEFAULT_DESCRIPTION,
    sizes: DEFAULT_SIZES,
    name: "Klassisch sleep wear pants",
    color: "Pear",
    colorHex: "#B5D1BA", // 예외값 유지
    price: "89,000",
    image: "/images/products/hlin_pyjama_pants_Pear.jpg",
    detailImages: [{ src: "/images/products/hlin_subpage.jpg", alt: "detail" }],
    paletteKey: "solid",
  },
];

/* =========================
 * DERIVED LISTS
 * ========================= */

export const NEW_ITEMS = PRODUCTS.filter((p) => p.group === "new");
export const MORE_ITEMS = PRODUCTS.filter((p) => p.group === "more");
export const SHOP_ITEMS = PRODUCTS;
