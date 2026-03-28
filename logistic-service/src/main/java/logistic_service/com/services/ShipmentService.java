package logistic_service.com.services;

import org.springframework.stereotype.Service;

import logistic_service.com.entities.Shipment;
import logistic_service.com.repositories.ShipmentRepository;

@Service
public class ShipmentService {
    private ShipmentRepository shipmentRepository;
    	
	public ShipmentService(ShipmentRepository shipmentRepository) {
		this.shipmentRepository = shipmentRepository;
	}
    
	public Shipment createShipment(Shipment shipment) {
		
		// Logic to save the shipment to the database
	return	shipmentRepository.save(shipment);
	}
}
