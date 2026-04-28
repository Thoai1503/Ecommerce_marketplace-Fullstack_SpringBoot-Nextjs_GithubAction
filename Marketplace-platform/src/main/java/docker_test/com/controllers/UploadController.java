package docker_test.com.controllers;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.services.CloudinaryService;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    // Upload ảnh category
    @PostMapping(value = "/category", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCategoryImage(
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            Map result = cloudinaryService.uploadFileWithOptions(file, "category");
            String imageUrl = (String) result.get("url");
            return ResponseEntity.ok().body(Map.of("url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // Upload ảnh brand
    @PostMapping(value = "/brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadBrandImage(
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        try {
            Map result = cloudinaryService.uploadFileWithOptions(file, "brand");
            String imageUrl = (String) result.get("url");
            return ResponseEntity.ok().body(Map.of("url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}