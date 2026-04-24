package docker_test.com.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_item")
public final class OrderItem {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long orderItemId;
	
    private long orderId;
    private long productId;
    private Long variantId;
    private String productName;
    private String variantName;
    private Double price;
    private int quantity;
    private Double totalPrice;
    private LocalDateTime createdAt;

    public OrderItem() {
        this.createdAt = LocalDateTime.now();
    }

    public OrderItem(long orderItemId, long orderId, long productId, Long variantId,
                     String productName, String variantName, Double price, int quantity,
                     Double totalPrice, LocalDateTime createdAt) {
        this.orderItemId = orderItemId;
        this.orderId = orderId;
        this.productId = productId;
        this.variantId = variantId;
        this.productName = productName;
        this.variantName = variantName;
        this.price = price;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt;
    }

    public long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(long orderItemId) { this.orderItemId = orderItemId; }
    public long getOrderId() { return orderId; }
    public void setOrderId(long orderId) { this.orderId = orderId; }
    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }
    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}