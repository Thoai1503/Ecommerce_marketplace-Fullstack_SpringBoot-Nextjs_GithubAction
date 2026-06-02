package docker_test.com.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // =========================
    // MultipartFile upload
    // =========================

    public String uploadFile(MultipartFile file) throws IOException {

        return uploadFile(
                file.getBytes(),
                file.getOriginalFilename()
        );
    }

    // =========================
    // byte[] upload
    // =========================

    public String uploadFile(byte[] bytes, String fileName) throws IOException {

        Map<String, Object> uploadResult =
                cloudinary.uploader().upload(
                        bytes,
                        ObjectUtils.asMap(
                                "resource_type", "auto",
                                "use_filename", true,
                                "unique_filename", true
                        )
                );

        return uploadResult.get("url").toString();
    }

    // =========================
    // upload with options
    // =========================

    public Map<String, Object> uploadFileWithOptions(
            MultipartFile file,
            String folder
    ) throws IOException {

        return uploadFileWithOptions(
                file.getBytes(),
                folder,
                file.getOriginalFilename()
        );
    }

    public Map<String, Object> uploadFileWithOptions(
            byte[] bytes,
            String folder,
            String fileName
    ) throws IOException {

        return cloudinary.uploader().upload(
                bytes,
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "auto",
                        "use_filename", true,
                        "unique_filename", true
                )
        );
    }

    // =========================
    // return attachment
    // =========================

    public Map<String, Object> uploadReturnAttachment(
            MultipartFile file
    ) throws IOException {

        return uploadReturnAttachment(
                file.getBytes(),
                file.getOriginalFilename()
        );
    }

    public Map<String, Object> uploadReturnAttachment(
            byte[] bytes,
            String fileName
    ) throws IOException {

        return cloudinary.uploader().upload(
                bytes,
                ObjectUtils.asMap(
                        "folder", "return-request-attachments",
                        "resource_type", "auto",
                        "use_filename", true,
                        "unique_filename", true,
                        "filename_override", fileName
                )
        );
    }

    // =========================
    // delete
    // =========================

    public void deleteFile(String publicId) throws IOException {

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );
    }
}