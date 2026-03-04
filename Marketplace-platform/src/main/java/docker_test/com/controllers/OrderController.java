package docker_test.com.controllers;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.Order;
import docker_test.com.repository.OrderRepository;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/order")
public class OrderController {
	
	
	// Ae bắt buộc phải sử dụng IRepositories để dễ dàng thay đổi Repository tuỳ theo entityType
	 private final IRepositories repositories;
	 

   public OrderController ( ) {
	 

	   repositories = RepoFactoryImpl.Instance().createRepo("order");
   }
   //up
   @GetMapping("")
   public  ResponseEntity getAll() {
	   
	   var list = repositories.GetAll();
	   
	   return ResponseEntity.ok(list);
   }
   @PostMapping("")
   public  ResponseEntity create(@RequestBody Order item) throws SQLException {
	   
	   var list = repositories.Create(item);
	   	
	   return ResponseEntity.ok(list);
   }
   
}

