# Payment Service — Tiến trình xây dựng

## Hoàn thành ✅

### 1. Entity Classes (12 bảng)
- ✅ PaymentGatewayConfig — Cấu hình cổng thanh toán
- ✅ PaymentTransaction — Bảng giao dịch tổng quát (CORE)
- ✅ PaymentStatusHistory — Lịch sử trạng thái giao dịch
- ✅ PaymentGatewayLog — Log giao tiếp gateway
- ✅ PaymentWebhookEvent — Webhook events (idempotency)
- ✅ RefundRequest — Yêu cầu hoàn tiền
- ✅ RefundStatusHistory — Lịch sử trạng thái hoàn tiền
- ✅ SellerSettlement — Lô thanh toán cho shop
- ✅ SellerSettlementItem — Chi tiết đơn trong lô
- ✅ PaymentWallet — Ví điện tử nội bộ
- ✅ WalletTransaction — Ledger biến động ví
- ✅ PaymentDispute — Tranh chấp giao dịch

**Vị trí:** `src/main/java/payment_service/com/entity/`

**Tính năng:**
- Đầy đủ annotations: @Entity, @Table, @Index, @ManyToOne, @PrePersist, @PreUpdate
- Hỗ trợ JSON fields (JsonNode) cho gateway_data, extra_data, evidence_urls, config_json
- Timestamps tự động quản lý
- Lombok annotations (@Data, @NoArgsConstructor, @AllArgsConstructor, @Builder)

---

### 2. JPA Repositories (12 repositories)
- ✅ PaymentGatewayConfigRepository
- ✅ PaymentTransactionRepository
- ✅ PaymentStatusHistoryRepository
- ✅ PaymentGatewayLogRepository
- ✅ PaymentWebhookEventRepository
- ✅ RefundRequestRepository
- ✅ RefundStatusHistoryRepository
- ✅ SellerSettlementRepository
- ✅ SellerSettlementItemRepository
- ✅ PaymentWalletRepository
- ✅ WalletTransactionRepository
- ✅ PaymentDisputeRepository

**Vị trí:** `src/main/java/payment_service/com/repository/`

**Tính năng:**
- Kế thừa JpaRepository<Entity, ID>
- Các query methods tùy chỉnh: findByCode, findByUserId, findByStatus, findByStatusAndCreatedAtBetween...
- Hỗ trợ sorting và ordering

---

### 3. Service Classes (5 services)
- ✅ PaymentTransactionService — CRUD + status management + history tracking
- ✅ RefundService — Create refund + status updates + history
- ✅ PaymentWalletService — Credit/Debit wallet + ledger logging
- ✅ SellerSettlementService — Settlement CRUD + item management
- ✅ PaymentDisputeService — Dispute management + resolution

**Vị trí:** `src/main/java/payment_service/com/service/`

**Tính năng:**
- @Service + @RequiredArgsConstructor
- @Transactional management
- Business logic: status transitions, validation, history recording
- Error handling với RuntimeException

---

### 4. REST Controllers (5 controllers)
- ✅ PaymentTransactionController — /api/v1/transactions
- ✅ RefundController — /api/v1/refunds
- ✅ PaymentWalletController — /api/v1/wallets
- ✅ SellerSettlementController — /api/v1/settlements
- ✅ PaymentDisputeController — /api/v1/disputes

**Vị trí:** `src/main/java/payment_service/com/controller/`

**Endpoints:**

#### Transactions
- `POST /api/v1/transactions` — Tạo giao dịch
- `GET /api/v1/transactions/{txnCode}` — Lấy giao dịch theo mã
- `GET /api/v1/transactions/order/{orderId}` — Lấy giao dịch theo đơn hàng
- `GET /api/v1/transactions/user/{userId}` — Danh sách giao dịch của user
- `GET /api/v1/transactions/search?txnType=X&status=Y` — Tìm kiếm
- `PUT /api/v1/transactions/{id}/status` — Cập nhật status

#### Refunds
- `POST /api/v1/refunds` — Tạo hoàn tiền
- `GET /api/v1/refunds/{refundCode}` — Lấy hoàn tiền
- `GET /api/v1/refunds/user/{userId}` — Danh sách hoàn tiền của user
- `GET /api/v1/refunds/status/{status}` — Lấy hoàn tiền theo status
- `PUT /api/v1/refunds/{id}/status` — Cập nhật status hoàn tiền

