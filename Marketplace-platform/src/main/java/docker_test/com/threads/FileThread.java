package docker_test.com.threads;

import org.springframework.web.multipart.MultipartFile;

import docker_test.com.services.CloudinaryService;

import java.util.Map;

public class FileThread extends Thread {

    private final MultipartFile file;
    private final String description;
    private final CloudinaryService cloudinaryService;

    private Map<String, Object> uploadResult;
    private Exception exception;

    public FileThread(MultipartFile file, String description, CloudinaryService cloudinaryService) {
        this.file = file;
        this.description = description;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public void run() {
        try {
            this.uploadResult = cloudinaryService.uploadReturnAttachment(file);
        } catch (Exception e) {
            this.exception = e;
        }
    }

    public MultipartFile getFile() {
        return file;
    }

    public String getDescription() {
        return description;
    }

    public Map<String, Object> getUploadResult() {
        return uploadResult;
    }

    public Exception getException() {
        return exception;
    }

    public boolean hasError() {
        return exception != null;
    }
}
