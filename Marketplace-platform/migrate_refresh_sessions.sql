-- Phase Auth: refresh sessions table for multi-device JWT
CREATE TABLE IF NOT EXISTS refresh_sessions (
  id            VARCHAR(36)   NOT NULL,
  user_id       BIGINT        NOT NULL,
  token_hash    VARCHAR(255)  NOT NULL,
  user_agent    VARCHAR(500)  DEFAULT NULL,
  ip_first      VARCHAR(45)   DEFAULT NULL,
  ip_last       VARCHAR(45)   DEFAULT NULL,
  expires_at    TIMESTAMP     NOT NULL,
  revoked_at    TIMESTAMP     NULL,
  rotated_from  VARCHAR(36)   DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  last_used_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  KEY idx_session_user (user_id),
  KEY idx_session_token_hash (token_hash),
  KEY idx_session_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bo sung role neu chua co (project hien dung user_type enum buyer/seller/both)
ALTER TABLE `user` ADD COLUMN role VARCHAR(20) DEFAULT 'CUSTOMER' AFTER user_type;
-- gia tri: 'ADMIN' | 'SELLER' | 'CUSTOMER'

-- Set 1 user thanh admin de test
UPDATE `user` SET role = 'ADMIN' WHERE id = 1;
UPDATE `user` SET role = 'SELLER' WHERE user_type IN ('seller', 'both') AND role = 'CUSTOMER';
