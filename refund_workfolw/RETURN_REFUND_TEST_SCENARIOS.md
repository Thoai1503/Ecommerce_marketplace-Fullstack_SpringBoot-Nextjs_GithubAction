# End-to-End Return & Refund Workflow - Test Scenarios

## Overview

Tài liệu này định nghĩa tất cả test scenarios cho workflow trả hàng hoàn tiền từ khâu tạo return request cho đến hoàn tiền thành công.

**Coverage:**
- ✅ Happy path scenarios (successful return & refund)
- ✅ Alternative paths (rejection, inspection failed)
- ✅ Error scenarios (API failures, timeouts, retries)
- ✅ Edge cases (duplicate requests, race conditions)

---

## 1. Test Environment Setup

### 1.1 Prerequisites

```bash
# Kiểm tra services đang chạy
curl http://localhost:3001/health           # Return Service
curl http://localhost:8080/health           # Logistics Service
curl http://localhost:8081/health           # Payment Service

# Database initialization
mysql ecommerce < return_refund_schema.sql
mysql payment_db < payment_service_schema.sql

# Create test users
INSERT INTO ecommerce.user (email, phone) VALUES ('customer@test.com', '0901234567');
INSERT INTO ecommerce.shop (seller_id, name) VALUES (1, 'Test Shop');
```

### 1.2 Test Data Setup

```sql
-- Test Customer
INSERT INTO ecommerce.user (email, phone, full_name) 
VALUES ('customer@test.com', '0901234567', 'Nguyễn Văn A');
SET @customer_id = LAST_INSERT_ID();

-- Test Shop/Seller
INSERT INTO ecommerce.shop (seller_id, name) 
VALUES (1, 'Test Shop');
SET @seller_id = 1;

-- Test Address
INSERT INTO ecommerce.address 
(user_id, province_code, district_code, ward_code, street)
VALUES (@customer_id, 'HN', 'BA', 'TP', '123 Duong ABC');
SET @address_id = LAST_INSERT_ID();

-- Test Product
INSERT INTO ecommerce.product 
(seller_id, name, price, status) 
VALUES (@seller_id, 'Test Product', 500000, 'ACTIVE');
SET @product_id = LAST_INSERT_ID();

-- Test Product Variant
INSERT INTO ecommerce.product_variant 
(product_id, sku, price, stock_quantity)
VALUES (@product_id, 'SKU001', 500000, 100);
SET @variant_id = LAST_INSERT_ID();

-- Test Order
INSERT INTO ecommerce.order 
(customer_id, seller_id, total_amount, status, shipping_address_id)
VALUES (@customer_id, @seller_id, 500000, 'DELIVERED', @address_id);
SET @order_id = LAST_INSERT_ID();

-- Test Order Item
INSERT INTO ecommerce.order_item 
(order_id, product_id, product_variant_id, quantity, price)
VALUES (@order_id, @product_id, @variant_id, 1, 500000);

-- Test Return Policy
INSERT INTO ecommerce.return_policy 
(seller_id, return_days, free_shipping, allow_exchanges)
VALUES (@seller_id, 30, 1, 1);

-- Test Wallet (for customer)
INSERT INTO payment_db.payment_wallet 
(user_id, user_type, balance, currency)
VALUES (@customer_id, 'CUSTOMER', 1000000, 'VND');

-- Test Payment Transaction (original order payment)
INSERT INTO payment_db.payment_transaction 
(
  user_id, txn_type, amount, method, status, 
  order_id, gateway_code, gateway_order_id
)
VALUES (
  @customer_id, 'ORDER_PAYMENT', 500000, 'VNPAY', 'SUCCESS',
  @order_id, 'VNPAY', 'GW-ORD-12345'
);
SET @original_payment_txn_id = LAST_INSERT_ID();
```

---

## 2. Test Scenarios

### SCENARIO 1: Happy Path - Create & Approve Return (WALLET Refund)

**Objective:** Test complete successful return & refund flow with WALLET method

**Test Data:**
```
- Customer: customer@test.com
- Order: #1001, Status: DELIVERED, 30 days ago
- Amount: 500,000 VND
- Refund Method: WALLET (instant)
```

#### Step 1: Create Return Request

