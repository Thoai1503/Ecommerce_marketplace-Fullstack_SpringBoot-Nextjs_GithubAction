# Ecommerce Voucher & Refund Refactor Strategy

## Mục tiêu

Document này mô tả:

- nghiệp vụ voucher hiện tại
- các vấn đề của implementation cũ
- workflow chuẩn cho ecommerce production
- chiến lược refactor
- rule tính toán voucher/refund
- workflow return/recalculate
- architecture recommendation
- checklist để AI Agent có thể refactor code an toàn

Document giả định:

- Database đã tồn tại
- Hệ thống đang có:
  - Order
  - OrderShipment
  - OrderItem
  - Shop Voucher
  - Platform Voucher
- Hệ thống support:
  - Multi shop
  - Partial return
  - Refund

---

# I. Business Flow Hiện Tại

## 1. Order Structure

```text
Order
 ├── Shipment A (Shop A)
 │      ├── Item A1
 │      ├── Item A2
 │      └── Shop Voucher
 │
 ├── Shipment B (Shop B)
 │      ├── Item B1
 │      └── Shop Voucher
 │
 └── Platform Voucher
```

---

## 2. Pricing Flow

```text
Item subtotal
    -> Apply shop voucher per shipment
        -> shipment final subtotal

Combine all shipment subtotals
    -> Apply platform voucher
        -> order final total
```

---

# II. Các Vấn Đề Trong Implementation Cũ

## 1. Voucher chưa allocate xuống item

Triệu chứng:

- chỉ lưu shipment discount
- chỉ lưu order discount
- không biết item nào ăn bao nhiêu voucher

Hậu quả:

- partial return sai
- refund sai
- accounting sai
- analytics sai

---

## 2. Refund theo unit price

Sai:

```text
refund = item unit price
```

Đúng:

```text
refund = actual paid contribution
```

---

## 3. Không recalculate voucher

Sai:

- trả item nhưng vẫn giữ nguyên voucher

Đúng:

- rebuild effective order
- recalculate voucher conditions
- compare delta

---

## 4. Không support multiple return requests

Sai:

- recalculate từ original order mỗi lần

Đúng:

```text
effective order
=
original order
- all approved returned items
```

---

# III. Refactor Goals

AI Agent cần refactor để:

1. Voucher allocation xuống item
2. Recalculate workflow chuẩn
3. Partial quantity return
4. Multiple return requests
5. Immutable pricing snapshot
6. Accounting consistency
7. Rounding consistency
8. Production-safe calculations

---

# IV. Pricing Concepts

# 1. Item Subtotal

```text
subtotal = unit_price * quantity
```

---

# 2. Shipment Total

```text
shipment_subtotal
= sum(item subtotals)
```

---

# 3. Shop Voucher

Áp trên shipment.

```text
shipment_after_shop_discount
=
shipment_subtotal - shop_discount
```

---

# 4. Platform Voucher

Áp sau shop voucher.

```text
order_final
=
sum(shipment_after_shop_discount)
- platform_discount
```

---

# V. Discount Allocation Rules

# 1. Shop Voucher Allocation

Allocate theo tỷ lệ item subtotal.

Formula:

```text
item_shop_discount
=
(item_subtotal / shipment_subtotal)
* shop_discount
```

---

# 2. Platform Voucher Allocation

Allocate theo:

```text
amount_after_shop_discount
```

Formula:

```text
item_platform_discount
=
(item_after_shop_discount / eligible_total)
* platform_discount
```

---

# 3. Item Final Paid

```text
item_final_paid
=
item_subtotal
- allocated_shop_discount
- allocated_platform_discount
```

---

# VI. Rounding Strategy

AI Agent PHẢI dùng strategy sau.

## Không được dùng round trực tiếp

Sai:

```text
round(raw)
```

Vì có thể overflow voucher.

---

## Strategy đúng

### Step 1

```text
floor2(raw)
```

### Step 2

Cộng allocatedSum.

### Step 3

```text
remainder = voucher - allocatedSum
```

### Step 4

Add remainder vào item cuối.

---

# VII. Refund/Recalculate Workflow

# Golden Rule

KHÔNG refund theo item price.

PHẢI:

```text
recalculate effective order state
```

---

# Workflow

## Step 1

Load:

```text
original order
```

---

## Step 2

Load:

```text
all approved returns
```

---

## Step 3

Build effective items:

```text
effective_items
=
original_items
- returned_items
```

---

## Step 4

Recalculate:

```text
shop voucher
platform voucher
allocations
```

---

## Step 5

Calculate:

```text
new effective total
```

---

## Step 6

Refund:

```text
refund
=
current_paid_amount
- recalculated_amount
- already_refunded_amount
```

