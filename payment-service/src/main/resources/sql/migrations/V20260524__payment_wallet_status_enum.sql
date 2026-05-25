-- Migrate payment_wallet from boolean is_active to enum status.
-- Run manually before deploying code with JPA validate.

ALTER TABLE payment_wallet
    ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE','SUSPENDED','CLOSED') NOT NULL DEFAULT 'ACTIVE' AFTER currency;

SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE payment_wallet
SET status = CASE
    WHEN is_active = 1 THEN 'ACTIVE'
    ELSE 'SUSPENDED'
END
WHERE id IS NOT NULL
  AND (status IS NULL OR status = '' OR status NOT IN ('ACTIVE','SUSPENDED','CLOSED'));

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

ALTER TABLE payment_wallet
    DROP COLUMN IF EXISTS is_active;