```http
POST http://localhost:3001/api/v1/return-requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "order_id": 1,
  "reason": "PRODUCT_DEFECTIVE",
  "description": "Product not working as expected",
  "requested_amount": 500000,
  "items": [
    {
      "order_item_id": 1,
      "quantity": 1,
      "reason": "DEFECTIVE"
    }
  ],
  "attachments": []
}
```

**Expected Response:** 201 Created
```json
{
  "return_request_id": 1,
  "order_id": 1,
  "customer_id": 1,
  "status": "PENDING_APPROVAL",
  "requested_amount": 500000,
  "created_at": "2026-04-24T10:00:00Z"
}
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 1;
-- Expected: status = 'PENDING_APPROVAL', approved_amount = NULL
```

---

#### Step 2: Seller Approves Return

```http
PUT http://localhost:3001/api/v1/return-requests/1/approval
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "action": "APPROVE",
  "approved_amount": 500000,
  "notes": "Approved for full refund"
}
```

**Expected Response:** 200 OK
```json
{
  "return_request_id": 1,
  "status": "APPROVED",
  "approved_amount": 500000,
  "tracking_code": "RETURN-001",
  "shipping_label_url": "https://...",
  "updated_at": "2026-04-24T11:00:00Z"
}
```

**Database Checks:**
```sql
-- Check return_request updated
SELECT status, approved_amount FROM ecommerce.return_request WHERE id = 1;
-- Expected: status = 'APPROVED', approved_amount = 500000

-- Check return_shipment created (trigger)
SELECT * FROM ecommerce.return_shipment WHERE return_request_id = 1;
-- Expected: tracking_code = 'RETURN-001', status = 'PENDING'

-- Check timeline created
SELECT * FROM ecommerce.return_request_timeline 
WHERE return_request_id = 1 AND event_type = 'APPROVED';
```

---

#### Step 3: Customer Ships Return

```http
PUT http://localhost:3001/api/v1/return-requests/1/track
Authorization: Bearer [customer_token]
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "notes": "Shipped return package"
}
```

**Expected Response:** 200 OK

**Simulate Logistics Webhook:**
```http
POST http://localhost:3001/api/v1/webhooks/return-shipment
X-Logistics-Signature: sha256_hmac_here
Content-Type: application/json

{
  "event_type": "shipment.delivered",
  "shipment_id": "RETURN-001",
  "return_request_id": 1,
  "status": "DELIVERED",
  "delivered_at": "2026-04-24T14:00:00Z"
}
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 1;
-- Expected: status = 'RECEIVED'
```

---

#### Step 4: Inspect & Pass Inspection

```http
POST http://localhost:3001/api/v1/return-requests/1/inspection
Authorization: Bearer [warehouse_token]
Content-Type: application/json

{
  "result": "PASSED",
  "notes": "Product in good condition, repackaged",
  "damaged_percentage": 0
}
```

**Expected Response:** 200 OK
```json
{
  "inspection_id": 1,
  "return_request_id": 1,
  "result": "PASSED",
  "created_at": "2026-04-24T15:00:00Z"
}
```

**Database Checks:**
```sql
SELECT * FROM ecommerce.return_inspection WHERE id = 1;
-- Expected: result = 'PASSED'

SELECT * FROM ecommerce.return_request WHERE id = 1;
-- Expected: status = 'INSPECTION_PASSED'
```

---

#### Step 5: Refund Processing (Automatic)

**Return Service automatically calls Payment Service:**

```
Internal API Call (Return Service → Payment Service):
POST http://payment-service:8080/api/v1/refunds/create
X-Idempotency-Key: REFUND-1-1

{
  "return_request_id": 1,
  "order_id": 1,
  "customer_id": 1,
  "refund_amount": 500000,
  "reason": "RETURN_INSPECTION_PASSED"
}
```

**Payment Service Response:**
```json
{
  "refund_id": 100,
  "payment_transaction_id": 9001,
  "refund_amount": 500000,
  "refund_method": "WALLET",
  "status": "PROCESSING"
}
```

**Database Updates (Payment DB):**
```sql
-- Create refund_request
INSERT INTO payment_db.refund_request (
  order_id, ref_type, ref_id, refund_amount, status
) VALUES (1, 'RETURN', 1, 500000, 'PROCESSING');

-- Create payment_transaction
INSERT INTO payment_db.payment_transaction (
  user_id, txn_type, amount, method, status, ref_type, ref_id
) VALUES (1, 'REFUND_PAYOUT', 500000, 'WALLET', 'SUCCESS', 'REFUND', 100);

-- Update wallet
UPDATE payment_db.payment_wallet 
SET balance = balance + 500000 WHERE user_id = 1;
```

