//package docker_test.com.service;
//
//import java.util.ArrayList;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import com.sun.security.auth.UserPrincipal;
//
//
//
//@Service
//public class MyUsersDetailService implements UserDetailsService {
//	
//
//	
//	
//	@Autowired
//	public MyUsersDetailService () {
//
//	}
//
//	@Override
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//	
//	System.out.println("Email: "+username );
//
//			
//	
//		return new User("admin", "12345", new ArrayList<>());
//	}
//
//}
