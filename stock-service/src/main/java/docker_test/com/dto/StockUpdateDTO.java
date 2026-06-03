package docker_test.com.dto;

public class StockUpdateDTO {
    private Long variantId;
    private int quantity;
    
    public Long getVariantId() {
		return variantId;
	}
    
    	public void setVariantId(Long variantId) {
		this.variantId = variantId;
	}
    	
    		public int getQuantity() {
		return quantity;
	}
	
		public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
}