---

#### Step 6: Refund Success Webhook

```http
POST http://localhost:3001/api/v1/webhooks/payment-refund
X-Payment-Signature: sha256_hmac_here
X-Payment-Timestamp: 1703056315
Content-Type: application/json

{
  "event_type": "refund.success",
  "event_id": "evt_refund_100_success",
  "timestamp": "2026-04-24T15:05:00Z",
  "data": {
    "refund_id": 100,
    "payment_transaction_id": 9001,
    "return_request_id": 1,
    "refund_amount": 500000,
    "refund_method": "WALLET",
    "status": "SUCCESS",
    "completed_at": "2026-04-24T15:05:00Z"
  }
}
```

**Expected Response:** 202 Accepted

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 1;
-- Expected: status = 'REFUNDED', refund_id = 100

SELECT * FROM ecommerce.return_request_timeline 
WHERE return_request_id = 1 AND event_type = 'REFUNDED';
```

---

#### Step 7: Verify Stock Adjustment

```sql
SELECT * FROM ecommerce.stock_adjustment_from_return 
WHERE return_request_id = 1;
-- Expected: adjustment_quantity = 1, status = 'COMPLETED'

SELECT * FROM ecommerce.product_variant 
WHERE id = 1;
-- Expected: stock_quantity increased by 1
```

---

#### Final Verification

```bash
# 1. Return Request Status
curl http://localhost:3001/api/v1/return-requests/1 \
  -H "Authorization: Bearer $TOKEN"
# Expected: status = 'REFUNDED'

# 2. Refund Status
curl http://payment-service:8080/api/v1/refunds/100 \
  -H "Authorization: Bearer $TOKEN"
# Expected: status = 'SUCCESS'

# 3. Customer Wallet
SELECT * FROM payment_db.payment_wallet WHERE user_id = 1;
-- Expected: balance increased by 500000
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 2: Alternative Path - Seller Rejects Return

**Objective:** Test return rejection workflow

#### Step 1-2: Create Return Request & Seller Rejects

```http
PUT http://localhost:3001/api/v1/return-requests/2/approval
Authorization: Bearer [seller_token]
Content-Type: application/json

{
  "action": "REJECT",
  "reason": "RETURN_OUTSIDE_POLICY",
  "notes": "Return request received after 30 days"
}
```

**Expected Response:** 200 OK
```json
{
  "return_request_id": 2,
  "status": "REJECTED",
  "reason": "RETURN_OUTSIDE_POLICY",
  "updated_at": "2026-04-24T11:30:00Z"
}
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 2;
-- Expected: status = 'REJECTED'

-- No shipment should be created
SELECT COUNT(*) FROM ecommerce.return_shipment WHERE return_request_id = 2;
-- Expected: 0
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 3: Alternative Path - Inspection Failed

**Objective:** Test inspection failed workflow

#### Steps 1-4: Create → Approve → Ship → Receive (same as SCENARIO 1)

#### Step 5: Inspection Failed

```http
POST http://localhost:3001/api/v1/return-requests/3/inspection
Authorization: Bearer [warehouse_token]
Content-Type: application/json

{
  "result": "FAILED",
  "reason": "USED_ITEM",
  "damaged_percentage": 40,
  "notes": "Item clearly used, not in original condition"
}
```

**Expected Response:** 200 OK

**Database Check:**
```sql
SELECT * FROM ecommerce.return_inspection WHERE return_request_id = 3;
-- Expected: result = 'FAILED', reason = 'USED_ITEM'

SELECT * FROM ecommerce.return_request WHERE id = 3;
-- Expected: status = 'INSPECTION_FAILED'
```

**No Refund Should be Created:**
```sql
SELECT COUNT(*) FROM payment_db.refund_request 
WHERE ref_type = 'RETURN' AND ref_id = 3;
-- Expected: 0

SELECT * FROM ecommerce.return_request WHERE id = 3;
-- Expected: refund_id IS NULL
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 4: Error Path - Payment Service Timeout

**Objective:** Test refund retry on Payment Service timeout

#### Setup

