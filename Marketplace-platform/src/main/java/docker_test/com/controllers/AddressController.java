package docker_test.com.controllers;

import docker_test.com.models.Address;
import docker_test.com.services.AddressService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/addresses")
public class AddressController {
    private final AddressService addressService = new AddressService();
    private static final Logger  LOGGER = LoggerFactory.getLogger(AddressController.class);
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable long userId) {
        List<Address> addresses = addressService.getAddressesByUserId(userId);
        
        addresses.forEach(address -> LOGGER.info("Retrieved address: {}", address.getAddressId() + " for user ID: " + userId + " with recipient name: " + address.getRecipientName() + " and address line: " + address.getAddressLine() + "is default: " + address.getIsDefault()));
        
        return ResponseEntity.ok(addresses);
    }
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<Address> getAddressByShopId(@PathVariable long shopId) {
		Address address = addressService.getAddressByShopId(shopId);
		
		if (address != null) {
			LOGGER.info("Retrieved address for shop ID: {} with recipient name: {} and address line: {}", shopId, address.getRecipientName(), address.getAddressLine());
			return ResponseEntity.ok(address);
		} else {
			LOGGER.warn("No address found for shop ID: {}", shopId);
			return ResponseEntity.notFound().build();
		}
	}
}
