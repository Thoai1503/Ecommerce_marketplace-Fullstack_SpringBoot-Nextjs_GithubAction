# Database Synchronization Guide - Return & Refund Workflow

## Overview

Tài liệu này hướng dẫn cách đồng bộ dữ liệu giữa **ecommerce_db** (Return Service) và **payment_db** (Payment Service) để đảm bảo data consistency trong workflow trả hàng hoàn tiền.

---

## 1. Cross-Database Dependencies

### 1.1 Data Flow Diagram

```
┌──────────────────┐
│  ECOMMERCE_DB    │
├──────────────────┤
│                  │
│ return_request   │ (Main table)
│   ├─ order_id    │ ──────┐
│   ├─ refund_id   │       │
│   └─ status      │       │
│                  │       │
└──────────────────┘       │
                           │
                           v
                    ┌──────────────────┐
                    │  PAYMENT_DB      │
                    ├──────────────────┤
                    │                  │
                    │ refund_request   │
                    │   ├─ order_id    │
                    │   ├─ ref_id (1)  │
                    │   └─ status      │
                    │                  │
                    │ payment_txn      │
                    │   ├─ order_id    │
                    │   └─ ref_id (100)│
                    │                  │
                    │ payment_wallet   │
                    │   └─ balance     │
                    │                  │
                    └──────────────────┘
```

### 1.2 Synchronization Points

| Point | Source    | Target    | Trigger             | Data                      |
| ----- | --------- | --------- | ------------------- | ------------------------- |
| 1     | ecommerce | payment   | Inspection passed   | order_id, customer_id     |
| 2     | payment   | ecommerce | Refund success      | refund_id, status, amount |
| 3     | ecommerce | payment   | Return cancellation | return_request_id         |
| 4     | payment   | ecommerce | Wallet update       | balance_change            |

---

## 2. Detailed Synchronization Process

### 2.1 Phase 1: Return Inspection Passed → Refund Creation

**Trigger:** `return_request.status` = `INSPECTION_PASSED`

#### Step 1: Return Service Verifies Order in Payment DB

```typescript
// Return Service - ReturnService.ts
async passInspection(returnRequestId: number) {
  const returnRequest = await this.db.query(`
    SELECT rr.*, o.id as order_id, o.customer_id
    FROM return_request rr
    JOIN order o ON rr.order_id = o.id
    WHERE rr.id = ?
  `, [returnRequestId]);

  // Verify order exists in payment_db
  const order = await this.paymentServiceClient.getOrder(
    returnRequest.order_id
  );

  if (!order) {
    throw new Error('Order not found in payment database');
  }

  // Continue to refund creation
  await this.createRefund(returnRequest);
}
```

#### Step 2: Create Refund in Payment DB

```typescript
// Return Service → Payment Service API
async createRefund(returnRequest) {
  const response = await axios.post(
    'http://payment-service:8080/api/v1/refunds/create',
    {
      return_request_id: returnRequest.id,
      order_id: returnRequest.order_id,
      customer_id: returnRequest.customer_id,
      refund_amount: returnRequest.approved_amount - returnRequest.inspection_deductions,
      reason: 'RETURN_INSPECTION_PASSED',
      metadata: {
        inspection_id: returnRequest.inspection_id,
        deductions: returnRequest.inspection_deductions
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PAYMENT_SERVICE_TOKEN}`,
        'X-Idempotency-Key': `REFUND-${returnRequest.id}-${Date.now()}`
      },
      timeout: 30000
    }
  );

  // Save refund_id to ecommerce_db
  await this.db.query(`
    UPDATE return_request
    SET refund_id = ?, status = 'REFUND_PROCESSING'
    WHERE id = ?
  `, [response.data.refund_id, returnRequest.id]);

  return response.data;
}
```

#### Step 3: Payment DB Creates Refund Request

```sql
-- payment_db.sql
-- Create refund_request
INSERT INTO payment_db.refund_request (
  order_id,
  ref_type,
  ref_id,
  customer_id,
  refund_amount,
  refund_method,
  status,
  created_at
) VALUES (
  ?,           -- order_id from ecommerce_db.order
  'RETURN',    -- Always 'RETURN' for return workflow
  ?,           -- ref_id = return_request.id
  ?,           -- customer_id from order
  ?,           -- approved_amount - deductions
  CASE
    WHEN DATEDIFF(NOW(), o.created_at) <= 7
      THEN 'WALLET'              -- Original payment within 7 days
    WHEN DATEDIFF(NOW(), o.created_at) <= 30
      THEN 'ORIGINAL_PAYMENT'    -- 7-30 days
    ELSE 'BANK_TRANSFER'         -- After 30 days
  END,
  'PROCESSING',
  NOW()
);