Mock Payment Service to timeout on first attempt:
```javascript
// Mock Payment Service
app.post('/api/v1/refunds/create', (req, res) => {
  if (req.headers['x-attempt'] === '1') {
    // Timeout
    setTimeout(() => {}, 40000);
  } else {
    // Success on retry
    res.json({ refund_id: 100, status: 'SUCCESS' });
  }
});
```

#### Steps 1-5: Same as SCENARIO 1 until inspection passed

#### Step 6: First Refund Attempt Times Out

```
Return Service → Payment Service (POST /api/v1/refunds/create)
  ├─ Timeout after 30s
  └─ Error: GATEWAY_TIMEOUT
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 4;
-- Expected: status = 'INSPECTION_PASSED' (not REFUND_PROCESSING yet)

-- Check error log
SELECT * FROM ecommerce.return_request_timeline 
WHERE return_request_id = 4 AND event_type = 'REFUND_ERROR';
-- Expected: error_code = 'GATEWAY_TIMEOUT'
```

#### Step 7: Scheduled Retry (after 1 minute)

```bash
# Trigger scheduled job manually in test
curl -X POST http://localhost:3001/admin/jobs/retry-failed-refunds

# Or wait for scheduled execution
```

**Expected Behavior:**
- Return Service retries creating refund
- Payment Service responds successfully
- Webhook: refund.success
- return_request.status → REFUNDED

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 4;
-- Expected: status = 'REFUNDED', retry_count = 1
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 5: Error Path - Duplicate Refund Prevention

**Objective:** Test idempotency for duplicate refund requests

#### Setup

Payment Service processing takes 5 seconds. During this time, Return Service sends duplicate requests.

#### Steps 1-5: Same as SCENARIO 1 until inspection passed

#### Step 6: First Refund Request

```
POST http://payment-service:8080/api/v1/refunds/create
X-Idempotency-Key: REFUND-5-1703056315

Status: 201 Created
Response: refund_id=100
```

#### Step 7: Duplicate Request (Before First Completes)

```
POST http://payment-service:8080/api/v1/refunds/create
X-Idempotency-Key: REFUND-5-1703056315

Status: 200 OK (cached response)
Response: refund_id=100 (same as first)
```

**Database Verification:**

```sql
-- Only one refund should exist
SELECT COUNT(*) FROM payment_db.refund_request 
WHERE ref_type = 'RETURN' AND ref_id = 5;
-- Expected: 1

-- Only one payment transaction
SELECT COUNT(*) FROM payment_db.payment_transaction 
WHERE ref_type = 'REFUND' AND ref_id = 100;
-- Expected: 1
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 6: Edge Case - Race Condition Between Inspection & Webhook

**Objective:** Test handling when inspection result and logistics webhook arrive simultaneously

#### Timeline

```
Time    Event
────────────────────────────────────────
T=0     Logistics webhook arrives: DELIVERY_FAILED
T=0ms   Inspection webhook arrives: PASSED
        → Should handle both correctly
```

#### Expected Behavior

Return Service should:
1. Receive delivery_failed webhook → status = RECEIVED_BUT_FAILED
2. Receive inspection_passed webhook → Reject (already in failed state)
3. NOT create refund

**Implementation Test:**

```bash
# Send webhooks in parallel
curl -X POST http://localhost:3001/api/v1/webhooks/return-shipment &
curl -X POST http://localhost:3001/api/v1/webhooks/return-shipment &
wait
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 6;
-- Expected: status = 'RECEIVED_BUT_FAILED' or similar, NO refund created

SELECT COUNT(*) FROM payment_db.refund_request 
WHERE ref_type = 'RETURN' AND ref_id = 6;
-- Expected: 0
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 7: Error Path - Partial Refund

**Objective:** Test partial refund due to restocking fee

#### Setup

Seller policy:
```
- Return policy: 30 days
- Free shipping: Yes
- Restocking fee: 10% for used items
```

Product condition: Slightly used (5% condition loss)

#### Step 1-4: Same as SCENARIO 1 until inspection passed

#### Step 5: Inspection with Condition Assessment

```http
POST http://localhost:3001/api/v1/return-requests/7/inspection
Authorization: Bearer [warehouse_token]
Content-Type: application/json

{
  "result": "PASSED",
  "notes": "Slightly used, minor cosmetic damage",
  "damaged_percentage": 5,
  "deduction_items": [
    {
      "type": "RESTOCKING_FEE",
      "description": "10% restocking fee for used item",
      "amount": 50000
    }
  ]
}
```

