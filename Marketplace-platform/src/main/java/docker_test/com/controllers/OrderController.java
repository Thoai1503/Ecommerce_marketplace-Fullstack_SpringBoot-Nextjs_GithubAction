package docker_test.com.controllers;

import java.sql.SQLException;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.Order;
import docker_test.com.models.OrderPageResponse;
import docker_test.com.repository.OrderRepository;
import docker_test.com.services.OrderService;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/api/admin/orders")
//@CrossOrigin("*")
public class OrderController {
	
	
	// Ae bắt buộc phải sử dụng IRepositories để dễ dàng thay đổi Repository tuỳ theo entityType
	 private final IRepositories repositories;
	 private final OrderService orderService;

   public OrderController ( ) {
	 
	   repositories = RepoFactoryImpl.Instance().createRepo("order");
	   this.orderService = new OrderService();
   }
   //up
//   @GetMapping("")
//   public  ResponseEntity getAll() {
//	   
//	   var list = repositories.GetAll();
//	   
//	   return ResponseEntity.ok(list);
//   }
   @PostMapping("/create")
   public  ResponseEntity create(@RequestBody Order item) throws SQLException {
	   
	   var list = repositories.Create(item);
	   	
	   return ResponseEntity.ok(list);
   }
   
   @GetMapping
   public OrderPageResponse getOrders(
           @RequestParam(required = false) Long userId,
           @RequestParam(required = false) String startDate,
           @RequestParam(required = false) String endDate,
           @RequestParam(required = false) Double minAmount,
           @RequestParam(required = false) Double maxAmount,
           @RequestParam(defaultValue = "all") String status,
           @RequestParam(defaultValue = "date") String sortBy,
           @RequestParam(defaultValue = "desc") String sortOrder,
           @RequestParam(defaultValue = "1") int page,
           @RequestParam(defaultValue = "10") int size
   ) {

       LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
       LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null;

       return orderService.getAdminOrders(
               userId,
               start,
               end,
               minAmount,
               maxAmount,
               status,
               sortBy,
               sortOrder,
               page,
               size
       );
   }
   
}

