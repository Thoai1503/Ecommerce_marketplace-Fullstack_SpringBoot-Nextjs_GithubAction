# Return Service & Payment Service - API Reference

## 1. Overview

Tài liệu này định nghĩa tất cả API contracts giữa:

- **Return Service** (Ecommerce side) - Quản lý yêu cầu trả & kiểm duyệt
- **Payment Service** (Payment side) - Xử lý hoàn tiền & ví nội bộ

---

## 2. Return Service Calling Payment Service

### 2.1 Create Refund (Hoàn Tiền)

**When:** Khi `return_request.status` chuyển từ `INSPECTION_PASSED` (hoặc approval manual)

**Endpoint:** `POST /api/v1/refunds/create`  
**Service:** Payment Service  
**Auth:** Bearer token (Service-to-Service)

#### Request

```http
POST http://payment-service:8080/api/v1/refunds/create
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Idempotency-Key: REFUND-1-1

{
  "return_request_id": 1,
  "order_id": 12345,
  "customer_id": 100,
  "refund_amount": 500000,
  "reason": "RETURN_INSPECTION_PASSED",
  "notes": "Product defective - inspection passed",
  "metadata": {
    "inspection_id": 5,
    "return_shipping_cost": 0,
    "restocking_fee": 0
  }
}
```

#### Parameters

| Field               | Type   | Required | Description                                                             |
| ------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| `return_request_id` | BIGINT | ✅       | ID của return_request từ ecommerce DB                                   |
| `order_id`          | BIGINT | ✅       | ID của order gốc                                                        |
| `customer_id`       | BIGINT | ✅       | ID của khách hàng                                                       |
| `refund_amount`     | BIGINT | ✅       | Số tiền hoàn (VND)                                                      |
| `reason`            | STRING | ✅       | Lý do hoàn (RETURN_INSPECTION_PASSED, RETURN_INSPECTION_FAILED_PARTIAL) |
| `notes`             | STRING | ❌       | Ghi chú thêm                                                            |
| `metadata`          | JSON   | ❌       | Dữ liệu bổ sung                                                         |

#### Response (201 Created)

```json
{
  "refund_id": 100,
  "payment_transaction_id": 9001,
  "order_id": 12345,
  "refund_amount": 500000,
  "refund_method": "WALLET",
  "status": "PROCESSING",
  "gateway_code": null,
  "created_at": "2026-04-24T14:30:00Z",
  "estimated_completion": "2026-04-24T14:35:00Z"
}
```

#### Response Fields

| Field                    | Type     | Description                                  |
| ------------------------ | -------- | -------------------------------------------- |
| `refund_id`              | BIGINT   | ID refund request trong payment_db           |
| `payment_transaction_id` | BIGINT   | ID payment_transaction (REFUND_PAYOUT)       |
| `refund_method`          | STRING   | WALLET, ORIGINAL_PAYMENT, hoặc BANK_TRANSFER |
| `status`                 | STRING   | PENDING, PROCESSING, SUCCESS, FAILED         |
| `estimated_completion`   | DATETIME | Dự kiến hoàn tất                             |

#### Error Responses

```json
// 400 Bad Request
{
  "error": "INVALID_REFUND_AMOUNT",
  "message": "Refund amount exceeds order total",
  "code": "ERR_VALIDATION"
}

// 404 Not Found
{
  "error": "ORDER_NOT_FOUND",
  "message": "Order #12345 not found in payment database",
  "code": "ERR_ORDER_NOT_FOUND"
}

// 409 Conflict
{
  "error": "DUPLICATE_REFUND",
  "message": "Refund already exists for this order",
  "code": "ERR_DUPLICATE_REFUND",
  "existing_refund_id": 99
}

// 503 Service Unavailable
{
  "error": "GATEWAY_UNAVAILABLE",
  "message": "Payment gateway is temporarily unavailable",
  "code": "ERR_GATEWAY_UNAVAILABLE",
  "retry_after": 60
}
```

#### Idempotency

```
Header: X-Idempotency-Key: REFUND-1-1

Nếu request được gửi 2 lần với cùng key:
- Lần đầu: Tạo refund, return 201
- Lần 2: Return cached response, return 200
```

---

### 2.2 Get Refund Status

**Endpoint:** `GET /api/v1/refunds/{refund_id}`  
**Service:** Payment Service

#### Request

```http
GET http://payment-service:8080/api/v1/refunds/100
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)

```json
{
  "refund_id": 100,
  "order_id": 12345,
  "return_request_id": 1,
  "refund_amount": 500000,
  "refund_method": "WALLET",
  "status": "SUCCESS",
  "payment_transaction_id": 9001,
  "gateway_code": null,
  "gateway_refund_id": null,
  "gateway_response_code": null,
  "created_at": "2026-04-24T14:30:00Z",
  "completed_at": "2026-04-24T14:32:15Z",
  "retry_count": 0,
  "notes": "Refunded to wallet"
}
```

---

### 2.3 Retry Failed Refund

**Endpoint:** `POST /api/v1/refunds/{refund_id}/retry`  
**Service:** Payment Service

#### Request

```http
POST http://payment-service:8080/api/v1/refunds/100/retry
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Idempotency-Key: REFUND-1-2

