-- ============================================================================
-- PAYMENT DB - FINANCIAL ADJUSTMENT & SETTLEMENT ADJUSTMENT
-- ============================================================================
-- Purpose:
--   Separate business-financial responsibilities caused by return/refund flows
--   from the original payment/refund transaction records.
--
-- Scope:
--   - Record a canonical adjustment event per return/refund/dispute case.
--   - Split the financial responsibility between SELLER / PLATFORM / LOGISTICS.
--   - Apply individual split lines into settlement cycles without changing the
--     original order payment snapshot or original seller settlement snapshot.
--
-- Apply after:
--   1. PAYMENT.SQL
--   2. return_refund_schema.sql
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- 1. FINANCIAL ADJUSTMENT MASTER
-- ============================================================================

DROP TABLE IF EXISTS `settlement_adjustment`;
DROP TABLE IF EXISTS `financial_adjustment_allocation`;
DROP TABLE IF EXISTS `financial_adjustment`;

CREATE TABLE `financial_adjustment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `adjustment_code` VARCHAR(64) NOT NULL COMMENT 'FA-20260426-xxxxx',
  `source_service` VARCHAR(30) NOT NULL DEFAULT 'ECOMMERCE' COMMENT 'ECOMMERCE, PAYMENT, LOGISTICS, ADMIN',
  `source_type` VARCHAR(30) NOT NULL COMMENT 'RETURN_REFUND, LOGISTICS_CLAIM, DISPUTE, MANUAL, SETTLEMENT_CORRECTION',
  `source_ref_type` VARCHAR(30) DEFAULT NULL COMMENT 'RETURN_REQUEST, REFUND_REQUEST, PAYMENT_TRANSACTION, ORDER, ORDER_SHIPMENT, DISPUTE',
  `source_ref_id` BIGINT DEFAULT NULL,
  `source_ref_code` VARCHAR(64) DEFAULT NULL,
  `order_id` BIGINT DEFAULT NULL,
  `order_number` VARCHAR(64) DEFAULT NULL,
  `payment_transaction_id` BIGINT DEFAULT NULL,
  `refund_request_id` BIGINT DEFAULT NULL,
  `shop_id` BIGINT DEFAULT NULL,
  `user_id` BIGINT DEFAULT NULL,
  `return_request_id` BIGINT DEFAULT NULL COMMENT 'Reference from ecommerce db, stored as scalar for cross-service mapping',
  `return_shipment_id` BIGINT DEFAULT NULL COMMENT 'Reference from ecommerce db, stored as scalar for cross-service mapping',
  `adjustment_reason` VARCHAR(50) NOT NULL COMMENT 'ITEM_DEFECTIVE, RETURN_SHIPPING_FEE, RESTOCKING_FEE_REVERSAL, SELLER_LIABILITY, PLATFORM_SUBSIDY, LOGISTICS_COMPENSATION, MANUAL_CORRECTION',
  `gross_adjustment_amount` BIGINT NOT NULL COMMENT 'Absolute total amount of the adjustment event in VND',
  `currency` CHAR(3) NOT NULL DEFAULT 'VND',
  `status` VARCHAR(20) NOT NULL DEFAULT 'CREATED' COMMENT 'CREATED, APPROVED, PARTIALLY_ALLOCATED, ALLOCATED, CANCELLED, REVERSED',
  `approved_by` BIGINT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `effective_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Business effective timestamp for accounting logic',
  `note` VARCHAR(500) DEFAULT NULL,
  `extra_data` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_financial_adjustment_code` (`adjustment_code`),
  KEY `idx_fin_adj_source` (`source_service`, `source_type`, `source_ref_id`),
  KEY `idx_fin_adj_order` (`order_id`, `status`),
  KEY `idx_fin_adj_shop` (`shop_id`, `status`),
  KEY `idx_fin_adj_refund` (`refund_request_id`),
  KEY `idx_fin_adj_txn` (`payment_transaction_id`),
  KEY `idx_fin_adj_effective_at` (`effective_at`),
  CONSTRAINT `fk_fin_adj_payment_txn` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fin_adj_refund_request` FOREIGN KEY (`refund_request_id`) REFERENCES `refund_request` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_adjustment_chk_1` CHECK ((`source_service` in (_utf8mb4'ECOMMERCE', _utf8mb4'PAYMENT', _utf8mb4'LOGISTICS', _utf8mb4'ADMIN'))),
  CONSTRAINT `financial_adjustment_chk_2` CHECK ((`source_type` in (_utf8mb4'RETURN_REFUND', _utf8mb4'LOGISTICS_CLAIM', _utf8mb4'DISPUTE', _utf8mb4'MANUAL', _utf8mb4'SYSTEM', _utf8mb4'SETTLEMENT_CORRECTION'))),
  CONSTRAINT `financial_adjustment_chk_3` CHECK ((`adjustment_reason` in (_utf8mb4'ITEM_DEFECTIVE', _utf8mb4'NOT_AS_DESCRIBED', _utf8mb4'RETURN_SHIPPING_FEE', _utf8mb4'RESTOCKING_FEE_REVERSAL', _utf8mb4'SELLER_LIABILITY', _utf8mb4'PLATFORM_SUBSIDY', _utf8mb4'LOGISTICS_COMPENSATION', _utf8mb4'DISPUTE_REVERSAL', _utf8mb4'MANUAL_CORRECTION'))),
  CONSTRAINT `financial_adjustment_chk_4` CHECK ((`status` in (_utf8mb4'CREATED', _utf8mb4'APPROVED', _utf8mb4'PARTIALLY_ALLOCATED', _utf8mb4'ALLOCATED', _utf8mb4'CANCELLED', _utf8mb4'REVERSED'))),
  CONSTRAINT `financial_adjustment_chk_5` CHECK ((`gross_adjustment_amount` > 0)),
  CONSTRAINT `financial_adjustment_chk_6` CHECK ((`currency` = _utf8mb4'VND'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Canonical accounting adjustment event caused by return/refund/dispute workflow';

-- ============================================================================
-- 2. FINANCIAL ADJUSTMENT ALLOCATION
-- ============================================================================

CREATE TABLE `financial_adjustment_allocation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `financial_adjustment_id` BIGINT NOT NULL,
  `party_type` VARCHAR(20) NOT NULL COMMENT 'SELLER, PLATFORM, LOGISTICS, BUYER',
  `party_id` BIGINT DEFAULT NULL COMMENT 'shop_id, logistics partner id, user_id; NULL when party_type=PLATFORM',
  `entry_direction` VARCHAR(10) NOT NULL COMMENT 'DEBIT reduces party position, CREDIT increases party position',
  `amount` BIGINT NOT NULL,
  `settlement_eligible` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '1 when this line can flow into settlement adjustment',
  `settlement_status` VARCHAR(20) NOT NULL DEFAULT 'UNSETTLED' COMMENT 'UNSETTLED, PARTIALLY_SETTLED, SETTLED, WAIVED',
  `netting_group` VARCHAR(30) DEFAULT NULL COMMENT 'RETURN, REFUND, LOGISTICS, DISPUTE',
  `note` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fin_adj_alloc_master` (`financial_adjustment_id`),
  KEY `idx_fin_adj_alloc_party` (`party_type`, `party_id`, `settlement_status`),
  KEY `idx_fin_adj_alloc_eligible` (`settlement_eligible`, `settlement_status`),
  CONSTRAINT `fk_fin_adj_alloc_master` FOREIGN KEY (`financial_adjustment_id`) REFERENCES `financial_adjustment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `financial_adjustment_allocation_chk_1` CHECK ((`party_type` in (_utf8mb4'SELLER', _utf8mb4'PLATFORM', _utf8mb4'LOGISTICS', _utf8mb4'BUYER'))),
  CONSTRAINT `financial_adjustment_allocation_chk_2` CHECK ((`entry_direction` in (_utf8mb4'DEBIT', _utf8mb4'CREDIT'))),
  CONSTRAINT `financial_adjustment_allocation_chk_3` CHECK ((`settlement_status` in (_utf8mb4'UNSETTLED', _utf8mb4'PARTIALLY_SETTLED', _utf8mb4'SETTLED', _utf8mb4'WAIVED'))),
  CONSTRAINT `financial_adjustment_allocation_chk_4` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Split of one financial adjustment into responsible parties';

