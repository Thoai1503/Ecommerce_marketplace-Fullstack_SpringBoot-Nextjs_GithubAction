# 🔐 Auth JWT — 6 Prompts cho Codex (re-organized)

> **Spec gốc:** `Marketplace-platform/auth-jwt.doc` (Cursor §1-10 + Claude §A-F)
> **Branch:** `feature/vu` (KHÔNG worktree)
> **Backend:** IntelliJ Run port 8001
> **Cách dùng:** mỗi prompt → copy vào Codex → Codex báo PASS → Vũ chạy test cases ở dưới → ping Claude review → đi prompt tiếp.

---

## 🎯 Phạm vi Auth của Vũ — Option 2: chỉ Admin + Seller

> **Auth flow này CHỈ phục vụ ADMIN và SELLER.** Module Customer (mua hàng) là người khác làm.

| Role | Login URL | Page file (route) | Component UI (đã có) | Chấp nhận? |
|---|---|---|---|---|
| **ADMIN** | `/admin/login` (admin/layout.tsx đã sửa: skip Sidebar/Header khi pathname=/admin/login — Option A) | **TẠO MỚI** `marketfrontend/src/app/admin/login/page.tsx` (re-export) | `marketfrontend/src/app/auth/admin-login.tsx` (218 dòng — UI sẵn) | ✅ |
| **SELLER** | `/seller/login` (seller/layout.tsx đã handle public route, không wrap Sidebar) | **REPLACE** `marketfrontend/src/app/seller/login/page.tsx` (đang dùng impl cũ) | `marketfrontend/src/app/auth/seller-login.tsx` (216 dòng — UI sẵn) | ✅ |
| **CUSTOMER** | `/login` | `marketfrontend/src/app/login/page.tsx` | (orphan: `auth/login.tsx` — KHÔNG động) | ❌ Backend trả 403 |

**Quy tắc:**
- Backend dùng **1 endpoint** `/auth/login` cho cả 2 → giảm code duplication
- Backend **CHỈ chấp nhận role ADMIN hoặc SELLER**, login với CUSTOMER → 403 `ROLE_NOT_ALLOWED`
- Frontend có **2 trang riêng** với UI khác nhau → mỗi trang còn check thêm: nếu role trả về không khớp với trang → toast lỗi + không redirect (vd: SELLER login ở trang admin-login → error)
- **CẤM động vào** `marketfrontend/src/app/auth/login.tsx` và `marketfrontend/src/app/login/*` (customer module)

---

## Bảng mapping 9 bài → 6 prompts

| Prompt | 9 bài học | Phạm vi |
|---|---|---|
| 🟦 **1** | Bài 1 + 2 (foundation) | BE: pom + DB SQL + properties + JwtService + SecurityConfig + JwtAuthFilter |
| 🟧 **2** | Bài 2 (login) + Bài 5 (auth middleware đã ở P1) | BE: AuthController login + /me + DTO + RefreshSession model + Repo basic + **role check Option 2** |
| 🟨 **3** | Bài 7 | BE: refresh + logout + logout-all + sessions + revoke + replay detection |
| 🟩 **4** | Bài 3 + 4 | FE: http.ts basic + AuthContext + **2 trang login (admin-login.tsx + seller-login.tsx) đã có sẵn** |
| 🟫 **5** | Bài 6 | FE: ProtectedRoute + wrap layouts admin/seller + Logout button |
| 🟪 **6** | Bài 8 + 9 | FE: auto-refresh + queue/lock + silent refresh on mount |

---

# 🟦 PROMPT 1 — BE Foundation (Bài 1+2 base)

## 📎 File Codex cần đọc trước
- `Marketplace-platform/auth-jwt.doc` — đặc biệt §B (DB), §C (JwtService + SecurityConfig + JwtAuthFilter), §E (deps), §F (env)

## 📁 File Codex sẽ tạo / sửa (6 files)

```
NEW Marketplace-platform/migrate_refresh_sessions.sql
M   Marketplace-platform/pom.xml
M   Marketplace-platform/src/main/resources/application.properties
NEW Marketplace-platform/src/main/java/docker_test/com/services/JwtService.java
NEW Marketplace-platform/src/main/java/docker_test/com/configs/JwtAuthFilter.java
NEW Marketplace-platform/src/main/java/docker_test/com/configs/SecurityConfig.java
```

## 🚀 Prompt copy → Codex

```
Bạn đang làm trên branch `feature/vu` trong:
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\

Đọc kỹ Marketplace-platform/auth-jwt.doc, đặc biệt:
- §B (DB migration SQL)
- §C (Spring Security config + JwtAuthFilter + JwtService skeleton)
- §E (Pom dependencies)
- §F (Environment variables application.properties)

Nhiệm vụ Prompt 1 (BE Foundation):

1. Sửa Marketplace-platform/pom.xml — thêm 4 dependencies từ §E:
   spring-boot-starter-security, jjwt-api, jjwt-impl (runtime), jjwt-jackson (runtime)

2. Tạo Marketplace-platform/migrate_refresh_sessions.sql — copy SQL từ §B nguyên văn:
   - CREATE TABLE refresh_sessions (đầy đủ FK + indexes)
   - ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'CUSTOMER' AFTER user_type
   - UPDATE user SET role = 'ADMIN' WHERE id = 1
   - UPDATE user SET role = 'SELLER' WHERE user_type IN ('seller', 'both') AND role = 'CUSTOMER'

3. Sửa Marketplace-platform/src/main/resources/application.properties — thêm 7 dòng jwt.* từ §F (KHÔNG xóa property hiện có).

4. Tạo Marketplace-platform/src/main/java/docker_test/com/services/JwtService.java theo skeleton §C:
   - SecretKey accessKey từ @Value("${jwt.secret}")
   - long accessTtlMinutes từ @Value("${jwt.access-ttl-minutes:15}")
   - long refreshTtlDays từ @Value("${jwt.refresh-ttl-days:14}")
   - createAccessToken(long userId, String role) → JWT HS256
   - parseAccessToken(String token) → Claims (throw ExpiredJwtException nếu hết hạn)
   - createOpaqueRefreshToken() → 32 bytes secure random base64url no padding
   - hashRefresh(String plain) → SHA-256 base64url no padding
   - getRefreshTtlDays()

5. Tạo Marketplace-platform/src/main/java/docker_test/com/configs/JwtAuthFilter.java:
   - @Component extends OncePerRequestFilter
   - Constructor inject JwtService
   - doFilterInternal: đọc Authorization header, nếu Bearer thì parseAccessToken, set UsernamePasswordAuthenticationToken vào SecurityContextHolder với authority "ROLE_" + role
   - Bắt ExpiredJwtException nhưng KHÔNG fail request (chain.doFilter tiếp tục để controller/security trả 401)

6. Tạo Marketplace-platform/src/main/java/docker_test/com/configs/SecurityConfig.java theo §C:
   - @Configuration @EnableWebSecurity
   - filterChain bean: csrf disable, cors source, stateless, permitAll cho /auth/login + /auth/refresh + /auth/seller/register, hasRole("ADMIN") cho /admin/**, hasAnyRole("SELLER","ADMIN") cho /seller/**, anyRequest authenticated
   - addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
   - PasswordEncoder bean: BCryptPasswordEncoder(12)
   - CorsConfigurationSource bean: allowedOrigins ["http://localhost:3000","http://127.0.0.1:3000"], allowCredentials=true

7. Build verify:
   cmd.exe /c "cd /d \"C:\\Users\\razer user\\Desktop\\Nguyen Phan Hoang Vu\\Ecommerce_marketplace-Microservice_GithubAction\\Marketplace-platform\" && mvnw.cmd compile -DskipTests"
   Phải BUILD SUCCESS. Fail thì fix, không kết thúc nếu fail.

CẤM:
- ❌ KHÔNG tạo AuthController hoặc DTO ở Prompt này (sẽ làm Prompt 2)
- ❌ KHÔNG tự chạy migration SQL (Vũ chạy thủ công)
- ❌ KHÔNG đụng controllers admin / seller / order
- ❌ KHÔNG sửa frontend
- ❌ KHÔNG thêm @PreAuthorize vào controller (Phase RBAC sau)
- ❌ KHÔNG thêm dependency ngoài 4 cái trong §E
- ❌ KHÔNG tạo branch / worktree mới

Báo cáo cuối: liệt kê 6 files đã tạo/sửa + log "BUILD SUCCESS".
```

