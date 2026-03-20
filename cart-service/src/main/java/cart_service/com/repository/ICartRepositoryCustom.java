package cart_service.com.repository;

import java.util.List;

import cart_service.com.models.Cart;

public interface ICartRepositoryCustom {
    List<Cart> searchUser(String keyword);
    
    List<Cart> joinWithVariantByUser(int user_id);
}
