# Return Service & Payment Service Integration

## 1. Overview

Return Service và Payment Service là hai microservice độc lập cần tích hợp:

- **Return Service**: Quản lý yêu cầu trả hàng, kiểm duyệt, logistics tracking
- **Payment Service**: Quản lý luồng tiền, hoàn tiền, ví nội bộ, thanh toán gateway

**Điểm kết nối:** Khi return_request kiểm duyệt thành công → Return Service gọi Payment Service để xử lý refund

---

## 2. Payment Service Architecture (Tóm Tắt)

### 2.1. Database Tables in Payment Service

| Bảng                    | Mục Đích                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| `payment_transaction`   | Ghi tất cả giao dịch (ORDER_PAYMENT, **REFUND_PAYOUT**, WALLET_TOPUP, v.v.) |
| `refund_request`        | Yêu cầu hoàn tiền                                                           |
| `refund_status_history` | Lịch sử trạng thái hoàn tiền                                                |
| `payment_wallet`        | Ví nội bộ của user                                                          |
| `wallet_transaction`    | Biến động ví                                                                |
| `payment_gateway_log`   | Log tương tác với gateway                                                   |
| `payment_webhook_event` | Webhook từ payment gateway                                                  |

### 2.2. Transaction Types in Payment Service

```
ORDER_PAYMENT     → user thanh toán đơn hàng
WALLET_TOPUP      → user nạp ví
WALLET_WITHDRAW   → user rút ví
REFUND_PAYOUT     → ⭐ hoàn tiền (từ return_request)
SETTLEMENT_PAYOUT → thanh toán cho shop
PLATFORM_FEE      → thu phí nền tảng
ADJUSTMENT        → điều chỉnh thủ công
```

### 2.3. Refund Request Structure (Payment Service)

```sql
refund_request {
  id: BIGINT,
  order_id: BIGINT,              -- tham chiếu từ ecommerce.order
  order_payment_id: BIGINT,      -- payment_transaction.id của ORDER_PAYMENT
  refund_amount: DECIMAL,
  refund_method: ENUM(ORIGINAL_PAYMENT, WALLET, BANK_TRANSFER),
  status: ENUM(PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED),
  ref_type: VARCHAR (RETURN để tham chiếu từ return service)
  ref_id: BIGINT (return_request_id từ ecommerce database)
}
```

---

## 3. Integration Flow: Return → Payment

### 3.1. High-Level Flow

```
RETURN SERVICE                     PAYMENT SERVICE
    │                                   │
    ├─ Kiểm duyệt hàng SUCCESS          │
    │  (inspection_passed)              │
    │                                   │
    ├─ Chuẩn bị refund request ──────┐  │
    │                                 │  │
    │                                 v  │
    │                              1. Lấy original payment_transaction
    │                              2. Xác định refund method
    │                              3. Tạo refund_request
    │                              4. Xử lý hoàn tiền
    │                              5. Update payment_transaction
    │                              │
    │◄─────────────────────────────┤  │
    │ Webhook: refund.success      │  │
    │                              │  │
    ├─ Update return.status = REFUNDED
    ├─ Add stock back
    └─ Send notification
```

### 3.2. Step-by-Step Process

#### Step 1: Tạo Return → Kiểm Duyệt → Payment Call

**Return Service:**

