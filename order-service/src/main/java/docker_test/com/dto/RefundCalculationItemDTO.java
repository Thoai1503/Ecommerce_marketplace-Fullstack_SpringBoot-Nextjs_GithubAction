package docker_test.com.dto;

import java.util.List;

public class RefundCalculationItemDTO {
    private Long orderItemId;
    private int originalQuantity;
    public List<Long> getVoucherIds() {
		return voucherIds;
	}

	public void setVoucherIds(List<Long> voucherIds) {
		this.voucherIds = voucherIds;
	}

	private List<Long> voucherIds;
    public Double getPrice() {
		return price;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	private Double price;
    
    private int approvedReturnedQuantity;
    private int currentReturnQuantity;
    public int getShipmentId() {
		return shipmentId;
	}

	public void setShipmentId(int shipmentId) {
		this.shipmentId = shipmentId;
	}

	public double getUnitPlatformVoucherDiscount() {
		return unitPlatformVoucherDiscount;
	}

	public void setUnitPlatformVoucherDiscount(double unitPlatformVoucherDiscount) {
		this.unitPlatformVoucherDiscount = unitPlatformVoucherDiscount;
	}

	public double getUnitShopVoucherDiscount() {
		return unitShopVoucherDiscount;
	}

	public void setUnitShopVoucherDiscount(double unitShopVoucherDiscount) {
		this.unitShopVoucherDiscount = unitShopVoucherDiscount;
	}

	private int shipmentId;
    private double unitPlatformVoucherDiscount;
    private double unitShopVoucherDiscount;
    private int effectiveQuantity;
    private double paidPerUnit;
    private double effectiveAmount;

    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }

    public int getOriginalQuantity() {
        return originalQuantity;
    }

    public void setOriginalQuantity(int originalQuantity) {
        this.originalQuantity = originalQuantity;
    }

    public int getApprovedReturnedQuantity() {
        return approvedReturnedQuantity;
    }

    public void setApprovedReturnedQuantity(int approvedReturnedQuantity) {
        this.approvedReturnedQuantity = approvedReturnedQuantity;
    }

    public int getCurrentReturnQuantity() {
        return currentReturnQuantity;
    }

    public void setCurrentReturnQuantity(int currentReturnQuantity) {
        this.currentReturnQuantity = currentReturnQuantity;
    }

    public int getEffectiveQuantity() {
        return effectiveQuantity;
    }

    public void setEffectiveQuantity(int effectiveQuantity) {
        this.effectiveQuantity = effectiveQuantity;
    }

    public double getPaidPerUnit() {
        return paidPerUnit;
    }

    public void setPaidPerUnit(double paidPerUnit) {
        this.paidPerUnit = paidPerUnit;
    }

    public double getEffectiveAmount() {
        return effectiveAmount;
    }

    public void setEffectiveAmount(double effectiveAmount) {
        this.effectiveAmount = effectiveAmount;
    }
}
