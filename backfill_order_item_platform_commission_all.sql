SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE order_item oi
LEFT JOIN order_shipment os ON os.id = oi.shipment_id
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
  oi.commission_calculated_at = CASE
    WHEN UPPER(COALESCE(os.shipping_status, '')) = 'COMPLETED'
      AND oi.commission_calculated_at IS NULL
      THEN NOW()
    ELSE oi.commission_calculated_at
  END
WHERE GREATEST(
    CASE
      WHEN oi.total_after_shop_voucher > 0 THEN oi.total_after_shop_voucher
      ELSE oi.total_price - COALESCE(oi.shop_voucher_discount_amount, 0)
    END,
    0
  ) > 0
  AND (
    oi.platform_commission_rate = 0
    OR oi.platform_commission_amount = 0
    OR oi.seller_receivable_amount = 0
  );

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
