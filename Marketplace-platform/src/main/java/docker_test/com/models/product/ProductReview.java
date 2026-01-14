package docker_test.com.models.product;

import java.time.LocalDateTime;

public final class ProductReview {
    private long review_id;
    private long product_id;
    private long user_id;
    private long order_id;
    private int rating;
    private String comment;
    private int is_anonymous;
    private String shop_reply;
    private LocalDateTime shop_replied_at;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public ProductReview() {
        this.is_anonymous = 0;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    public ProductReview(long review_id, long product_id, long user_id, long order_id, 
                        int rating, String comment, int is_anonymous, String shop_reply,
                        LocalDateTime shop_replied_at, LocalDateTime created_at,
                        LocalDateTime updated_at) {
        this.review_id = review_id;
        this.product_id = product_id;
        this.user_id = user_id;
        this.order_id = order_id;
        this.rating = rating;
        this.comment = comment;
        this.is_anonymous = is_anonymous;
        this.shop_reply = shop_reply;
        this.shop_replied_at = shop_replied_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    public long getReviewId() {
        return review_id;
    }

    public void setReviewId(long review_id) {
        this.review_id = review_id;
    }

    public long getProductId() {
        return product_id;
    }

    public void setProductId(long product_id) {
        this.product_id = product_id;
    }

    public long getUserId() {
        return user_id;
    }

    public void setUserId(long user_id) {
        this.user_id = user_id;
    }

    public long getOrderId() {
        return order_id;
    }

    public void setOrderId(long order_id) {
        this.order_id = order_id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int isAnonymous() {
        return is_anonymous;
    }

    public void setAnonymous(int is_anonymous) {
        this.is_anonymous = is_anonymous;
    }

    public String getShopReply() {
        return shop_reply;
    }

    public void setShopReply(String shop_reply) {
        this.shop_reply = shop_reply;
    }

    public LocalDateTime getShopRepliedAt() {
        return shop_replied_at;
    }

    public void setShopRepliedAt(LocalDateTime shop_replied_at) {
        this.shop_replied_at = shop_replied_at;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdatedAt() {
        return updated_at;
    }

    public void setUpdatedAt(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }
}