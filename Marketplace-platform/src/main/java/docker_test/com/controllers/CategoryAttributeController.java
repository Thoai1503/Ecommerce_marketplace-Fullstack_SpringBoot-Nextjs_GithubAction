package docker_test.com.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.repository.CategoryAttributeRepository;

@RestController
@RequestMapping("/category-attribute")
public class CategoryAttributeController {
    private CategoryAttributeRepository categoryAttributeRepository;
    
    public CategoryAttributeController() {
	this.categoryAttributeRepository= categoryAttributeRepository.Instance();
	}
	
	@GetMapping("category/{category_id}")
	public ResponseEntity getByCategory(@PathVariable int category_id) {
		var list = categoryAttributeRepository.GetByCategoryId(category_id);
		
		
		
		return ResponseEntity.ok(list);
	}
	
}
