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

    private static int getEnvInt(String key, int defaultValue) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }           
    }

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
            config.setJdbcUrl("jdbc:mysql://" + getEnvOrProp("DB_HOST", "mysql.host") + ":" + getEnvOrProp("DB_PORT", "mysql.port") + "/" + getEnvOrProp("DB_NAME", "mysql.database") + "?useSSL=true&requireSSL=true&serverTimezone=Asia/Ho_Chi_Minh");
            config.setUsername(getEnvOrProp("DB_USER", "mysql.username"));
            config.setPassword(getEnvOrProp("DB_PASSWORD", "mysql.password"));
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            config.addDataSourceProperty("serverTimezone", "Asia/Ho_Chi_Minh");
            // Allow enough concurrent JDBC requests from product detail page and nested repository calls.
            int maxPoolSize = getEnvInt("DB_POOL_SIZE", 10);
            int minIdle = Math.min(getEnvInt("DB_MIN_IDLE", 2), maxPoolSize);
            config.setMaximumPoolSize(Math.max(1, maxPoolSize));
            config.setMinimumIdle(Math.max(0, minIdle));
            config.setConnectionTimeout(getEnvInt("DB_CONNECTION_TIMEOUT", 30000));
            config.setIdleTimeout(getEnvInt("DB_IDLE_TIMEOUT", 30000));
            config.setMaxLifetime(getEnvInt("DB_MAX_LIFETIME", 600000));
            // Do not fail the whole app at startup if DB is temporarily saturated.
            config.setInitializationFailTimeout(-1);
            config.setConnectionTestQuery("SELECT 1");
            config.setLeakDetectionThreshold(getEnvInt("DB_LEAK_DETECTION_MS", 20000));
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
            throw new IllegalStateException("Cannot get DB connection from Hikari pool", e);
        }
    }
}
