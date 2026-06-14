package docker_test.com.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
class LoginController {
	@GetMapping("/login")
	String login() {
		return "login";
	}
	
	@PostMapping("/login")
	String loginPost(HttpServletRequest request) {
		
			var username = request.getParameter("username");
				var password = request.getParameter("password");
		
		return "redirect:/?username="+username+"&password="+password;
	}
	
}