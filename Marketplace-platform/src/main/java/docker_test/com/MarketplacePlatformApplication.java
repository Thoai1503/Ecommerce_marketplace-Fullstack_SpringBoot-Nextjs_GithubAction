package docker_test.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
//import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;



@SpringBootApplication
@ComponentScan

public class MarketplacePlatformApplication {

	
	
	public static void main(String[] args) {
		SpringApplication.run(MarketplacePlatformApplication.class, args);
	}

}
