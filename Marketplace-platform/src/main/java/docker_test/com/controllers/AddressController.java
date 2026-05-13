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
	private static final Logger LOGGER = LoggerFactory.getLogger(AddressController.class);

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable long userId) {
		List<Address> addresses = addressService.getAddressesByUserId(userId);

		addresses.forEach(address -> LOGGER.info("Retrieved address: {}",
				address.getAddressId() + " for user ID: " + userId + " with recipient name: "
						+ address.getRecipientName() + " and address line: " + address.getAddressLine() + "is default: "
						+ address.getIsDefault()));

		return ResponseEntity.ok(addresses);
	}

	@GetMapping("/shop/{shopId}")
	public ResponseEntity<Address> getAddressByShopId(@PathVariable long shopId) {
		Address address = addressService.getAddressByShopId(shopId);

		if (address != null) {
			LOGGER.info("Retrieved address for shop ID: {} with recipient name: {} and address line: {}", shopId,
					address.getRecipientName(), address.getAddressLine());
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
				LOGGER.info(
						"Created new address with ID: {} for user ID: {} with recipient name: {} and address line: {}",
						createdAddress.getAddressId(), createdAddress.getUserId(), createdAddress.getRecipientName(),
						createdAddress.getAddressLine());
				return ResponseEntity.ok(createdAddress);
			} else {
				LOGGER.warn("Failed to create address for user ID: {}. Invalid input data.", address.getUserId());
				return ResponseEntity.badRequest().build();
			}
		} catch (Exception e) {
			e.printStackTrace();
			LOGGER.error("Error creating address", e);
			return ResponseEntity.status(500).body(null);
		}
	}

	@PostMapping("/shop")
	public ResponseEntity<?> createShopAddress(@RequestBody Address address) {
		try {
			if (address.getShop_id() == null || address.getShop_id() <= 0) {
				return ResponseEntity.badRequest().body("shop_id is required");
			}

			Address existingAddress = addressService.getAddressByShopId(address.getShop_id());
			if (existingAddress != null) {
				LOGGER.info("Shop address already exists for shop ID: {}, returning existing address", address.getShop_id());
				return ResponseEntity.ok(existingAddress);
			}

			Address createdAddress = addressService.createShopAddress(address);

			if (createdAddress != null) {
				LOGGER.info("Created shop address for shop ID: {} with recipient: {}", address.getShop_id(),
						address.getRecipientName());
				return ResponseEntity.ok(createdAddress);
			}

			return ResponseEntity.badRequest().body("Create address failed");

		} catch (Exception e) {
			e.printStackTrace();
			LOGGER.error("Error creating shop address", e);
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}
}
