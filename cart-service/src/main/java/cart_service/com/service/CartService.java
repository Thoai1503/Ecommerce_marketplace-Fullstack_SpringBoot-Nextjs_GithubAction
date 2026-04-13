package cart_service.com.service;

import java.util.List;

import org.springframework.stereotype.Service;

import cart_service.com.dto.CartDTO;
import cart_service.com.models.Cart;
<<<<<<< HEAD
<<<<<<< HEAD
=======
import cart_service.com.models.Product;
import cart_service.com.models.ProductVariant;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
import cart_service.com.models.Product;
import cart_service.com.models.ProductVariant;
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
import cart_service.com.repository.CartRepository;

@Service
public class CartService {
  private  CartRepository cartRepository;
  public CartService (CartRepository cartRepository) {
	  this.cartRepository = cartRepository;
  }
  
  public List<Cart> getUserCart(int userId) {
<<<<<<< HEAD
<<<<<<< HEAD
      return cartRepository.findByUserId(userId);
  }
  public Cart getCartByVariantId(int variantId) {
      return cartRepository.findByVariantId(variantId);
=======
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
	  var data = cartRepository.findByUserId(userId);
	  for (Cart item: data) {
		  System.out.println(item);
	  }
      return data;
  }
  public Cart getCartByVariantId(int variantId) {
     // return cartRepository.findByVariantId(variantId);
	  return null;
<<<<<<< HEAD
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
  }

  public void removeProduct(Long userId, Long productId) {
      cartRepository.deleteByUserIdAndProductId(userId, productId);
  }

  public void updateQuantity(Long cartId, int quantity) {
      Cart cart = cartRepository.findById(cartId)
          .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartId));
      cart.setQuantity(quantity);
      cartRepository.save(cart);
  }

  public void deleteById(Long cartId) {
      cartRepository.deleteById(cartId);
  }
  public Cart addToCart(CartDTO cartDto) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
		Cart existedCartItem = cartRepository.findByVariantIdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
=======
=======
	    System.out.println("Adding to cart: " + cartDto.toString());
>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
		Cart existedCartItem = cartRepository.findByProductVariant_IdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
		Cart existedCartItem = cartRepository.findByProductVariant_IdAndUserId(cartDto.getVariantId(),cartDto.getUserId());
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
		Cart cart = new Cart();
		System.out.println("Quantity from DTO: " + cartDto.getQuantity());
		int qty = cartDto.getQuantity() != null ? cartDto.getQuantity() : 1;
		
		if (existedCartItem != null) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======
			System.out.println("Existing cart item found: " + existedCartItem.toString());
>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
			
			var pro = new Product();
			var productVariant = new ProductVariant();
			pro.setId(cartDto.getProductId());
			productVariant.setId(cartDto.getVariantId());
<<<<<<< HEAD
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
			int existingQty = existedCartItem.getQuantity() != null ? existedCartItem.getQuantity() : 0;
			cart = Cart.builder()
					    .id(existedCartItem.getId())
						.userId(cartDto.getUserId())
<<<<<<< HEAD
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
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
						.product(pro)
						.productVariant(productVariant)
					//	.productId(cartDto.getProductId())
			//			.variantId(cartDto.getVariantId())
						.quantity(existingQty + qty)
						.build();
		} else {
			System.out.println("No existing cart item found, creating new one");
			var pro = new Product();
	
			var productVariant = new ProductVariant();
			pro.setId(cartDto.getProductId());
			productVariant.setId(cartDto.getVariantId());
			cart = Cart.builder()
								.userId(cartDto.getUserId())
								.product(pro)
								.productVariant(productVariant)
					//	.productId(cartDto.getProductId())
							//	.variantId(cartDto.getVariantId())
								
								.quantity(qty)
								.build();
		}
		System.out.println("Cart to save: " + cart.toString());
		System.out.println("Cart userId: " + cart.getUserId());
		System.out.println("Cart productId: " + cart.getProduct().getId());
		System.out.println("Cart variantId: " + cart.getProductVariant().getId());
		System.out.println("Cart quantity: " + cart.getQuantity());
		System.out.println("Cart product id: "+cart.getProduct().getId());

	var en = cartRepository.save(cart);

<<<<<<< HEAD
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
	    return en;
  }
  
   
}
