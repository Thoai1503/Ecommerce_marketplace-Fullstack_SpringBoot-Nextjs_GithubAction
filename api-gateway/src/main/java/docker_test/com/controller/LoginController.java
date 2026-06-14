package docker_test.com.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;

@Controller
class LoginController {
	@GetMapping("/login")
	String login() {
		return "login";
	}
//	
	@PostMapping("/login")
	String loginPost(
	        @RequestParam String username,
	        @RequestParam String password,
	        Model model) {

	    System.out.println(username);
	    System.out.println(password);

	    model.addAttribute("username", username);
	    model.addAttribute("password", password);

	    return "result";
	}
	
}