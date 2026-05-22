package docker_test.com.controllers;

import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import docker_test.com.dto.RequestItemDTO;
import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.models.refunds.ReturnRequestStatus;
import docker_test.com.services.RefundCalculationService;
import docker_test.com.services.RefundRequestService;

@RestController
@RequestMapping("/api/refunds")
public class RefundRequestController {

	private final RefundRequestService refundRequestService;
	private final RefundCalculationService refundCalculationService;
	private final Gson gson = new Gson();
	
	public RefundRequestController(RefundRequestService refundRequestService,
			
			RefundCalculationService refundCalculationService) {
			this.refundCalculationService = refundCalculationService;
		this.refundRequestService = refundRequestService;
	}
		@GetMapping("/shipment/{orderShipmentId}")
	public ResponseEntity<?> getRefundRequestsByOrderShipmentId(@PathVariable Long orderShipmentId) {
		try {
			var refundRequests = refundRequestService.getRefundRequestsByOrderShipmentId(orderShipmentId);
			return ResponseEntity.ok(refundRequests);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error fetching refund requests by orderShipmentId: " + e.getMessage());
		}
	}
	
	@GetMapping("")
	public ResponseEntity<?> getRefundRequests() {
		try {
			var refundRequests = refundRequestService.getAll();
			return ResponseEntity.ok(refundRequests);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching refund requests: " + e.getMessage());
		}
	}
	
	@GetMapping("/{refundRequestId}")
	public ResponseEntity<?> getRefundRequestById(@PathVariable Long refundRequestId) {
		try {
			var refundRequest = refundRequestService.getRefundRequestById(refundRequestId);
			if (refundRequest != null) {
				return ResponseEntity.ok(refundRequest);
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Refund request not found with id: " + refundRequestId);
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching refund request: " + e.getMessage());
		}
	}

	@GetMapping("/{refundRequestId}/calculation")
	public ResponseEntity<?> getRefundCalculation(@PathVariable Long refundRequestId) {
		try {
			var calculation = refundRequestService.getRefundCalculation(refundRequestId);
			return ResponseEntity.ok(calculation);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error calculating refund amount: " + e.getMessage());
		}
	}

	@PatchMapping("/{refundRequestId}/status")
	public ResponseEntity<?> updateRefundRequestStatus(
			@PathVariable Long refundRequestId,
			@RequestParam("status") String status,
			@RequestParam(value = "refundedAmount", required = false) Double refundedAmount) {
		try {
			ReturnRequestStatus nextStatus = ReturnRequestStatus.fromValue(status);
			var updated = refundRequestService.updateStatus(refundRequestId, nextStatus, refundedAmount);
			if (updated == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body("Refund request not found with id: " + refundRequestId);
			}
			return ResponseEntity.ok(updated);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body("status không hợp lệ");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error updating refund request status: " + e.getMessage());
		}
	}
	
	
	@PostMapping("")
	public ResponseEntity<?> createRefundRequest(@RequestBody RefundRequestDTO refundRequestDTO) {
		if (refundRequestDTO.getItems() != null) {
			refundRequestDTO.getItems().forEach(item -> {
				System.out.println("Refund Request Item - OrderItemId: " + item.getOrderItemId()+ 
							   ", Quantity: " + item.getQuantity() + 
							   ", RequestedAmount: " + item.getRequestedAmount());
			});
		}
		
		try {
			var refundRequest = refundRequestService.createRefundRequest(refundRequestDTO);
			return ResponseEntity.ok(refundRequest);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating refund request: " + e.getMessage());
		}
	}

	@PostMapping("/preview")
	public ResponseEntity<?> previewRefundRequest(@RequestBody RefundRequestDTO refundRequestDTO) {
		try {
			return ResponseEntity.ok(refundRequestService.previewRefundRequest(refundRequestDTO));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error previewing refund request: " + e.getMessage());
		}
	}

	@PostMapping(value = "/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createRefundRequestMultipart(
			@RequestParam("orderId") String orderId,
			@RequestParam("shopId") String shopId,
			@RequestParam("customerId") String customerId,
			@RequestParam("orderShipmentId") String orderShipmentId,
			@RequestParam("reason") String reason,
			@RequestParam("quantity") String quantity,
			@RequestParam("requestedAmount") String requestedAmount,
			@RequestParam(value = "items", required = false) String itemsJson,
			@RequestPart(value = "files", required = false) MultipartFile[] files,
			@RequestParam(value = "descriptions", required = false) String[] descriptions) {

		try {
			RefundRequestDTO dto = new RefundRequestDTO();
			dto.setOrderId(parseLong(orderId, "orderId"));
			dto.setShopId(parseLong(shopId, "shopId"));
			dto.setCustomerId(parseLong(customerId, "customerId"));
			dto.setReason(reason);
			dto.setQuantity(parseInt(quantity, "quantity"));
			dto.setRequestedAmount(parseDouble(requestedAmount, "requestedAmount"));
            dto.setOrderShipmentId(parseLong(orderShipmentId, "orderShipmentId"));
			
			if (itemsJson != null && !itemsJson.isBlank()) {
				Type listType = new TypeToken<List<RequestItemDTO>>() {}.getType();
				dto.setItems(gson.fromJson(itemsJson, listType));
			}

			List<MultipartFile> fileList = files == null ? List.of() : Arrays.asList(files);
			List<String> descriptionList = descriptions == null ? null : Arrays.asList(descriptions);

			var refundRequest = refundRequestService.createRefundRequestWithFiles(dto, fileList, descriptionList);
			return ResponseEntity.ok(refundRequest);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error creating refund request with attachments: " + e.getMessage());
		}
	}

	private Long parseLong(String rawValue, String fieldName) {
		try {
			return Long.parseLong(rawValue);
		} catch (Exception ex) {
			throw new IllegalArgumentException(fieldName + " không hợp lệ");
		}
	}

	private int parseInt(String rawValue, String fieldName) {
		try {
			return Integer.parseInt(rawValue);
		} catch (Exception ex) {
			throw new IllegalArgumentException(fieldName + " không hợp lệ");
		}
	}

	private double parseDouble(String rawValue, String fieldName) {
		try {
			return Double.parseDouble(rawValue);
		} catch (Exception ex) {
			throw new IllegalArgumentException(fieldName + " không hợp lệ");
		}
	}
	
	@GetMapping("/{refundRequestId}/calculate-final-price")
	public ResponseEntity<?> calculateFinalRefundPrice(@PathVariable Long refundRequestId) {
		try {
			double finalPrice = refundCalculationService.calculateSuggestedRefundAmountByReturnRequestId(refundRequestId);
			return ResponseEntity.ok(finalPrice);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error calculating final refund price: " + e.getMessage());
		}
	}
	
	
}
