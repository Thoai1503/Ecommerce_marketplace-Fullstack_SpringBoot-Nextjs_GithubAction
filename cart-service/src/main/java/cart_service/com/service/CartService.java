package cart_service.com.service;

import java.util.List;

import org.springframework.stereotype.Service;

import cart_service.com.dto.CartDTO;
import cart_service.com.models.Cart;
<<<<<<< HEAD
=======
import cart_service.com.models.Product;
import cart_service.com.models.ProductVariant;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
import cart_service.com.repository.CartRepository;

@Service
public class CartService {
  private  CartRepository cartRepository;
  public CartService (CartRepository cartRepository) {
	  this.cartRepository = cartRepository;
  }
  
  public List<Cart> getUserCart(int userId) {
<<<<<<< HEAD
      return cartRepository.findByUserId(userId);
  }
  public Cart getCartByVariantId(int variantId) {
      return cartRepository.findByVariantId(variantId);
=======
	  var data = cartRepository.findByUserId(userId);
	  for (Cart item: data) {
		  System.out.println(item);
	  }
      return data;
  }
  public Cart getCartByVariantId(int variantId) {
     // return cartRepository.findByVariantId(variantId);
	  return null;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  }

  public void removeProduct(Long userId, Long productId) {
      cartRepository.deleteByUserIdAndProductId(userId, productId);
  }
  public Cart addToCart(CartDTO cartDto) {
<<<<<<< HEAD
		Cart existedCartItem = cartRepository.findByVariantIdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
=======
		Cart existedCartItem = cartRepository.findByProductVariant_IdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
		Cart cart = new Cart();
		System.out.println("Quantity from DTO: " + cartDto.getQuantity());
		int qty = cartDto.getQuantity() != null ? cartDto.getQuantity() : 1;
		if (existedCartItem != null) {
<<<<<<< HEAD
=======
			
			var pro = new Product();
			var productVariant = new ProductVariant();
			pro.setId(cartDto.getProductId());
			productVariant.setId(cartDto.getVariantId());
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
			int existingQty = existedCartItem.getQuantity() != null ? existedCartItem.getQuantity() : 0;
			cart = Cart.builder()
					    .id(existedCartItem.getId())
						.userId(cartDto.getUserId())
<<<<<<< HEAD
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
	
=======
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

>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
	    return en;
  }
  
   
}
