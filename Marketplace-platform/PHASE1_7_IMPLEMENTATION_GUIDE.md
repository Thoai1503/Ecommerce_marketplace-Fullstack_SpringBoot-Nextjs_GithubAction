# PHASE 1.7: SUPER_ADMIN + AUDIT LOG IMPLEMENTATION GUIDE

**Timeline:** 6-7 giờ  
**Deadline:** 2026-05-25  
**Architecture:** 1 SUPER_ADMIN + 1 ADMIN (hard-coded roles)

---

# PROMPT 1: CODEX - BACKEND IMPLEMENTATION

## Backend Architecture Overview

```
Database:
├── admin_roles table (quản lý user nào là admin)
└── audit_logs table (log tất cả hoạt động)

Backend Services:
├── AuditService (tự động log mọi action)
├── SuperAdminController (4 endpoints)
└── AuditLogController (2 endpoints)

Existing Controllers (cần update):
├── AdminProductController (thêm auditService.logAction())
└── AdminSellerController (thêm auditService.logAction())
```

---

## PROMPT 1A: Database Schema & Migration

**Task:** Tạo migration SQL để thêm 2 bảng mới vào MySQL database

**File to create:** `migrations/V1_7__Create_Admin_Roles_And_Audit_Logs.sql`

**Content:**

```sql
-- 1. admin_roles table (quản lý user nào là admin)
CREATE TABLE admin_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL DEFAULT 'ADMIN' 
        CHECK(role_name IN ('ADMIN', 'SUPER_ADMIN')),
    created_by BIGINT NOT NULL COMMENT 'SUPER_ADMIN user_id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_name (role_name),
    INDEX idx_created_at (created_at)
);

-- 2. audit_logs table (log tất cả hoạt động)
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_id BIGINT NOT NULL COMMENT 'Người thực hiện hành động',
    actor_role VARCHAR(50) NOT NULL COMMENT 'SUPER_ADMIN, ADMIN, SELLER, USER',
    action VARCHAR(100) NOT NULL COMMENT 'APPROVE_PRODUCT, REJECT_SHOP, BLOCK_USER, etc.',
    resource_type VARCHAR(50) NOT NULL COMMENT 'PRODUCT, SHOP, USER, ADMIN',
    resource_id BIGINT COMMENT 'ID của resource bị tác động',
    details JSON COMMENT 'Chi tiết thêm: lý do, tham số cũ/mới, etc.',
    status VARCHAR(20) DEFAULT 'SUCCESS' COMMENT 'SUCCESS, FAILED',
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actor_id) REFERENCES users(id),
    INDEX idx_actor_id (actor_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at),
    INDEX idx_actor_action (actor_id, action, created_at)
);

-- 3. Thêm admin_role column vào users table (optional, để check nhanh)
ALTER TABLE users ADD COLUMN admin_role VARCHAR(50) DEFAULT NULL 
    AFTER role_id COMMENT 'SUPER_ADMIN, ADMIN, hoặc NULL';
```

**Requirements:**
- ✅ Tạo migration file với naming convention `V{version}__{description}.sql`
- ✅ `admin_roles.role_name` chỉ có 2 giá trị: ADMIN hoặc SUPER_ADMIN
- ✅ `audit_logs.details` là JSON để store dynamic data
- ✅ Tất cả timestamp dùng `CURRENT_TIMESTAMP`
- ✅ Tạo indexes cho query performance

---

## PROMPT 1B: Java Models & DTOs

**Task:** Tạo 4 Java files: AdminRole model, AuditLog model, 2 DTOs

### File 1: AdminRole Model

**Path:** `src/main/java/docker_test/com/models/AdminRole.java`

**Spec:**
```
- @Entity, @Table("admin_roles")
- Fields:
  * id: Long (PK)
  * userId: Long (FK → users)
  * roleName: String (ENUM: ADMIN, SUPER_ADMIN)
  * createdBy: Long (FK → users, SUPER_ADMIN user_id)
  * createdAt: LocalDateTime
  * updatedAt: LocalDateTime
  * isActive: Boolean (default true)
  
- Relationships:
  * @ManyToOne: user (users table)
  * @ManyToOne: createdByUser (users table)
  
- Lombok: @Data, @NoArgsConstructor, @AllArgsConstructor
- Constraints: userId unique, roleName not null
```

### File 2: AuditLog Model

**Path:** `src/main/java/docker_test/com/models/AuditLog.java`

**Spec:**
```
- @Entity, @Table("audit_logs")
- Fields:
  * id: Long (PK)
  * actorId: Long (FK → users, người thực hiện)
  * actorRole: String (SUPER_ADMIN, ADMIN, SELLER, USER)
  * action: String (APPROVE_PRODUCT, REJECT_SHOP, BLOCK_USER, etc.)
  * resourceType: String (PRODUCT, SHOP, USER, ADMIN)
  * resourceId: Long (ID của resource)
  * details: String (JSON, để store chi tiết như lý do, old/new values)
  * status: String (SUCCESS, FAILED)
  * ipAddress: String
  * userAgent: String
  * createdAt: LocalDateTime
  
- Relationships:
  * @ManyToOne: actor (users table)
  
- Lombok: @Data, @NoArgsConstructor, @AllArgsConstructor
- @JsonProperty(access = JsonProperty.Access.READ_ONLY) cho fields không cần edit
```

### File 3: AdminRoleDTO

**Path:** `src/main/java/docker_test/com/dto/admin/AdminRoleDTO.java`

**Spec:**
```
- Fields:
  * id: Long
  * userId: Long
  * userName: String (optional, from users table)
  * userEmail: String (optional, from users table)
  * roleName: String (ADMIN, SUPER_ADMIN)
  * createdAt: LocalDateTime
  * createdBy: Long
  * createdByName: String (optional)
  * isActive: Boolean
  
- Constructor: default, với fields quan trọng
- @Getter, @Setter, @NoArgsConstructor
```

