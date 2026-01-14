package docker_test.com.factory;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import docker_test.com.repository.CategoryAttributeRepository;
import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.UnitRepository;

@Component
public class RepoFactoryImpl implements IRepoFactory  {
	private static RepoFactoryImpl instance = null;
    private  JdbcTemplate jdbcTemplate;
    
    //ae thêm các Repository do ae tạo ở đây
	private final CategoryRepository categoryRepository;
	private final UnitRepository unitRepository;
	private final CategoryAttributeRepository categoryAttributeRepository;
	
	public static RepoFactoryImpl Instance() {
	
		if (instance==null) {
			instance=new RepoFactoryImpl();
		}
		return instance;
	}
	
	
	public RepoFactoryImpl() {
		//Khởi tạo các Repository do ae tạo ở đây
		this.categoryRepository =CategoryRepository.Instance();
		this.unitRepository =UnitRepository.Instance();
		this.categoryAttributeRepository = CategoryAttributeRepository.Instance();
	}

	@Override
	public IRepositories createRepo(String entityType) {
		// TODO Auto-generated method stub
		return switch (entityType.toLowerCase()) {
		case "category" -> (IRepositories) categoryRepository;
		case "unit" -> (IRepositories) unitRepository;
		case "category_attribute" -> (IRepositories) categoryAttributeRepository;
		//...ae thêm các định nghĩa Repository do ae tạo ở đây (Repository phải implement IRepositories)
		   default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
		};
	}

}
