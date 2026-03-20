import { Category } from "@/types/index";

const API_URL = "http://localhost:8000/api/categories";

/* ================= HELPERS ================= */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const BASE_CATEGORIES: Category[] = [
  {
    id: "c1",
    categoryCode: "EC23818",
    name: "s",
    slug: "electronics",
    description: "Electronic devices, gadgets, and accessories.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=200&q=80",
    status: "ACTIVE",
    productStock: 125,
    attributeIds: ["attr1", "attr4"], // Brand, Weight
    createdAt: "2023-09-10T08:00:00Z",
  },
  {
    id: "c2",
    categoryCode: "FS16276",
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, shoes, and jewelry for men and women.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80",
    status: "ACTIVE",
    productStock: 340,
    attributeIds: ["attr2", "attr3"], // Color, Size
    createdAt: "2023-09-15T09:30:00Z",
  },
  {
    id: "c3",
    categoryCode: "HL49291",
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, decor, and kitchenware.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&q=80",
    status: "HIDDEN",
    productStock: 56,
    attributeIds: [],
    createdAt: "2023-09-20T10:15:00Z",
  },
  {
    id: "c4",
    categoryCode: "BT99102",
    name: "Beauty & Health",
    slug: "beauty-health",
    description: "Skincare, makeup, and health supplements.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1612817288484-9279583138e3?w=200&q=80",
    status: "ACTIVE",
    productStock: 210,
    createdAt: "2023-10-01T14:00:00Z",
  },
  {
    id: "c5",
    categoryCode: "BK10293",
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Books, magazines, and office supplies.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&q=80",
    status: "HIDDEN", // Inactive Example
    productStock: 0,
    createdAt: "2023-11-05T09:00:00Z",
  },
  {
    id: "c6",
    categoryCode: "SP88211",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Gym equipment, yoga mats, and outdoor gear.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=80",
    status: "ACTIVE",
    productStock: 89,
    createdAt: "2023-11-12T11:30:00Z",
  },
];

// Generate 60 items
const MOCK_CATEGORIES: Category[] = Array.from({ length: 60 }, (_, i) => {
  const base = BASE_CATEGORIES[i % BASE_CATEGORIES.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    name: `${base.name} ${i + 1}`,
    categoryCode: `${base.categoryCode}-${i}`,
  };
});

// --- HELPER FUNCTIONS ---

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const generateCategoryCode = (name: string): string => {
  const words = name.trim().split(/\s+/);

  const firstWord = words[0].replace(/[^a-zA-Z]/g, "");
  const secondWord = words[1] ? words[1].replace(/[^a-zA-Z]/g, "") : "";

  let prefix = "";

  if (firstWord.length >= 2) {
    prefix = firstWord.substring(0, 2).toUpperCase();
  } else if (firstWord.length === 1 && secondWord.length >= 1) {
    prefix = (firstWord + secondWord.substring(0, 1)).toUpperCase();
  } else {
    prefix = firstWord.toUpperCase().padEnd(2, "X");
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);

  return `${prefix}${randomNum}`;
};

/* ================= MAP BACKEND → FRONTEND ================= */

const mapCategory = (c: any): Category => ({
  id: String(c.id),

  name: c.category_name,

  slug: c.category_slug,

  description: "",

  thumbnailUrl: c.category_icon ? c.category_icon : "/image/no-image.png",

  status: c.is_active === 1 ? "ACTIVE" : "HIDDEN",

  productStock: 0,

  attributeIds: [],

  categoryCode: `CAT-${c.id}`,

  createdAt: c.created_at
    ? new Date(c.created_at).toISOString()
    : new Date().toISOString(),
});

/* ================= GET ALL (LEVEL = 0) ================= */

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();

  // chỉ lấy category level = 0
  const rootCategories = data.filter((c: any) => c.level === 0);

  return rootCategories.map(mapCategory);
};

/* ================= GET BY ID ================= */

export const getCategoryById = async (id: string): Promise<Category> => {
  const res = await fetch(`${API_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Category not found");
  }

  const data = await res.json();

  return mapCategory(data);
};

/* ================= CREATE ================= */

export const createCategory = async (data: any): Promise<Category> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Create category failed");
  }

  const result = await res.json();

  return mapCategory(result);
};

/* ================= UPDATE ================= */

export const updateCategory = async (
  id: string,
  data: any,
): Promise<Category> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Update category failed");
  }

  const result = await res.json();

  return mapCategory(result);
};

/* ================= DELETE ================= */

export const deleteCategory = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Delete category failed");
  }

  return true;
};
