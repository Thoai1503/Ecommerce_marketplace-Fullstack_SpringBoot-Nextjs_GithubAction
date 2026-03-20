package cart_service.com.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.mysql.cj.x.protobuf.MysqlxCrud.Order;

import cart_service.com.models.Cart;
import cart_service.com.models.ProductVariant;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CartRepositoryCustom implements ICartRepositoryCustom{

	
	private final EntityManager em;
	
	
	@Override
	public List<Cart> searchUser(String keyword) {
		// TODO Auto-generated method stub
		return null;
	}


	@Override
	public List<Cart> joinWithVariantByUser(int user_id) {
		
		CriteriaBuilder criteriaBuilder =em.getCriteriaBuilder();
		CriteriaQuery<Cart> query = criteriaBuilder.createQuery(Cart.class);

		Root<Cart> cart = query.from(Cart.class);
		Join<Order, ProductVariant> variant = cart.join("d");
		
		return null;
	}

}
