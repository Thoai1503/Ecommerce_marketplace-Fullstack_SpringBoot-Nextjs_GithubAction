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
import docker_test.com.models.Category;
import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;

@RestController
@RequestMapping("/category")
public class CategoryController {
	
	 private final IRepositories repositories;
	 

   public CategoryController ( JdbcTemplate jdbcTemplate) {
	 

	   repositories = RepoFactoryImpl.Instance().createRepo("category");
   }
   
   @GetMapping("")
   public  ResponseEntity getAll() {
	   
	   var list = repositories.GetAll();
	   
	   return ResponseEntity.ok(list);
   }
   @PostMapping("")
   public  ResponseEntity create(@RequestBody Category item) throws SQLException {
	   
	   var list = repositories.Create(item);
	   
	   return ResponseEntity.ok(list);
   }
   
}
