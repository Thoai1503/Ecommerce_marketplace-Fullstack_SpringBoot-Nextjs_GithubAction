package docker_test.com.services;

import java.sql.SQLException;
import java.util.List;

import docker_test.com.factory.IRepoFactory;
import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.repository.IRepositories;



public class GenericCrudService<T,Integer> {
	private static GenericCrudService instance = null;
         private final IRepoFactory repoFactory;
         
         
         public static GenericCrudService Instance() {
     		if (instance==null) {
     			instance=new GenericCrudService();
     		}
     		return instance;
     	}
         
         public GenericCrudService () {
        	 this.repoFactory =RepoFactoryImpl.Instance();
         }
         
         
         public List<T> findAll(String entityType) {
        	 IRepositories<T> repository = repoFactory.createRepo(entityType);
             return repository.GetAll();
         }
         
         public T findById(String entityType, Integer id) {
        	 IRepositories<T> repository = repoFactory.createRepo(entityType);
             return repository.GetById(id);
         }
         
         public T save(String entityType, T entity) throws SQLException {
             IRepositories<T> repository = repoFactory.createRepo(entityType);
             return repository.Create(entity);
         }
         
         public boolean deleteById(String entityType, int id) {
             IRepositories<T> repository = repoFactory.createRepo(entityType);
         return    repository.Delete(id);
         }
}
