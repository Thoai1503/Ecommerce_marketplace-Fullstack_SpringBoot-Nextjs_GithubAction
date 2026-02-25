package cart_service.com.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
	@PostMapping("")
	public ResponseEntity<CartDTO> create(@RequestBody @Valid CartDTO cartDto) {
		
		System.out.println("Cart body: "+ cartDto.toString());
		
		System.out.println("Cart info: "+ cartDto.getProductId()+" "+cartDto.getUserId()+" "+cartDto.getQuantity());
		Cart cart = cartService.addToCart(cartDto);
		if(cart!=null) cartDto.setId(cart.getId());
		return ResponseEntity.ok(cartDto);
	}
		
}
