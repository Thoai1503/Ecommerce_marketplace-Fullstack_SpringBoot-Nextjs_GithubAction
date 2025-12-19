package docker_test.com.configs;

import java.io.InputStream;
import java.sql.Connection;
import java.util.Properties;

import com.mysql.cj.jdbc.MysqlDataSource;

public final class DBConnection {

    private static DBConnection instance;
    private static final Properties props = new Properties();

    // Load config 1 lần duy nhất
    static {
        try (InputStream input = DBConnection.class
                .getClassLoader()
                .getResourceAsStream("application.properties")) {

            if (input == null) {
                throw new RuntimeException("❌ Không tìm thấy application.properties");
            }
            System.out.print("Find application.properties");
            props.load(input);
        } catch (Exception e) {
            throw new RuntimeException("❌ Lỗi load DB config", e);
        }
    }

    private DBConnection() {}

    public static DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    public static Connection getConn() {
        try {
            MysqlDataSource ds = new MysqlDataSource();
            ds.setServerName(props.getProperty("mysql.host"));
            ds.setPortNumber(Integer.parseInt(props.getProperty("mysql.port")));
            ds.setDatabaseName(props.getProperty("mysql.database"));
            ds.setUser(props.getProperty("mysql.username"));
            ds.setPassword(props.getProperty("mysql.password"));
            ds.setUseSSL(false);
            System.out.print("Conneting ..");
            return ds.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
