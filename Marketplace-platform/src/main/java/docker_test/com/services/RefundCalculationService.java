package docker_test.com.services;

import java.lang.reflect.Field;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import docker_test.com.dto.OrderItemSnapshotDTO;
import docker_test.com.dto.OrderPricingSnapshotDTO;
import docker_test.com.dto.OrderShipmentSnapshotDTO;
import docker_test.com.dto.RefundCalculationItemDTO;
import docker_test.com.dto.RefundCalculationResultDTO;
import docker_test.com.dto.RefundCalculationResultDTO.RefundCalculationShipmentDTO;
import docker_test.com.models.refunds.ReturnRequest;
import docker_test.com.models.refunds.ReturnRequestStatus;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.repository.RefundRequestRepository;
import docker_test.com.repository.VoucherRedemptionRepository;
import docker_test.com.repository.VoucherRepository;
import jakarta.transaction.Transactional;

@Service
public class RefundCalculationService {
	private final RestTemplate restTemplate;
    private final String orderServiceUrl;
    private  final VoucherRepository voucherRepository;
    private final VoucherRedemptionRepository voucherRedemptionRepository;
    
    
    private static final EnumSet<ReturnRequestStatus> APPROVED_RETURN_STATUSES = EnumSet.of(
            ReturnRequestStatus.APPROVED,
            ReturnRequestStatus.RECEIVED,
            ReturnRequestStatus.INSPECTION_PASSED,
            ReturnRequestStatus.REFUNDED);

    private final RefundRequestRepository refundRequestRepository;
    private final OrderPricingSnapshotService orderPricingSnapshotService;

    public RefundCalculationService(
            RefundRequestRepository refundRequestRepository,
            OrderPricingSnapshotService orderPricingSnapshotService,
            @Value("${order.service.url:http://localhost:8002}") String orderServiceUrl

    		) {
    			this.restTemplate = new RestTemplate();
    							this.voucherRedemptionRepository = VoucherRedemptionRepository.Instance();
        this.refundRequestRepository = refundRequestRepository;
        this.orderServiceUrl = orderServiceUrl;
        this.voucherRepository = VoucherRepository.Instance();
        this.orderPricingSnapshotService = orderPricingSnapshotService;
    }

