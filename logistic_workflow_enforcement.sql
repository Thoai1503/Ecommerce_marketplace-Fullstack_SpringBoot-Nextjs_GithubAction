SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

UPDATE product_variant pv
JOIN product p ON p.id = pv.product_id
SET
	pv.width = p.width,
	pv.weight = p.weight,
	pv.height = p.height
WHERE NOT (
	pv.width <=> p.width
	AND pv.weight <=> p.weight
	AND pv.height <=> p.height
);

COMMIT;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

SELECT
	pv.id AS variant_id,
	pv.product_id,
	pv.width,
	pv.weight,
	pv.height
FROM product_variant pv
ORDER BY pv.product_id, pv.id;
