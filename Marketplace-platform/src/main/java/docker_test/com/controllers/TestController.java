package docker_test.com.controllers;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.configs.DBConnection;


@RestController
@RequestMapping("/test")
public class TestController {

@Autowired
  private final docker_test.com.services.TestSingleton testSingleton;

private DBConnection dbConnect;
 //test
 public TestController(docker_test.com.services.TestSingleton testSingleton) {
	 this.testSingleton = testSingleton;
	 this.dbConnect =DBConnection.getInstance();
	 
 }
  @GetMapping("/singleton")
  public String testSingleton() {
	  testSingleton.incrementCounter();
	  System.out.println("Counter value: " + testSingleton.getCounter());
	  return "Counter value: " + testSingleton.getCounter();
  }
    @GetMapping("/dbconnect")
  public String testSingletons() throws SQLException {
//           var re = serverDataSource.getConnection();
//           boolean valid = re.isValid(2); // timeout 2s
  //   	  System.out.println("Connect: " + re);
    	var re = dbConnect.getConn();
    var ps=	re.prepareStatement("select * from categories");
    	ResultSet rs = ps.executeQuery();
    	
    	while(rs.next()) {
			
    		System.out.println(rs.getInt("id")+" "+rs.getString("category_name"));
			
		}
    	
	  return "Connect: "+ re.isValid(2);
  }

	
}