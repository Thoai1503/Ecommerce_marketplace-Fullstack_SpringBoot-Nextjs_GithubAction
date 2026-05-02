package payment_service.com;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@RestController
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class PaymentServiceApplication {

	@GetMapping("/health")
	public String healthCheck() {
		return "Payment Service is healthy";
	}
	
	@PostConstruct
	void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}
	public static void main(String[] args) {
		
		//init();
		
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

}
