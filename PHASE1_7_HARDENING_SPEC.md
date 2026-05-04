# Phase 1.7 — Backend Hardening Spec

> **Dành cho Codex** thực thi. **Vũ** chỉ copy từng prompt ở mục **§7** vào Codex.
> **Claude** sẽ review code + chạy smoke test sau khi mỗi prompt xong.

---

## 1. Bối cảnh

Bạn đang làm trên monorepo:
```
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\
├── Marketplace-platform/        ← Backend Spring Boot
│   ├── src/main/java/...
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── marketfrontend/              ← Frontend Next.js
└── (file *.md ở root)
```

- **Branch:** `feature/vu`
- **Backend chạy bằng IntelliJ IDEA** (Run config trên `MarketplacePlatformApplication.java`, port 8001)
- Test verified: Phase 1.6 admin endpoints (PATCH `/admin/products/{id}/approve|reject|status`, PATCH `/admin/sellers/{id}/approve|reject|block|unblock|reopen`) ĐÃ HOẠT ĐỘNG (smoke test 20/20 PASS).

---

## 2. Vấn đề Phase 1.7 cần giải quyết

| # | Vấn đề | Hiện trạng | Mục tiêu |
|---|--------|-----------|----------|
| 1 | **Stack trace lộ ra client** (security) | Mọi 4xx/5xx response chứa `"trace":"org.springframework..."` | Tắt `include-stacktrace` |
| 2 | **Error response không nhất quán** | Có khi plain text `"reason is required"`, có khi JSON Spring default | Mọi lỗi trả JSON `ApiError` chuẩn |
| 3 | **Validation thủ công** | `if (reason.isBlank()) return badRequest("reason is required")` | Bean Validation `@NotBlank @Size` qua DTO |
| 4 | **Frontend dùng POST nhưng BE là PATCH** | Mismatch sau Phase 1.6 wire-up | Sửa `service/products.ts` + `service/sellers.ts` |

---

## 3. Convention BẮT BUỘC

### 3.1. Backend
- Branch: **`feature/vu`** (không tạo branch mới, không tạo worktree)
- Package root: `docker_test.com`
- Field naming: **`snake_case`** (giữ nguyên model conventions hiện tại)
- Validation imports: `jakarta.validation.constraints.*` (Spring Boot 4 dùng jakarta)
- DI: constructor injection
- Response: `ResponseEntity<?>` cho consistency
- **KHÔNG try-catch trong controller** — để `GlobalExceptionHandler` xử lý
- **KHÔNG đổi HTTP method** của các endpoint admin hiện có (giữ PATCH)
- **KHÔNG đụng module ngoài Products/Sellers** (Order, Payment, Cart, Logistic là người khác làm)

### 3.2. Frontend
- Dùng `http` client từ `marketfrontend/src/lib/http.ts` (đã có, Codex tự đọc cách dùng)
- Giữ flag `USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'` đã có

### 3.3. IntelliJ workflow (rất quan trọng)
- Sau khi code xong, Codex **PHẢI** chạy `cmd.exe /c "Marketplace-platform\mvnw.cmd compile -DskipTests"` để verify build pass
- **KHÔNG** kill/restart backend đang chạy. Vũ sẽ tự bấm Stop/Run trong IntelliJ sau khi review.

---

## 4. Files Codex sẽ tạo / sửa

```
Marketplace-platform/
├── pom.xml                                                          [M] thêm validation dep
├── src/main/resources/application.properties                        [M] tắt stacktrace
├── src/main/java/docker_test/com/
│   ├── dto/
│   │   ├── ApiError.java                                            [NEW]
│   │   └── admin/
│   │       ├── RejectRequestDTO.java                                [NEW]
│   │       └── StatusChangeRequestDTO.java                          [NEW]
│   └── controllers/
│       ├── GlobalExceptionHandler.java                              [NEW]
│       └── admin/
│           ├── AdminProductController.java                          [M] reject + status dùng DTO
│           └── AdminSellerController.java                           [M] reject + block + status dùng DTO

marketfrontend/src/service/
├── products.ts                                                      [M] POST → PATCH
└── sellers.ts                                                       [M] POST → PATCH
```

