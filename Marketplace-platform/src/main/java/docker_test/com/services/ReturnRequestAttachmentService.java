package docker_test.com.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.dto.ReturnRequestAttachmentDTO;
import docker_test.com.dto.UploadFileData;
import docker_test.com.models.refunds.ReturnRequestAttachment;
import docker_test.com.repository.RefundRequestRepository;
import docker_test.com.repository.ReturnRequestAttachmentRepository;
import docker_test.com.threads.FileTestThread;
import docker_test.com.threads.FileThread;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class ReturnRequestAttachmentService {

    private final ReturnRequestAttachmentRepository returnRequestAttachmentRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final CloudinaryService cloudinaryService;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ReturnRequestAttachmentService.class);	

    public ReturnRequestAttachmentService(
            ReturnRequestAttachmentRepository returnRequestAttachmentRepository,
            RefundRequestRepository refundRequestRepository,
            CloudinaryService cloudinaryService) {
    	System.out.println("Khởi tạo ReturnRequestAttachmentService");
        this.returnRequestAttachmentRepository = returnRequestAttachmentRepository;
        this.refundRequestRepository = refundRequestRepository;
        this.cloudinaryService = cloudinaryService;
    }
    
    @PostConstruct
    public void init() {
		log.info("ReturnRequestAttachmentService đã được khởi tạo");
	}
    
    public void doWork() {
		log.info("Đang thực hiện công việc trong ReturnRequestAttachmentService");
	}
    
    @PreDestroy
    public void cleanup() {
    			log.info("ReturnRequestAttachmentService đang được hủy, thực hiện dọn dẹp nếu cần");
    }
    

    public ReturnRequestAttachment createAttachment(Long returnRequestId, MultipartFile file, String description) {
        validateReturnRequest(returnRequestId);
        validateAttachmentFile(file);

        try {
            Map<String, Object> uploadResult = cloudinaryService.uploadReturnAttachment(file);
            String fileUrl = resolveUploadedUrl(uploadResult);

            ReturnRequestAttachment attachment = new ReturnRequestAttachment();
            attachment.setReturnRequestId(returnRequestId);
            attachment.setFileUrl(fileUrl);
            attachment.setFileType(resolveFileType(file, uploadResult));
            attachment.setDescription(trimToNull(description));

            return returnRequestAttachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new RuntimeException("Upload attachment lên Cloudinary thất bại: " + e.getMessage(), e);
        }
    }

   public List<ReturnRequestAttachment> createAttachments(
        Long returnRequestId,
        List<MultipartFile> files,
        List<String> descriptions) {
    if (files == null || files.isEmpty()) {
        return List.of();
    }
    validateReturnRequest(returnRequestId);
    for (MultipartFile file : files) {
        validateAttachmentFile(file);
    }

    // Chạy toàn bộ logic upload ngầm, không block thread hiện tại
    CompletableFuture.runAsync(() -> {
        List<FileThread> threads = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            String description = (descriptions != null && i < descriptions.size()) ? descriptions.get(i) : null;
            threads.add(new FileThread(files.get(i), description, cloudinaryService));
        }

        for (FileThread thread : threads) {
            thread.start();
        }

        for (FileThread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Upload bị gián đoạn", e);
                return;
            }
        }

        for (int i = 0; i < threads.size(); i++) {
            if (threads.get(i).hasError()) {
                Exception ex = threads.get(i).getException();
                log.error("Upload attachment thất bại (file {}): {}", i + 1, ex.getMessage(), ex);
                return;
            }
        }

        List<ReturnRequestAttachment> attachments = new ArrayList<>();
        for (FileThread thread : threads) {
            Map<String, Object> uploadResult = thread.getUploadResult();
            ReturnRequestAttachment attachment = new ReturnRequestAttachment();
            attachment.setReturnRequestId(returnRequestId);
            attachment.setFileUrl(resolveUploadedUrl(uploadResult));
            attachment.setFileType(resolveFileType(thread.getFile(), uploadResult));
            attachment.setDescription(trimToNull(thread.getDescription()));
            attachments.add(attachment);
        }

        returnRequestAttachmentRepository.saveAll(attachments);
    });

    return List.of(); // Trả về ngay, không chờ upload
}
   
   public List<ReturnRequestAttachment> createAttachments2(
		   Long returnRequestId,
		List<MultipartFile> files,
		List<String> descriptions) {
	   if (files == null || files.isEmpty()) {
	        return List.of();
	    }
	    validateReturnRequest(returnRequestId);
	    for (MultipartFile file : files) {
	        validateAttachmentFile(file);
	    }
	    
	    for (int i = 0; i < files.size(); i++) {
	        MultipartFile file = files.get(i);
	        byte[] bytes;
	        UploadFileData uploadFileData;
	        try {
	            uploadFileData = new UploadFileData(
	                file.getBytes(),
	                file.getOriginalFilename(),
	                file.getContentType()
	            );
	        } catch (IOException e) {
	            throw new RuntimeException(e);
	        }
	        String description = (descriptions != null && i < descriptions.size()) ? descriptions.get(i) : null;
	       Thread thread = new Thread(new FileTestThread(uploadFileData.getBytes(),uploadFileData.getOriginalFilename(),uploadFileData.getContentType(), returnRequestAttachmentRepository, cloudinaryService, description, returnRequestId));
	       thread.start();
	    }
	   
	   
	   
	   return List.of(); 
   }
    public ReturnRequestAttachment createAttachment(Long returnRequestId, ReturnRequestAttachmentDTO dto) {
        validateReturnRequest(returnRequestId);
        validateAttachment(dto);

        ReturnRequestAttachment attachment = new ReturnRequestAttachment();
        attachment.setReturnRequestId(returnRequestId);
        attachment.setFileUrl(dto.getFileUrl().trim());
        attachment.setFileType(trimToNull(dto.getFileType()));
        attachment.setDescription(trimToNull(dto.getDescription()));

        return returnRequestAttachmentRepository.save(attachment);
    }

    public List<ReturnRequestAttachment> createAttachments(Long returnRequestId, List<ReturnRequestAttachmentDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return List.of();
        }

        validateReturnRequest(returnRequestId);

        List<ReturnRequestAttachment> attachments = new ArrayList<>();
        for (ReturnRequestAttachmentDTO dto : dtos) {
            validateAttachment(dto);
            ReturnRequestAttachment attachment = new ReturnRequestAttachment();
            attachment.setReturnRequestId(returnRequestId);
            attachment.setFileUrl(dto.getFileUrl().trim());
            attachment.setFileType(trimToNull(dto.getFileType()));
            attachment.setDescription(trimToNull(dto.getDescription()));
            attachments.add(attachment);
        }

        return returnRequestAttachmentRepository.saveAll(attachments);
    }

    public List<ReturnRequestAttachment> getByReturnRequestId(Long returnRequestId) {
        validateReturnRequest(returnRequestId);
        return returnRequestAttachmentRepository.findByReturnRequestIdOrderByCreatedAtDesc(returnRequestId);
    }

    public void deleteAttachment(Long attachmentId) {
        if (attachmentId == null || attachmentId <= 0) {
            throw new IllegalArgumentException("attachmentId không hợp lệ");
        }

        if (!returnRequestAttachmentRepository.existsById(attachmentId)) {
            throw new IllegalArgumentException("Không tìm thấy attachment với id=" + attachmentId);
        }

        returnRequestAttachmentRepository.deleteById(attachmentId);
    }

    public void deleteByReturnRequestId(Long returnRequestId) {
        validateReturnRequest(returnRequestId);
        returnRequestAttachmentRepository.deleteByReturnRequestId(returnRequestId);
    }

    private void validateReturnRequest(Long returnRequestId) {
        if (returnRequestId == null || returnRequestId <= 0) {
            throw new IllegalArgumentException("returnRequestId không hợp lệ");
        }

        if (!refundRequestRepository.existsById(returnRequestId)) {
            throw new IllegalArgumentException("Không tìm thấy return_request với id=" + returnRequestId);
        }
    }

    private void validateAttachment(ReturnRequestAttachmentDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Attachment không được null");
        }

        if (dto.getFileUrl() == null || dto.getFileUrl().isBlank()) {
            throw new IllegalArgumentException("fileUrl là bắt buộc");
        }

        if (dto.getFileUrl().length() > 500) {
            throw new IllegalArgumentException("fileUrl vượt quá 500 ký tự");
        }

        if (dto.getFileType() != null && dto.getFileType().length() > 50) {
            throw new IllegalArgumentException("fileType vượt quá 50 ký tự");
        }
    }

    private void validateAttachmentFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File attachment không được rỗng");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("Không xác định được content type của file");
        }

        String normalized = contentType.toLowerCase();
        if (!normalized.startsWith("image/") && !normalized.startsWith("video/")) {
            throw new IllegalArgumentException("Attachment chỉ hỗ trợ image hoặc video");
        }
    }

    private String resolveUploadedUrl(Map<String, Object> uploadResult) {
        Object secureUrl = uploadResult.get("secure_url");
        Object fallbackUrl = uploadResult.get("url");

        String result = secureUrl != null ? secureUrl.toString() : (fallbackUrl != null ? fallbackUrl.toString() : null);
        if (result == null || result.isBlank()) {
            throw new IllegalArgumentException("Cloudinary không trả về URL hợp lệ");
        }
        return result;
    }

    private String resolveFileType(MultipartFile file, Map<String, Object> uploadResult) {
        Object resourceType = uploadResult.get("resource_type");
        if (resourceType != null && !resourceType.toString().isBlank()) {
            String format = uploadResult.get("format") != null ? uploadResult.get("format").toString() : "";
            String value = format.isBlank() ? resourceType.toString() : resourceType + "/" + format;
            if (value.length() <= 50) {
                return value;
            }
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return null;
        }

        String trimmed = contentType.trim();
        if (trimmed.length() <= 50) {
            return trimmed;
        }
        return trimmed.substring(0, 50);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
