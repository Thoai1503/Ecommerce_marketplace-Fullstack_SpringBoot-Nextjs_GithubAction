package docker_test.com.services;

import docker_test.com.models.Address;
import docker_test.com.repository.AddressRepository;
import java.util.List;

public class AddressService {
    private final AddressRepository addressRepository = AddressRepository.Instance();

    public List<Address> getAddressesByUserId(long userId) {
        return addressRepository.findByUserId(userId);
    }
    
    public Address getAddressByShopId(long shopId) {
		return addressRepository.getByShopId(shopId);
	}
}
