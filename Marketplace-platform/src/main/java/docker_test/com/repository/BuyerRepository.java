package docker_test.com.repository;

import java.sql.*;
import java.util.List;
import java.util.Collections;

import docker_test.com.models.PageResult;
import docker_test.com.models.User;

/**
 * BUYER REPOSITORY — OPTIMIZED
 *
 * Thay đổi so với bản gốc:
 *
 * 1. GetAllBuyers() → GetAllBuyersKeyset()
 *    - Bỏ OFFSET sâu (OFFSET 45000), thay bằng keyset pagination (created_at, id).
 *    - Gọi lần đầu: lastCreatedAt = null, lastId = null → lấy trang đầu.
 *    - Gọi lần sau: truyền vào created_at + id của record cuối trang trước.
 *
 * 2. Filter() — 2-phase query
 *    - Phase 1: lấy tập id của trang hiện tại (chỉ quét bảng user).
 *    - Phase 2: aggregate orders chỉ trên tập id đó (IN clause, tối đa pageSize phần tử).
 *    - Không còn GROUP BY toàn bảng orders mỗi request.
 *
 * 3. Index cần thêm vào schema (xem cuối file):
 *    - user(user_type, created_at, id)  → hỗ trợ keyset + filter
 *    - orders(user_id, final_amount)    → hỗ trợ SUM/COUNT/MAX theo user_id
 *
 * 4. Ghi chú schema:
 *    - user.user_type là enum('buyer','seller','both','admin'), KHÔNG có 'shipper'.
 *      TYPE_CLAUSE đang lọc 'shipper' sẽ không match row nào — xem lại domain logic.
 *    - user không có cột `note`; UpdateNote() sẽ fail runtime. Cần ALTER TABLE thêm cột.
 */
public class BuyerRepository extends UserRepository {

    private static BuyerRepository instance;

    // ⚠️  'shipper' không tồn tại trong enum của schema hiện tại.
    //     Nếu đúng spec chỉ cần 'buyer', đổi lại thành "u.user_type = 'buyer'".
    private static final String TYPE_CLAUSE         = "user_type IN ('buyer', 'shipper')";
    private static final String ALIASED_TYPE_CLAUSE = "u.user_type IN ('buyer', 'shipper')";
    private static final String CUSTOMER_STATS_JOIN = """
            LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS total_orders,
                    COALESCE(SUM(final_amount), 0) AS total_spent,
                    MAX(created_at) AS last_order_date
                FROM `orders`
                GROUP BY user_id
            ) order_stats ON order_stats.user_id = u.id
            """;
    
    
    private BuyerRepository() { super(); }

    public static BuyerRepository Instance() {
        if (instance == null) {
            instance = new BuyerRepository();
        }
        return instance;
    }

    // =========================================================================
    // GET ALL BUYERS — Keyset pagination
    // Thay thế GetAllBuyers() cũ dùng OFFSET sâu.
    //
    // Cách dùng:
    //   Trang đầu : GetAllBuyersKeyset(null, null, 20)
    //   Trang tiếp: GetAllBuyersKeyset(lastUser.getCreatedAt(), lastUser.getId(), 20)
    //
    // Yêu cầu index: CREATE INDEX idx_user_type_created_id
    //                ON `user`(user_type, created_at DESC, id DESC);
    // =========================================================================

    
    public List<User> GetAllBuyers() {

        String sql = """
                SELECT
                u.*,
                    COALESCE(order_stats.total_orders, 0) AS total_orders,
                    COALESCE(order_stats.total_spent, 0) AS total_spent,
                    order_stats.last_order_date
                FROM `user` u
                """ + CUSTOMER_STATS_JOIN +
                "WHERE " + ALIASED_TYPE_CLAUSE + " ORDER BY u.created_at DESC LIMIT 20 OFFSET 45000";

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            return mapper.RowsMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of();
    }
    
    
    public List<User> GetAllBuyersKeyset(Timestamp lastCreatedAt, Long lastId, int pageSize) {

        String sql;
        if (lastCreatedAt == null || lastId == null) {
            // Trang đầu — không cần điều kiện keyset
            sql = """
                    SELECT u.*,
                           COALESCE(os.total_orders, 0)  AS total_orders,
                           COALESCE(os.total_spent,  0)  AS total_spent,
                           os.last_order_date
                    FROM `user` u
                    LEFT JOIN (
                        SELECT user_id,
                               COUNT(*)              AS total_orders,
                               SUM(final_amount)     AS total_spent,
                               MAX(created_at)       AS last_order_date
                        FROM `orders`
                        WHERE user_id IN (
                            SELECT id FROM (
                                SELECT id FROM `user`
                                WHERE user_type IN ('buyer', 'shipper')
                                ORDER BY created_at DESC, id DESC
                                LIMIT ?
                            ) _page
                        )
                        GROUP BY user_id
                    ) os ON os.user_id = u.id
                    """ +
                    "WHERE " + ALIASED_TYPE_CLAUSE + "\n" +
                    "ORDER BY u.created_at DESC, u.id DESC\n" +
                    "LIMIT ?";
        } else {
            // Trang tiếp — dùng mốc (created_at, id) của record cuối trang trước
            sql = """
                    SELECT u.*,
                           COALESCE(os.total_orders, 0)  AS total_orders,
                           COALESCE(os.total_spent,  0)  AS total_spent,
                           os.last_order_date
                    FROM `user` u
                    LEFT JOIN (
                        SELECT user_id,
                               COUNT(*)              AS total_orders,
                               SUM(final_amount)     AS total_spent,
                               MAX(created_at)       AS last_order_date
                        FROM `orders`
                        WHERE user_id IN (
                            SELECT id FROM (
                                SELECT id FROM `user`
                                WHERE user_type IN ('buyer', 'shipper')
                                  AND (created_at < ? OR (created_at = ? AND id < ?))
                                ORDER BY created_at DESC, id DESC
                                LIMIT ?
                            ) _page
                        )
                        GROUP BY user_id
                    ) os ON os.user_id = u.id
                    """ +
                    "WHERE " + ALIASED_TYPE_CLAUSE + "\n" +
                    "  AND (u.created_at < ? OR (u.created_at = ? AND u.id < ?))\n" +
                    "ORDER BY u.created_at DESC, u.id DESC\n" +
                    "LIMIT ?";
        }

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            if (lastCreatedAt == null || lastId == null) {
                ps.setInt(1, pageSize);   // subquery LIMIT
                ps.setInt(2, pageSize);   // outer LIMIT
            } else {
                // subquery params
                ps.setTimestamp(1, lastCreatedAt);
                ps.setTimestamp(2, lastCreatedAt);
                ps.setLong(3,       lastId);
                ps.setInt(4,        pageSize);
                // outer WHERE params
                ps.setTimestamp(5, lastCreatedAt);
                ps.setTimestamp(6, lastCreatedAt);
                ps.setLong(7,       lastId);
                ps.setInt(8,        pageSize);
            }

            ResultSet rs = ps.executeQuery();
            return mapper.RowsMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of();
    }

