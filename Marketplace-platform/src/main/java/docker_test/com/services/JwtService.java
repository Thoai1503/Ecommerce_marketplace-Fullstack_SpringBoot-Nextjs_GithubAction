package docker_test.com.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey accessKey;
    private final long accessTtlMinutes;
    private final long accessTtlSeconds; // -1 nếu không set (dùng minutes)
    private final long refreshTtlDays;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.access-ttl-minutes:15}") long atTtl,
                      @Value("${jwt.access-ttl-seconds:-1}") long atTtlSeconds,
                      @Value("${jwt.refresh-ttl-days:14}") long rtTtl) {
        this.accessKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlMinutes = atTtl;
        this.accessTtlSeconds = atTtlSeconds;
        this.refreshTtlDays = rtTtl;
    }

    public String createAccessToken(long userId, String role) {
        // Nếu có jwt.access-ttl-seconds → dùng seconds (để test), ngược lại dùng minutes
        Instant expiry = (accessTtlSeconds > 0)
                ? Instant.now().plus(accessTtlSeconds, ChronoUnit.SECONDS)
                : Instant.now().plus(accessTtlMinutes, ChronoUnit.MINUTES);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(Date.from(expiry))
                .signWith(accessKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseAccessToken(String token) {
        return Jwts.parser().verifyWith(accessKey).build().parseSignedClaims(token).getPayload();
    }

    public String createOpaqueRefreshToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefresh(String plain) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(plain.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public long getRefreshTtlDays() {
        return refreshTtlDays;
    }
}
