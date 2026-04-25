# Seller API Auth / Permission / Role Checklist

Tài liệu này là checklist riêng cho phần phân quyền của Seller API, được viết để team có thể dùng sau khi bổ sung authentication / authorization / RBAC.

## Mục tiêu
- Tách riêng test case auth / permission / role khỏi business validation hiện tại
- Dùng lại cho toàn bộ Seller API khi team triển khai token, role và permission
- Hỗ trợ kiểm tra cả endpoint-level permission và resource-level permission

## Role đề xuất để map về sau
- `SUPER_ADMIN`
- `SELLER_ADMIN`
- `SELLER_APPROVER`
- `SUPPORT`
- `SELLER_OWNER`
- `UNAUTHENTICATED`

> Ghi chú: Nếu hệ thống dùng tên role khác, chỉ cần map các role thực tế sang nhóm role ở trên.

---

## 1) GET /sellers - Lấy danh sách sellers

- [ ] **AUTH-LIST-01**: Không gửi access token -> kỳ vọng `401 Unauthorized`
- [ ] **AUTH-LIST-02**: Gửi token sai format / malformed -> kỳ vọng `401 Unauthorized`
- [ ] **AUTH-LIST-03**: Gửi token hết hạn -> kỳ vọng `401 Unauthorized`
- [ ] **AUTH-LIST-04**: Token hợp lệ nhưng role không có quyền xem danh sách seller (ví dụ `SELLER_OWNER`) -> kỳ vọng `403 Forbidden`
- [ ] **AUTH-LIST-05**: `SUPER_ADMIN` được phép truy cập -> kỳ vọng `200 OK`
- [ ] **AUTH-LIST-06**: `SELLER_ADMIN` được phép truy cập -> kỳ vọng `200 OK`
- [ ] **AUTH-LIST-07**: `SUPPORT` nếu có quyền read-only thì truy cập được -> kỳ vọng `200 OK`
- [ ] **AUTH-LIST-08**: Token hợp lệ nhưng user bị disabled / locked -> kỳ vọng `401` hoặc `403` theo policy hệ thống

---

## 2) GET /sellers/:id - Lấy chi tiết seller

- [ ] **AUTH-DETAIL-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-DETAIL-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-DETAIL-03**: Role không có quyền xem chi tiết seller -> kỳ vọng `403`
- [ ] **AUTH-DETAIL-04**: `SUPER_ADMIN` xem được mọi seller -> kỳ vọng `200`
- [ ] **AUTH-DETAIL-05**: `SELLER_ADMIN` xem được mọi seller -> kỳ vọng `200`
- [ ] **AUTH-DETAIL-06**: `SELLER_OWNER` chỉ được xem seller thuộc về chính mình -> đúng owner `200`, không đúng owner `403` hoặc `404`
- [ ] **AUTH-DETAIL-07**: `SUPPORT` có quyền read-only -> kỳ vọng `200`

---

## 3) POST /sellers - Tạo seller mới

- [ ] **AUTH-CREATE-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-CREATE-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-CREATE-03**: Role không có quyền tạo seller (`SUPPORT`, `SELLER_OWNER`) -> kỳ vọng `403`
- [ ] **AUTH-CREATE-04**: `SUPER_ADMIN` được tạo seller -> kỳ vọng `201 Created`
- [ ] **AUTH-CREATE-05**: `SELLER_ADMIN` được tạo seller -> kỳ vọng `201`
- [ ] **AUTH-CREATE-06**: `SELLER_APPROVER` không được tạo nếu role chỉ dùng duyệt -> kỳ vọng `403`
- [ ] **AUTH-CREATE-07**: User bị lock / disabled dù token còn hạn -> kỳ vọng `401` hoặc `403`
- [ ] **AUTH-CREATE-08**: User thuộc tenant khác không được tạo seller cho tenant hiện tại -> kỳ vọng `403`

---

## 4) PATCH /sellers/:id - Cập nhật seller

