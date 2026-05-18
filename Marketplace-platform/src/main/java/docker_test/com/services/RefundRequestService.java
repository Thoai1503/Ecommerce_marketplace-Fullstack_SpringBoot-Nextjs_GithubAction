package docker_test.com.services;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.configs.publisher.ReturnRequestToLogistic;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.dto.RefundCalculationResultDTO;
import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;
import docker_test.com.models.Address;
import docker_test.com.repository.RefundRequestRepository;
import docker_test.com.repository.ReturnReqestItemRepositrory;
import jakarta.transaction.Transactional;

@Service
public class RefundRequestService {

	private final RefundRequestRepository refundRequestRepository;
	private final ReturnReqestItemRepositrory returnReqestItemRepositrory;
	private final ReturnRequestAttachmentService returnRequestAttachmentService;
	private final ReturnRequestToLogistic returnRequestToLogistic;
	private final AddressService addressService;
	private final RefundCalculationService refundCalculationService;
	
	public RefundRequestService(
			RefundRequestRepository refundRequestRepository,
			ReturnReqestItemRepositrory returnReqestItemRepositrory,
			ReturnRequestAttachmentService returnRequestAttachmentService,
			ReturnRequestToLogistic returnRequestToLogistic,
			RefundCalculationService refundCalculationService) {
		this.refundRequestRepository = refundRequestRepository;
		this.returnReqestItemRepositrory = returnReqestItemRepositrory;
		this.returnRequestAttachmentService = returnRequestAttachmentService;
        this.returnRequestToLogistic = returnRequestToLogistic;
		this.addressService = new AddressService();
		this.refundCalculationService = refundCalculationService;
	}
	
	
	@Transactional
	public ReturnRequest createRefundRequest(RefundRequestDTO refundRequestDTO) {
		ReturnRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (refundRequestDTO.getAttachments() != null && !refundRequestDTO.getAttachments().isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), refundRequestDTO.getAttachments());
		}

		returnRequestToLogistic.publish(buildLogisticPayload(savedRefundRequest, refundRequestDTO));

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
		
		returnRequestToLogistic.publish(buildLogisticPayload(savedRefundRequest, refundRequestDTO));

		return savedRefundRequest;
	}

	
	@Transactional
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
				setFieldValue(refundRequestItem, "returnRequestId", savedRefundRequest.getId());
				setFieldValue(refundRequestItem, "quantity", item.getQuantity());
				setFieldValue(refundRequestItem, "orderItemId", item.getOrderItemId());
				setFieldValue(refundRequestItem, "requestedAmount", item.getRequestedAmount());
				returnReqestItemRepositrory.save(refundRequestItem);
			});
		}
		
		
		
		return savedRefundRequest;
	}

	private RefundRequestDTO buildLogisticPayload(ReturnRequest savedRefundRequest, RefundRequestDTO sourceDto) {
		RefundRequestDTO payload = new RefundRequestDTO();
		payload.setReturnRequestId(savedRefundRequest.getId());
		payload.setOrderId(savedRefundRequest.getOrderId());
		payload.setOrderShipmentId(savedRefundRequest.getOrderShipmentId());
		payload.setOrderItemId(sourceDto.getOrderItemId());
		payload.setShopId(savedRefundRequest.getShopId());
		payload.setCustomerId(savedRefundRequest.getCustomerId());
		payload.setReason(savedRefundRequest.getReason());
		payload.setDescription(sourceDto.getDescription());
		payload.setQuantity(savedRefundRequest.getQuantity());
		payload.setRequestedAmount(savedRefundRequest.getRequestedAmount());
		payload.setItems(sourceDto.getItems());
		payload.setAttachments(sourceDto.getAttachments());
		payload.setRecipient(resolveShopRecipient(savedRefundRequest.getShopId()));
		payload.setPickupContact(resolveCustomerPickup(savedRefundRequest.getCustomerId()));
		return payload;
	}

	private RecipientDTO resolveCustomerPickup(Long customerId) {
		List<Address> addresses = addressService.getAddressesByUserId(customerId);
		if (addresses == null || addresses.isEmpty()) {
			return null;
		}

		Address address = addresses.stream()
				.filter(item -> Objects.equals(item.getIsDefault(), 1))
				.findFirst()
				.orElse(addresses.get(0));
		return mapRecipient(address);
	}

	private RecipientDTO resolveShopRecipient(Long shopId) {
		Address address = addressService.getAddressByShopId(shopId);
		if (address == null) {
			return null;
		}
		return mapRecipient(address);
	}

	private RecipientDTO mapRecipient(Address address) {
		RecipientDTO recipientDTO = new RecipientDTO();
		recipientDTO.setName(address.getRecipientName());
		recipientDTO.setPhone(address.getRecipientPhone());
		recipientDTO.setAddress(address.getAddressLine());
		recipientDTO.setProvince(address.getCity());
		recipientDTO.setDistrict(address.getDistrict());
		recipientDTO.setWard(address.getWard());
		return recipientDTO;
	}
	 
	public List<ReturnRequest> getAll() {
		refundRequestRepository.findAll().forEach(request -> {
			request.getItems().forEach(item -> {
				System.out.println("OrderItemId: " + longField(item, "orderItemId")
						+ " Quantity: " + intField(item, "quantity")
						+ " RequestedAmount: " + doubleField(item, "requestedAmount"));
			});
		});
		
		return refundRequestRepository.findAll().stream()
				.filter(request -> request.getAttachments().size()>0) // Replace 1L with the actual customer ID you want to filter by
				.toList();
	}
	
	public ReturnRequest getRefundRequestById(Long id) {
		return refundRequestRepository.findById(id).orElse(null);
	}

	public RefundCalculationResultDTO getRefundCalculation(Long id) {
		return refundCalculationService.calculateByReturnRequestId(id);
	}

	public ReturnRequest updateStatus(Long id, ReturnRequestStatus status, Double refundedAmount) {
		ReturnRequest request = refundRequestRepository.findById(id).orElse(null);
		if (request == null) {
			return null;
		}

		request.setStatus(status);
		if (status == ReturnRequestStatus.REFUNDED) {
			double resolvedRefundAmount;
			if (refundedAmount != null) {
				resolvedRefundAmount = refundedAmount;
			} else {
				RefundCalculationResultDTO calculation = refundCalculationService.calculate(request);
				resolvedRefundAmount = Math.min(
						request.getRequestedAmount(),
						Math.max(0.0, calculation.getSuggestedRefundAmount()));
			}
			request.setRefundedAmount(resolvedRefundAmount);
		} else if (refundedAmount != null) {
			request.setRefundedAmount(refundedAmount);
		}
		request.setUpdatedAt(LocalDateTime.now());
		return refundRequestRepository.save(request);
	}

	private void setFieldValue(Object target, String fieldName, Object value) {
		try {
			Field field = target.getClass().getDeclaredField(fieldName);
			field.setAccessible(true);
			field.set(target, value);
		} catch (ReflectiveOperationException ex) {
			throw new IllegalStateException("Cannot set field " + fieldName, ex);
		}
	}

	private long longField(Object target, String fieldName) {
		Object value = readField(target, fieldName);
		if (value instanceof Number number) {
			return number.longValue();
		}
		return 0L;
	}

	private int intField(Object target, String fieldName) {
		Object value = readField(target, fieldName);
		if (value instanceof Number number) {
			return number.intValue();
		}
		return 0;
	}

	private double doubleField(Object target, String fieldName) {
		Object value = readField(target, fieldName);
		if (value instanceof Number number) {
			return number.doubleValue();
		}
		return 0.0;
	}

	private Object readField(Object target, String fieldName) {
		try {
			Field field = target.getClass().getDeclaredField(fieldName);
			field.setAccessible(true);
			return field.get(target);
		} catch (ReflectiveOperationException ex) {
			throw new IllegalStateException("Cannot read field " + fieldName, ex);
		}
	}
	
}
