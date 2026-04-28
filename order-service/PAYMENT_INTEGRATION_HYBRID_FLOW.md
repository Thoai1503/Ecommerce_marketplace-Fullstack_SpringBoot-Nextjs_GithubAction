# Order-Payment Hybrid Flow Guide

## 1. Muc tieu

Tai lieu nay mo ta luong tich hop chuan giua order-service va payment-service theo mo hinh hybrid:

- Sync call: order-service goi payment-service de lay paymentUrl ngay sau khi dat hang.
- Async event: payment-service phat event khi trang thai thanh toan thay doi, order-service consume de cap nhat order status.

Muc tieu chinh:

- Frontend nhan paymentUrl ngay lap tuc de redirect nguoi dung.
- He thong van dam bao eventual consistency cho trang thai thanh toan.
- Retry an toan nho idempotency key.

## 2. Tong quan kien truc

Thanh phan:

- Frontend
- order-service
- order DB
- payment-service
- payment DB
- payment gateway (VNPay, MoMo, ...)
- Kafka

Nguyen tac:

1. Order phai duoc save/commit truoc khi goi payment-service.
2. Moi order phai co idempotencyKey duy nhat theo dang ORDER-{orderId}.
3. Trang thai order PAID/FAILED/EXPIRED phai duoc cap nhat tu event cua payment-service, khong tu frontend.

## 3. Sequence flow

### Buoc 1: Dat hang

1. Frontend goi POST /api/orders vao order-service.
2. order-service tao order voi:

- orderStatus = PENDING
- paymentStatus = PENDING

3. order-service commit order vao DB va lay orderId/orderNumber.

### Buoc 2: Tao payment intent (sync)

4. order-service goi POST /api/v1/transactions/intents cua payment-service.
5. payment-service check idempotency theo (refType=ORDER, refId=orderId, txnType=ORDER_PAYMENT):

- Neu da ton tai transaction thi tra ve transaction cu (bao gom paymentUrl).
- Neu chua ton tai thi tao moi transaction + paymentUrl.

6. payment-service tra ve:

- txnCode
- status (PENDING)
- paymentUrl
- expiredAt

7. order-service luu txnCode/paymentUrl vao order va tra response cho frontend.

### Buoc 3: Xu ly thanh toan (async)

8. Frontend redirect nguoi dung sang paymentUrl.
9. Payment gateway goi webhook vao payment-service khi thanh toan thay doi trang thai.
10. payment-service cap nhat transaction status trong payment DB.
11. payment-service publish event payment.status.changed len Kafka.
12. order-service consume event va cap nhat order:

- SUCCESS -> orderStatus = CONFIRMED, paymentStatus = PAID
- FAILED or EXPIRED -> orderStatus = PENDING, paymentStatus = FAILED/EXPIRED

## 4. API contract de nghi

### 4.1 Request tao payment intent

Endpoint:

POST /api/v1/transactions/intents

Payload:

{
"idempotencyKey": "ORDER-123456",
"txnType": "ORDER_PAYMENT",
"refType": "ORDER",
"refId": 123456,
"refCode": "ORD-20260419-0001",
"payerType": "USER",
"payerId": 1001,
"payeeType": "SHOP",
"payeeId": 9001,
"grossAmount": 150000,
"discountAmount": 10000,
"feeAmount": 0,
"netAmount": 140000,
"currency": "VND",
"paymentMethod": "VNPAY",
"returnUrl": "https://frontend/orders/123456/payment-return",
"notifyUrl": "https://order-service/api/orders/payment/webhook"
}

### 4.2 Response tao payment intent

{
"txnCode": "TXN-20260419-ABC123",
"status": "PENDING",
"paymentUrl": "https://sandbox.vnpayment.vn/...",
"expiredAt": "2026-04-19T12:00:00"
}

## 5. Event contract de nghi

Topic:

payment.status.changed

Payload:

{
"txnCode": "TXN-20260419-ABC123",
"refType": "ORDER",
"refId": 123456,
"oldStatus": "PENDING",
"newStatus": "SUCCESS",
"paidAmount": 140000,
"occurredAt": "2026-04-19T11:05:12"
}

