package docker_test.com.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${resend.from-name:VietCommerce Hub}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String send(String to, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
        return "sent";
    }

    public void sendSellerWelcomeEmail(String to, String shopName, String setupToken) throws Exception {
        String setupLink = frontendUrl + "/set-password?token=" + setupToken;
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#1e40af; font-size:24px; margin:0 0 12px 0;">Chào mừng đến với VietCommerce Hub! 🎉</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Xin chào <strong>%s</strong>,
                    </p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Admin vừa tạo tài khoản nhà bán hàng cho bạn. Nhấn nút bên dưới để thiết lập mật khẩu và đăng nhập lần đầu:
                    </p>
                    <div style="text-align:center; margin:32px 0;">
                      <a href="%s" style="display:inline-block; background:#2563eb; color:white; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:15px;">
                        Thiết lập mật khẩu
                      </a>
                    </div>
                    <p style="color:#64748b; font-size:13px; line-height:1.6;">
                      Hoặc copy link sau vào trình duyệt:<br>
                      <a href="%s" style="color:#2563eb; word-break:break-all;">%s</a>
                    </p>
                    <p style="color:#94a3b8; font-size:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
                      Link này có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.
                    </p>
                  </div>
                </body></html>
                """.formatted(shopName, setupLink, setupLink, setupLink);
        send(to, "Kích hoạt tài khoản nhà bán hàng - VietCommerce Hub", html);
    }

    public void sendShopApprovedEmail(String to, String shopName) throws Exception {
        String loginLink = frontendUrl + "/seller/login";
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#059669; font-size:24px; margin:0 0 12px 0;">Chúc mừng! Shop của bạn đã được duyệt 🎉</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">Xin chào <strong>%s</strong>,</p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Hồ sơ nhà bán hàng của bạn tại <strong>VietCommerce Hub</strong> đã được admin duyệt.
                    </p>
                    <div style="text-align:center; margin:32px 0;">
                      <a href="%s" style="display:inline-block; background:#059669; color:white; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:15px;">
                        Đăng nhập quản lý shop
                      </a>
                    </div>
                  </div>
                </body></html>
                """.formatted(shopName, loginLink);
        send(to, "Shop của bạn đã được duyệt - VietCommerce Hub", html);
    }

    public void sendShopRejectedEmail(String to, String shopName, String reason) throws Exception {
        String pendingLink = frontendUrl + "/seller/pending?email=" + java.net.URLEncoder.encode(to, java.nio.charset.StandardCharsets.UTF_8);
        String safeReason = reason == null ? "Không có lý do cụ thể" : reason;
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#dc2626; font-size:24px; margin:0 0 12px 0;">Hồ sơ của bạn chưa được duyệt</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">Xin chào <strong>%s</strong>,</p>
                    <div style="background:#fef2f2; border-left:4px solid #dc2626; border-radius:8px; padding:16px; margin:20px 0; color:#991b1b; font-size:14px;">
                      %s
                    </div>
                    <div style="text-align:center; margin:28px 0;">
                      <a href="%s" style="display:inline-block; background:#2563eb; color:white; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:14px;">
                        Xem chi tiết
                      </a>
                    </div>
                  </div>
                </body></html>
                """.formatted(shopName, safeReason, pendingLink);
        send(to, "Hồ sơ nhà bán hàng chưa được duyệt - VietCommerce Hub", html);
    }

    public void sendShopBlockedEmail(String to, String shopName, String reason) throws Exception {
        String safeReason = reason == null || reason.isBlank() ? "Không có lý do cụ thể" : reason;
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#dc2626; font-size:24px; margin:0 0 12px 0;">Shop của bạn đã bị tạm khóa</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">Xin chào <strong>%s</strong>,</p>
                    <div style="background:#fef2f2; border-left:4px solid #dc2626; border-radius:8px; padding:16px; margin:12px 0 20px; color:#991b1b; font-size:14px;">
                      %s
                    </div>
                    <p style="color:#475569; font-size:15px;">Liên hệ <strong>support@vietcommerce.vn</strong> nếu có thắc mắc.</p>
                  </div>
                </body></html>
                """.formatted(shopName, safeReason);
        send(to, "Shop của bạn đã bị tạm khóa - VietCommerce Hub", html);
    }

    public void sendOtpEmail(String to, String otp) throws Exception {
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#1e40af; font-size:22px; margin:0 0 12px 0;">Mã xác thực đăng ký 🔐</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Sử dụng mã dưới đây để hoàn tất đăng ký nhà bán hàng trên VietCommerce Hub:
                    </p>
                    <div style="text-align:center; margin:28px 0;">
                      <div style="display:inline-block; background:#eff6ff; border:2px dashed #2563eb; border-radius:12px; padding:18px 36px; font-size:32px; font-weight:900; letter-spacing:8px; color:#1e3a8a; font-family:'Courier New', monospace;">
                        %s
                      </div>
                    </div>
                    <p style="color:#94a3b8; font-size:12px; margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; line-height:1.6;">
                      Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với người khác.
                    </p>
                  </div>
                </body></html>
                """.formatted(otp);
        send(to, "Mã xác thực đăng ký - VietCommerce Hub", html);
    }
}
