package stock_gateway.com.service;

import org.springframework.stereotype.Service;

import stock_gateway.com.repository.ProductVariantRepository;

@Service
public class StockService {
         private final ProductVariantRepository productVariantRepository;
         
         public StockService(ProductVariantRepository productVariantRepository) {
        	 this.productVariantRepository = productVariantRepository;
         }
         
         
         public void updateStockQuantity(Long variantId, int quantity) {
			 //Fetch the current stock quantity of the product variant
        	 			// int currentStock = productVariantRepository.findById(variantId).getStockQuantity();
         }
         
}