### File 4: AuditLogDTO

**Path:** `src/main/java/docker_test/com/dto/admin/AuditLogDTO.java`

**Spec:**
```
- Fields:
  * id: Long
  * actorId: Long
  * actorName: String (optional, from users table)
  * actorRole: String
  * action: String
  * resourceType: String
  * resourceId: Long
  * resourceName: String (optional, e.g., product name, shop name)
  * details: Map<String, Object> (parse from JSON string)
  * status: String
  * createdAt: LocalDateTime
  * ipAddress: String
  
- Constructor: default, minimal
- @Getter, @Setter, @NoArgsConstructor
- Custom method: getDetailsAsMap() để parse JSON
```

---

## PROMPT 1C: Repositories

**Task:** Tạo 2 repository interfaces

### File 1: AdminRoleRepository

**Path:** `src/main/java/docker_test/com/repository/AdminRoleRepository.java`

**Spec:**
```java
public interface AdminRoleRepository extends JpaRepository<AdminRole, Long> {
    // Query methods:
    AdminRole findByUserId(Long userId);
    
    List<AdminRole> findByRoleName(String roleName);
    
    List<AdminRole> findByIsActiveTrue();
    
    boolean existsByUserIdAndRoleName(Long userId, String roleName);
    
    Optional<AdminRole> findByUserIdAndIsActiveTrue(Long userId);
    
    // DELETE: Soft delete
    void updateIsActiveByUserId(Long userId, boolean isActive);
}
```

### File 2: AuditLogRepository

**Path:** `src/main/java/docker_test/com/repository/AuditLogRepository.java`

**Spec:**
```java
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Query methods:
    List<AuditLog> findByActorId(Long actorId);
    
    List<AuditLog> findByActorIdAndCreatedAtBetween(
        Long actorId, 
        LocalDateTime start, 
        LocalDateTime end
    );
    
    List<AuditLog> findByActionAndResourceType(String action, String resourceType);
    
    List<AuditLog> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
    
    // Pagination:
    Page<AuditLog> findByActorId(Long actorId, Pageable pageable);
    
    Page<AuditLog> findAll(Pageable pageable);
    
    // Filter:
    Page<AuditLog> findByActorIdAndActionAndCreatedAtBetween(
        Long actorId,
        String action,
        LocalDateTime start,
        LocalDateTime end,
        Pageable pageable
    );
}
```

---

## PROMPT 1D: Services

**Task:** Tạo 2 services: AuditService, AdminRoleService

### File 1: AuditService

**Path:** `src/main/java/docker_test/com/services/AuditService.java`

**Spec:**
```java
@Service
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final HttpServletRequest request;
    
    // Method 1: Log action (gọi từ controllers)
    public void logAction(
        Long actorId,
        String actorRole,
        String action,
        String resourceType,
        Long resourceId,
        String details  // JSON string hoặc null
    ) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDetails(details);
        log.setStatus("SUCCESS");
        log.setIpAddress(clientIp());
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setCreatedAt(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
    
    // Method 2: Get logs by actor (cho ADMIN/SELLER/USER)
    public Page<AuditLogDTO> getMyAuditLogs(
        Long actorId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    ) {
        return auditLogRepository.findByActorIdAndCreatedAtBetween(
            actorId, startDate, endDate, pageable
        ).map(this::toDTO);
    }
    
    // Method 3: Get all logs (chỉ SUPER_ADMIN)
    public Page<AuditLogDTO> getAllAuditLogs(
        String action,  // optional filter
        String resourceType,  // optional filter
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    ) {
        // Implement filter logic
    }
    
    // Helper: Convert Entity to DTO
    private AuditLogDTO toDTO(AuditLog entity) {
        // Map entity fields to DTO
    }
    
    // Helper: Get client IP
    private String clientIp() {
        String h = request.getHeader("X-Forwarded-For");
        if (h != null && !h.isBlank()) return h.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
```

### File 2: AdminRoleService

**Path:** `src/main/java/docker_test/com/services/AdminRoleService.java`

