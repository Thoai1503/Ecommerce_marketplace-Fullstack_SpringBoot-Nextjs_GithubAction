package docker_test.com.mappers;

import java.sql.ResultSet;
import java.util.HashSet;

import org.springframework.jdbc.core.RowMapper;

public interface IMapper<T> extends RowMapper<T> {
		T RowMap(ResultSet rs);
		HashSet<T> RowsMap(ResultSet rs);
	
}

