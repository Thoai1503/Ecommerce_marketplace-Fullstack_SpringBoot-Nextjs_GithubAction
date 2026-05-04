package docker_test.com.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Base64;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import docker_test.com.models.User;
import docker_test.com.repository.PasswordResetTokenRepository;
import docker_test.com.repository.UserRepository;
import docker_test.com.utils.PasswordUtil;

@Service
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final long TOKEN_TTL_MINUTES = 30;

    private final SecureRandom secureRandom = new SecureRandom();
    private final UserRepository userRepository = UserRepository.Instance();
    private final PasswordResetTokenRepository tokenRepository = PasswordResetTokenRepository.Instance();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void requestPasswordReset(String email) throws SQLException {
        if (email == null || email.isBlank()) {
            return;
        }

        User user = userRepository.findByEmail(email.trim());
        if (user == null || user.getId() == null
                || (user.getIsActive() != null && user.getIsActive() == 0)) {
            return;
        }

        String token = generateToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(TOKEN_TTL_MINUTES);
        tokenRepository.createResetToken(user.getId(), token, expiresAt);

        String resetLink = normalizeBaseUrl(frontendUrl)
                + "/reset-password?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8);

        try {
            sendResetEmail(user, resetLink);
        } catch (Exception mailError) {
            System.err.println("Failed to send password reset email to " + user.getEmail());
            mailError.printStackTrace();
            System.out.println("Password reset link for " + user.getEmail() + ": " + resetLink);
        }
    }

    public boolean resetPassword(String token, String newPassword) throws SQLException {
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return false;
        }

        String passwordHash = PasswordUtil.hash(newPassword);
        return tokenRepository.resetPassword(token.trim(), passwordHash);
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendResetEmail(User user, String resetLink) {
        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            System.out.println("Password reset link for " + user.getEmail() + ": " + resetLink);
            return;
        }

        String recipientName = user.getFullName() == null || user.getFullName().isBlank()
                ? "there"
                : user.getFullName();

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = createMimeMessageHelper(message);
        prepareResetMessage(helper, user.getEmail(), recipientName, resetLink);
        mailSender.send(message);
    }

    private MimeMessageHelper createMimeMessageHelper(MimeMessage message) {
        try {
            return new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        } catch (MessagingException e) {
            throw new IllegalStateException("Unable to create password reset email", e);
        }
    }

    private void prepareResetMessage(
            MimeMessageHelper helper,
            String recipientEmail,
            String recipientName,
            String resetLink) {
        try {
            if (mailUsername != null && !mailUsername.isBlank()) {
                helper.setFrom(mailUsername);
            }
            helper.setTo(recipientEmail);
            helper.setSubject("Reset your Nexamart password");
            helper.setText("""
                    Hi %s,

                    We received a request to reset your Nexamart password.
                    Open this link to choose a new password:

                    %s

                    This link expires in 30 minutes.
                    If you did not request this, please ignore this email.
                    """.formatted(recipientName, resetLink),
                    buildResetEmailHtml(recipientName, resetLink));
        } catch (MessagingException e) {
            throw new IllegalStateException("Unable to prepare password reset email", e);
        }
    }

    private String buildResetEmailHtml(String recipientName, String resetLink) {
        String safeName = escapeHtml(recipientName);
        String safeLink = escapeHtml(resetLink);

        return """
                <!doctype html>
                <html>
                  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:32px 12px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                            <tr>
                              <td style="padding:28px 28px 10px;">
                                <h1 style="margin:0;color:#1677ff;font-size:24px;line-height:32px;">Reset your Nexamart password</h1>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 28px 20px;font-size:15px;line-height:24px;color:#374151;">
                                <p style="margin:0 0 12px;">Hi %s,</p>
                                <p style="margin:0;">Press the button below to choose a new password for your account.</p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:6px 28px 28px;">
                                <a href="%s" style="display:inline-block;background:#1677ff;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 24px;border-radius:8px;">Reset password</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 28px 26px;font-size:13px;line-height:20px;color:#6b7280;">
                                <p style="margin:0 0 8px;">This link expires in 30 minutes.</p>
                                <p style="margin:0;">If the button does not work, copy and paste this link into your browser:</p>
                                <p style="margin:8px 0 0;word-break:break-all;"><a href="%s" style="color:#1677ff;">%s</a></p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(safeName, safeLink, safeLink, safeLink);
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:3000";
        }

        return url.replaceAll("/+$", "");
    }
}