- [ ] **AUTH-UPDATE-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-UPDATE-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-UPDATE-03**: Role không có quyền update seller -> kỳ vọng `403`
- [ ] **AUTH-UPDATE-04**: `SUPER_ADMIN` update được mọi seller -> kỳ vọng `200`
- [ ] **AUTH-UPDATE-05**: `SELLER_ADMIN` update được seller -> kỳ vọng `200`
- [ ] **AUTH-UPDATE-06**: `SELLER_OWNER` chỉ update được profile của chính seller mình -> đúng owner `200`, sai owner `403`
- [ ] **AUTH-UPDATE-07**: `SUPPORT` không được update -> kỳ vọng `403`
- [ ] **AUTH-UPDATE-08**: Role có quyền update thông tin cơ bản nhưng không được sửa field nhạy cảm (`status`, `isApproved`, `isDeleted`, `accountCode`) -> kỳ vọng `403` hoặc validation error rõ ràng

---

## 5) PATCH /sellers/:id/approve - Duyệt seller

- [ ] **AUTH-APPROVE-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-APPROVE-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-APPROVE-03**: `SELLER_ADMIN` không có quyền duyệt nếu policy tách riêng approver -> kỳ vọng `403`
- [ ] **AUTH-APPROVE-04**: `SELLER_APPROVER` có quyền duyệt -> kỳ vọng `200`
- [ ] **AUTH-APPROVE-05**: `SUPER_ADMIN` có quyền duyệt -> kỳ vọng `200`
- [ ] **AUTH-APPROVE-06**: `SUPPORT` không được duyệt -> kỳ vọng `403`
- [ ] **AUTH-APPROVE-07**: `SELLER_OWNER` không thể tự duyệt chính seller của mình -> kỳ vọng `403`
- [ ] **AUTH-APPROVE-08**: Separation of duties: người tạo seller không được là người duyệt seller đó -> kỳ vọng `403` hoặc business error rõ ràng

---

## 6) PATCH /sellers/:id/reject - Từ chối seller

- [ ] **AUTH-REJECT-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-REJECT-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-REJECT-03**: Chỉ `SELLER_APPROVER` hoặc `SUPER_ADMIN` được từ chối, role khác -> `403`
- [ ] **AUTH-REJECT-04**: `SELLER_OWNER` không thể tự reject hồ sơ của mình theo luồng admin -> kỳ vọng `403`
- [ ] **AUTH-REJECT-05**: Separation of duties: người tạo không được reject nếu policy yêu cầu -> kỳ vọng `403`

---

## 7) PATCH /sellers/:id/status - Đổi status seller

- [ ] **AUTH-STATUS-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-STATUS-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-STATUS-03**: Role không có quyền đổi status -> kỳ vọng `403`
- [ ] **AUTH-STATUS-04**: `SUPER_ADMIN` được đổi status -> kỳ vọng `200`
- [ ] **AUTH-STATUS-05**: `SELLER_ADMIN` được đổi status nếu policy cho phép -> kỳ vọng `200`
- [ ] **AUTH-STATUS-06**: `SUPPORT` không được đổi status -> kỳ vọng `403`
- [ ] **AUTH-STATUS-07**: `SELLER_OWNER` không được tự đổi status quản trị -> kỳ vọng `403`
- [ ] **AUTH-STATUS-08**: Role được update seller nhưng không được đổi sang trạng thái nhạy cảm (`BLOCKED`, `SUSPENDED`, `ACTIVE`) -> kỳ vọng `403`

---

## 8) DELETE /sellers/:id hoặc soft-delete endpoint - Xóa mềm seller

- [ ] **AUTH-DELETE-01**: Không token -> kỳ vọng `401`
- [ ] **AUTH-DELETE-02**: Token invalid / expired -> kỳ vọng `401`
- [ ] **AUTH-DELETE-03**: Chỉ `SUPER_ADMIN` hoặc role đặc biệt mới được xóa mềm -> role khác `403`
- [ ] **AUTH-DELETE-04**: `SELLER_ADMIN` không được xóa nếu policy cấm destructive action -> kỳ vọng `403`
- [ ] **AUTH-DELETE-05**: `SUPPORT` không được xóa -> kỳ vọng `403`
- [ ] **AUTH-DELETE-06**: `SELLER_OWNER` không được tự xóa theo admin endpoint -> kỳ vọng `403`

---

## 9) Test case dùng chung cho toàn bộ Seller API