    @Transactional
    public RefundCalculationResultDTO calculate(ReturnRequest currentRequest) {
        ReturnRequest managedRequest = refundRequestRepository.findById(currentRequest.getId())
            .orElseThrow(() -> new IllegalArgumentException("Return request not found: " + currentRequest.getId()));

        OrderPricingSnapshotDTO snapshot = orderPricingSnapshotService
            .getOrderPricingSnapshot(managedRequest.getOrderId());

        List<ReturnRequest> approvedRequests = refundRequestRepository
            .findByOrderIdAndStatusIn(managedRequest.getOrderId(), List.copyOf(APPROVED_RETURN_STATUSES));

        Map<Long, Integer> approvedReturnedQuantityByItem = new HashMap<>();
        double alreadyRefundedAmount = 0.0;

        for (ReturnRequest request : approvedRequests) {
            if (request.getId().equals(managedRequest.getId())) {
                continue;
            }

            request.getItems().forEach(item -> approvedReturnedQuantityByItem.merge(
                    longField(item, "orderItemId"),
                    Math.max(0, intField(item, "quantity")),
                    Integer::sum));

            if (request.getStatus() == ReturnRequestStatus.REFUNDED) {
                alreadyRefundedAmount = money(alreadyRefundedAmount + money(request.getRefundedAmount()));
            }
        }

        Map<Long, Integer> currentReturnQuantityByItem = new HashMap<>();
        managedRequest.getItems().forEach(item -> currentReturnQuantityByItem.merge(
            longField(item, "orderItemId"),
            Math.max(0, intField(item, "quantity")),
                Integer::sum));

        RefundCalculationResultDTO result = new RefundCalculationResultDTO();
        result.setReturnRequestId(managedRequest.getId());
        result.setOrderId(managedRequest.getOrderId());

        double currentPaidAmount = 0.0;
        double recalculatedAmount = 0.0;

        for (OrderItemSnapshotDTO item : snapshot.getItems()) {
            int originalQuantity = Math.max(0, safeInt(item.getQuantity()));
            if (originalQuantity == 0 || item.getId() == null) {
                continue;
            }

            int approvedReturnedQuantity = Math.min(
                    originalQuantity,
                    Math.max(0, approvedReturnedQuantityByItem.getOrDefault(item.getId(), 0)));
            int maxCurrentReturn = Math.max(0, originalQuantity - approvedReturnedQuantity);
            int currentReturnQuantity = Math.min(
                    maxCurrentReturn,
                    Math.max(0, currentReturnQuantityByItem.getOrDefault(item.getId(), 0)));
            int effectiveQuantity = Math.max(0, originalQuantity - approvedReturnedQuantity - currentReturnQuantity);

            double itemPaid = money(safeMoney(item.getTotalAfterAllVouchers()));
            double paidPerUnit = originalQuantity == 0 ? 0.0 : money(itemPaid / originalQuantity);
            double effectiveAmount = money(paidPerUnit * effectiveQuantity);

            currentPaidAmount = money(currentPaidAmount + itemPaid);
            recalculatedAmount = money(recalculatedAmount + effectiveAmount);

            RefundCalculationItemDTO detail = new RefundCalculationItemDTO();
            detail.setOrderItemId(item.getId());
            detail.setOriginalQuantity(originalQuantity);
            detail.setApprovedReturnedQuantity(approvedReturnedQuantity);
            detail.setCurrentReturnQuantity(currentReturnQuantity);
            detail.setEffectiveQuantity(effectiveQuantity);
            detail.setPaidPerUnit(paidPerUnit);
            detail.setEffectiveAmount(effectiveAmount);
            detail.setShipmentId(item.getShipmentId());
            detail.setPrice(safeMoney(item.getPrice()));
            result.getItems().add(detail);
        }

        double suggestedRefundAmount = money(Math.max(0.0, currentPaidAmount - recalculatedAmount - alreadyRefundedAmount));

        result.setCurrentPaidAmount(currentPaidAmount);
        result.setTotalAmount(snapshot.getTotalAmount());
        result.setRecalculatedAmount(recalculatedAmount);
        result.setAlreadyRefundedAmount(alreadyRefundedAmount);
        result.setSuggestedRefundAmount(suggestedRefundAmount);
        result.setShipments(snapshot.getShipments().stream().map(shipment -> {
			RefundCalculationResultDTO.RefundCalculationShipmentDTO shipmentDTO = new RefundCalculationResultDTO.RefundCalculationShipmentDTO();
		shipmentDTO.setId(shipment.getId());
		shipmentDTO.setShopId(shipment.getShopId());
		shipmentDTO.setSubtotal(safeMoney(shipment.getSubtotal()));
		shipmentDTO.setTotalAfterVoucher(safeMoney(shipment.getTotalAfterVoucher()));

		shipmentDTO.setItems(result.getItems().stream()
				.filter(item -> item.getShipmentId() == shipment.getId())
				.toList());
			shipmentDTO.setVoucherIds(shipment.getVoucherIds() == null ? List.of() : shipment.getVoucherIds());
			return shipmentDTO;
		}).toList());

        return result;
    }
    
    @Transactional
    public RefundCalculationResultDTO calculateByReturnRequestId(Long returnRequestId) {
        ReturnRequest request = refundRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found: " + returnRequestId));
        return calculate(request);
    }
    
    @Transactional
    public double calculateSuggestedRefundAmountByReturnRequestId(Long returnRequestId) {
		ReturnRequest request = refundRequestRepository.findById(returnRequestId)
				.orElseThrow(() -> new IllegalArgumentException("Return request not found: " + returnRequestId));
		return calculateSuggestedRefundAmountByReturnRequestId(request);
	}
    
    @Transactional
    public double calculateSuggestedRefundAmountByReturnRequestId(ReturnRequest currentRequest) {
			
			RefundCalculationResultDTO result = calculate(currentRequest);
            var shipments = result.getShipments();
			
			var voucherRedemptions = voucherRedemptionRepository.getByOrderId(currentRequest.getOrderId());
			List<Voucher> vouchers = voucherRepository.getBySetOfIds(voucherRedemptions.stream().map(vr -> vr.getVoucherId()).toList());
			if (vouchers == null) {
				vouchers = List.of();
			}
	    	Map<Long, Voucher> voucherMap = mapVouchersById(vouchers);
			
			//Map<Long, Double> shipmentTotalAfterRemoveReturnedItem = calculateTotalAfterRemoveReturnedItemByShipment(shipments);
			double totalAfterRemoveReturnedItem = totalAllShipmentAfterRemoveReturnedItem(shipments);
			double newPaidResult = money(Math.max(0.0, totalAfterRemoveReturnedItem - result.getAlreadyRefundedAmount()));
			Voucher platformVoucher = getPlatformVoucher(vouchers);
	        var isEligibleForPlatformVoucher = isEligibleForPlatformVoucher(totalAfterRemoveReturnedItem, platformVoucher);
		   
		    newPaidResult = applyAllVoucherStrategy(shipments, voucherMap);
		          				
			
			var isHaveNotEligibleShopVoucher = shipments.stream().anyMatch(shipment -> {
			         return	! shipment.isEligibleVoucherForRefund();
				 
			});
 			var returnAmount = 0.0;
			if (isEligibleForPlatformVoucher && !isHaveNotEligibleShopVoucher) {
				returnAmount = money(result.getItems().stream()
						.filter(item -> item.getCurrentReturnQuantity() > 0)
						.mapToDouble(item -> item.getCurrentReturnQuantity()*item.getPrice()).sum());
			} else if (!isEligibleForPlatformVoucher && isHaveNotEligibleShopVoucher) {
				returnAmount =
						money(result.getItems().stream()
								.filter(item -> item.getCurrentReturnQuantity() > 0)
								.mapToDouble(item -> item.getCurrentReturnQuantity()*item.getPrice()).sum());
			} else if (!isEligibleForPlatformVoucher && !isHaveNotEligibleShopVoucher) {
				returnAmount =  (money(result.getCurrentPaidAmount() - newPaidResult));
			} else if (isEligibleForPlatformVoucher && isHaveNotEligibleShopVoucher) {
				returnAmount =  (money(result.getCurrentPaidAmount() - newPaidResult));
			} else {
			    returnAmount = money(result.getItems().stream()
						.filter(item -> item.getCurrentReturnQuantity() > 0)
						.mapToDouble(item -> item.getCurrentReturnQuantity()*item.getPrice()).sum());
			}				
			return returnAmount;
	}
     
    
    
