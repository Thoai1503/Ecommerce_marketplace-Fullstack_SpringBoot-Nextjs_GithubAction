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


    @PostMapping("/user")
    public ResponseEntity<Address> createUserAddress(@RequestBody Address address) {
        try {
            Address createdAddress = addressService.createUserAddress(address);
            if (createdAddress != null) {
                LOGGER.info("Created new address with ID: {} for user ID: {} with recipient name: {} and address line: {}", createdAddress.getAddressId(), createdAddress.getUserId(), createdAddress.getRecipientName(), createdAddress.getAddressLine());
                return ResponseEntity.ok(createdAddress);
            } else {
                LOGGER.warn("Failed to create address for user ID: {}. Invalid input data.", address.getUserId());
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            LOGGER.error("Error creating address for user ID: {}. Exception: {}", address.getUserId(), e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}