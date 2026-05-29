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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 12,
          padding: 14,
          background: "#fff",
          border: "1px solid #e8edf5",
          borderRadius: 24,
        }}
      >
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton-category"
            style={{ padding: "8px 6px" }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                margin: "0 auto 10px",
                borderRadius: 12,
                background:
                  "linear-gradient(90deg, #f3f3f3 25%, #ececec 50%, #f3f3f3 75%)",
                animation: "skeleton-loading 1.2s infinite linear alternate",
              }}
            />
            <div
              style={{
                width: "84%",
                height: 14,
                margin: "0 auto",
                borderRadius: 8,
                background:
                  "linear-gradient(90deg, #f3f3f3 25%, #ececec 50%, #f3f3f3 75%)",
                animation: "skeleton-loading 1.2s infinite linear alternate",
              }}
            />
          </div>
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

          @media (max-width: 991px) {
            div[style*="grid-template-columns: repeat(6"] {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 640px) {
            div[style*="grid-template-columns: repeat(6"] {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              border-radius: 18px !important;
              padding: 10px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return <CategoryCarousel categories={categories} />;
};

export default CategoryFetcher;