## 📮 Test Postman sau Prompt 1

**Vũ làm trước test:**
1. Mở MySQL Workbench, run `migrate_refresh_sessions.sql`
2. Verify: `SHOW TABLES LIKE 'refresh_sessions'` → có. `SELECT role FROM user LIMIT 5` → có cột role
3. Restart IntelliJ Run

### TC-1.1 Backend khởi động được
```http
GET http://localhost:8001/admin/products
```
**Kỳ vọng:** 401 hoặc 403 (vì SecurityConfig đã require auth cho /admin)
**Trước Prompt 1:** trả 200 → giờ trả 401/403 = ✅ SecurityConfig hoạt động

### TC-1.2 Endpoint public không bị chặn
```http
POST http://localhost:8001/auth/login
Content-Type: application/json
{ "email":"x", "password":"y" }
```
**Kỳ vọng:** 404 hoặc 405 (vì AuthController chưa tạo) — KHÔNG phải 401/403 = ✅ permitAll work

### TC-1.3 CORS preflight
```http
OPTIONS http://localhost:8001/admin/products
Origin: http://localhost:3000
Access-Control-Request-Method: GET
```
**Kỳ vọng:** 200 + headers `Access-Control-Allow-Origin: http://localhost:3000`, `Access-Control-Allow-Credentials: true`

### TC-1.4 CORS không cho origin khác
```http
OPTIONS http://localhost:8001/admin/products
Origin: http://evil.com
```
**Kỳ vọng:** không có header `Access-Control-Allow-Origin` (browser sẽ chặn)

### TC-1.5 JwtService chạy được (compile-time check)
- Mở IntelliJ console khi backend khởi động
- KHÔNG có exception "BeanCreationException" liên quan SecurityConfig hay JwtService

→ 5 TC PASS → ping Claude → Prompt 2.

---

# 🟧 PROMPT 2 — BE Login + /me + Session basic (Bài 2 + 5)

## 📎 File Codex cần đọc trước
- `Marketplace-platform/auth-jwt.doc` — đặc biệt §A.1 (login), §A.5 (/me)
- File đã tạo Prompt 1: `JwtService.java`, `SecurityConfig.java`, `application.properties`

## 📁 File Codex sẽ tạo (5 files)

```
NEW Marketplace-platform/src/main/java/docker_test/com/dto/auth/LoginRequestDTO.java
NEW Marketplace-platform/src/main/java/docker_test/com/dto/auth/UserDto.java
NEW Marketplace-platform/src/main/java/docker_test/com/dto/auth/LoginResponseDTO.java
NEW Marketplace-platform/src/main/java/docker_test/com/models/RefreshSession.java
NEW Marketplace-platform/src/main/java/docker_test/com/repository/RefreshSessionRepository.java
NEW Marketplace-platform/src/main/java/docker_test/com/controllers/auth/AuthController.java
```

## 🚀 Prompt copy → Codex

```
Tiếp tục từ Prompt 1 (đã PASS).

Đọc auth-jwt.doc §A.1, §A.5, §F. Đọc các file tạo ở Prompt 1 để hiểu signature: JwtService.java, SecurityConfig.java.

Nhiệm vụ Prompt 2 (BE Login):

1. Tạo Marketplace-platform/src/main/java/docker_test/com/dto/auth/LoginRequestDTO.java:
   - @NotBlank @Email private String email;
   - @NotBlank @Size(min=6, max=100) private String password;
   - getters/setters

2. Tạo Marketplace-platform/src/main/java/docker_test/com/dto/auth/UserDto.java:
   - private Long id; private String email; private String fullName; private String role;
   - constructor(Long, String, String, String)
   - getters/setters

3. Tạo Marketplace-platform/src/main/java/docker_test/com/dto/auth/LoginResponseDTO.java:
   - private String accessToken; private UserDto user;
   - constructor + getters/setters

4. Tạo Marketplace-platform/src/main/java/docker_test/com/models/RefreshSession.java:
   - Fields: String id, Long userId, String tokenHash, String userAgent, String ipFirst, String ipLast,
     LocalDateTime expiresAt, LocalDateTime revokedAt, String rotatedFrom,
     LocalDateTime createdAt, LocalDateTime lastUsedAt
   - Default constructor + getters/setters

5. Tạo Marketplace-platform/src/main/java/docker_test/com/repository/RefreshSessionRepository.java:
   - @Repository pattern (giống ProductRepository hiện có — raw JDBC dbConnection)
   - createSession(String id, Long userId, String tokenHash, String userAgent, String ip, java.sql.Timestamp expiresAt) → INSERT
   - findById(String id) → RefreshSession or null
   - Tạm chỉ cần 2 method này, các method khác Prompt 3 sẽ thêm.

6. Tạo Marketplace-platform/src/main/java/docker_test/com/controllers/auth/AuthController.java:
   - @RestController @RequestMapping("/auth")
   - Constructor inject: UserRepository, RefreshSessionRepository, JwtService, PasswordEncoder
   - @Value("${jwt.cookie-name}") String cookieName
   - @Value("${jwt.cookie-path}") String cookiePath
   - @Value("${jwt.cookie-secure}") boolean cookieSecure
   - @Value("${jwt.cookie-same-site}") String cookieSameSite

   a) @PostMapping("/login"):
      - @Valid @RequestBody LoginRequestDTO request
      - HttpServletRequest req, HttpServletResponse res
      - Query user theo email → nếu null → 401 ApiError INVALID_CREDENTIALS "Email hoặc mật khẩu không đúng"
      - Kiểm tra passwordEncoder.matches(request.password, user.password_hash) → nếu false → 401 cùng message (chống user enumeration)
      - **CHECK ROLE (Option 2)**: nếu user.role KHÔNG phải "ADMIN" và KHÔNG phải "SELLER" → 403 ApiError ROLE_NOT_ALLOWED "Tài khoản này không có quyền truy cập. Vui lòng dùng trang đăng nhập khách hàng." (chặn CUSTOMER login qua endpoint này)
      - Nếu user.is_active != 1 → 403 ApiError ACCOUNT_DISABLED "Tài khoản đã bị khóa"
      - Tạo: accessToken = jwtService.createAccessToken(userId, role)
              opaqueRefresh = jwtService.createOpaqueRefreshToken()
              tokenHash = jwtService.hashRefresh(opaqueRefresh)
              sessionId = UUID.randomUUID().toString()
              expiresAt = Timestamp.from(Instant.now().plus(jwtService.getRefreshTtlDays(), DAYS))
              userAgent = req.getHeader("User-Agent") (cắt 500 chars)
              ip = req.getRemoteAddr()
      - refreshSessionRepository.createSession(...)
      - Set-Cookie response: dùng ResponseCookie.from(cookieName, opaqueRefresh).httpOnly(true).secure(cookieSecure).path(cookiePath).maxAge(refreshTtlDays days in seconds).sameSite(cookieSameSite).build() → res.addHeader("Set-Cookie", cookie.toString())
      - Trả LoginResponseDTO { accessToken, UserDto(user.id, user.email, user.full_name, user.role) }

   b) @GetMapping("/me"):
      - Đọc Authentication từ SecurityContextHolder.getContext().getAuthentication()
      - Lấy userId = (Long) auth.getPrincipal()
      - userRepository.findById(userId) → nếu null hoặc !is_active → 401 (Spring tự xử lý nếu auth null)
      - Trả UserDto

7. Build verify mvnw compile phải PASS.

CẤM:
- ❌ KHÔNG tạo /auth/refresh, /auth/logout, /auth/sessions (Prompt 3)
- ❌ KHÔNG sửa SellerAuthController (giữ nguyên register flow)
- ❌ KHÔNG đụng frontend
- ❌ KHÔNG sửa JwtService, SecurityConfig (đã xong Prompt 1)
- ❌ KHÔNG thêm endpoint nào ngoài /login và /me

Báo cáo cuối: 6 files tạo + log "BUILD SUCCESS" + xác nhận 2 endpoint /auth/login và /auth/me đăng ký được.
```

