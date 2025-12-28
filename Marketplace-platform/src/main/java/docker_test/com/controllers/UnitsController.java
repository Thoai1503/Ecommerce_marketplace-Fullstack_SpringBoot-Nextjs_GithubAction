package docker_test.com.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
