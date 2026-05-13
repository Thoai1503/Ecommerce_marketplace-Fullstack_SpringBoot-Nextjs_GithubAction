DROP TRIGGER IF EXISTS `trg_orders_before_insert_zero_final_amount`;
DROP TRIGGER IF EXISTS `trg_orders_before_update_zero_final_amount`;

DELIMITER $$

CREATE TRIGGER `trg_orders_before_insert_zero_final_amount`
BEFORE INSERT ON `orders`
FOR EACH ROW
BEGIN
    IF UPPER(TRIM(IFNULL(NEW.`order_status`, ''))) IN ('FAILED', 'CANCELED') THEN
        SET NEW.`final_amount` = 0;
    END IF;
END$$

CREATE TRIGGER `trg_orders_before_update_zero_final_amount`
BEFORE UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF UPPER(TRIM(IFNULL(NEW.`order_status`, ''))) IN ('FAILED', 'CANCELED') THEN
        SET NEW.`final_amount` = 0;
    END IF;
END$$

DELIMITER ;