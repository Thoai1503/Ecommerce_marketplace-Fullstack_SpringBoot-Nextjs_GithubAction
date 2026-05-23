package docker_test.com.services;

import java.lang.reflect.Field;
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

import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import docker_test.com.configs.DBConnection;
import docker_test.com.configs.publisher.RefundedToOrderService;
import docker_test.com.configs.publisher.ReturnRequestToLogistic;
import docker_test.com.dto.RecipientDTO;
import docker_test.com.dto.RefundCalculationResultDTO;
import docker_test.com.dto.RefundRequestDTO;
import docker_test.com.dto.RefundedToOrderServiceDTO;
import docker_test.com.dto.RequestItemDTO;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationRequest;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationResponse;
import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestItem;
import docker_test.com.models.refunds.ReturnRequestStatus;
import docker_test.com.models.Address;
import docker_test.com.models.ReturnShipment;
import docker_test.com.models.ReturnShipmentStatus;
import docker_test.com.repository.RefundRequestRepository;
import docker_test.com.repository.ReturnReqestItemRepositrory;
import docker_test.com.repository.ReturnShipmentRepository;
import jakarta.transaction.Transactional;

@Service
public class RefundRequestService {

	private final RefundRequestRepository refundRequestRepository;
	private final ReturnReqestItemRepositrory returnReqestItemRepositrory;
	private final ReturnRequestAttachmentService returnRequestAttachmentService;
	private final ReturnRequestToLogistic returnRequestToLogistic;
	private final VoucherCheckoutCalculationService voucherCheckoutCalculationService;
	private final AddressService addressService;
	private final RefundCalculationService refundCalculationService;
	private final RefundedToOrderService refundedToOrderService;
	private final ReturnShipmentRepository returnShipmentRepository;
	private final static Logger LOGGER = org.slf4j.LoggerFactory.getLogger(RefundRequestService.class);

	
	public RefundRequestService(
			RefundRequestRepository refundRequestRepository,
			ReturnReqestItemRepositrory returnReqestItemRepositrory,
			ReturnRequestAttachmentService returnRequestAttachmentService,
			ReturnRequestToLogistic returnRequestToLogistic,
			RefundCalculationService refundCalculationService,
			VoucherCheckoutCalculationService voucherCheckoutCalculationService,
			RefundedToOrderService refundedToOrderService,
			ReturnShipmentRepository returnShipmentRepository
		
			) {
			
		this.refundRequestRepository = refundRequestRepository;
		this.returnReqestItemRepositrory = returnReqestItemRepositrory;
		this.returnRequestAttachmentService = returnRequestAttachmentService;
        this.returnRequestToLogistic = returnRequestToLogistic;
		this.voucherCheckoutCalculationService = voucherCheckoutCalculationService;
		this.addressService = new AddressService();
		this.refundCalculationService = refundCalculationService;
		this.refundedToOrderService = refundedToOrderService;
		this.returnShipmentRepository = returnShipmentRepository;
	
	}
	
	
	@Transactional
	public ReturnRequest createRefundRequest(RefundRequestDTO refundRequestDTO) {
		ReturnRequest savedRefundRequest = persistRefundRequest(refundRequestDTO);

		if (refundRequestDTO.getAttachments() != null && !refundRequestDTO.getAttachments().isEmpty()) {
			returnRequestAttachmentService.createAttachments(savedRefundRequest.getId(), refundRequestDTO.getAttachments());
		}

//		returnRequestToLogistic.publish(buildLogisticPayload(savedRefundRequest, refundRequestDTO));

		return savedRefundRequest;
	}

	
	@Transactional
	public ReturnRequest getRefundRequestsByOrderShipmentId(Long orderShipmentId) {
		ReturnRequest request = refundRequestRepository.findByOrderShipmentId(orderShipmentId);
		enrichReturnRequest(request);
		return request;
	}

