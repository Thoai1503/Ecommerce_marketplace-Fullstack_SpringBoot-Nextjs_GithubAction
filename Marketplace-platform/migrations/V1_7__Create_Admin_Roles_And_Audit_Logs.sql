-- 1. admin_roles table (quan ly user nao la admin)
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

-- 2. audit_logs table (log tat ca hoat dong)
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_id BIGINT NOT NULL COMMENT 'Nguoi thuc hien hanh dong',
    actor_role VARCHAR(50) NOT NULL COMMENT 'SUPER_ADMIN, ADMIN, SELLER, USER',
    action VARCHAR(100) NOT NULL COMMENT 'APPROVE_PRODUCT, REJECT_SHOP, BLOCK_USER, etc.',
    resource_type VARCHAR(50) NOT NULL COMMENT 'PRODUCT, SHOP, USER, ADMIN',
    resource_id BIGINT COMMENT 'ID cua resource bi tac dong',
    details JSON COMMENT 'Chi tiet them: ly do, tham so cu/moi, etc.',
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

-- 3. Them admin_role column vao users table (optional, de check nhanh)
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50) DEFAULT NULL
    AFTER role_id COMMENT 'SUPER_ADMIN, ADMIN, hoac NULL';
