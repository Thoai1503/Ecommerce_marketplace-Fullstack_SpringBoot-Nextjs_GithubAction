package docker_test.com.dto;

public class RefundedToOrderServiceDTO {
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
