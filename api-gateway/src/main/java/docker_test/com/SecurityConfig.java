package docker_test.com;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
	
//	@Autowired
//	private ReactiveUserDetailsService  userDetailsService;

	@Bean
	public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
		return http
				
				.csrf(ServerHttpSecurity.CsrfSpec::disable)
				 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.authorizeExchange((authorize) -> authorize
					    .anyExchange().permitAll())
				.httpBasic(h -> h.disable())
				.formLogin(f -> f.disable())
				.build();
	}
	
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "http://103.90.225.130:4000",
            "https://nexamart.duckdns.org",
            "https://*.duckdns.org"
        ));
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
    
	
//	@Bean 
//  public	UserDetailsService userDetailsService() {
//		UserDetails user1 = User.withDefaultPasswordEncoder().username("vothoai1503@gmail.com").password("1234").roles("USER").build();
//		UserDetails user2 = User.withDefaultPasswordEncoder().username("BruceLee").password("1234").roles("ADMIN").build();
//		return new InMemoryUserDetailsManager(user1,user2);
//	}
	
    
//	@Bean
//	public MapReactiveUserDetailsService userDetailsService() {
//		UserDetails user = User.withDefaultPasswordEncoder()
//			.username("user")
//			.password("user")
//			.roles("USER")
//			.build();
//		return new MapReactiveUserDetailsService(user);
//	}
//
//	
//	private ReactiveAuthenticationManager authenticationManager() {
//		var authenticationManager = new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
//		authenticationManager.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
//		return authenticationManager;
//	}
//	private PasswordEncoder passwordEncoder() {
//		return new BCryptPasswordEncoder(10);
//	}
}