    // =========================================================================
    // GET BUYER BY ID
    // Không thay đổi logic, giữ nguyên — query đã dùng primary key lookup.
    // =========================================================================

    public User GetBuyerById(int id) {

        String sql = """
                SELECT
                    u.*,
                    COALESCE(os.total_orders, 0) AS total_orders,
                    COALESCE(os.total_spent,  0) AS total_spent,
                    os.last_order_date
                FROM `user` u
                LEFT JOIN (
                    SELECT user_id,
                           COUNT(*)          AS total_orders,
                           SUM(final_amount) AS total_spent,
                           MAX(created_at)   AS last_order_date
                    FROM `orders`
                    WHERE user_id = ?
                    GROUP BY user_id
                ) os ON os.user_id = u.id
                WHERE u.id = ? AND """ + ALIASED_TYPE_CLAUSE;

        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setLong(1, id); // subquery
            ps.setLong(2, id); // outer WHERE
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapper.RowMap(rs);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // =========================================================================
    // AGGREGATE STATS FOR 1 BUYER — không đổi, đã dùng idx_user_id
    // =========================================================================

    public int GetTotalOrdersById(int buyerId) {
        String sql = "SELECT COUNT(*) FROM `orders` WHERE user_id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (Exception e) { e.printStackTrace(); }
        return 0;
    }

    public double GetTotalSpentById(int buyerId) {
        String sql = "SELECT COALESCE(SUM(final_amount), 0) FROM `orders` WHERE user_id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble(1);
        } catch (Exception e) { e.printStackTrace(); }
        return 0;
    }

