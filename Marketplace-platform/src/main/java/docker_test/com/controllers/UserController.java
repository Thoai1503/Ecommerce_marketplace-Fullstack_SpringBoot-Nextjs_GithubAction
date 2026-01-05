package docker_test.com.controllers;

import java.sql.SQLException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;

@RestController
@RequestMapping("/users")
public class UserController {

	private UserRepository userRepository;

	public UserController() {
		this.userRepository = UserRepository.Instance();
	}

	@GetMapping("")
	public ResponseEntity<?> getAll() {
		var list = userRepository.GetAll();
		return ResponseEntity.ok(list);
	}


	@PostMapping("")
	public ResponseEntity<?> create(@RequestBody User item) throws SQLException {
		var result = userRepository.Create(item);
		return ResponseEntity.ok(result);
	}
}