    private double calculateRefundAmountViaEligibleVoucherStrategy(RefundCalculationResultDTO result, Map<Long, Voucher> voucherMap) {
    			var shipments = result.getShipments();
    			Map<Long, Double> shipmentTotalAfterRemoveReturnedItem = calculateTotalAfterRemoveReturnedItemByShipment(shipments);
    			double totalAfterRemoveReturnedItem = totalAllShipmentAfterRemoveReturnedItem(shipments);
    			double newPaidResult = money(Math.max(0.0, totalAfterRemoveReturnedItem - result.getAlreadyRefundedAmount()));
    			Voucher platformVoucher = getPlatformVoucher(voucherMap.values().stream().toList());
    			if (isEligibleForPlatformVoucher(totalAfterRemoveReturnedItem, platformVoucher)) {
				
					newPaidResult = applyAllVoucherStrategy(shipments, voucherMap);
			          				
				}
    			return newPaidResult;
    			
    }
    
    
    
    private double applyAllVoucherStrategy(List<RefundCalculationShipmentDTO> shipments, Map<Long, Voucher> voucherMap) {
				double totalAfterShopVoucher = applyShopVoucherStrategy(shipments, voucherMap);
				Voucher platformVoucher = getPlatformVoucher(voucherMap.values().stream().toList());
				return applyPlatformVoucherStrategy(totalAfterShopVoucher, platformVoucher);
	}
    
    
    private double applyShopVoucherStrategy(List<RefundCalculationShipmentDTO> shipments, Map<Long, Voucher> voucherMap) {
    			double totalAfterShopVoucher = 0.0;
    			for (RefundCalculationShipmentDTO shipment : shipments) {
    				double shipmentTotal = shipment.getItems().stream()
							.mapToDouble(item -> item.getPrice() * item.getEffectiveQuantity())
							.sum();
    		        if(shipment.getVoucherIds().size()==0) {
    		        	shipment.setEligibleVoucherForRefund(true);
    		        }
    				
    				
					for (Long voucherId : shipment.getVoucherIds()) {
						Voucher voucher = voucherMap.get(voucherId) != null ? voucherMap.get(voucherId) : null;
						boolean  isEligible = isEligibleForShopVoucher(shipmentTotal, voucher);
						shipment.setEligibleVoucherForRefund(isEligible);
						if (isEligible) {
							if ("PERCENT".equals(voucher.getDiscountType()) && voucher.getDiscountPercent() != null) {
								double discountAmount = money(shipmentTotal * voucher.getDiscountPercent().doubleValue() / 100.0);
								if (voucher.getMaxDiscountAmount() != null) {
									discountAmount = Math.min(discountAmount, voucher.getMaxDiscountAmount().doubleValue());
								}
								shipmentTotal = money(Math.max(0.0, shipmentTotal - discountAmount));
							} else if ("FIXED".equals(voucher.getDiscountType()) && voucher.getDiscountAmount() != null) {
								shipmentTotal = money(Math.max(0.0, shipmentTotal - voucher.getDiscountAmount().doubleValue()));
							}
						}
						
					}
					totalAfterShopVoucher = money(totalAfterShopVoucher + Math.max(0.0, shipmentTotal));									
    									
    	        }
    			return totalAfterShopVoucher;
    }
    
    

