-- ============================================================
-- Voucher business sample seed data
-- Target: MySQL 8.0+
-- Run AFTER voucher_v2_migration.sql
-- ============================================================

START TRANSACTION;

-- ------------------------------------------------------------
-- 1) Campaigns
-- ------------------------------------------------------------
INSERT INTO voucher_campaign (
  code,
  name,
  description,
  start_at,
  end_at,
  status,
  created_by
)
VALUES
  (
    'CAMP_MIDYEAR_2026',
    'Mid Year Campaign 2026',
    'Chien dich giua nam cho voucher toan san va doi tac',
    '2026-06-01 00:00:00',
    '2026-07-15 23:59:59',
    'ACTIVE',
    1
  ),
  (
    'CAMP_NEWUSER_2026',
    'New User Booster 2026',
    'Chien dich thu hut user moi',
    '2026-04-01 00:00:00',
    '2026-12-31 23:59:59',
    'ACTIVE',
    1
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  start_at = VALUES(start_at),
  end_at = VALUES(end_at),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

SET @camp_midyear = (
  SELECT id FROM voucher_campaign WHERE code = 'CAMP_MIDYEAR_2026' LIMIT 1
);
SET @camp_newuser = (
  SELECT id FROM voucher_campaign WHERE code = 'CAMP_NEWUSER_2026' LIMIT 1
);

-- ------------------------------------------------------------
-- 2) Vouchers
-- ------------------------------------------------------------
INSERT INTO voucher (
  campaign_id,
  code,
  title,
  description,
  issuer_type,
  issuer_id,
  discount_type,
  discount_percent,
  discount_amount,
  max_discount_amount,
  min_order_value,
  max_order_value,
  total_quota,
  claimed_count,
  redeemed_count,
  per_user_quota,
  stackable,
  claim_start_at,
  claim_end_at,
  valid_from,
  valid_to,
  status,
  priority,
  created_by
)
VALUES
  (
    @camp_midyear,
    'PLAT_MID_20',
    'Giam 20% toi da 120k',
    'Voucher toan san cho dot giua nam',
    'PLATFORM',
    NULL,
    'PERCENT',
    20.00,
    NULL,
    120000.00,
    300000.00,
    NULL,
    5000,
    0,
    0,
    1,
    0,
    '2026-06-01 00:00:00',
    '2026-07-10 23:59:59',
    '2026-06-01 00:00:00',
    '2026-07-15 23:59:59',
    'ACTIVE',
    10,
    1
  ),
  (
    @camp_newuser,
    'NEWUSER_50K',
    'Khach moi giam 50k',
    'Chi ap dung cho user moi, don dau tien',
    'PLATFORM',
    NULL,
    'FIXED',
    NULL,
    50000.00,
    NULL,
    299000.00,
    NULL,
    20000,
    0,
    0,
    1,
    0,
    '2026-04-01 00:00:00',
    '2026-12-31 23:59:59',
    '2026-04-01 00:00:00',
    '2026-12-31 23:59:59',
    'ACTIVE',
    20,
    1
  ),
  (
    @camp_midyear,
    'SHOP2_80K',
    'Shop Dien Tu 247 giam 80k',
    'Voucher cua shop id=2',
    'SHOP',
    2,
    'FIXED',
    NULL,
    80000.00,
    NULL,
    600000.00,
    NULL,
    1500,
    0,
    0,
    1,
    0,
    '2026-06-01 00:00:00',
    '2026-08-31 23:59:59',
    '2026-06-01 00:00:00',
    '2026-08-31 23:59:59',
    'ACTIVE',
    30,
    1
  ),
  (
    @camp_midyear,
    'SONY_FREESHIP',
    'Mien phi van chuyen Sony',
    'Voucher brand Sony, mien phi ship',
    'BRAND',
    7,
    'FREE_SHIPPING',
    NULL,
    NULL,
    NULL,
    0.00,
    NULL,
    2500,
    0,
    0,
    2,
    1,
    '2026-06-01 00:00:00',
    '2026-09-30 23:59:59',
    '2026-06-01 00:00:00',
    '2026-09-30 23:59:59',
    'ACTIVE',
    35,
    1
  ),
  (
    @camp_midyear,
    'GIFT_TOOL_114',
    'Tang san pham khi dat muc don',
    'Voucher tang qua test nghiep vu GIFT_ITEM',
    'PLATFORM',
    NULL,
    'GIFT_ITEM',
    NULL,
    NULL,
    NULL,
    800000.00,
    NULL,
    300,
    0,
    0,
    1,
    0,
    '2026-06-01 00:00:00',
    '2026-08-15 23:59:59',
    '2026-06-01 00:00:00',
    '2026-08-15 23:59:59',
    'ACTIVE',
    40,
    1
  )
