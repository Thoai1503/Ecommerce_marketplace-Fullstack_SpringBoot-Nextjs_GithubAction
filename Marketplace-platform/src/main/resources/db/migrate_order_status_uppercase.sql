-- Migrate order status to UPPERCASE convention used by AdminOrderController.
-- Safe to run multiple times.
UPDATE `orders` SET order_status = UPPER(order_status) WHERE order_status IS NOT NULL;
UPDATE `orders` SET payment_status = UPPER(payment_status) WHERE payment_status IS NOT NULL;
-- Normalize legacy variants
UPDATE `orders` SET order_status = 'CANCELLED' WHERE order_status IN ('CANCEL','CANCELED','CANCELLED');
UPDATE `orders` SET order_status = 'COMPLETED' WHERE order_status IN ('COMPLETE','DONE','DELIVERED');