```typescript
// src/return/service/ReturnInspectionService.ts

async passInspection(returnRequestId: number, notes: string) {
  // 1. Cập nhật inspection status
  const inspection = await this.inspectionRepository.update(returnRequestId, {
    status: 'PASSED',
    inspection_date: new Date(),
  });

  // 2. Cập nhật return_request status
  const returnRequest = await this.returnRepository.update(returnRequestId, {
    status: 'INSPECTION_PASSED',
  });

  // 3. Gọi Payment Service để tạo refund
  try {
    const refundResponse = await this.paymentService.createRefund({
      return_request_id: returnRequestId,
      order_id: returnRequest.order_id,
      refund_amount: returnRequest.approved_amount,
      // refund_method sẽ được payment service xác định dựa trên original payment
      reason: 'RETURN_INSPECTION_PASSED',
    });

    // 4. Lưu payment transaction ID để tracking
    await this.returnRepository.update(returnRequestId, {
      payment_transaction_id: refundResponse.payment_transaction_id,
    });

    // 5. Ghi timeline
    await this.createTimeline(returnRequestId, 'REFUND_INITIATED', {
      payment_txn_id: refundResponse.payment_transaction_id,
    });

  } catch (error) {
    this.logger.error('Failed to initiate refund', error);
    // Không throw - return vẫn ở INSPECTION_PASSED, retry sau
    await this.createTimeline(returnRequestId, 'REFUND_FAILED', {
      error: error.message,
    });
  }
}
```

#### Step 2: Payment Service Xử Lý Refund

**Payment Service:**

```typescript
// Pseudo-code mô tả logic trong payment service

async createRefund(request: RefundRequest) {
  // 1. Lấy original order payment
  const originalPayment = await paymentTxnRepository.findByOrderId(
    request.order_id,
    { status: 'SUCCESS', txn_type: 'ORDER_PAYMENT' }
  );

  if (!originalPayment) {
    throw new Error('Original payment not found');
  }

  // 2. Xác định refund method dựa trên payment method
  const refundMethod = this.determineRefundMethod(
    originalPayment.payment_method,
    daysSinceRefund
  );
  // VD: 'COD' → WALLET, 'VNPAY' → ORIGINAL_PAYMENT

  // 3. Tạo refund_request
  const refundRequest = await refundRepository.create({
    order_id: request.order_id,
    order_payment_id: originalPayment.id,
    refund_amount: request.refund_amount,
    refund_method: refundMethod,
    ref_type: 'RETURN',
    ref_id: request.return_request_id,
    status: 'PENDING',
  });

  // 4. Tạo payment_transaction (REFUND_PAYOUT)
  const refundTxn = await paymentTxnRepository.create({
    txn_code: `TXN-REFUND-${refundRequest.id}`,
    txn_type: 'REFUND_PAYOUT',
    ref_type: 'REFUND',
    ref_id: refundRequest.id,
    ref_code: `REFUND-${refundRequest.id}`,
    payer_type: 'PLATFORM',
    payee_type: 'USER',
    payee_id: originalPayment.user_id,
    net_amount: request.refund_amount,
    payment_method: refundMethod,
    status: 'PROCESSING',
  });

  // 5. Xử lý hoàn tiền dựa trên method
  if (refundMethod === 'WALLET') {
    await this.refundToWallet(originalPayment.user_id, request.refund_amount);
    refundTxn.status = 'SUCCESS';
  } else if (refundMethod === 'ORIGINAL_PAYMENT') {
    await this.refundToGateway(originalPayment, request.refund_amount);
    refundTxn.status = 'PROCESSING'; // Chờ gateway confirm
  } else if (refundMethod === 'BANK_TRANSFER') {
    // Manual processing - đánh dấu chờ admin xử lý
    refundTxn.status = 'PENDING';
  }

  await paymentTxnRepository.save(refundTxn);

  // 6. Gửi webhook về Return Service
  await this.sendWebhook('refund.initiated', {
    refund_id: refundRequest.id,
    payment_txn_id: refundTxn.id,
    status: refundTxn.status,
    return_request_id: request.return_request_id,
  });

  return {
    refund_id: refundRequest.id,
    payment_transaction_id: refundTxn.id,
    status: refundTxn.status,
  };
}

// Refund to wallet
private async refundToWallet(userId: number, amount: number) {
  const wallet = await walletRepository.findOrCreate(userId);

  wallet.available_balance += amount;
  await walletRepository.save(wallet);

  // Ghi wallet transaction
  await walletTxnRepository.create({
    wallet_id: wallet.id,
    txn_type: 'REFUND_CREDIT',
    amount: amount,
    balance_before: wallet.available_balance - amount,
    balance_after: wallet.available_balance,
  });
}

// Refund to gateway (reverse)
private async refundToGateway(
  originalPayment: PaymentTransaction,
  refundAmount: number
) {
  const gateway = this.getGateway(originalPayment.gateway_code);

  try {
    const result = await gateway.refund({
      txn_id: originalPayment.gateway_txn_id,
      amount: refundAmount,
    });

    return {
      gateway_refund_id: result.refund_id,
      success: true,
    };
  } catch (error) {
    throw new Error(`Gateway refund failed: ${error.message}`);
  }
}
```