ON DUPLICATE KEY UPDATE
  campaign_id = VALUES(campaign_id),
  title = VALUES(title),
  description = VALUES(description),
  issuer_type = VALUES(issuer_type),
  issuer_id = VALUES(issuer_id),
  discount_type = VALUES(discount_type),
  discount_percent = VALUES(discount_percent),
  discount_amount = VALUES(discount_amount),
  max_discount_amount = VALUES(max_discount_amount),
  min_order_value = VALUES(min_order_value),
  max_order_value = VALUES(max_order_value),
  total_quota = VALUES(total_quota),
  per_user_quota = VALUES(per_user_quota),
  stackable = VALUES(stackable),
  claim_start_at = VALUES(claim_start_at),
  claim_end_at = VALUES(claim_end_at),
  valid_from = VALUES(valid_from),
  valid_to = VALUES(valid_to),
  status = VALUES(status),
  priority = VALUES(priority),
  updated_at = CURRENT_TIMESTAMP;

SET @v_plat_20 = (SELECT id FROM voucher WHERE code = 'PLAT_MID_20' LIMIT 1);
SET @v_newuser_50k = (SELECT id FROM voucher WHERE code = 'NEWUSER_50K' LIMIT 1);
SET @v_shop2_80k = (SELECT id FROM voucher WHERE code = 'SHOP2_80K' LIMIT 1);
SET @v_sony_freeship = (SELECT id FROM voucher WHERE code = 'SONY_FREESHIP' LIMIT 1);
SET @v_gift_114 = (SELECT id FROM voucher WHERE code = 'GIFT_TOOL_114' LIMIT 1);

-- ------------------------------------------------------------
-- 3) Gift item mapping (for GIFT_ITEM voucher)
-- ------------------------------------------------------------
INSERT IGNORE INTO voucher_gift_item (voucher_id, product_id, variant_id, quantity)
SELECT @v_gift_114, 114, 11, 1;

-- ------------------------------------------------------------
-- 4) Scope rules
-- ------------------------------------------------------------
INSERT IGNORE INTO voucher_scope_rule (voucher_id, scope_type, scope_id, include_exclude)
VALUES
  (@v_shop2_80k, 'SHOP', 2, 'INCLUDE'),
  (@v_sony_freeship, 'BRAND', 7, 'INCLUDE'),
  (@v_plat_20, 'CATEGORY', 183, 'INCLUDE'),
  (@v_plat_20, 'PRODUCT', 129, 'EXCLUDE');

-- ------------------------------------------------------------
-- 5) User segment rules
-- ------------------------------------------------------------
INSERT IGNORE INTO voucher_user_segment_rule (voucher_id, segment_type, segment_value)
VALUES
  (@v_newuser_50k, 'NEW_USER', NULL),
  (@v_newuser_50k, 'FIRST_ORDER', NULL),
  (@v_sony_freeship, 'APP_ONLY', NULL),
  (@v_plat_20, 'MEMBERSHIP_TIER', 'GOLD');

-- ------------------------------------------------------------
-- 6) User voucher (claim/reserve/redeem samples)
-- ------------------------------------------------------------
INSERT INTO user_voucher (
  user_id,
  voucher_id,
  claim_channel,
  status,
  claimed_at,
  reserved_order_id,
  reserved_at,
  redeemed_at
)
SELECT 7, @v_plat_20, 'APP', 'CLAIMED', NOW() - INTERVAL 2 DAY, NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_voucher
  WHERE user_id = 7 AND voucher_id = @v_plat_20 AND status = 'CLAIMED'
);

INSERT INTO user_voucher (
  user_id,
  voucher_id,
  claim_channel,
  status,
  claimed_at,
  reserved_order_id,
  reserved_at,
  redeemed_at
)
SELECT 41, @v_newuser_50k, 'WEB', 'CLAIMED', NOW() - INTERVAL 1 DAY, NULL, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_voucher
  WHERE user_id = 41 AND voucher_id = @v_newuser_50k AND status = 'CLAIMED'
);

INSERT INTO user_voucher (
  user_id,
  voucher_id,
  claim_channel,
  status,
  claimed_at,
  reserved_order_id,
  reserved_at,
  redeemed_at
)
SELECT 1, @v_shop2_80k, 'APP', 'RESERVED', NOW() - INTERVAL 6 HOUR, 447, NOW() - INTERVAL 5 HOUR, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_voucher
  WHERE user_id = 1 AND voucher_id = @v_shop2_80k AND status = 'RESERVED' AND reserved_order_id = 447
);

SET @uv_redeem = (
  SELECT id
  FROM user_voucher
  WHERE user_id = 7 AND voucher_id = @v_plat_20
  ORDER BY id DESC
  LIMIT 1
);

-- ------------------------------------------------------------
-- 7) Redemption samples
-- ------------------------------------------------------------
INSERT INTO voucher_redemption (
  user_voucher_id,
  voucher_id,
  user_id,
  order_id,
  order_code,
  original_shipping_fee,
  original_order_amount,
  discount_amount_applied,
  final_order_amount,
  redeemed_at,
  status,
  failure_reason
)
SELECT
  @uv_redeem,
  @v_plat_20,
  7,
  447,
  'ORD202503180011D05D3BE',
  75000,
  29405000,
  120000,
  29285000,
  NOW() - INTERVAL 4 HOUR,
  'SUCCESS',
  NULL
WHERE @uv_redeem IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM voucher_redemption WHERE order_id = 447 AND voucher_id = @v_plat_20
  );