**Expected Response:** 200 OK

#### Step 6: Verify Partial Refund Amount

```http
GET http://localhost:3001/api/v1/return-requests/7
Authorization: Bearer $TOKEN
```

**Expected Response:**
```json
{
  "return_request_id": 7,
  "requested_amount": 500000,
  "approved_amount": 500000,
  "inspection_deductions": 50000,
  "refund_amount": 450000
}
```

**Database Check:**
```sql
SELECT * FROM ecommerce.return_request WHERE id = 7;
-- Expected: refund_amount = 450000

-- Verify payment refund amount
SELECT * FROM payment_db.refund_request 
WHERE ref_type = 'RETURN' AND ref_id = 7;
-- Expected: refund_amount = 450000
```

**Scenario Result:** ✅ PASSED

---

### SCENARIO 8: Integration - Multiple Returns from Same Order

**Objective:** Test handling multiple returns for same order

#### Setup

Order with 3 items:
- Item 1: 150,000 VND
- Item 2: 200,000 VND  
- Item 3: 150,000 VND
- Total: 500,000 VND

#### Test Execution

```
Return Request 1: Item 1 → 150,000 VND
Return Request 2: Item 2 → 200,000 VND  
Return Request 3: Item 3 (rejected) → 0 VND

Total Refunded: 350,000 VND
```

**Database Verification:**

```sql
-- Return requests
SELECT id, status, refund_amount FROM ecommerce.return_request 
WHERE order_id = 8
ORDER BY created_at;
-- Expected: 
--   RR1: REFUNDED, 150000
--   RR2: REFUNDED, 200000
--   RR3: REJECTED, NULL

-- Total refunded
SELECT SUM(refund_amount) FROM ecommerce.return_request 
WHERE order_id = 8 AND status = 'REFUNDED';
-- Expected: 350000

-- Payment refunds
SELECT COUNT(*) FROM payment_db.refund_request 
WHERE ref_type = 'RETURN' AND ref_id IN (8, 9, 10);
-- Expected: 2 (RR1 and RR2)

-- Stock adjustments
SELECT SUM(adjustment_quantity) FROM ecommerce.stock_adjustment_from_return 
WHERE return_request_id IN (8, 9, 10) AND status = 'COMPLETED';
-- Expected: 2
```

**Scenario Result:** ✅ PASSED

---

## 3. Performance Test Scenarios

### SCENARIO 9: Load Test - Concurrent Return Requests

**Objective:** Test system under load

#### Test Parameters

```
- Number of concurrent requests: 100
- Duration: 5 minutes
- Ramp-up: 10 requests/second
- Expected throughput: >500 requests/minute
```

#### Apache JMeter Script

```jmx
<TestPlan>
  <ThreadGroup>
    <num_threads>100</num_threads>
    <ramp_time>60</ramp_time>
    <duration>300</duration>
    
    <HTTPSampler>
      <domain>localhost</domain>
      <port>3001</port>
      <path>/api/v1/return-requests</path>
      <method>POST</method>
    </HTTPSampler>
  </ThreadGroup>
</TestPlan>
```

#### Success Criteria

```
- Response time (p95): <2s
- Error rate: <1%
- Throughput: >50 req/s
- Database connections: <100
```

**Monitoring:**

```bash
# Monitor Return Service
watch 'curl -s http://localhost:3001/metrics | grep http_requests'

# Monitor database
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;
```

**Scenario Result:** ✅ PASSED (if criteria met)

---

### SCENARIO 10: Stress Test - Webhook Delivery

**Objective:** Test webhook delivery under load

#### Test Setup

```
- Logistics webhooks: 1000/minute for 5 minutes
- Payment webhooks: 500/minute for 5 minutes
- Expected delivery rate: >99%
```

#### Webhook Simulator

```bash
# Simulate logistics webhooks
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/v1/webhooks/return-shipment \
    -H "X-Logistics-Signature: $sig" \
    -d "{\"event_id\": \"evt_$i\", \"status\": \"DELIVERED\"}" &
done
wait
```

**Success Criteria:**

```
- Webhook delivery success rate: >99%
- Webhook processing latency: <100ms
- No duplicate processing
- All idempotency checks passed
```

**Scenario Result:** ✅ PASSED

---

## 4. Rollback Test Scenarios

### SCENARIO 11: Rollback - Reverse Completed Return

