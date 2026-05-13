package cart_service.com.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
	public ResponseEntity<List<Cart>> getByUserId(@PathVariable("id") int id){
		if(id==0) {
			return ResponseEntity.status(500).body(null);
		}
		var data = cartService.getUserCart(id);
	//var variants=	data.stream().filter(c->c.getProductVariant()!=null);
//	System.out.print("Logs: "+ variants);
		return ResponseEntity.ok(cartService.getUserCart(id));
	}
	
	@GetMapping("variant/{id}")
	public ResponseEntity< Cart> getByVariantId(@PathVariable("id") int id){
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

	@PostMapping("/batch")
	public ResponseEntity<List<CartDTO>> createBatch(@RequestBody List<CartDTO> cartDtoList) {
		List<Cart> savedItems = cartService.addBatchToCart(cartDtoList);

		List<CartDTO> response = savedItems.stream().map(item -> {
			CartDTO dto = new CartDTO();
			dto.setId(item.getId());
			dto.setUserId(item.getUserId());
			dto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
			dto.setVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null);
			dto.setQuantity(item.getQuantity());
			return dto;
		}).collect(Collectors.toList());

		return ResponseEntity.ok(response);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Void> updateQuantity(@PathVariable("id") Long id, @RequestBody CartDTO cartDto) {
		cartService.updateQuantity(id, cartDto.getQuantity());
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable("id") Long id) {
		cartService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
		
}
