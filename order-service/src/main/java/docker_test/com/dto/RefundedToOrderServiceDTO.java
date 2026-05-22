package docker_test.com.dto;


public class RefundedToOrderServiceDTO {
   public RefundedToOrderServiceDTO() {
		super();
	}
   public RefundedToOrderServiceDTO(Double suggestedRefundAmount, RefundCalculationResultDTO refundCalculationResult, String status) {
		super();
		this.suggestedRefundAmount = suggestedRefundAmount;
		this.refundCalculationResult = refundCalculationResult;
		this.status = status;
	}
	private String status;
	
	   public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
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
