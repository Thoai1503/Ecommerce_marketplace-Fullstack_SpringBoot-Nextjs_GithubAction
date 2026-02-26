package cart_service.com.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cart_service.com.models.Cart;



//@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
      

    List<Cart> findByUserId(int userId);

    void deleteByUserId(Long userId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