---

# VIII. Return Scenarios

# Scenario 1

## Voucher shop + platform vẫn còn hiệu lực

Expected:

- voucher giữ nguyên
- refund gần bằng item paid amount

---

# Scenario 2

## Mất voucher shop

Expected:

- shipment subtotal dưới threshold
- remove shop voucher
- recalculate order

---

# Scenario 3

## Mất platform voucher

Expected:

- order subtotal dưới threshold
- remove platform voucher
- refund có thể rất thấp
- thậm chí bằng 0

---

# Scenario 4

## Return toàn bộ shipment

Expected:

- remove shipment
- remove shop voucher shipment đó
- recalculate platform voucher

---

# Scenario 5

## Multiple return requests

Expected:

- cumulative recalculation
- không recalculate từ original order raw

---

# IX. Quantity Support

# Problem

OrderItem:

```text
quantity > 1
```

Nếu chỉ lưu total discount:

```text
platform_discount = 50
```

thì không biết:

```text
1 unit ăn bao nhiêu
```

---

# Solution

AI Agent phải support:

```text
unit level derived pricing
```

Fields:

```text
unit_shop_discount
unit_platform_discount
unit_final_paid
```

---

# X. Immutable Pricing Snapshot

AI Agent KHÔNG được:

- dùng product price hiện tại
- dùng voucher hiện tại

Refund phải dùng:

```text
snapshot lúc checkout
```

---

# XI. Recommended Architecture

# Voucher Engine

```text
VoucherEngine
 ├── applyShopVoucher()
 ├── applyPlatformVoucher()
 ├── allocateDiscount()
 ├── calculateFinalTotals()
 ├── recalculateOrder()
 └── calculateRefund()
```

---

# Pricing Engine

```text
PricingEngine
 ├── buildEffectiveOrder()
 ├── rebuildAllocations()
 ├── computeRefund()
 └── validateVoucherConditions()
```

---

# XII. Recommended Refactor Strategy

# Phase 1

## Pricing Extraction

AI Agent cần:

- extract pricing logic khỏi controllers/services
- gom vào pricing engine
- tránh duplicated calculations

---

# Phase 2

## Allocation Layer

Add:

```text
allocated_shop_discount
allocated_platform_discount
```

per item.

---

# Phase 3

## Refund Engine

Implement:

```text
recalculate effective order
```

---

# Phase 4

## Snapshot Layer

Add immutable pricing snapshot.

---

# Phase 5

## Multiple Return Support

Support:

```text
multiple approved return requests
```

---

# XIII. Service Boundaries

# Order Service

Responsibility:

- order lifecycle
- shipment lifecycle
- item status

KHÔNG tính voucher.

---

# Voucher Service

Responsibility:

- validate voucher
- calculate voucher
- allocate voucher

---

# Refund Service

Responsibility:

- rebuild effective order
- recalculate pricing
- compute refund delta

---

# XIV. AI Agent Refactor Rules

AI Agent KHÔNG được:

- mutate original order pricing
- duplicate calculation logic
- hardcode voucher logic trong controller
- refund theo unit price
- trust current voucher state

---

AI Agent PHẢI:

- centralize pricing logic
- centralize voucher logic
- centralize refund logic
- use immutable pricing source
- use deterministic rounding
- support idempotent recalculation

---

# XV. Recommended Internal DTOs

# PricingItemDTO

```text
itemId
shipmentId
unitPrice
quantity
subtotal
shopDiscount
platformDiscount
finalPaid
```

---

# ShipmentPricingDTO

```text
shipmentId
subtotal
shopDiscount
afterShopDiscount
```

---

# OrderPricingDTO

```text
subtotal
platformDiscount
finalTotal
```

---

# XVI. Edge Cases

AI Agent phải handle:

- voucher threshold invalidation
- percentage voucher max discount
- excluded products
- category restriction
- platform + shop subsidy split
- partial quantity return
- concurrent returns
- rounding drift
- shipping fee recalculation
- free shipping invalidation

---

# XVII. Testing Requirements

AI Agent PHẢI tạo tests cho:

# Voucher Tests

- shop voucher allocation
- platform voucher allocation
- rounding
- threshold invalidation

---

# Refund Tests

- partial return
- full return
- shipment return
- multiple return requests
- voucher lost after return
- voucher still valid

---

# Concurrency Tests

- double refund request
- concurrent return approval
- duplicate recalculation

---

# XVIII. Final Target State

Sau refactor:

- pricing deterministic
- refund deterministic
- voucher recalculation centralized
- allocation traceable
- accounting consistent
- multiple returns supported
- AI-safe architecture
- production-grade ecommerce workflow

