package docker_test.com.service;

import java.util.Collections;

import org.springframework.stereotype.Service;

import docker_test.com.dto.RefundedToOrderServiceDTO;
import docker_test.com.repository.OrderItemRepository;
import docker_test.com.repository.OrdersRepository;

@Service
public class ApprovedReturnService {
     private final OrderItemRepository orderItemRepository;
     private final OrdersRepository ordersRepository;
     
     
     public ApprovedReturnService(OrderItemRepository orderItemRepository, OrdersRepository ordersRepository) {
    	 	this.orderItemRepository = orderItemRepository;
    	 	this.ordersRepository = ordersRepository;
     }
     
     public void processApprovedReturn(RefundedToOrderServiceDTO approvedReturnRequest) {
		 if (approvedReturnRequest == null || approvedReturnRequest.getRefundCalculationResult() == null) {
			 throw new IllegalArgumentException("Invalid approved return payload: refundCalculationResult is missing");
		 }
		 //Find order by orderId
		 
		 var order = ordersRepository.findById(approvedReturnRequest.getRefundCalculationResult().getOrderId())
				 .orElseThrow(() -> new IllegalArgumentException("Order not found for ID: " + approvedReturnRequest.getRefundCalculationResult().getOrderId()));
		 
		 if("APPROVED".equals(approvedReturnRequest.getStatus().toString())){
		  order.setTotalReturnApprovedAmount(order.getTotalReturnApprovedAmount() + approvedReturnRequest.getSuggestedRefundAmount());
		 }
		 
		 ordersRepository.save(order);

		 var sourceItems = approvedReturnRequest.getRefundCalculationResult().getItems();
		 if (sourceItems == null) {	
			 sourceItems = Collections.emptyList();
		 }

		 var itemsToReturn = sourceItems.stream()
				 .filter(item -> item != null && item.getOrderItemId() != null && item.getCurrentReturnQuantity() > 0)
				 .toList();
		 for (var item : itemsToReturn) {
			 orderItemRepository.updateReturnQuantity(item.getOrderItemId(), item.getCurrentReturnQuantity());
			 // You can also add logging here to track the updates
			 // log.info("Updated return quantity for OrderItem ID {}: new return quantity={}", item.getOrderItemId(), item.getCurrentReturnQuantity());
		 }
     }
     
}
