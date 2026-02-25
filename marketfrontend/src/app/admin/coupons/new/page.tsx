"use client";

// Route static cho tạo coupon mới.
// Tái sử dụng cùng form `EditCoupon.tsx` nhưng không có `id`,
// nên hook `useCouponDetail` sẽ xử lý ở chế độ create.

import EditCoupon from "../EditCoupon";

export default function NewCouponPage() {
  return <EditCoupon />;
}

