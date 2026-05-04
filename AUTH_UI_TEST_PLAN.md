# 🧪 Auth UI Test Plan — Prompt 4 + 5

> **Phạm vi test:** đăng nhập admin/seller, role check, ProtectedRoute, Logout button.
> **Yêu cầu:** Backend chạy port 8001 + Frontend chạy port 3000 + Migration `refresh_sessions` + cột `role` đã có.

---

## 📋 Pre-requisites

### 1. Verify backend up
```bash
curl -s http://localhost:8001/admin/products
# Kỳ vọng: response 401/403 (Security đang chặn không có token)
```

### 2. Verify frontend up
- Mở `http://localhost:3000/admin/login`
- Phải hiện form login (KHÔNG có Sidebar admin)

### 3. Mở DevTools (F12)
3 tab cần xem:
- **Console** — log error JS
- **Network** — xem HTTP request + headers + cookie
- **Application → Cookies → http://localhost:3000** — xem cookie `__Secure-refresh`

### 4. Test data đã có sẵn
| User | Email | Password | Role |
|---|---|---|---|
| Admin | `admin@ecommerce.com` | `123456` | ADMIN |
| Seller | (cần check trong DB user có `role = SELLER`) | (cần biết password) | SELLER |
| Customer | (bất kỳ user role CUSTOMER) | | CUSTOMER |

**Query DB lấy danh sách user test:**
```sql
SELECT id, email, role, is_active FROM `user` ORDER BY role, id LIMIT 10;
```

---

## 🎬 PHẦN A — TRANG ADMIN LOGIN (`/admin/login`)

### TC-A1: Render đúng layout (KHÔNG có Sidebar)

**Steps:**
1. Mở `http://localhost:3000/admin/login`

**Expected:**
- ✅ Hiện form login với 2 input (Email + Mật khẩu) + nút Đăng nhập
- ✅ **KHÔNG có Sidebar bên trái** (vì admin/layout.tsx skip Sidebar cho `/admin/login`)
- ✅ **KHÔNG có AdminHeader phía trên**
- ❌ Nếu thấy Sidebar/Header → bug logic isPublicAdminRoute

---

### TC-A2: Validation client-side

**Steps:**
1. Click thẳng nút "Đăng nhập" khi form rỗng

**Expected:**
- ✅ Hiện error inline: "Email không được để trống" và "Mật khẩu không được để trống"
- ✅ Form KHÔNG submit (KHÔNG có request trong Network)

**Steps tiếp:**
2. Nhập email = `abc` (không hợp lệ) → Submit

**Expected:**
- ✅ Error: "Email không hợp lệ"
- ✅ KHÔNG có request

**Steps tiếp:**
3. Nhập email hợp lệ + password = `123` (chỉ 3 ký tự)

**Expected:**
- ✅ Error: "Mật khẩu tối thiểu 6 ký tự"

---

### TC-A3: Login sai password

**Steps:**
1. Mở DevTools Network tab
2. Email: `admin@ecommerce.com`, Password: `wrongpass123`
3. Click Đăng nhập

**Expected:**
- ✅ Network: POST `/auth/login` → **401**
- ✅ Response body: `{ "error": "INVALID_CREDENTIALS", "message": "Email hoặc mật khẩu không đúng" }`
- ✅ Toast đỏ phía trên/dưới: "Email hoặc mật khẩu không đúng"
- ✅ KHÔNG có cookie `__Secure-refresh` trong Application → Cookies
- ✅ KHÔNG redirect (vẫn ở /admin/login)

---

### TC-A4: Login user không tồn tại

**Steps:**
1. Email: `khongton@tai.com`, Password: `abc123456`
2. Submit

**Expected:**
- ✅ Network: POST `/auth/login` → **401**
- ✅ Response cùng message `INVALID_CREDENTIALS` "Email hoặc mật khẩu không đúng"
- ✅ Toast đỏ giống TC-A3 (chống user enumeration — không lộ user tồn tại hay không)

