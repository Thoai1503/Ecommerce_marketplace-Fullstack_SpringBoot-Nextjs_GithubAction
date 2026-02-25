"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CustomProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return loading ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "var(--primary)",
        zIndex: 9999,
        animation: "progress 1s ease-in-out infinite",
      }}
    />
  ) : null;
}
