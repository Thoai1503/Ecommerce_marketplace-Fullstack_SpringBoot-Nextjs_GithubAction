package payment_service.com.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EntityScan(basePackages = {"payment_service.com.entity"})
@EnableJpaRepositories(basePackages = {"payment_service.com.repository"})
@EnableJpaAuditing
public class JpaConfig {
}