---

### TC-A5: Login admin SUCCESS ⭐ (CRITICAL)

**Steps:**
1. Email: `admin@ecommerce.com`, Password: `123456`
2. Submit

**Expected (kiểm tra theo thứ tự):**

**a) Network tab:**
- ✅ POST `/auth/login` → **200**
- ✅ Response body chứa:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": 1, "email": "admin@ecommerce.com", "fullName": "Admin System", "role": "ADMIN" }
  }
  ```
- ✅ Response Headers chứa `Set-Cookie: __Secure-refresh=...; HttpOnly; Path=/auth; SameSite=Lax`
- ✅ Tiếp theo có request GET `/auth/me` → **200** trả UserDto

**b) Application → Cookies → localhost:3000:**
- ✅ Thấy cookie `__Secure-refresh`
- ✅ Cột HttpOnly = ✓ (true)
- ✅ Path = `/auth`
- ✅ Expires = ~14 ngày sau

**c) UI:**
- ✅ **Tự redirect** sang `/admin` (URL bar đổi)
- ✅ Hiển thị Sidebar bên trái + Header trên + content dashboard
- ✅ KHÔNG có error toast

**d) React DevTools (nếu cài extension):**
- ✅ AuthContext → `user = { id:1, role: "ADMIN", ... }`, `loading: false`

---

### TC-A6: Seller login ở `/admin/login` → REJECT (CRITICAL)

**Pre-setup:** Cần có 1 user role=SELLER với password biết. Nếu không có:
```sql
-- Tạo user seller test (nhớ password = 'seller123' BCrypt hash sẵn)
-- Hoặc UPDATE password user existing:
SET SQL_SAFE_UPDATES = 0;
UPDATE user SET password_hash = '$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO'
WHERE email = '<email_seller_test>';
SET SQL_SAFE_UPDATES = 1;
-- Password BCrypt trên là '123456'
```

**Steps:**
1. Mở `/admin/login`
2. Nhập credentials user role SELLER (vd: `seller_a@x.com` / `123456`)
3. Submit

**Expected:**
- ✅ Network: POST `/auth/login` → **200** (BE chấp nhận, vì SELLER trong whitelist Option 2)
- ✅ Response: `user.role = "SELLER"`
- ⚠️ FE sẽ phát hiện role mismatch:
  - ✅ Toast đỏ: "Tài khoản này không phải Admin. Vui lòng dùng trang đăng nhập phù hợp."
  - ✅ AccessToken bị clear (kiểm tra React DevTools: AuthContext.user = null)
  - ✅ KHÔNG redirect (vẫn ở `/admin/login`)
- ⚠️ Cookie `__Secure-refresh` vẫn được set ở browser (vì BE đã set trước khi FE check role)
  - **Đây là minor leak** — nhưng không ảnh hưởng vì user không có access token để dùng

---

### TC-A7: Customer login ở `/admin/login` → REJECT 403 (CRITICAL)

**Pre-setup:** Cần user role=CUSTOMER với password biết. Migration default tất cả CUSTOMER → có thể dùng user nào đó chưa được set ADMIN/SELLER.

**Steps:**
1. Mở `/admin/login`
2. Email user role CUSTOMER + password đúng
3. Submit

**Expected:**
- ✅ Network: POST `/auth/login` → **403**
- ✅ Response: `{ "error": "ROLE_NOT_ALLOWED", "message": "Tài khoản này không có quyền truy cập. Vui lòng dùng trang đăng nhập khách hàng." }`
- ✅ Toast đỏ với message đó
- ✅ KHÔNG có cookie set
- ✅ KHÔNG redirect

---

### TC-A8: Account disabled

**Pre-setup:**
```sql
SET SQL_SAFE_UPDATES = 0;
UPDATE user SET is_active = 0 WHERE email = 'admin@ecommerce.com';
SET SQL_SAFE_UPDATES = 1;
```

**Steps:**
1. Login `/admin/login` với admin credentials đúng
2. Submit

**Expected:**
- ✅ POST `/auth/login` → **403**
- ✅ Response: `{ "error": "ACCOUNT_DISABLED", "message": "Tài khoản đã bị khóa" }`
- ✅ Toast đỏ message đó

**Cleanup:**
```sql
UPDATE user SET is_active = 1 WHERE email = 'admin@ecommerce.com';
```

---

### TC-A9: Spam click submit

**Steps:**
1. Login form đầy đủ
2. **Click nút Đăng nhập 5 lần liên tiếp nhanh**

**Expected:**
- ✅ Network: chỉ **1 request** POST `/auth/login` (button disabled khi đang submitting)
- ✅ Trong lúc submit, button hiển thị "Đang đăng nhập..." hoặc spinner

---

## 🎬 PHẦN B — TRANG SELLER LOGIN (`/seller/login`)

### TC-B1: Render đúng layout

**Steps:**
1. Mở `http://localhost:3000/seller/login`