- [ ] **AUTH-COMMON-01**: Header `Authorization` thiếu prefix `Bearer ` -> kỳ vọng `401`
- [ ] **AUTH-COMMON-02**: Header `Authorization: Bearer` nhưng token rỗng -> kỳ vọng `401`
- [ ] **AUTH-COMMON-03**: Token hợp lệ nhưng signature sai -> kỳ vọng `401`
- [ ] **AUTH-COMMON-04**: Token đúng signature nhưng `aud` sai -> kỳ vọng `401`
- [ ] **AUTH-COMMON-05**: Token đúng signature nhưng `iss` sai -> kỳ vọng `401`
- [ ] **AUTH-COMMON-06**: Token thiếu claim role / permission -> kỳ vọng `401` hoặc `403` theo auth design
- [ ] **AUTH-COMMON-07**: Token có role không đủ permission -> kỳ vọng `403`
- [ ] **AUTH-COMMON-08**: Token có nhiều role, trong đó có 1 role hợp lệ -> được phép theo policy union / intersection đã định
- [ ] **AUTH-COMMON-09**: User bị revoke session / token sau khi token đã phát hành -> request tiếp theo bị từ chối
- [ ] **AUTH-COMMON-10**: User disabled sau khi token đã phát hành -> request bị từ chối
- [ ] **AUTH-COMMON-11**: Thiếu permission cụ thể nhưng có role gần đúng, ví dụ có `seller.read` nhưng không có `seller.write` -> GET được, POST/PATCH/DELETE bị `403`
- [ ] **AUTH-COMMON-12**: Cross-tenant access: user tenant A gọi seller của tenant B -> kỳ vọng `403` hoặc `404`
- [ ] **AUTH-COMMON-13**: Audit log ghi nhận actor cho action nhạy cảm (`approve`, `reject`, `status change`, `delete`)
- [ ] **AUTH-COMMON-14**: Response lỗi auth không làm lộ thông tin nhạy cảm
- [ ] **AUTH-COMMON-15**: CORS / preflight hợp lệ nếu API dùng browser client và có auth header

---

## 10) Permission matrix mẫu

| Endpoint | SUPER_ADMIN | SELLER_ADMIN | SELLER_APPROVER | SUPPORT | SELLER_OWNER |
|---|---|---|---|---|---|
| GET /sellers | Allow | Allow | Allow/Optional | Allow (RO) | Deny |
| GET /sellers/:id | Allow | Allow | Allow | Allow (RO) | Own only |
| POST /sellers | Allow | Allow | Deny | Deny | Deny |
| PATCH /sellers/:id | Allow | Allow | Deny/Optional | Deny | Own basic fields only |
| PATCH /approve | Allow | Deny/Optional | Allow | Deny | Deny |
| PATCH /reject | Allow | Deny/Optional | Allow | Deny | Deny |
| PATCH /status | Allow | Allow/Optional | Deny | Deny | Deny |
| DELETE /sellers/:id | Allow | Deny/Optional | Deny | Deny | Deny |

---

## 11) Variables nên chuẩn bị sẵn trong Postman sau này

- [ ] `superAdminToken`
- [ ] `sellerAdminToken`
- [ ] `sellerApproverToken`
- [ ] `supportToken`
- [ ] `sellerOwnerToken`
- [ ] `unauthorizedToken`
- [ ] `targetSellerId`
- [ ] `ownSellerId`
- [ ] `foreignSellerId`

---

## 12) Thứ tự ưu tiên implement sau này

### Ưu tiên cao
- [ ] unauthenticated -> `401`
- [ ] invalid / expired token -> `401`
- [ ] insufficient permission -> `403`
- [ ] own-resource vs foreign-resource
- [ ] approve / reject separation of duties
- [ ] audit log cho action nhạy cảm

### Ưu tiên trung bình
- [ ] cross-tenant access
- [ ] field-level permission
- [ ] disabled / locked user
- [ ] revoked token / session

---

## Gợi ý áp dụng
- Dùng file này như checklist QA / backend review / security review
- Khi team đã có auth thật, có thể chuyển từng checklist thành request test hoặc Postman test script
- Nên giữ thống nhất quy ước:
  - `401` cho chưa xác thực / token lỗi
  - `403` cho đã xác thực nhưng không đủ quyền
  - `404` chỉ dùng khi muốn ẩn resource theo policy