**Spec:**
```java
@Service
public class AdminRoleService {
    
    private final AdminRoleRepository adminRoleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final EmailService emailService;
    
    // Method 1: Grant admin role (SUPER_ADMIN only)
    public AdminRoleDTO grantAdminRole(
        Long superAdminId,
        Long targetUserId,
        String roleName  // "ADMIN"
    ) throws Exception {
        // Validate: targetUser exists
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check: không được là admin rồi
        if (adminRoleRepository.existsByUserIdAndRoleName(targetUserId, roleName)) {
            throw new RuntimeException("User already has this role");
        }
        
        // Create new admin role
        AdminRole adminRole = new AdminRole();
        adminRole.setUserId(targetUserId);
        adminRole.setRoleName(roleName);
        adminRole.setCreatedBy(superAdminId);
        adminRole.setCreatedAt(LocalDateTime.now());
        adminRole.setIsActive(true);
        
        AdminRole saved = adminRoleRepository.save(adminRole);
        
        // Log action
        auditService.logAction(
            superAdminId, "SUPER_ADMIN", "GRANT_ADMIN_ROLE",
            "ADMIN", saved.getId(),
            String.format("{\"targetUserId\": %d, \"roleName\": \"%s\"}", 
                targetUserId, roleName)
        );
        
        // Send email setup link
        String resetToken = generateResetToken(targetUserId);
        String setupLink = frontendUrl + "/set-password?token=" + resetToken;
        emailService.send(
            targetUser.getEmail(),
            "Bạn đã được cấp quyền Admin - VietCommerce Hub",
            buildAdminSetupEmail(targetUser.getFullName(), setupLink)
        );
        
        return toDTO(saved);
    }
    
    // Method 2: Revoke admin role (SUPER_ADMIN only)
    public void revokeAdminRole(
        Long superAdminId,
        Long targetUserId
    ) throws Exception {
        AdminRole adminRole = adminRoleRepository.findByUserId(targetUserId)
            .orElseThrow(() -> new RuntimeException("Admin role not found"));
        
        adminRole.setIsActive(false);
        adminRoleRepository.save(adminRole);
        
        // Log action
        auditService.logAction(
            superAdminId, "SUPER_ADMIN", "REVOKE_ADMIN_ROLE",
            "ADMIN", adminRole.getId(),
            String.format("{\"targetUserId\": %d}", targetUserId)
        );
    }
    
    // Method 3: Reset admin password (SUPER_ADMIN only)
    public void resetAdminPassword(
        Long superAdminId,
        Long targetAdminId
    ) throws Exception {
        User admin = userRepository.findById(targetAdminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        String resetToken = generateResetToken(targetAdminId);
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        
        emailService.send(
            admin.getEmail(),
            "Đặt lại mật khẩu - VietCommerce Hub",
            buildPasswordResetEmail(admin.getFullName(), resetLink)
        );
        
        // Log action
        auditService.logAction(
            superAdminId, "SUPER_ADMIN", "RESET_ADMIN_PASSWORD",
            "USER", targetAdminId,
            String.format("{\"resetTokenSent\": true}")
        );
    }
    
    // Method 4: Get all admins with details
    public List<AdminRoleDTO> getAllAdmins() {
        List<AdminRole> roles = adminRoleRepository.findByIsActiveTrue();
        return roles.stream()
            .map(this::toDTOWithUserDetails)
            .collect(Collectors.toList());
    }
    
    // Helper methods
    private AdminRoleDTO toDTO(AdminRole entity) { ... }
    private AdminRoleDTO toDTOWithUserDetails(AdminRole entity) { ... }
    private String generateResetToken(Long userId) { ... }
    private String buildAdminSetupEmail(String name, String link) { ... }
    private String buildPasswordResetEmail(String name, String link) { ... }
}
```

---

## PROMPT 1E: Controllers

**Task:** Tạo 2 controllers: SuperAdminController, AuditLogController

### File 1: SuperAdminController

**Path:** `src/main/java/docker_test/com/controllers/SuperAdminController.java`

**Spec:**
```java
@RestController
@RequestMapping("/admin/super")
@PreAuthorize("hasRole('SUPER_ADMIN')")  // Spring Security
public class SuperAdminController {
    
    private final AdminRoleService adminRoleService;
    private final AuditService auditService;
    
    // Endpoint 1: Cấp quyền Admin cho user
    @PostMapping("/roles/grant")
    public ResponseEntity<Map<String, Object>> grantAdminRole(
            @Valid @RequestBody GrantAdminRoleRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long superAdminId = extractUserIdFromToken(userDetails);
            AdminRoleDTO result = adminRoleService.grantAdminRole(
                superAdminId, req.getUserId(), "ADMIN"
            );
            return ResponseEntity.ok(Map.of(
                "message", "Cấp quyền thành công",
                "data", result
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        }
    }
    
    // Endpoint 2: Bỏ quyền Admin
    @DeleteMapping("/roles/{userId}")
    public ResponseEntity<Map<String, Object>> revokeAdminRole(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long superAdminId = extractUserIdFromToken(userDetails);
            adminRoleService.revokeAdminRole(superAdminId, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Bỏ quyền thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        }
    }
    
    // Endpoint 3: Reset mật khẩu Admin
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword(
            @Valid @RequestBody ResetAdminPasswordRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long superAdminId = extractUserIdFromToken(userDetails);
            adminRoleService.resetAdminPassword(superAdminId, req.getAdminId());
            return ResponseEntity.ok(Map.of(
                "message", "Link reset đã được gửi đến email"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        }
    }
    
    // Endpoint 4: Xem danh sách Admin
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listAdmins() {
        List<AdminRoleDTO> admins = adminRoleService.getAllAdmins();
        return ResponseEntity.ok(Map.of(
            "data", admins,
            "total", admins.size()
        ));
    }
}
```

### File 2: AuditLogController

**Path:** `src/main/java/docker_test/com/controllers/AuditLogController.java`

**Spec:**
```java
@RestController
@RequestMapping("/admin/audit-logs")
public class AuditLogController {
    
    private final AuditService auditService;
    
    // Endpoint 1: Xem audit log toàn hệ thống (SUPER_ADMIN only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
                LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
                LocalDateTime endDate) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (startDate == null) startDate = LocalDateTime.now().minusMonths(1);
        if (endDate == null) endDate = LocalDateTime.now();
        
        Page<AuditLogDTO> logs = auditService.getAllAuditLogs(
            action, resourceType, startDate, endDate, pageable
        );
        
        return ResponseEntity.ok(Map.of(
            "data", logs.getContent(),
            "pagination", Map.of(
                "page", logs.getNumber(),
                "size", logs.getSize(),
                "total", logs.getTotalElements(),
                "totalPages", logs.getTotalPages()
            )
        ));
    }
    
    // Endpoint 2: Xem audit log của mình (ADMIN/SELLER/USER)
    @GetMapping("/my-logs")
    public ResponseEntity<Map<String, Object>> getMyAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
                LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
                LocalDateTime endDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = extractUserIdFromToken(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (startDate == null) startDate = LocalDateTime.now().minusMonths(3);
        if (endDate == null) endDate = LocalDateTime.now();
        
        Page<AuditLogDTO> logs = auditService.getMyAuditLogs(
            userId, startDate, endDate, pageable
        );
        
        return ResponseEntity.ok(Map.of(
            "data", logs.getContent(),
            "pagination", Map.of(
                "page", logs.getNumber(),
                "size", logs.getSize(),
                "total", logs.getTotalElements(),
                "totalPages", logs.getTotalPages()
            )
        ));
    }
}
```

