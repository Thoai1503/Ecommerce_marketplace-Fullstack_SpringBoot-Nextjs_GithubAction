package docker_test.com.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class PasswordUtil {

    private static final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder(10); // strength = 10

    private PasswordUtil() {}

    public static String hash(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return encoder.encode(rawPassword);
    }

    public static boolean verify(String rawPassword, String hash) {
        return encoder.matches(rawPassword, hash);
    }
}
