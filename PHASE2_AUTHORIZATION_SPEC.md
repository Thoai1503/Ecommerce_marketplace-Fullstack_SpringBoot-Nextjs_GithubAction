# 📋 PHASE 1: INFRASTRUCTURE — Permission System Spec

**Dự án:** VietCommerce Hub — Ecommerce Marketplace Microservice  
**Ngày:** 01/05/2026  
**Phiên bản:** 1.0.0  
**Phạm vi:** Setup Role-Based Access Control (RBAC) infrastructure

---

## 📑 Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Roles & Permissions](#2-roles--permissions)
3. [Database Schema](#3-database-schema)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [API Security](#6-api-security)
7. [Test Cases](#7-test-cases)

---

## 1. Tổng quan

### Mục tiêu
- Xây dựng hệ thống phân quyền (RBAC) cho 4 levels: Super Admin, Admin, Seller, User
- Centralized permission checking (dễ maintain, dễ mở rộng)
- Reusable components cho các phases sau

### Kiến trúc
```
┌────────────────────────────────────────────┐
│ Frontend (Role checks)                     │
├────────────────────────────────────────────┤
│ API Requests                               │
├────────────────────────────────────────────┤
│ Interceptor (@RoleRequired + middleware)   │
├────────────────────────────────────────────┤
│ Controllers + Services                     │
├────────────────────────────────────────────┤
│ Database (roles, permissions)              │
└────────────────────────────────────────────┘
```

---

## 2. Roles & Permissions

### 2.1 Roles (4 cấp độ)

| Role | Description | Cấp độ | Quyền chính |
|---|---|---|---|
| `SUPER_ADMIN` | Super Admin — quản lý toàn bộ | 4 | Phân quyền, reset pwd admin, quản lý tất cả |
| `ADMIN` | Admin thường — quản lý hệ thống | 3 | Quản lý users, sellers, products, orders |
| `SELLER` | Nhà bán hàng — quản lý shop mình | 2 | Quản lý products shop, orders shop |
| `USER` | Người dùng — mua sắm | 1 | Xem products, đặt hàng, quản lý orders cá nhân |

### 2.2 Permissions (chi tiết hành động)

**Admin Management (Super Admin)**
```
MANAGE_ADMIN_LIST       → Xem danh sách admin
MANAGE_ADMIN_ASSIGN_ROLE → Gán role cho admin
MANAGE_ADMIN_RESET_PWD   → Reset password admin
MANAGE_ADMIN_LOCK        → Khóa tài khoản admin
```

**User Management (Super Admin + Admin)**
```
MANAGE_USER_LIST        → Xem danh sách users
MANAGE_USER_LOCK        → Khóa tài khoản user
MANAGE_USER_DELETE      → Xóa user (tùy chọn)
```

**Seller Management (Super Admin + Admin)**
```
MANAGE_SELLER_LIST      → Xem danh sách sellers
MANAGE_SELLER_APPROVE   → Duyệt shop
MANAGE_SELLER_LOCK      → Khóa shop
MANAGE_SELLER_DELETE    → Xóa seller
```

**Product Management (Super Admin + Admin + Seller)**
```
MANAGE_PRODUCT_LIST     → Xem danh sách sản phẩm
MANAGE_PRODUCT_EDIT     → Chỉnh sửa sản phẩm
MANAGE_PRODUCT_DELETE   → Xóa sản phẩm
MANAGE_PRODUCT_VIEW_ALL → Xem tất cả (admin) / Xem shop mình (seller)
```

**Order Management (Super Admin + Admin + Seller)**
```
MANAGE_ORDER_LIST       → Xem đơn hàng
MANAGE_ORDER_UPDATE     → Cập nhật trạng thái
```

### 2.3 Permission Mapping by Role

```
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Permission  │ SUPER_ADMIN  │ ADMIN        │ SELLER       │ USER         │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ MANAGE_ADMIN│ ✅ FULL      │ ❌           │ ❌           │ ❌           │
│ MANAGE_USER │ ✅ ALL       │ ✅ ALL       │ ❌           │ ❌ (own)     │
│ MANAGE_SELLER│✅ ALL       │ ✅ ALL       │ ❌           │ ❌           │
│ MANAGE_PRODUCT│✅ ALL      │ ✅ ALL       │ ✅ (own shop)│ ❌ (view)    │
│ MANAGE_ORDER│ ✅ ALL       │ ✅ ALL       │ ✅ (own shop)│ ✅ (own)     │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 3. Database Schema

### 3.1 Enum: Role (Java)

```java
public enum Role {
    SUPER_ADMIN("Super Admin", 4),
    ADMIN("Admin", 3),
    SELLER("Seller", 2),
    USER("User", 1);

    private String label;
    private int level;  // Dùng để compare quyền (level 4 > level 3)
    
    Role(String label, int level) {
        this.label = label;
        this.level = level;
    }
}
```

### 3.2 Enum: Permission (Java)

```java
public enum Permission {
    // Admin management
    MANAGE_ADMIN_LIST,
    MANAGE_ADMIN_ASSIGN_ROLE,
    MANAGE_ADMIN_RESET_PWD,
    MANAGE_ADMIN_LOCK,
    
    // User management
    MANAGE_USER_LIST,
    MANAGE_USER_LOCK,
    MANAGE_USER_DELETE,
    
    // Seller management
    MANAGE_SELLER_LIST,
    MANAGE_SELLER_APPROVE,
    MANAGE_SELLER_LOCK,
    MANAGE_SELLER_DELETE,
    
    // Product management
    MANAGE_PRODUCT_LIST,
    MANAGE_PRODUCT_EDIT,
    MANAGE_PRODUCT_DELETE,
    MANAGE_PRODUCT_VIEW_ALL,
    
    // Order management
    MANAGE_ORDER_LIST,
    MANAGE_ORDER_UPDATE
}
```

### 3.3 Database: users table (thêm cột)

```sql
-- Thêm cột role vào users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'USER';

-- Index untuk query nhanh
CREATE INDEX idx_user_role ON users(role);
```

**Ví dụ data:**
```sql
INSERT INTO users VALUES
(1, 'super@vietcommerce.com', '...', 'SUPER_ADMIN', 1, 'active'),
(2, 'admin@vietcommerce.com', '...', 'ADMIN', 1, 'active'),
(3, 'seller@store.com', '...', 'SELLER', 1, 'active'),
(4, 'user@gmail.com', '...', 'USER', 1, 'active');
```

### 3.4 Database: role_permissions table (optional — cho future scalability)

```sql
CREATE TABLE role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role, permission),
    KEY idx_role (role)
);

