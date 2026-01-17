package docker_test.com.controllers.seller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;



@RestController()
@RequestMapping("product-image")
public class ProductImageController {
	 private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/src/main/webapp/upload/";; // Define your upload directory

	
	
	@PostMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> update2(
	        @PathVariable Long id,
	       
	        @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
	    
	    Path uploadPath = Paths.get(UPLOAD_DIR);
	    
	    // Tạo thư mục nếu chưa có
	    if (!Files.exists(uploadPath)) {
	        Files.createDirectories(uploadPath);
	    }
	    
	    List<String> savedFileNames = new ArrayList<>();
	    
	    if (images != null && !images.isEmpty()) {
	        for (MultipartFile image : images) {
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
	                
	                savedFileNames.add(uniqueName);
	            }
	        }
	        
	        // Lưu danh sách ảnh vào database
	        // Option 1: Lưu dạng JSON array
	     //   item.setImage(String.join(",", savedFileNames)); // "img1.jpg,img2.jpg"
	        
	        // Option 2: Có bảng riêng FoodItemImage
	        // saveImagesToDatabase(id, savedFileNames);
	    }
	    
	   // var result = foodItemRepository.update(item);
	    return ResponseEntity.ok(true);
	}
	
	private boolean isValidImageType(String contentType) {
	    return contentType != null && 
	           (contentType.equals("image/jpeg") || 
	            contentType.equals("image/png") || 
	            contentType.equals("image/jpg") ||
	            contentType.equals("image/webp"));
	}
	
}
