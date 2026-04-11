package logistic_service.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.TimeZone;

@SpringBootApplication
public class LogisticServiceApplication {
	
	
	public static void main(String[] args) {
		// Set default timezone BEFORE Spring initializes
		// This ensures all timestamp operations use Asia/Ho_Chi_Minh timezone
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		
		SpringApplication.run(LogisticServiceApplication.class, args);
	}

}
