-- Fix typo: rename orver_name to owner_name
ALTER TABLE shop CHANGE COLUMN orver_name owner_name varchar(255) DEFAULT NULL;