**Tổng:** 5 file mới + 6 file sửa.

---

## 5. Spec từng file

### 5.1. `application.properties` — tắt stack trace lộ ra client
Thêm (hoặc đổi nếu đã có) các dòng sau **TRONG cùng file**, không xóa các dòng khác:
```properties
# Phase 1.7 — security: ẩn chi tiết internal khỏi client
server.error.include-stacktrace=never
server.error.include-message=always
server.error.include-binding-errors=always
server.error.include-exception=false
```

### 5.2. `pom.xml` — thêm Bean Validation
Thêm dependency NGAY SAU `spring-boot-starter-webmvc`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 5.3. `dto/ApiError.java` — response chuẩn
```java
package docker_test.com.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Phản hồi lỗi API chuẩn cho toàn bộ backend. */
public class ApiError {
    private int status;
    private String error;       // mã ngắn, vd VALIDATION_FAILED
    private String message;     // tiếng Việt cho người dùng
    private String path;
    private Instant timestamp;
    private Map<String, String> fieldErrors;
    private String traceId;     // optional UUID cho log

    public ApiError() {
        this.timestamp = Instant.now();
        this.fieldErrors = new LinkedHashMap<>();
    }
    public ApiError(int status, String error, String message, String path) {
        this();
        this.status = status; this.error = error; this.message = message; this.path = path;
    }
    public void addFieldError(String f, String m) { this.fieldErrors.put(f, m); }

    // standard getters/setters cho tất cả field — Codex tự sinh
}
```

### 5.4. `dto/admin/RejectRequestDTO.java`
```java
package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectRequestDTO {
    @NotBlank(message = "Lý do là bắt buộc")
    @Size(min = 5, max = 1000, message = "Lý do phải từ 5-1000 ký tự")
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
```

### 5.5. `dto/admin/StatusChangeRequestDTO.java`
```java
package docker_test.com.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StatusChangeRequestDTO {
    @NotBlank(message = "status là bắt buộc")
    @Pattern(
        regexp = "^(PENDING|APPROVED|REJECTED|DRAFT|HIDDEN|ACTIVE)$",
        message = "Trạng thái không hợp lệ"
    )
    private String status;

    @Size(max = 1000, message = "Reason tối đa 1000 ký tự")
    private String reason; // optional, dùng khi status = HIDDEN/REJECTED

    // getters/setters
}
```

### 5.6. `controllers/GlobalExceptionHandler.java`
Bắt 6 loại exception, trả `ApiError` JSON:

| Exception | HTTP | error code |
|-----------|------|------------|
| `MethodArgumentNotValidException` | 400 | `VALIDATION_FAILED` (kèm fieldErrors) |
| `HttpMessageNotReadableException` | 400 | `MALFORMED_JSON` |
| `MethodArgumentTypeMismatchException` | 400 | `TYPE_MISMATCH` |
| `DataIntegrityViolationException` | 409 hoặc 400 | mã theo DB constraint name (xem mapping bên dưới) |
| `IllegalArgumentException` | 400 | `ILLEGAL_ARGUMENT` |
| `Exception` (fallback) | 500 | `INTERNAL_ERROR` (kèm `traceId` UUID, log stack trace ra console nhưng KHÔNG trả về client) |

Mapping DB constraint → user message (tiếng Việt):
```
"uq_product_shop_slug"                → "Sản phẩm với slug này đã tồn tại trong shop."
"uq_shop_tax_code"                    → "Mã số thuế đã được đăng ký."
"uq_shop_business_license"            → "Giấy phép kinh doanh đã đăng ký."
"fk_product_category"                 → "Danh mục không tồn tại hoặc đã bị xóa."
"fk_product_shop"                     → "Shop không tồn tại hoặc đã bị xóa."
"chk_product_price_positive"          → "Giá bán phải lớn hơn 0."
"chk_product_stock_non_negative"      → "Tồn kho không được âm."
"chk_product_original_price_valid"    → "Giá gốc phải >= giá bán."
chứa "duplicate"                       → "Dữ liệu đã tồn tại."
chứa "foreign key"                     → "Dữ liệu tham chiếu không hợp lệ."
chứa "check constraint"                → "Dữ liệu vi phạm ràng buộc."
```

