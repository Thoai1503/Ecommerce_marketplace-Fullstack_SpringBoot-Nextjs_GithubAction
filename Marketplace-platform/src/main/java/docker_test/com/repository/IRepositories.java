package docker_test.com.repository;

import java.sql.SQLException;
import java.util.HashSet;

public interface IRepositories<T> {
	T Create(T item) throws SQLException;
	T Update(T item);
	boolean Delete(T item);
	T GetById(Object item);
	HashSet<T> GetAll();
	
}
