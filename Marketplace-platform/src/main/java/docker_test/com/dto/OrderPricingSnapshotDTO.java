package docker_test.com.dto;

import java.util.ArrayList;
import java.util.List;

public class OrderPricingSnapshotDTO {
    private Long id;
    private Double finalAmount;
    public List<OrderShipmentSnapshotDTO> getShipments() {
		return shipments;
	}

	public void setShipments(List<OrderShipmentSnapshotDTO> shipments) {
		this.shipments = shipments;
	}


	private List<OrderShipmentSnapshotDTO> shipments = new ArrayList<>();
    private Double totalAmount;
    public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}


	private List<OrderItemSnapshotDTO> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(Double finalAmount) {
        this.finalAmount = finalAmount;
    }

    public List<OrderItemSnapshotDTO> getItems() {
        return items;
    }
    
    
    public void setItems(List<OrderItemSnapshotDTO> items) {
        this.items = items == null ? new ArrayList<>() : items;
    }
}