Code mẫu nằm ở worktree cũ — Codex đọc tham khảo:
`Marketplace-platform/.claude/worktrees/crazy-zhukovsky/Marketplace-platform/src/main/java/docker_test/com/controllers/GlobalExceptionHandler.java`
**(CHỈ THAM KHẢO, không copy nguyên xi — file đó chưa cover tất cả case của main branch)**

### 5.7. Refactor `AdminProductController.reject()` & `setStatus()`

**TRƯỚC (hiện tại trong `Marketplace-platform/src/main/java/.../admin/AdminProductController.java` ~ dòng 446):**
```java
@PatchMapping("{id}/reject")
public ResponseEntity<?> reject(@PathVariable int id,
                                @RequestBody(required = false) Map<String, Object> body, ...) {
    String reason = requiredReason(body);
    if (reason.isBlank()) return ResponseEntity.badRequest().body("reason is required");
    ...
}
```

**SAU (Codex viết):**
```java
@PatchMapping("{id}/reject")
public ResponseEntity<?> reject(@PathVariable int id,
                                @Valid @RequestBody RejectRequestDTO request,
                                @RequestHeader(value = "X-Admin-Id", required = false) Long adminId,
                                @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {
    String reason = request.getReason(); // đã được @Valid validate ≥ 5 ký tự
    Product product = productRepository.GetById(id);
    if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(/* dùng ApiError */);
    // logic giữ nguyên: setIs_active(3), setReject_reason(reason), update, log
    ...
}
```

**Tương tự cho** `@PatchMapping("{id}/status")` ~ dòng 380 — dùng `StatusChangeRequestDTO`.

**KHÔNG đụng các method khác** (approve, getAll, getById, history, update, delete, create) — chỉ refactor `reject` + `setStatus`.

### 5.8. Refactor `AdminSellerController` tương tự
Method cần refactor (thay Map<String,Object> → DTO):
- `@PatchMapping("{id}/reject")` ~ dòng 362 → `RejectRequestDTO`
- `@PatchMapping("{id}/block")` ~ dòng 407 → `RejectRequestDTO`
- `@PatchMapping("{id}/status")` ~ dòng 322 → `StatusChangeRequestDTO`

Các method khác (approve, reopen, unblock, getAll, getById...) **giữ nguyên**.

### 5.9. Frontend `service/products.ts` — POST → PATCH

Tìm và đổi (chỉ sửa method axios, giữ nguyên signature function):
```typescript
// TRƯỚC
await http.post(`/admin/products/${id}/approve`, {});
await http.post(`/admin/products/${id}/reject`, { reason });

// SAU
await http.patch(`/admin/products/${id}/approve`, {});
await http.patch(`/admin/products/${id}/reject`, { reason });
```

Cho `updateProductStatus`: thay vì gọi `/hide` hay `/unhide`, gọi:
```typescript
await http.patch(`/admin/products/${id}/status`, { status, reason });
```

`duplicateProduct`: BE không có `/duplicate` endpoint trên main → tạm giữ MOCK, thêm comment `// TODO: BE cần thêm endpoint /admin/products/{id}/duplicate`.

`deleteProducts` (bulk): BE chỉ có `DELETE /admin/products/{id}` (single) → loop từng id; thêm comment `// TODO: BE cần thêm bulk delete`.

### 5.10. Frontend `service/sellers.ts` — tương tự