-- ============================================================================
-- 3. SETTLEMENT ADJUSTMENT
-- ============================================================================

CREATE TABLE `settlement_adjustment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `adjustment_allocation_id` BIGINT NOT NULL,
  `settlement_target_type` VARCHAR(20) NOT NULL COMMENT 'SELLER, PLATFORM, LOGISTICS',
  `settlement_target_id` BIGINT DEFAULT NULL COMMENT 'shop_id, platform bucket id, logistics partner id',
  `seller_settlement_id` BIGINT DEFAULT NULL COMMENT 'Filled when this line is applied into seller_settlement',
  `entry_type` VARCHAR(20) NOT NULL COMMENT 'DEDUCTION, ADDITION, HOLD, RELEASE, REVERSAL',
  `amount` BIGINT NOT NULL,
  `period_from` DATE DEFAULT NULL,
  `period_to` DATE DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, APPLIED, SKIPPED, REVERSED',
  `applied_at` DATETIME DEFAULT NULL,
  `reversed_at` DATETIME DEFAULT NULL,
  `note` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_settlement_adjustment_allocation` (`adjustment_allocation_id`),
  KEY `idx_settlement_adjustment_target` (`settlement_target_type`, `settlement_target_id`, `status`),
  KEY `idx_settlement_adjustment_period` (`period_from`, `period_to`),
  KEY `idx_settlement_adjustment_seller_settlement` (`seller_settlement_id`),
  CONSTRAINT `fk_settlement_adjustment_allocation` FOREIGN KEY (`adjustment_allocation_id`) REFERENCES `financial_adjustment_allocation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_settlement_adjustment_seller_settlement` FOREIGN KEY (`seller_settlement_id`) REFERENCES `seller_settlement` (`id`) ON DELETE SET NULL,
  CONSTRAINT `settlement_adjustment_chk_1` CHECK ((`settlement_target_type` in (_utf8mb4'SELLER', _utf8mb4'PLATFORM', _utf8mb4'LOGISTICS'))),
  CONSTRAINT `settlement_adjustment_chk_2` CHECK ((`entry_type` in (_utf8mb4'DEDUCTION', _utf8mb4'ADDITION', _utf8mb4'HOLD', _utf8mb4'RELEASE', _utf8mb4'REVERSAL'))),
  CONSTRAINT `settlement_adjustment_chk_3` CHECK ((`status` in (_utf8mb4'PENDING', _utf8mb4'APPLIED', _utf8mb4'SKIPPED', _utf8mb4'REVERSED'))),
  CONSTRAINT `settlement_adjustment_chk_4` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Applied settlement entries generated from financial adjustment allocations';

