package docker_test.com.controllers;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.Category;
import docker_test.com.repository.CategoryRepository;

@RestController
@RequestMapping("/categories")
public class CategoryController {
   private CategoryRepository categoryRepository;
   public CategoryController () {
	   this.categoryRepository = categoryRepository.Instance();
   }
   
   @GetMapping("")
   public  ResponseEntity getAll() {
	   
	   var list = categoryRepository.GetAll();
	   
	   return ResponseEntity.ok(list);
   }
   @PostMapping("")
   public  ResponseEntity create(@RequestBody Category item) throws SQLException {
	   
	   var list = categoryRepository.Create(item);
	   
	   return ResponseEntity.ok(list);
   }
   
}
