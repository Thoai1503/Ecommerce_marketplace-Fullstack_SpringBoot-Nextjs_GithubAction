  -- Triggers for order_shipment_status_history
  -- Safe to re-run: old triggers are dropped before recreate

  DROP TRIGGER IF EXISTS `trg_order_shipment_after_insert_status_history`;
  DROP TRIGGER IF EXISTS `trg_order_shipment_after_update_status_history`;

  DELIMITER ;;

  CREATE TRIGGER `trg_order_shipment_after_insert_status_history`
  AFTER INSERT ON `order_shipment`
  FOR EACH ROW
  BEGIN
    INSERT INTO `order_shipment_status_history` (
      `order_shipment_id`,
      `old_status`,
      `new_status`,
      `changed_at`,
      `changed_by`,
      `note`
    )
    VALUES (
      NEW.`id`,
      NULL,
      'PENDING',
      CURRENT_TIMESTAMP,
      SUBSTRING_INDEX(USER(), '@', 1),
      'pending - waiting shop confirmation'
    );
  END;;

  CREATE TRIGGER `trg_order_shipment_after_update_status_history`
  AFTER UPDATE ON `order_shipment`
  FOR EACH ROW
  BEGIN
    IF NOT (OLD.`shipping_status` <=> NEW.`shipping_status`) THEN
      INSERT INTO `order_shipment_status_history` (
        `order_shipment_id`,
        `old_status`,
        `new_status`,
        `changed_at`,
        `changed_by`,
        `note`
      )
      VALUES (
        NEW.`id`,
        OLD.`shipping_status`,
        NEW.`shipping_status`,
        CURRENT_TIMESTAMP,
        SUBSTRING_INDEX(USER(), '@', 1),
        'status changed from order_shipment update'
      );
    END IF;
  END;;

  DELIMITER ;
