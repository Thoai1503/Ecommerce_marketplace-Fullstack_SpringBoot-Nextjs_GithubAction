package cart_service.com.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
=======

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
import org.springframework.stereotype.Repository;

import cart_service.com.models.Cart;



//@Repository
<<<<<<< HEAD
public interface CartRepository extends JpaRepository<Cart, Long> {
      

    List<Cart> findByUserId(int userId);
   Cart findByVariantIdAndUserId(long variantId,long userId);
   Cart findByVariantId(long variantId);
    void deleteByUserId(Long userId);
   // void updateQuantiy();
    void deleteByUserIdAndProductId(Long userId, Long productId);
=======
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
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
}
