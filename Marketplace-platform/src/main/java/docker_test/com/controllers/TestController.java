package docker_test.com.controllers;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.configs.DBConnection;
import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.UnitRepository;
import docker_test.com.services.GenericCrudService;
import docker_test.com.services.TestSingleton;


@RestController
@RequestMapping("/test")
public class TestController {
	
	private IRepositories repo;
    private final JdbcTemplate jdbcTemplate;
    private final GenericCrudService<Object, Integer>  crudService;

@Autowired
  private final docker_test.com.services.TestSingleton testSingleton;

private DBConnection dbConnect;
 //test
 public TestController(docker_test.com.services.TestSingleton testSingleton, JdbcTemplate jdbcTemplate) {
	 this.testSingleton = testSingleton;
	 this.dbConnect =DBConnection.getInstance();
	// this.repo=UnitRepository.Instance();
	 this.jdbcTemplate = jdbcTemplate;
	 this.crudService = GenericCrudService.Instance();
	 
 }
  @GetMapping("/singleton")
  public String testSingleton() {
	//  this.repo=CategoryRepository.Instance();
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
    var ps=	re.prepareStatement("select * from category");
    	ResultSet rs = ps.executeQuery();
    	
    	while(rs.next()) {
			
    		System.out.println(rs.getInt("id") +" "+rs.getString("category_name"));
			
		}
    	
	  return "Connect: "+ re.isValid(2);
  }
    
//    @GetMapping("/factory_test")
//    public String testFactory() {
//  
//            repo = UnitRepository.Instance();
//            var item1 = repo.GetAll();
//            System.out.println("Item1: " + item1);
//            
//            repo = CategoryRepository.Instance();
//            var item2 = repo.GetAll();
//            System.out.println("Item2: " + item2);
//            
//            return "Item1: " + item1 + ", Item2: " + item2;
//            
//       
//    }
    
    
  @GetMapping("/get_all_test/{entity_type}")
  public ResponseEntity testFactory(@PathVariable String entity_type) {
  
	  try {
          List<Object> entities = crudService.findAll(entity_type);
          return ResponseEntity.ok(entities);
      } catch (IllegalArgumentException e) {
          return ResponseEntity.badRequest().build();
      }

          
     
  }
	
}