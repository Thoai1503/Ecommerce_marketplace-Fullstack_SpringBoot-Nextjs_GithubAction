package docker_test.com.controllers;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.models.Category;
import docker_test.com.models.Units;
import docker_test.com.repository.UnitsRepository;

@RestController
@RequestMapping("/unit")
public class UnitsController {

	private UnitsRepository unitsRepository;
	
	public UnitsController() {
		this.unitsRepository = unitsRepository.Instance();
	
	}
   
	
	@GetMapping("")
	public ResponseEntity getAll() {
		var list = unitsRepository.GetAll();
		 
		return ResponseEntity.ok(list);
	}
	
	@PostMapping("")
	   public  ResponseEntity create(@RequestBody Units item) throws SQLException {
		   
		   var list = unitsRepository.Create(item);
		   
		   return ResponseEntity.ok(list);
	   }
}