{
  "notes": "Retry attempt #1"
}
```

#### Response (200 OK)

```json
{
  "refund_id": 100,
  "status": "PROCESSING",
  "retry_count": 1,
  "next_retry_at": "2026-04-25T14:30:00Z"
}
```

#### Error Cases

```json
// 400 Bad Request - Already succeeded
{
  "error": "REFUND_ALREADY_COMPLETED",
  "message": "Refund already completed successfully",
  "status": "SUCCESS"
}

// 429 Too Many Retries
{
  "error": "MAX_RETRIES_EXCEEDED",
  "message": "Maximum retry attempts exceeded (7)",
  "retry_count": 7,
  "next_action": "Manual intervention required"
}
```

---

### 2.4 List Refunds for Return Request

**Endpoint:** `GET /api/v1/refunds?return_request_id={id}`  
**Service:** Payment Service

#### Request

```http
GET http://payment-service:8080/api/v1/refunds?return_request_id=1&status=SUCCESS
Authorization: Bearer ...
```

#### Response (200 OK)

```json
{
  "total": 1,
  "items": [
    {
      "refund_id": 100,
      "order_id": 12345,
      "refund_amount": 500000,
      "status": "SUCCESS",
      "refund_method": "WALLET",
      "completed_at": "2026-04-24T14:32:15Z"
    }
  ]
}
```

---

## 3. Payment Service Calling Return Service (Webhook)

### 3.1 Refund Success Webhook

**When:** Khi hoàn tiền thành công

**Endpoint:** `POST /api/v1/webhooks/payment-refund`  
**Service:** Return Service  
**Method:** Webhook (async)

#### Request Payload

```http
POST http://return-service:3001/api/v1/webhooks/payment-refund
Content-Type: application/json
X-Payment-Signature: sha256_hmac_signature_here
X-Payment-Timestamp: 1703056315
X-Payment-Event-ID: evt_refund_100_success

{
  "event_type": "refund.success",
  "event_id": "evt_refund_100_success",
  "timestamp": "2026-04-24T14:32:15Z",
  "data": {
    "refund_id": 100,
    "payment_transaction_id": 9001,
    "return_request_id": 1,
    "order_id": 12345,
    "customer_id": 100,
    "refund_amount": 500000,
    "refund_method": "WALLET",
    "status": "SUCCESS",
    "gateway_code": null,
    "completed_at": "2026-04-24T14:32:15Z",
    "metadata": {
      "wallet_balance_after": 5500000,
      "transaction_notes": "Refunded to customer wallet"
    }
  }
}
```

#### Webhook Signature Verification

```typescript
// Pseudo-code
const receivedSignature = headers["X-Payment-Signature"];
const timestamp = headers["X-Payment-Timestamp"];
const payload = JSON.stringify(body);

const expectedSignature = hmac_sha256(
  `${payload}.${timestamp}`,
  PAYMENT_WEBHOOK_SECRET,
);