---

## PROMPT 1F: Update Existing Controllers

**Task:** Update AdminProductController & AdminSellerController để call AuditService

### Changes to AdminProductController

**File:** `src/main/java/docker_test/com/controllers/AdminProductController.java`

**Changes:**
```
1. Inject AuditService:
   private final AuditService auditService;
   
2. In approveProduct():
   - After updating product status
   - Call: auditService.logAction(
       superAdminId, "SUPER_ADMIN"/"ADMIN",
       "APPROVE_PRODUCT", "PRODUCT", productId,
       null
     );
   
3. In rejectProduct():
   - Call: auditService.logAction(..., "REJECT_PRODUCT", ..., reason);
   
4. In hideProduct():
   - Call: auditService.logAction(..., "HIDE_PRODUCT", ..., null);
   
5. In unhideProduct():
   - Call: auditService.logAction(..., "UNHIDE_PRODUCT", ..., null);
   
6. In bulkApproveProducts():
   - For each product: call auditService.logAction(...)
```

### Changes to AdminSellerController

**File:** `src/main/java/docker_test/com/controllers/AdminSellerController.java`

**Changes:**
```
1. Inject AuditService:
   private final AuditService auditService;
   
2. In approveShop():
   - Call: auditService.logAction(..., "APPROVE_SHOP", "SHOP", shopId, null);
   
3. In rejectShop():
   - Call: auditService.logAction(..., "REJECT_SHOP", "SHOP", shopId, reason);
   
4. In blockShop():
   - Call: auditService.logAction(..., "BLOCK_SHOP", "SHOP", shopId, reason);
   
5. In unblockShop():
   - Call: auditService.logAction(..., "UNBLOCK_SHOP", "SHOP", shopId, null);
```

---

## PROMPT 1G: DTOs for Request/Response

**Task:** Tạo 3 request DTOs

### File 1: GrantAdminRoleRequest

**Path:** `src/main/java/docker_test/com/dto/admin/GrantAdminRoleRequest.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GrantAdminRoleRequest {
    @NotNull(message = "userId không được null")
    private Long userId;
}
```

### File 2: ResetAdminPasswordRequest

**Path:** `src/main/java/docker_test/com/dto/admin/ResetAdminPasswordRequest.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetAdminPasswordRequest {
    @NotNull(message = "adminId không được null")
    private Long adminId;
}
```

### File 3: AuditLogFilterRequest

**Path:** `src/main/java/docker_test/com/dto/admin/AuditLogFilterRequest.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogFilterRequest {
    private String action;
    private String resourceType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int page = 0;
    private int size = 20;
}
```

---

## PROMPT 1H: Security & Authorization

**Requirements for Backend:**

1. **Method-level Security:**
   - SuperAdminController methods: `@PreAuthorize("hasRole('SUPER_ADMIN')")`
   - AuditLogController `/all`: `@PreAuthorize("hasRole('SUPER_ADMIN')")`
   - AuditLogController `/my-logs`: `@PreAuthorize("hasAnyRole('ADMIN','SELLER','USER')")`

2. **JWT Token Validation:**
   - Extract userId from JWT token
   - Validate token contains role claim

3. **Error Handling:**
   - Use existing GlobalExceptionHandler
   - Return standardized ApiError responses

4. **Validation:**
   - Use @Valid on request DTOs
   - Check user existence before granting role
   - Prevent duplicate admin roles

---

## BACKEND SUMMARY

**Files to create:** 11 files
1. Migration SQL (V1_7__Create_Admin_Roles_And_Audit_Logs.sql)
2. AdminRole.java (model)
3. AuditLog.java (model)
4. AdminRoleDTO.java
5. AuditLogDTO.java
6. AdminRoleRepository.java
7. AuditLogRepository.java
8. AuditService.java
9. AdminRoleService.java
10. SuperAdminController.java
11. AuditLogController.java
+ 3 request DTOs (GrantAdminRoleRequest, ResetAdminPasswordRequest, AuditLogFilterRequest)

**Files to update:** 2 files
1. AdminProductController.java (add auditService calls)
2. AdminSellerController.java (add auditService calls)

**Dependencies:**
- Spring Data JPA
- Spring Security
- Spring Mail (already in pom.xml)
- Javax validation
- Lombok (already in pom.xml)

---

---

# PROMPT 2: GOOGLE AI STUDIO - FRONTEND IMPLEMENTATION

## Frontend Architecture Overview

**Structure:**
```
Frontend:
├── Pages:
│  ├── ManageAdminsPage.tsx (Quản lý Admin)
│  └── AuditLogPage.tsx (Audit Log Toàn Hệ Thống)
├── Components:
│  ├── AdminListTable.tsx
│  ├── GrantAdminModal.tsx
│  ├── AuditLogTable.tsx
│  └── AuditLogFilters.tsx
├── Services:
│  └── adminService.ts (API calls)
└── Types:
   ├── admin.ts
   └── auditLog.ts
```

---

## PROMPT 2A: TypeScript Types

**File:** `src/types/admin.ts`

```typescript
export interface AdminRole {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  roleName: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  createdByName: string;
  isActive: boolean;
}

export interface GrantAdminRoleRequest {
  userId: number;
}

export interface ResetAdminPasswordRequest {
  adminId: number;
}

export interface AdminActionResponse {
  message: string;
  data?: AdminRole;
}
```

**File:** `src/types/auditLog.ts`

