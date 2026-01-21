package docker_test.com.mappers;

import java.sql.ResultSet;
import java.util.HashSet;
import java.util.List;

import docker_test.com.models.Unit;

public interface IMapper<T> {
		T RowMap(ResultSet rs);
		List<Unit> RowsMap(ResultSet rs);
}

