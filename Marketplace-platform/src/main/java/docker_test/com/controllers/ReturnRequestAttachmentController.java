package docker_test.com.controllers;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.services.ReturnRequestAttachmentService;

@RestController
@RequestMapping("/api/refunds-requests-attachments")
public class ReturnRequestAttachmentController {

    private final ReturnRequestAttachmentService returnRequestAttachmentService;

    public ReturnRequestAttachmentController(ReturnRequestAttachmentService returnRequestAttachmentService) {
        this.returnRequestAttachmentService = returnRequestAttachmentService;
    }

    @PostMapping(value = "/{returnRequestId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAttachments(
            @PathVariable Long returnRequestId,
            @RequestPart("files") MultipartFile[] files,
            @RequestPart(value = "descriptions", required = false) String[] descriptions) {

        List<String> descriptionList = descriptions == null ? null : Arrays.asList(descriptions);

        var saved = returnRequestAttachmentService.createAttachments(
                returnRequestId,
                Arrays.asList(files),
                descriptionList);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{returnRequestId}/attachments")
    public ResponseEntity<?> getAttachmentsByReturnRequestId(@PathVariable Long returnRequestId) {
        var data = returnRequestAttachmentService.getByReturnRequestId(returnRequestId);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long attachmentId) {
        returnRequestAttachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.ok("Deleted attachment id=" + attachmentId);
    }

	}
