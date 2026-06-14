//package docker_test.com.service;
//
//import java.util.Collection;
//import java.util.Collections;
//
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import tinhvomon.com.models.User;
//
//public class UserPrincipal implements UserDetails {
//	public UserPrincipal(User user) {
//		super();
//		this.user = user;
//	}
//
//	private User user;
//
//	@Override
//	public Collection<? extends GrantedAuthority> getAuthorities() {
//		// TODO Auto-generated method stub
//		return Collections.singleton(new SimpleGrantedAuthority("USER"));
//	}
//
//	@Override
//	public String getPassword() {
//		// TODO Auto-generated method stub
//		System.out.println("Password:"+ user.getPassword());
//		return user.getPassword();
//		
//	}
//
//	
//				@Override
//				public String getUsername() {
//					// TODO Auto-generated method stub
//					return user.getEmail();
//				}
//			
//}
