package docker_test.com.models;

import java.time.LocalDateTime;

public final class FlashSale {
    private long flashSaleId;
    private long productId;
    private Double salePrice;
    private int stockQuantity;
    private int soldQuantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int isActive;
    private LocalDateTime createdAt;

    public FlashSale() {
        this.soldQuantity = 0;
        this.isActive = 1;
        this.createdAt = LocalDateTime.now();
    }

    public FlashSale(long flashSaleId, long productId, Double salePrice, int stockQuantity,
                     int soldQuantity, LocalDateTime startTime, LocalDateTime endTime,
                     int isActive, LocalDateTime createdAt) {
        this.flashSaleId = flashSaleId;
        this.productId = productId;
        this.salePrice = salePrice;
        this.stockQuantity = stockQuantity;
        this.soldQuantity = soldQuantity;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public long getFlashSaleId() { return flashSaleId; }
    public void setFlashSaleId(long flashSaleId) { this.flashSaleId = flashSaleId; }
    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }
    public Double getSalePrice() { return salePrice; }
    public void setSalePrice(Double salePrice) { this.salePrice = salePrice; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public int getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(int soldQuantity) { this.soldQuantity = soldQuantity; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public int isActive() { return isActive; }
    public void setActive(int active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}