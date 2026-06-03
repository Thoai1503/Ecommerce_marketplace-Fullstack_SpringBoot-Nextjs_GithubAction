package stock_gateway.com.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import stock_gateway.com.models.ProductVariant;
import stock_gateway.com.repository.ProductVariantRepository;

@Service
public class StockService {
         private final ProductVariantRepository productVariantRepository;
         private static final Logger LOGGER = LoggerFactory.getLogger(StockService.class);
         public StockService(ProductVariantRepository productVariantRepository) {
        	 this.productVariantRepository = productVariantRepository;
         }
         
         
         public void updateStockQuantity(Long variantId, int quantity) {
			 //Fetch the current stock quantity of the product variant
        	 			// int currentStock = productVariantRepository.findById(variantId).getStockQuantity();
         }
         
         @Transactional( isolation =Isolation.REPEATABLE_READ)
         public void reverseStockUpdate(Long variantId, int quantity) {
			 //Fetch the current stock quantity of the product variant
			 			// int currentStock = productVariantRepository.findById(variantId).
        	 ProductVariant variant = productVariantRepository.findByIdForUpdate(variantId).orElseThrow(() -> new RuntimeException("Variant not found for stock update. variantId=" + variantId));
        	 LOGGER.info("Reversing stock update. variantId={}, quantityToReverse={}, currentStock={}", variantId, quantity, variant.getStockQuantity());
        	 if (variant.getStockQuantity() + quantity < 0) {
				 throw new RuntimeException("Cannot reverse stock update because it would result in negative stock. variantId=" + variantId + ", currentStock=" + variant.getStockQuantity() + ", quantityToReverse=" + quantity);
			 }
        	 
			 variant.setStockQuantity(variant.getStockQuantity() - quantity);
			// productVariantRepository.save(variant);
			 LOGGER.info("Saved stock update reversal ={}", productVariantRepository.save(variant));
         }
}
