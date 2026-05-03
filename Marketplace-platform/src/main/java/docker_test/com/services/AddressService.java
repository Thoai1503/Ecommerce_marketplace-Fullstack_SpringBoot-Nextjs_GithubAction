package docker_test.com.services;

import docker_test.com.models.Address;
import docker_test.com.repository.AddressRepository;
import java.sql.SQLException;
import java.util.List;

public class AddressService {
    private final AddressRepository addressRepository = AddressRepository.Instance();

    public List<Address> getAddressesByUserId(long userId) {
        return addressRepository.findByUserId(userId);
    }
    
    public Address getAddressByShopId(long shopId) {
		return addressRepository.getByShopId(shopId);
	}

    public Address createUserAddress(Address address) throws SQLException {
        if (address == null) {
            return null;
        }
        if (address.getUserId() == null || address.getUserId() <= 0) {
            return null;
        }
        if (address.getAddressLine() == null || address.getAddressLine().isBlank()) {
            return null;
        }

        // Ensure this is a user address, not a shop address.
        address.setShop_id(null);
        return addressRepository.Create(address);
    }

    public Address createShopAddress(Address address) throws SQLException {
        if (address == null) {
            return null;
        }
        if (address.getShop_id() == null || address.getShop_id() <= 0) {
            return null;
        }
        if (address.getAddressLine() == null || address.getAddressLine().isBlank()) {
            return null;
        }

        // Ensure this is a shop address, not a user address.
        address.setUserId(null);
        return addressRepository.Create(address);
    }
}
