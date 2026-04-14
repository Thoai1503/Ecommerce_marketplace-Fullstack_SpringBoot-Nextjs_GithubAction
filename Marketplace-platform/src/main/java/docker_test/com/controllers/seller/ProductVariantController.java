package docker_test.com.controllers.seller;

import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.ProductVariant;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductVariantRepository;
import docker_test.com.services.CloudinaryService;

@RestController("/seller/product-variant")
@RequestMapping("/seller/product-variant")
public class ProductVariantController  {
	
	 @Autowired
     private CloudinaryService cloudinaryService;
	 private final IRepositories repositories;
	 private final IRepoFactory iRepoFactory;
	 
	 public ProductVariantController 
	
	(RepoFactoryImpl factoryImpl) {
		 this.iRepoFactory= factoryImpl;
		 this.repositories = iRepoFactory.createRepo("product_variant");
	 }

	@GetMapping("/product/{id}")
	public ResponseEntity   getByProductId(@PathVariable int id) {
		var list = ((ProductVariantRepository)repositories).GetByProductId(id);
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity getById(@PathVariable int id) {
		var variant = repositories.GetById(id);
		if (variant == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(variant);
	}
	
	@PostMapping("")
	public ResponseEntity   create(@RequestBody ProductVariant productVariant) throws SQLException {
		var en = ((ProductVariantRepository)repositories).Create(productVariant);
		return ResponseEntity.ok(en);
	}
	
	@PostMapping(value = {"/{id}", "/{id}/image"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity updateImageForVariant(@PathVariable int id, @RequestPart(value = "image", required = false) MultipartFile image ) throws SQLException {
		
				String imageUrl = null;
		if (image != null && !image.isEmpty()) {
			try { 
				
				imageUrl = cloudinaryService.uploadFile(image);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
			}
		}

		var updatedVariant = ((ProductVariantRepository) repositories).updateImage(id, imageUrl);
		if (updatedVariant == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(updatedVariant);
		
		
	}
}