#### Step 3: Webhook → Return Service Cập Nhật

**Return Service Webhook Handler:**

```typescript
// src/return/controller/ReturnPaymentWebhookController.ts

@Post('payment-refund')
async handlePaymentRefundWebhook(@Body() payload: any) {
  const { return_request_id, refund_id, status, payment_txn_id } = payload;

  if (status === 'SUCCESS') {
    // Refund successful - update return request
    await this.returnRepository.update(return_request_id, {
      status: 'REFUNDED',
      refunded_amount: payload.refund_amount,
    });

    // Add stock back
    await this.stockService.adjustStock({
      return_request_id,
      adjustment_type: 'ADD',
    });

    // Send notification
    await this.notificationService.sendRefundSuccess(return_request_id);

    // Timeline
    await this.createTimeline(return_request_id, 'REFUND_SUCCESS', {
      refund_id,
      payment_txn_id,
    });

  } else if (status === 'FAILED') {
    // Refund failed - stay at INSPECTION_PASSED, will retry
    await this.createTimeline(return_request_id, 'REFUND_FAILED', {
      reason: payload.failure_reason,
    });

    // Schedule retry
    await this.scheduleRefundRetry(return_request_id);

  } else if (status === 'PROCESSING') {
    // Chờ gateway confirm (VNPAY, MOMO)
    await this.returnRepository.update(return_request_id, {
      status: 'REFUND_PROCESSING',
    });
  }
}
```

---

## 4. Database Changes Required

### 4.1. Add Columns to return_refund_schema

**File: return_refund_schema.sql**

```sql
-- Thêm vào bảng return_request
ALTER TABLE `return_request` ADD COLUMN `payment_transaction_id` BIGINT NULL
  COMMENT 'Reference to payment_db.payment_transaction.id';

ALTER TABLE `return_request` ADD COLUMN `refund_id` BIGINT NULL
  COMMENT 'Reference to payment_db.refund_request.id';

ALTER TABLE `return_request` ADD COLUMN `payment_status` VARCHAR(20) NULL
  COMMENT 'PENDING, PROCESSING, SUCCESS, FAILED - từ payment service';

ALTER TABLE `return_request` ADD COLUMN `refund_method` VARCHAR(30) NULL
  COMMENT 'ORIGINAL_PAYMENT, WALLET, BANK_TRANSFER - được payment service xác định';

ALTER TABLE `return_request` ADD COLUMN `refund_retry_count` INT DEFAULT 0
  COMMENT 'Số lần retry hoàn tiền';

ALTER TABLE `return_request` ADD COLUMN `next_refund_retry_at` TIMESTAMP NULL
  COMMENT 'Thời gian retry hoàn tiền tiếp theo';

-- Thêm indexes
ALTER TABLE `return_request` ADD INDEX idx_payment_transaction_id (payment_transaction_id);
ALTER TABLE `return_request` ADD INDEX idx_refund_id (refund_id);
ALTER TABLE `return_request` ADD INDEX idx_payment_status (payment_status);
```

### 4.2. Remove refund_transaction Table (Optional)

Nếu dùng payment_db để quản lý tất cả refund:

```sql
-- Bảng refund_transaction không cần nữa, dùng payment_db thay thế
DROP TABLE IF EXISTS `refund_transaction`;
```

---

## 5. API Contracts

### 5.1. Return Service → Payment Service

#### Create Refund

