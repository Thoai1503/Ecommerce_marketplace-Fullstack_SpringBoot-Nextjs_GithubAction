"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/helper/api";

const CATEGORY_API_URL = `${API_URL}/api/categories`;

export function useSubCategories(parentId: string) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!parentId) {
      setSubCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${CATEGORY_API_URL}/children/${parentId}`);

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      setSubCategories(data);
    } catch (err) {
      console.error("Load subcategories error:", err);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { subCategories, loading, refresh: fetchData };
}
