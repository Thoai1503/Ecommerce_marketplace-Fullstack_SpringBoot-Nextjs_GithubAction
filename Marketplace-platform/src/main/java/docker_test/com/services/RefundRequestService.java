package docker_test.com.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.configs.DBConnection;
import docker_test.com.configs.publisher.ReturnRequestToLogistic;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.dto.RequestItemDTO;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationRequest;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationResponse;
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
	private final VoucherCheckoutCalculationService voucherCheckoutCalculationService;
	private final AddressService addressService;
	
	public RefundRequestService(
			RefundRequestRepository refundRequestRepository,
			ReturnReqestItemRepositrory returnReqestItemRepositrory,
			ReturnRequestAttachmentService returnRequestAttachmentService,
			ReturnRequestToLogistic returnRequestToLogistic,
			VoucherCheckoutCalculationService voucherCheckoutCalculationService) {
		this.refundRequestRepository = refundRequestRepository;
		this.returnReqestItemRepositrory = returnReqestItemRepositrory;
		this.returnRequestAttachmentService = returnRequestAttachmentService;
        this.returnRequestToLogistic = returnRequestToLogistic;
		this.voucherCheckoutCalculationService = voucherCheckoutCalculationService;
		this.addressService = new AddressService();
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
	
	@Transactional
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
		RefundCalculation calculation = calculateRefund(refundRequestDTO);
		refundRequestDTO.setRequestedAmount(calculation.refundAmount());
		refundRequestDTO.setQuantity(
				calculation.acceptedQuantities().values().stream().mapToInt(Integer::intValue).sum());
		applyCalculatedAmountsToDtoItems(refundRequestDTO, calculation);

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
				int acceptedQuantity = calculation.acceptedQuantities().getOrDefault(item.getOrderItemId(), 0);
				if (acceptedQuantity <= 0) {
					return;
				}
				docker_test.com.models.refunds.ReturnRequestItem refundRequestItem = new docker_test.com.models.refunds.ReturnRequestItem();
				refundRequestItem.setReturnRequestId(savedRefundRequest.getId());
				refundRequestItem.setOrderItemId(item.getOrderItemId());
				refundRequestItem.setQuantity(acceptedQuantity);
				refundRequestItem.setRequestedAmount(item.getRequestedAmount());
				returnReqestItemRepositrory.save(refundRequestItem);
			});
		}
		
		applyCalculationMetadata(savedRefundRequest, calculation);
		
		return savedRefundRequest;
	}

	private RefundCalculation calculateRefund(RefundRequestDTO refundRequestDTO) {
		if (refundRequestDTO.getOrderId() == null || refundRequestDTO.getItems() == null
				|| refundRequestDTO.getItems().isEmpty()) {
			double fallbackAmount = money(refundRequestDTO.getRequestedAmount());
			return new RefundCalculation(
					fallbackAmount,
					fallbackAmount,
					0.0,
					0.0,
					0.0,
					0.0,
					Map.of(),
					Map.of(),
					null);
		}

		List<OrderItemSnapshot> orderItems = findOrderItems(refundRequestDTO.getOrderId());
		if (orderItems.isEmpty()) {
			throw new IllegalArgumentException("Không tìm thấy item của đơn hàng để tính hoàn tiền");
		}

		Map<Long, OrderItemSnapshot> itemById = orderItems.stream()
				.collect(Collectors.toMap(OrderItemSnapshot::orderItemId, item -> item));
		Map<Long, Integer> previousReturnQty = findPreviousReturnQuantities(refundRequestDTO.getOrderId());
		Map<Long, Integer> requestedQty = normalizeRequestedQuantities(refundRequestDTO.getItems());
		Map<Long, Integer> acceptedQty = new LinkedHashMap<>();

		for (Map.Entry<Long, Integer> entry : requestedQty.entrySet()) {
			OrderItemSnapshot item = itemById.get(entry.getKey());
			if (item == null) {
				continue;
			}

			int alreadyReturned = previousReturnQty.getOrDefault(item.orderItemId(), 0);
			int remainingBeforeThisRequest = Math.max(0, item.quantity() - alreadyReturned);
			int accepted = Math.min(entry.getValue(), remainingBeforeThisRequest);
			if (accepted > 0) {
				acceptedQty.put(item.orderItemId(), accepted);
			}
		}

		if (acceptedQty.isEmpty()) {
			throw new IllegalArgumentException("Không còn số lượng hợp lệ để tạo yêu cầu trả hàng");
		}

		double previousRefundAmount = findPreviousRefundAmount(refundRequestDTO.getOrderId());
		double originalProductPayable = orderItems.stream()
				.mapToDouble(this::netAfterAllVouchers)
				.sum();
		double originalPlatformCommission = orderItems.stream()
				.mapToDouble(OrderItemSnapshot::platformCommissionAmount)
				.sum();
		double returnedGrossAmount = acceptedQty.entrySet().stream()
				.mapToDouble(entry -> {
					OrderItemSnapshot item = itemById.get(entry.getKey());
					return item == null ? 0.0 : item.price() * entry.getValue();
				})
				.sum();

		VoucherSelection voucherSelection = findVoucherSelection(refundRequestDTO.getOrderId());
		CheckoutVoucherCalculationRequest request = new CheckoutVoucherCalculationRequest();
		request.setUserId(refundRequestDTO.getCustomerId());
		request.setHasPreviousOrder(false);
		request.setSelectedShopVoucherIdsByShop(voucherSelection.shopVoucherIdsByShop());
		request.setSelectedPlatformVoucherIds(voucherSelection.platformVoucherIds());
		request.setItems(orderItems.stream()
				.map(item -> toRemainingVoucherItem(
						item,
						previousReturnQty.getOrDefault(item.orderItemId(), 0)
								+ acceptedQty.getOrDefault(item.orderItemId(), 0)))
				.filter(Objects::nonNull)
				.toList());

		CheckoutVoucherCalculationResponse recalculated =
				voucherCheckoutCalculationService.calculateForReturn(request);
		double remainingPayable = recalculated.getItems().stream()
				.mapToDouble(CheckoutVoucherCalculationResponse.ItemBreakdown::getTotalAfterAllVouchers)
				.sum();
		double remainingPlatformCommission = recalculated.getPlatformCommissionAmount();
		double refundAmount = money(Math.max(0.0,
				originalProductPayable - remainingPayable - previousRefundAmount));
		double voucherClawback = money(Math.max(0.0, returnedGrossAmount - refundAmount));
		double platformCommissionAdjustment = money(Math.max(0.0,
				originalPlatformCommission - remainingPlatformCommission));
		Map<Long, Double> refundByOrderItemId = distributeRefund(acceptedQty, itemById, refundAmount);
		String message = refundAmount <= 0.0 && returnedGrossAmount > 0.0
				? "Bạn sẽ không được hoàn tiền cho yêu cầu này vì sau khi trả sản phẩm, đơn hàng không còn đủ điều kiện áp dụng voucher. Giá trị voucher bị thu hồi đã lớn hơn hoặc bằng giá trị sản phẩm trả."
				: null;

		return new RefundCalculation(
				refundAmount,
				money(returnedGrossAmount),
				voucherClawback,
				money(remainingPayable),
				money(remainingPlatformCommission),
				platformCommissionAdjustment,
				acceptedQty,
				refundByOrderItemId,
				message);
	}

	private void applyCalculatedAmountsToDtoItems(RefundRequestDTO refundRequestDTO, RefundCalculation calculation) {
		if (refundRequestDTO.getItems() == null) {
			return;
		}

		refundRequestDTO.getItems().forEach(item -> {
			item.setQuantity(calculation.acceptedQuantities().getOrDefault(item.getOrderItemId(), 0));
			item.setRequestedAmount(calculation.refundByOrderItemId().getOrDefault(item.getOrderItemId(), 0.0));
		});
	}

	private void applyCalculationMetadata(ReturnRequest request, RefundCalculation calculation) {
		request.setReturnedGrossAmount(calculation.returnedGrossAmount());
		request.setVoucherClawbackAmount(calculation.voucherClawbackAmount());
		request.setRemainingPayableAmount(calculation.remainingPayableAmount());
		request.setRemainingPlatformCommissionAmount(calculation.remainingPlatformCommissionAmount());
		request.setPlatformCommissionAdjustmentAmount(calculation.platformCommissionAdjustmentAmount());
		request.setRefundMessage(calculation.message());
	}

	private Map<Long, Integer> normalizeRequestedQuantities(List<RequestItemDTO> items) {
		Map<Long, Integer> quantities = new LinkedHashMap<>();
		for (RequestItemDTO item : items) {
			if (item.getOrderItemId() == null || item.getQuantity() <= 0) {
				continue;
			}
			quantities.merge(item.getOrderItemId(), item.getQuantity(), Integer::sum);
		}
		return quantities;
	}

	private CheckoutVoucherCalculationRequest.Item toRemainingVoucherItem(
			OrderItemSnapshot item,
			int returnedQuantity) {
		int remainingQuantity = Math.max(0, item.quantity() - returnedQuantity);
		if (remainingQuantity <= 0) {
			return null;
		}

		CheckoutVoucherCalculationRequest.Item voucherItem = new CheckoutVoucherCalculationRequest.Item();
		voucherItem.setItemKey(String.valueOf(item.orderItemId()));
		voucherItem.setShopId(item.shopId());
		voucherItem.setProductId(item.productId());
		voucherItem.setVariantId(item.variantId());
		voucherItem.setCategoryId(item.categoryId());
		voucherItem.setBrandId(item.brandId());
		voucherItem.setQuantity(remainingQuantity);
		voucherItem.setPrice(item.price());
		return voucherItem;
	}

	private Map<Long, Double> distributeRefund(
			Map<Long, Integer> acceptedQty,
			Map<Long, OrderItemSnapshot> itemById,
			double refundAmount) {
		Map<Long, Double> result = new LinkedHashMap<>();
		double totalGross = acceptedQty.entrySet().stream()
				.mapToDouble(entry -> {
					OrderItemSnapshot item = itemById.get(entry.getKey());
					return item == null ? 0.0 : item.price() * entry.getValue();
				})
				.sum();

		if (refundAmount <= 0.0 || totalGross <= 0.0) {
			acceptedQty.keySet().forEach(itemId -> result.put(itemId, 0.0));
			return result;
		}

		double remaining = refundAmount;
		int index = 0;
		int size = acceptedQty.size();
		for (Map.Entry<Long, Integer> entry : acceptedQty.entrySet()) {
			index++;
			OrderItemSnapshot item = itemById.get(entry.getKey());
			double gross = item == null ? 0.0 : item.price() * entry.getValue();
			double amount = index == size ? remaining : money(refundAmount * gross / totalGross);
			remaining = money(remaining - amount);
			result.put(entry.getKey(), amount);
		}

		return result;
	}

	private List<OrderItemSnapshot> findOrderItems(Long orderId) {
		String sql = """
				SELECT
					oi.id,
					oi.shop_id,
					oi.product_id,
					oi.variant_id,
					oi.quantity,
					oi.price,
					oi.total_price,
					COALESCE(oi.shop_voucher_discount_amount, 0) AS shop_voucher_discount_amount,
					COALESCE(oi.platform_voucher_discount_amount, 0) AS platform_voucher_discount_amount,
					COALESCE(oi.total_voucher_discount_amount, 0) AS total_voucher_discount_amount,
					COALESCE(oi.total_after_shop_voucher, 0) AS total_after_shop_voucher,
					COALESCE(oi.total_after_all_vouchers, 0) AS total_after_all_vouchers,
					COALESCE(oi.platform_commission_amount, 0) AS platform_commission_amount,
					p.category_id,
					p.brand_id
				FROM order_item oi
				LEFT JOIN product p ON p.id = oi.product_id
				WHERE oi.order_id = ?
				""";

		List<OrderItemSnapshot> items = new ArrayList<>();
		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, orderId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				items.add(new OrderItemSnapshot(
						rs.getLong("id"),
						getLong(rs, "shop_id"),
						getLong(rs, "product_id"),
						getLong(rs, "variant_id"),
						getLong(rs, "category_id"),
						getLong(rs, "brand_id"),
						Math.max(0, rs.getInt("quantity")),
						money(rs.getDouble("price")),
						money(rs.getDouble("total_price")),
						money(rs.getDouble("shop_voucher_discount_amount")),
						money(rs.getDouble("platform_voucher_discount_amount")),
						money(rs.getDouble("total_voucher_discount_amount")),
						money(rs.getDouble("total_after_shop_voucher")),
						money(rs.getDouble("total_after_all_vouchers")),
						money(rs.getDouble("platform_commission_amount"))));
			}
		} catch (Exception e) {
			throw new RuntimeException("Không thể đọc order_item để tính hoàn tiền", e);
		}

		return items;
	}

	private Map<Long, Integer> findPreviousReturnQuantities(Long orderId) {
		String sql = """
				SELECT rri.order_item_id, COALESCE(SUM(rri.quantity), 0) AS returned_quantity
				FROM return_request_item rri
				JOIN return_request rr ON rr.id = rri.return_request_id
				WHERE rr.order_id = ?
				  AND UPPER(rr.status) NOT IN ('REJECTED', 'CANCELED', 'CANCELLED')
				GROUP BY rri.order_item_id
				""";

		Map<Long, Integer> result = new HashMap<>();
		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, orderId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				result.put(rs.getLong("order_item_id"), Math.max(0, rs.getInt("returned_quantity")));
			}
		} catch (Exception e) {
			throw new RuntimeException("Không thể đọc số lượng trả hàng trước đó", e);
		}
		return result;
	}

	private double findPreviousRefundAmount(Long orderId) {
		String sql = """
				SELECT COALESCE(SUM(requested_amount), 0) AS refunded_amount
				FROM return_request
				WHERE order_id = ?
				  AND UPPER(status) NOT IN ('REJECTED', 'CANCELED', 'CANCELLED')
				""";

		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, orderId);
			ResultSet rs = ps.executeQuery();
			return rs.next() ? money(rs.getDouble("refunded_amount")) : 0.0;
		} catch (Exception e) {
			throw new RuntimeException("Không thể đọc số tiền đã yêu cầu hoàn trước đó", e);
		}
	}

	private VoucherSelection findVoucherSelection(Long orderId) {
		String sql = """
				SELECT DISTINCT
					vr.voucher_id,
					v.issuer_type,
					v.issuer_id,
					oi.shop_id
				FROM voucher_redemption vr
				JOIN voucher v ON v.id = vr.voucher_id
				LEFT JOIN voucher_redemption_item vri ON vri.voucher_redemption_id = vr.id
				LEFT JOIN order_item oi ON oi.id = vri.order_item_id
				WHERE vr.order_id = ?
				  AND UPPER(COALESCE(vr.status, 'SUCCESS')) = 'SUCCESS'
				""";

		Map<String, List<Long>> shopVoucherIdsByShop = new LinkedHashMap<>();
		List<Long> platformVoucherIds = new ArrayList<>();
		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, orderId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Long voucherId = getLong(rs, "voucher_id");
				if (voucherId == null || voucherId <= 0) {
					continue;
				}

				String issuerType = normalize(rs.getString("issuer_type"));
				if ("SHOP".equals(issuerType)) {
					Long shopId = getLong(rs, "issuer_id");
					if (shopId == null || shopId <= 0) {
						shopId = getLong(rs, "shop_id");
					}
					if (shopId != null && shopId > 0) {
						shopVoucherIdsByShop
								.computeIfAbsent(String.valueOf(shopId), ignored -> new ArrayList<>())
								.add(voucherId);
					}
				} else if ("PLATFORM".equals(issuerType)) {
					if (!platformVoucherIds.contains(voucherId)) {
						platformVoucherIds.add(voucherId);
					}
				}
			}
		} catch (Exception e) {
			throw new RuntimeException("Không thể đọc voucher đã áp dụng cho đơn hàng", e);
		}

		shopVoucherIdsByShop.replaceAll((shopId, voucherIds) -> voucherIds.stream().distinct().toList());
		return new VoucherSelection(shopVoucherIdsByShop, platformVoucherIds);
	}

	private double netAfterAllVouchers(OrderItemSnapshot item) {
		if (item.totalAfterAllVouchers() > 0.0) {
			return money(item.totalAfterAllVouchers());
		}
		double subtotal = item.totalPrice() > 0.0 ? item.totalPrice() : item.price() * item.quantity();
		return money(Math.max(0.0, subtotal - item.totalVoucherDiscountAmount()));
	}

	private Long getLong(ResultSet rs, String columnName) throws Exception {
		Object value = rs.getObject(columnName);
		return value == null ? null : ((Number) value).longValue();
	}

	private double money(double value) {
		if (Double.isNaN(value) || Double.isInfinite(value)) {
			return 0.0;
		}
		return Math.round(Math.max(0.0, value) * 100.0) / 100.0;
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
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

	private record OrderItemSnapshot(
			Long orderItemId,
			Long shopId,
			Long productId,
			Long variantId,
			Long categoryId,
			Long brandId,
			int quantity,
			double price,
			double totalPrice,
			double shopVoucherDiscountAmount,
			double platformVoucherDiscountAmount,
			double totalVoucherDiscountAmount,
			double totalAfterShopVoucher,
			double totalAfterAllVouchers,
			double platformCommissionAmount) {
	}

	private record VoucherSelection(
			Map<String, List<Long>> shopVoucherIdsByShop,
			List<Long> platformVoucherIds) {
	}

	private record RefundCalculation(
			double refundAmount,
			double returnedGrossAmount,
			double voucherClawbackAmount,
			double remainingPayableAmount,
			double remainingPlatformCommissionAmount,
			double platformCommissionAdjustmentAmount,
			Map<Long, Integer> acceptedQuantities,
			Map<Long, Double> refundByOrderItemId,
			String message) {
	}
	
}