-- Seed initial data
INSERT INTO role_permissions VALUES
(NULL, 'SUPER_ADMIN', 'MANAGE_ADMIN_LIST', CURRENT_TIMESTAMP),
(NULL, 'SUPER_ADMIN', 'MANAGE_ADMIN_ASSIGN_ROLE', CURRENT_TIMESTAMP),
... (lặp lại cho tất cả permissions)
```

---

## 4. Backend Implementation

### 4.1 Create Permission Service

**File:** `src/main/java/docker_test/com/services/PermissionService.java`

```java
@Service
public class PermissionService {
    
    private final UserRepository userRepository;
    
    public PermissionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Check user có quyền không
     */
    public boolean hasPermission(Long userId, Permission permission) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;
        
        Role role = Role.valueOf(user.getRole());
        return hasPermissionByRole(role, permission);
    }
    
    /**
     * Map role → permissions
     */
    public boolean hasPermissionByRole(Role role, Permission permission) {
        switch (role) {
            case SUPER_ADMIN:
                return true; // Super admin có tất cả quyền
            
            case ADMIN:
                return isAdminPermission(permission);
            
            case SELLER:
                return isSellerPermission(permission);
            
            case USER:
                return isUserPermission(permission);
            
            default:
                return false;
        }
    }
    
    private boolean isAdminPermission(Permission p) {
        return p.toString().startsWith("MANAGE_") && 
               !p.equals(Permission.MANAGE_ADMIN_ASSIGN_ROLE) &&
               !p.equals(Permission.MANAGE_ADMIN_RESET_PWD) &&
               !p.equals(Permission.MANAGE_ADMIN_LOCK);
    }
    
    private boolean isSellerPermission(Permission p) {
        return p.equals(Permission.MANAGE_PRODUCT_EDIT) ||
               p.equals(Permission.MANAGE_ORDER_UPDATE);
    }
    
    private boolean isUserPermission(Permission p) {
        return p.equals(Permission.MANAGE_ORDER_LIST) ||
               p.equals(Permission.MANAGE_ORDER_UPDATE);
    }
    
    /**
     * Get current user role từ JWT token
     */
    public Role getCurrentUserRole(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        Claims claims = jwtService.parseAccessToken(token);
        String role = claims.get("role", String.class);
        return Role.valueOf(role != null ? role : "USER");
    }
}
```

### 4.2 Create @RoleRequired Annotation

**File:** `src/main/java/docker_test/com/annotations/RoleRequired.java`

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RoleRequired {
    Permission[] permissions() default {};
    Role[] roles() default {};
}
```

### 4.3 Create Authorization Interceptor

**File:** `src/main/java/docker_test/com/configs/AuthorizationInterceptor.java`

