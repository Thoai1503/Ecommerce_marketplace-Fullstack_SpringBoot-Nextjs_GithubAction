-- Chạy 1 lần trên MySQL để tạo bảng lưu token set-password / reset-password
CREATE TABLE IF NOT EXISTS password_reset_token (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    token        VARCHAR(128) NOT NULL UNIQUE,
    purpose      VARCHAR(32)  NOT NULL DEFAULT 'SET_PASSWORD', -- SET_PASSWORD | RESET
    expires_at   DATETIME     NOT NULL,
    used_at      DATETIME     NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
