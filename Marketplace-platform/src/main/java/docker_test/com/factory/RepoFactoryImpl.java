package docker_test.com.factory;

//import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import docker_test.com.models.product.ProductVariant;
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
    //private  JdbcTemplate jdbcTemplate;
    
    //ae thêm các Repository do ae tạo ở đây
	private final CategoryRepository categoryRepository;
	private final UnitRepository unitRepository;
	private final CategoryAttributeRepository categoryAttributeRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	private final ProductImageRepository productImageRepository;
	private final ShopRepository shopRepository;
	private final ProductVariantRepository productVariantRepository;
<<<<<<< HEAD
	private final OrderRepository orderRepository;
=======
	private final BrandRepository brandRepository;
	private final CategoryBrandRepository categoryBrandRepisitory;
>>>>>>> b068db5 (Brands)

	public static RepoFactoryImpl Instance() {
	
		if (instance==null) {
			instance=new RepoFactoryImpl();
		}
		return instance;
	}
	
	
	
	public RepoFactoryImpl() {
		//Khởi tạo các Repository do ae tạo ở đây
		this.categoryRepository =CategoryRepository.Instance();
		this.unitRepository =UnitRepository.Instance();
		this.categoryAttributeRepository = CategoryAttributeRepository.Instance();
		this.productRepository =ProductRepository.Instance();
		this.userRepository = UserRepository.Instance();
		this.productImageRepository = ProductImageRepository.Instance();
		this.shopRepository = ShopRepository.Instance();
		this.productVariantRepository = ProductVariantRepository.Instance();
<<<<<<< HEAD
		this.orderRepository = OrderRepository.Instance();
=======
		this.brandRepository = BrandRepository.Instance();
		this.categoryBrandRepisitory = CategoryBrandRepository.Instance();
>>>>>>> b068db5 (Brands)
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
<<<<<<< HEAD
		case "order" -> (IRepositories) orderRepository;
		
		//...ae thêm các định nghĩa Repository do ae tạo ở đây (Repository phải implement IRepositories)
		   default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
=======
		case "brand" -> (IRepositories) brandRepository;
		case "category_brand" -> (IRepositories) categoryBrandRepisitory; 

		default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
>>>>>>> b068db5 (Brands)
		};
	}

}
