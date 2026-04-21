"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: string[];
  selectedCategory: string;
  onChange: (category: string) => void;
};

export default function ShopSidebar({
  categories,
  selectedCategory,
  onChange,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (c: string) => {
    // giữ logic cũ
    onChange(c);

    // giữ các query khác nếu có
    const params = new URLSearchParams(searchParams.toString());

    if (c === "all") {
      params.delete("category");
    } else {
      params.set("category", c);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="sidebar-box">
      <h6 className="sidebar-title">Danh mục</h6>

      {categories.map((c) => (
        <div
          key={c}
          className={`sidebar-item ${
            selectedCategory === c ? "active" : ""
          }`}
          onClick={() => handleClick(c)}
        >
          {c}
        </div>
      ))}

      <style jsx>{`
        .sidebar-box {
          padding: 12px;
          position: sticky;
          top: 20px;
        }

        .sidebar-title {
          font-weight: 600;
          margin-bottom: 10px;
        }

        .sidebar-item {
          padding: 6px 8px;
          font-size: 14px;
          margin-bottom: 6px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .sidebar-item:hover {
          background: #fff1ee;
          color: #ee4d2d;
        }

        .sidebar-item.active {
          background: #ffece8;
          color: #ee4d2d;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}