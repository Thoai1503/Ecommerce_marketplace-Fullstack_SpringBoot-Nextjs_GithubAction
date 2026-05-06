package docker_test.com.services;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import docker_test.com.dto.AuthenticatedUser;
import docker_test.com.dto.LoginRequest;
import docker_test.com.dto.LoginResponse;
import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(JwtService jwtService) {
        this.jwtService = jwtService;
        this.userRepository = UserRepository.Instance();
    }

    public LoginResponse login(LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu email hoặc mật khẩu");
        }

        User user = userRepository.findByEmail(req.getEmail());

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email không tồn tại");
        }

        boolean matched = PasswordUtil.verify(req.getPassword(), user.getPasswordHash());
        if (!matched) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai mật khẩu");
        }

        if (Integer.valueOf(0).equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản bị khóa");
        }

        if (user.getIsVerified() == null || user.getIsVerified() != 1) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản chưa xác minh email");
        }

        return buildLoginResponse(user);
    }

    public LoginResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token không được để trống");
        }

        AuthenticatedUser tokenUser = jwtService.parseRefreshToken(refreshToken);
        User user = tokenUser.getId() == null
                ? userRepository.findByEmail(tokenUser.getEmail())
                : userRepository.GetById(tokenUser.getId().intValue());

        if (user == null
                || Integer.valueOf(0).equals(user.getIsActive())
                || user.getIsVerified() == null
                || user.getIsVerified() != 1) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ");
        }

        return buildLoginResponse(user);
    }

    public AuthenticatedUser authenticate(String authorizationHeader) {
        String token = jwtService.resolveBearerToken(authorizationHeader);

        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Authorization token");
        }

        return jwtService.parseAccessToken(token);
    }

    public void addAuthCookies(LoginResponse loginResponse, HttpServletResponse response) {
        addCookie(response, "token", loginResponse.getAccessToken(), true, loginResponse.getExpiresIn());
        addCookie(response, "refreshToken", loginResponse.getRefreshToken(), true, loginResponse.getRefreshExpiresIn());
        addCookie(response, "role", loginResponse.getUserType(), true, loginResponse.getRefreshExpiresIn());
        addCookie(response, "user", String.valueOf(loginResponse.getId()), true, loginResponse.getRefreshExpiresIn());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        addCookie(response, "token", "", true, 0);
        addCookie(response, "refreshToken", "", true, 0);
        addCookie(response, "role", "", true, 0);
        addCookie(response, "user", "", true, 0);
    }

    private LoginResponse buildLoginResponse(User user) {
        if (user.getId() == null) {
            user.setId(userRepository.findUserIdByEmail(user.getEmail()));
        }

        Long resolvedUserId = user.getId();
        user.setPasswordHash(null);

        String accessToken = jwtService.generateAccessToken(user, resolvedUserId);
        String refreshToken = jwtService.generateRefreshToken(user, resolvedUserId);

        return new LoginResponse(
                resolvedUserId,
                user.getEmail(),
                user.getFullName(),
                user.getUserType(),
                accessToken,
                refreshToken,
                jwtService.getAccessTokenSeconds(user.getUserType()),
                jwtService.getRefreshTokenSeconds(user.getUserType()),
                jwtService.getIdleTimeoutSeconds(user.getUserType()));
    }

    private void addCookie(HttpServletResponse response, String name, String value, boolean httpOnly, long maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value == null ? "" : value)
                .httpOnly(httpOnly)
                .secure(false)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}
