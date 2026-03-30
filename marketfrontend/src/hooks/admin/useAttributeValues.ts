"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/attribute-value";

export function useAttributeValues() {
  const [values, setValues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= GET ALL =================
  const fetchAll = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      setValues(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Fetch values error:", err);
      setValues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= CREATE =================
  const createValue = async (payload: any) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("CREATE VALUE:", res.status, text);

      if (!res.ok) throw new Error(text || "Create failed");

      await fetchAll(); // 🔥 auto refresh UI
    } catch (err) {
      console.error("Create value error:", err);
      throw err;
    }
  };

  // ================= DELETE =================
  const deleteValue = async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      console.log("DELETE VALUE:", res.status, text);

      if (!res.ok) throw new Error(text || "Delete failed");

      await fetchAll(); // 🔥 auto refresh
    } catch (err) {
      console.error("Delete value error:", err);
      throw err;
    }
  };

  return {
    values,
    isLoading,
    createValue,
    deleteValue,
  };
}