package docker_test.com.factory;

import docker_test.com.repository.IRepositories;
import docker_test.com.repository.UnitRepository;

public class UnitRepoFactory implements IRepoFactory {

	private static UnitRepoFactory instance = null;
	
	public static UnitRepoFactory Instance() {
		if (instance == null) {
			instance = new UnitRepoFactory();
		}
		return instance;
	}
	




	@Override
	public IRepositories createRepo(String entityType) {
		// TODO Auto-generated method stub
		return  UnitRepository.Instance();
	}}
