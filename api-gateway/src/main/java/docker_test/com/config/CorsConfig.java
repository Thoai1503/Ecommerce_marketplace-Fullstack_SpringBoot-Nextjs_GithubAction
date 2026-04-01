package docker_test.com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.reactive.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        config.addAllowedOrigin("http://localhost:3000");
<<<<<<< HEAD
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:8001");
=======
        config.addAllowedOrigin("http://localhost:3001");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:8001");
        config.addAllowedOrigin("http://localhost:8000");
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
        config.addAllowedOrigin("http://103.90.225.130");
        config.addAllowedOrigin("http://103.90.225.130:4000");

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}