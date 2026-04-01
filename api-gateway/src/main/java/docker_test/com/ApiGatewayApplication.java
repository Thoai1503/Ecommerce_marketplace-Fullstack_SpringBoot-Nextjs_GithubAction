package docker_test.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication(scanBasePackages = {
        "cart_service.com",
        "docker_test.com"
})
//@EnableDiscoveryClient
@RestController

public class ApiGatewayApplication {
    @GetMapping("/hello")
    public String hello() {
<<<<<<< HEAD
    	return "Hello";
=======
    	return "Hello api gateway";
    }
     @GetMapping("/test")
    public String hello1() {
    	return "Calling api testing";
    }
         @GetMapping("/test2")
    public String hello2() {
    	return "Calling api testing 2";
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
    }
	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
