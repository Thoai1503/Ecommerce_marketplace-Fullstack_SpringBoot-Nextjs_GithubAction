# 📋 Return & Refund Workflow - Complete Implementation Guide (v2)

**Status:** ✅ **Ready for Production**  
**Last Updated:** 2026-04-24  
**Integration:** Logistics Service + Payment Service

---

## 📚 Complete Documentation Set

### 1. **REFUND_RETURN_WORKFLOW.md** (14 Sections) ⭐

**Tài liệu kinh doanh chi tiết**

- ✅ Prompt tổng thể & objectives
- ✅ Vòng đời return request (9 trạng thái)
- ✅ Điều kiện trả hàng
- ✅ Data model (6 bảng chính)
- ✅ Business rules (6 nhóm)
- ✅ 8 API specifications
- ✅ Frontend UI/UX
- ✅ Admin Dashboard
- ✅ Integration flows
- ✅ Error handling
- ✅ SQL triggers
- ✅ Testing strategy
- ✅ Implementation roadmap

**Purpose:** Hiểu rõ workflow & thiết kế hệ thống  
**Audience:** Product Manager, Architect, Developer

---

### 2. **RETURN_LOGISTICS_INTEGRATION.md** (10 Sections)

**Hướng dẫn tích hợp với Logistic Service**

- 📡 Logistics API endpoints
- 🔔 Webhook events & payload
- 💻 TypeScript implementation
- 🛠️ NestJS setup
- 🧪 Test cases
- ⚠️ Error handling

**Purpose:** Tích hợp Return Service với Logistics Service  
**API:** REST + Webhook  
**Audience:** Backend Developer, DevOps

---

### 3. **RETURN_PAYMENT_INTEGRATION.md** (10 Sections) 🆕

**Hướng dẫn tích hợp với Payment Service**

- 💰 Payment Service architecture
- 📊 Transaction types (ORDER_PAYMENT, REFUND_PAYOUT, etc.)
- 🔄 Refund flow with Payment Service
- 📋 Refund methods (WALLET, ORIGINAL_PAYMENT, BANK_TRANSFER)
- 💻 TypeScript implementation
- 📡 API contracts
- 🧪 Test cases
- ⚠️ Error handling & retry

**Purpose:** Xử lý hoàn tiền via Payment Service  
**API:** REST + Webhook  
**Audience:** Backend Developer, Payment Integration Engineer

---

### 4. **return_refund_schema.sql** (10 Tables)

**SQL migration - Ecommerce Database**

**Bảng chính:**

```
return_policy              (Chính sách trả hàng)
return_request             (Yêu cầu trả hàng)
return_shipment            (Đơn vận chuyển trả)
return_shipment_history    (Lịch sử vận chuyển)
return_inspection          (Kiểm duyệt hàng)
stock_adjustment_from_return (Điều chỉnh tồn kho)
return_request_attachment  (Ảnh/tài liệu)
return_request_timeline    (Timeline sự kiện)
logistics_webhook_log      (Ghi nhật ký logistics)
```

**Note:** Bảng `refund_transaction` **được loại bỏ** - dùng `payment_db.refund_request` thay thế

---

### 5. **DEPLOYMENT_GUIDE.md** (14 Sections)

**Hướng dẫn triển khai từng bước**

- 🚀 Chuẩn bị
- 📊 Database schema
- 🔗 Logistics integration
- ⚙️ Payment integration
- 🧪 Testing workflow
- 📈 Monitoring
- ✅ Validation
- 🔧 Troubleshooting
- ↩️ Rollback plan

**Purpose:** Step-by-step deployment  
**Audience:** DevOps, DBA, Implementation Team

---

## 🔄 Complete Integration Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    RETURN & REFUND WORKFLOW v2                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  KHÁCH HÀNG                  LOGISTICS         PAYMENT SERVICE      │
│     │                            │                   │              │
│     ├─ Tạo return request ──────>│                   │              │
│     │                            │                   │              │
│     │◄─ Chờ phê duyệt ──────────┤                   │              │
│     │     (seller duyệt)         │                   │              │
│     │                            │                   │              │
│     ├─ Nhận tracking code ──────>│                   │              │
│     │    (vận chuyển trả)        │                   │              │
│     │                            │                   │              │
│     ├─ Gửi hàng trả ───────────>│ Tracking        │              │
│     │                            │ Updates         │              │
│     │◄─ Cập nhật status ────────┤ (Webhook)       │              │
│     │                            │                   │              │
│     │     [HÀNG ĐÃ NHẬP KHO]     │                   │              │
│     │                            │                   │              │
│     │    [KIỂM DUYỆT]            │                   │              │
│     │        │                   │                   │              │
│     │        v                   │                   │              │
│     │   ✅ PASSED or ❌ FAILED   │                   │              │
│     │        │                   │                   │              │
│     │        ├─ Nếu PASSED ─────────────────────────>│              │
│     │        │  Tạo refund request                   │              │
│     │        │                                       │              │
│     │        │                  Xử lý hoàn tiền      │              │
│     │        │                  (WALLET/PAYMENT/     │              │
│     │        │                   BANK_TRANSFER)      │              │
│     │        │                   │                   │              │
│     │◄───────┼───────────────────┼───────────────────┤              │
│     │        │    Webhook: refund.success            │              │
│     │        │                   │                   │              │
│     │  NHẬN TIỀN !!              │                   │              │
│     │                            │                   │              │
│  HOÀN THÀNH                                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Overview