Map status → action:
```typescript
const action = newStatus === 'BLOCKED' ? 'block'
             : newStatus === 'ACTIVE' ? 'unblock'
             : newStatus === 'REJECTED' ? 'reject'
             : newStatus === 'PENDING' ? 'reopen'
             : 'approve';
const body = (newStatus === 'BLOCKED' || newStatus === 'REJECTED') ? { reason } : {};
await http.patch(`/admin/sellers/${id}/${action}`, body);
```

`deleteSellers` bulk: loop single delete (giống products).

---

## 6. Cấm Codex làm

- ❌ Đổi HTTP method admin endpoints khác PATCH
- ❌ Tạo branch mới hoặc worktree mới — làm trực tiếp trên `feature/vu`
- ❌ Sửa `controllers/admin/AdminOrderController.java`, `AdminUploadController`, `ProductFraudController`, `ProductStatsController`
- ❌ Sửa code thuộc module khác (order, cart, payment, logistic)
- ❌ Thêm thư viện ngoài `spring-boot-starter-validation`
- ❌ Refactor mass `Map<String,Object>` → DTO ở các method ngoài scope (chỉ reject + status)
- ❌ Restart backend đang chạy

## 7. PROMPTS cho Codex (chạy theo thứ tự)

### 🟦 PROMPT 1 — Foundation (DTO + ApiError + GlobalExceptionHandler)

```
Bạn đang làm trên branch `feature/vu` trong monorepo:
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\

Đọc kỹ PHASE1_7_HARDENING_SPEC.md (file ở root) — đặc biệt §3, §4, §5.1-5.6, §6.

Nhiệm vụ Prompt 1:
1. Sửa Marketplace-platform/pom.xml: thêm spring-boot-starter-validation (§5.2).
2. Sửa Marketplace-platform/src/main/resources/application.properties theo §5.1 (CHỈ thêm 4 dòng server.error.*, không xóa dòng khác).
3. Tạo 4 file Java mới:
   - Marketplace-platform/src/main/java/docker_test/com/dto/ApiError.java (§5.3)
   - Marketplace-platform/src/main/java/docker_test/com/dto/admin/RejectRequestDTO.java (§5.4)
   - Marketplace-platform/src/main/java/docker_test/com/dto/admin/StatusChangeRequestDTO.java (§5.5)
   - Marketplace-platform/src/main/java/docker_test/com/controllers/GlobalExceptionHandler.java (§5.6)

4. Sau khi tạo xong, chạy:
   cmd.exe /c "cd /d \"C:\\Users\\razer user\\Desktop\\Nguyen Phan Hoang Vu\\Ecommerce_marketplace-Microservice_GithubAction\\Marketplace-platform\" && mvnw.cmd compile -DskipTests"
   Phải PASS. Nếu fail → fix cho đến khi pass. KHÔNG kết thúc nếu build fail.

Ràng buộc:
- jakarta.validation.* (không javax)
- snake_case field names
- KHÔNG sửa controllers admin/ ở prompt này (làm ở Prompt 2)
- KHÔNG tạo branch hay worktree

Báo cáo cuối: liệt kê file đã tạo/sửa + dòng cuối log mvnw cho thấy "BUILD SUCCESS".
```

### 🟧 PROMPT 2 — Refactor admin controllers

