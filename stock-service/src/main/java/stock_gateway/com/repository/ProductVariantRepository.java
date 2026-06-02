package stock_gateway.com.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import stock_gateway.com.models.ProductVariant;



public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
	
	//Update stock quantity of a product variant
	@Query("UPDATE ProductVariant pv SET pv.stockQuantity = :stockQuantity WHERE pv.id = :id")
	@Modifying
	void updateStockQuantity( Long id,  int stockQuantity);
	
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT pv FROM ProductVariant pv WHERE pv.id = :id")
	Optional<ProductVariant> findByIdForUpdate(Long id);
}