-- Create payment_transaction for refund
INSERT INTO payment_db.payment_transaction (
  user_id,
  txn_type,
  amount,
  method,
  status,
  order_id,
  ref_type,
  ref_id,
  gateway_code,
  created_at
) VALUES (
  ?,                   -- customer_id
  'REFUND_PAYOUT',     -- Always REFUND_PAYOUT
  ?,                   -- refund_amount
  ?,                   -- refund_method (WALLET/PAYMENT_GATEWAY/BANK)
  'PROCESSING',
  ?,                   -- order_id
  'REFUND',
  ?,                   -- refund_request.id
  NULL,
  NOW()
);
```

#### Step 4: Handle Refund by Method

```sql
-- If WALLET method (instant)
BEGIN;
  -- Debit original payment transaction
  UPDATE payment_db.payment_transaction
  SET status = 'REFUNDED'
  WHERE order_id = ? AND txn_type = 'ORDER_PAYMENT';

  -- Credit customer wallet
  UPDATE payment_db.payment_wallet
  SET balance = balance + ?
  WHERE user_id = ? AND currency = 'VND';

  -- Create wallet transaction record
  INSERT INTO payment_db.wallet_transaction (
    wallet_id, txn_type, amount, status, created_at
  ) VALUES (
    ?, 'CREDIT', ?, 'COMPLETED', NOW()
  );

  -- Update refund status
  UPDATE payment_db.refund_request
  SET status = 'SUCCESS', completed_at = NOW()
  WHERE id = ?;

  -- Update payment transaction
  UPDATE payment_db.payment_transaction
  SET status = 'SUCCESS'
  WHERE txn_type = 'REFUND_PAYOUT' AND ref_id = ?;
COMMIT;
```

#### Step 5: Payment Service Sends Webhook to Return Service

```typescript
// payment-service/webhooks.ts
async handleRefundSuccess(refund) {
  const payload = {
    event_type: 'refund.success',
    event_id: `evt_refund_${refund.id}_success`,
    timestamp: new Date().toISOString(),
    data: {
      refund_id: refund.id,
      payment_transaction_id: refund.payment_transaction_id,
      return_request_id: refund.ref_id,
      order_id: refund.order_id,
      refund_amount: refund.refund_amount,
      refund_method: refund.refund_method,
      status: 'SUCCESS'
    }
  };

  // Create HMAC signature
  const signature = this.createSignature(payload);

  // Send webhook
  await axios.post(
    process.env.RETURN_WEBHOOK_URL,
    payload,
    {
      headers: {
        'X-Payment-Signature': signature,
        'X-Payment-Timestamp': Math.floor(Date.now() / 1000),
        'X-Payment-Event-ID': payload.event_id
      }
    }
  );
}
```

---

### 2.2 Phase 2: Refund Success Webhook → Return Complete

**Trigger:** Webhook: `refund.success`

#### Step 1: Return Service Receives Webhook

```typescript
// Return Service - ReturnWebhookController.ts
@Post('/webhooks/payment-refund')
async handlePaymentRefund(@Body() payload: PaymentRefundWebhook) {
  // Verify signature
  const signature = this.req.headers['x-payment-signature'];
  const timestamp = this.req.headers['x-payment-timestamp'];

  if (!this.verifySignature(JSON.stringify(payload), signature, timestamp)) {
    throw new UnauthorizedException('Invalid signature');
  }

  // Process webhook
  await this.returnPaymentWebhookService.process(payload);

  return { success: true, event_id: payload.event_id };
}

verifySignature(payload: string, signature: string, timestamp: string): boolean {
  const crypto = require('crypto');
  const message = `${payload}.${timestamp}`;
  const expected = crypto
    .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
    .update(message)
    .digest('hex');

  return expected === signature;
}
```

#### Step 2: Update Return Request Status

```typescript
// Return Service - ReturnPaymentWebhookService.ts
async process(webhook: PaymentRefundWebhook) {
  const { data, event_type } = webhook;

  if (event_type === 'refund.success') {
    // Update return_request
    await this.db.query(`
      UPDATE return_request
      SET
        status = 'REFUNDED',
        refund_id = ?,
        refunded_at = NOW()
      WHERE id = ?
    `, [data.refund_id, data.return_request_id]);

    // Log event
    await this.db.query(`
      INSERT INTO return_request_timeline
      (return_request_id, event_type, event_data)
      VALUES (?, 'REFUNDED', ?)
    `, [data.return_request_id, JSON.stringify(data)]);

    // Send notification
    await this.notificationService.sendRefundNotification({
      customer_id: data.customer_id,
      amount: data.refund_amount,
      method: data.refund_method
    });

    // Add stock back
    await this.addStockFromReturn(data.return_request_id);
  }
}
```

#### Step 3: Add Stock Back to Inventory

```sql
-- Add stock back
INSERT INTO ecommerce.stock_adjustment_from_return (
  return_request_id,
  product_variant_id,
  adjustment_quantity,
  status,
  created_at
) SELECT
  rr.id,
  oi.product_variant_id,
  oi.quantity,
  'COMPLETED',
  NOW()
