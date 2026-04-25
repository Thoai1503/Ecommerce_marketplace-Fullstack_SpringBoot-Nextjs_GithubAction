-- Migration: thêm cột block_reason cho bảng shop
-- Dùng khi admin khóa (BLOCKED) shop — lưu lý do để hiển thị trên detail và gửi email.
-- Run trên Aiven MySQL sau khi khôi phục kết nối.

ALTER TABLE shop
  ADD COLUMN block_reason TEXT NULL AFTER rejection_reason;