```http
POST http://payment-service:8080/api/v1/refunds/create
Content-Type: application/json
Authorization: Bearer SERVICE_TOKEN

{
  "return_request_id": 1,
  "order_id": 12345,
  "refund_amount": 500000,
  "reason": "RETURN_INSPECTION_PASSED",
  "idempotency_key": "REFUND-1-1"
}

Response (201):
{
  "refund_id": 100,
  "payment_transaction_id": 9001,
  "status": "PROCESSING",
  "refund_method": "WALLET",
  "estimated_completion": "2026-04-24T16:00:00Z"
}
```

#### Get Refund Status

```http
GET http://payment-service:8080/api/v1/refunds/100
Authorization: Bearer SERVICE_TOKEN

Response (200):
{
  "refund_id": 100,
  "order_id": 12345,
  "refund_amount": 500000,
  "status": "SUCCESS",
  "refund_method": "WALLET",
  "completed_at": "2026-04-24T15:30:00Z",
  "payment_transaction_id": 9001
}
```

#### Retry Refund

```http
POST http://payment-service:8080/api/v1/refunds/100/retry
Authorization: Bearer SERVICE_TOKEN

{
  "idempotency_key": "REFUND-1-2"
}

Response (200):
{
  "refund_id": 100,
  "status": "PROCESSING"
}
```

### 5.2. Payment Service → Return Service (Webhook)

#### Refund Status Updated

```http
POST {return_service_url}/api/v1/webhooks/payment-refund
Content-Type: application/json
X-Payment-Signature: hmac_sha256_signature

{
  "event_type": "refund.success",
  "event_id": "evt_refund_123",
  "timestamp": "2026-04-24T15:30:00Z",
  "data": {
    "refund_id": 100,
    "return_request_id": 1,
    "order_id": 12345,
    "refund_amount": 500000,
    "refund_method": "WALLET",
    "status": "SUCCESS",
    "payment_transaction_id": 9001,
    "completed_at": "2026-04-24T15:30:00Z"
  }
}
```

---

## 6. Error Handling & Retry Strategy

### 6.1. Common Refund Errors

| Error                 | Cause                 | Action                   |
| --------------------- | --------------------- | ------------------------ |
| `GATEWAY_UNAVAILABLE` | Payment gateway down  | Retry sau 1 giờ          |
| `INVALID_CARD`        | Card hết hạn/bị block | Fallback BANK_TRANSFER   |
| `INSUFFICIENT_WALLET` | Ví nội bộ không đủ    | Alert admin, hold refund |
| `DUPLICATE_REFUND`    | Refund đã được xử lý  | Return cached response   |
| `TIMEOUT`             | Request timeout       | Retry với backoff        |

### 6.2. Retry Logic in Return Service

```typescript
// Scheduled job để retry failed refunds
@Cron('0 */6 * * *')  // Mỗi 6 giờ
async retryFailedRefunds() {
  // Tìm return requests với INSPECTION_PASSED
  // nhưng refund vẫn chưa success
  const failedReturns = await this.returnRepository.find({
    status: 'INSPECTION_PASSED',
    refund_retry_count: { $lt: 7 },  // Max 7 retries
    next_refund_retry_at: { $lte: new Date() },
  });

  for (const ret of failedReturns) {
    try {
      await this.paymentService.retryRefund(ret.id);
      ret.refund_retry_count++;
      ret.next_refund_retry_at = addHours(new Date(), 24);
      await this.returnRepository.save(ret);
    } catch (error) {
      this.logger.error(`Refund retry failed: ${ret.id}`, error);

      // Alert admin nếu > 5 lần thất bại
      if (ret.refund_retry_count >= 5) {
        await this.alertAdmin(`Return ${ret.id} refund stuck`);
      }
    }
  }
}
```

---

## 7. Monitoring & Observability

### 7.1. Metrics to Track

```
- Refund creation latency (P50, P95, P99)
- Refund success rate (%)
- Refund method distribution (WALLET %, ORIGINAL %, BANK %)
- Payment gateway response time
- Webhook delivery latency
- Retry count distribution
```

