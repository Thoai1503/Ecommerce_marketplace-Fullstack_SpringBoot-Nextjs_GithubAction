package stock_gateway.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StockServiceApplication {


	// Change to trigger build and test in CI/CD pipeline
	public static void main(String[] args) {
		SpringApplication.run(StockServiceApplication.class, args);
	}

}
