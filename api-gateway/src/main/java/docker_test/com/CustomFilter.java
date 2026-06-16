package docker_test.com;

import java.io.IOException;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class CustomFilter extends OncePerRequestFilter {
//	  @Autowired
//	    private UserDetailsService userDetailsService;
        private static final Logger logger = LoggerFactory.getLogger(CustomFilter.class);
	  @Autowired
	  private JWTSercurity jwtSercurity;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/auth/login")
                || path.equals("/login")
                || path.equals("/api/product")
                ||path.equals("/auth/register");
       //         || path.equals("/users/register");		
    }
	  
    @Override
    protected void  doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

    	
         String requestURI = request.getRequestURI();
        System.out.println(requestURI);

   
            String username = request.getParameter("username");

            System.out.println("Login attempt: " + username);

        // ⭐ QUAN TRỌNG: Bỏ qua OPTIONS request (CORS preflight)


    	
        String userAgent = request.getHeader("User-Agent");
        String authorization = request.getHeader("Authorization");
        System.out.println("=== HEADER INFO ===");

        
      
     
        System.out.println("User-Agent: " + userAgent);
        System.out.println("Authorization: " + authorization);
        
        if(authorization!=null &&authorization.startsWith("Bearer ")) {
        	String token = authorization.substring(7);
			System.out.println("Extracted Token: " + token);
            try {
                if (jwtSercurity.isTokenExpired(token)) {
                 //   System.out.println("Token đã hết hạn");
                      logger.warn("Token" + token + " đã hết hạn");
                     
                } else {
                    Claims claims = jwtSercurity.extractAllClaims(token);
                    String email = claims.getSubject();
                    claims.entrySet().forEach(entry -> {
						System.out.println("Claim: " + entry.getKey() + " = " + entry.getValue());
					});
              //      System.out.println("Token hợp lệ. Email từ token: " + email);
                 logger.info("Token hợp lệ. Email từ token: {}", email);     
                    UserDetails userDetails = User.builder().username(email).password("")
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
        }
        

        filterChain.doFilter(request, response);
    }
}
