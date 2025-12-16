package docker_test.com.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

<<<<<<< HEAD:Marketplace-platform/src/main/java/docker_test/com/controller/TestController.java
	@Autowired
	private final docker_test.com.service.TestSingleton testSingleton;

	public TestController(docker_test.com.service.TestSingleton testSingleton) {
		this.testSingleton = testSingleton;

	}

	@GetMapping("/singleton")
	public String testSingleton() {
		testSingleton.incrementCounter();
		System.out.println("Counter value: " + testSingleton.getCounter());
		return "Counter value: " + testSingleton.getCounter();
	}
=======
@Autowired
  private final docker_test.com.services.TestSingleton testSingleton;
 
 public TestController(docker_test.com.services.TestSingleton testSingleton) {
	 this.testSingleton = testSingleton;
	 
 }
  @GetMapping("/singleton")
  public String testSingleton() {
	  testSingleton.incrementCounter();
	  System.out.println("Counter value: " + testSingleton.getCounter());
	  return "Counter value: " + testSingleton.getCounter();
  }

	
>>>>>>> 7e6a3b2919274dceaf719795361c035324982bb5:Marketplace-platform/src/main/java/docker_test/com/controllers/TestController.java
}