-- ============================================================================
-- 4. EXTEND REFUND REQUEST FOR RETURN/ADJUSTMENT TRACEABILITY
-- ============================================================================

ALTER TABLE `refund_request`
  ADD COLUMN `source_service` VARCHAR(30) NOT NULL DEFAULT 'PAYMENT'
    COMMENT 'PAYMENT, ECOMMERCE, LOGISTICS, ADMIN'
    AFTER `shop_id`,
  ADD COLUMN `source_ref_type` VARCHAR(30) DEFAULT NULL
    COMMENT 'RETURN_REQUEST, ORDER, PAYMENT_TRANSACTION, DISPUTE'
    AFTER `source_service`,
  ADD COLUMN `source_ref_id` BIGINT DEFAULT NULL
    AFTER `source_ref_type`,
  ADD COLUMN `source_ref_code` VARCHAR(64) DEFAULT NULL
    AFTER `source_ref_id`,
  ADD COLUMN `financial_adjustment_id` BIGINT DEFAULT NULL
    AFTER `gateway_response`;

ALTER TABLE `refund_request`
  ADD KEY `idx_refund_source_ref` (`source_service`, `source_ref_type`, `source_ref_id`),
  ADD KEY `idx_refund_financial_adjustment` (`financial_adjustment_id`),
  ADD CONSTRAINT `fk_refund_financial_adjustment` FOREIGN KEY (`financial_adjustment_id`) REFERENCES `financial_adjustment` (`id`) ON DELETE SET NULL;