### 3-Tier Microservice Architecture

```
┌────────────────────────────────────────────────────────┐
│                  ECOMMERCE DATABASE                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Return Service Tables (10 bảng)                │  │
│  │  - return_request                               │  │
│  │  - return_shipment                              │  │
│  │  - return_inspection                            │  │
│  │  - stock_adjustment_from_return                 │  │
│  │  - logistics_webhook_log                        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
         │                    │                   │
         │                    │                   │
         v                    v                   v
┌────────────────────┐ ┌─────────────────┐ ┌──────────────┐
│ RETURN SERVICE     │ │ LOGISTIC SERVICE│ │PAYMENT SERVICE
├────────────────────┤ ├─────────────────┤ ├──────────────┤
│ API Endpoints:     │ │ API Endpoints:  │ │ API Endpoints│
│ - Create return    │ │ - Create ship   │ │ - Create     │
│ - Approve/reject   │ │ - Get status    │ │   refund     │
│ - List returns     │ │ - Cancel ship   │ │ - Retry      │
│ - Track shipment   │ │                 │ │   refund     │
│ - Inspect goods    │ │ Webhooks:       │ │              │
│ - Process refund   │ │ - Status update │ │ Webhooks:    │
│                    │ │                 │ │ - Refund     │
│ Webhooks:          │ │ Retry logic:    │ │   success    │
│ - Logistics status │ │ Max 3 attempts  │ │ - Refund     │
│ - Payment refund   │ │                 │ │   failed     │
└────────────────────┘ └─────────────────┘ └──────────────┘
         │                                       │
         │           PAYMENT_DB                 │
         │    ┌──────────────────────────────┐  │
         └───>│ payment_transaction          │<─┘
              │ refund_request               │
              │ payment_wallet               │
              │ seller_settlement            │
              └──────────────────────────────┘
```

---

## 📊 Database Schema Relationships

```
ECOMMERCE_DB                          PAYMENT_DB
─────────────                         ──────────

┌─────────────────┐
│  return_request │
├─────────────────┤            ┌──────────────────────┐
│ id              │            │ payment_transaction  │
│ status          │────────────>│ (REFUND_PAYOUT)     │
│ approved_amount │  payment_   │ refund_amount       │
│ refund_id ──────┼───────────┐ │ status              │
└─────────────────┘           │ └──────────────────────┘
         │                    │
         │                    v
         │            ┌──────────────┐
         │            │refund_request│
         │            ├──────────────┤
         │            │id            │
         │            │status        │
         └───────────>│refund_amount │
                      └──────────────┘
                             │
                             v
                      ┌────────────────┐
                      │payment_wallet  │
                      │(if WALLET)     │
                      └────────────────┘
```

---

## 🚀 Quick Start Guide

### Phase 1: Setup (Day 1)

```bash
# 1. Run SQL schema
mysql ecommerce < return_refund_schema.sql

# 2. Verify tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'ecommerce'
AND TABLE_NAME LIKE 'return%';
```

### Phase 2: Logistics Integration (Day 2-3)

```bash
# 1. Configure .env
LOGISTICS_API_BASE_URL=http://logistic-service:8080
RETURN_WEBHOOK_URL=https://api.ecommerce.com/api/v1/webhooks/return-shipment

# 2. Register webhook
curl -X POST http://logistic-service:8080/api/v1/webhooks \
  -d '{"url": "https://...", "events": [...], "secret": "..."}'

# 3. Build Return Service
npm run build
```

### Phase 3: Payment Integration (Day 4-5)

```bash
# 1. Configure Payment Service
PAYMENT_SERVICE_URL=http://payment-service:8080
PAYMENT_WEBHOOK_URL=https://api.ecommerce.com/api/v1/webhooks/payment-refund

# 2. Register webhook with Payment Service
curl -X POST http://payment-service:8080/api/v1/webhooks \
  -d '{"url": "https://...", "events": ["refund.success", ...], "secret": "..."}'

# 3. Deploy
docker build -t return-service .
docker push registry.com/return-service:1.0.0
```

### Phase 4: Testing (Day 6)