## 📮 Test Postman sau Prompt 2

### TC-2.1 Login thành công admin
**Setup:** đảm bảo user id=1 có role='ADMIN' (đã set ở migration). Lấy email + password thật của user đó.
```http
POST http://localhost:8001/auth/login
Content-Type: application/json
{ "email":"<email_user_1>", "password":"<password_dung>" }
```
**Kỳ vọng:**
- 200, body `{ "accessToken":"eyJ...", "user":{ "id":1, "email":"...", "fullName":"...", "role":"ADMIN" } }`
- Response header `Set-Cookie: __Secure-refresh=...; HttpOnly; Path=/auth`
- DB: `SELECT * FROM refresh_sessions WHERE user_id=1` → có 1 row mới

### TC-2.2 Login sai password
```http
POST /auth/login
{ "email":"<email_dung>", "password":"saiii" }
```
**Kỳ vọng:** 401 + `{ error:"INVALID_CREDENTIALS", message:"Email hoặc mật khẩu không đúng." }`

### TC-2.3 Login user không tồn tại
```http
POST /auth/login
{ "email":"khongton@tai.com", "password":"abc123" }
```
**Kỳ vọng:** 401 + cùng message TC-2.2 (chống user enumeration)

### TC-2.4 Login validation: email rỗng
```http
POST /auth/login
{ "email":"", "password":"abc" }
```
**Kỳ vọng:** 400 VALIDATION_FAILED + fieldErrors.email + fieldErrors.password

### TC-2.5 Login validation: email sai format
```http
POST /auth/login
{ "email":"khong-phai-email", "password":"abc123" }
```
**Kỳ vọng:** 400 + fieldErrors.email

### TC-2.6 Account disabled
**Setup:** `UPDATE user SET is_active=0 WHERE id=2` (chọn user khác id 1)
```http
POST /auth/login
{ "email":"<email_user_2>", "password":"<dung>" }
```
**Kỳ vọng:** 403 ACCOUNT_DISABLED
**Cleanup:** `UPDATE user SET is_active=1 WHERE id=2`

### TC-2.6b Login với role CUSTOMER bị từ chối (Option 2)
**Setup:** `UPDATE user SET role='CUSTOMER' WHERE id=3` (chọn user role customer)
```http
POST /auth/login
{ "email":"<email_user_3>", "password":"<dung>" }
```
**Kỳ vọng:** 403 + `{ error: "ROLE_NOT_ALLOWED", message: "Tài khoản này không có quyền truy cập. Vui lòng dùng trang đăng nhập khách hàng." }`
- DB: KHÔNG có session mới được tạo trong refresh_sessions
- Set-Cookie: KHÔNG được set
**Mục đích:** xác nhận endpoint /auth/login chỉ phục vụ ADMIN/SELLER, customer dùng endpoint khác (người khác làm)

### TC-2.7 GET /auth/me khi chưa login
```http
GET /auth/me
```
**Kỳ vọng:** 401

### TC-2.8 GET /auth/me với access token đúng
```http
GET /auth/me
Authorization: Bearer <accessToken_TC-2.1>
```
**Kỳ vọng:** 200 + UserDto đầy đủ

### TC-2.9 GET /auth/me với token sai chữ ký
```http
GET /auth/me
Authorization: Bearer eyJfake.invalid.signature
```
**Kỳ vọng:** 401

### TC-2.10 RBAC: GET /admin/products với token CUSTOMER
**Setup:** `UPDATE user SET role='CUSTOMER' WHERE id=3`, login user id=3, lấy access token
```http
GET /admin/products
Authorization: Bearer <token_customer>
```
**Kỳ vọng:** 403

### TC-2.11 RBAC: GET /admin/products với token ADMIN
```http
GET /admin/products
Authorization: Bearer <token_admin_TC-2.1>
```
**Kỳ vọng:** 200 + array sản phẩm

→ 11 TC PASS → ping Claude → Prompt 3.

---

# 🟨 PROMPT 3 — BE Refresh + Logout + Sessions (Bài 7)

## 📎 File Codex cần đọc trước
- `auth-jwt.doc` §A.2-A.7, "Refresh token storage", "Multi-device + Remember me"
- Files đã có: `AuthController.java`, `RefreshSessionRepository.java` (Prompt 2)

## 📁 File Codex sẽ tạo / sửa (3 files)

```
M   Marketplace-platform/src/main/java/docker_test/com/repository/RefreshSessionRepository.java
M   Marketplace-platform/src/main/java/docker_test/com/controllers/auth/AuthController.java
NEW Marketplace-platform/src/main/java/docker_test/com/utils/CookieUtil.java
```

## 🚀 Prompt copy → Codex

