package cart_service.com.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cart_service.com.models.Cart;



//@Repository
public interface CartRepository extends JpaRepository<Cart, Long>,ICartRepositoryCustom {
      

    List<Cart> findByUserId(int userId);
    Cart findByProductVariant_IdAndUserId(Long variantId, Long userId);
    Cart findByProductVariant_Id(long variantId);
    void deleteByUserId(Long userId);
    
  //  @Query("SELECT c FROM Cart c JOIN ProductVariant pv on c.variantId =pv.id  WHERE c.userId = :user_id")
    
  //  List<Cart> findCartWithVariant(@Param("user_id") int user_id);
    

    void deleteByUserIdAndProductId(Long userId, Long productId);

    @Override
    default List<Cart> searchUser(String keyword) {
    	// TODO Auto-generated method stub
    	return null;
    }
   @Override
default List<Cart> joinWithVariantByUser(int user_id) {
	// TODO Auto-generated method stub
	   
	return null;
}
}
