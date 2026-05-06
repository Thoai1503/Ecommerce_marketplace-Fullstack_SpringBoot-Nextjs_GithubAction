-- Add Unique Constraint to prevent duplicate category_attribute entries
-- This ensures a category cannot have the same attribute linked multiple times

ALTER TABLE `category_attribute` 
ADD CONSTRAINT `uk_category_attribute` UNIQUE KEY (`category_id`, `attribute_id`);

-- If the above fails due to existing duplicates, first clean them up:
-- DELETE ca1 FROM category_attribute ca1
-- INNER JOIN category_attribute ca2
-- WHERE ca1.id > ca2.id
-- AND ca1.category_id = ca2.category_id
-- AND ca1.attribute_id = ca2.attribute_id;
-- 
-- Then run the ALTER TABLE statement above
