import { useEffect, useState, useCallback } from "react";

export const useCategoryAttributes = (categoryId?: number | string) => {
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== FETCH =====
  const fetchData = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:8000/api/category-attribute/category/${categoryId}`,
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setCategoryAttributes(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // ===== ADD (BULK - CLEAN VERSION) =====
  const addAttributes = async (attributeIds: number[]) => {
    if (!categoryId || !attributeIds?.length) return;

    setAdding(true);
    setError(null);

    try {
      // 🔥 lọc attribute đã tồn tại
      const existingIds = categoryAttributes.map((item) =>
        Number(item.attributeId),
      );

      const newIds = attributeIds.filter(
        (id) => !existingIds.includes(Number(id)),
      );

      if (newIds.length === 0) return;

      const res = await fetch(
        "http://localhost:8000/api/category-attribute/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: Number(categoryId),
            attributeIds: newIds,
          }),
        },
      );

      const text = await res.text();
      console.log("STATUS:", res.status);
      console.log("RESPONSE:", text);

      if (!res.ok) throw new Error(text || "Add attributes failed");

      await fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Add failed");
    } finally {
      setAdding(false);
    }
  };

  // ===== REMOVE (optional - nên có) =====
const removeAttribute = async (id: number) => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/category-attribute/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error("Delete failed");

    setCategoryAttributes((prev) =>
      prev.filter((item) => item.id !== id)
    );

    // 🔥 optional (sync lại server)
    await fetchData();
  } catch (err) {
    console.error(err);
  }
};

  // ===== INIT =====
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categoryAttributes,
    loading,
    adding,
    error,
    refetch: fetchData,
    addAttributes,
    removeAttribute,
  };
};
