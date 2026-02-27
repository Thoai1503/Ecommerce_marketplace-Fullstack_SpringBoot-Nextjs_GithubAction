package docker_test.com.repository;

import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;

public interface IRepositories<T> {
	T Create(T item) throws SQLException;
	T Update(T item);
	boolean Delete(int id );
	T GetById(int id);
	List<T> GetAll();
	
}
