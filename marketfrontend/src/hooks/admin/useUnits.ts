"use client";

import { useEffect, useState } from "react";

export type Unit = {
  id: string;
  label: string;
  symbol: string;
  status: "ACTIVE" | "INACTIVE";
};

const API_URL = "http://localhost:8000/api/unit";

// ================= MAP =================
const mapUnit = (u: any): Unit => ({
  id: String(u.id ?? ""),
  label: u.label ?? "",
  symbol: u.symbol ?? "",
  status: u.status === 1 ? "ACTIVE" : "INACTIVE",
});

// ================= HOOK =================
export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ================= GET ALL =================
  const fetchUnits = async () => {
    try {
      const res = await fetch(API_URL);

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      setUnits(Array.isArray(data) ? data.map(mapUnit) : []);
    } catch (err) {
      console.error("Fetch units error:", err);
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // ================= CREATE =================
  const createUnit = async (data: Partial<Unit>) => {
    setIsSaving(true);

    try {
      const payload = {
        label: data.label ?? "",
        symbol: data.symbol ?? "",
        status: data.status === "ACTIVE" ? 1 : 0,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("CREATE RESPONSE:", res.status, text);

      if (!res.ok) throw new Error(text || "Create failed");

      await fetchUnits();
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // ================= UPDATE =================
  const updateUnit = async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<Unit>;
  }) => {
    setIsSaving(true);

    try {
      const payload = {
        label: data.label ?? "",
        symbol: data.symbol ?? "",
        status: data.status === "ACTIVE" ? 1 : 0,
      };

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("UPDATE RESPONSE:", res.status, text);

      if (!res.ok) throw new Error(text || "Update failed");

      await fetchUnits();
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteUnit = async (id: string) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      console.log("DELETE RESPONSE:", res.status, text);

      if (!res.ok) throw new Error(text || "Delete failed");

      await fetchUnits();
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    units,
    isLoading,
    isDeleting,
    isSaving,
    createUnit,
    updateUnit,
    deleteUnit,
  };
}
