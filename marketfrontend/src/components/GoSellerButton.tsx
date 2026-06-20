"use client";

import { API_URL } from "@/helper/api";
import { useRouter } from "next/navigation";

export default function GoSellerButton() {
  const router = useRouter();

  const handleGoSeller = async () => {
    const res = await fetch(`${API_URL}/seller/createshop`, {
      credentials: "include",
    });

    if (res.status === 404) {
      router.push("/seller/createshop");
      return;
    }

    const data = await res.json();

    if (data.status === "pending") {
      router.push("/seller/waiting");
    } else {
      router.push("/seller/dashboard");
    }
  };

  return (
    <button
      onClick={handleGoSeller}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        color: "inherit",
        font: "inherit",
        lineHeight: "inherit",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      Kênh Người Bán
    </button>
  );
}
