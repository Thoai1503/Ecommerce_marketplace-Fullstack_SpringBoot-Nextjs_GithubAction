"use client";

import { useRouter } from "next/navigation";

const menuItems = [
  { image: "/image/freeship.jpg", text: "Freeship", action: null },
  { image: "/image/flashsale.png", text: "Flash Sale", action: null },
  { image: "/image/mal.png", text: "Mall", action: null },
  { image: "/image/voucher.png", text: "Discount code", action: "voucher" },
  { image: "/image/all.png", text: "All", action: null },
];

export default function MenuIcons() {
  const router = useRouter();

  const handleClick = (action: string | null) => {
    if (action === "voucher") {
      router.push("/voucher");
    }
    // Các action khác có thể xử lý tương tự
  };

  return (
    <div
      className="d-flex overflow-auto gap-3 pb-2 scrollbar-thin"
      style={{
        scrollbarWidth: "thin",
        backgroundColor: "#f8f9fa",
        paddingBottom: "10px",
      }}
    >
      {menuItems.map((item, idx) => (
        <div
          key={idx}
          className="text-center flex-shrink-0"
          style={{ width: "80px", cursor: "pointer" }}
          onClick={() => handleClick(item.action)}
        >
          <div
            className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm"
            style={{ width: "65px", height: "65px" }}
          >
            <img
              src={item.image}
              alt={item.text}
              style={{
                backgroundColor: "white",
                width: "70%",
                height: "70%",
                objectFit: "contain",
              }}
            />
          </div>
          <small className="d-block text-muted">{item.text}</small>
        </div>
      ))}
    </div>
  );
}