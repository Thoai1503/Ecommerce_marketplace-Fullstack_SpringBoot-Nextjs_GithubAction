package docker_test.com.services;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP in-memory cache cho flow seller self-register.
 * - Key = email (lowercase)
 * - Value = {code, expiresAt}
 * - TTL mặc định 10 phút
 * - Resend throttle: 60s giữa các lần gửi cho cùng email
 */
@Service
public class OtpService {

    private static final long TTL_MS = 10 * 60 * 1000L;
    private static final long RESEND_COOLDOWN_MS = 60 * 1000L;
    private static final SecureRandom RNG = new SecureRandom();

    private static class Entry {
        String code;
        long expiresAt;
        long createdAt;
        int attempts; // số lần verify sai
    }

    private final ConcurrentHashMap<String, Entry> store = new ConcurrentHashMap<>();

    public String generateAndStore(String email) {
        String norm = email.toLowerCase().trim();
        Entry existing = store.get(norm);
        long now = Instant.now().toEpochMilli();
        if (existing != null && (now - existing.createdAt) < RESEND_COOLDOWN_MS) {
            long wait = (RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000;
            throw new IllegalStateException("Vui lòng chờ " + wait + "s trước khi gửi lại OTP");
        }
        String code = String.format("%06d", RNG.nextInt(1_000_000));
        Entry e = new Entry();
        e.code = code;
        e.createdAt = now;
        e.expiresAt = now + TTL_MS;
        e.attempts = 0;
        store.put(norm, e);
        return code;
    }

    /** Verify và consume OTP. True nếu đúng (đồng thời xóa khỏi store). */
    public boolean verifyAndConsume(String email, String code) {
        if (email == null || code == null) return false;
        String norm = email.toLowerCase().trim();
        Entry e = store.get(norm);
        if (e == null) return false;
        long now = Instant.now().toEpochMilli();
        if (now > e.expiresAt) {
            store.remove(norm);
            return false;
        }
        if (e.attempts >= 5) {
            store.remove(norm); // chống brute-force
            return false;
        }
        if (!e.code.equals(code.trim())) {
            e.attempts++;
            return false;
        }
        store.remove(norm);
        return true;
    }
}
