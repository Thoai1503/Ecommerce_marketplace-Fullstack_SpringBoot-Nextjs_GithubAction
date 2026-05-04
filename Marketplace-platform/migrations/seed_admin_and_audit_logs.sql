-- =============================================================
-- SEED: Admin users + Admin roles + Audit logs (Phase 1.7)
-- Chạy sau khi đã chạy V1_7__Create_Admin_Roles_And_Audit_Logs.sql
-- Password mặc định cho tất cả: Admin@123456
-- BCrypt hash của "Admin@123456"
-- =============================================================

SET @BCRYPT_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y';

-- =============================================================
-- BƯỚC 1: Tạo users nếu chưa tồn tại
-- =============================================================

-- Super Admin
INSERT INTO users (email, password_hash, full_name, role, user_type, is_verified, is_active, created_at, updated_at)
SELECT 'admin@vietcommerce.com', @BCRYPT_HASH, 'Super Admin', 'SUPER_ADMIN', 'admin', 1, 1, '2026-01-05 08:00:00', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@vietcommerce.com');

-- Admin 1
INSERT INTO users (email, password_hash, full_name, role, user_type, is_verified, is_active, created_at, updated_at)
SELECT 'kieu.admin@gmail.com', @BCRYPT_HASH, 'Kieu Admin', 'ADMIN', 'admin', 1, 1, '2026-04-15 10:30:00', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kieu.admin@gmail.com');

-- Admin 2
INSERT INTO users (email, password_hash, full_name, role, user_type, is_verified, is_active, created_at, updated_at)
SELECT 'nam.tech@vietcommerce.vn', @BCRYPT_HASH, 'Nam Tech', 'ADMIN', 'admin', 1, 1, '2026-04-20 14:45:00', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nam.tech@vietcommerce.vn');

-- =============================================================
-- BƯỚC 2: Lấy user IDs
-- =============================================================

SET @SUPER_ADMIN_ID = (SELECT id FROM users WHERE email = 'admin@vietcommerce.com');
SET @ADMIN1_ID      = (SELECT id FROM users WHERE email = 'kieu.admin@gmail.com');
SET @ADMIN2_ID      = (SELECT id FROM users WHERE email = 'nam.tech@vietcommerce.vn');

-- =============================================================
-- BƯỚC 3: Cập nhật admin_role column trên users table
-- =============================================================

UPDATE users SET admin_role = 'SUPER_ADMIN' WHERE id = @SUPER_ADMIN_ID;
UPDATE users SET admin_role = 'ADMIN'       WHERE id = @ADMIN1_ID;
UPDATE users SET admin_role = 'ADMIN'       WHERE id = @ADMIN2_ID;

-- =============================================================
-- BƯỚC 4: Tạo admin_roles nếu chưa tồn tại
-- =============================================================

INSERT INTO admin_roles (user_id, role_name, created_by, created_at, is_active)
SELECT @SUPER_ADMIN_ID, 'SUPER_ADMIN', @SUPER_ADMIN_ID, '2026-01-05 08:00:00', TRUE
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE user_id = @SUPER_ADMIN_ID);

INSERT INTO admin_roles (user_id, role_name, created_by, created_at, is_active)
SELECT @ADMIN1_ID, 'ADMIN', @SUPER_ADMIN_ID, '2026-04-15 10:30:00', TRUE
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE user_id = @ADMIN1_ID);

INSERT INTO admin_roles (user_id, role_name, created_by, created_at, is_active)
SELECT @ADMIN2_ID, 'ADMIN', @SUPER_ADMIN_ID, '2026-04-20 14:45:00', TRUE
WHERE NOT EXISTS (SELECT 1 FROM admin_roles WHERE user_id = @ADMIN2_ID);

-- =============================================================
-- BƯỚC 5: Seed audit_logs (50 bản ghi như mock data)
-- =============================================================

-- Xóa seed cũ nếu có (chạy lại an toàn)
DELETE FROM audit_logs WHERE details->>'$.seed' = 'phase1_7';

