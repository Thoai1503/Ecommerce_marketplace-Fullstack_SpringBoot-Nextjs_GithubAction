<<<<<<< HEAD
// service/attributes.ts

import { API_URL } from "@/helper/api";

// const BASE_URL = "http://localhost:8000/api/attribute";

// ================= MAP =================
const mapAttribute = (item: any) => ({
  id: String(item.id),
  name: item.name,
  slug: item.slug,
  status: item.status === 1 ? "ACTIVE" : "HIDDEN",
});

// ================= GET ALL =================
export const getAttributes = async () => {
  const res = await fetch(`${API_URL}/api/attributes`);
  if (!res.ok) throw new Error("Fetch failed");

  const data = await res.json();
  return data.map(mapAttribute);
};

// ================= GET BY ID =================
export const getAttributeById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/attributes/${id}`);
  if (!res.ok) throw new Error("Not found");

  const data = await res.json();
  return mapAttribute(data);
};

// ================= CREATE =================
export const createAttribute = async (data: any) => {
  const res = await fetch(`${API_URL}/api/attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      slug: data.name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      status: 1,
    }),
  });

  const result = await res.json();
  return mapAttribute(result);
};

// ================= UPDATE =================
export const updateAttribute = async (id: string, data: any) => {
  // lấy dữ liệu hiện tại
  const current = await getAttributeById(id);

  const isActive = current.status === "ACTIVE";

  const res = await fetch(`${API_URL}/api/attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name ?? current.name,
      slug: data.name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      status:
        data.published !== undefined
          ? data.published
            ? 1
            : 0
          : isActive
            ? 1
            : 0,
    }),
  });

  const result = await res.json();
  return mapAttribute(result);
};

// ================= DELETE =================
export const deleteAttribute = async (id: string) => {
  const res = await fetch(`${API_URL}/api/attributes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete failed");
  return true;
};

// ================= VALUE (TẠM) =================
export const createAttributeValue = async () => [];
export const updateAttributeValue = async () => [];
export const deleteAttributeValue = async () => [];
=======
// service/attributes.ts

import { API_URL } from "@/helper/api";

// Legacy hardcoded API URL removed; use API_URL from helper.

// ================= MAP =================
const mapAttribute = (item: any) => ({
  id: String(item.id),
  name: item.name,
  slug: item.slug,
  status: item.status === 1 ? "ACTIVE" : "HIDDEN",
});

// ================= GET ALL =================
export const getAttributes = async () => {
  const res = await fetch(`${API_URL}/api/attributes`);
  if (!res.ok) throw new Error("Fetch failed");

  const data = await res.json();
  return data.map(mapAttribute);
};

// ================= GET BY ID =================
export const getAttributeById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/attributes/${id}`);
  if (!res.ok) throw new Error("Not found");

  const data = await res.json();
  return mapAttribute(data);
};

// ================= CREATE =================
export const createAttribute = async (data: any) => {
  const res = await fetch(`${API_URL}/api/attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      slug: data.name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      status: 1,
    }),
  });

  const result = await res.json();
  return mapAttribute(result);
};

// ================= UPDATE =================
export const updateAttribute = async (id: string, data: any) => {
  // lấy dữ liệu hiện tại
  const current = await getAttributeById(id);

  const isActive = current.status === "ACTIVE";

  const res = await fetch(`${API_URL}/api/attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name ?? current.name,
      slug: data.name
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      status:
        data.published !== undefined
          ? data.published
            ? 1
            : 0
          : isActive
            ? 1
            : 0,
    }),
  });

  const result = await res.json();
  return mapAttribute(result);
};

// ================= DELETE =================
export const deleteAttribute = async (id: string) => {
  const res = await fetch(`${API_URL}/api/attributes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete failed");
  return true;
};

// ================= VALUE (TẠM) =================
export const createAttributeValue = async () => [];
export const updateAttributeValue = async () => [];
export const deleteAttributeValue = async () => [];
>>>>>>> c9d4b1976cb5b3a10edc460d55b593d2cd8808dc