**Expected:**
- ✅ Hiện form login (UI từ `auth/seller-login.tsx`)
- ✅ **KHÔNG có Sidebar seller** (vì seller/layout.tsx có `isPublicSellerRoute` cho /seller/login)

---

### TC-B2: Seller login SUCCESS

**Steps:**
1. Email user role SELLER + password
2. Submit

**Expected:**
- ✅ POST `/auth/login` → 200, role = "SELLER"
- ✅ Cookie `__Secure-refresh` được set
- ✅ **Redirect** sang `/seller`
- ✅ Hiển thị Sidebar seller + content

---

### TC-B3: ADMIN login ở `/seller/login` → REJECT

**Steps:**
1. Vào `/seller/login`
2. Email + password ADMIN
3. Submit

**Expected:**
- ✅ POST `/auth/login` → **200** (BE chấp nhận)
- ✅ FE detect role mismatch
- ✅ Toast đỏ: "Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập phù hợp."
- ✅ KHÔNG redirect

---

### TC-B4: Customer ở `/seller/login` → 403

**Steps:**
1. Vào `/seller/login`
2. Credentials role CUSTOMER
3. Submit

**Expected:** 403 ROLE_NOT_ALLOWED + toast (giống TC-A7)

---

## 🎬 PHẦN C — PROTECTED ROUTE (Prompt 5)

### TC-C1: Truy cập `/admin/products` chưa login → redirect

**Pre-setup:** Logout (hoặc xóa cookie thủ công)
- DevTools → Application → Cookies → click cookie `__Secure-refresh` → Delete
- Hoặc trong tab Network click "Clear cookies"

**Steps:**
1. Gõ thẳng URL `http://localhost:3000/admin/products` lên thanh URL
2. Enter

**Expected:**
- ✅ Hiện spinner xanh ngắn (~0.5s — ProtectedRoute đang check user)
- ✅ Network: GET `/auth/me` → 401 hoặc 403
- ✅ **URL tự đổi** sang `/admin/login`
- ✅ Hiển thị form login

---

### TC-C2: SELLER truy cập `/admin/products` → redirect `/seller`

**Steps:**
1. Login tại `/seller/login` thành công (role SELLER)
2. Đang ở `/seller`, gõ URL `http://localhost:3000/admin/products` lên URL bar
3. Enter

**Expected:**
- ✅ Spinner ngắn
- ✅ ProtectedRoute detect role mismatch (user.role=SELLER, requiredRole=ADMIN)
- ✅ **Redirect** sang `/seller` (URL đổi)
- ✅ KHÔNG hiện admin Sidebar dù chỉ trong nháy mắt

---

### TC-C3: ADMIN truy cập `/admin/products` → OK

**Steps:**
1. Login admin tại `/admin/login`
2. Sau redirect tới `/admin`, click vào menu "Sản phẩm" trong Sidebar (hoặc gõ URL `/admin/products`)

