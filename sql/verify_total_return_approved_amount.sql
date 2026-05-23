-- Verify mismatch between orders.total_return_approved_amount and recalculated total from return_request

SELECT
    o.id AS order_id,
    o.total_return_approved_amount AS current_total_return_approved_amount,
    COALESCE(agg.expected_total_return_approved_amount, 0) AS expected_total_return_approved_amount,
    o.total_return_approved_amount - COALESCE(agg.expected_total_return_approved_amount, 0) AS diff
FROM orders o
LEFT JOIN (
    SELECT
        rr.order_id,
        COALESCE(SUM(COALESCE(rr.approved_amount, 0)), 0) AS expected_total_return_approved_amount
    FROM return_request rr
    WHERE rr.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
    GROUP BY rr.order_id
) agg ON agg.order_id = o.id
WHERE ABS(o.total_return_approved_amount - COALESCE(agg.expected_total_return_approved_amount, 0)) > 0.005
ORDER BY ABS(o.total_return_approved_amount - COALESCE(agg.expected_total_return_approved_amount, 0)) DESC,
         o.id DESC;
