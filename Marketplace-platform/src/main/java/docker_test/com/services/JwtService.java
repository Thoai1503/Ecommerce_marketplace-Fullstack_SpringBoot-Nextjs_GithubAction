package docker_test.com.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import docker_test.com.dto.AuthenticatedUser;
import docker_test.com.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.buyer.access-token-seconds:1800}")
    private long buyerAccessTokenSeconds;

    @Value("${app.jwt.seller.access-token-seconds:1800}")
    private long sellerAccessTokenSeconds;

    @Value("${app.jwt.admin.access-token-seconds:900}")
    private long adminAccessTokenSeconds;

    @Value("${app.jwt.buyer.refresh-token-seconds:604800}")
    private long buyerRefreshTokenSeconds;

    @Value("${app.jwt.seller.refresh-token-seconds:604800}")
    private long sellerRefreshTokenSeconds;

    @Value("${app.jwt.admin.refresh-token-seconds:86400}")
    private long adminRefreshTokenSeconds;

    @Value("${app.jwt.buyer.idle-timeout-seconds:3600}")
    private long buyerIdleTimeoutSeconds;

    @Value("${app.jwt.seller.idle-timeout-seconds:3600}")
    private long sellerIdleTimeoutSeconds;

    @Value("${app.jwt.admin.idle-timeout-seconds:1800}")
    private long adminIdleTimeoutSeconds;

    public String generateAccessToken(User user, Long userId) {
        return generateToken(user, userId, ACCESS_TOKEN_TYPE, getAccessTokenSeconds(user.getUserType()));
    }

    public String generateRefreshToken(User user, Long userId) {
        return generateToken(user, userId, REFRESH_TOKEN_TYPE, getRefreshTokenSeconds(user.getUserType()));
    }

    public long getAccessTokenSeconds(String userType) {
        return switch (normalizeRole(userType)) {
            case ADMIN -> adminAccessTokenSeconds;
            case SELLER -> sellerAccessTokenSeconds;
            case BUYER -> buyerAccessTokenSeconds;
        };
    }

    public long getRefreshTokenSeconds(String userType) {
        return switch (normalizeRole(userType)) {
            case ADMIN -> adminRefreshTokenSeconds;
            case SELLER -> sellerRefreshTokenSeconds;
            case BUYER -> buyerRefreshTokenSeconds;
        };
    }

    public long getIdleTimeoutSeconds(String userType) {
        return switch (normalizeRole(userType)) {
            case ADMIN -> adminIdleTimeoutSeconds;
            case SELLER -> sellerIdleTimeoutSeconds;
            case BUYER -> buyerIdleTimeoutSeconds;
        };
    }

    public AuthenticatedUser parseAccessToken(String token) {
        return toAuthenticatedUser(parseClaims(token, ACCESS_TOKEN_TYPE));
    }

    public AuthenticatedUser parseRefreshToken(String token) {
        Claims claims = parseClaims(token, REFRESH_TOKEN_TYPE);
        validateRefreshTokenActivity(claims);
        return toAuthenticatedUser(claims);
    }

    public String resolveBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }

        String prefix = "Bearer ";
        if (!authorizationHeader.startsWith(prefix)) {
            return null;
        }

        String token = authorizationHeader.substring(prefix.length()).trim();
        return token.isBlank() ? null : token;
    }

    private String generateToken(User user, Long userId, String tokenType, long secondsToLive) {
        Instant now = Instant.now();
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("fullName", user.getFullName());
        claims.put("role", user.getUserType());
        claims.put("tokenType", tokenType);
        if (REFRESH_TOKEN_TYPE.equals(tokenType)) {
            claims.put("lastActivityAt", now.getEpochSecond());
        }

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(secondsToLive)))
                .signWith(getSigningKey())
                .compact();
    }

    private Claims parseClaims(String token, String expectedTokenType) {
        if (token == null || token.isBlank()) {
            throw new JwtException("Missing token");
        }

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String tokenType = claims.get("tokenType", String.class);
        if (!expectedTokenType.equals(tokenType)) {
            throw new JwtException("Invalid token type");
        }

        return claims;
    }

    private void validateRefreshTokenActivity(Claims claims) {
        Long lastActivityAt = toLong(claims.get("lastActivityAt"));
        if (lastActivityAt == null) {
            throw new JwtException("Missing refresh token activity");
        }

        String role = claims.get("role", String.class);
        long idleTimeoutSeconds = getIdleTimeoutSeconds(role);
        long idleSeconds = Instant.now().getEpochSecond() - lastActivityAt;

        if (idleSeconds > idleTimeoutSeconds) {
            throw new JwtException("Refresh token idle timeout");
        }
    }

    private AuthenticatedUser toAuthenticatedUser(Claims claims) {
        Long userId = toLong(claims.get("userId"));
        String email = claims.getSubject();
        String fullName = claims.get("fullName", String.class);
        String role = claims.get("role", String.class);

        return new AuthenticatedUser(userId, email, fullName, role);
    }

    private Role normalizeRole(String userType) {
        String value = userType == null ? "" : userType.trim().toLowerCase();

        if ("admin".equals(value)) {
            return Role.ADMIN;
        }

        if ("seller".equals(value) || "both".equals(value)) {
            return Role.SELLER;
        }

        return Role.BUYER;
    }

    private Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        if (value == null) {
            return null;
        }

        return Long.parseLong(String.valueOf(value));
    }

    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = MessageDigest
                    .getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
    

    private enum Role {
        ADMIN,
        SELLER,
        BUYER
    }
}
