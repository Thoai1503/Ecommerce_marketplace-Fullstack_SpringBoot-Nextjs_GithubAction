package docker_test.com.factory;


import org.springframework.stereotype.Component;

import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.AttributeRepository;
import docker_test.com.repository.AttributeValueRepository;
import docker_test.com.repository.BrandRepository;
import docker_test.com.repository.CategoryAttributeRepository;
import docker_test.com.repository.CategoryBrandRepository;
import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.ProductImageRepository;
import docker_test.com.repository.ProductRepository;
import docker_test.com.repository.ProductVariantRepository;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.UnitRepository;
import docker_test.com.repository.UserRepository;

@Component
public class RepoFactoryImpl implements IRepoFactory  {
	private static RepoFactoryImpl instance = null;

    
	private final CategoryRepository categoryRepository;
	private final UnitRepository unitRepository;
	private final CategoryAttributeRepository categoryAttributeRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	private final ProductImageRepository productImageRepository;
	private final ShopRepository shopRepository;
	private final ProductVariantRepository productVariantRepository;
	private final BrandRepository brandRepository;
	private final CategoryBrandRepository categoryBrandRepisitory;
	private final OrderRepository orderRepository;
//	private final ProductRepository productRepository;
	private final AttributeRepository attributeRepository;
	private final AttributeValueRepository attributeValueRepository;
	
	public static RepoFactoryImpl Instance() {
	
		if (instance==null) {
			instance=new RepoFactoryImpl();
		}
		return instance;
	}
	
	
	
	public RepoFactoryImpl() {

		this.categoryRepository =CategoryRepository.Instance();
		this.unitRepository =UnitRepository.Instance();
		this.categoryAttributeRepository = CategoryAttributeRepository.Instance();
		this.productRepository =ProductRepository.Instance();
		this.userRepository = UserRepository.Instance();
		this.productImageRepository = ProductImageRepository.Instance();
		this.shopRepository = ShopRepository.Instance();
		this.productVariantRepository = ProductVariantRepository.Instance();
		this.brandRepository = BrandRepository.Instance();
		this.categoryBrandRepisitory = CategoryBrandRepository.Instance();
		this.orderRepository = OrderRepository.Instance();
		this.attributeRepository = AttributeRepository.Instance();
		this.attributeValueRepository = AttributeValueRepository.Instance();
	}

	@Override
	public IRepositories createRepo(String entityType) {
		
		return switch (entityType.toLowerCase()) {
		case "category" -> (IRepositories) categoryRepository;
		case "unit" -> (IRepositories) unitRepository;
		case "category_attribute" -> (IRepositories) categoryAttributeRepository;
		case "product" -> (IRepositories)  productRepository;
		case "user" -> (IRepositories) userRepository;
		case "product_image" -> (IRepositories) productImageRepository;
		case "shop" -> (IRepositories) shopRepository;
		case "product_variant" -> (IRepositories<ProductVariant>) productVariantRepository;
		case "brand" -> (IRepositories) brandRepository;
		case "category_brand" -> (IRepositories) categoryBrandRepisitory; 
		case "order" -> (IRepositories) orderRepository;
		case "attribute" -> (IRepositories) attributeRepository;
		case "attribute_value" -> (IRepositories) attributeValueRepository;
	
		default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
		};
	}

}