FROM return_request rr
JOIN order_item oi ON rr.order_id = oi.order_id
WHERE rr.id = ? AND oi.id IN (
  SELECT order_item_id FROM return_request
  WHERE id = ?
);

-- Update product_variant stock
UPDATE ecommerce.product_variant pv
SET pv.stock_quantity = pv.stock_quantity + (
  SELECT SUM(oi.quantity)
  FROM order_item oi
  WHERE oi.product_variant_id = pv.id
    AND oi.order_id = (
      SELECT order_id FROM return_request WHERE id = ?
    )
)
WHERE pv.id IN (
  SELECT DISTINCT oi.product_variant_id
  FROM order_item oi
  WHERE oi.order_id = (
    SELECT order_id FROM return_request WHERE id = ?
  )
);
```

---

## 3. Consistency Checks

### 3.1 Daily Reconciliation

```sql
-- Query 1: Check for orphaned returns (no refund in payment_db)
SELECT
  rr.id,
  rr.status,
  rr.refund_id,
  COUNT(ref.id) as refund_count
FROM ecommerce.return_request rr
LEFT JOIN payment_db.refund_request ref
  ON rr.refund_id = ref.id
WHERE rr.status IN ('REFUND_PROCESSING', 'REFUNDED')
GROUP BY rr.id
HAVING refund_count = 0;

-- Expected result: 0 rows

-- Query 2: Check for mismatched amounts
SELECT
  rr.id,
  rr.approved_amount - rr.inspection_deductions as ecom_amount,
  ref.refund_amount as payment_amount,
  ABS((rr.approved_amount - rr.inspection_deductions) - ref.refund_amount) as diff
FROM ecommerce.return_request rr
JOIN payment_db.refund_request ref ON rr.refund_id = ref.id
WHERE ABS((rr.approved_amount - rr.inspection_deductions) - ref.refund_amount) > 0;

-- Expected result: 0 rows

-- Query 3: Check for status mismatches
SELECT
  rr.id,
  rr.status as ecom_status,
  ref.status as payment_status,
  CASE
    WHEN rr.status = 'REFUNDED' AND ref.status != 'SUCCESS' THEN 'MISMATCH'
    WHEN rr.status = 'REFUND_PROCESSING' AND ref.status NOT IN ('PROCESSING', 'SUCCESS') THEN 'MISMATCH'
    ELSE 'OK'
  END as status_check
FROM ecommerce.return_request rr
JOIN payment_db.refund_request ref ON rr.refund_id = ref.id
WHERE CASE
  WHEN rr.status = 'REFUNDED' AND ref.status != 'SUCCESS' THEN 1
  WHEN rr.status = 'REFUND_PROCESSING' AND ref.status NOT IN ('PROCESSING', 'SUCCESS') THEN 1
  ELSE 0
END = 1;

-- Expected result: 0 rows
```

### 3.2 Monthly Audit Report

```sql
-- Total refunds by method
SELECT
  ref.refund_method,
  COUNT(*) as count,
  SUM(ref.refund_amount) as total_amount,
  AVG(DATEDIFF(ref.completed_at, ref.created_at)) as avg_days
FROM payment_db.refund_request ref
WHERE ref.ref_type = 'RETURN'
  AND ref.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY ref.refund_method;

-- Success vs failure
SELECT
  CASE WHEN ref.status = 'SUCCESS' THEN 'Success' ELSE 'Failed' END as status,
  COUNT(*) as count,
  SUM(ref.refund_amount) as amount
FROM payment_db.refund_request ref
WHERE ref.ref_type = 'RETURN'
  AND ref.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY status;

-- Wallet balance verification
SELECT
  pw.user_id,
  pw.balance,
  (
    SELECT SUM(balance_credit)
    FROM (
      SELECT SUM(amount) as balance_credit
      FROM payment_db.wallet_transaction wt
      WHERE wt.wallet_id = pw.id AND wt.txn_type = 'CREDIT'

      UNION ALL

      SELECT -SUM(amount)
      FROM payment_db.wallet_transaction wt
      WHERE wt.wallet_id = pw.id AND wt.txn_type = 'DEBIT'
    ) as txn
  ) as calculated_balance,
  ABS(pw.balance - (
    SELECT COALESCE(SUM(balance_credit), 0)
    FROM (
      SELECT SUM(amount) as balance_credit
      FROM payment_db.wallet_transaction wt
      WHERE wt.wallet_id = pw.id AND wt.txn_type = 'CREDIT'

      UNION ALL

      SELECT -SUM(amount)
      FROM payment_db.wallet_transaction wt
      WHERE wt.wallet_id = pw.id AND wt.txn_type = 'DEBIT'
    ) as txn
  )) as balance_diff