```
Tiếp tục từ Prompt 2 (đã PASS).

Đọc auth-jwt.doc §A.2, §A.3, §A.4, §A.6, §A.7, "Refresh token storage", "Multi-device + Remember me", "Reuse / replay detection".

Nhiệm vụ Prompt 3 (BE Refresh & Sessions):

1. Tạo Marketplace-platform/src/main/java/docker_test/com/utils/CookieUtil.java:
   - @Component
   - Constructor inject @Value cookie config
   - setRefreshCookie(HttpServletResponse res, String value, long maxAgeSeconds): build ResponseCookie với httpOnly, secure, path, sameSite, maxAge → res.addHeader("Set-Cookie", ...)
   - clearRefreshCookie(HttpServletResponse res): set value="", maxAge=0
   - readRefreshCookie(HttpServletRequest req): loop request.getCookies() tìm cookie tên config → return value or null

2. Bổ sung methods vào RefreshSessionRepository.java (KHÔNG xóa method cũ):
   - findByTokenHash(String hash) → RefreshSession or null. WHERE token_hash=? AND revoked_at IS NULL AND expires_at > NOW()
   - findActiveByUserId(long userId) → List<RefreshSession>. WHERE user_id=? AND revoked_at IS NULL AND expires_at > NOW() ORDER BY last_used_at DESC
   - revokeById(String id) → UPDATE SET revoked_at=NOW() WHERE id=?
   - revokeAllByUserId(long userId) → UPDATE SET revoked_at=NOW() WHERE user_id=? AND revoked_at IS NULL → return số rows affected
   - rotate(String oldId, String newId, Long userId, String newTokenHash, java.sql.Timestamp newExpiresAt, String userAgent, String ip):
     - Dùng transaction (Connection.setAutoCommit(false))
     - UPDATE refresh_sessions SET revoked_at=NOW() WHERE id=oldId
     - INSERT new row với rotated_from=oldId, ip_first=ip, ip_last=ip, created_at=NOW, last_used_at=NOW
     - commit; nếu lỗi → rollback
   - updateLastUsed(String id, String ip) → UPDATE last_used_at=NOW(), ip_last=ip WHERE id=?
   - Tất cả method dùng PreparedStatement.

3. Bổ sung 5 endpoints vào AuthController.java (KHÔNG xóa /login, /me):

   a) @PostMapping("/refresh"):
      - HttpServletRequest req, HttpServletResponse res
      - String cookieValue = cookieUtil.readRefreshCookie(req)
      - Nếu null → 401 ApiError REFRESH_INVALID + cookieUtil.clearRefreshCookie(res)
      - String tokenHash = jwtService.hashRefresh(cookieValue)
      - RefreshSession session = repo.findByTokenHash(tokenHash)
      - Nếu session==null → 401 REFRESH_INVALID + clear cookie
      - Replay detection: kiểm tra cookieValue có thuộc 1 session đã rotated_from không (tức là token cũ bị dùng lại sau rotate). Nếu CÓ một session khác có rotated_from = session.id (rotate chain) thì là token cũ bị dùng lại — khi đó:
        repo.revokeAllByUserId(session.userId)
        clear cookie
        return 401 REFRESH_INVALID
      - Lấy User từ userRepository.findById(session.userId), kiểm tra is_active. Nếu disabled → 401 REFRESH_INVALID
      - Tạo accessToken mới (jwtService.createAccessToken)
      - Tạo opaqueRefresh mới + hash mới
      - Tạo newSessionId UUID
      - newExpiresAt = Timestamp.from(Instant.now().plus(refreshTtlDays, DAYS))
      - repo.rotate(session.id, newSessionId, session.userId, newHash, newExpiresAt, userAgent, ip)
      - cookieUtil.setRefreshCookie(res, opaqueRefresh, maxAgeSeconds)
      - Trả body { "accessToken": newAccessToken }

   b) @PostMapping("/logout"):
      - cookieValue = cookieUtil.readRefreshCookie(req)
      - Nếu có: hash → findByTokenHash → if session != null → repo.revokeById(session.id)
      - cookieUtil.clearRefreshCookie(res)
      - Trả { "success": true } (idempotent — luôn 200)

   c) @PostMapping("/logout-all"):
      - Yêu cầu Authentication (nếu null → 401 do Spring)
      - Long userId = (Long) auth.getPrincipal()
      - int count = repo.revokeAllByUserId(userId)
      - cookieUtil.clearRefreshCookie(res)
      - Trả { "success": true, "revokedSessions": count }

   d) @GetMapping("/sessions"):
      - Yêu cầu Authentication
      - Long userId = (Long) auth.getPrincipal()
      - List<RefreshSession> sessions = repo.findActiveByUserId(userId)
      - Đọc current cookie hash để xác định session "current"
      - Map sang DTO inline: { id, userAgent, ipLast, lastUsedAt, createdAt, current: bool }
      - Trả List<SessionDTO>

   e) @PostMapping("/sessions/{sessionId}/revoke"):
      - Yêu cầu Authentication
      - Long userId = (Long) auth.getPrincipal()
      - RefreshSession session = repo.findById(sessionId)
      - Nếu null hoặc session.userId != userId → 404 ApiError SESSION_NOT_FOUND
      - repo.revokeById(sessionId)
      - Trả { "success": true }

4. Bổ sung CookieUtil vào SecurityConfig permitAll (nếu cần): /auth/refresh và /auth/logout đã permitAll từ Prompt 1, KHÔNG cần thay đổi. /auth/logout-all, /auth/sessions, /auth/sessions/*/revoke yêu cầu auth — thuộc anyRequest().authenticated() → tự động được bảo vệ.

5. Build verify mvnw compile PASS.

CẤM:
- ❌ KHÔNG sửa JwtService, JwtAuthFilter, SecurityConfig
- ❌ KHÔNG sửa endpoint /login hoặc /me
- ❌ KHÔNG đụng frontend
- ❌ KHÔNG sửa controllers admin/seller/order
- ❌ KHÔNG dùng @Scheduled (không cần job dọn session expired)
- ❌ KHÔNG xóa method nào trong RefreshSessionRepository

Báo cáo: liệt kê 3 files (1 new + 2 modified) + log BUILD SUCCESS + xác nhận 5 endpoint mới đăng ký.
```

## 📮 Test Postman sau Prompt 3

### TC-3.1 Refresh thành công + rotation
**Setup:** login (TC-2.1), Postman tự lưu cookie.
```http
POST http://localhost:8001/auth/refresh
(Cookie tự gửi)
```
**Kỳ vọng:** 200 + body `{accessToken: "eyJ..."}`. Set-Cookie mới (giá trị KHÁC trước). DB: session cũ revoked_at != NULL, session mới rotated_from = id_cũ.

### TC-3.2 Refresh không cookie
```http
POST /auth/refresh
(no Cookie)
```
**Kỳ vọng:** 401 REFRESH_INVALID

### TC-3.3 Refresh với cookie revoked
**Setup:** sau TC-3.1 (cookie cũ đã revoked), thử refresh lại với cookie cũ
```http
POST /auth/refresh
Cookie: __Secure-refresh=<cookie_cũ_đã_revoked>
```
**Kỳ vọng:** 401 REFRESH_INVALID + Set-Cookie clear

### TC-3.4 Replay detection (CRITICAL — câu hỏi defense)
**Setup:**
1. Login → cookie A
2. Refresh với A → nhận B
3. Refresh LẦN NỮA với A (cookie cũ)

