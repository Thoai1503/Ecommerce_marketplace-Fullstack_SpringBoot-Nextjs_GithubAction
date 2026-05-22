package docker_test.com.dto;

import java.util.ArrayList;
import java.util.List;

public class RefundCalculationResultDTO {
    private Long returnRequestId;
    private Long orderId;
    public List<RefundCalculationShipmentDTO> getShipments() {
		return shipments;
	}

	public void setShipments(List<RefundCalculationShipmentDTO> shipments) {
		this.shipments = shipments;
	}

	private List<RefundCalculationShipmentDTO> shipments = new ArrayList<>();
    private Double currentPaidAmount;
    public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	private Double totalAmount;
    private Double recalculatedAmount;
    private Double alreadyRefundedAmount;
    private Double suggestedRefundAmount;
    private List<RefundCalculationItemDTO> items = new ArrayList<>();
 
	public Long getReturnRequestId() {
        return returnRequestId;
    }

    public void setReturnRequestId(Long returnRequestId) {
        this.returnRequestId = returnRequestId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Double getCurrentPaidAmount() {
        return currentPaidAmount;
    }

    public void setCurrentPaidAmount(Double currentPaidAmount) {
        this.currentPaidAmount = currentPaidAmount;
    }

    public Double getRecalculatedAmount() {
        return recalculatedAmount;
    }

    public void setRecalculatedAmount(Double recalculatedAmount) {
        this.recalculatedAmount = recalculatedAmount;
    }

    public Double getAlreadyRefundedAmount() {
        return alreadyRefundedAmount;
    }

    public void setAlreadyRefundedAmount(Double alreadyRefundedAmount) {
        this.alreadyRefundedAmount = alreadyRefundedAmount;
    }

    public Double getSuggestedRefundAmount() {
        return suggestedRefundAmount;
    }

    public void setSuggestedRefundAmount(Double suggestedRefundAmount) {
        this.suggestedRefundAmount = suggestedRefundAmount;
    }

    public List<RefundCalculationItemDTO> getItems() {
        return items;
    }

    public void setItems(List<RefundCalculationItemDTO> items) {
        this.items = items == null ? new ArrayList<>() : items;
    }
    
    
    public static class RefundCalculationShipmentDTO {
    	private Long id;
		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}
		private List<RefundCalculationItemDTO> items = new ArrayList<>();

		public List<RefundCalculationItemDTO> getItems() {
			return items;
		}

		public void setItems(List<RefundCalculationItemDTO> items) {
			this.items = items;
		}
		private int shipmentId;
		private Long shopId;
		private  Double subtotal;
		private Double totalAfterVoucher;
		
		   private boolean setEligibleVoucherForRefund;
		    
		   public boolean isEligibleVoucherForRefund() {
			   		        return this.setEligibleVoucherForRefund;
		    }

		    public void setEligibleVoucherForRefund(boolean setEligibleVoucherForRefund) {
		        this.setEligibleVoucherForRefund = setEligibleVoucherForRefund;
		   }

		
		public Double getTotalAfterVoucher() {
			return totalAfterVoucher;
		}
		
		public void setTotalAfterVoucher(Double totalAfterVoucher) {
			this.totalAfterVoucher = totalAfterVoucher;
		}
		
		public Double getSubtotal() {
			return subtotal;
		}
		
		public void setSubtotal(Double subtotal) {
			this.subtotal = subtotal;
		}
		
		public Long getShopId() {
			return shopId;
		}

		public void setShopId(Long shopId) {
			this.shopId = shopId;
		}

		private double unitPlatformVoucherDiscount;
		private double unitShopVoucherDiscount;
		public List<Long> getVoucherIds() {
			return voucherIds;
		}

		public void setVoucherIds(List<Long> voucherIds) {
			this.voucherIds = voucherIds;
		}

		private List<Long> voucherIds;

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
    }
}
