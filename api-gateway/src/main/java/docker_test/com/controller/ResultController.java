package docker_test.com.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ResultController {
   @GetMapping("/result")
   String result() {
	   return "result";
   }
}
