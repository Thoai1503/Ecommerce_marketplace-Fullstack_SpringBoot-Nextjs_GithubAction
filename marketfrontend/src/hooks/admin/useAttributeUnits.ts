"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api/attribute-unit";

export function useAttributeUnits() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= GET ALL =================
  const fetchAll = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Fetch attribute units error:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= CREATE =================
  const createAttributeUnit = async (attributeId: number, unitId: number) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attribute_id: attributeId,
          unit_id: unitId,
          status: 1,
        }),
      });

      const text = await res.text();
      console.log("CREATE ATTRIBUTE UNIT:", res.status, text);

      if (!res.ok) throw new Error(text || "Create failed");

      await fetchAll(); // 🔥 auto update UI
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    }
  };

  // ================= DELETE =================
  const deleteAttributeUnit = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      console.log("DELETE ATTRIBUTE UNIT:", res.status, text);

      if (!res.ok) throw new Error(text || "Delete failed");

      await fetchAll(); // 🔥 auto update UI
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    }
  };

  return {
    attributeUnits: data,
    isLoading,
    createAttributeUnit,
    deleteAttributeUnit,
  };
}