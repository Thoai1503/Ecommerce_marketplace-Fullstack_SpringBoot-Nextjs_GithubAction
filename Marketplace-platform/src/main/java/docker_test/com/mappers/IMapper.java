package docker_test.com.mappers;

import java.sql.ResultSet;
import java.util.List;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public interface IMapper<T> extends RowMapper<T> {
		T RowMap(ResultSet rs);
		List<T> RowsMap(ResultSet rs);
	    T mapRow(ResultSet rs, int rowNum) throws SQLException;
}