FROM payment_db.payment_wallet pw
WHERE balance_diff > 0;

-- Expected result: 0 rows
```

---

## 4. Error Recovery & Rollback

### 4.1 Scenario: Refund Created but Webhook Never Arrives

**Symptom:** Return in REFUND_PROCESSING state for >1 hour

**Recovery:**

```typescript
// Scheduled job - every 1 hour
@Cron('0 * * * *')
async reconcileFailedRefunds() {
  const stuckReturns = await this.db.query(`
    SELECT rr.*
    FROM return_request rr
    WHERE rr.status = 'REFUND_PROCESSING'
      AND rr.updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
  `);

  for (const returnReq of stuckReturns) {
    // Check payment service for refund status
    const refund = await this.paymentServiceClient.getRefund(
      returnReq.refund_id
    );

    if (refund.status === 'SUCCESS') {
      // Manually trigger webhook processing
      await this.returnPaymentWebhookService.process({
        event_type: 'refund.success',
        data: refund
      });
    } else if (refund.status === 'FAILED') {
      // Alert admin
      await this.alertService.sendAlert({
        severity: 'HIGH',
        message: `Refund failed for return ${returnReq.id}`,
        action_required: true
      });
    }
  }
}
```

### 4.2 Scenario: Customer Wallet Deducted But Return Not Marked Complete

**Symptom:** Wallet balance correct but return_request still in REFUND_PROCESSING

**Recovery:**

```sql
-- Find affected returns
SELECT
  rr.id,
  rr.status,
  rr.refund_id,
  ref.status as refund_status,
  rr.approved_amount - rr.inspection_deductions as refund_amount
FROM ecommerce.return_request rr
JOIN payment_db.refund_request ref ON rr.refund_id = ref.id
WHERE rr.status = 'REFUND_PROCESSING'
  AND ref.status = 'SUCCESS';

-- Fix: Update return_request status
UPDATE ecommerce.return_request
SET status = 'REFUNDED', updated_at = NOW()
WHERE id IN (
  SELECT rr.id
  FROM ecommerce.return_request rr
  JOIN payment_db.refund_request ref ON rr.refund_id = ref.id
  WHERE rr.status = 'REFUND_PROCESSING' AND ref.status = 'SUCCESS'
);
```

### 4.3 Scenario: Duplicate Webhook Arrives

**Handling:** Idempotency check using event_id

```typescript
// ReturnPaymentWebhookService.ts
async process(webhook: PaymentRefundWebhook) {
  // Check if webhook already processed
  const processed = await this.db.query(`
    SELECT id FROM return_request_timeline
    WHERE event_type = 'WEBHOOK_RECEIVED'
      AND event_data LIKE ?
  `, [`%${webhook.event_id}%`]);

  if (processed.length > 0) {
    // Already processed, return success
    console.log(`Duplicate webhook ${webhook.event_id}, skipping`);
    return { success: true, processed: false };
  }

  // Process webhook
  // ...

  // Log processed webhook
  await this.db.query(`
    INSERT INTO return_request_timeline
    (return_request_id, event_type, event_data)
    VALUES (?, 'WEBHOOK_RECEIVED', ?)
  `, [webhook.data.return_request_id, JSON.stringify(webhook)]);

  return { success: true, processed: true };
}
```

---

## 5. Monitoring & Alerts

### 5.1 Key Metrics

```yaml
Metrics:
  - Refund creation latency (should be <2s)
  - Webhook delivery latency (should be <100ms)
  - Webhook delivery success rate (should be >99.5%)
  - Payment DB synchronization lag (should be 0)
  - Failed refund count (should be <0.1%)
  - Stuck return count (should be 0)

Alerts:
  - CRITICAL: Webhook delivery failure rate >5% for 15 min
  - CRITICAL: Sync lag >5 min
  - CRITICAL: Stuck returns >5
  - WARNING: Refund creation latency >5s
  - WARNING: Failed refund count >1%
```

### 5.2 Prometheus Queries

```promql
# Webhook delivery success rate
rate(webhook_success_total[5m]) / rate(webhook_total[5m]) < 0.99

# Average refund creation time
histogram_quantile(0.95, rate(refund_creation_duration_seconds[5m]))

# Count of stuck returns
count(return_status{status="REFUND_PROCESSING", duration_seconds>3600})
```

---

## 6. Deployment Checklist

- [ ] Test cross-database connectivity
- [ ] Verify idempotency key logic
- [ ] Configure webhook signatures (HMAC SHA256)
- [ ] Set up hourly reconciliation job
- [ ] Configure alerts for sync failures
- [ ] Test rollback procedures
- [ ] Verify monitoring queries
- [ ] Document incident response procedures
- [ ] Train on-call team

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Status:** Reference Document