```bash
# 1. Create return request
curl -X POST http://localhost:3001/api/v1/return-requests \
  -H "Authorization: Bearer $TOKEN" -d '{...}'

# 2. Approve return
curl -X PUT http://localhost:3001/api/v1/return-requests/1/approval

# 3. Simulate logistics webhook
curl -X POST http://localhost:3001/api/v1/webhooks/return-shipment

# 4. Inspect & refund
curl -X POST http://localhost:3001/api/v1/return-requests/1/inspection
```

---

## 📈 Key Metrics

| Metric                        | Target   | Alert    |
| ----------------------------- | -------- | -------- |
| Return creation latency       | <1s      | >5s      |
| Approval latency              | <2s      | >10s     |
| Logistics integration latency | <100ms   | >500ms   |
| Refund processing latency     | <5s      | >30s     |
| Webhook delivery success rate | >99%     | <95%     |
| Return processing time        | <14 days | >30 days |
| Inspection pass rate          | >90%     | <80%     |
| Refund success rate           | >98%     | <95%     |

---

## 🔒 Security Checklist

- [ ] Webhook signature verification (HMAC SHA256)
- [ ] API key validation
- [ ] Role-based access control (Customer, Seller, Admin, Warehouse)
- [ ] Data encryption for sensitive fields
- [ ] PCI compliance for payment data
- [ ] Audit logging for all transactions
- [ ] Rate limiting on webhooks
- [ ] HTTPS for all API calls
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention in frontend

---

## 📋 Files Summary

| File                              | Size  | Purpose                           |
| --------------------------------- | ----- | --------------------------------- |
| REFUND_RETURN_WORKFLOW.md         | ~50KB | Business workflow & design        |
| RETURN_LOGISTICS_INTEGRATION.md   | ~30KB | Logistics API integration         |
| **RETURN_PAYMENT_INTEGRATION.md** | ~25KB | **Payment API integration (NEW)** |
| return_refund_schema.sql          | ~15KB | Database schema                   |
| DEPLOYMENT_GUIDE.md               | ~30KB | Step-by-step deployment           |

**Total:** ~150KB documentation + SQL schema

---

## 🎯 Implementation Timeline

| Week       | Phase                  | Deliverables                    |
| ---------- | ---------------------- | ------------------------------- |
| **Week 1** | Database & Core APIs   | Schema + Return/List/Get APIs   |
| **Week 2** | Logistics Integration  | Shipping APIs + Webhook handler |
| **Week 3** | Payment Integration    | Refund APIs + Webhook handler   |
| **Week 4** | Frontend               | Customer & Admin UIs            |
| **Week 5** | Testing & Optimization | E2E tests + Performance         |
| **Week 6** | Production Deployment  | Canary → 100% rollout           |

---

## 🔗 Integration Points

### With Logistics Service

```
✅ Create shipment on approval
✅ Get shipment status
✅ Receive webhook for status updates
✅ Cancel shipment if return rejected
✅ Handle delivery failures
```

### With Payment Service

```
✅ Create refund request after inspection
✅ Support multiple refund methods
✅ Handle refund failures with retry
✅ Receive webhook on refund success/failure
✅ Track refund via payment_transaction_id
```

### With Stock Service

```
✅ Add stock back on successful refund
✅ Mark as "return" status for inspection
✅ Update product availability
```

### With Notification Service

```
✅ Notify on return approval
✅ Notify on shipment status change
✅ Notify on refund success
✅ Notify on refund failure
```

---

## 🆘 Support & Escalation

| Issue                 | Channel            | Response Time |
| --------------------- | ------------------ | ------------- |
| API documentation     | Wiki               | 24h           |
| Integration questions | Slack #return-team | 2h            |
| Production bugs       | PagerDuty          | 15m           |
| Payment issues        | Finance team       | 1h            |
| Logistics issues      | Logistics team     | 2h            |

---

## ✅ Pre-Launch Checklist

- [ ] All 10 tables created in database
- [ ] Triggers & views verified
- [ ] Logistics webhook registered & tested
- [ ] Payment webhook registered & tested
- [ ] API endpoints tested end-to-end
- [ ] Error handling & retry logic verified
- [ ] Monitoring & alerts configured
- [ ] Load testing passed (>1000 RPS)
- [ ] Security audit completed
- [ ] Documentation updated & reviewed
- [ ] Team training completed
- [ ] Production rollback plan verified

---

## 📞 Quick Links

📖 **Main Workflow:** [REFUND_RETURN_WORKFLOW.md](REFUND_RETURN_WORKFLOW.md)  
🔗 **Logistics Integration:** [RETURN_LOGISTICS_INTEGRATION.md](RETURN_LOGISTICS_INTEGRATION.md)  
💰 **Payment Integration:** [RETURN_PAYMENT_INTEGRATION.md](RETURN_PAYMENT_INTEGRATION.md)  
🗄️ **Database Schema:** [return_refund_schema.sql](return_refund_schema.sql)  
🚀 **Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**Version:** 2.0  
**Status:** ✅ Ready for Production  
**Last Updated:** 2026-04-24  
**Maintained by:** System Architecture Team
