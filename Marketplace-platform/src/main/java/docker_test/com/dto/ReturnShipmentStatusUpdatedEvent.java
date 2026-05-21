package docker_test.com.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ReturnShipmentStatusUpdatedEvent {
	  @JsonProperty("tracking_code")
	    @JsonAlias({"trackingCode"})
	    private String trackingCode;
	    
	  private Long shipmentId;
	  
	  

	    public Long getShipmentId() {
		return shipmentId;
	}

	  public void setShipmentId(Long shipmentId) {
		  this.shipmentId = shipmentId;
	  }

		private String status;

	    public String getTrackingCode() {
	        return trackingCode;
	    }

	    public void setTrackingCode(String trackingCode) {
	        this.trackingCode = trackingCode;
	    }

	    public String getStatus() {
	        return status;
	    }

	    public void setStatus(String status) {
	        this.status = status;
	    }
}
