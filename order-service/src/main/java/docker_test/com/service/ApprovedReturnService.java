package docker_test.com.service;

import org.springframework.stereotype.Service;

import docker_test.com.dto.RefundedToOrderServiceDTO;
import docker_test.com.repository.OrderItemRepository;

@Service
public class ApprovedReturnService {
     private final OrderItemRepository orderItemRepository;
     
     public ApprovedReturnService(OrderItemRepository orderItemRepository) {
    	 	this.orderItemRepository = orderItemRepository;
     }
     
     public void processApprovedReturn(RefundedToOrderServiceDTO approvedReturnRequest) {
		 var itemsToReturn= approvedReturnRequest.getRefundCalculationResult().getItems().stream().filter(item -> item.getCurrentReturnQuantity() > 0).toList();
		 for (var item : itemsToReturn) {
			 orderItemRepository.updateReturnQuantity(item.getOrderItemId(), item.getCurrentReturnQuantity());
			 // You can also add logging here to track the updates
			 // log.info("Updated return quantity for OrderItem ID {}: new return quantity={}", item.getOrderItemId(), item.getCurrentReturnQuantity());
		 }
     }
     
}