#### Wallets
- `GET /api/v1/wallets/user/{userId}` — Lấy ví (tạo nếu chưa có)
- `POST /api/v1/wallets/{userId}/credit` — Nạp tiền
- `POST /api/v1/wallets/{userId}/debit` — Rút tiền
- `GET /api/v1/wallets/{userId}/history` — Lịch sử ví

#### Settlements
- `POST /api/v1/settlements` — Tạo lô thanh toán
- `GET /api/v1/settlements/{settlementCode}` — Lấy settlement
- `GET /api/v1/settlements/shop/{shopId}` — Danh sách settlement của shop
- `GET /api/v1/settlements/status/{status}` — Lấy settlement theo status
- `PUT /api/v1/settlements/{id}/status` — Cập nhật status

#### Disputes
- `POST /api/v1/disputes` — Tạo tranh chấp
- `GET /api/v1/disputes/{disputeCode}` — Lấy tranh chấp
- `GET /api/v1/disputes/user/{userId}` — Danh sách tranh chấp của user
- `GET /api/v1/disputes/status/{status}` — Lấy tranh chấp theo status
- `PUT /api/v1/disputes/{id}/resolve` — Giải quyết tranh chấp

---

### 5. Configuration
- ✅ JpaConfig — Entity scan, repository scan, JPA auditing
- ✅ application.yml — Database connection (Aiven MySQL), JPA/Hibernate properties, logging

**Vị trí:** 
- Config: `src/main/java/payment_service/com/config/`
- Properties: `src/main/resources/application.yml`

---

## Cần làm tiếp ⏳

### 1. DTO Classes (Data Transfer Objects)
Các DTO để map entity → JSON response:
- CreatePaymentTransactionRequest / PaymentTransactionResponse
- CreateRefundRequest / RefundResponse
- WalletOperationRequest / WalletResponse
- CreateSettlementRequest / SettlementResponse
- CreateDisputeRequest / DisputeResponse
- ErrorResponse (for exception handling)

### 2. Exception Handling
- Custom exceptions: PaymentException, RefundException, WalletException
- Global exception handler: @ControllerAdvice + @ExceptionHandler
- HTTP status codes mapping

### 3. Service Logic Enhancements
- WebhookEventService — Process webhook events với idempotency
- PaymentGatewayService — Integrate with actual payment gateways (VNPAY, MOMO, etc.)
- GatewayLoggingService — Raw HTTP request/response logging
- ValidationService — Business rule validation

### 4. Integration Tests
- PaymentTransactionServiceTest
- RefundServiceTest
- PaymentWalletServiceTest
- Integration tests for repositories

### 5. API Documentation
- Swagger/OpenAPI configuration
- API endpoint documentation

### 6. Security & Auth
- JWT token validation (from API Gateway)
- Role-based access control (RBAC)
- Audit logging for sensitive operations

### 7. Message Queue Integration
- Kafka/RabbitMQ topics:
  - payment.transaction.created
  - payment.transaction.status_changed
  - refund.request.created
  - refund.status_changed
  - wallet.transaction.created
  - settlement.created

### 8. Scheduled Tasks
- Settlement batch processing
- Expired payment cleanup
- Refund timeout handling

---

## Thông tin kết nối Database

**Host:** mysql-2acda025-vothoai1503-2915.l.aivencloud.com  
**Port:** 21513  
**Database:** payment_db  
**User:** avnadmin  
**Password:** [Từ Aiven console]  

**Note:** Cập nhật password trong application.yml

---

## Cấu trúc thư mục

```
payment-service/
├── src/main/
│   ├── java/payment_service/com/
│   │   ├── entity/ (12 classes)
│   │   ├── repository/ (12 interfaces)
│   │   ├── service/ (5 classes)
│   │   ├── controller/ (5 classes)
│   │   ├── dto/ (TODO)
│   │   ├── exception/ (TODO)
│   │   ├── config/
│   │   │   └── JpaConfig.java
│   │   └── PaymentServiceApplication.java
│   └── resources/
│       └── application.yml
├── pom.xml
└── ...
```

---

## Kiểm tra dependencies trong pom.xml

Đảm bảo có:
- spring-boot-starter-data-jpa
- spring-boot-starter-web
- mysql-connector-java (8.0+)
- lombok
- jackson-databind (JSON)
- (Optional) springdoc-openapi-starter-webmvc-ui (Swagger)