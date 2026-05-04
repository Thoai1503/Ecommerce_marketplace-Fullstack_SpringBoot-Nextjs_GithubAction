package docker_test.com.services;

import docker_test.com.models.product.Product;
import docker_test.com.repository.ProductRepository;

public class ProductService {
       private final ProductRepository productRepository;
       
       public ProductService(ProductRepository productRepository) {
		   this.productRepository = productRepository;
	   }
       
       
       public Product updateProduct(Product product) {
		   // Perform any necessary validation or business logic here
		   
		   // Save the updated product to the database
		   return productRepository.Update(product);
	   }
       
}