**Kỳ vọng:** Lần 3 → 401 REFRESH_INVALID. DB: TẤT CẢ sessions của user đó revoked (revoke widespread).

### TC-3.5 Logout (có cookie)
```http
POST /auth/logout
Cookie: __Secure-refresh=<active>
```
**Kỳ vọng:** 200 `{success:true}` + Set-Cookie Max-Age=0. DB: session revoked.

### TC-3.6 Logout idempotent (không cookie)
```http
POST /auth/logout (no cookie)
```
**Kỳ vọng:** 200 `{success:true}` (không lỗi)

### TC-3.7 Logout-all
**Setup:** login từ 2 trình duyệt khác (Chrome + Firefox / hoặc 2 Postman tab), DB có 2 sessions active.
```http
POST /auth/logout-all
Authorization: Bearer <accessToken>
```
**Kỳ vọng:** 200 `{success:true, revokedSessions:2}`. DB: cả 2 revoked.

### TC-3.8 GET /sessions
**Setup:** đang có 2 sessions
```http
GET /auth/sessions
Authorization: Bearer <token>
Cookie: <session1_cookie>
```
**Kỳ vọng:** 200 + array 2 phần tử. Phần tử có cookie hiện tại current=true.

### TC-3.9 Revoke 1 session khác
```http
POST /auth/sessions/<sessionId_2>/revoke
Authorization: Bearer <token_session1>
```
**Kỳ vọng:** 200 + `{success:true}`. DB: chỉ session 2 revoked.

### TC-3.10 Revoke session của user khác
**Setup:** login user 1 và user 2, lấy sessionId_user2
```http
POST /auth/sessions/<sessionId_user2>/revoke
Authorization: Bearer <token_user1>
```
**Kỳ vọng:** 404 SESSION_NOT_FOUND (NOT 403 — không lộ tồn tại)

### TC-3.11 Refresh khi user disabled
**Setup:** `UPDATE user SET is_active=0 WHERE id=1`
```http
POST /auth/refresh (cookie active)
```
**Kỳ vọng:** 401 REFRESH_INVALID
**Cleanup:** `UPDATE user SET is_active=1 WHERE id=1`

→ 11 TC PASS → ping Claude → Prompt 4.

---

# 🟩 PROMPT 4 — FE Axios + AuthContext + Login Page (Bài 3+4)

## 📎 File Codex cần đọc trước
- `auth-jwt.doc` Bước 3, 4, 5
- File hiện có: `marketfrontend/src/lib/http.ts` (chỉnh sửa, không tạo mới)
- Tham khảo style: `marketfrontend/src/context/ToastContext.tsx`, các form login/register hiện có

## 📁 File Codex sẽ tạo / sửa (6 files)

```
M   marketfrontend/src/lib/http.ts
NEW marketfrontend/src/context/AuthContext.tsx
M   marketfrontend/src/app/auth/admin-login.tsx       ← UI 218 dòng đã có, tích hợp useAuth + role check
M   marketfrontend/src/app/auth/seller-login.tsx      ← UI 216 dòng đã có, tích hợp useAuth + role check
NEW marketfrontend/src/app/admin/login/page.tsx       ← MỚI URL /admin/login (admin/layout.tsx đã skip Sidebar khi pathname=/admin/login)
M   marketfrontend/src/app/admin/layout.tsx            ← SỬA: thêm pathname check, skip Sidebar/Header cho /admin/login
M   marketfrontend/src/app/seller/login/page.tsx      ← REPLACE impl cũ, dùng auth/seller-login.tsx
M   marketfrontend/src/app/layout.tsx                 ← wrap AuthProvider (giữ Provider khác)
```

⚠️ **TUYỆT ĐỐI KHÔNG đụng:**
- `marketfrontend/src/app/auth/login.tsx` (CUSTOMER component — module người khác)
- `marketfrontend/src/app/login/page.tsx` (CUSTOMER page)
- `marketfrontend/src/app/auth/seller-register.tsx`, `seller-forgot-password.tsx`, `seller-verify-otp.tsx` (Phase forgot-password/OTP sau)

## 🚀 Prompt copy → Codex

