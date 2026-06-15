package docker_test.com;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import docker_test.com.service.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class ApplicationFilter  extends OncePerRequestFilter {
    @Autowired
    private JWTService jwtService;
    
    private static final Logger logger = LoggerFactory.getLogger(ApplicationFilter.class);

	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
	     String requestURI = request.getRequestURI();
	     logger.info("Order service request: " + requestURI);
	     String authorization = request.getHeader("Authorization");
	     logger.info("Authorization header: " + authorization);
	    //  if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
	    //      filterChain.doFilter(request, response);
	    //      return;
	    //  }
	     if (authorization != null && authorization.startsWith("Bearer ")) {
	         String token = authorization.substring(7);
	         try {
	                if (jwtService.isTokenExpired(token)) {
	                 //   System.out.println("Token đã hết hạn");
	                      logger.warn("Token" + token + " đã hết hạn");
	                     
	                } else {
	                    Claims claims = jwtService.extractAllClaims(token);
	                    String email = claims.getSubject();
	                    claims.entrySet().forEach(entry -> {
							System.out.println("Claim: " + entry.getKey() + " = " + entry.getValue());
						});
	              //      System.out.println("Token hợp lệ. Email từ token: " + email);
	                 logger.info("Token hợp lệ. Email từ token: {}", email);     
	                    UserDetails userDetails = User.builder()
	                    		
	                    		.username(claims.get("userId", Integer.class).toString()).password("")
	                    		//.authorities(claims.get("role", String.class).trim().toUpperCase())
	                    		.roles(claims.get("role", String.class).trim().toUpperCase())
	                    		.build();
	                    
	                     UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
								userDetails, null, userDetails.getAuthorities());
	                     
	                     authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
	                     SecurityContextHolder.getContext().setAuthentication(authentication);
	                     
	                     
	                    // Ở đây bạn có thể thực hiện các bước xác thực người dùng dựa trên email
	                    // Ví dụ: Tải thông tin người dùng từ database và thiết lập Authentication
	                    // UserDetails userDetails = userDetailsService.loadUserByUsername(email);
	                    // UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken( 
	                }
	            } catch (JwtException | IllegalArgumentException ex) {
	              // System.out.println("JWT không hợp lệ: " + ex.getMessage());
	            		logger.error("JWT không hợp lệ: {}", ex.getMessage());				
	            }
	     } else {
	         logger.warn("No Authorization header or it does not start with Bearer");
	     }
	     filterChain.doFilter(request, response);
	}


}