```typescript
export interface AuditLog {
  id: number;
  actorId: number;
  actorName: string;
  actorRole: 'SUPER_ADMIN' | 'ADMIN' | 'SELLER' | 'USER';
  action: string; // APPROVE_PRODUCT, REJECT_SHOP, BLOCK_USER, etc.
  resourceType: 'PRODUCT' | 'SHOP' | 'USER' | 'ADMIN';
  resourceId: number;
  resourceName?: string;
  details?: Record<string, any>;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
  ipAddress: string;
}

export interface AuditLogFilter {
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
```

---

## PROMPT 2B: API Service

**File:** `src/service/adminService.ts`

```typescript
import axiosInstance from '@/lib/axios';
import { AdminRole, AuditLog, AuditLogResponse, AuditLogFilter } from '@/types';

// ===== ADMIN ROLE MANAGEMENT =====

/**
 * Cấp quyền Admin cho user
 */
export const grantAdminRole = async (userId: number): Promise<AdminRole> => {
  const response = await axiosInstance.post('/admin/super/roles/grant', {
    userId,
  });
  return response.data.data;
};

/**
 * Bỏ quyền Admin
 */
export const revokeAdminRole = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/admin/super/roles/${userId}`);
};

/**
 * Reset mật khẩu Admin
 */
export const resetAdminPassword = async (adminId: number): Promise<void> => {
  await axiosInstance.post('/admin/super/reset-password', {
    adminId,
  });
};

/**
 * Lấy danh sách tất cả Admin
 */
export const getAllAdmins = async (): Promise<AdminRole[]> => {
  const response = await axiosInstance.get('/admin/super/users');
  return response.data.data;
};

// ===== AUDIT LOG =====

/**
 * Lấy Audit Log toàn hệ thống (SUPER_ADMIN only)
 */
export const getAllAuditLogs = async (filters: AuditLogFilter): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();
  if (filters.action) params.append('action', filters.action);
  if (filters.resourceType) params.append('resourceType', filters.resourceType);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());

  const response = await axiosInstance.get('/admin/audit-logs/all', { params });
  return response.data;
};

/**
 * Lấy Audit Log của chính mình
 */
export const getMyAuditLogs = async (filters: AuditLogFilter): Promise<AuditLogResponse> => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());

  const response = await axiosInstance.get('/admin/audit-logs/my-logs', { params });
  return response.data;
};
```

---

## PROMPT 2C: ManageAdminsPage Component

**File:** `src/app/admin/manage-admins/page.tsx`

**Requirements:**
```
Page: /admin/manage-admins (SUPER_ADMIN only)

Layout:
├─ Header:
│  ├─ Title: "Quản lý Admin"
│  ├─ Description: "Quản lý quyền Admin, reset mật khẩu, xem danh sách"
│  └─ [Cấp quyền cho USER] button
├─ AdminListTable:
│  ├─ Columns: ID, Email, Role, Created Date, Last Login, Actions
│  ├─ Actions dropdown:
│  │  ├─ Reset mật khẩu
│  │  └─ Bỏ quyền
│  └─ Pagination
└─ GrantAdminModal (triggered by button above)
   ├─ Select User (dropdown/search)
   ├─ [Cancel] [Grant Admin]

Features:
- Show loading state while fetching
- Show error message if API fails
- Confirm dialog before revoking
- Show toast notification after action
- Refresh list after grant/revoke/reset password
```

**Component Structure:**
```typescript
export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGrantModal, setOpenGrantModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRole | null>(null);

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Không thể tải danh sách Admin');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = async (userId: number) => {
    try {
      await grantAdminRole(userId);
      toast.success('Cấp quyền thành công');
      setOpenGrantModal(false);
      fetchAdmins(); // Refresh
    } catch (error) {
      toast.error('Cấp quyền thất bại');
    }
  };

  const handleRevokeAdmin = async (userId: number) => {
    if (confirm('Bạn chắc chắn muốn bỏ quyền Admin?')) {
      try {
        await revokeAdminRole(userId);
        toast.success('Bỏ quyền thành công');
        fetchAdmins();
      } catch (error) {
        toast.error('Bỏ quyền thất bại');
      }
    }
  };

  const handleResetPassword = async (adminId: number) => {
    try {
      await resetAdminPassword(adminId);
      toast.success('Link reset đã được gửi đến email');
    } catch (error) {
      toast.error('Gửi email thất bại');
    }
  };

  return (
    <div>
      {/* Header + Button */}
      {/* AdminListTable with actions */}
      {/* GrantAdminModal */}
    </div>
  );
}
```

---

## PROMPT 2D: AuditLogPage Component

**File:** `src/app/admin/audit-logs/page.tsx`

**Requirements:**
```
Page: /admin/settings/audit-logs (SUPER_ADMIN only)

Layout:
├─ Header:
│  ├─ Title: "Lịch sử hoạt động"
│  ├─ Description: "Xem tất cả hoạt động trong hệ thống"
│  └─ [Export PDF]
├─ AuditLogFilters:
│  ├─ Filter by Action (dropdown)
│  ├─ Filter by Resource Type (dropdown)
│  ├─ Date Range picker (start, end)
│  └─ [Tìm kiếm] button
└─ AuditLogTable:
   ├─ Columns: ID, Actor, Action, Resource Type, Resource, Status, Date/Time
   ├─ Color-coded status: SUCCESS (green), FAILED (red)
   └─ Pagination