**Expected:**
- ✅ Trang `   hiển thị bình thường
- ✅ Có Sidebar + Header + danh sách sản phẩm
- ✅ KHÔNG bị redirect

---

### TC-C4: Spinner loading khi check auth

**Steps:**
1. DevTools → Network → tab "Throttling" → chọn **"Slow 4G"**
2. Reload trang `/admin` (F5)

**Expected:**
- ✅ Thấy spinner xanh xoay tròn ngắn (~1-2s)
- ✅ Sau khi `/auth/me` trả về → render content

---

### TC-C5: Reload sau login làm mất session ⚠️ (KNOWN ISSUE — Prompt 6 sẽ fix)

**Steps:**
1. Login admin → đang ở `/admin`
2. F5 reload

**Expected (CHƯA OK ở Prompt 5):**
- ⚠️ Network: GET `/auth/me` → 401 (vì access token in-memory mất khi reload, refresh chưa implement)
- ⚠️ ProtectedRoute không thấy user → redirect `/admin/login`

→ **Đây là behavior MONG MUỐN ở Prompt 5. Prompt 6 sẽ thêm silent refresh để giữ session sau reload.**

---

## 🎬 PHẦN D — LOGOUT (Prompt 5)

### TC-D1: Logout button trong Sidebar admin

**Steps:**
1. Login admin → đang ở `/admin`
2. Cuộn xuống cuối Sidebar (hoặc tìm icon **LogOut** ↩️)
3. Click "Đăng xuất"

**Expected:**

**Network:**
- ✅ POST `/auth/logout` → **200**
- ✅ Response: `{ "success": true }`

**Application → Cookies:**
- ✅ Cookie `__Secure-refresh` mất (Set-Cookie với Max-Age=0 đã clear)

**UI:**
- ✅ Tự redirect `/admin/login`
- ✅ AuthContext.user = null

---

### TC-D2: Sau logout, gõ /admin → bị redirect

**Steps:** (sau TC-D1)
1. Gõ `http://localhost:3000/admin/products` lên URL bar
2. Enter

**Expected:**
- ✅ Bị redirect `/admin/login` (giống TC-C1)

---

### TC-D3: Multi-tab logout

**Steps:**
1. Mở 2 tab Chrome cùng lúc:
   - Tab 1: `/admin/products`
   - Tab 2: `/admin/sellers`
2. Login admin ở Tab 1
3. Tab 2 reload → cũng login OK
4. Logout ở Tab 1
5. Quay sang Tab 2 → click 1 menu (vd "Sản phẩm")

**Expected:**
- ✅ Tab 2 sau khi click → API call → 401
- ⚠️ Hiện tại chưa có auto-refresh nên có thể không redirect tự động — Prompt 6 sẽ fix
- ✅ Nếu navigate sang trang khác → ProtectedRoute check → redirect login

---

### TC-D4: Logout button trong Seller Sidebar

**Steps:**
1. Login seller → đang ở `/seller`
2. Tìm nút "Đăng xuất" trong SideBar seller
3. Click

**Expected:** Tương tự TC-D1 nhưng redirect `/seller/login`

---

## 🎬 PHẦN E — CORS + COOKIE BEHAVIOR

### TC-E1: CORS trong DevTools

**Steps:**
1. Login `/admin/login` (lần nữa)
2. DevTools → Network → click vào request POST `/auth/login`
3. Tab "Headers" → cuộn xuống "Response Headers"

**Expected:**
- ✅ `Access-Control-Allow-Origin: http://localhost:3000`
- ✅ `Access-Control-Allow-Credentials: true`
- ✅ `Vary: Origin`

---

### TC-E2: Cookie HttpOnly verify

**Steps:**
1. Sau khi login admin
2. DevTools → Application → Cookies → `http://localhost:3000`
3. Click vào row `__Secure-refresh`

