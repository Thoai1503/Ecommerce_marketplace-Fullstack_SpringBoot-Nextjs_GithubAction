package docker_test.com.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;
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
	
	public ReturnRequest createRefundRequest(RefundRequestDTO refundRequestDTO) {
		ReturnRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (refundRequestDTO.getAttachments() != null && !refundRequestDTO.getAttachments().isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), refundRequestDTO.getAttachments());
		}

		return savedRefundRequest;
	}

	
	public ReturnRequest getRefundRequestsByOrderShipmentId(Long orderShipmentId) {
		return refundRequestRepository.findByOrderShipmentId(orderShipmentId);
	}
	
	public ReturnRequest createRefundRequestWithFiles(
			RefundRequestDTO refundRequestDTO,
			List<MultipartFile> files,
			List<String> descriptions) {
		ReturnRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (files != null && !files.isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), files, descriptions);
		}

		return savedRefundRequest;
	}

	private ReturnRequest persistRefundRequest(RefundRequestDTO refundRequestDTO) {
		ReturnRequest refundRequest = new ReturnRequest();
		refundRequest.setOrderId(refundRequestDTO.getOrderId());
		refundRequest.setShopId(refundRequestDTO.getShopId());
		refundRequest.setCustomerId(refundRequestDTO.getCustomerId());
		refundRequest.setReason(refundRequestDTO.getReason());
		refundRequest.setOrderShipmentId(refundRequestDTO.getOrderShipmentId());
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
	 
	public List<ReturnRequest> getAll() {
		refundRequestRepository.findAll().forEach(request -> {
			request.getItems().forEach(item -> {
				System.out.println("OrderItemId: " + item.getOrderItemId() + " Quantity: " + item.getQuantity() + " RequestedAmount: " + item.getRequestedAmount());
			});
		});
		
		return refundRequestRepository.findAll().stream()
				.filter(request -> request.getAttachments().size()>0) // Replace 1L with the actual customer ID you want to filter by
				.toList();
	}
	
	public ReturnRequest getRefundRequestById(Long id) {
		return refundRequestRepository.findById(id).orElse(null);
	}

	public ReturnRequest updateStatus(Long id, ReturnRequestStatus status, Double refundedAmount) {
		ReturnRequest request = refundRequestRepository.findById(id).orElse(null);
		if (request == null) {
			return null;
		}

		request.setStatus(status);
		if (status == ReturnRequestStatus.REFUNDED) {
			request.setRefundedAmount(refundedAmount != null ? refundedAmount : request.getRequestedAmount());
		} else if (refundedAmount != null) {
			request.setRefundedAmount(refundedAmount);
		}
		request.setUpdatedAt(LocalDateTime.now());
		return refundRequestRepository.save(request);
	}
	
}
