<<<<<<< HEAD
//package docker_test.com.configs;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // áp dụng cho toàn bộ API
//                .allowedOrigins(
//                        "http://localhost:3000",
//                        "http://localhost:3002",
//                        "http://localhost:5173",
//                        "http://103.90.225.130:4000",
//                        "http://103.90.225.130"
//                )
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                .allowedHeaders("*")
//                .allowCredentials(true)
//                .maxAge(3600);
//    }
//}
=======
package docker_test.com.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // áp dụng cho toàn bộ API
                .allowedOrigins(
                        "http://localhost:3000",
                         "http://localhost:3002",
                        "http://localhost:5173",
                        "http://103.90.225.130:4000",
                        "http://103.90.225.130"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da
