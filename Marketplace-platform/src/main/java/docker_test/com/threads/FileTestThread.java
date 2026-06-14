package docker_test.com.threads;

import java.util.Map;

import org.slf4j.Logger;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.models.refunds.ReturnRequestAttachment;
import docker_test.com.repository.ReturnRequestAttachmentRepository;
import docker_test.com.services.CloudinaryService;

public  class FileTestThread implements  Runnable {
  
	private final ReturnRequestAttachmentRepository returnRequestAttachmentRepository;
	private final CloudinaryService cloudinaryService;
	private final Logger logger = org.slf4j.LoggerFactory.getLogger(FileTestThread.class);
	private Long returnRequestId;
//	private MultipartFile file;
    private final byte[] fileBytes;

    private final String originalFilename;

    private final String contentType;
	private String description;
	public FileTestThread(
			byte[] fileBytes,
            String originalFilename,
            String contentType, ReturnRequestAttachmentRepository returnRequestAttachmentRepository, CloudinaryService cloudinaryService,String description,  Long returnRequestId) {
		// TODO Auto-generated constructor stub
	     this.fileBytes = fileBytes;
	        this.originalFilename = originalFilename;
	        this.contentType = contentType;
	   		this.returnRequestAttachmentRepository = returnRequestAttachmentRepository;
	   		this.cloudinaryService = cloudinaryService;
	        	   		this.description = description;
	        	   			   		
	        	   			   		this.returnRequestId = returnRequestId;
	}
	
    @Override
    public void run() {

        logger.info(
                "Starting file upload thread for file: {}",
                originalFilename
        );

        try {

            var uploadResult =
                    cloudinaryService.uploadReturnAttachment(
                            fileBytes,
                            originalFilename
                    );

            logger.info(
                    "File uploaded successfully for file: {}",
                    originalFilename
            );

            ReturnRequestAttachment attachment =
                    new ReturnRequestAttachment();

            attachment.setReturnRequestId(returnRequestId);

            attachment.setFileUrl(
                    resolveUploadedUrl(uploadResult)
            );

            attachment.setFileType(
                    resolveFileType(uploadResult)
            );

            attachment.setDescription(description);

            returnRequestAttachmentRepository.save(attachment);

        } catch (Exception e) {

            logger.error(
                    "Error uploading file: {}. Exception: {}",
                    originalFilename,
                    e.getMessage(),
                    e
            );
        }
    }

	
//    private String resolveFileType(MultipartFile file, Map<String, Object> uploadResult) {
//        Object resourceType = uploadResult.get("resource_type");
//        if (resourceType != null && !resourceType.toString().isBlank()) {
//            String format = uploadResult.get("format") != null ? uploadResult.get("format").toString() : "";
//            String value = format.isBlank() ? resourceType.toString() : resourceType + "/" + format;
//            if (value.length() <= 50) {
//                return value;
//            }
//        }
//
//        String contentType = file.getContentType();
//        if (contentType == null) {
//            return null;
//        }
//
//        String trimmed = contentType.trim();
//        if (trimmed.length() <= 50) {
//            return trimmed;
//        }
//        return trimmed.substring(0, 50);
//    }
//	
//    private String resolveUploadedUrl(Map<String, Object> uploadResult) {
//        Object secureUrl = uploadResult.get("secure_url");
//        Object fallbackUrl = uploadResult.get("url");
//
//        String result = secureUrl != null ? secureUrl.toString() : (fallbackUrl != null ? fallbackUrl.toString() : null);
//        if (result == null || result.isBlank()) {
//            throw new IllegalArgumentException("Cloudinary không trả về URL hợp lệ");
//        }
//        return result;
//    }
	  private String resolveFileType(
	            Map<String, Object> uploadResult
	    ) {

	        Object resourceType = uploadResult.get("resource_type");

	        if (resourceType != null &&
	                !resourceType.toString().isBlank()) {

	            String format =
	                    uploadResult.get("format") != null
	                            ? uploadResult.get("format").toString()
	                            : "";

	            String value =
	                    format.isBlank()
	                            ? resourceType.toString()
	                            : resourceType + "/" + format;

	            if (value.length() <= 50) {
	                return value;
	            }
	        }

	        if (contentType == null) {
	            return null;
	        }

	        String trimmed = contentType.trim();

	        if (trimmed.length() <= 50) {
	            return trimmed;
	        }

	        return trimmed.substring(0, 50);
	    }

	    private String resolveUploadedUrl(
	            Map<String, Object> uploadResult
	    ) {

	        Object secureUrl = uploadResult.get("secure_url");

	        Object fallbackUrl = uploadResult.get("url");

	        String result =
	                secureUrl != null
	                        ? secureUrl.toString()
	                        : (fallbackUrl != null
	                        ? fallbackUrl.toString()
	                        : null);

	        if (result == null || result.isBlank()) {

	            throw new IllegalArgumentException(
	                    "Cloudinary không trả về URL hợp lệ"
	            );
	        }

	        return result;
	    }
}
