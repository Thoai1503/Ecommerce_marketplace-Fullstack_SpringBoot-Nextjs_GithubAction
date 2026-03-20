package cart_service.com.service;

import java.util.List;

import org.springframework.stereotype.Service;

import cart_service.com.dto.CartDTO;
import cart_service.com.models.Cart;
import cart_service.com.models.Product;
import cart_service.com.models.ProductVariant;
import cart_service.com.repository.CartRepository;

@Service
public class CartService {
  private  CartRepository cartRepository;
  public CartService (CartRepository cartRepository) {
	  this.cartRepository = cartRepository;
  }
  
  public List<Cart> getUserCart(int userId) {
	  var data = cartRepository.findByUserId(userId);
	  for (Cart item: data) {
		  System.out.println(item);
	  }
      return data;
  }
  public Cart getCartByVariantId(int variantId) {
     // return cartRepository.findByVariantId(variantId);
	  return null;
  }

  public void removeProduct(Long userId, Long productId) {
      cartRepository.deleteByUserIdAndProductId(userId, productId);
  }
  public Cart addToCart(CartDTO cartDto) {
		Cart existedCartItem = cartRepository.findByProductVariant_IdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
		Cart cart = new Cart();
		System.out.println("Quantity from DTO: " + cartDto.getQuantity());
		int qty = cartDto.getQuantity() != null ? cartDto.getQuantity() : 1;
		if (existedCartItem != null) {
			
			var pro = new Product();
			var productVariant = new ProductVariant();
			pro.setId(cartDto.getProductId());
			productVariant.setId(cartDto.getVariantId());
			int existingQty = existedCartItem.getQuantity() != null ? existedCartItem.getQuantity() : 0;
			cart = Cart.builder()
					    .id(existedCartItem.getId())
						.userId(cartDto.getUserId())
						.product(pro)
						.productVariant(productVariant)
					//	.productId(cartDto.getProductId())
			//			.variantId(cartDto.getVariantId())
						.quantity(existingQty + qty)
						.build();
		} else {
			var pro = new Product();
			var productVariant = new ProductVariant();
			pro.setId(cartDto.getProductId());
			productVariant.setId(cartDto.getVariantId());
			cart = Cart.builder()
								.userId(cartDto.getUserId())
								.product(pro)
								.productVariant(productVariant)
								//.productId(cartDto.getProductId())
							//	.variantId(cartDto.getVariantId())
								
								.quantity(qty)
								.build();
		}

	var en = cartRepository.save(cart);

	    return en;
  }
  
   
}
