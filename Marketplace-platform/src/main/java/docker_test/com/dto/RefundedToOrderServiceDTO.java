package docker_test.com.dto;

public class RefundedToOrderServiceDTO {

	private String status;
	
   public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
   public RefundedToOrderServiceDTO() {
		super();
	}
   public RefundedToOrderServiceDTO(Double suggestedRefundAmount, RefundCalculationResultDTO refundCalculationResult) {
		super();
		this.suggestedRefundAmount = suggestedRefundAmount;
		this.refundCalculationResult = refundCalculationResult;
	}
   private Double suggestedRefundAmount;
   public Double getSuggestedRefundAmount() {
	return suggestedRefundAmount;
}
   public void setSuggestedRefundAmount(Double suggestedRefundAmount) {
	this.suggestedRefundAmount = suggestedRefundAmount;
   }
   private RefundCalculationResultDTO refundCalculationResult;
   
   public RefundCalculationResultDTO getRefundCalculationResult() {
	   return refundCalculationResult;
   }
   public void setRefundCalculationResult(RefundCalculationResultDTO refundCalculationResult) {
	   this.refundCalculationResult = refundCalculationResult;
   }
  
}
