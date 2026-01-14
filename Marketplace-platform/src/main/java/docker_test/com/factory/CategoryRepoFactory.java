package docker_test.com.factory;

import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;

public class CategoryRepoFactory implements IRepoFactory {

	@Override
	public IRepositories createRepo(String en) {
		// TODO Auto-generated method stub
		return CategoryRepository.Instance();
	}

}
