import { Category } from "@/types/index";

const API_URL = "http://localhost:8000/api/categories";

/* ================= HELPERS ================= */

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
  data: any
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