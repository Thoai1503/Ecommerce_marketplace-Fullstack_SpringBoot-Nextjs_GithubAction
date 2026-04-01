package cart_service.com.controller;

<<<<<<< HEAD
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
=======
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cart_service.com.dto.CartDTO;
import cart_service.com.models.Cart;
import cart_service.com.repository.CartRepository;
import cart_service.com.service.CartService;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/cart")
public class CartController {
	 private final CartService cartService;
	
	 public CartController(CartService cartService) {
		this.cartService =cartService;
	 }
	@GetMapping("")
	public String hello() {
		return "Cart Service is running";
	} 
	@GetMapping("user/{id}")
	public ResponseEntity<List<Cart>> getByUserId(@PathVariable int id){
		if(id==0) {
			return ResponseEntity.status(500).body(null);
		}
		var data = cartService.getUserCart(id);
	//var variants=	data.stream().filter(c->c.getProductVariant()!=null);
//	System.out.print("Logs: "+ variants);
		return ResponseEntity.ok(cartService.getUserCart(id));
	}
	
	@GetMapping("variant/{id}")
	public ResponseEntity< Cart> getByVariantId(@PathVariable int id){
		return ResponseEntity.ok( cartService.getCartByVariantId(id));
	}
	
	@PostMapping("")
	public ResponseEntity<CartDTO> create(@RequestBody  CartDTO cartDto) {
		
		System.out.println("Cart body: "+ cartDto.toString());
		
		System.out.println("Cart info: "+ cartDto.getProductId()+" "+cartDto.getUserId()+" "+cartDto.getQuantity());
		Cart cart = cartService.addToCart(cartDto);
		if(cart!=null) cartDto.setId(cart.getId());
		return ResponseEntity.ok(cartDto);
	}
		
}