    public double GetAvgOrderValueById(int buyerId) {
        String sql = "SELECT COALESCE(AVG(final_amount), 0) FROM `orders` WHERE user_id = ?";
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, buyerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble(1);
        } catch (Exception e) { e.printStackTrace(); }
        return 0;
    }

    // =========================================================================
    // UPDATE NOTE
    // ⚠️  Cột `note` chưa có trong schema. Cần chạy migration trước:
    //     ALTER TABLE `user` ADD COLUMN `note` TEXT NULL AFTER `last_login`;
    // =========================================================================

    public boolean UpdateNote(int id, String note) {
        String sql = "UPDATE `user` SET note = ?, updated_at = ? WHERE id = ? AND " + TYPE_CLAUSE;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1,    note);
            ps.setTimestamp(2, Timestamp.valueOf(java.time.LocalDateTime.now()));
            ps.setInt(3,       id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) { e.printStackTrace(); }
        return false;
    }

    // =========================================================================
    // FILTER BUYERS — 2-phase query
    //
    // Phase 1: lấy tập id user của trang hiện tại (chỉ đụng bảng user).
    // Phase 2: aggregate orders chỉ trên tập id đó.
    //
    // Lợi ích: GROUP BY orders không còn quét toàn bảng, chỉ quét theo
    // tập id ≤ pageSize — giảm mạnh IO và CPU khi bảng orders lớn.
    //
    // Yêu cầu index:
    //   user  : idx_user_type_created_id  ON `user`(user_type, created_at DESC, id DESC)
    //   orders: idx_orders_user_stats     ON `orders`(user_id, final_amount, created_at)
    // =========================================================================

    public PageResult<User> Filter(String keyword, Integer isActive, int page, int pageSize) {

        // --- Xây WHERE clause ---
        StringBuilder where = new StringBuilder("WHERE ").append(ALIASED_TYPE_CLAUSE);
        boolean hasKeyword  = keyword != null && !keyword.isBlank();
        String  likeKw      = hasKeyword ? "%" + keyword.trim() + "%" : null;

        if (hasKeyword) {
            where.append(" AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
        }
        if (isActive != null) {
            where.append(" AND u.is_active = ?");
        }

        // --- Phase 1a: đếm tổng ---
        String sqlCount = "SELECT COUNT(*) FROM `user` u " + where;

        // --- Phase 1b: lấy id trang hiện tại ---
        String sqlIds = "SELECT u.id FROM `user` u " + where
                + " ORDER BY u.created_at DESC, u.id DESC LIMIT ? OFFSET ?";

        try (Connection con      = dbConnection.getConn();
             PreparedStatement psCount = con.prepareStatement(sqlCount);
             PreparedStatement psIds   = con.prepareStatement(sqlIds)) {

            int idx = 1;
            if (hasKeyword) {
                psCount.setString(idx, likeKw); psCount.setString(idx+1, likeKw); psCount.setString(idx+2, likeKw);
                psIds.setString(idx, likeKw);   psIds.setString(idx+1, likeKw);   psIds.setString(idx+2, likeKw);
                idx += 3;
            }
            if (isActive != null) {
                psCount.setInt(idx, isActive);
                psIds.setInt(idx, isActive);
                idx++;
            }
            psIds.setInt(idx,   pageSize);
            psIds.setInt(idx+1, (page - 1) * pageSize);

            ResultSet rsCount = psCount.executeQuery();
            if (!rsCount.next()) return new PageResult<>(List.of(), 0, page, pageSize);
            int totalRecords = rsCount.getInt(1);
            if (totalRecords == 0) return new PageResult<>(List.of(), 0, page, pageSize);

            // Thu thập id của trang
            ResultSet rsIds = psIds.executeQuery();
            List<Long> ids  = new java.util.ArrayList<>();
            while (rsIds.next()) ids.add(rsIds.getLong(1));
            if (ids.isEmpty()) return new PageResult<>(List.of(), totalRecords, page, pageSize);

            // --- Phase 2: lấy user + stats chỉ cho tập id trên ---
            String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));

            String sqlData = """
                    SELECT u.*,
                           COALESCE(os.total_orders, 0) AS total_orders,
                           COALESCE(os.total_spent,  0) AS total_spent,
                           os.last_order_date
                    FROM `user` u
                    LEFT JOIN (
                        SELECT user_id,
                               COUNT(*)          AS total_orders,
                               SUM(final_amount) AS total_spent,
                               MAX(created_at)   AS last_order_date
                        FROM `orders`
                        WHERE user_id IN (""" + placeholders + """
                        )
                        GROUP BY user_id
                    ) os ON os.user_id = u.id
                    WHERE u.id IN (""" + placeholders + """
                    )
                    ORDER BY u.created_at DESC, u.id DESC
                    """;

            try (PreparedStatement psData = con.prepareStatement(sqlData)) {
                // Bind ids hai lần: một cho subquery orders, một cho outer WHERE
                for (int i = 0; i < ids.size(); i++) {
                    psData.setLong(i + 1,             ids.get(i));
                    psData.setLong(i + 1 + ids.size(), ids.get(i));
                }
                ResultSet rsData  = psData.executeQuery();
                List<User> users  = mapper.RowsMap(rsData);
                return new PageResult<>(users, totalRecords, page, pageSize);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return new PageResult<>(List.of(), 0, page, pageSize);
    }

    // =========================================================================
    // SET ACTIVE STATUS — không đổi
    // =========================================================================

    public boolean setActiveStatus(int id, int isActive) {
        String sql = "UPDATE `user` SET is_active = ? WHERE id = ? AND " + TYPE_CLAUSE;
        try (Connection con = dbConnection.getConn();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, isActive);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) { e.printStackTrace(); }
        return false;
    }
}


/*
 * =============================================================================
 * MIGRATION — chạy một lần trên DB
 * =============================================================================
 *
 * -- 1. Composite index cho bảng user: hỗ trợ filter theo type + sắp xếp
 * CREATE INDEX idx_user_type_created_id
 *     ON `user`(user_type, created_at DESC, id DESC);
 *
 * -- 2. Covering index cho bảng orders: hỗ trợ GROUP BY user_id kèm SUM/COUNT/MAX
 * CREATE INDEX idx_orders_user_stats
 *     ON `orders`(user_id, final_amount, created_at);
 *
 * -- 3. Cột note nếu cần dùng UpdateNote()
 * ALTER TABLE `user`
 *     ADD COLUMN `note` TEXT NULL AFTER `last_login`;
 *
 * =============================================================================
 */
