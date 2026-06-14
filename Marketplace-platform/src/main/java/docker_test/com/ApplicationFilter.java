package docker_test.com;
import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApplicationFilter  extends OncePerRequestFilter {
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		// Thực hiện các thao tác trước khi xử lý yêu cầu (nếu cần)
		// Ví dụ: Ghi log, kiểm tra header, v.v.
	    String authorization = request.getHeader("Authorization");
	    		System.out.println("Authorization header: " + authorization);
		
		// Tiếp tục chuỗi filter
		filterChain.doFilter(request, response);

		// Thực hiện các thao tác sau khi xử lý yêu cầu (nếu cần)
		// Ví dụ: Ghi log, xử lý lỗi, v.v.				
	}

}
