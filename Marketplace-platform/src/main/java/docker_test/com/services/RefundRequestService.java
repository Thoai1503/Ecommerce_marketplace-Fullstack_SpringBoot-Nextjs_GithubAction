package docker_test.com.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.models.refunds.RefundRequest;
import docker_test.com.repository.RefundRequestRepository;
import docker_test.com.repository.ReturnReqestItemRepositrory;

@Service
public class RefundRequestService {

	private final RefundRequestRepository refundRequestRepository;
	private final ReturnReqestItemRepositrory returnReqestItemRepositrory;
	private final ReturnRequestAttachmentService returnRequestAttachmentService;
	
	public RefundRequestService(
			RefundRequestRepository refundRequestRepository,
			ReturnReqestItemRepositrory returnReqestItemRepositrory,
			ReturnRequestAttachmentService returnRequestAttachmentService) {
		this.refundRequestRepository = refundRequestRepository;
		this.returnReqestItemRepositrory = returnReqestItemRepositrory;
		this.returnRequestAttachmentService = returnRequestAttachmentService;
	}
	
	public RefundRequest createRefundRequest(RefundRequestDTO refundRequestDTO) {
		RefundRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (refundRequestDTO.getAttachments() != null && !refundRequestDTO.getAttachments().isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), refundRequestDTO.getAttachments());
		}

		return savedRefundRequest;
	}

	public RefundRequest createRefundRequestWithFiles(
			RefundRequestDTO refundRequestDTO,
			List<MultipartFile> files,
			List<String> descriptions) {
		RefundRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (files != null && !files.isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), files, descriptions);
		}

		return savedRefundRequest;
	}

	private RefundRequest persistRefundRequest(RefundRequestDTO refundRequestDTO) {
		RefundRequest refundRequest = new RefundRequest();
		refundRequest.setOrderId(refundRequestDTO.getOrderId());
		refundRequest.setShopId(refundRequestDTO.getShopId());
		refundRequest.setCustomerId(refundRequestDTO.getCustomerId());
		refundRequest.setReason(refundRequestDTO.getReason());
		refundRequest.setQuantity(refundRequestDTO.getQuantity());
		refundRequest.setRequestedAmount(refundRequestDTO.getRequestedAmount());
		var savedRefundRequest = refundRequestRepository.save(refundRequest);
		
		// Save the refund request item to the database
		
		
		
		if (refundRequestDTO.getItems() != null) {
			refundRequestDTO.getItems().forEach(item -> {
				System.out.println("OrderItemId" + item.getOrderItemId() + " Quantity: " + item.getQuantity() + " RequestedAmount: " + item.getRequestedAmount());
				docker_test.com.models.refunds.ReturnRequestItem refundRequestItem = new docker_test.com.models.refunds.ReturnRequestItem();
				refundRequestItem.setReturnRequestId(savedRefundRequest.getId());
				refundRequestItem.setQuantity(item.getQuantity());
				refundRequestItem.setOrderItemId(item.getOrderItemId());
				refundRequestItem.setRequestedAmount(item.getRequestedAmount());
				returnReqestItemRepositrory.save(refundRequestItem);
			});
		}
		
		return savedRefundRequest;
	}
	
}
