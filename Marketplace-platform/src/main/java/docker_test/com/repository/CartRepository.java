package docker_test.com.repository;

import java.sql.SQLException;
import java.util.List;

import org.springframework.stereotype.Repository;

import docker_test.com.models.Cart;

@Repository
public class CartRepository implements IRepositories<Cart> {
   
	
	
	@Override
	public Cart Create(Cart item) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Cart Update(Cart item) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean Delete(int id) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Cart GetById(int id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Cart> GetAll() {
		// TODO Auto-generated method stub
		return null;
	}
 
}
