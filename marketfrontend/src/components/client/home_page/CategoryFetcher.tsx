"use client";
import React, { useEffect, useState } from "react";
import CategoryCarousel from "./CategoryCarousel";
import { INTERNAL_API } from "@/helper/api";

function unwrapCollection(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

const CategoryFetcher: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${INTERNAL_API}/api/categories`);
        const data = await res.json();
        const cats = Array.isArray(data) ? data : data.data;
        const parentCategories = cats
          .filter(
            (c: any) => Number(c.level) === 0 && Number(c.is_active) === 1,
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
        setCategories(parentCategories);
      } catch (e) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton-category"
            style={{
              width: 120,
              height: 60,
              borderRadius: 12,
              background:
                "linear-gradient(90deg, #f3f3f3 25%, #ececec 50%, #f3f3f3 75%)",
              animation: "skeleton-loading 1.2s infinite linear alternate",
            }}
          />
        ))}
        <style jsx>{`
          @keyframes skeleton-loading {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return <CategoryCarousel categories={categories} />;
};

export default CategoryFetcher;
