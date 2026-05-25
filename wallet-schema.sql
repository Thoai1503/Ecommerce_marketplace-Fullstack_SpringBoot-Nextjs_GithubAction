CREATE TABLE user_wallet (
id bigint NOT NULL AUTO_INCREMENT,
user_id bigint NOT NULL,
wallet_code varchar(40) NOT NULL,
currency char(3) NOT NULL DEFAULT 'VND',
available_balance decimal(18,2) NOT NULL DEFAULT '0.00',
pending_balance decimal(18,2) NOT NULL DEFAULT '0.00',
locked_balance decimal(18,2) NOT NULL DEFAULT '0.00',
status enum('ACTIVE','SUSPENDED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
version int NOT NULL DEFAULT 0,
created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uq_wallet_user (user_id),
UNIQUE KEY uq_wallet_code (wallet_code),
KEY idx_wallet_status (status),
CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
CONSTRAINT chk_wallet_available CHECK (available_balance >= 0),
CONSTRAINT chk_wallet_pending CHECK (pending_balance >= 0),
CONSTRAINT chk_wallet_locked CHECK (locked_balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE wallet_transaction (
id bigint NOT NULL AUTO_INCREMENT,
wallet_id bigint NOT NULL,
counterparty_wallet_id bigint DEFAULT NULL,
transaction_no varchar(50) NOT NULL,
idempotency_key varchar(100) DEFAULT NULL,
direction enum('CREDIT','DEBIT') NOT NULL,
transaction_type enum(
'SHOP_PAYOUT',
'BUYER_REFUND',
'WITHDRAW_REQUEST',
'WITHDRAW_SUCCESS',
'WITHDRAW_REJECT',
'MANUAL_ADJUSTMENT',
'REVERSAL',
'FEE'
) NOT NULL,
source_type enum(
'ORDER_SHIPMENT',
'RETURN_REQUEST',
'WITHDRAWAL',
'ADMIN_MANUAL',
'SYSTEM'
) NOT NULL,
source_id bigint DEFAULT NULL,
amount decimal(18,2) NOT NULL,
fee_amount decimal(18,2) NOT NULL DEFAULT '0.00',
balance_before decimal(18,2) NOT NULL,
balance_after decimal(18,2) NOT NULL,
status enum('PENDING','COMPLETED','FAILED','CANCELLED','REVERSED') NOT NULL DEFAULT 'COMPLETED',
note varchar(500) DEFAULT NULL,
metadata json DEFAULT NULL,
created_by bigint DEFAULT NULL,
approved_by bigint DEFAULT NULL,
approved_at timestamp NULL DEFAULT NULL,
created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id),
UNIQUE KEY uq_wallet_txn_no (transaction_no),
UNIQUE KEY uq_wallet_idempotency (idempotency_key),
KEY idx_wt_wallet_created (wallet_id, created_at),
KEY idx_wt_source (source_type, source_id),
KEY idx_wt_status_type_created (status, transaction_type, created_at),
CONSTRAINT fk_wt_wallet FOREIGN KEY (wallet_id) REFERENCES user_wallet (id) ON DELETE RESTRICT,
CONSTRAINT fk_wt_counterparty_wallet FOREIGN KEY (counterparty_wallet_id) REFERENCES user_wallet (id) ON DELETE SET NULL,
CONSTRAINT fk_wt_created_by FOREIGN KEY (created_by) REFERENCES user (id) ON DELETE SET NULL,
CONSTRAINT fk_wt_approved_by FOREIGN KEY (approved_by) REFERENCES user (id) ON DELETE SET NULL,
CONSTRAINT chk_wt_amount CHECK (amount > 0),
CONSTRAINT chk_wt_fee CHECK (fee_amount >= 0),
CONSTRAINT chk_wt_balance_after CHECK (balance_after >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 



DELIMITER $$

-- ============================================================
-- TRIGGER: After INSERT
-- ============================================================
CREATE TRIGGER trg_wallet_txn_after_insert
AFTER INSERT ON wallet_transaction
FOR EACH ROW
BEGIN
    IF NEW.status = 'COMPLETED' THEN
        IF NEW.direction = 'CREDIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance + NEW.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = NEW.wallet_id;

        ELSEIF NEW.direction = 'DEBIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance - NEW.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = NEW.wallet_id;
        END IF;
    END IF;
END$$

-- ============================================================
-- TRIGGER: After UPDATE (chỉ xử lý khi status thay đổi sang COMPLETED)
-- ============================================================
CREATE TRIGGER trg_wallet_txn_after_update
AFTER UPDATE ON wallet_transaction
FOR EACH ROW
BEGIN
    -- Trường hợp 1: status vừa chuyển sang COMPLETED
    IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        IF NEW.direction = 'CREDIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance + NEW.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = NEW.wallet_id;

        ELSEIF NEW.direction = 'DEBIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance - NEW.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = NEW.wallet_id;
        END IF;

    -- Trường hợp 2: status vừa chuyển sang REVERSED (hoàn tác giao dịch COMPLETED)
    ELSEIF OLD.status = 'COMPLETED' AND NEW.status = 'REVERSED' THEN
        IF OLD.direction = 'CREDIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance - OLD.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = OLD.wallet_id;

        ELSEIF OLD.direction = 'DEBIT' THEN
            UPDATE user_wallet
            SET available_balance = available_balance + OLD.amount,
                version           = version + 1,
                updated_at        = CURRENT_TIMESTAMP
            WHERE id = OLD.wallet_id;
        END IF;
    END IF;
END$$

DELIMITER ;