```
Tiếp tục từ Prompt 3 (BE auth đã PASS Postman test).

Đọc auth-jwt.doc Bước 3, 4, 5. KHÔNG implement queue/lock interceptor ở Prompt này (Prompt 6). Chỉ basic interceptor.

Nhiệm vụ Prompt 4 (FE basic auth):

1. Sửa marketfrontend/src/lib/http.ts (KHÔNG tạo file mới):
   - Tạo axios instance:
     baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
     withCredentials: true
     timeout: 10000
   - Module-level: let accessToken: string | null = null
   - Export: setAccessToken(t), getAccessToken()
   - Request interceptor: nếu accessToken có và cfg.headers, gán Authorization: Bearer ${accessToken}
   - Response interceptor: pass-through ở Prompt này (chỉ log error nếu DEV). KHÔNG retry tự động — Prompt 6 sẽ làm.
   - Giữ các function/method hiện có trong file — KHÔNG xóa.

2. Tạo marketfrontend/src/context/AuthContext.tsx:
   - 'use client' directive
   - interface AuthUser { id: number; email: string; fullName: string; role: 'ADMIN' | 'SELLER' | 'CUSTOMER' }
   - interface AuthCtx { user, loading, login, logout }
   - <AuthProvider>:
     useEffect mount: gọi http.get('/auth/me'). Nếu success → setUser(res.data). Nếu fail → setUser(null). setLoading(false).
     login(email, password):
       const res = await http.post('/auth/login', {email, password})
       setAccessToken(res.data.accessToken)
       setUser(res.data.user)
       return res.data.user
     logout():
       try { await http.post('/auth/logout') } catch {}
       setAccessToken(null)
       setUser(null)
       if (typeof window !== 'undefined') window.location.href = '/auth/login'
   - useAuth() hook trả AuthCtx; throw nếu dùng ngoài Provider.

3. Sửa marketfrontend/src/app/layout.tsx:
   - Import AuthProvider
   - Wrap children sau cùng (sau QueryClientProvider, ToastProvider hiện có)
   - KHÔNG xóa Provider khác

4. Sửa marketfrontend/src/app/auth/admin-login.tsx (file 218 dòng ĐÃ TỒN TẠI):
   - KHÔNG xóa UI hiện có — chỉ tích hợp useAuth.login() vào submit handler
   - Nếu form chưa dùng react-hook-form + zod → migrate sang dùng (giống các form admin khác trong project)
   - zod schema:
     z.object({ email: z.string().email("Email không hợp lệ"), password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự") })
   - Submit handler:
     try {
       const user = await login(email, password); // useAuth().login
       // CHECK ROLE: trang admin-login chỉ accept ADMIN
       if (user.role !== 'ADMIN') {
         setAccessToken(null);  // clear vì không phải admin
         toast.error('Tài khoản này không phải Admin. Vui lòng dùng trang đăng nhập phù hợp.');
         return;
       }
       router.push('/admin');
     } catch (err) { toast.error(mapError(err)); }
   - mapError: 'INVALID_CREDENTIALS' → "Email hoặc mật khẩu không đúng", 'ACCOUNT_DISABLED' → "Tài khoản đã bị khóa", 'ROLE_NOT_ALLOWED' → "Tài khoản này không phải Admin", else generic
   - Loading state khi submitting

5. Sửa marketfrontend/src/app/auth/seller-login.tsx (file 216 dòng ĐÃ TỒN TẠI) tương tự:
   - Tích hợp useAuth.login()
   - CHECK ROLE: chỉ accept SELLER
     if (user.role !== 'SELLER') {
       setAccessToken(null);
       toast.error('Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập phù hợp.');
       return;
     }
     router.push('/seller');
   - mapError tương tự admin-login nhưng message thay 'Admin' → 'Seller'

6. **TẠO MỚI marketfrontend/src/app/admin/login/page.tsx** (URL /admin/login):
   ```tsx
   // app/admin/login/page.tsx
   export { default } from '@/app/auth/admin-login';
   ```
   Đây là re-export pattern: page route /admin/login sẽ render component từ auth/admin-login.tsx.

   **Option A (đã apply):** admin/layout.tsx được sửa thêm pathname check — skip Sidebar/Header khi pathname === '/admin/login'. Codex verify file đã chứa logic dưới (nếu chưa thì thêm vào):
   ```tsx
   const pathname = usePathname();
   const isPublicAdminRoute = pathname === '/admin/login' || pathname?.startsWith('/admin/login/');
   if (isPublicAdminRoute) {
     return <QueryClientProvider><ToastProvider>{children}</ToastProvider></QueryClientProvider>;
   }
   // else render với Sidebar + Header như cũ
   ```

7. **REPLACE marketfrontend/src/app/seller/login/page.tsx** (đang là impl cũ riêng, sẽ thay):
   ```tsx
   // app/seller/login/page.tsx
   export { default } from '@/app/auth/seller-login';
   ```
   Xóa toàn bộ implementation cũ trong file này (SellerLoginForm và SellerLoginPage hiện có).
   Lý do: tập trung 1 source of truth là auth/seller-login.tsx, tránh duplicate code.

6. Build verify: cd marketfrontend && npm run build → PASS không lỗi TypeScript.

CẤM (Option 2 — Vũ chỉ làm Admin + Seller):
- ❌ KHÔNG đụng marketfrontend/src/app/auth/login.tsx (CUSTOMER — người khác)
- ❌ KHÔNG đụng marketfrontend/src/app/login/* (CUSTOMER)
- ❌ KHÔNG đụng marketfrontend/src/app/auth/seller-register.tsx (đã có flow register riêng)
- ❌ KHÔNG đụng seller-forgot-password.tsx, seller-verify-otp.tsx (Phase forgot-password sau)
- ❌ KHÔNG sửa file backend (đã xong Prompt 3)
- ❌ KHÔNG implement queue/lock interceptor (Prompt 6)
- ❌ KHÔNG tạo ProtectedRoute (Prompt 5)
- ❌ KHÔNG cài thư viện mới (react-hook-form, zod, axios đã có)
- ❌ KHÔNG xóa MOCK_USER hoặc test data hiện có

Báo cáo: 5 files tạo/sửa + npm run build PASS + mô tả flow login redirect cho Admin và Seller riêng.
```

## 📮 Manual UI tests sau Prompt 4 (Option 2)

(DevTools F12 + Network tab)

### Phần A — Admin Login Page