	public Map<String, Object> previewRefundRequest(RefundRequestDTO refundRequestDTO) {
		RefundCalculation calculation = calculateRefund(refundRequestDTO);
		return Map.of(
				"requestedAmount", calculation.refundAmount(),
				"returnedGrossAmount", calculation.returnedGrossAmount(),
				"voucherClawbackAmount", calculation.voucherClawbackAmount(),
				"remainingPayableAmount", calculation.remainingPayableAmount(),
				"remainingPlatformCommissionAmount", calculation.remainingPlatformCommissionAmount(),
				"platformCommissionAdjustmentAmount", calculation.platformCommissionAdjustmentAmount(),
				"refundMessage", calculation.message() == null ? "" : calculation.message());
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
		
//		returnRequestToLogistic.publish(buildLogisticPayload(savedRefundRequest, refundRequestDTO));

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
			throw new IllegalArgumentException("No items from the order could be found to process the refund.");
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
			throw new IllegalArgumentException("There are no longer valid quantities to create a return request.");
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
		double returnedAfterShopVoucherAmount = acceptedQty.entrySet().stream()
				.mapToDouble(entry -> amountAfterShopVoucher(itemById.get(entry.getKey()), entry.getValue()))
				.sum();
		double returnedPaidAmount = acceptedQty.entrySet().stream()
				.mapToDouble(entry -> amountAfterAllVouchers(itemById.get(entry.getKey()), entry.getValue()))
				.sum();

		VoucherSelection voucherSelection = findVoucherSelection(refundRequestDTO.getOrderId());
		List<RemainingItem> remainingItems = orderItems.stream()
				.map(item -> toRemainingItem(
						item,
						previousReturnQty.getOrDefault(item.orderItemId(), 0)
								+ acceptedQty.getOrDefault(item.orderItemId(), 0)))
				.filter(Objects::nonNull)
				.toList();

		// Return refunds are evaluated by voucher layers: platform first on the
		// remaining amount after original shop voucher, then shop clawback.
		CheckoutVoucherCalculationResponse platformRecalculated =
				voucherCheckoutCalculationService.calculateForReturn(buildPlatformReturnRequest(
						refundRequestDTO,
						voucherSelection,
						remainingItems));
		double remainingAfterPlatformLayer = platformRecalculated.getItems().stream()
				.mapToDouble(CheckoutVoucherCalculationResponse.ItemBreakdown::getTotalAfterAllVouchers)
				.sum();

		CheckoutVoucherCalculationResponse shopRecalculated =
				voucherCheckoutCalculationService.calculateForReturn(buildShopReturnRequest(
						refundRequestDTO,
						voucherSelection,
						remainingItems));
		double remainingShopVoucherDiscount = remainingItems.stream()
				.mapToDouble(RemainingItem::shopVoucherDiscountAmount)
				.sum();
		double remainingPlatformVoucherBase = remainingItems.stream()
				.mapToDouble(RemainingItem::amountAfterShopVoucher)
				.sum();
		double shopVoucherClawback = money(Math.max(0.0,
				remainingShopVoucherDiscount - safe(shopRecalculated.getShopVoucherDiscount())));
		double remainingPayable = money(remainingAfterPlatformLayer + shopVoucherClawback);
		double remainingPlatformCommission = shopRecalculated.getPlatformCommissionAmount();
		boolean platformVoucherInvalidated = remainingPlatformVoucherBase > 0.0
				&& hasMissingAppliedVoucher(voucherSelection.platformVoucherIds(), platformRecalculated);
		boolean shopVoucherInvalidated = remainingShopVoucherDiscount > 0.0
				&& hasMissingAppliedVoucher(shopVoucherIds(voucherSelection), shopRecalculated);
		boolean voucherInvalidated = platformVoucherInvalidated || shopVoucherInvalidated;
		double refundAmount = voucherInvalidated
				? signedMoney(originalProductPayable - remainingPayable - previousRefundAmount)
				: money(returnedPaidAmount);
		double voucherClawback = voucherInvalidated
				? money(Math.max(0.0, returnedAfterShopVoucherAmount - refundAmount))
				: 0.0;
		double finalRemainingPayable = voucherInvalidated
				? remainingPayable
				: money(Math.max(0.0, originalProductPayable - previousRefundAmount - refundAmount));
		double platformCommissionAdjustment = money(Math.max(0.0,
				originalPlatformCommission - remainingPlatformCommission));
		Map<Long, Double> refundByOrderItemId = voucherInvalidated
				? distributeRefund(acceptedQty, itemById, refundAmount)
				: distributePaidRefund(acceptedQty, itemById);
		String message = buildRefundMessage(
				refundAmount,
				platformVoucherInvalidated,
				shopVoucherInvalidated);

		return new RefundCalculation(
				refundAmount,
				money(returnedGrossAmount),
				voucherClawback,
				money(finalRemainingPayable),
				money(remainingPlatformCommission),
				platformCommissionAdjustment,
				acceptedQty,
				refundByOrderItemId,
				message);
	}
	
