ALTER TABLE order_item
  ADD COLUMN platform_commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000 AFTER total_after_all_vouchers,
  ADD COLUMN platform_commission_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER platform_commission_rate,
  ADD COLUMN seller_receivable_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00 AFTER platform_commission_amount,
  ADD COLUMN commission_calculated_at TIMESTAMP NULL DEFAULT NULL AFTER seller_receivable_amount;

SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE order_item oi
INNER JOIN order_shipment os ON os.id = oi.shipment_id
SET
  oi.platform_commission_rate = 0.1000,
  oi.platform_commission_amount = ROUND(
    GREATEST(
      CASE
        WHEN oi.total_after_shop_voucher > 0 THEN oi.total_after_shop_voucher
        ELSE oi.total_price - COALESCE(oi.shop_voucher_discount_amount, 0)
      END,
      0
    ) * 0.10,
    2
  ),
  oi.seller_receivable_amount = ROUND(
    GREATEST(
      CASE
        WHEN oi.total_after_shop_voucher > 0 THEN oi.total_after_shop_voucher
        ELSE oi.total_price - COALESCE(oi.shop_voucher_discount_amount, 0)
      END,
      0
    ) * 0.90,
    2
  ),
  oi.commission_calculated_at = NOW()
WHERE UPPER(os.shipping_status) = 'COMPLETED';

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