### TC-4.1 Render admin login page
- Mở **http://localhost:3000/admin/login** (top-level URL, KHÔNG phải /admin/login)
- Thấy form 2 input + nút "Đăng nhập" (UI từ auth/admin-login.tsx render qua re-export)
- KHÔNG bị 404
- KHÔNG có Sidebar admin (vì đặt ngoài /admin/*)

### TC-4.2 Validation client-side
- Submit empty → error "Email không hợp lệ" + "Mật khẩu tối thiểu 6"
- Password "123" → error min 6

### TC-4.3 Admin login sai password
- Email admin, password sai
- **Network**: POST /auth/login → 401 INVALID_CREDENTIALS
- **UI**: toast "Email hoặc mật khẩu không đúng"

### TC-4.4 Admin login success
- Submit credentials đúng (role ADMIN)
- **Application > Cookies**: `__Secure-refresh` HttpOnly
- **Network**: POST /auth/login 200, role: "ADMIN"
- **Redirect**: tự sang /admin
- AuthContext.user.role = "ADMIN"

### TC-4.5 SELLER login ở /admin/login → REJECT
**Setup:** lấy email của user role SELLER
- Vào **/admin/login** → submit credentials seller (đúng password)
- **Network**: POST /auth/login → 200 (BE chấp nhận, vì SELLER trong whitelist)
- **UI**: toast đỏ "Tài khoản này không phải Admin. Vui lòng dùng trang đăng nhập phù hợp."
- **Redirect**: KHÔNG redirect (ở lại /admin/login)
- AuthContext: accessToken bị clear, user=null

### TC-4.6 CUSTOMER login ở /admin/login → REJECT 403
**Setup:** `UPDATE user SET role='CUSTOMER' WHERE id=3`, dùng email user 3
- Vào /admin/login → submit
- **Network**: POST /auth/login → 403 ROLE_NOT_ALLOWED
- **UI**: toast "Tài khoản này không có quyền truy cập" hoặc message từ BE
- **Redirect**: KHÔNG

### Phần B — Seller Login Page (URL /seller/login)

### TC-4.7 Render seller login
- Mở **http://localhost:3000/seller/login**
- Form từ auth/seller-login.tsx render (UI 216 dòng có sẵn)
- KHÔNG còn dùng impl cũ (SellerLoginForm 330 dòng đã bị thay)

### TC-4.8 Seller login success
- Credentials đúng (role SELLER) → 200 → redirect /seller
- AuthContext.user.role = "SELLER"

### TC-4.9 ADMIN login ở /seller/login → REJECT
- Vào /seller/login → submit credentials admin
- **Network**: POST /auth/login → 200 (BE chấp nhận)
- **UI**: toast đỏ "Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập phù hợp."
- **Redirect**: KHÔNG

### Phần C — Common

### TC-4.10 Reload sau login (token mất)
- Sau TC-4.4, F5
- **Network**: GET /auth/me → 401 (access token mất)
- AuthContext.user → null
- ❗ Behavior mong muốn ở Prompt 4 — Prompt 6 sẽ fix silent refresh

### TC-4.11 CORS check
- Headers response của /auth/login chứa Access-Control-Allow-Origin + Credentials: true

### TC-4.12 Race protection
- Spam click submit 5 lần → chỉ 1 request đi (button disabled khi submitting)

### TC-4.13 Endpoint customer NOT touched
- Mở /login (customer page)
- File `app/login/page.tsx` KHÔNG bị Codex sửa — verify:
  ```bash
  git diff marketfrontend/src/app/login/page.tsx       # phải empty
  git diff marketfrontend/src/app/auth/login.tsx       # phải empty
  ```

### TC-4.14 Verify URL routing
```bash
# Page admin login phải tồn tại (cần Next.js dev server đang chạy):
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/login   # phải 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/seller/login  # phải 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login         # phải 200 (customer, không bị động)
```

→ 14 TC PASS → ping Claude → Prompt 5.

---

# 🟫 PROMPT 5 — FE ProtectedRoute + Logout button (Bài 6)

## 📎 File Codex cần đọc trước
- `auth-jwt.doc` Bước 10
- File đã có: `AuthContext.tsx` (Prompt 4)
- Tham khảo: `marketfrontend/src/components/admin/Sidebar.tsx` hoặc layout admin

## 📁 File Codex sẽ tạo / sửa (3-4 files)

```
NEW marketfrontend/src/components/auth/ProtectedRoute.tsx
M   marketfrontend/src/app/admin/layout.tsx (nếu có; nếu không thì Codex BÁO Vũ — KHÔNG tạo)
M   marketfrontend/src/app/seller/layout.tsx (tương tự)
M   marketfrontend/src/components/admin/Sidebar.tsx (hoặc topbar — thêm nút Đăng xuất)
```

## 🚀 Prompt copy → Codex

```
Tiếp tục từ Prompt 4 (login flow đã PASS).

Đọc auth-jwt.doc Bước 10. Đọc AuthContext.tsx đã tạo Prompt 4.

Nhiệm vụ Prompt 5 (FE Protect & Logout UI):

1. Tạo marketfrontend/src/components/auth/ProtectedRoute.tsx:
   - 'use client'
   - interface Props { children: ReactNode; requiredRole?: 'ADMIN'|'SELLER'|'CUSTOMER' }
   - Sử dụng useAuth() và useRouter()
   - useEffect: nếu !loading và !user → router.replace('/auth/login')
   - useEffect: nếu user và requiredRole và user.role !== requiredRole → router.replace dựa trên role thực:
     ADMIN → '/admin', SELLER → '/seller', CUSTOMER → '/'
   - Nếu loading → return Spinner đơn giản (Tailwind)
   - Nếu !user → return null (đang redirect)
   - Else → return children

2. Wrap layouts:
   a) Tìm marketfrontend/src/app/admin/layout.tsx
      - Nếu có: wrap children bằng <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>
      - Nếu KHÔNG có: TẠO MỚI với cấu trúc đơn giản (export default function AdminLayout({children}: {children:ReactNode}) { return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute> })
      - KHÔNG xóa code/style hiện có nếu file tồn tại
   b) Tương tự cho marketfrontend/src/app/seller/layout.tsx với requiredRole="SELLER"

3. Thêm nút Logout vào Sidebar admin:
   - Tìm component Sidebar admin (vd marketfrontend/src/components/admin/Sidebar.tsx hoặc tương tự)
   - Nếu có: thêm 1 mục cuối với icon LogOut từ lucide-react + label "Đăng xuất"
   - onClick: useAuth().logout()
   - Style giống các mục khác trong Sidebar
   - Nếu Sidebar phức tạp / không tìm được vị trí phù hợp: thêm vào topbar hoặc tạo nút floating đơn giản — báo Vũ trong report

4. Build verify npm run build PASS.

CẤM:
- ❌ KHÔNG sửa AuthContext (đã xong Prompt 4)
- ❌ KHÔNG sửa http.ts (Prompt 6)
- ❌ KHÔNG tạo middleware.ts của Next.js (auth ở client side)
- ❌ KHÔNG sửa các page admin/seller chi tiết — chỉ wrap layout
- ❌ KHÔNG đụng backend
- ❌ KHÔNG cài thư viện mới

Báo cáo: 3-4 files + npm run build PASS + xác nhận flow protect + logout.
```

## 📮 Manual UI tests sau Prompt 5

### TC-5.1 Truy cập /admin khi chưa login
- Logout rồi gõ http://localhost:3000/admin/products
- **Kỳ vọng**: ProtectedRoute redirect → /auth/login

### TC-5.2 Truy cập /admin với role SELLER
- Login user role SELLER (token Bearer hợp lệ, /me trả role=SELLER)
- Gõ /admin/products
- **Kỳ vọng**: redirect /seller

### TC-5.3 Truy cập /seller với role ADMIN
- Login admin
- Gõ /seller
- **Kỳ vọng**: redirect /admin (vì admin.role !== 'SELLER')
- ⚠️ Hoặc cho phép admin truy cập seller (nếu spec allow) — tùy decision của Codex, miễn nhất quán

### TC-5.4 Truy cập /admin với role ADMIN
- Login admin → /admin
- **Kỳ vọng**: hiển thị bình thường, ProtectedRoute không redirect

### TC-5.5 Loading spinner hiển thị
- Throttle Network "Slow 3G" trong DevTools
- Reload /admin
- **Kỳ vọng**: thấy spinner ngắn trước khi /me trả

### TC-5.6 Logout button trong Sidebar
- Login admin → /admin
- Click "Đăng xuất"
- **Network**: POST /auth/logout 200
- **Cookies**: cookie cleared
- **Redirect**: /auth/login

### TC-5.7 Truy cập /admin sau logout
- Sau TC-5.6, gõ lại /admin → bị redirect /auth/login

### TC-5.8 Direct URL bypass attempt
- Mở /admin/products/4 trực tiếp khi chưa login
- **Kỳ vọng**: redirect /auth/login (ProtectedRoute chặn)

→ 8 TC PASS → ping Claude → Prompt 6.

---

# 🟪 PROMPT 6 — FE Auto-refresh + Queue/Lock + Silent refresh (Bài 8+9)

## 📎 File Codex cần đọc trước
- `auth-jwt.doc` Bước 7-10, §D (FULL Axios skeleton với queue/lock), "Axios interceptor checklist"
- File đã có: `http.ts` (Prompt 4), `AuthContext.tsx` (Prompt 4)

## 📁 File Codex sẽ sửa (2 files)

```
M   marketfrontend/src/lib/http.ts
M   marketfrontend/src/context/AuthContext.tsx
```

## 🚀 Prompt copy → Codex

```
Tiếp tục từ Prompt 5 (Protected Route + Logout đã PASS).

Đọc auth-jwt.doc §D (Axios full skeleton), Bước 7-10, "Axios interceptor checklist".

Nhiệm vụ Prompt 6 (Auto-refresh + Queue/Lock + Silent refresh):

1. Nâng cấp marketfrontend/src/lib/http.ts thành interceptor đầy đủ theo §D:
   - Module variables: let isRefreshing = false; let refreshQueue: Array<(t: string|null) => void> = [];
   - flushQueue(t): refreshQueue.forEach(cb => cb(t)); refreshQueue = []
   - Response interceptor (replace logic Prompt 4):
     - Lấy original = err.config (cast InternalAxiosRequestConfig & {_retry?: boolean})
     - Lấy status = err.response?.status
     - Lấy url = original?.url || ''
     - Nếu status !== 401 OR original._retry OR url.includes('/auth/refresh') OR url.includes('/auth/login') → return Promise.reject(err)
     - original._retry = true
     - Nếu isRefreshing === true:
       return new Promise((resolve, reject) => {
         refreshQueue.push((newToken) => {
           if (newToken) {
             original.headers.Authorization = `Bearer ${newToken}`;
             resolve(http(original))
           } else { reject(err) }
         })
       })
     - isRefreshing = true
     - try { const r = await axios.post(`${baseURL}/auth/refresh`, {}, {withCredentials:true});
             const newToken = r.data.accessToken;
             setAccessToken(newToken);
             flushQueue(newToken);
             original.headers.Authorization = `Bearer ${newToken}`;
             return http(original); }
     - catch (refreshErr) { flushQueue(null); setAccessToken(null);
                            if (typeof window !== 'undefined') window.location.href = '/auth/login';
                            return Promise.reject(refreshErr); }
     - finally { isRefreshing = false; }
   - Giữ accessToken + getter/setter, request interceptor như Prompt 4.
   - Lưu ý: dùng axios trực tiếp (không phải http instance) cho /auth/refresh để tránh recursion.

2. Sửa AuthContext.tsx để có "silent refresh on mount":
   - useEffect mount thay vì gọi /auth/me trực tiếp:
     bước 1: try await axios.post(`${baseURL}/auth/refresh`, {}, {withCredentials:true})
              → setAccessToken(res.data.accessToken)
     bước 2: nếu refresh success → http.get('/auth/me') → setUser
     bước 3: nếu refresh fail (401) → setUser(null) (không redirect — chỉ nếu user navigate đến protected page mới redirect)
     setLoading(false) cuối
   - Mục đích: sau F5 reload, nếu cookie refresh còn hợp lệ → tự đăng nhập lại; nếu không → user=null im lặng.

3. Build verify npm run build PASS.

CẤM:
- ❌ KHÔNG sửa backend
- ❌ KHÔNG sửa ProtectedRoute (Prompt 5)
- ❌ KHÔNG đụng các trang/component khác ngoài 2 file trên
- ❌ KHÔNG tạo file mới
- ❌ KHÔNG cài thư viện mới
- ❌ KHÔNG dùng setInterval/setTimeout proactive refresh — chỉ refresh khi 401

Báo cáo: 2 files sửa + npm run build PASS + giải thích logic queue/lock đã đúng spec §D.
```

## 📮 Manual UI tests sau Prompt 6

### TC-6.1 Auto-refresh khi access token hết hạn
**Setup:** đặt tạm `jwt.access-ttl-minutes=1` trong application.properties → restart BE → login → chờ 70s
- Navigate /admin/products
- **Network tab**: GET /admin/products 401 → POST /auth/refresh 200 → GET /admin/products retry 200
- **UI**: data hiển thị bình thường, KHÔNG flicker hay error

### TC-6.2 Queue/lock concurrent 401 (CRITICAL)
**Setup:** access token hết hạn (TTL=1 phút)
- Trigger 5 API parallel: vd mở /admin với multiple sections gọi đồng thời
- **Network**: 5 request 401 → CHỈ 1 POST /auth/refresh (KHÔNG spam) → 5 request retry với token mới
- ❗ Đây là điểm phòng thủ quan trọng

### TC-6.3 Refresh fail → redirect login
**Setup:** logout-all (Postman TC-3.7) trong khi FE đang login
- F5 reload trang admin
- **Network**: POST /auth/refresh 401 → redirect /auth/login

### TC-6.4 Silent refresh on mount (UX win)
**Setup:** login admin → đợi 30s → F5
- **Network khi load page**: POST /auth/refresh 200 → GET /auth/me 200
- **UI**: vẫn ở /admin, không bị đá về login
- AuthContext.user = admin

### TC-6.5 Reload với cookie expired
**Setup:** chờ refresh cookie expire (14 ngày — không thực tế test) hoặc DELETE FROM refresh_sessions
- F5
- **Network**: refresh 401, /auth/me không được gọi
- **UI**: AuthContext.user=null. Nếu navigate /admin → redirect login

### TC-6.6 Multi-tab logout sync
- Tab 1 + Tab 2 cùng /admin
- Logout ở Tab 1 → cookie cleared
- Tab 2 navigate (gọi API) → 401 → refresh fail → redirect login
- ❗ Có delay (Tab 2 không biết Tab 1 logout đến khi gọi API tiếp)

### TC-6.7 Cleanup sau test
- Trả `jwt.access-ttl-minutes=15` trong application.properties
- Restart BE

→ 7 TC PASS → ping Claude → ĐÓNG PHASE AUTH ✅

---

# 🎯 Sau khi xong cả 6 Prompts

## Vũ làm
1. Confirm 52 test cases (5 + 11 + 11 + 10 + 8 + 7) đều PASS
2. Test multi-device: login Chrome + Edge → 2 sessions trong DB → logout-all → cả 2 đều logout
3. Backup DB trước migration

## Claude làm sau khi Vũ ping
1. Review code mỗi prompt
2. Smoke test bằng curl
3. Tìm edge case
4. **Phase 5 — RBAC integration**: thay `@RequestHeader("X-Admin-Id")` trong AdminProductController/AdminSellerController bằng `@AuthenticationPrincipal Long userId` đọc từ JWT — Claude làm trực tiếp ~0.5 ngày

---

# ⚠️ Rủi ro Vũ cần để ý

1. **Codex scope creep** — đã thấy Phase 1.7, 2 P1, P2 P3. Mỗi prompt đều có CẤM list, đọc kỹ git status sau Codex xong.
2. **DB migration không chạy auto** — Codex chỉ tạo file SQL, Vũ chạy thủ công.
3. **JWT secret** — placeholder dev, prod phải đặt env var 256-bit random.
4. **Cookie SameSite=Lax** trong dev, prod cross-domain phải đổi `None` + Secure=true + HTTPS.
5. **TC-3.4 Replay detection** — KHÔNG SKIP, đây là điểm phòng thủ + câu hỏi defense.
6. **TC-6.2 Queue/lock** — KHÔNG SKIP, bug nhiều dev mắc.
7. **Backup .env / application.properties** trước khi merge prompt.

---

# 📋 Acceptance criteria toàn Phase Auth

- [ ] Migration `refresh_sessions` chạy thành công + user.role có
- [ ] Backend BUILD SUCCESS sau Prompt 1, 2, 3
- [ ] Frontend npm run build PASS sau Prompt 4, 5, 6
- [ ] 5 TC Prompt 1 PASS
- [ ] 12 TC Prompt 2 PASS (đặc biệt TC-2.6b — CUSTOMER role bị reject 403)
- [ ] 11 TC Prompt 3 PASS (đặc biệt TC-3.4 replay detection)
- [ ] 14 TC Prompt 4 PASS (đặc biệt TC-4.5 SELLER ở /admin/login bị reject + TC-4.13/14 customer file NOT touched + URL routing OK)
- [ ] 8 TC Prompt 5 PASS (protected route + logout)
- [ ] 7 TC Prompt 6 PASS (đặc biệt TC-6.2 queue/lock + TC-6.4 silent refresh)
- [ ] Multi-device: Chrome + Edge đồng thời, 2 sessions DB, logout-all xóa cả 2
- [ ] **Option 2 verify**: `git diff marketfrontend/src/app/auth/login.tsx` empty (file customer KHÔNG bị động)
- [ ] **Option 2 verify**: `git diff marketfrontend/src/app/login/` empty (folder customer KHÔNG bị động)
