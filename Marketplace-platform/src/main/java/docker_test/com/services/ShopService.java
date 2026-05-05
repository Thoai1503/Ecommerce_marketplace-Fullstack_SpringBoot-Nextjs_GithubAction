package docker_test.com.services;

import docker_test.com.repository.ShopRepository;

public class ShopService {

	private final ShopRepository shopRepository;

	public ShopService() {
		this.shopRepository = ShopRepository.Instance();
	}

	public void verifyShop(long id) {

		boolean success = shopRepository.VerifyShop(id);

		if (!success) {
			throw new RuntimeException("Shop đã được verify hoặc không tồn tại");
		}
	}
}