### 7.2. Alerts

```
- Refund stuck > 7 days → Alert admin
- Refund failure rate > 10% → Alert on-call engineer
- Gateway timeout > 30s → Alert
- Webhook delivery failure > 3 retries → Alert
- Wallet refund insufficiency → Alert finance
```

---

## 8. Testing

### 8.1. Unit Tests

```typescript
describe("Return Inspection → Payment Refund", () => {
  it("should trigger refund on inspection passed", async () => {
    const returnRequest = await createReturnRequest();

    await inspectionService.passInspection(returnRequest.id);

    // Verify payment service was called
    expect(paymentService.createRefund).toHaveBeenCalledWith(
      expect.objectContaining({
        return_request_id: returnRequest.id,
        refund_amount: returnRequest.approved_amount,
      }),
    );
  });

  it("should handle refund failure gracefully", async () => {
    paymentService.createRefund.mockRejectedValue(
      new Error("Gateway unavailable"),
    );

    await inspectionService.passInspection(returnRequest.id);

    // Return should stay at INSPECTION_PASSED
    const updated = await returnRepository.findById(returnRequest.id);
    expect(updated.status).toBe("INSPECTION_PASSED");
  });
});
```

### 8.2. Integration Tests

```typescript
describe('Return-Payment Integration', () => {
  it('should complete full refund flow', async () => {
    // 1. Create return request
    const returnRequest = await returnService.createRequest({...});

    // 2. Pass inspection
    await inspectionService.passInspection(returnRequest.id);

    // 3. Simulate payment webhook
    await webhookHandler.handlePaymentRefund({
      return_request_id: returnRequest.id,
      status: 'SUCCESS',
      refund_amount: 500000,
    });

    // 4. Verify final state
    const final = await returnRepository.findById(returnRequest.id);
    expect(final.status).toBe('REFUNDED');
    expect(final.refunded_amount).toBe(500000);
  });
});
```

---

## 9. Configuration

### 9.1. Environment Variables

```properties
# Payment Service
PAYMENT_SERVICE_URL=http://payment-service:8080
PAYMENT_SERVICE_API_KEY=your_api_key_here
PAYMENT_WEBHOOK_SECRET=your_webhook_secret_here

# Refund Configuration
REFUND_DEFAULT_METHOD=WALLET
REFUND_GATEWAY_TIMEOUT_SECONDS=30
REFUND_MAX_RETRIES=7
REFUND_RETRY_BACKOFF_HOURS=24

# Webhook
PAYMENT_WEBHOOK_URL=https://api.ecommerce.com/api/v1/webhooks/payment-refund
```

### 9.2. Service Configuration

**File: `src/shared/payment/payment.config.ts`**

```typescript
export const paymentConfig = {
  apiUrl: process.env.PAYMENT_SERVICE_URL,
  apiKey: process.env.PAYMENT_SERVICE_API_KEY,
  timeout: 30000,

  refund: {
    defaultMethod: "WALLET",
    maxRetries: 7,
    retryBackoffHours: 24,
    methods: {
      WALLET: { priority: 1, instant: true },
      ORIGINAL_PAYMENT: { priority: 2, instant: false },
      BANK_TRANSFER: { priority: 3, instant: false },
    },
  },

  webhook: {
    secret: process.env.PAYMENT_WEBHOOK_SECRET,
    url: process.env.PAYMENT_WEBHOOK_URL,
    timeout: 10000,
  },
};
```

---

## 10. Deployment Checklist

- [ ] Return service có endpoint webhook để nhận payment events
- [ ] Payment service đã cấu hình Return service URL
- [ ] Database columns được add (payment_transaction_id, refund_id, etc.)
- [ ] Idempotency key strategy được implement
- [ ] Error handling & retry logic được test
- [ ] Monitoring & alerts được setup
- [ ] Webhook signature verification được test
- [ ] Integration tests passed
- [ ] Load testing done
- [ ] Documentation updated

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Status:** Ready for Implementation
