package docker_test.com.factory;

import docker_test.com.repository.IRepositories;

public  interface IRepoFactory {
   IRepositories createRepo(String entityType);
}