if (receivedSignature !== expectedSignature) {
  throw new UnauthorizedException("Invalid signature");
}
```

#### Expected Response

```json
{
  "success": true,
  "event_id": "evt_refund_100_success",
  "processed_at": "2026-04-24T14:32:15.123Z"
}
```

**Status:** 202 Accepted (Webhook processed asynchronously)

---

### 3.2 Refund Failed Webhook

**Endpoint:** `POST /api/v1/webhooks/payment-refund`  
**Service:** Return Service

#### Request Payload

```json
{
  "event_type": "refund.failed",
  "event_id": "evt_refund_100_failed",
  "timestamp": "2026-04-24T14:35:00Z",
  "data": {
    "refund_id": 100,
    "return_request_id": 1,
    "order_id": 12345,
    "refund_amount": 500000,
    "status": "FAILED",
    "failure_reason": "GATEWAY_TIMEOUT",
    "failure_code": "ERR_GATEWAY_TIMEOUT",
    "retry_count": 1,
    "next_retry_at": "2026-04-25T14:35:00Z",
    "metadata": {
      "last_attempt_time": "2026-04-24T14:32:15Z",
      "gateway_error_code": "TIMEOUT_5000"
    }
  }
}
```

#### Expected Response

```json
{
  "success": true,
  "event_id": "evt_refund_100_failed",
  "processed_at": "2026-04-24T14:35:00.456Z"
}
```

---

### 3.3 Refund Processing Webhook

**Endpoint:** `POST /api/v1/webhooks/payment-refund`  
**Service:** Return Service

#### Request Payload

```json
{
  "event_type": "refund.processing",
  "event_id": "evt_refund_100_processing",
  "timestamp": "2026-04-24T14:30:05Z",
  "data": {
    "refund_id": 100,
    "return_request_id": 1,
    "refund_amount": 500000,
    "status": "PROCESSING",
    "refund_method": "ORIGINAL_PAYMENT",
    "gateway_code": "VNPAY",
    "estimated_completion": "2026-04-26T14:30:00Z",
    "metadata": {
      "gateway_order_id": "GW-100-VNPAY",
      "merchant_id": "merchant_123"
    }
  }
}
```

---

## 4. Status Transitions

### 4.1 Return Service Status Flow

```
┌─────────────────────────────────────────────┐
│ Return Service States                       │
├─────────────────────────────────────────────┤
│                                             │
│ PENDING_APPROVAL ─────────────────────┐   │
│    │                                  │   │
│    ├─ (auto rejected if expired)      │   │
│    │  └─> REJECTED                    │   │
│    │                                  │   │
│    └─ (seller approves)               │   │
│       └─> APPROVED                    │   │
│                                       │   │
│ APPROVED ───> SHIPPING ──> RECEIVED   │   │
│                                       │   │
│ RECEIVED ────> INSPECTION_IN_PROGRESS │   │
│                                       │   │
│ INSPECTION_IN_PROGRESS ───┐           │   │
│                           │           │   │
│              ┌────────────┘           │   │
│              │                        │   │
│              ├─> INSPECTION_FAILED    │   │
│              │   └─> CANCELLED        │   │
│              │                        │   │
│              └─> INSPECTION_PASSED    │   │
│                  │                    │   │
│ (Call Payment)   │                    │   │
│   Service        │                    │   │
│                  v                    │   │
│            REFUND_PROCESSING          │   │
│                  │                    │   │
│    ┌─────────────┼─────────────┐      │   │
│    │ webhook:    │ webhook:    │      │   │
│    │ success     │ failed      │      │   │
│    │             │             │      │   │
│    v             v             │      │   │
│ REFUNDED    REFUND_FAILED      │      │   │
│              (retry loop)      │      │   │
│                │               │      │   │
│                └───────────────┘      │   │
│                                       │   │
└───────────────────────────────────────┼───┘
```

### 4.2 Payment Service Status Flow

```
PENDING
  │
  v
PROCESSING
  │
  ├─ (WALLET) ──> SUCCESS (instant)
  │
  ├─ (ORIGINAL_PAYMENT) ──> PROCESSING
  │                           │
  │                           ├─ (gateway success) ──> SUCCESS
  │                           │
  │                           ├─ (gateway failed) ──> FAILED
  │
  ├─ (BANK_TRANSFER) ──> PENDING
  │                       │
  │                       └─ (admin confirms) ──> SUCCESS
  │
  └─ (timeout/error) ──> FAILED
                         │
                         └─ (retry) ──> PROCESSING
                                         │
                                         └─ ...
```

---

## 5. Error Codes & Mapping

### 5.1 Payment Service Error Codes

| Code                    | HTTP | Message                     | Action               |
| ----------------------- | ---- | --------------------------- | -------------------- |
| `INVALID_REFUND_AMOUNT` | 400  | Refund amount exceeds order | Validate amount      |
| `ORDER_NOT_FOUND`       | 404  | Order not in DB             | Check order_id       |
| `DUPLICATE_REFUND`      | 409  | Refund already exists       | Skip or use existing |
| `GATEWAY_TIMEOUT`       | 503  | Gateway timeout             | Retry after 60s      |
| `GATEWAY_ERROR`         | 502  | Gateway error               | Retry with backoff   |
| `INSUFFICIENT_WALLET`   | 400  | Wallet insufficient         | Alert finance        |
| `MAX_RETRIES_EXCEEDED`  | 429  | Too many retries            | Manual intervention  |

### 5.2 Return Service Actions on Errors

| Payment Error        | Return Service Action                            |
| -------------------- | ------------------------------------------------ |
| PROCESSING           | Stay at INSPECTION_PASSED, wait for webhook      |
| SUCCESS              | Update to REFUNDED, add stock, send notification |
| FAILED               | Stay at INSPECTION_PASSED, schedule retry        |
| GATEWAY_TIMEOUT      | Retry via scheduled job (exponential backoff)    |
| MAX_RETRIES_EXCEEDED | Alert admin, hold for manual decision            |

---

## 6. Transaction ID Mapping

### 6.1 Cross-Service IDs

```
┌─────────────────────────────────────────────┐
│ ECOMMERCE_DB                                │
├─────────────────────────────────────────────┤
│ return_request.id = 1                       │
│ return_request.payment_transaction_id = 9001│
│ return_request.refund_id = 100              │
└─────────────────────────────────────────────┘
                │
                v
