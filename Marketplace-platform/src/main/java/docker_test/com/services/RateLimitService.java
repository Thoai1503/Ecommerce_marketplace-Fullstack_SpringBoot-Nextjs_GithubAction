package docker_test.com.services;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limit in-memory đơn giản theo IP + action.
 * - Sliding window: N requests trong windowMs.
 * - Nếu vượt → allow() trả false, caller trả 429.
 */
@Service
public class RateLimitService {

    private static class Bucket {
        long windowStart;
        int count;
    }

    private final ConcurrentHashMap<String, Bucket> map = new ConcurrentHashMap<>();

    /**
     * @param key        thường là "action:ip" ví dụ "otp-send:127.0.0.1"
     * @param maxRequests giới hạn trong window
     * @param windowMs   kích thước window (ms)
     * @return true nếu còn quota; false nếu vượt
     */
    public synchronized boolean allow(String key, int maxRequests, long windowMs) {
        long now = Instant.now().toEpochMilli();
        Bucket b = map.get(key);
        if (b == null || (now - b.windowStart) > windowMs) {
            b = new Bucket();
            b.windowStart = now;
            b.count = 1;
            map.put(key, b);
            return true;
        }
        if (b.count >= maxRequests) return false;
        b.count++;
        return true;
    }
}
