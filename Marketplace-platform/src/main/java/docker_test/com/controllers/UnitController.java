package docker_test.com.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.repository.UnitRepository;

@RestController
@RequestMapping("/unit")
public class UnitController {

	private UnitRepository unitRepository;
	
	public UnitController() {
		this.unitRepository = unitRepository.Instance();
	
	}
   
	
	@GetMapping("")
	public ResponseEntity getAll() {
		var list = unitRepository.GetAll();
		 
		return ResponseEntity.ok(list);
	}
}
