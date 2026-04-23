package stock_gateway.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import stock_gateway.com.models.ProductVariant;



public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
	
	//Update stock quantity of a product variant
	@Query("UPDATE ProductVariant pv SET pv.stockQuantity = :stockQuantity WHERE pv.id = :id")
	@Modifying
	void updateStockQuantity( Long id,  int stockQuantity);
}
