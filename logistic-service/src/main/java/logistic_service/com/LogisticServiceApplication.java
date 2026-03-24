package logistic_service.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class LogisticServiceApplication {
	
	@GetMapping("/api/logistic")
	public String getLogisticInfo() {
		return "Logistic service is running...";
	}

	public static void main(String[] args) {
		SpringApplication.run(LogisticServiceApplication.class, args);
	}

}