## 6. Mapping trang thai

### Payment transaction status

- PENDING
- PROCESSING
- SUCCESS
- FAILED
- EXPIRED
- CANCELLED
- REFUNDED

### Order status mapping trong order-service

- SUCCESS -> orderStatus = CONFIRMED, paymentStatus = PAID
- FAILED -> orderStatus = PENDING, paymentStatus = FAILED
- EXPIRED -> orderStatus = PENDING, paymentStatus = EXPIRED
- CANCELLED -> orderStatus = CANCELLED, paymentStatus = CANCELLED

## 7. Idempotency va retry

### 7.1 Idempotency

- idempotencyKey cua order phai co dang ORDER-{orderId}.
- payment-service phai unique theo bo (refType, refId, txnType) cho order payment.

### 7.2 Retry

- order-service retry sync call 2-3 lan cho loi network timeout.
- Neu van that bai:
- Giu order o PENDING_PAYMENT hoac INIT_FAILED.
- Cho phep trigger retry bang job/background worker.

## 8. Error handling checklist

1. payment-service timeout khi tao intent:

- Return loi ro rang cho frontend (co message retry).
- Khong tao duplicate order.

2. payment webhook gui trung lap:

- payment-service phai xu ly idempotent theo gateway event id.

3. order-service consume event muon:

- Xu ly event theo thu tu logic va bo qua event cu hon trang thai hien tai neu can.

4. Kafka tam thoi loi:

- Co DLQ va retry policy cho consumer.

## 9. Security checklist

- Ky webhook (HMAC/RSA) va verify signature tai payment-service.
- Khong tin trang thai tu frontend returnUrl.
- notifyUrl chi cho phep request tu gateway/payment-service hop le.
- Mask thong tin nhay cam trong log.

## 10. Monitoring va observability

Nen theo doi cac metric:

- So luong tao payment intent thanh cong/that bai
- Ti le timeout khi goi payment-service
- So event payment.status.changed duoc consume
- Do tre trung binh tu SUCCESS den khi order duoc cap nhat PAID

Log can co correlation:

- orderId
- orderNumber
- txnCode
- idempotencyKey

## 11. Implementation checklist cho codebase hien tai

1. order-service

- Tao PaymentServiceClient dung WebClient.
- Tao DTO CreatePaymentIntentRequest va PaymentIntentResponse.
- Trong luong placeOrder, goi payment intent sau khi save order.
- Luu txnCode/paymentUrl vao order de frontend redirect.

2. payment-service

- Them endpoint POST /api/v1/transactions/intents.
- Dam bao idempotency theo refType/refId/txnType.
- Publish payment.status.changed khi transaction doi status.

3. event

- order-service them consumer cho topic payment.status.changed.
- Map status dung bang mapping muc 6.

## 12. Rollout de nghi

Phase 1:

- Bat sync create intent va tra paymentUrl.
- Chua bat update order qua event (chi log event).

Phase 2:

- Bat consume event va update order status tu payment-service.
- Them canh bao metric timeout/retry.

Phase 3:

- Bo sung outbox pattern neu can tang do ben cho event publish.
- Hoan thien DLQ + replay tool.

## 13. Noi dat file lien quan

- Order service place order flow: [order-service/src/main/java/docker_test/com/service/OrderService.java](order-service/src/main/java/docker_test/com/service/OrderService.java)
- Order API endpoint: [order-service/src/main/java/docker_test/com/controller/OrderController.java](order-service/src/main/java/docker_test/com/controller/OrderController.java)
- Order model: [order-service/src/main/java/docker_test/com/model/Order.java](order-service/src/main/java/docker_test/com/model/Order.java)
- Order app config: [order-service/src/main/resources/application.properties](order-service/src/main/resources/application.properties)

---

Neu can, co the bo sung phan sample code theo dung class/package hien tai trong order-service va payment-service de doi ngu copy vao code truc tiep.
