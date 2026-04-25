package docker_test.com.configs;

import java.sql.Connection;
import javax.sql.DataSource;

/**
 * DB connection singleton.
 * DataSource is injected by DBConnectionInitializer (@PostConstruct) at Spring startup.
 */
public final class DBConnection {

    private static final DBConnection INSTANCE = new DBConnection();
    private DataSource dataSource;

    private DBConnection() {}

    public static DBConnection getInstance() {
        return INSTANCE;
    }

    /** Called by DBConnectionInitializer to wire Spring's DataSource into this singleton. */
    public void setDataSource(DataSource ds) {
        this.dataSource = ds;
    }

    public Connection getConn() {
        try {
            if (dataSource == null) {
                throw new IllegalStateException(
                    "DataSource not initialized. DBConnectionInitializer may not have run.");
            }
            return dataSource.getConnection();
        } catch (Exception e) {
            throw new RuntimeException("DBConnection.getConn() failed: " + e.getMessage(), e);
        }
    }
}