**Expected:**
- ✅ Cột **HttpOnly** = ✓ (checked)
- ✅ Cột **Secure** = (no) — vì dev local
- ✅ **SameSite** = Lax
- ✅ **Path** = /auth

**Verify JS không đọc được:**
4. Mở Console
5. Gõ: `document.cookie`

**Expected:**
- ✅ Output **KHÔNG** chứa `__Secure-refresh` (HttpOnly đang work)

---

### TC-E3: Verify withCredentials

**Steps:**
1. DevTools → Network → POST `/auth/login` request
2. Tab "Headers" → "Request Headers"

**Expected:**
- ✅ Có header `Origin: http://localhost:3000`
- ✅ Sau lần login đầu, các request tiếp theo có `Cookie: __Secure-refresh=...`

---

## ✅ Checklist tổng

### Admin login
- [ ] TC-A1: render KHÔNG Sidebar
- [ ] TC-A2: validation client
- [ ] TC-A3: sai password → 401 + toast
- [ ] TC-A4: user không tồn tại → 401 + cùng message
- [ ] TC-A5: login admin success ⭐
- [ ] TC-A6: SELLER ở admin-login → toast reject
- [ ] TC-A7: CUSTOMER ở admin-login → 403 ROLE_NOT_ALLOWED
- [ ] TC-A8: account disabled → 403
- [ ] TC-A9: spam click → 1 request

### Seller login
- [ ] TC-B1: render KHÔNG Sidebar
- [ ] TC-B2: login seller success
- [ ] TC-B3: ADMIN ở seller-login → toast reject
- [ ] TC-B4: CUSTOMER ở seller-login → 403

### Protected Route
- [ ] TC-C1: chưa login → redirect /admin/login
- [ ] TC-C2: SELLER vào /admin → redirect /seller
- [ ] TC-C3: ADMIN vào /admin → OK
- [ ] TC-C4: spinner loading
- [ ] TC-C5: reload mất session (known issue, Prompt 6 fix)

### Logout
- [ ] TC-D1: button logout admin
- [ ] TC-D2: sau logout không vào /admin được
- [ ] TC-D3: multi-tab
- [ ] TC-D4: button logout seller

### Cookie/CORS
- [ ] TC-E1: CORS headers
- [ ] TC-E2: HttpOnly verify
- [ ] TC-E3: withCredentials

---

## 🐛 Common Bugs & Troubleshooting

| Triệu chứng | Nguyên nhân | Fix |
|---|---|---|
| /admin/login hiện Sidebar | admin/layout.tsx thiếu logic isPublicAdminRoute | Check usePathname check |
| 403 ở mọi request /auth/login | Backend chưa restart sau Prompt 1/2 | Stop ⏹ → Run ▶ IntelliJ |
| Login OK nhưng không redirect | useAuth.login không return user | Check AuthContext.login() trả về user.role |
| Cookie không hiện trong DevTools | withCredentials thiếu hoặc CORS sai | Check http.ts có `withCredentials: true` |
| ROLE_NOT_ALLOWED khi login admin | DB role = CUSTOMER (chưa update) | `UPDATE user SET role='ADMIN' WHERE id=1` |
| Spam refresh tab có 401 lẫn 200 | Race condition (Prompt 6 sẽ fix queue/lock) | Tạm chấp nhận, Prompt 6 fix |
| Reload mất session | Silent refresh chưa implement | Đây là behavior P5, Prompt 6 fix |

---

## 📊 Pass criteria

- **Tier 1 (BẮT BUỘC pass):** TC-A5, TC-A7, TC-C1, TC-C3, TC-D1
- **Tier 2 (NÊN pass):** TC-A6, TC-A3, TC-B2, TC-C2, TC-D2
- **Tier 3 (Optional):** Còn lại

Nếu Tier 1 + Tier 2 PASS → chấp nhận Prompt 4+5 → đi Prompt 6.

Nếu Tier 1 fail → ping Claude debug.
