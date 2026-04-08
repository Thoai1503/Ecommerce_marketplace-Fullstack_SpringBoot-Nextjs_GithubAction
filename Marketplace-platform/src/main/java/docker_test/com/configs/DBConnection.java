package docker_test.com.configs;


import java.io.InputStream;
import java.sql.Connection;
import java.util.Properties;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;


public final class DBConnection {

    private static DBConnection instance;
    private static final Properties props = new Properties();
    private static HikariDataSource dataSource;

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
            InputStream input = DBConnection.class.getClassLoader().getResourceAsStream(fileName);
            // fallback
            if (input == null) {
                input = DBConnection.class.getClassLoader().getResourceAsStream("application.properties");
            }
            if (input == null) {
                throw new RuntimeException("❌ Không tìm thấy file config nào!");
            }
            props.load(input);

            // HikariCP configuration
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://" + getEnvOrProp("DB_HOST", "mysql.host") + ":" + getEnvOrProp("DB_PORT", "mysql.port") + "/" + getEnvOrProp("DB_NAME", "mysql.database") + "?useSSL=true&requireSSL=true");
            config.setUsername(getEnvOrProp("DB_USER", "mysql.username"));
            config.setPassword(getEnvOrProp("DB_PASSWORD", "mysql.password"));
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            // Keep pool small to avoid exhausting MySQL max_connections across services
            String poolSizeEnv = System.getenv("DB_POOL_SIZE");
            int poolSize = (poolSizeEnv != null && !poolSizeEnv.isBlank()) ? Integer.parseInt(poolSizeEnv) : 5;
            config.setMaximumPoolSize(poolSize);
            config.setMinimumIdle(2);
            config.setConnectionTimeout(20000);
            config.setIdleTimeout(300000);
            config.setMaxLifetime(900000);	
            config.setConnectionTestQuery("SELECT 1");
            dataSource = new HikariDataSource(config);
        } catch (Exception e) {
            throw new RuntimeException("❌ Lỗi load DB config hoặc HikariCP", e);
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
            System.out.println("✅ Getting connection from HikariCP pool");
            return dataSource.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
