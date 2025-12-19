package docker_test.com.controllers;

import java.sql.Connection;
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

private Connection dbConnect;
 
 public TestController(docker_test.com.services.TestSingleton testSingleton) {
	 this.testSingleton = testSingleton;
	 this.dbConnect =DBConnection.getConn();
	 
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
    	var re = dbConnect.isValid(2);
	  return "Connect: "+ re;
  }

	
}