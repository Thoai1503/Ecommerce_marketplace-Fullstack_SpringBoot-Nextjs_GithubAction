# Phase 4 Status-Specific Enhancements Output

## SQL Migrations

- `migrate_product_hide_audit.sql`
- `migrate_product_views.sql`
- `migrate_product_fraud_check.sql`

These migrations were created in `Marketplace-platform/`. They were not executed here because the local shell does not have a `mysql` client in `PATH`.

## Sample API Responses

### `PATCH /admin/products/42/status`

Request:

```json
{ "status": "HIDDEN", "reason": "Vi phạm quy định về hình ảnh sản phẩm" }
```

Response:

```json
{
  "id": "42",
  "status": "HIDDEN",
  "hiddenAt": "2026-04-26T14:32:00",
  "hiddenBy": 1,
  "hiddenByName": "Admin System",
  "hiddenReason": "Vi phạm quy định về hình ảnh sản phẩm",
  "hiddenByRole": "ADMIN"
}
```

### `GET /admin/products/42/stats?days=30`

```json
{
  "data": {
    "revenue": {
      "total": 12500000,
      "trend": [{ "date": "2026-04-01", "value": 100000 }],
      "comparePrev": 0.15
    },
    "orders": {
      "total": 234,
      "byDayOfWeek": [10, 15, 12, 20, 30, 90, 57]
    },
    "views": {
      "total": 1200,
      "uniqueVisitors": 980,
      "trend": [{ "date": "2026-04-01", "value": 35 }]
    },
    "stockVelocity": {
      "avgPerDay": 2.3,
      "daysRemaining": 15,
      "currentStock": 35
    },
    "topBuyers": [
      { "userId": 1, "name": "Nguyen A", "orderCount": 5, "totalSpent": 500000 }
    ]
  }
}
```

### `GET /admin/products/42/fraud-check`

```json
{
  "data": {
    "productId": 42,
    "fraudScore": 55,
    "concerns": [
      "Giá thấp bất thường so với danh mục",
      "Seller mới đăng sản phẩm giá trị cao"
    ],
    "recommendation": "review",
    "reasoning": "Phát hiện 2 dấu hiệu cần kiểm tra thủ công.",
    "checkedBy": "heuristic",
    "triggeredRules": [
      {
        "rule": "suspicious_low_price",
        "severity": "medium",
        "message": "Giá thấp bất thường so với danh mục",
        "score": 15
      }
    ]
  }
}
```

## Mock Wireframes

### REJECTED Quality Warnings

```text
┌──────────────────────────────────────┐
│ Phân tích chất lượng          4 vấn đề│
├──────────────────────────────────────┤
│ ! Không có hình ảnh sản phẩm          │
│   Gợi ý: Thêm ít nhất 1 hình ảnh      │
│ ! Mô tả sản phẩm quá ngắn             │
│   Gợi ý: Mô tả nên có ít nhất 50 ký tự│
└──────────────────────────────────────┘
```

### HIDDEN Audit Trail

```text
┌──────────────────────────────────────┐
│ Đang ẩn                               │
│ Đã ẩn lúc: 26/04/2026 14:32           │
│ Bởi: Admin System (ADMIN)             │
│ Lý do: Vi phạm quy định hình ảnh      │
│ [Hiện lại -> Đang bán]                │
└──────────────────────────────────────┘
```

### APPROVED Performance Dashboard

```text
┌──────────────────────────────────────┐
│ Hiệu suất sản phẩm       [30 ngày] ⟳  │
├──────────────────┬───────────────────┤
│ Doanh thu        │ Đơn hàng          │
│ 12.500.000 ₫     │ 234               │
├──────────────────┼───────────────────┤
│ Lượt xem         │ Tốc độ bán        │
│ 1.200            │ 2.3 SP/ngày       │
└──────────────────┴───────────────────┘
```

### PENDING AI Fraud Warning

```text
┌──────────────────────────────────────┐
│ AI Fraud Detection                    │
│ Risk Score: ███████░░░ 55/100         │
│ Khuyến nghị: Review kỹ                │
│ • Giá thấp bất thường                 │
│ • Seller mới đăng sản phẩm giá trị cao│
│ [Xem phân tích chi tiết]              │
└──────────────────────────────────────┘
```
