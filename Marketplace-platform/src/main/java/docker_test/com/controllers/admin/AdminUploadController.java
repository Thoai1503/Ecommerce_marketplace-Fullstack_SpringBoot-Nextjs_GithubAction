package docker_test.com.controllers.admin;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.services.CloudinaryService;

/**
 * Generic upload endpoint for admin panel (seller logo, product image, ...).
 * Returns { url } after uploading the file to Cloudinary.
 */
@RestController
@RequestMapping("/admin/upload")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminUploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("file is required");
        }

        // Simple content-type guard (ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Only image files are allowed");
        }

        try {
            String url = cloudinaryService.uploadFile(file);
            Map<String, String> body = new HashMap<>();
            body.put("url", url);
            return ResponseEntity.ok(body);
        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed: " + ex.getMessage());
        }
    }
}