INSERT INTO audit_logs (actor_id, actor_role, action, resource_type, resource_id, details, status, ip_address, created_at) VALUES
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'GRANT_ADMIN',      'ADMIN',   @ADMIN1_ID, JSON_OBJECT('seed','phase1_7','note','Cấp quyền Kieu Admin'),                 'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 25 DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'GRANT_ADMIN',      'ADMIN',   @ADMIN2_ID, JSON_OBJECT('seed','phase1_7','note','Cấp quyền Nam Tech'),                   'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 10 DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'UPDATE_SETTINGS',  'SYSTEM',  NULL,       JSON_OBJECT('seed','phase1_7','changes',JSON_OBJECT('site_name','VietCommerce Hub v2.0')), 'SUCCESS', '192.168.1.10', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'RESET_PASSWORD',   'USER',    @ADMIN1_ID, JSON_OBJECT('seed','phase1_7','note','Reset mật khẩu Kieu Admin'),             'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 101,        JSON_OBJECT('seed','phase1_7','note','Duyệt sản phẩm iPhone 15'),              'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(@ADMIN1_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 102,        JSON_OBJECT('seed','phase1_7','reason','Vi phạm chính sách cộng đồng'),        'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 21 DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 103,        JSON_OBJECT('seed','phase1_7','note','Duyệt sản phẩm Samsung S24'),            'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 19 DAY)),
(@ADMIN1_ID,      'ADMIN',       'BLOCK_SELLER',     'SHOP',    201,        JSON_OBJECT('seed','phase1_7','reason','Vi phạm chính sách cộng đồng'),        'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 18 DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 104,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 17 DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   301,        JSON_OBJECT('seed','phase1_7','amount',1500000),                               'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 16 DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 105,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 15 DAY)),
(@ADMIN2_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 106,        JSON_OBJECT('seed','phase1_7','reason','Ảnh không đúng quy cách'),             'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 14 DAY)),
(@ADMIN2_ID,      'ADMIN',       'BLOCK_USER',       'USER',    401,        JSON_OBJECT('seed','phase1_7','reason','Vi phạm chính sách cộng đồng'),        'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 13 DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   302,        JSON_OBJECT('seed','phase1_7','amount',2300000),                               'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 12 DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 107,        JSON_OBJECT('seed','phase1_7'),                                                 'FAILED',  '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 11 DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 108,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 10 DAY)),
(@ADMIN1_ID,      'ADMIN',       'DELETE_SELLER',    'SHOP',    202,        JSON_OBJECT('seed','phase1_7','reason','Shop vi phạm nhiều lần'),               'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 9  DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'REVOKE_ADMIN',     'ADMIN',   @ADMIN2_ID, JSON_OBJECT('seed','phase1_7','note','Thu hồi tạm thời để kiểm tra'),          'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 8  DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'GRANT_ADMIN',      'ADMIN',   @ADMIN2_ID, JSON_OBJECT('seed','phase1_7','note','Cấp lại quyền sau kiểm tra'),            'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 7  DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 109,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 7  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   303,        JSON_OBJECT('seed','phase1_7','amount',890000),                                'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 6  DAY)),
(@ADMIN1_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 110,        JSON_OBJECT('seed','phase1_7','reason','Hàng giả, hàng nhái'),                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 6  DAY)),
(@ADMIN2_ID,      'ADMIN',       'BLOCK_SELLER',     'SHOP',    203,        JSON_OBJECT('seed','phase1_7','reason','Lừa đảo khách hàng'),                  'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 5  DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 111,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 5  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 112,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 4  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   304,        JSON_OBJECT('seed','phase1_7','amount',3200000),                               'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 4  DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'UPDATE_SETTINGS',  'SYSTEM',  NULL,       JSON_OBJECT('seed','phase1_7','changes',JSON_OBJECT('maintenance_mode','false')), 'SUCCESS','192.168.1.10', DATE_SUB(NOW(), INTERVAL 3  DAY)),
(@ADMIN2_ID,      'ADMIN',       'BLOCK_USER',       'USER',    402,        JSON_OBJECT('seed','phase1_7','reason','Spam & lừa đảo'),                      'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 3  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 113,        JSON_OBJECT('seed','phase1_7'),                                                 'FAILED',  '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 2  DAY)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 114,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 2  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   305,        JSON_OBJECT('seed','phase1_7','amount',750000),                                'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 1  DAY)),
(@ADMIN2_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 115,        JSON_OBJECT('seed','phase1_7','reason','Mô tả sai sự thật'),                   'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 1  DAY)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'RESET_PASSWORD',   'USER',    @ADMIN2_ID, JSON_OBJECT('seed','phase1_7','note','Reset theo yêu cầu'),                    'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 1  DAY)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 116,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   306,        JSON_OBJECT('seed','phase1_7','amount',4500000),                               'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(@ADMIN1_ID,      'ADMIN',       'BLOCK_SELLER',     'SHOP',    204,        JSON_OBJECT('seed','phase1_7','reason','Bán hàng kém chất lượng liên tục'),     'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 8  HOUR)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 117,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 6  HOUR)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'UPDATE_SETTINGS',  'SYSTEM',  NULL,       JSON_OBJECT('seed','phase1_7','changes',JSON_OBJECT('fee_rate','0.05')),        'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 5  HOUR)),
(@ADMIN1_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 118,        JSON_OBJECT('seed','phase1_7','reason','Thiếu thông tin bắt buộc'),             'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 4  HOUR)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 119,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 3  HOUR)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   307,        JSON_OBJECT('seed','phase1_7','amount',1200000),                               'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 2  HOUR)),
(@ADMIN2_ID,      'ADMIN',       'BLOCK_USER',       'USER',    403,        JSON_OBJECT('seed','phase1_7','reason','Tài khoản nghi ngờ gian lận'),          'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 120,        JSON_OBJECT('seed','phase1_7'),                                                 'FAILED',  '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'GRANT_ADMIN',      'ADMIN',   @ADMIN1_ID, JSON_OBJECT('seed','phase1_7','note','Gia hạn quyền ADMIN'),                   'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 121,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PAYMENT',  'ORDER',   308,        JSON_OBJECT('seed','phase1_7','amount',980000),                                'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(@ADMIN2_ID,      'ADMIN',       'REJECT_PRODUCT',   'PRODUCT', 122,        JSON_OBJECT('seed','phase1_7','reason','Vi phạm bản quyền'),                   'SUCCESS', '192.168.1.55',  DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(@ADMIN1_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 123,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.22',  DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(@SUPER_ADMIN_ID, 'SUPER_ADMIN', 'UPDATE_SETTINGS',  'SYSTEM',  NULL,       JSON_OBJECT('seed','phase1_7','changes',JSON_OBJECT('banner','Mừng 30/4')),     'SUCCESS', '192.168.1.10',  DATE_SUB(NOW(), INTERVAL 5  MINUTE)),
(@ADMIN2_ID,      'ADMIN',       'APPROVE_PRODUCT',  'PRODUCT', 124,        JSON_OBJECT('seed','phase1_7'),                                                 'SUCCESS', '192.168.1.55',  NOW());

-- =============================================================
-- Kiểm tra kết quả
-- =============================================================
SELECT 'Users seeded:' AS info, COUNT(*) AS count FROM users WHERE email IN ('admin@vietcommerce.com','kieu.admin@gmail.com','nam.tech@vietcommerce.vn');
SELECT 'Admin roles:' AS info, COUNT(*) AS count FROM admin_roles WHERE user_id IN (@SUPER_ADMIN_ID, @ADMIN1_ID, @ADMIN2_ID);
SELECT 'Audit logs:' AS info, COUNT(*) AS count FROM audit_logs WHERE details->>'$.seed' = 'phase1_7';