```
Tiếp tục từ Prompt 1 (đã PASS build).

Đọc PHASE1_7_HARDENING_SPEC.md mục §5.7, §5.8, §6.

Nhiệm vụ Prompt 2:
1. Sửa Marketplace-platform/src/main/java/docker_test/com/controllers/admin/AdminProductController.java:
   - Method @PatchMapping("{id}/reject") (~dòng 446): thay @RequestBody Map<String,Object> body → @Valid @RequestBody RejectRequestDTO request
   - Method @PatchMapping("{id}/status") (~dòng 380): thay → @Valid @RequestBody StatusChangeRequestDTO request
   - Giữ nguyên các method khác (approve, getAll, history, update, delete, create, getById)
   - Bỏ check `if (reason.isBlank())` thủ công vì đã có @NotBlank
   - Thay `ResponseEntity.badRequest().body("...")` plain string → ResponseEntity.status(...).body(new ApiError(...)) trong các trường hợp 404/400

2. Sửa Marketplace-platform/src/main/java/docker_test/com/controllers/admin/AdminSellerController.java tương tự cho:
   - @PatchMapping("{id}/reject") → RejectRequestDTO
   - @PatchMapping("{id}/block") → RejectRequestDTO
   - @PatchMapping("{id}/status") → StatusChangeRequestDTO
   - Giữ approve, reopen, unblock, getAll, getById... nguyên vẹn

3. Build pass:
   cmd.exe /c "cd /d \"C:\\Users\\razer user\\Desktop\\Nguyen Phan Hoang Vu\\Ecommerce_marketplace-Microservice_GithubAction\\Marketplace-platform\" && mvnw.cmd compile -DskipTests"

Ràng buộc:
- KHÔNG đổi HTTP method (giữ PATCH)
- KHÔNG đổi path (giữ /reject, /status, /block)
- KHÔNG sửa AdminOrderController, AdminUploadController, ProductFraudController, ProductStatsController
- import jakarta.validation.Valid

Báo cáo: liệt kê method đã refactor + log "BUILD SUCCESS".
```

### 🟩 PROMPT 3 — Frontend POST → PATCH

```
Tiếp tục từ Prompt 2 (BE đã PASS).

Đọc PHASE1_7_HARDENING_SPEC.md §5.9, §5.10, §6.

Nhiệm vụ:
1. Sửa marketfrontend/src/service/products.ts:
   - Mọi http.post('/admin/products/${id}/approve') → http.patch
   - Mọi http.post('/admin/products/${id}/reject') → http.patch
   - updateProductStatus: bỏ branch hide/unhide, dùng http.patch('/admin/products/${id}/status', { status, reason })
   - duplicateProduct: thêm comment "// TODO: BE chưa có endpoint duplicate" và giữ MOCK
   - deleteProducts (bulk): loop http.delete(`/admin/products/${id}`) cho từng id (vì BE chỉ có single delete)
   - Giữ nguyên signature function exports

2. Sửa marketfrontend/src/service/sellers.ts:
   - toggleSellerStatus: dùng http.patch theo mapping ở §5.10
   - deleteSellers: loop single delete

3. Build frontend pass:
   cd marketfrontend
   npm run build

Ràng buộc:
- KHÔNG đổi function signature (UI components phụ thuộc)
- Giữ flag USE_MOCK
- KHÔNG đụng UI component, chỉ service layer

Báo cáo: liệt kê 2 file sửa + log "✓ Compiled successfully".
```

---

## 8. Acceptance criteria (Vũ verify sau khi 3 prompts xong)

- [ ] `mvnw compile` PASS
- [ ] `npm run build` PASS
- [ ] **Restart IntelliJ Run config** (Stop ⏹ → Run ▶)
- [ ] Vũ chạy: `bash postman/smoke_test_main.sh` từ thư mục worktree crazy-zhukovsky → kỳ vọng **20/20 PASS**
- [ ] Test thủ công 1 lỗi:
  ```bash
  curl -X PATCH http://localhost:8001/admin/products/4/reject \
    -H "Content-Type: application/json" -d '{"reason":"abc"}'
  ```
  Kỳ vọng response **JSON** (không phải plain "reason is required"):
  ```json
  {
    "status": 400,
    "error": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ...",
    "path": "/admin/products/4/reject",
    "fieldErrors": {"reason": "Lý do phải từ 5-1000 ký tự"}
  }
  ```
- [ ] Test trace bị ẩn:
  ```bash
  curl -X PATCH http://localhost:8001/admin/products/abc/approve
  ```
  Kỳ vọng: **KHÔNG** chứa `"trace":"org.springframework..."`
- [ ] UI admin click "Duyệt sản phẩm" → DevTools Network thấy request **PATCH** (không phải POST), status 200

## 9. Sau khi PASS

Vũ ping Claude → Claude review code + chạy lại smoke test → đóng Phase 1.7 → mở Phase 2 (Variants).
