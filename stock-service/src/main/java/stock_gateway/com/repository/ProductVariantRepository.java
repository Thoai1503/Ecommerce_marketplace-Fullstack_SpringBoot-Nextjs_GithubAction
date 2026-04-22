package stock_gateway.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import docker_test.com.models.product.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

}
