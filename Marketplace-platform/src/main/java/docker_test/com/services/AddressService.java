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
        if (address.getUserId() <= 0) {
            return null;
        }
        if (address.getAddressLine() == null || address.getAddressLine().isBlank()) {
            return null;
        }

        // Normal user address should not carry shop_id.
        address.setShop_id(Long.valueOf(0));
        return addressRepository.Create(address);
    }
}
