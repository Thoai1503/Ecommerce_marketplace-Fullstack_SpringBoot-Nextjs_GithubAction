package docker_test.com.services;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import docker_test.com.models.User;

@Service
public class EmailVerificationService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final long TOKEN_TTL_SECONDS = 24 * 60 * 60;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.email-verification.secret:nexamart-local-email-secret}")
    private String verificationSecret;

    public void sendVerificationEmail(User user) {
        String token = createToken(user.getEmail());
        String verificationLink = normalizeBaseUrl(frontendUrl) + "/verify-email?token=" + token;

        if (mailSender == null || mailHost == null || mailHost.isBlank()) {
            System.out.println("Email verification link for " + user.getEmail() + ": " + verificationLink);
            return;
        }

        System.out.println("Sending verification email to " + user.getEmail()
                + " via " + mailHost
                + (mailUsername == null || mailUsername.isBlank() ? "" : " as " + mailUsername));

        String recipientName = user.getFullName() == null || user.getFullName().isBlank()
                ? "there"
                : user.getFullName();

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = createMimeMessageHelper(message);
        prepareVerificationMessage(helper, user.getEmail(), recipientName, verificationLink);

        mailSender.send(message);
        System.out.println("Verification email sent to " + user.getEmail());
    }

    private MimeMessageHelper createMimeMessageHelper(MimeMessage message) {
        try {
            return new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        } catch (MessagingException e) {
            throw new IllegalStateException("Unable to create verification email", e);
        }
    }

    private void prepareVerificationMessage(
            MimeMessageHelper helper,
            String recipientEmail,
            String recipientName,
            String verificationLink) {
        try {
            if (mailUsername != null && !mailUsername.isBlank()) {
                helper.setFrom(mailUsername);
            }
            helper.setTo(recipientEmail);
            helper.setSubject("Verify your Nexamart account");
            helper.setText("""
                    Hi %s,

                    Thanks for registering with Nexamart.
                    Please verify your email by opening this link or pressing the button in this email:

                    %s

                    This link expires in 24 hours.
                    If you did not create this account, please ignore this email.
                    """.formatted(recipientName, verificationLink),
                    buildVerificationEmailHtml(recipientName, verificationLink));
        } catch (MessagingException e) {
            throw new IllegalStateException("Unable to prepare verification email", e);
        }
    }

    private String buildVerificationEmailHtml(String recipientName, String verificationLink) {
        String safeName = escapeHtml(recipientName);
        String safeLink = escapeHtml(verificationLink);

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
                                <h1 style="margin:0;color:#1677ff;font-size:24px;line-height:32px;">Verify your Nexamart account</h1>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 28px 20px;font-size:15px;line-height:24px;color:#374151;">
                                <p style="margin:0 0 12px;">Hi %s,</p>
                                <p style="margin:0;">Thanks for registering with Nexamart. Press the button below to verify your email and activate account verification.</p>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding:6px 28px 28px;">
                                <a href="%s" style="display:inline-block;background:#1677ff;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 24px;border-radius:8px;">Verify account</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 28px 26px;font-size:13px;line-height:20px;color:#6b7280;">
                                <p style="margin:0 0 8px;">This link expires in 24 hours.</p>
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

    public String readEmailFromToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Missing verification token");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid verification token");
        }

        String payload = parts[0] + "." + parts[1];
        String expectedSignature = sign(payload);
        if (!constantTimeEquals(expectedSignature, parts[2])) {
            throw new IllegalArgumentException("Invalid verification token");
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid verification token");
        }

        if (Instant.now().getEpochSecond() > expiresAt) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        return new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
    }

    private String createToken(String email) {
        String encodedEmail = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(email.getBytes(StandardCharsets.UTF_8));
        long expiresAt = Instant.now().getEpochSecond() + TOKEN_TTL_SECONDS;
        String payload = encodedEmail + "." + expiresAt;

        return payload + "." + sign(payload);
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(
                    verificationSecret.getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGORITHM));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign verification token", e);
        }
    }

    private boolean constantTimeEquals(String left, String right) {
        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }

        int result = 0;
        for (int i = 0; i < leftBytes.length; i++) {
            result |= leftBytes[i] ^ rightBytes[i];
        }
        return result == 0;
    }
}
