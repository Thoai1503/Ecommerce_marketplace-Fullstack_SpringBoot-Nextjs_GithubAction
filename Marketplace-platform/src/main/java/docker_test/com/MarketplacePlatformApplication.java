package docker_test.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.kafka.annotation.EnableKafka;
//import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

import docker_test.com.threads.FileTestThread;



@SpringBootApplication
@ComponentScan
@EnableKafka

public class MarketplacePlatformApplication {

	
	
	public static void main(String[] args) {
		
//		FileTestThread myRunnable = new FileTestThread();
//		Thread thread = new Thread(myRunnable);
//		thread.start();
		SpringApplication.run(MarketplacePlatformApplication.class, args);
	}

}
