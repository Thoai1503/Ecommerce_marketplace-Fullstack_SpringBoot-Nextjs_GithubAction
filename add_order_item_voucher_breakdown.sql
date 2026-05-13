ALTER TABLE order_item
  ADD COLUMN shop_voucher_discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER total_price,
  ADD COLUMN platform_voucher_discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER shop_voucher_discount_amount,
  ADD COLUMN total_voucher_discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER platform_voucher_discount_amount,
  ADD COLUMN total_after_shop_voucher DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER total_voucher_discount_amount,
  ADD COLUMN total_after_all_vouchers DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER total_after_shop_voucher;

SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE order_item oi
LEFT JOIN (
  SELECT
    vri.order_item_id,
    SUM(CASE WHEN UPPER(v.issuer_type) = 'SHOP' THEN vri.discount_amount ELSE 0 END) AS shop_discount,
    SUM(CASE WHEN UPPER(v.issuer_type) = 'PLATFORM' THEN vri.discount_amount ELSE 0 END) AS platform_discount,
    SUM(vri.discount_amount) AS total_discount
  FROM voucher_redemption_item vri
  INNER JOIN voucher_redemption vr ON vr.id = vri.voucher_redemption_id
  INNER JOIN voucher v ON v.id = vr.voucher_id
  GROUP BY vri.order_item_id
) d ON d.order_item_id = oi.id
SET
  oi.shop_voucher_discount_amount = COALESCE(d.shop_discount, 0),
  oi.platform_voucher_discount_amount = COALESCE(d.platform_discount, 0),
  oi.total_voucher_discount_amount = COALESCE(d.total_discount, 0),
  oi.total_after_shop_voucher = GREATEST(oi.total_price - COALESCE(d.shop_discount, 0), 0),
  oi.total_after_all_vouchers = GREATEST(oi.total_price - COALESCE(d.total_discount, 0), 0);

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