Features:
- Default date range: last 30 days
- Clickable rows to see details (expand row or modal)
- Export to PDF with filters
- Real-time filtering without page reload
- Show loading skeleton while fetching
```

**Component Structure:**
```typescript
export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState(...);
  const [filters, setFilters] = useState<AuditLogFilter>({
    page: 0,
    size: 20,
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      const data = await getAllAuditLogs(filters);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Không thể tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<AuditLogFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleExportPDF = () => {
    // Generate PDF with current filters
  };

  return (
    <div>
      {/* Header + Export button */}
      {/* Filters */}
      {/* Table with pagination */}
    </div>
  );
}
```

---

## PROMPT 2E: Sub-Components

### AdminListTable.tsx

**Spec:**
```
Props:
- admins: AdminRole[]
- loading: boolean
- onResetPassword: (adminId) => void
- onRevokeAdmin: (userId) => void

Features:
- Table with 6 columns (ID, Email, Role, Created, Last Login, Actions)
- Actions dropdown menu
- Loading skeleton
- Empty state message
```

### GrantAdminModal.tsx

**Spec:**
```
Props:
- open: boolean
- onClose: () => void
- onGrant: (userId: number) => void
- loading: boolean

Features:
- Modal dialog
- User search/select input (auto-complete)
- Show selected user email
- [Cancel] [Grant Admin] buttons
- Loading state
- Error message if user already admin
```

### AuditLogTable.tsx

**Spec:**
```
Props:
- logs: AuditLog[]
- loading: boolean
- pagination: Pagination
- onPageChange: (page) => void
- onRowClick?: (log) => void

Features:
- 7 columns (ID, Actor, Action, Resource, Status, IP, Timestamp)
- Color-coded status badges
- Expandable row to show details (JSON)
- Pagination controls
- Loading skeleton
```

### AuditLogFilters.tsx

**Spec:**
```
Props:
- filters: AuditLogFilter
- onFilterChange: (filters) => void

Features:
- Action dropdown (hardcoded list of actions)
- Resource Type dropdown (PRODUCT, SHOP, USER, ADMIN)
- Date range picker (start, end)
- [Reset Filters] button
- Auto-filter on change (debounced)
```

---

## PROMPT 2F: Sidebar Conditional Rendering

**File:** `src/components/admin/Sidebar.tsx`

**Update:**
```typescript
// Check user role from JWT
const role = getUserRoleFromToken(); // Extract from localStorage/cookie

// In Settings menu:
{role === 'SUPER_ADMIN' && (
  <MenuItem to="/admin/settings/audit-logs">
    <Icon>📊</Icon>
    Audit Log Toàn Hệ Thống
  </MenuItem>
)}
```

---

## PROMPT 2G: Protected Route Middleware

**File:** `src/middleware/auth.ts`

**Update:**
```typescript
// Protect /admin/manage-admins (SUPER_ADMIN only)
export function protectRoute(role: string, requiredRole: string) {
  if (role !== requiredRole) {
    redirect('/admin'); // Redirect to dashboard
  }
}

// Usage in page.tsx:
if (role !== 'SUPER_ADMIN') {
  redirect('/admin');
}
```

---

## FRONTEND SUMMARY

**Files to create:** 12 files
1. src/types/admin.ts
2. src/types/auditLog.ts
3. src/service/adminService.ts
4. src/app/admin/manage-admins/page.tsx
5. src/app/admin/settings/audit-logs/page.tsx
6. src/components/admin/AdminListTable.tsx
7. src/components/admin/GrantAdminModal.tsx
8. src/components/admin/AuditLogTable.tsx
9. src/components/admin/AuditLogFilters.tsx
10. src/components/admin/AdminListActions.tsx
11. src/components/admin/AuditLogDetail.tsx
12. src/utils/auditLogUtils.ts (helper functions)

**Files to update:** 2 files
1. src/components/admin/Sidebar.tsx (conditional render Audit Log menu)
2. src/middleware/auth.ts (protect routes)

**Dependencies:**
- axios (API calls)
- react-hot-toast (notifications)
- date-fns (date handling)
- zod (validation)
- @tanstack/react-table (table component)
- jspdf + html2pdf (export PDF)

---

---

# PROMPT 3: TEST CASES & VERIFICATION CHECKLIST

## Test Cases Overview

**Total Test Cases:** 28 test cases
- Backend: 15 test cases
- Frontend: 8 test cases
- Integration: 5 test cases

---

## BACKEND TEST CASES

### Database Level (Migration)

**TC-B1: Verify admin_roles table structure**
```
Steps:
1. Run migration V1_7
2. Query: SHOW CREATE TABLE admin_roles;

Expected:
- Columns: id, user_id, role_name, created_by, created_at, updated_at, is_active
- role_name: ENUM with CHECK (ADMIN, SUPER_ADMIN)
- user_id: UNIQUE, NOT NULL
- Foreign keys: user_id, created_by
```

**TC-B2: Verify audit_logs table structure**
```
Steps:
1. Query: SHOW CREATE TABLE audit_logs;

Expected:
- Columns: id, actor_id, actor_role, action, resource_type, resource_id, details, status, ip_address, user_agent, created_at
- details: JSON type
- Indexes on: actor_id, action, resource_type, created_at
```

### Service Layer

**TC-B3: Grant admin role successfully**
```
Setup:
- User ID: 100 (not admin yet)
- SUPER_ADMIN ID: 1

Steps:
1. Call: adminRoleService.grantAdminRole(1, 100, "ADMIN")

Expected:
- AdminRole created in DB
- Email sent to user
- Audit log created: action="GRANT_ADMIN_ROLE"
- Return AdminRoleDTO with granted role
```

**TC-B4: Grant admin role - user already admin**
```
Setup:
- User 100 already has ADMIN role

Steps:
1. Call: adminRoleService.grantAdminRole(1, 100, "ADMIN")

Expected:
- Throw RuntimeException: "User already has this role"
- No new record created
```

**TC-B5: Grant admin role - user not found**
```
Steps:
1. Call: adminRoleService.grantAdminRole(1, 99999, "ADMIN")

Expected:
- Throw RuntimeException: "User not found"
```

**TC-B6: Revoke admin role successfully**
```
Setup:
- User 100 has ADMIN role

Steps:
1. Call: adminRoleService.revokeAdminRole(1, 100)

Expected:
- Admin role marked as inactive (is_active=false)
- Audit log created: action="REVOKE_ADMIN_ROLE"
- No deletion, soft delete only
```

**TC-B7: Reset admin password**
```
Setup:
- Admin ID: 5

Steps:
1. Call: adminRoleService.resetAdminPassword(1, 5)

Expected:
- Email sent with reset link
- Audit log created: action="RESET_ADMIN_PASSWORD"
- No exception thrown
```

**TC-B8: Get all admins**
```
Steps:
1. Call: adminRoleService.getAllAdmins()

Expected:
- Return List of AdminRoleDTO
- Only active admins (is_active=true)
- Include user details (email, name)
```

**TC-B9: Log audit action - approve product**
```
Steps:
1. Call: auditService.logAction(
     1, "ADMIN", "APPROVE_PRODUCT", 
     "PRODUCT", 123, null
   )

Expected:
- AuditLog created in DB
- status="SUCCESS"
- createdAt populated
- actorId=1, action="APPROVE_PRODUCT", resourceId=123
```

**TC-B10: Log audit action - reject shop with reason**
```
Steps:
1. Call: auditService.logAction(
     1, "SUPER_ADMIN", "REJECT_SHOP",
     "SHOP", 45,
     "{\"reason\": \"Hình ảnh không phù hợp\"}"
   )

Expected:
- AuditLog created with JSON details
- details field contains reason
```

### Controller Level

**TC-B11: POST /admin/super/roles/grant - success**
```
Request:
POST /admin/super/roles/grant
{
  "userId": 100
}
Headers: Authorization: Bearer <SUPER_ADMIN_TOKEN>

Expected:
- Status: 200
- Response: {
    "message": "Cấp quyền thành công",
    "data": { AdminRoleDTO }
  }
```

**TC-B12: DELETE /admin/super/roles/{userId} - success**
```
Request:
DELETE /admin/super/roles/100
Headers: Authorization: Bearer <SUPER_ADMIN_TOKEN>

Expected:
- Status: 200
- Response: { "message": "Bỏ quyền thành công" }
```

**TC-B13: POST /admin/super/reset-password**
```
Request:
POST /admin/super/reset-password
{
  "adminId": 5
}
Headers: Authorization: Bearer <SUPER_ADMIN_TOKEN>

Expected:
- Status: 200
- Response: { "message": "Link reset đã được gửi đến email" }
```

**TC-B14: GET /admin/super/users - list all admins**
```
Request:
GET /admin/super/users
Headers: Authorization: Bearer <SUPER_ADMIN_TOKEN>

Expected:
- Status: 200
- Response: {
    "data": [AdminRoleDTO, AdminRoleDTO, ...],
    "total": 2
  }
```

**TC-B15: GET /admin/audit-logs/all - SUPER_ADMIN only**
```
Request:
GET /admin/audit-logs/all?page=0&size=20
Headers: Authorization: Bearer <SUPER_ADMIN_TOKEN>

Expected:
- Status: 200
- Response: {
    "data": [AuditLogDTO, ...],
    "pagination": { page, size, total, totalPages }
  }

Test with ADMIN token:
- Status: 403 (Forbidden)
```

---

## FRONTEND TEST CASES

**TC-F1: ManageAdminsPage - load admins list**
```
Steps:
1. Navigate to /admin/manage-admins
2. Wait for API response

Expected:
- Page loads successfully
- Admin list displayed in table
- 6 columns visible (ID, Email, Role, Created, Last Login, Actions)
- Loading skeleton shown during fetch
- Table populated after data received
```

**TC-F2: ManageAdminsPage - grant admin role**
```
Steps:
1. Click "Cấp quyền cho USER" button
2. Modal opens
3. Select user from dropdown
4. Click "Cấp quyền Admin" button
5. Wait for response

Expected:
- Modal closes
- Toast notification: "Cấp quyền thành công"
- Admin list refreshed
- New admin appears in table
```

**TC-F3: ManageAdminsPage - revoke admin role**
```
Steps:
1. Click dropdown menu on admin row
2. Click "Bỏ quyền"
3. Confirm dialog appears
4. Click "Xác nhận"

Expected:
- Dialog closes
- Toast notification: "Bỏ quyền thành công"
- Admin removed from list (or marked inactive)
```

**TC-F4: ManageAdminsPage - reset password**
```
Steps:
1. Click dropdown menu on admin row
2. Click "Reset mật khẩu"

Expected:
- Toast notification: "Link reset đã được gửi đến email"
- No page refresh needed
```

**TC-F5: AuditLogPage - load audit logs**
```
Steps:
1. Navigate to /admin/settings/audit-logs
2. Wait for data

Expected:
- Audit log table displays
- 7 columns visible
- Default date range: last 30 days
- Status badges color-coded (green/red)
- Pagination controls visible
```

**TC-F6: AuditLogPage - filter by action**
```
Steps:
1. In filter panel, select action "APPROVE_PRODUCT"
2. Click "Tìm kiếm"

Expected:
- Table refreshes
- Only logs with action="APPROVE_PRODUCT" shown
- Pagination resets to page 0
```

**TC-F7: AuditLogPage - filter by date range**
```
Steps:
1. Select start date: 2026-04-01
2. Select end date: 2026-04-30
3. Click "Tìm kiếm"

Expected:
- Table shows only logs between dates
- No loading spinner after filter
```

**TC-F8: AuditLogPage - export to PDF**
```
Steps:
1. Click "Export PDF" button
2. Wait for download

Expected:
- PDF file downloaded
- File contains current filtered logs
- Include filter criteria in PDF header
- Properly formatted table
```

---

## INTEGRATION TEST CASES

**TC-I1: End-to-end - grant admin and verify audit log**
```
Steps:
1. SUPER_ADMIN grants admin to User 100
2. API logs action in audit_logs table
3. SUPER_ADMIN views audit logs
4. Verify log entry exists with correct details

Expected:
- Audit log shows: actor=SUPER_ADMIN, action=GRANT_ADMIN_ROLE, resourceId=100
```

**TC-I2: Check role-based access control**
```
Steps:
1. Login as ADMIN
2. Try to access /admin/manage-admins

Expected:
- Redirect to /admin (dashboard)
- URL does not change to /admin/manage-admins
- SUPER_ADMIN can access
```

**TC-I3: Verify admin list visibility**
```
Steps:
1. SUPER_ADMIN creates 2 new admins
2. SUPER_ADMIN views /admin/manage-admins
3. Both admins appear in list

Expected:
- List shows all active admins
- Can see email, role, created date, last login
```

**TC-I4: Test audit log for multiple actions**
```
Steps:
1. ADMIN approves product (logs APPROVE_PRODUCT)
2. ADMIN rejects shop (logs REJECT_SHOP)
3. SUPER_ADMIN views audit logs

Expected:
- Both actions visible in log
- Each with correct actor, action, resource details
- Ordered by created_at DESC
```

**TC-I5: Verify email sending on grant/reset**
```
Steps:
1. Grant admin to User 100
2. Check email received by user
3. Reset admin password for User 5
4. Check email received by admin

Expected:
- Both emails received
- Emails contain correct links
- Links are clickable and valid
```

---

## VERIFICATION CHECKLIST

### Before Submission

**Code Quality:**
- [ ] All Java code compiles without errors: `mvn clean compile`
- [ ] All TypeScript code has no TS errors: `npm run build`
- [ ] No console errors or warnings in browser
- [ ] Code follows naming conventions (camelCase for TS/JS, snake_case for SQL)
- [ ] All DTOs have @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor
- [ ] All models have @Entity, @Table, @Data annotations
- [ ] All repositories extend JpaRepository

**Database:**
- [ ] Migration runs successfully
- [ ] admin_roles table created with correct columns
- [ ] audit_logs table created with correct columns
- [ ] Indexes created
- [ ] No data loss in existing tables

**Backend API:**
- [ ] All 4 SuperAdminController endpoints return 200
- [ ] All 2 AuditLogController endpoints return 200
- [ ] /admin/super/roles/grant works and creates audit log
- [ ] /admin/super/roles/{userId} deletes (soft) role
- [ ] /admin/audit-logs/all requires SUPER_ADMIN role (returns 403 for others)
- [ ] /admin/audit-logs/my-logs works for all roles
- [ ] Error responses return proper HTTP status codes
- [ ] Validation errors return 400 with messages

**Frontend UI:**
- [ ] ManageAdminsPage loads without errors
- [ ] AdminListTable displays all columns correctly
- [ ] GrantAdminModal opens/closes smoothly
- [ ] AuditLogPage loads with default filters
- [ ] AuditLogTable displays with correct colors
- [ ] All filters work (action, resourceType, date)
- [ ] Pagination works (prev/next buttons)
- [ ] Toast notifications appear for all actions
- [ ] Mobile responsive (check on 375px width)

**Security:**
- [ ] SUPER_ADMIN-only pages redirect for non-SUPER_ADMIN users
- [ ] JWT token validation works
- [ ] No sensitive data in logs (passwords, tokens)
- [ ] Email links are token-based (not direct URLs)
- [ ] Rate limiting works for password reset (if implemented)

**Audit Logging:**
- [ ] AdminProductController calls auditService for each action
- [ ] AdminSellerController calls auditService for each action
- [ ] Audit logs record all 6 fields: actor_id, action, resource_type, resource_id, details, status
- [ ] Audit logs are READ-ONLY (cannot be edited/deleted)
- [ ] Details JSON is properly formatted

**Email:**
- [ ] Setup email is sent when admin is granted
- [ ] Reset password email is sent correctly
- [ ] Email templates display properly
- [ ] Links in email are correct
- [ ] Email addresses are validated

**Performance:**
- [ ] Admin list loads in < 1 second
- [ ] Audit log loads in < 2 seconds with 20 items per page
- [ ] Filters apply without full page reload
- [ ] No memory leaks (check with React DevTools)

---

## Testing Commands

```bash
# Backend tests
mvn test -Dtest=AdminRoleServiceTest
mvn test -Dtest=AuditServiceTest
mvn test -Dtest=SuperAdminControllerTest

# Build backend
mvn clean package -DskipTests

# Frontend tests
npm test

# Build frontend
npm run build

# Check for TS errors
npx tsc --noEmit

# Check for lint errors
npm run lint
```

---

## Postman Testing

**Collection:**
```
1. POST /admin/super/roles/grant
   Body: { "userId": 100 }
   
2. GET /admin/super/users
   Expected: list of admins
   
3. POST /admin/super/reset-password
   Body: { "adminId": 5 }
   
4. DELETE /admin/super/roles/100
   
5. GET /admin/audit-logs/all
   Expected: paginated logs
   
6. GET /admin/audit-logs/my-logs
   Expected: personal logs
```

---

## Known Limitations & Future Enhancements

**Current:**
- Roles are hard-coded (4 roles only)
- Permissions are embedded in code

**Future (Phase 2+):**
- [ ] Dynamic role creation (not in Phase 1.7)
- [ ] Permission matrix UI (not in Phase 1.7)
- [ ] Bulk export audit logs
- [ ] Schedule audit log cleanup (older than 1 year)
- [ ] Email notifications for admin actions
- [ ] Admin activity dashboard with charts

---

**END OF PHASE 1.7 IMPLEMENTATION GUIDE**
