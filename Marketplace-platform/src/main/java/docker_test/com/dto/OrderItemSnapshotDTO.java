package docker_test.com.dto;

import java.util.List;

public class OrderItemSnapshotDTO {
    private Long id;
    private Integer quantity;
    private Double price;
    public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	private Double totalAfterAllVouchers;
    public List<Long> getVoucherIds() {
		return voucherIds;
	}

	public void setVoucherIds(List<Long> voucherIds) {
		this.voucherIds = voucherIds;
	}

	private List<Long> voucherIds;
    
    private Double unitShopVoucherDiscount;
    private Double unitPlatformVoucherDiscount;
    public int getShipmentId() {
		return shipmentId;
	}

	public void setShipmentId(int shipmentId) {
		this.shipmentId = shipmentId;
	}

	private int shipmentId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalAfterAllVouchers() {
        return totalAfterAllVouchers;
    }

    public void setTotalAfterAllVouchers(Double totalAfterAllVouchers) {
        this.totalAfterAllVouchers = totalAfterAllVouchers;
    }

    public Double getUnitShopVoucherDiscount() {
        return unitShopVoucherDiscount;
    }

    public void setUnitShopVoucherDiscount(Double unitShopVoucherDiscount) {
        this.unitShopVoucherDiscount = unitShopVoucherDiscount;
    }

    public Double getUnitPlatformVoucherDiscount() {
        return unitPlatformVoucherDiscount;
    }

    public void setUnitPlatformVoucherDiscount(Double unitPlatformVoucherDiscount) {
        this.unitPlatformVoucherDiscount = unitPlatformVoucherDiscount;
    }
}
