package docker_test.com;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.reactive.function.client.WebClient;

//import docker_test.com.models.Cart;

@SpringBootApplication
@RestController
//@EnableDiscoveryClient

@RequestMapping("/api/orders")
public class OrderGatewayApplication {
  
	 @Autowired
	    private RedisTemplate template;
	
	@GetMapping("")
	public String hello() {
		   template.opsForValue().setIfAbsent("loda","hello world");

	        // In ra màn hình Giá trị của key "loda" trong Redis
	        System.out.println("Value of key loda: "+template.opsForValue().get("loda"));
		return template.opsForValue().get("loda").toString();
	}
	
    @GetMapping("/{id}")
    public String getOrder(@PathVariable Long id) {
        return "Order " + id;
    }
    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
	
	public static void main(String[] args) {
		 		SpringApplication.run(OrderGatewayApplication.class, args);
	}

}
