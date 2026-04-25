import { API_URL } from "@/helper/api";
import { Unit } from "@/types";

//const API_URL = "http://localhost:8000/api/unit";

// ================= GET ALL =================
export const getUnits = async (): Promise<Unit[]> => {
  const res = await fetch(`${API_URL}/api/units`);

  if (!res.ok) throw new Error("Fetch failed");

  const data = await res.json(); 

  // map backend → frontend
  return data.map((u: any) => ({
    id: String(u.id),
    label: u.label,
    symbol: u.symbol,
    status: u.status === 1 ? "ACTIVE" : "INACTIVE",
    type: u.type,
    createdAt: u.createdAt,
  }));
};

// ================= GET BY ID =================
export const getUnitById = async (id: string): Promise<Unit> => {
  const res = await fetch(`${API_URL}/api/units/${id}`);

  if (!res.ok) throw new Error("Not found");

  const u = await res.json();

  return {
    id: String(u.id),
    label: u.label,
    symbol: u.symbol,
    status: u.status === 1 ? "ACTIVE" : "INACTIVE",
    type: u.type,
    createdAt: u.createdAt,
  };
};

// ================= CREATE =================
export const createUnit = async (data: Partial<Unit>): Promise<Unit> => {
  const res = await fetch(`${API_URL}/api/units`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      label: data.label,
      symbol: data.symbol,
      status: data.status === "ACTIVE" ? 1 : 0,
    }),
  });

  const text = await res.text();
  console.log("CREATE:", res.status, text);

  if (!res.ok) throw new Error(text);

  return JSON.parse(text);
};

// ================= UPDATE =================
export const updateUnit = async (
  id: string,
  data: Partial<Unit>,
): Promise<Unit> => {
  const res = await fetch(`${API_URL}/api/units/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      label: data.label,
      symbol: data.symbol,
      status: data.status === "ACTIVE" ? 1 : 0,
    }),
  });

  const text = await res.text();
  console.log("UPDATE:", res.status, text);

  if (!res.ok) throw new Error(text);

  return JSON.parse(text);
};

// ================= DELETE =================
export const deleteUnit = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API_URL}/api/units/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  console.log("DELETE:", res.status, text);

  if (!res.ok) throw new Error(text);

  return true;
};