INSERT INTO voucher_redemption (
  user_voucher_id,
  voucher_id,
  user_id,
  order_id,
  order_code,
  original_shipping_fee,
  original_order_amount,
  discount_amount_applied,
  final_order_amount,
  redeemed_at,
  status,
  failure_reason
)
SELECT
  @uv_redeem,
  @v_plat_20,
  7,
  448,
  'ORD20250318001FFE91440',
  75000,
  5203500,
  0,
  5278500,
  NOW() - INTERVAL 2 HOUR,
  'FAILED',
  'Khong dat dieu kien min_order_value'
WHERE @uv_redeem IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM voucher_redemption WHERE order_id = 448 AND voucher_id = @v_plat_20
  );

-- If success redemption exists, reflect a redeemed state in user_voucher.
UPDATE user_voucher uv
SET
  uv.status = 'REDEEMED',
  uv.redeemed_at = COALESCE(uv.redeemed_at, NOW() - INTERVAL 4 HOUR)
WHERE uv.id = @uv_redeem
  AND EXISTS (
    SELECT 1 FROM voucher_redemption vr
    WHERE vr.user_voucher_id = uv.id AND vr.status = 'SUCCESS'
  );

-- ------------------------------------------------------------
-- 8) Recompute voucher counters from transactional data
-- ------------------------------------------------------------
UPDATE voucher v
LEFT JOIN (
  SELECT voucher_id, COUNT(*) AS claimed_cnt
  FROM user_voucher
  GROUP BY voucher_id
) uv ON uv.voucher_id = v.id
LEFT JOIN (
  SELECT voucher_id, COUNT(*) AS redeemed_cnt
  FROM voucher_redemption
  WHERE status = 'SUCCESS'
  GROUP BY voucher_id
) vr ON vr.voucher_id = v.id
SET
  v.claimed_count = IFNULL(uv.claimed_cnt, 0),
  v.redeemed_count = IFNULL(vr.redeemed_cnt, 0)
WHERE v.id IN (@v_plat_20, @v_newuser_50k, @v_shop2_80k, @v_sony_freeship, @v_gift_114);

-- ------------------------------------------------------------
-- 9) Audit logs
-- ------------------------------------------------------------
INSERT INTO voucher_audit_log (
  voucher_id,
  event_type,
  actor_type,
  actor_id,
  entity_type,
  entity_id,
  old_data,
  new_data,
  note
)
SELECT
  @v_plat_20,
  'CREATED',
  'ADMIN',
  1,
  'VOUCHER',
  @v_plat_20,
  NULL,
  JSON_OBJECT('code', 'PLAT_MID_20', 'status', 'ACTIVE'),
  'Seed: tao voucher toan san'
WHERE NOT EXISTS (
  SELECT 1
  FROM voucher_audit_log
  WHERE voucher_id = @v_plat_20
    AND event_type = 'CREATED'
    AND note = 'Seed: tao voucher toan san'
);

INSERT INTO voucher_audit_log (
  voucher_id,
  event_type,
  actor_type,
  actor_id,
  entity_type,
  entity_id,
  old_data,
  new_data,
  note
)
SELECT
  @v_plat_20,
  'RULE_UPDATED',
  'ADMIN',
  1,
  'SCOPE_RULE',
  NULL,
  NULL,
  JSON_OBJECT('added_scope', 'CATEGORY:183 INCLUDE'),
  'Seed: them rule category'
WHERE NOT EXISTS (
  SELECT 1
  FROM voucher_audit_log
  WHERE voucher_id = @v_plat_20
    AND event_type = 'RULE_UPDATED'
    AND note = 'Seed: them rule category'
);

INSERT INTO voucher_audit_log (
  voucher_id,
  event_type,
  actor_type,
  actor_id,
  entity_type,
  entity_id,
  old_data,
  new_data,
  note
)
SELECT
  @v_plat_20,
  'REDEEMED',
  'USER',
  7,
  'REDEMPTION',
  (
    SELECT id FROM voucher_redemption
    WHERE order_id = 447 AND voucher_id = @v_plat_20
    LIMIT 1
  ),
  NULL,
  JSON_OBJECT('order_id', 447, 'status', 'SUCCESS'),
  'Seed: redeem thanh cong order 447'
WHERE EXISTS (
  SELECT 1 FROM voucher_redemption WHERE order_id = 447 AND voucher_id = @v_plat_20
)
  AND NOT EXISTS (
    SELECT 1
    FROM voucher_audit_log
    WHERE voucher_id = @v_plat_20
      AND event_type = 'REDEEMED'
      AND note = 'Seed: redeem thanh cong order 447'
  );

COMMIT;

-- Quick check queries:
-- SELECT code, status, claimed_count, redeemed_count FROM voucher WHERE code IN ('PLAT_MID_20','NEWUSER_50K','SHOP2_80K','SONY_FREESHIP','GIFT_TOOL_114');
-- SELECT * FROM voucher_scope_rule WHERE voucher_id IN (@v_plat_20, @v_shop2_80k, @v_sony_freeship);
-- SELECT * FROM voucher_redemption WHERE voucher_id = @v_plat_20 ORDER BY redeemed_at DESC;