┌─────────────────────────────────────────────┐
│ PAYMENT_DB                                  │
├─────────────────────────────────────────────┤
│ refund_request.id = 100                     │
│ refund_request.ref_id = 1 (return_request)  │
│ refund_request.ref_type = 'RETURN'          │
│ payment_transaction.id = 9001               │
│ payment_transaction.txn_type = 'REFUND_PAYOUT'
│ payment_transaction.ref_type = 'REFUND'     │
│ payment_transaction.ref_id = 100            │
└─────────────────────────────────────────────┘
```

### 6.2 Query Examples

```sql
-- Find refund by return_request_id
SELECT * FROM payment_db.refund_request
WHERE ref_type = 'RETURN' AND ref_id = 1;

-- Find payment transaction for refund
SELECT * FROM payment_db.payment_transaction
WHERE txn_type = 'REFUND_PAYOUT' AND ref_id = 100;

-- Find refund via return_request
SELECT rr.*, rt.*
FROM ecommerce.return_request rr
LEFT JOIN payment_db.refund_request rt
  ON rr.refund_id = rt.id
WHERE rr.id = 1;
```

---

## 7. Rate Limiting & Timeouts

### 7.1 Request Limits

| Endpoint          | Rate Limit | Burst          |
| ----------------- | ---------- | -------------- |
| Create Refund     | 100/min    | 10             |
| Get Refund Status | 1000/min   | 50             |
| Retry Refund      | 10/min     | 2              |
| Webhooks          | Unlimited  | 100 concurrent |

### 7.2 Timeouts

| Operation         | Timeout | Retry               |
| ----------------- | ------- | ------------------- |
| Create Refund API | 30s     | 3x with backoff     |
| Get Refund Status | 10s     | 2x with backoff     |
| Webhook delivery  | 10s     | 5x exponential      |
| Gateway timeout   | 30s     | Yes (via scheduler) |

---

## 8. Example Implementation

### TypeScript Client (Return Service)

```typescript
// src/shared/payment/PaymentClient.ts

import axios from "axios";

export class PaymentServiceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  constructor(baseUrl: string, apiKey: string, webhookSecret: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  async createRefund(
    payload: CreateRefundRequest,
  ): Promise<CreateRefundResponse> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/refunds/create`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Idempotency-Key": payload.idempotency_key,
        },
        timeout: 30000,
      },
    );
    return response.data;
  }

  async getRefundStatus(refundId: number): Promise<GetRefundResponse> {
    const response = await axios.get(
      `${this.baseUrl}/api/v1/refunds/${refundId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      },
    );
    return response.data;
  }

  async retryRefund(refundId: number): Promise<RetryRefundResponse> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/refunds/${refundId}/retry`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Idempotency-Key": `REFUND-${refundId}-${Date.now()}`,
        },
        timeout: 30000,
      },
    );
    return response.data;
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string,
  ): boolean {
    const crypto = require("crypto");
    const message = `${payload}.${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(message)
      .digest("hex");

    return expectedSignature === signature;
  }
}

// Usage
const paymentClient = new PaymentServiceClient(
  process.env.PAYMENT_SERVICE_URL,
  process.env.PAYMENT_SERVICE_API_KEY,
  process.env.PAYMENT_WEBHOOK_SECRET,
);

// Create refund
const refundResponse = await paymentClient.createRefund({
  return_request_id: 1,
  order_id: 12345,
  refund_amount: 500000,
  reason: "RETURN_INSPECTION_PASSED",
  idempotency_key: `REFUND-1-${Date.now()}`,
});

console.log("Refund created:", refundResponse);
```

---

## 9. Testing Scenarios

### Test Case 1: Successful WALLET Refund

```
1. POST /api/v1/refunds/create
   → Response: PROCESSING

2. Payment Service processes immediately
   → Webhook: refund.success

3. Return Service receives webhook
   → Update return_request.status = REFUNDED

Result: ✅ PASSED
```

### Test Case 2: Failed ORIGINAL_PAYMENT Refund

```
1. POST /api/v1/refunds/create
   → Response: PROCESSING

2. Payment Service calls gateway
   → Gateway timeout

3. Webhook: refund.failed

4. Return Service stays at INSPECTION_PASSED

5. Scheduled retry (after 24h)
   → Succeeds on 2nd attempt

Result: ✅ PASSED (with retry)
```

### Test Case 3: Duplicate Refund Prevention

```
1. POST /api/v1/refunds/create (X-Idempotency-Key: KEY1)
   → Response: refund_id=100

2. POST /api/v1/refunds/create (same X-Idempotency-Key: KEY1)
   → Response: refund_id=100 (same, cached)

Result: ✅ PASSED (Idempotent)
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Status:** Reference Document
