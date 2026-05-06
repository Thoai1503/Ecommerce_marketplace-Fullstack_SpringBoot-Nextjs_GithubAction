package docker_test.com.configs;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import docker_test.com.dto.AuthenticatedUser;
import docker_test.com.services.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class JwtAuthorizationFilter implements Filter {
    private enum RequiredRole {
        NONE,
        AUTHENTICATED,
        SELLER,
        ADMIN
    }

    private final JwtService jwtService;

    public JwtAuthorizationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String method = httpRequest.getMethod();
        String path = stripContextPath(httpRequest);
        RequiredRole requiredRole = getRequiredRole(method, path);

        if ("OPTIONS".equalsIgnoreCase(method) || requiredRole == RequiredRole.NONE) {
            chain.doFilter(request, response);
            return;
        }

        String token = resolveToken(httpRequest);
        if (token == null) {
            writeAuthError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Missing JWT token");
            return;
        }

        try {
            AuthenticatedUser user = jwtService.parseAccessToken(token);
            if (!hasRequiredRole(user, requiredRole)) {
                writeAuthError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Insufficient role");
                return;
            }

            if (!canAccessRequestedResource(httpRequest, path, user)) {
                writeAuthError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Forbidden resource");
                return;
            }

            httpRequest.setAttribute("authUser", user);
            chain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException e) {
            writeAuthError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
        }
    }

    private String stripContextPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();

        if (contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)) {
            return uri.substring(contextPath.length());
        }

        return uri;
    }

    private RequiredRole getRequiredRole(String method, String path) {
        if (isPublicAuthPath(path) || path.startsWith("/test")) {
            return RequiredRole.NONE;
        }

        if (path.equals("/users")) {
            return RequiredRole.ADMIN;
        }

        if (path.startsWith("/users/")) {
            if ("GET".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
                    || "POST".equalsIgnoreCase(method)) {
                return RequiredRole.AUTHENTICATED;
            }

            return RequiredRole.ADMIN;
        }

        if (path.startsWith("/customers") || path.startsWith("/sellers") || path.startsWith("/api/admin")) {
            return RequiredRole.ADMIN;
        }

        if (path.startsWith("/seller/product") || path.startsWith("/seller/product-image")
                || path.startsWith("/seller/product-variant")) {
            return RequiredRole.SELLER;
        }

        if (path.equals("/shops/check")) {
            return RequiredRole.AUTHENTICATED;
        }

        if (path.matches("^/shops/\\d+/verify$")) {
            return RequiredRole.ADMIN;
        }

        if (path.startsWith("/shops") && isMutation(method)) {
            return "DELETE".equalsIgnoreCase(method) ? RequiredRole.ADMIN : RequiredRole.AUTHENTICATED;
        }

        if (path.startsWith("/addresses") || path.startsWith("/api/upload")
                || path.startsWith("/api/refunds") || path.startsWith("/api/refunds-requests-attachments")
                || path.startsWith("/api/user-vouchers") || path.startsWith("/api/voucher-redemptions")) {
            return RequiredRole.AUTHENTICATED;
        }

        if (isAdminCatalogPath(path) && isMutation(method)) {
            return RequiredRole.ADMIN;
        }

        return RequiredRole.NONE;
    }

    private boolean isPublicAuthPath(String path) {
        return path.startsWith("/auth")
                || path.equals("/users/login")
                || path.equals("/users/register")
                || path.equals("/users/forgot-password")
                || path.equals("/users/reset-password")
                || path.equals("/users/verify-email");
    }

    private boolean isMutation(String method) {
        return "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);
    }

    private boolean isAdminCatalogPath(String path) {
        return path.startsWith("/api/categories")
                || path.startsWith("/api/category-attribute")
                || path.startsWith("/api/category-brand")
                || path.startsWith("/api/attributes")
                || path.startsWith("/api/attribute-value")
                || path.startsWith("/api/attribute-unit")
                || path.startsWith("/api/brands")
                || path.startsWith("/api/units")
                || path.startsWith("/api/vouchers")
                || path.startsWith("/api/vouchercampaigns")
                || path.startsWith("/api/voucher-")
                || path.startsWith("/api/vouchercondition");
    }

    private String resolveToken(HttpServletRequest request) {
        String token = jwtService.resolveBearerToken(request.getHeader("Authorization"));
        if (token != null) {
            return token;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("token".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private boolean hasRequiredRole(AuthenticatedUser user, RequiredRole requiredRole) {
        if (requiredRole == RequiredRole.AUTHENTICATED) {
            return true;
        }

        Role role = normalizeRole(user.getUserType());

        if (requiredRole == RequiredRole.ADMIN) {
            return role == Role.ADMIN;
        }

        if (requiredRole == RequiredRole.SELLER) {
            return role == Role.SELLER;
        }

        return true;
    }

    private boolean canAccessRequestedResource(
            HttpServletRequest request,
            String path,
            AuthenticatedUser user) {
        if (normalizeRole(user.getUserType()) == Role.ADMIN) {
            return true;
        }

        Long currentUserId = user.getId();
        if (currentUserId == null) {
            return false;
        }

        Long requestedUserId = null;

        if (path.matches("^/users/\\d+(/avatar)?$")) {
            requestedUserId = extractLongPathSegment(path, 1);
        } else if (path.matches("^/addresses/user/\\d+$")) {
            requestedUserId = extractLongPathSegment(path, 2);
        } else if (path.equals("/shops/check")) {
            requestedUserId = parseLong(request.getParameter("user_id"));
        }

        return requestedUserId == null || requestedUserId.equals(currentUserId);
    }

    private Long extractLongPathSegment(String path, int segmentIndex) {
        String[] segments = path.split("/");
        int currentIndex = 0;

        for (String segment : segments) {
            if (segment == null || segment.isBlank()) {
                continue;
            }

            if (currentIndex == segmentIndex) {
                return parseLong(segment);
            }

            currentIndex++;
        }

        return null;
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
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

    private void writeAuthError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }

    private enum Role {
        ADMIN,
        SELLER,
        BUYER
    }
}
