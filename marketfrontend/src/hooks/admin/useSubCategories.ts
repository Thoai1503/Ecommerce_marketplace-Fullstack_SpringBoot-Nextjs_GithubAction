"use client";

import { useEffect, useState } from "react";

export function useSubCategories(parentId: string) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/categories/children/${parentId}`,
        );

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        setSubCategories(data);
      } catch (err) {
        console.error("Load subcategories error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parentId]);

  return { subCategories, loading };
}
