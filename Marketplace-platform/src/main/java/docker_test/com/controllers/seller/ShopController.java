package docker_test.com.controllers.seller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ShopRepository;

@RestController("sellerShopCoontroller")
@RequestMapping("/seller/shop")
public class ShopController {
	  private final IRepositories repositories;
	     private final IRepoFactory iRepoFactory;
	  public ShopController(RepoFactoryImpl repoFactoryImpl) {
		  this.iRepoFactory = repoFactoryImpl;
		  this.repositories = iRepoFactory.createRepo("shop");
	  }    
	     
	  @GetMapping("user/{id}")
	  public ResponseEntity getByUserId(@PathVariable Integer id) {
		  
		  var shop = ((ShopRepository)repositories).Instance().GetByUserId(id);
		  
		  return ResponseEntity.ok(shop);
	  }

}
