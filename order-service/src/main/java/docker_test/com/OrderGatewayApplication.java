package docker_test.com;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.reactive.function.client.WebClient;

//import docker_test.com.models.Cart;

@SpringBootApplication
//@EnableDiscoveryClient
public class OrderGatewayApplication {
  
	 @Autowired
	    private RedisTemplate template;
	
    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
	
	public static void main(String[] args) {
		 		SpringApplication.run(OrderGatewayApplication.class, args);
	}

}
