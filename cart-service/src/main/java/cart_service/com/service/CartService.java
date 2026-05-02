package cart_service.com.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

  public void updateQuantity(Long cartId, int quantity) {
      Cart cart = cartRepository.findById(cartId)
          .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartId));
      cart.setQuantity(quantity);
      cartRepository.save(cart);
  }

  public void deleteById(Long cartId) {
      cartRepository.deleteById(cartId);
  }

  @Transactional
  public Cart addToCart(CartDTO cartDto) {
	  return upsertCartItem(cartDto);
  }

  @Transactional
  public List<Cart> addBatchToCart(List<CartDTO> cartDtoList) {
	  if (cartDtoList == null || cartDtoList.isEmpty()) {
		  throw new IllegalArgumentException("Cart batch must not be empty");
	  }

	  return cartDtoList.stream()
		  .filter(Objects::nonNull)
		  .map(this::upsertCartItem)
		  .collect(Collectors.toList());
  }

  private Cart upsertCartItem(CartDTO cartDto) {
	  if (cartDto.getUserId() == null) {
		  throw new IllegalArgumentException("user_id is required");
	  }

	  if (cartDto.getProductId() == null) {
		  throw new IllegalArgumentException("product_id is required");
	  }

	  if (cartDto.getVariantId() == null) {
		  throw new IllegalArgumentException("variant_id is required");
	  }

	  int qty = cartDto.getQuantity() != null ? cartDto.getQuantity() : 1;
	  if (qty < 1) {
		  throw new IllegalArgumentException("quantity must be >= 1");
	  }

	  Cart existedCartItem = cartRepository.findByProductVariant_IdAndUserId(
		  cartDto.getVariantId(),
		  cartDto.getUserId()
	  );

	  Product product = new Product();
	  product.setId(cartDto.getProductId());

	  ProductVariant productVariant = new ProductVariant();
	  productVariant.setId(cartDto.getVariantId());

	  Cart cart;
	  if (existedCartItem != null) {
		  int existingQty = existedCartItem.getQuantity() != null ? existedCartItem.getQuantity() : 0;
		  cart = Cart.builder()
			  .id(existedCartItem.getId())
			  .userId(cartDto.getUserId())
			  .product(product)
			  .productVariant(productVariant)
			  .quantity(existingQty + qty)
			  .build();
	  } else {
		  cart = Cart.builder()
			  .userId(cartDto.getUserId())
			  .product(product)
			  .productVariant(productVariant)
			  .quantity(qty)
			  .build();
	  }

	  return cartRepository.save(cart);
  }
  
   
}
 