    private double applyPlatformVoucherStrategy(double totalAfterRemoveReturnedItem, Voucher platformVoucher) {
    			if (platformVoucher == null) {
    			   return totalAfterRemoveReturnedItem;
    			}
    			
    			double discountOrderAmount = 0.0;
    			if (isEligibleForPlatformVoucher(totalAfterRemoveReturnedItem, platformVoucher)) {
					if ("PERCENT".equals(platformVoucher.getDiscountType()) && platformVoucher.getDiscountPercent() != null) {
						discountOrderAmount = money(totalAfterRemoveReturnedItem * platformVoucher.getDiscountPercent().doubleValue() / 100.0);
						if (platformVoucher.getMaxDiscountAmount() != null) {
							discountOrderAmount = Math.min(discountOrderAmount, platformVoucher.getMaxDiscountAmount().doubleValue());
						}
					} else if ("FIXED".equals(platformVoucher.getDiscountType()) && platformVoucher.getDiscountAmount() != null) {
						discountOrderAmount = platformVoucher.getDiscountAmount().doubleValue();
					}
				}
    			
    			return money(Math.max(0.0, totalAfterRemoveReturnedItem - discountOrderAmount));
    }
    
    
    
    
    private boolean isEligibleForShopVoucher(Double totalShipmentAfterRemoveReturnedItem, Voucher shopVoucher) {
		
    	if (shopVoucher == null) {
			return true ;
		}
		if (shopVoucher.getMinOrderValue() != null && totalShipmentAfterRemoveReturnedItem < shopVoucher.getMinOrderValue().doubleValue()) {
			return false;
		}
		if (shopVoucher.getMaxOrderValue() != null && totalShipmentAfterRemoveReturnedItem > shopVoucher.getMaxOrderValue().doubleValue()) {
		    return false;
		}
		return true;
		
    }
    
    
    
    private boolean isEligibleForPlatformVoucher(Double totalAfterRemoveReturnedItem, Voucher platformVoucher) {
		if (platformVoucher == null) {
			return false;
		}
		if (platformVoucher.getMinOrderValue() != null && totalAfterRemoveReturnedItem < platformVoucher.getMinOrderValue().doubleValue()) {
			return false;
		}
		if (platformVoucher.getMaxOrderValue() != null && totalAfterRemoveReturnedItem > platformVoucher.getMaxOrderValue().doubleValue()) {
			return false;
		}
		return true;
    	
    }
    
    
    private Voucher getPlatformVoucher(List<Voucher> vouchers) {
    	return vouchers.stream().filter(voucher -> voucher.getIssuerType().equals("PLATFORM")).findFirst().orElse(null);
    }
    private Voucher getShopVoucher(List<Voucher> vouchers, Long shopId) {
		return vouchers.stream().filter(voucher -> voucher.getIssuerType().equals("SHOP") && voucher.getIssuerId() != null && voucher.getIssuerId().equals(shopId)).findFirst().orElse(null);
	}
    

    
    private Map<Long, Double> calculateTotalAfterRemoveReturnedItemByShipment(List<RefundCalculationShipmentDTO> shipments) {
    			Map<Long, Double> totalAfterRemoveReturnedItemByShipment = new HashMap<>();
    			for(RefundCalculationShipmentDTO shipment : shipments) {
					double totalAfterRemoveReturnedItem = totalShipmentAfterRemoveReturnedItem(shipment);
					totalAfterRemoveReturnedItemByShipment.put(shipment.getId(), totalAfterRemoveReturnedItem);
				}
    			return totalAfterRemoveReturnedItemByShipment;
    }
    
    
    private 	Map<Long, Voucher> mapVouchersById(List<Voucher> vouchers) {
    	Map<Long, Voucher> voucherMap = new HashMap<>();
		for (Voucher voucher : vouchers) {
			voucherMap.put(voucher.getId(), voucher);	
		}
		return voucherMap;
    }
    

 
    private double totalAllShipmentAfterRemoveReturnedItem(List< RefundCalculationShipmentDTO> shipments) {
		double total = 0.0;
		for (RefundCalculationShipmentDTO shipment : shipments) {
			
			
			double shipmentTotal = totalShipmentAfterRemoveReturnedItem(shipment);
			total = money(total + shipmentTotal);
			
		}
		return total;

	}
    
    
    
    private double totalShipmentAfterRemoveReturnedItem(RefundCalculationShipmentDTO shipment) {
    			return money(safeMoney(shipment.getItems().stream().mapToDouble(item -> item.getPrice() * item.getEffectiveQuantity()).sum()
    					));
    			
    }
    

    private double safeMoney(Double value) {
        if (value == null || value.isNaN() || value.isInfinite()) {
            return 0.0;
        }
        return Math.max(0.0, value);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private double money(double value) {
        return Math.round(value * 100.0) / 100.0;
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
