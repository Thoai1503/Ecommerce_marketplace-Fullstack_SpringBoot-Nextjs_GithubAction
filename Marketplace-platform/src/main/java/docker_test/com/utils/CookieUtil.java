package docker_test.com.utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    private final String cookieName;
    private final String cookiePath;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public CookieUtil(@Value("${jwt.cookie-name}") String cookieName,
                      @Value("${jwt.cookie-path}") String cookiePath,
                      @Value("${jwt.cookie-secure}") boolean cookieSecure,
                      @Value("${jwt.cookie-same-site}") String cookieSameSite) {
        this.cookieName = cookieName;
        this.cookiePath = cookiePath;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    public void setRefreshCookie(HttpServletResponse res, String value, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse res) {
        setRefreshCookie(res, "", 0);
    }

    public String readRefreshCookie(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
