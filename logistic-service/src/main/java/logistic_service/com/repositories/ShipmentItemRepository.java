package logistic_service.com.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import logistic_service.com.entities.ShipmentItem;

public interface ShipmentItemRepository extends JpaRepository<ShipmentItem, Long> {
    
	List<ShipmentItem> findByShipmentId(Long shipmentId);
	
//	Optional<ShipmentItem> findByShipmentIdAndProductRefId(Long shipmentId, String productRefId);
	
	
//	List<ShipmentItem> findByProductRefId(String productRefId);
	
	
	
	List<ShipmentItem> findByProductNameContainingIgnoreCase(String productName);
	
	

//	List<ShipmentItem> findByShopRefId(@Param("shopRefId") String shopRefId);
}
