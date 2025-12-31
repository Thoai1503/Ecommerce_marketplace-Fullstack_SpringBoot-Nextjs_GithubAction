package docker_test.com.mappers.product;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashSet;

import docker_test.com.mappers.IMapper;
import docker_test.com.models.product.ProductReview;
import docker_test.com.utils.StringValue;

public final class ProductReviewMapper implements IMapper<ProductReview> {

    @Override
    public ProductReview RowMap(ResultSet rs) {
        ProductReview review = new ProductReview();
        try {
            review.setReviewId(rs.getLong(StringValue.REVIEW_ID_COL));
            review.setProductId(rs.getLong(StringValue.REVIEW_PRODUCT_ID_COL));
            review.setUserId(rs.getLong(StringValue.REVIEW_USER_ID_COL));
            review.setOrderId(rs.getLong(StringValue.REVIEW_ORDER_ID_COL));
            review.setRating(rs.getInt(StringValue.REVIEW_RATING_COL));
            review.setComment(rs.getString(StringValue.REVIEW_COMMENT_COL));
            review.setAnonymous(rs.getInt(StringValue.REVIEW_ANONYMOUS_COL));
            review.setShopReply(rs.getString(StringValue.REVIEW_SHOP_REPLY_COL));

            Timestamp repliedAt = rs.getTimestamp(StringValue.REVIEW_SHOP_REPLIED_AT_COL);
            if (repliedAt != null) review.setShopRepliedAt(repliedAt.toLocalDateTime());

            Timestamp createdAt = rs.getTimestamp(StringValue.REVIEW_CREATED_AT_COL);
            if (createdAt != null) review.setCreatedAt(createdAt.toLocalDateTime());

            Timestamp updatedAt = rs.getTimestamp(StringValue.REVIEW_UPDATED_AT_COL);
            if (updatedAt != null) review.setUpdatedAt(updatedAt.toLocalDateTime());

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return review;
    }

    @Override
    public HashSet<ProductReview> RowsMap(ResultSet rs) {
        HashSet<ProductReview> list = new HashSet<>();
        try {
            while (rs.next()) list.add(RowMap(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}