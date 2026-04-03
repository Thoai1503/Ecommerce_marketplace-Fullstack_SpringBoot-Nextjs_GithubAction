const BASE_URL = "http://localhost:8000/api/brands";

// ===== SLUG =====
export const generateSlug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// ===== MAP =====
const mapBrand = (item: any) => ({
  id: String(item.id),
  name: item.name,
  slug: item.slug,
  logo: item.logo,
  status: item.status === 1 ? "ACTIVE" : "HIDDEN",
});

// ===== GET ALL =====
export const getBrands = async () => {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data.map(mapBrand);
};

// ===== CREATE =====
export const createBrand = async (data: any) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      logo: data.logo ?? null,
      status: data.status,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);

  return mapBrand(JSON.parse(text));
};

// ===== UPDATE =====
export const updateBrand = async (id: string, data: any) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      status: data.status,
    }),
  });

  return mapBrand(await res.json());
};

// ===== DELETE =====
export const deleteBrand = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Delete failed");
};