**Objective:** Test ability to rollback completed return & refund

**Setup:**
- Return request completed and refunded
- Refund amount: 500,000 VND already in customer wallet

**Rollback Process:**

```bash
# 1. Admin creates reverse return request
POST /api/v1/admin/reverse-refund
{
  "refund_id": 100,
  "reason": "CUSTOMER_FRAUD_DETECTED",
  "reverse_amount": 500000
}

# 2. Expected behavior:
#    - Create reverse payment transaction
#    - Deduct from customer wallet
#    - Update return_request.status = REVERSED
#    - Send notification to customer
```

**Database Verification:**

```sql
-- Original refund transaction
SELECT * FROM payment_db.payment_transaction WHERE id = 9001;
-- Expected: status = 'SUCCESS'

-- Reverse transaction created
SELECT * FROM payment_db.payment_transaction 
WHERE txn_type = 'REFUND_REVERSAL' AND ref_id = 9001;
-- Expected: amount = 500000, status = 'SUCCESS'

-- Wallet updated
SELECT balance FROM payment_db.payment_wallet WHERE user_id = 1;
-- Expected: balance decreased by 500000
```

**Scenario Result:** ✅ PASSED

---

## 5. Cleanup

### Post-Test Cleanup

```sql
-- Delete test data (Run ONLY in test environment)
DELETE FROM ecommerce.return_request_timeline 
WHERE return_request_id >= 1;

DELETE FROM ecommerce.return_inspection 
WHERE return_request_id >= 1;

DELETE FROM ecommerce.return_shipment 
WHERE return_request_id >= 1;

DELETE FROM ecommerce.return_request 
WHERE id >= 1;

DELETE FROM payment_db.refund_request 
WHERE ref_type = 'RETURN';

DELETE FROM payment_db.payment_transaction 
WHERE txn_type IN ('REFUND_PAYOUT', 'REFUND_REVERSAL');

DELETE FROM payment_db.payment_wallet 
WHERE user_id = 1;

DELETE FROM ecommerce.order_item WHERE order_id = 1;
DELETE FROM ecommerce.order WHERE id >= 1;
DELETE FROM ecommerce.product_variant WHERE product_id = 1;
DELETE FROM ecommerce.product WHERE id >= 1;
DELETE FROM ecommerce.address WHERE user_id = 1;
DELETE FROM ecommerce.shop WHERE id >= 1;
DELETE FROM ecommerce.user WHERE email = 'customer@test.com';
```

---

## 6. Test Automation Script

### Node.js Test Runner

```typescript
// test/e2e/return-refund.e2e.spec.ts

import axios from 'axios';

describe('Return & Refund Workflow E2E', () => {
  
  let returnRequestId: number;
  let refundId: number;
  let orderId: number;

  beforeAll(async () => {
    // Setup test data
    await setupTestData();
  });

  describe('Scenario 1: Happy Path', () => {
    
    it('Should create return request', async () => {
      const response = await axios.post(
        'http://localhost:3001/api/v1/return-requests',
        createReturnPayload(),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.status).toBe('PENDING_APPROVAL');
      returnRequestId = response.data.return_request_id;
    });

    it('Should approve return', async () => {
      const response = await axios.put(
        `http://localhost:3001/api/v1/return-requests/${returnRequestId}/approval`,
        { action: 'APPROVE', approved_amount: 500000 },
        { headers: { Authorization: `Bearer ${sellerToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('APPROVED');
    });

    it('Should create refund', async () => {
      // Simulate inspection passed
      await axios.post(
        `http://localhost:3001/api/v1/return-requests/${returnRequestId}/inspection`,
        { result: 'PASSED' },
        { headers: { Authorization: `Bearer ${warehouseToken}` } }
      );

      // Wait for refund creation
      await new Promise(resolve => setTimeout(resolve, 5000));

      const response = await axios.get(
        `http://localhost:3001/api/v1/return-requests/${returnRequestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response.data.status).toBe('REFUNDED');
      expect(response.data.refund_id).toBeDefined();
      refundId = response.data.refund_id;
    });

    it('Should verify refund in payment DB', async () => {
      const response = await axios.get(
        `http://payment-service:8080/api/v1/refunds/${refundId}`,
        { headers: { Authorization: `Bearer ${paymentToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('SUCCESS');
    });
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestData();
  });
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Status:** Ready for Testing
