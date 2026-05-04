import { expect, test } from "@playwright/test";

test("approved product detail renders the performance dashboard", async ({ page }) => {
  await page.route("**/admin/products/123", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: "123",
        name: "Sản phẩm đã duyệt",
        description: "Mô tả sản phẩm đủ dài để hiển thị trong trang chi tiết.",
        sku: "APP-123",
        images: [{ image_url: "/image/no-image.png" }],
        category: "12",
        price: 250000,
        originalPrice: 300000,
        stock: 42,
        status: "APPROVED",
        sellerId: "1",
        sellerName: "Demo Shop",
        createdAt: "2026-04-01T10:00:00",
      }),
    });
  });

  await page.route("**/admin/products/123/history", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });

  await page.route("**/admin/products/123/stats?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          revenue: {
            total: 12500000,
            comparePrev: 0.15,
            trend: [{ date: "2026-04-01", value: 100000 }],
          },
          orders: { total: 12, byDayOfWeek: [1, 2, 1, 3, 2, 2, 1] },
          views: {
            total: 320,
            uniqueVisitors: 250,
            trend: [{ date: "2026-04-01", value: 20 }],
          },
          stockVelocity: { avgPerDay: 2.3, daysRemaining: 18, currentStock: 42 },
          topBuyers: [],
        },
      }),
    });
  });

  await page.goto("/admin/products/123");

  await expect(page.getByText("Hiệu suất sản phẩm")).toBeVisible();
  await expect(page.getByText("Doanh thu")).toBeVisible();
  await expect(page.getByText("Đơn hàng")).toBeVisible();
  await expect(page.getByText("Lượt xem")).toBeVisible();
  await expect(page.getByText("Tốc độ bán")).toBeVisible();
});
