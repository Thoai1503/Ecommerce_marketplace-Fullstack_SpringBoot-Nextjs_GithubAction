package docker_test.com;

import java.util.Base64;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;


@Configuration
//@EnableWebFluxSecurity
@EnableWebSecurity
public class SecurityConfig {


//    @Autowired
//	private  PasswordEncoder passwordEncoder;
//	
//	public SecurityConfig(PasswordEncoder passwordEncoder) {
//		this.passwordEncoder = passwordEncoder;
//	}
	
	@Autowired
	private OncePerRequestFilter customFilter;
	


	@Bean 
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				 .httpBasic(h -> h.disable())
		            .formLogin(f -> f.disable())
				.authorizeHttpRequests((authorize) -> authorize
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/users/**","/api/notifications/**","/api/cart/**").hasAnyRole("BUYER","SELLER")
						//.requestMatchers("/api/orders/**").hasAnyRole("BUYER","SELLER","ADMIN")
						.requestMatchers("/login","/api/product/**","/api/categories/**","/product/**","/auth/login","/shops/**","/api/vouchers","/static","/api/orders","/product-variant/**","/users/register").permitAll()
						.anyRequest().authenticated())
				.addFilterBefore(customFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
				.build();
	}
	

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "http://103.90.225.130:4000",
            "https://nexamart.duckdns.org",
            "http://103.118.28.72:4000",
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
//    
	@Bean 
  public	UserDetailsService userDetailsService() {
		System.out.println("Creating in-memory user details service with users:");
		UserDetails user1 = User.builder().username("vothoai1503@gmail.com").password(passwordEncoder().encode("1234")).roles("USER").build();
		UserDetails user2 = User.builder().username("BruceLee").password(passwordEncoder().encode("1234")).roles("ADMIN").build();
		return new InMemoryUserDetailsManager(user1,user2);
	}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);   // Khuyến nghị mạnh
    }
//    
	//@Bean 
//	public AuthenticationProvider authenticationProvider(  ) {
//		DaoAuthenticationProvider provider =new DaoAuthenticationProvider();
//		provider.setPasswordEncoder(passwordEncoder());
//		provider.setUserDetailsService(userDetailsService());
//		return provider;
//	}
	
	@Bean
    public AuthenticationManager authenticationManager() {
		System.out.println("Creating AuthenticationManager with userDetailsService: " + userDetailsService());
		DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
		authenticationProvider.setPasswordEncoder(passwordEncoder());
          		authenticationProvider.setUserDetailsService(userDetailsService());
		ProviderManager providerManager = new ProviderManager(authenticationProvider);
		providerManager.setEraseCredentialsAfterAuthentication(false);

		return providerManager;
	}

}