-- ============================================================================
-- 5. EXTEND SELLER SETTLEMENT ITEM FOR ADJUSTMENT TRACEABILITY
-- ============================================================================

ALTER TABLE `seller_settlement_item`
  ADD COLUMN `financial_adjustment_id` BIGINT DEFAULT NULL
    AFTER `transaction_id`,
  ADD COLUMN `settlement_adjustment_id` BIGINT DEFAULT NULL
    AFTER `financial_adjustment_id`;

ALTER TABLE `seller_settlement_item`
  ADD KEY `idx_settlement_item_fin_adjustment` (`financial_adjustment_id`),
  ADD KEY `idx_settlement_item_settlement_adjustment` (`settlement_adjustment_id`),
  ADD CONSTRAINT `fk_settlement_item_fin_adjustment` FOREIGN KEY (`financial_adjustment_id`) REFERENCES `financial_adjustment` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_settlement_item_settlement_adjustment` FOREIGN KEY (`settlement_adjustment_id`) REFERENCES `settlement_adjustment` (`id`) ON DELETE SET NULL;

-- ============================================================================
-- 6. VIEW FOR OPEN ADJUSTMENTS PENDING SETTLEMENT
-- ============================================================================

DROP VIEW IF EXISTS `vw_open_financial_adjustments`;

CREATE VIEW `vw_open_financial_adjustments` AS
SELECT
  fa.id AS financial_adjustment_id,
  fa.adjustment_code,
  fa.source_service,
  fa.source_type,
  fa.source_ref_type,
  fa.source_ref_id,
  fa.order_id,
  fa.order_number,
  fa.refund_request_id,
  fa.shop_id,
  fa.adjustment_reason,
  fa.gross_adjustment_amount,
  fa.status AS adjustment_status,
  faa.id AS allocation_id,
  faa.party_type,
  faa.party_id,
  faa.entry_direction,
  faa.amount AS allocation_amount,
  faa.settlement_status,
  sa.id AS settlement_adjustment_id,
  sa.status AS settlement_adjustment_status,
  sa.seller_settlement_id,
  fa.effective_at,
  fa.created_at
FROM financial_adjustment fa
JOIN financial_adjustment_allocation faa ON faa.financial_adjustment_id = fa.id
LEFT JOIN settlement_adjustment sa ON sa.adjustment_allocation_id = faa.id
WHERE fa.status IN ('APPROVED', 'PARTIALLY_ALLOCATED', 'ALLOCATED')
  AND faa.settlement_status IN ('UNSETTLED', 'PARTIALLY_SETTLED');

COMMIT;

-- ============================================================================
-- SAMPLE RESPONSIBILITY MODEL
-- ============================================================================
-- Example 1: Defective item, seller bears full merchandise refund
--   financial_adjustment: gross_adjustment_amount = 500000
--   allocation A: SELLER  / DEBIT  / 500000 / settlement_eligible=1
--   allocation B: BUYER   / CREDIT / 500000 / settlement_eligible=0
--
-- Example 2: Platform subsidizes return shipping fee 30000
--   allocation A: PLATFORM / DEBIT  / 30000 / settlement_eligible=0
--   allocation B: BUYER    / CREDIT / 30000 / settlement_eligible=0
--
-- Example 3: Logistics compensates lost parcel 80000 to platform
--   allocation A: LOGISTICS / DEBIT  / 80000 / settlement_eligible=1
--   allocation B: PLATFORM  / CREDIT / 80000 / settlement_eligible=0
-- ============================================================================