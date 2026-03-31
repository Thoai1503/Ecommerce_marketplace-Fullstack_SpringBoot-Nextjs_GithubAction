package docker_test.com.configs;

import java.io.InputStream;
import java.sql.Connection;
import java.util.Properties;

import com.mysql.cj.jdbc.MysqlDataSource;

public final class DBConnection {

    private static DBConnection instance;
    private static final Properties props = new Properties();

    private static String getEnvOrProp(String envKey, String propKey) {
        String env = System.getenv(envKey);
        if (env != null && !env.isBlank()) {
            return env;
        }
        return props.getProperty(propKey);
    }

    static {
        try {
            // 🔥 Lấy profile hiện tại (dev, prod,...)
        	String profile = System.getProperty("spring.profiles.active");

        	if (profile == null) {
        	    profile = System.getenv("SPRING_PROFILES_ACTIVE");
        	}

        	if (profile == null) {
        	    profile = "local";
        	}

        	String fileName = "application-" + profile + ".properties";

        	InputStream input = DBConnection.class
        	        .getClassLoader()
        	        .getResourceAsStream(fileName);

        	// fallback
        	if (input == null) {
        	    input = DBConnection.class
        	            .getClassLoader()
        	            .getResourceAsStream("application.properties");
        	}
            if (input == null) {
                throw new RuntimeException("❌ Không tìm thấy file config nào!");
            }

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

            ds.setServerName(getEnvOrProp("DB_HOST", "mysql.host"));

            String port = getEnvOrProp("DB_PORT", "mysql.port");
            ds.setPortNumber(Integer.parseInt(port));

            ds.setDatabaseName(getEnvOrProp("DB_NAME", "mysql.database"));
            ds.setUser(getEnvOrProp("DB_USER", "mysql.username"));
            ds.setPassword(getEnvOrProp("DB_PASSWORD", "mysql.password"));

            ds.setSslMode("REQUIRED");

            System.out.println("✅ Connecting to DB on port " + port);
            return ds.getConnection();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}