```java
@Component
public class AuthorizationInterceptor implements HandlerInterceptor {
    
    private final PermissionService permissionService;
    
    public AuthorizationInterceptor(PermissionService permissionService) {
        this.permissionService = permissionService;
    }
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod hm = (HandlerMethod) handler;
        RoleRequired roleRequired = hm.getMethodAnnotation(RoleRequired.class);
        
        if (roleRequired == null) {
            return true; // No restriction
        }
        
        Long userId = extractUserIdFromToken(request);
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        
        // Check permissions
        if (roleRequired.permissions().length > 0) {
            for (Permission perm : roleRequired.permissions()) {
                if (!permissionService.hasPermission(userId, perm)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"message\": \"Không có quyền truy cập\"}");
                    return false;
                }
            }
        }
        
        // Check roles
        if (roleRequired.roles().length > 0) {
            Role userRole = permissionService.getCurrentUserRole(request);
            boolean hasRole = Arrays.asList(roleRequired.roles()).contains(userRole);
            if (!hasRole) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"message\": \"Không có quyền truy cập\"}");
                return false;
            }
        }
        
        return true;
    }
    
    private Long extractUserIdFromToken(HttpServletRequest request) {
        // Extract từ JWT token (tương tự JwtAuthFilter)
        // Return null nếu không hợp lệ
        return null; // TODO: implement
    }
}
```

### 4.4 Register Interceptor

**File:** `src/main/java/docker_test/com/configs/WebConfig.java`

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    private final AuthorizationInterceptor authorizationInterceptor;
    
    public WebConfig(AuthorizationInterceptor authorizationInterceptor) {
        this.authorizationInterceptor = authorizationInterceptor;
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authorizationInterceptor)
                .addPathPatterns("/admin/**")
                .addPathPatterns("/seller/**")
                .addPathPatterns("/api/**");
    }
}
```

### 4.5 Update User Model

**File:** `src/main/java/docker_test/com/models/User.java`

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role = Role.USER;  // ← Thêm field này
    
    // ... other fields
}
```

---

## 5. Frontend Implementation

### 5.1 Create Role Service (Frontend)

**File:** `marketfrontend/src/lib/roleService.ts`

```typescript
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  USER = 'USER',
}

export enum Permission {
  // Admin
  MANAGE_ADMIN_LIST = 'MANAGE_ADMIN_LIST',
  MANAGE_ADMIN_ASSIGN_ROLE = 'MANAGE_ADMIN_ASSIGN_ROLE',
  MANAGE_ADMIN_RESET_PWD = 'MANAGE_ADMIN_RESET_PWD',
  
  // User
  MANAGE_USER_LIST = 'MANAGE_USER_LIST',
  
  // Seller
  MANAGE_SELLER_LIST = 'MANAGE_SELLER_LIST',
  
  // Product
  MANAGE_PRODUCT_EDIT = 'MANAGE_PRODUCT_EDIT',
  
  // Order
  MANAGE_ORDER_LIST = 'MANAGE_ORDER_LIST',
}

class RoleService {
  getCurrentRole(): Role {
    // Get từ JWT token (decode)
    const token = localStorage.getItem('access_token');
    if (!token) return Role.USER;
    
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.role || Role.USER;
  }
  
  hasRole(role: Role): boolean {
    return this.getCurrentRole() === role;
  }
  
  hasPermission(permission: Permission): boolean {
    const role = this.getCurrentRole();
    // Implement same logic as backend PermissionService
    return this.checkPermissionByRole(role, permission);
  }
  
  private checkPermissionByRole(role: Role, permission: Permission): boolean {
    switch (role) {
      case Role.SUPER_ADMIN:
        return true;
      case Role.ADMIN:
        return !permission.includes('MANAGE_ADMIN');
      case Role.SELLER:
        return permission.includes('MANAGE_PRODUCT') || 
               permission.includes('MANAGE_ORDER');
      case Role.USER:
        return permission.includes('MANAGE_ORDER');
      default:
        return false;
    }
  }
}

export const roleService = new RoleService();
```

### 5.2 Create Protected Components

**File:** `marketfrontend/src/components/ProtectedMenuItem.tsx`

```typescript
interface ProtectedMenuItemProps {
  label: string;
  href: string;
  requiredRole: Role[];
  requiredPermission?: Permission;
  icon?: React.ReactNode;
}

export function ProtectedMenuItem({
  label,
  href,
  requiredRole,
  requiredPermission,
}: ProtectedMenuItemProps) {
  const currentRole = roleService.getCurrentRole();
  const hasAccess = 
    requiredRole.includes(currentRole) && 
    (!requiredPermission || roleService.hasPermission(requiredPermission));
  
  if (!hasAccess) return null;
  
  return <Link href={href}>{label}</Link>;
}
```

### 5.3 Update Admin Sidebar (conditional menu)

**File:** `marketfrontend/src/components/admin/AdminSidebar.tsx`

