package docker_test.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

//import docker_test.com.models.Cart;

@SpringBootApplication
@RestController
//@EnableDiscoveryClient

@RequestMapping("/api/order")
public class OrderGatewayApplication {

	@GetMapping("/")
	public String hello() {
		return "Hello World";
	}
	
    @GetMapping("/{id}")
    public String getOrder(@PathVariable Long id) {
        return "Order " + id;
    }
	
	
	public static void main(String[] args) {

		
		SpringApplication.run(OrderGatewayApplication.class, args);
	}

}
