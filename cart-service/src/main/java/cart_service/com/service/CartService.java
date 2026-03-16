package cart_service.com.service;

import java.util.List;

import org.springframework.stereotype.Service;

import cart_service.com.dto.CartDTO;
import cart_service.com.models.Cart;
import cart_service.com.repository.CartRepository;

@Service
public class CartService {
  private  CartRepository cartRepository;
  public CartService (CartRepository cartRepository) {
	  this.cartRepository = cartRepository;
  }
  
  public List<Cart> getUserCart(int userId) {
      return cartRepository.findByUserId(userId);
  }
  public Cart getCartByVariantId(int variantId) {
      return cartRepository.findByVariantId(variantId);
  }

  public void removeProduct(Long userId, Long productId) {
      cartRepository.deleteByUserIdAndProductId(userId, productId);
  }
  public Cart addToCart(CartDTO cartDto) {
		Cart existedCartItem = cartRepository.findByVariantIdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
		Cart cart = new Cart();
		System.out.println("Quantity from DTO: " + cartDto.getQuantity());
		int qty = cartDto.getQuantity() != null ? cartDto.getQuantity() : 1;
		if (existedCartItem != null) {
			int existingQty = existedCartItem.getQuantity() != null ? existedCartItem.getQuantity() : 0;
			cart = Cart.builder()
					    .id(existedCartItem.getId())
						.userId(cartDto.getUserId())
						.productId(cartDto.getProductId())
						.variantId(cartDto.getVariantId())
						.quantity(existingQty + qty)
						.build();
		} else {
			cart = Cart.builder()
								.userId(cartDto.getUserId())
								.productId(cartDto.getProductId())
								.variantId(cartDto.getVariantId())
								.quantity(qty)
								.build();
		}
//List<Cart> en=	   cartRepository.findByUserId(1).stream().filter(c -> c.getUserId()==1).toList();
	var en = cartRepository.save(cart);
	 // if (en!=null) cartDto.setId(cart.getId());
	
	    return en;
  }
  
   
}
