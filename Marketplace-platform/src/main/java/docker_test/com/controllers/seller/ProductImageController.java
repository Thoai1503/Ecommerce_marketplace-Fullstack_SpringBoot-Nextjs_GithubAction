package docker_test.com.controllers.seller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.product.ProductImage;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductImageRepository;
import docker_test.com.services.CloudinaryService;



@RestController()
@RequestMapping("/seller/product-image")
public class ProductImageController {
	 private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/src/main/webapp/upload/";; // Define your upload directory
     private final IRepositories repositories;
     private final IRepoFactory iRepoFactory;
     
     @Autowired
     private CloudinaryService cloudinaryService;
     
     public ProductImageController(RepoFactoryImpl factoryImpl) {
    	 this.iRepoFactory =factoryImpl;
    	 this. repositories = iRepoFactory.createRepo("product_image");
     }
	
	
	@PostMapping(value = "/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> update2(
	        @PathVariable Integer id,
	       
	        @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException,SQLException {
	    
	    Path uploadPath = Paths.get(UPLOAD_DIR);
	    
	    // Tạo thư mục nếu chưa có
	    if (!Files.exists(uploadPath)) {
	        Files.createDirectories(uploadPath);
	    }
	    
	    List<String> savedFileNames = new ArrayList<>();
	    
	    if (images != null && !images.isEmpty()) {
	        for (MultipartFile image : images) {
	        	ProductImage productImage = new ProductImage();
	            if (!image.isEmpty()) {
	                // Validate file type
	                String contentType = image.getContentType();
	                if (!isValidImageType(contentType)) {
	                    return ResponseEntity.badRequest()
	                        .body("Invalid file type: " + image.getOriginalFilename());
	                }
	                
	                // Tạo tên file unique
	                String uniqueName = System.currentTimeMillis() + "_" + 
	                                   UUID.randomUUID() + "_" + 
	                                   image.getOriginalFilename();
	                System.out.println("Image name: "+uniqueName);
	                Path filePath = uploadPath.resolve(uniqueName);
	                
	                // Lưu file
	                Files.copy(image.getInputStream(), filePath, 
	                          StandardCopyOption.REPLACE_EXISTING);
	              
	                productImage.setProductId(id);
	                productImage.setImageUrl(uniqueName);
	                repositories.Create(productImage);
	                savedFileNames.add(uniqueName);
	            }
	        }
	        
	        // Lưu danh sách ảnh vào database
	        // Option 1: Lưu dạng JSON array
	     //   item.setImage(String.join(",", savedFileNames)); // "img1.jpg,img2.jpg"
	        
	        // Option 2: Có bảng riêng FoodItemImage
	        // saveImagesToDatabase(id, savedFileNames);

		    return ResponseEntity.ok(true);
	    }
	    

	    return ResponseEntity.ok(false);
	}
	
	
	
	@PostMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> update3(
	        @PathVariable Integer id,
	       
	        @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException,SQLException {
	    
	    Path uploadPath = Paths.get(UPLOAD_DIR);
	    
	    // Tạo thư mục nếu chưa có
	    if (!Files.exists(uploadPath)) {
	        Files.createDirectories(uploadPath);
	    }
	    
	    List<String> savedFileNames = new ArrayList<>();
	    
	    if (images != null && !images.isEmpty()) {
	    	List<ProductImage> list = new ArrayList<>();
	        for (MultipartFile image : images) {
	        	
	        	ProductImage productImage = new ProductImage();
	        	   String url = cloudinaryService.uploadFile(image);
	               Map<String, String> response = new HashMap<>();
	               productImage.setProductId(id);
	               productImage.setImageUrl(url);
	           var result =    repositories.Create(productImage);

             list.add((ProductImage)result);
	        }

		    return ResponseEntity.ok(list);
	    }
	    

	    return ResponseEntity.ok(false);
	}
	
	private boolean isValidImageType(String contentType) {
	    return contentType != null && 
	           (contentType.equals("image/jpeg") || 
	            contentType.equals("image/png") || 
	            contentType.equals("image/jpg") ||
	            contentType.equals("image/webp"));
	}
	
	
	@GetMapping("/product/{id}")
	private ResponseEntity getByProductId(@PathVariable Integer id) {
      var  repositori = ((ProductImageRepository) repositories).GetByProductId(id);
        return ResponseEntity.ok(repositori);
	}
	
}
