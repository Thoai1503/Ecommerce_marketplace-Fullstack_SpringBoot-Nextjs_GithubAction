//package docker_test.com.service;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//
//
//@Service
//public class MyUsersDetailService implements UserDetailsService {
//	
//	private final UserRepo repo;
//	
//	
//	@Autowired
//	public MyUserDetailsService (UserRepo repo) {
//		this.repo =repo;
//	}
//
//	@Override
//	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//	
//	System.out.println("Email: "+username );
//
//			
//		User user = repo.getUserByEmail(username);
//		
//		System.out.println("User details: "+user );
//
//		
//		if(user==null) {
//			System.out.println("User Not Found");
//			throw new UsernameNotFoundException("User not found");
//		}
//		
//		return new UserPrincipal(user);
//	}
//
//}
