package docker_test.com.mappers;

import java.sql.ResultSet;
import java.util.HashSet;

public interface IMapper<T> {
		T RowMap(ResultSet rs);
		HashSet<T> RowsMap(ResultSet rs);
}

