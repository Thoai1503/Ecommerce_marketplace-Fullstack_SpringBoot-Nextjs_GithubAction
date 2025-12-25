package docker_test.com.repository;

import java.util.HashSet;

public interface IRepositories<T> {
	void Create(T item);
	void Update(T item);
	boolean Delete(T item);
	T GetById(Object item);
	HashSet<T> GetAll();
	
}
