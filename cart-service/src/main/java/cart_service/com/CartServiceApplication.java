package cart_service.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController
@SpringBootApplication(
//		scanBasePackages = {
//        "cart_service.com",
//        "docker_test.com"
//}
		)
public class CartServiceApplication {
	
    

	public static void main(String[] args) {
		SpringApplication.run(CartServiceApplication.class, args);
	}

}
