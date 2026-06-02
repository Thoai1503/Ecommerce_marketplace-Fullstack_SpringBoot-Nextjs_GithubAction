package docker_test.com.dto;

public class UploadFileData {

    private byte[] bytes;
    private String originalFilename;
    private String contentType;

    public UploadFileData(byte[] bytes, String originalFilename, String contentType) {
        this.bytes = bytes;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
    }

    public byte[] getBytes() {
        return bytes;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getContentType() {
        return contentType;
    }
}