	private ReturnShipment buildLogisticPayload(ReturnRequest savedRefundRequest,Long returnRequestID) {
	return	ReturnShipment.builder()
				.returnRequestId(String.valueOf(returnRequestID))
			
				.status(ReturnShipmentStatus.PENDING)
				.build();
	
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

	private String buildRefundMessage(
			double refundAmount,
			boolean platformVoucherInvalidated,
			boolean shopVoucherInvalidated) {
		if (!platformVoucherInvalidated && !shopVoucherInvalidated) {
			return null;
		}
		String invalidatedVoucherLabel = invalidatedVoucherLabel(
				platformVoucherInvalidated,
				shopVoucherInvalidated);
		if (refundAmount < 0.0) {
			return "You will have to pay extra for this item. "
					+ formatVnd(Math.abs(refundAmount))
					+ " because " + invalidatedVoucherLabel + " is no longer valid";
		}
		if (refundAmount > 0.0) {
			return "The amount you will receive is "
					+ formatVnd(refundAmount)
					+ " because " + invalidatedVoucherLabel + " is no longer valid";
		}
		return "You will not receive a refund for this request because "
				+ invalidatedVoucherLabel
				+ " is no longer valid";
	}

	private String invalidatedVoucherLabel(
			boolean platformVoucherInvalidated,
			boolean shopVoucherInvalidated) {
		if (platformVoucherInvalidated && shopVoucherInvalidated) {
			return "voucher sàn và voucher shop";
		}
		if (platformVoucherInvalidated) {
			return "voucher sàn";
		}
		return "voucher shop";
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

	private RemainingItem toRemainingItem(
			OrderItemSnapshot item,
			int returnedQuantity) {
		int remainingQuantity = Math.max(0, item.quantity() - returnedQuantity);
		if (remainingQuantity <= 0) {
			return null;
		}

		return new RemainingItem(
				item,
				remainingQuantity,
				lineSubtotal(item, remainingQuantity),
				amountAfterShopVoucher(item, remainingQuantity),
				proratedAmount(item.shopVoucherDiscountAmount(), item.quantity(), remainingQuantity));
	}

	private CheckoutVoucherCalculationRequest buildPlatformReturnRequest(
			RefundRequestDTO refundRequestDTO,
			VoucherSelection voucherSelection,
			List<RemainingItem> remainingItems) {
		CheckoutVoucherCalculationRequest request = baseReturnVoucherRequest(refundRequestDTO);
		request.setSelectedPlatformVoucherIds(voucherSelection.platformVoucherIds());
		request.setItems(remainingItems.stream()
				.map(item -> toVoucherItem(item.orderItem(), item.amountAfterShopVoucher()))
				.toList());
		return request;
	}

	private CheckoutVoucherCalculationRequest buildShopReturnRequest(
			RefundRequestDTO refundRequestDTO,
			VoucherSelection voucherSelection,
			List<RemainingItem> remainingItems) {
		CheckoutVoucherCalculationRequest request = baseReturnVoucherRequest(refundRequestDTO);
		request.setSelectedShopVoucherIdsByShop(voucherSelection.shopVoucherIdsByShop());
		request.setItems(remainingItems.stream()
				.map(item -> toVoucherItem(item.orderItem(), item.grossAmount()))
				.toList());
		return request;
	}

	private CheckoutVoucherCalculationRequest baseReturnVoucherRequest(RefundRequestDTO refundRequestDTO) {
		CheckoutVoucherCalculationRequest request = new CheckoutVoucherCalculationRequest();
		request.setUserId(refundRequestDTO.getCustomerId());
		request.setHasPreviousOrder(false);
		return request;
	}

	private CheckoutVoucherCalculationRequest.Item toVoucherItem(
			OrderItemSnapshot item,
			double amount) {
		CheckoutVoucherCalculationRequest.Item voucherItem = new CheckoutVoucherCalculationRequest.Item();
		voucherItem.setItemKey(String.valueOf(item.orderItemId()));
		voucherItem.setShopId(item.shopId());
		voucherItem.setProductId(item.productId());
		voucherItem.setVariantId(item.variantId());
		voucherItem.setCategoryId(item.categoryId());
		voucherItem.setBrandId(item.brandId());
		voucherItem.setQuantity(1);
		voucherItem.setPrice(money(amount));
		return voucherItem;
	}

	private List<Long> shopVoucherIds(VoucherSelection voucherSelection) {
		return voucherSelection.shopVoucherIdsByShop().values().stream()
				.flatMap(List::stream)
				.distinct()
				.toList();
	}

	private boolean hasMissingAppliedVoucher(
			List<Long> selectedVoucherIds,
			CheckoutVoucherCalculationResponse response) {
		if (selectedVoucherIds == null || selectedVoucherIds.isEmpty()) {
			return false;
		}
		List<Long> appliedVoucherIds = response.getVoucherApplications().stream()
				.map(CheckoutVoucherCalculationResponse.VoucherApplication::getVoucherId)
				.filter(Objects::nonNull)
				.distinct()
				.toList();
		return selectedVoucherIds.stream()
				.filter(Objects::nonNull)
				.anyMatch(voucherId -> !appliedVoucherIds.contains(voucherId));
	}

	private Map<Long, Double> distributeRefund(
			Map<Long, Integer> acceptedQty,
			Map<Long, OrderItemSnapshot> itemById,
			double refundAmount) {
		Map<Long, Double> result = new LinkedHashMap<>();
		double totalReturnedAfterShop = acceptedQty.entrySet().stream()
				.mapToDouble(entry -> {
					OrderItemSnapshot item = itemById.get(entry.getKey());
					return amountAfterShopVoucher(item, entry.getValue());
				})
				.sum();

		if (refundAmount == 0.0 || totalReturnedAfterShop <= 0.0) {
			acceptedQty.keySet().forEach(itemId -> result.put(itemId, 0.0));
			return result;
		}

		double remaining = refundAmount;
		int index = 0;
		int size = acceptedQty.size();
		for (Map.Entry<Long, Integer> entry : acceptedQty.entrySet()) {
			index++;
			OrderItemSnapshot item = itemById.get(entry.getKey());
			double returnedAfterShop = amountAfterShopVoucher(item, entry.getValue());
			double amount = index == size
					? remaining
					: signedMoney(refundAmount * returnedAfterShop / totalReturnedAfterShop);
			remaining = signedMoney(remaining - amount);
			result.put(entry.getKey(), amount);
		}

		return result;
	}

	private Map<Long, Double> distributePaidRefund(
			Map<Long, Integer> acceptedQty,
			Map<Long, OrderItemSnapshot> itemById) {
		Map<Long, Double> result = new LinkedHashMap<>();
		for (Map.Entry<Long, Integer> entry : acceptedQty.entrySet()) {
			result.put(
					entry.getKey(),
					amountAfterAllVouchers(itemById.get(entry.getKey()), entry.getValue()));
		}
		return result;
	}

	private double amountAfterShopVoucher(OrderItemSnapshot item, int quantity) {
		if (item == null || quantity <= 0) {
			return 0.0;
		}
		return money(lineSubtotal(item, quantity)
				- proratedAmount(item.shopVoucherDiscountAmount(), item.quantity(), quantity));
	}

	private double amountAfterAllVouchers(OrderItemSnapshot item, int quantity) {
		if (item == null || quantity <= 0) {
			return 0.0;
		}
		return proratedAmount(netAfterAllVouchers(item), item.quantity(), quantity);
	}

	private double lineSubtotal(OrderItemSnapshot item, int quantity) {
		if (item == null || quantity <= 0) {
			return 0.0;
		}
		double itemSubtotal = item.totalPrice() > 0.0 ? item.totalPrice() : item.price() * item.quantity();
		if (item.quantity() <= 0) {
			return money(itemSubtotal);
		}
		return money(itemSubtotal * quantity / item.quantity());
	}

	private double proratedAmount(double amount, int originalQuantity, int targetQuantity) {
		if (amount <= 0.0 || originalQuantity <= 0 || targetQuantity <= 0) {
			return 0.0;
		}
		return money(amount * targetQuantity / originalQuantity);
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
			throw new RuntimeException("Unable to read order_item to calculate refund.", e);
		}

		return items;
	}

	private Map<Long, Integer> findPreviousReturnQuantities(Long orderId) {
		String sql = """
				SELECT rri.order_item_id, COALESCE(SUM(rri.quantity), 0) AS returned_quantity
				FROM return_request_item rri
				JOIN return_request rr ON rr.id = rri.return_request_id
				WHERE rr.order_id = ?
				  AND UPPER(rr.status) NOT IN ('REJECTED', 'CANCELED', 'CANCELLED',"PENDING_APPROVAL")
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
			throw new RuntimeException("Unable to read previous return quantities.", e);
		}
		return result;
	}

	private double findPreviousRefundAmount(Long orderId) {
		String sql = """
				SELECT COALESCE(SUM(requested_amount), 0) AS refunded_amount
				FROM return_request
				WHERE order_id = ?
				  AND UPPER(status) NOT IN ('REJECTED', 'CANCELED', 'CANCELLED',"PENDING_APPROVAL")
				""";

		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, orderId);
			ResultSet rs = ps.executeQuery();
			return rs.next() ? signedMoney(rs.getDouble("refunded_amount")) : 0.0;
		} catch (Exception e) {
			throw new RuntimeException("Unable to read previously requested refund amount.", e);
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
			throw new RuntimeException("Unable to read applied vouchers for the order.", e);
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

	private double signedMoney(double value) {
		if (Double.isNaN(value) || Double.isInfinite(value)) {
			return 0.0;
		}
		double rounded = Math.round(value * 100.0) / 100.0;
		return rounded == -0.0 ? 0.0 : rounded;
	}

	private double safe(Double value) {
		return value == null || value.isNaN() || value.isInfinite() ? 0.0 : value;
	}

	private String formatVnd(double value) {
		return String.format(Locale.ROOT, "%.0f đ", money(value));
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
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
		recipientDTO.setId(address.getAddressId());
		recipientDTO.setName(address.getRecipientName());
		recipientDTO.setPhone(address.getRecipientPhone());
		recipientDTO.setAddress(address.getAddressLine());
		recipientDTO.setProvince(address.getCity());
		recipientDTO.setDistrict(address.getDistrict());
		recipientDTO.setWard(address.getWard());
		return recipientDTO;
	}
	 
	@Transactional
	public List<ReturnRequest> getAll() {
		List<ReturnRequest> requests = refundRequestRepository.findAll();
		logReturnRequestItems(requests);
		return prepareReturnRequests(requests);
	}

	@Transactional
	public List<ReturnRequest> getByShopId(Long shopId) {
		List<ReturnRequest> requests = refundRequestRepository.findByShopId(shopId);
		logReturnRequestItems(requests);
		return prepareReturnRequests(requests);
	}
	
	@Transactional
	public ReturnRequest getRefundRequestById(Long id) {
		ReturnRequest request = refundRequestRepository.findById(id).orElse(null);
		enrichReturnRequest(request);
		return request;
	}

	public RefundCalculationResultDTO getRefundCalculation(Long id) {
		return refundCalculationService.calculateByReturnRequestId(id);
	}

	private void initializeReturnRequestDetails(ReturnRequest request) {
		if (request == null) {
			return;
		}
		if (request.getItems() != null) {
			request.getItems().size();
		}
		if (request.getAttachments() != null) {
			request.getAttachments().size();
		}
	}

	private void logReturnRequestItems(List<ReturnRequest> requests) {
		requests.forEach(request -> {
			request.getItems().forEach(item -> {
				System.out.println("OrderItemId: " + longField(item, "orderItemId")
						+ " Quantity: " + intField(item, "quantity")
						+ " RequestedAmount: " + doubleField(item, "requestedAmount"));
			});
		});
	}

	private List<ReturnRequest> prepareReturnRequests(List<ReturnRequest> requests) {
		List<ReturnRequest> filteredRequests = requests.stream()
				.filter(Objects::nonNull)
				.filter(request -> request.getAttachments() != null && !request.getAttachments().isEmpty())
				.toList();

		enrichReturnRequests(filteredRequests);
		return filteredRequests;
	}

	private void enrichReturnRequest(ReturnRequest request) {
		if (request == null) {
			return;
		}
		enrichReturnRequests(List.of(request));
	}

	private void enrichReturnRequests(List<ReturnRequest> requests) {
		if (requests == null || requests.isEmpty()) {
			return;
		}

		requests.forEach(this::initializeReturnRequestDetails);
		Map<Long, ReturnRequest> requestById = requests.stream()
				.filter(request -> request.getId() != null)
				.collect(Collectors.toMap(
						ReturnRequest::getId,
						request -> request,
						(first, ignored) -> first,
						LinkedHashMap::new));
		if (requestById.isEmpty()) {
			return;
		}

		List<Long> requestIds = new ArrayList<>(requestById.keySet());
		String sql = """
				SELECT
					rr.id AS return_request_id,
					o.order_number,
					o.tracking_number AS order_tracking_number,
					os.tracking_number AS shipment_tracking_number,
					os.carrier_name,
					os.shipping_status,
					u.full_name AS customer_name,
					u.email AS customer_email,
					u.phone AS customer_phone,
					u.avatar_url AS customer_avatar_url,
					s.shop_name,
					s.shop_logo
				FROM return_request rr
				LEFT JOIN orders o ON o.id = rr.order_id
				LEFT JOIN order_shipment os ON os.id = rr.order_shipment_id
				LEFT JOIN `user` u ON u.id = rr.customer_id
				LEFT JOIN shop s ON s.id = rr.shop_id
				WHERE rr.id IN (%s)
				""".formatted(placeholders(requestIds.size()));

		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			int parameterIndex = 1;
			for (Long requestId : requestIds) {
				ps.setLong(parameterIndex++, requestId);
			}

			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				ReturnRequest request = requestById.get(rs.getLong("return_request_id"));
				if (request == null) {
					continue;
				}
				request.setOrderNumber(rs.getString("order_number"));
				request.setOrderTrackingNumber(rs.getString("order_tracking_number"));
				request.setShipmentTrackingNumber(rs.getString("shipment_tracking_number"));
				request.setCarrierName(rs.getString("carrier_name"));
				request.setShippingStatus(rs.getString("shipping_status"));
				request.setCustomerName(rs.getString("customer_name"));
				request.setCustomerEmail(rs.getString("customer_email"));
				request.setCustomerPhone(rs.getString("customer_phone"));
				request.setCustomerAvatarUrl(rs.getString("customer_avatar_url"));
				request.setShopName(rs.getString("shop_name"));
				request.setShopLogo(rs.getString("shop_logo"));
			}
		} catch (Exception e) {
			throw new RuntimeException("Unable to enrich return requests.", e);
		}

		enrichReturnRequestItems(requests);
		enrichReturnShipmentAndTimeline(requests);
	}

	private void enrichReturnShipmentAndTimeline(List<ReturnRequest> requests) {
		for (ReturnRequest request : requests) {
			if (request == null || request.getId() == null) {
				continue;
			}

			Map<String, Object> returnShipment = findReturnShipmentByRequestId(request.getId());
			request.setReturnShipment(returnShipment);

			Long returnShipmentId = null;
			if (returnShipment != null) {
				Object shipmentIdValue = returnShipment.get("id");
				if (shipmentIdValue instanceof Number number) {
					returnShipmentId = number.longValue();
				}
			}

			request.setReturnShipmentHistory(
					returnShipmentId == null
							? new ArrayList<>()
							: findReturnShipmentHistory(returnShipmentId));
			request.setTimeline(findReturnRequestTimeline(request.getId()));
		}
	}

	private Map<String, Object> findReturnShipmentByRequestId(Long returnRequestId) {
		String sql = """
				SELECT
					rs.id,
					rs.return_request_id,
					rs.tracking_code,
					rs.status,
					rs.pickup_address_id,
					rs.return_address_id,
					rs.scheduled_pickup_date,
					rs.actual_pickup_date,
					rs.delivery_date,
					rs.courier_id,
					rs.courier_name,
					rs.logistics_webhook_count,
					rs.notes,
					rs.failed_reason,
					rs.retry_count,
					rs.created_at,
					rs.updated_at
				FROM return_shipment rs
				WHERE rs.return_request_id = ?
				ORDER BY rs.updated_at DESC, rs.id DESC
				LIMIT 1
				""";

		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, returnRequestId);
			ResultSet rs = ps.executeQuery();
			if (!rs.next()) {
				return null;
			}

			Map<String, Object> payload = new LinkedHashMap<>();
			payload.put("id", rs.getLong("id"));
			payload.put("returnRequestId", rs.getLong("return_request_id"));
			payload.put("trackingCode", rs.getString("tracking_code"));
			payload.put("status", rs.getString("status"));
			payload.put("pickupAddressId", rs.getObject("pickup_address_id"));
			payload.put("returnAddressId", rs.getObject("return_address_id"));
			payload.put("scheduledPickupDate", rs.getObject("scheduled_pickup_date"));
			payload.put("actualPickupDate", rs.getObject("actual_pickup_date"));
			payload.put("deliveryDate", rs.getObject("delivery_date"));
			payload.put("courierId", rs.getObject("courier_id"));
			payload.put("courierName", rs.getString("courier_name"));
			payload.put("logisticsWebhookCount", rs.getObject("logistics_webhook_count"));
			payload.put("notes", rs.getString("notes"));
			payload.put("failedReason", rs.getString("failed_reason"));
			payload.put("retryCount", rs.getObject("retry_count"));
			payload.put("createdAt", rs.getObject("created_at"));
			payload.put("updatedAt", rs.getObject("updated_at"));
			return payload;
		} catch (Exception e) {
			throw new RuntimeException("Unable to read return_shipment for return request " + returnRequestId, e);
		}
	}

	private List<Map<String, Object>> findReturnShipmentHistory(Long returnShipmentId) {
		String sql = """
				SELECT
					rsh.id,
					rsh.return_shipment_id,
					rsh.status,
					rsh.description,
					rsh.location,
					rsh.event_code,
					rsh.source,
					rsh.external_event_id,
					rsh.timestamp,
					rsh.created_at
				FROM return_shipment_history rsh
				WHERE rsh.return_shipment_id = ?
				ORDER BY rsh.timestamp DESC, rsh.id DESC
				""";

		List<Map<String, Object>> history = new ArrayList<>();
		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, returnShipmentId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Map<String, Object> row = new LinkedHashMap<>();
				row.put("id", rs.getLong("id"));
				row.put("returnShipmentId", rs.getLong("return_shipment_id"));
				row.put("status", rs.getString("status"));
				row.put("description", rs.getString("description"));
				row.put("location", rs.getString("location"));
				row.put("eventCode", rs.getString("event_code"));
				row.put("source", rs.getString("source"));
				row.put("externalEventId", rs.getString("external_event_id"));
				row.put("timestamp", rs.getObject("timestamp"));
				row.put("createdAt", rs.getObject("created_at"));
				history.add(row);
			}
		} catch (Exception e) {
			throw new RuntimeException("Unable to read return_shipment_history for shipment " + returnShipmentId, e);
		}

		return history;
	}

	private List<Map<String, Object>> findReturnRequestTimeline(Long returnRequestId) {
		String sql = """
				SELECT
					rrt.id,
					rrt.return_request_id,
					rrt.event_type,
					rrt.event_details,
					rrt.actor_id,
					rrt.actor_type,
					rrt.timestamp
				FROM return_request_timeline rrt
				WHERE rrt.return_request_id = ?
				ORDER BY rrt.timestamp DESC, rrt.id DESC
				""";

		List<Map<String, Object>> timeline = new ArrayList<>();
		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			ps.setLong(1, returnRequestId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Map<String, Object> row = new LinkedHashMap<>();
				row.put("id", rs.getLong("id"));
				row.put("returnRequestId", rs.getLong("return_request_id"));
				row.put("eventType", rs.getString("event_type"));
				row.put("eventDetails", rs.getString("event_details"));
				row.put("actorId", rs.getObject("actor_id"));
				row.put("actorType", rs.getString("actor_type"));
				row.put("timestamp", rs.getObject("timestamp"));
				timeline.add(row);
			}
		} catch (Exception e) {
			throw new RuntimeException("Unable to read return_request_timeline for return request " + returnRequestId, e);
		}

		return timeline;
	}

	private void enrichReturnRequestItems(List<ReturnRequest> requests) {
		Map<Long, ReturnRequestItem> itemById = new LinkedHashMap<>();
		for (ReturnRequest request : requests) {
			if (request.getItems() == null) {
				continue;
			}
			for (ReturnRequestItem item : request.getItems()) {
				if (item.getId() != null) {
					itemById.put(item.getId(), item);
				}
			}
		}
		if (itemById.isEmpty()) {
			return;
		}

		List<Long> itemIds = new ArrayList<>(itemById.keySet());
		String sql = """
				SELECT
					rri.id AS return_request_item_id,
					oi.product_name,
					oi.variant_name,
					oi.image AS product_image,
					oi.price,
					oi.total_price,
					oi.quantity AS order_quantity
				FROM return_request_item rri
				LEFT JOIN order_item oi ON oi.id = rri.order_item_id
				WHERE rri.id IN (%s)
				""".formatted(placeholders(itemIds.size()));

		try (Connection con = DBConnection.getConn();
				PreparedStatement ps = con.prepareStatement(sql)) {
			int parameterIndex = 1;
			for (Long itemId : itemIds) {
				ps.setLong(parameterIndex++, itemId);
			}

			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				ReturnRequestItem item = itemById.get(rs.getLong("return_request_item_id"));
				if (item == null) {
					continue;
				}
				item.setProductName(rs.getString("product_name"));
				item.setVariantName(rs.getString("variant_name"));
				item.setProductImage(rs.getString("product_image"));
				item.setPrice(money(rs.getDouble("price")));
				item.setTotalPrice(money(rs.getDouble("total_price")));
				item.setOrderQuantity(Math.max(0, rs.getInt("order_quantity")));
			}
		} catch (Exception e) {
			throw new RuntimeException("Unable to enrich return request items.", e);
		}
	}

	private String placeholders(int count) {
		StringBuilder builder = new StringBuilder();
		for (int index = 0; index < count; index++) {
			if (index > 0) {
				builder.append(",");
			}
			builder.append("?");
		}
		return builder.toString();
	}

	@Transactional
	public ReturnRequest updateStatus(Long id, ReturnRequestStatus status, Double refundedAmount) {
		ReturnRequest request = refundRequestRepository.findByIdForUpdate(id).orElse(null);
		if (request == null) {
			return null;
		}

		if (status == ReturnRequestStatus.APPROVED
				&& request.getStatus() == ReturnRequestStatus.APPROVED) {
			return request;
		}

		request.setStatus(status);
		if(status.equals(ReturnRequestStatus.APPROVED)) {
			double resolvedApprovedAmount;
			if (refundedAmount != null) {
				resolvedApprovedAmount = refundedAmount;
			} else {
				resolvedApprovedAmount = request.getRequestedAmount();
			}

			request.setApprovedAmount(resolvedApprovedAmount);
			applyApprovedAmountToItems(request, resolvedApprovedAmount);
			request.setUpdatedAt(LocalDateTime.now());
			ReturnRequest savedRequest = refundRequestRepository.save(request);

			 RefundCalculationResultDTO calculation = refundCalculationService.calculate(savedRequest);
			 RefundedToOrderServiceDTO refundedToOrderServiceDTO = new RefundedToOrderServiceDTO();
			 refundedToOrderServiceDTO.setSuggestedRefundAmount(resolvedApprovedAmount);
			 refundedToOrderServiceDTO.setRefundCalculationResult(calculation);
			 ReturnShipment returnShipment = buildLogisticPayload(savedRequest, savedRequest.getId());
			try {
				
			
			 returnShipment = returnShipmentRepository.save(returnShipment);
			}
			catch(RuntimeException e) {
				System.out.println("Error saving return shipment: " + e.getMessage());
			}
			refundedToOrderServiceDTO.setStatus(status.toString());
			refundedToOrderServiceDTO.setSuggestedRefundAmount(resolvedApprovedAmount);
			 refundedToOrderService.publish(refundedToOrderServiceDTO);
			 	
			 returnRequestToLogistic.publish(buildLogisticPayloadEvent(savedRequest,returnShipment.getId()));
			 return savedRequest;
		}
		
		
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
			RefundedToOrderServiceDTO refundedToOrderServiceDTO = new RefundedToOrderServiceDTO();

			refundedToOrderServiceDTO.setSuggestedRefundAmount(resolvedRefundAmount);
			refundedToOrderServiceDTO.setRefundCalculationResult(refundCalculationService.calculate(request));
			refundedToOrderServiceDTO.setStatus(status.toString());
			
			refundedToOrderService.publish(refundedToOrderServiceDTO);
			
			request.setRefundedAmount(resolvedRefundAmount);
			
		} else if (status == ReturnRequestStatus.INSPECTION_PASSED) {
	
			request.setApprovedAmount(request.getRequestedAmount());
		} else if (refundedAmount != null) {
			request.setRefundedAmount(refundedAmount);
		}
		request.setOrderShipmentId(request.getOrderShipmentId());
		request.setUpdatedAt(LocalDateTime.now());
		ReturnRequest savedRequest = null;
		
		try {
		
		savedRequest = refundRequestRepository.save(request);
		}
		catch(RuntimeException e) {
			System.out.println("Error saving return request: " + e.getMessage());
			 throw e; 
		}
	//	enrichReturnRequest(savedRequest);
		return savedRequest;
	}

	private void applyApprovedAmountToItems(ReturnRequest request, double approvedAmount) {
		if (request.getItems() == null || request.getItems().isEmpty()) {
			return;
		}

		double totalRequested = request.getItems().stream()
				.mapToDouble(item -> Math.max(0.0, item.getRequestedAmount()))
				.sum();

		if (totalRequested <= 0.0) {
			request.getItems().forEach(item -> item.setApprovedAmount(0.0));
			return;
		}

		double distributed = 0.0;
		for (int index = 0; index < request.getItems().size(); index++) {
			ReturnRequestItem item = request.getItems().get(index);
			if (index == request.getItems().size() - 1) {
				double remainder = money(approvedAmount - distributed);
				item.setApprovedAmount(Math.max(0.0, remainder));
				continue;
			}
			double ratio = Math.max(0.0, item.getRequestedAmount()) / totalRequested;
			double itemApprovedAmount = money(approvedAmount * ratio);
			item.setApprovedAmount(itemApprovedAmount);
			distributed += itemApprovedAmount;
		}
	}

 private RefundRequestDTO buildLogisticPayloadEvent(ReturnRequest returnRequest,Long returnShipmentId) {
	 
	 RefundRequestDTO payload = new RefundRequestDTO();
	 
	 payload.setReturnRequestId(returnRequest.getId());
	 payload.setReturnShipmentId(returnShipmentId);
	 payload.setOrderId(returnRequest.getOrderId());
	 payload.setOrderShipmentId(returnRequest.getOrderShipmentId());
	 payload.setShopId(returnRequest.getShopId());
	 payload.setCustomerId(returnRequest.getCustomerId());
	 payload.setReason(returnRequest.getReason());
	 payload.setDescription(" Return request for order " + returnRequest.getOrderId());
	 payload.setRequestedAmount(returnRequest.getRequestedAmount());
	 payload.setRecipient(resolveShopRecipient(returnRequest.getShopId()));
	 payload.setItems(returnRequest.getItems().stream().map(item -> {
			RequestItemDTO itemDTO = new RequestItemDTO();
			itemDTO.setOrderItemId(longField(item, "orderItemId"));
			itemDTO.setQuantity(intField(item, "quantity"));
			itemDTO.setRequestedAmount(doubleField(item, "requestedAmount"));
			return itemDTO;
		}).toList());
	 payload.setPickupContact(resolveCustomerPickup(returnRequest.getCustomerId()));
	 
	 return payload;
	 
	 
	 
	 
	 
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

	private record RemainingItem(
			OrderItemSnapshot orderItem,
			int remainingQuantity,
			double grossAmount,
			double amountAfterShopVoucher,
			double shopVoucherDiscountAmount) {
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