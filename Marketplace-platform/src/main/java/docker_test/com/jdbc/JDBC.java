package docker_test.com.jdbc;

import org.springframework.jdbc.core.JdbcTemplate;

import docker_test.com.repository.CategoryRepository;



public class JDBC extends JdbcTemplate {
	
	private static JDBC instance =null;
	
	public static  JDBC Instance() {
		if (instance==null) {
			instance=new JDBC();
		}
		return instance;
	}
	
	
      
}