```typescript
export function AdminSidebar() {
  const currentRole = roleService.getCurrentRole();
  
  return (
    <nav>
      <ProtectedMenuItem
        label="Tổng quan"
        href="/admin"
        requiredRole={[Role.SUPER_ADMIN, Role.ADMIN]}
      />
      
      {/* Super Admin only */}
      <ProtectedMenuItem
        label="Phân quyền"
        href="/super-admin/permissions"
        requiredRole={[Role.SUPER_ADMIN]}
      />
      
      {/* Admin + Super Admin */}
      <ProtectedMenuItem
        label="Quản lý Users"
        href="/admin/users"
        requiredRole={[Role.SUPER_ADMIN, Role.ADMIN]}
        requiredPermission={Permission.MANAGE_USER_LIST}
      />
      
      {/* Seller only */}
      <ProtectedMenuItem
        label="Sản phẩm"
        href="/seller/products"
        requiredRole={[Role.SELLER]}
      />
    </nav>
  );
}
```

---

## 6. API Security

### 6.1 Protected API Endpoints (Examples)

```java
// Super Admin only
@PostMapping("/admin/assign-role")
@RoleRequired(roles = {Role.SUPER_ADMIN})
public ResponseEntity<?> assignRole(@RequestBody AssignRoleRequest req) {
    // ...
}

// Super Admin + Admin
@GetMapping("/admin/users")
@RoleRequired(permissions = {Permission.MANAGE_USER_LIST})
public ResponseEntity<?> listUsers() {
    // ...
}

// Seller — chỉ được xem shop của mình
@GetMapping("/seller/products")
@RoleRequired(roles = {Role.SELLER})
public ResponseEntity<?> getSellerProducts(
    @RequestAttribute("userId") Long userId) {
    // Lọc products của seller này thôi
    List<Product> products = productRepo.findByShopId(getCurrentShopId(userId));
    return ResponseEntity.ok(products);
}
```

### 6.2 JWT Token Include Role

**File:** `src/main/java/docker_test/com/services/JwtService.java`

```java
public String createAccessToken(Long userId, String role) {
    User user = userRepository.findById(userId).orElseThrow();
    
    return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("email", user.getEmail())
            .claim("role", user.getRole()) // ← Add role here
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
}
```

---

## 7. Test Cases

### 7.1 Backend Tests

```
✅ TC-PERM-01: Super Admin có tất cả quyền
   → hasPermission(superAdminId, ANY_PERMISSION) = true

✅ TC-PERM-02: Admin không có quyền MANAGE_ADMIN
   → hasPermission(adminId, MANAGE_ADMIN_ASSIGN_ROLE) = false

✅ TC-PERM-03: Seller không thể xem products của shop khác
   → GET /seller/products (seller B) → HTTP 403

✅ TC-PERM-04: User không thể reset password admin
   → POST /admin/reset-password (user) → HTTP 403

✅ TC-PERM-05: Role từ JWT token được parse đúng
   → Decode JWT → role = "ADMIN" ✓
```

### 7.2 Frontend Tests

```
✅ TC-FRONT-01: Super Admin thấy menu "Phân quyền"
   → currentRole = SUPER_ADMIN → ProtectedMenuItem visible ✓

✅ TC-FRONT-02: Admin KHÔNG thấy menu "Phân quyền"
   → currentRole = ADMIN → ProtectedMenuItem hidden ✓

✅ TC-FRONT-03: Button "Reset Password Admin" chỉ hiện cho Super Admin
   → role != SUPER_ADMIN → button hidden ✓
```

---

## 📝 Checklist Implementação Fase 1

### Backend
- [ ] Create Permission enum
- [ ] Create Role enum
- [ ] Add role column to User table
- [ ] Create PermissionService
- [ ] Create @RoleRequired annotation
- [ ] Create AuthorizationInterceptor
- [ ] Register interceptor in WebConfig
- [ ] Update JwtService to include role in token
- [ ] Update User model with role field
- [ ] Test permissions (backend unit tests)

### Frontend
- [ ] Create RoleService (TypeScript)
- [ ] Create ProtectedMenuItem component
- [ ] Update AdminSidebar to use ProtectedMenuItem
- [ ] Test role checks (frontend unit tests)
- [ ] Verify JWT decode includes role

### Database
- [ ] Migrate: add role column to users
- [ ] Create role_permissions table (optional)
- [ ] Seed initial data

---

## 🎯 Kết quả sau Fase 1

✅ Infrastructure sẵn sàng cho tất cả 4 levels
✅ Centralized permission checking (backend + frontend)
✅ Reusable components cho Fase 2-5
✅ Production-ready RBAC system

---

**Theo dõi:** Phase 2 sẽ implement Super Admin + Admin features trên nền tảng này.
