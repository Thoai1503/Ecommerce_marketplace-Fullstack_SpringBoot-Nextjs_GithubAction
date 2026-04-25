"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/helper/api";

const CATEGORY_API_URL = `${API_URL}/api/categories`;

export function useSubCategories(parentId: string) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${CATEGORY_API_URL}/children/${parentId}`);

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
