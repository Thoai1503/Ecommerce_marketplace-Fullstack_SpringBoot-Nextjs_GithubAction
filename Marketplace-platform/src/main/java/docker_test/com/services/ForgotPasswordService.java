package docker_test.com.services;

import docker_test.com.models.PasswordResetToken;
import docker_test.com.models.User;
import docker_test.com.repository.PasswordResetTokenRepository;
import docker_test.com.repository.UserRepository;
import io.jsonwebtoken.Claims;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ForgotPasswordService {
    private static final String PURPOSE_SET_PASSWORD = "SET_PASSWORD";
    private static final String PURPOSE_RESET_TOKEN  = "RESET_TOKEN";
    private static final String ROLE_RESET_PASSWORD  = "RESET_PWD";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public ForgotPasswordService(UserRepository userRepository,
                                 PasswordResetTokenRepository tokenRepository,
                                 JwtService jwtService,
                                 EmailService emailService,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public void forgotPassword(String email) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("Email không tồn tại trong hệ thống");
            }

            tokenRepository.invalidateExistingForUser(user.getId(), PURPOSE_SET_PASSWORD);

            int otp = secureRandom.nextInt(900000) + 100000;
            String otpStr = String.valueOf(otp);
            String hashedOtp = hashOtp(otpStr);

            PasswordResetToken prt = PasswordResetToken.builder()
                    .userId(user.getId())
                    .token(hashedOtp)
                    .purpose(PURPOSE_SET_PASSWORD)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
            tokenRepository.save(prt);

            emailService.send(
                    email,
                    "[VietCommerce Hub] Mã xác thực đặt lại mật khẩu",
                    buildForgotPasswordEmail(otpStr));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Gửi mã đặt lại mật khẩu thất bại: " + e.getMessage(), e);
        }
    }

    public String verifyOtp(String email, String otp) {
        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new RuntimeException("Email không tồn tại");
            }

            PasswordResetToken record = tokenRepository
                    .findActiveByUserId(user.getId(), PURPOSE_SET_PASSWORD)
                    .orElseThrow(() -> new RuntimeException("OTP không hợp lệ hoặc đã hết hạn"));

            String hashedOtp = hashOtp(otp);
            if (!hashedOtp.equals(record.getToken())) {
                throw new RuntimeException("Mã OTP không chính xác");
            }

            tokenRepository.markUsed(record.getId());
            String resetToken = jwtService.createAccessToken(user.getId(), ROLE_RESET_PASSWORD);

            // Lưu resetToken vào DB để đảm bảo chỉ dùng được 1 lần
            PasswordResetToken resetRecord = PasswordResetToken.builder()
                    .userId(user.getId())
                    .token(resetToken)
                    .purpose(PURPOSE_RESET_TOKEN)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            tokenRepository.save(resetRecord);

            return resetToken;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Xác thực OTP thất bại: " + e.getMessage(), e);
        }
    }

    public void resetPassword(String resetToken, String newPassword) {
        try {
            Claims claims = jwtService.parseAccessToken(resetToken);
            String role = claims.get("role", String.class);
            if (!ROLE_RESET_PASSWORD.equals(role)) {
                throw new RuntimeException("Token không hợp lệ");
            }

            if (newPassword == null || newPassword.length() < 8) {
                throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự");
            }

            Long userId = Long.valueOf(claims.getSubject());

            // Kiểm tra resetToken còn hợp lệ trong DB (chưa dùng, chưa hết hạn)
            PasswordResetToken tokenRecord = tokenRepository
                    .findActiveByUserId(userId, PURPOSE_RESET_TOKEN)
                    .orElseThrow(() -> new RuntimeException("Token đã được sử dụng hoặc hết hạn"));

            if (!resetToken.equals(tokenRecord.getToken())) {
                throw new RuntimeException("Token không hợp lệ");
            }

            // Đánh dấu đã dùng → không thể dùng lại
            tokenRepository.markUsed(tokenRecord.getId());

            String hashedPassword = passwordEncoder.encode(newPassword);
            userRepository.updatePassword(userId, hashedPassword);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Đặt lại mật khẩu thất bại: " + e.getMessage(), e);
        }
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(otp.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Hash OTP thất bại: " + e.getMessage(), e);
        }
    }

    private String buildForgotPasswordEmail(String otp) {
        return """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#1e40af; font-size:22px; margin:0 0 12px 0;">Mã xác thực đặt lại mật khẩu</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Sử dụng mã OTP dưới đây để xác thực yêu cầu đặt lại mật khẩu trên VietCommerce Hub:
                    </p>
                    <div style="text-align:center; margin:28px 0;">
                      <div style="display:inline-block; background:#eff6ff; border:2px dashed #2563eb; border-radius:12px; padding:18px 36px; font-size:34px; font-weight:900; letter-spacing:8px; color:#1e3a8a; font-family:'Courier New', monospace;">
                        %s
                      </div>
                    </div>
                    <p style="color:#64748b; line-height:1.6; font-size:14px;">
                      Mã này có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
                    </p>
                    <p style="color:#94a3b8; font-size:12px; margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; line-height:1.6;">
                      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                    </p>
                  </div>
                </body></html>
                """.formatted(otp);
    }
}
