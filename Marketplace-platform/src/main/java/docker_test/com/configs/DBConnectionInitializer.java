package docker_test.com.configs;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;

@Component
public class DBConnectionInitializer {

    private final DataSource dataSource;

    public DBConnectionInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void init() {
        DBConnection.getInstance().setDataSource(dataSource);
    }
}
