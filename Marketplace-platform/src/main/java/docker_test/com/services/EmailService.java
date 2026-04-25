package docker_test.com.services;

import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * EmailService — wrapper gọi Resend API (https://resend.com/docs/api-reference/emails/send-email)
 * Không cần thêm dependency, chỉ dùng Java 11+ HttpClient + Gson đã có.
 */
@Service
public class EmailService {

    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from}")
    private String fromEmail;

    @Value("${resend.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @Value("${app.resend-owner-email:}")
    private String ownerEmail;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final Gson gson = new Gson();

    /** Gửi 1 email. Trả về response body từ Resend (có chứa id). */
    public String send(String to, String subject, String html) throws Exception {
        String actualTo = to;
        String actualSubject = subject;
        String actualHtml = html;

        // DEV MODE: Resend free tier chỉ cho gửi về email đã verify (owner).
        // Nếu người nhận KHÔNG phải owner → redirect về owner với note ở subject + banner ở body.
        if (devMode && ownerEmail != null && !ownerEmail.isBlank()
                && !ownerEmail.equalsIgnoreCase(to)) {
            System.out.println("[EmailService][DEV] Redirecting email: " + to + " → " + ownerEmail);
            actualTo = ownerEmail;
            actualSubject = "[DEV → " + to + "] " + subject;
            actualHtml = """
                    <div style="background:#fef3c7;border:2px dashed #f59e0b;padding:12px 16px;margin-bottom:16px;border-radius:8px;font-family:Arial;">
                      <p style="margin:0;color:#92400e;font-size:13px;"><b>🛠️ DEV MODE</b> — Email gốc nên gửi tới: <b>%s</b></p>
                      <p style="margin:4px 0 0;color:#92400e;font-size:12px;">Resend free tier giới hạn người nhận, nên redirect về owner account.</p>
                    </div>
                    """.formatted(to) + html;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("from", String.format("%s <%s>", fromName, fromEmail));
        body.put("to", actualTo);
        body.put("subject", actualSubject);
        body.put("html", actualHtml);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(RESEND_ENDPOINT))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
                .build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() >= 400) {
            throw new RuntimeException("Resend API error (" + res.statusCode() + "): " + res.body());
        }
        return res.body();
    }

    /**
     * Welcome email + link set-password cho seller mới được admin tạo.
     */
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

    /**
     * Email thông báo shop đã được duyệt.
     */
    public void sendShopApprovedEmail(String to, String shopName) throws Exception {
        String loginLink = frontendUrl + "/seller/login";
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#059669; font-size:24px; margin:0 0 12px 0;">Chúc mừng! Shop của bạn đã được duyệt 🎉</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Xin chào <strong>%s</strong>,
                    </p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Hồ sơ nhà bán hàng của bạn tại <strong>VietCommerce Hub</strong> đã được admin duyệt.
                      Bạn có thể đăng nhập và bắt đầu đăng sản phẩm ngay hôm nay.
                    </p>
                    <div style="text-align:center; margin:32px 0;">
                      <a href="%s" style="display:inline-block; background:#059669; color:white; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:15px;">
                        Đăng nhập quản lý shop
                      </a>
                    </div>
                    <p style="color:#94a3b8; font-size:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
                      Cần hỗ trợ? Liên hệ support@vietcommerce.vn hoặc hotline 1900 1234.
                    </p>
                  </div>
                </body></html>
                """.formatted(shopName, loginLink);

        send(to, "Shop của bạn đã được duyệt - VietCommerce Hub", html);
    }

    /**
     * Email thông báo hồ sơ shop bị từ chối kèm lý do.
     */
    public void sendShopRejectedEmail(String to, String shopName, String reason) throws Exception {
        String pendingLink = frontendUrl + "/seller/pending?email=" + java.net.URLEncoder.encode(to, java.nio.charset.StandardCharsets.UTF_8);
        String safeReason = reason == null ? "Không có lý do cụ thể" : reason;
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#dc2626; font-size:24px; margin:0 0 12px 0;">Hồ sơ của bạn chưa được duyệt</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Xin chào <strong>%s</strong>,
                    </p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Rất tiếc, hồ sơ nhà bán hàng của bạn tại <strong>VietCommerce Hub</strong> chưa được chấp thuận với lý do sau:
                    </p>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:8px; padding:16px; margin:20px 0; color:#991b1b; font-size:14px; line-height:1.6;">
                      %s
                    </div>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Bạn có thể cập nhật lại thông tin và đăng ký lại. Nếu cần hỗ trợ, liên hệ support@vietcommerce.vn.
                    </p>
                    <div style="text-align:center; margin:28px 0;">
                      <a href="%s" style="display:inline-block; background:#2563eb; color:white; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:14px;">
                        Xem chi tiết
                      </a>
                    </div>
                    <p style="color:#94a3b8; font-size:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
                      Email này được gửi tự động. Nếu có thắc mắc, vui lòng phản hồi email hoặc liên hệ hotline 1900 1234.
                    </p>
                  </div>
                </body></html>
                """.formatted(shopName, safeReason, pendingLink);

        send(to, "Hồ sơ nhà bán hàng chưa được duyệt - VietCommerce Hub", html);
    }

    /**
     * Email thông báo shop bị khóa kèm lý do.
     */
    public void sendShopBlockedEmail(String to, String shopName, String reason) throws Exception {
        String safeReason = reason == null || reason.isBlank() ? "Không có lý do cụ thể" : reason;
        String html = """
                <!DOCTYPE html>
                <html><body style="font-family: Arial, sans-serif; background:#f6f9fc; padding:32px 0; margin:0;">
                  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:40px; box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                    <h1 style="color:#dc2626; font-size:24px; margin:0 0 12px 0;">Shop của bạn đã bị tạm khóa</h1>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Xin chào <strong>%s</strong>,
                    </p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Shop của bạn tại <strong>VietCommerce Hub</strong> đã bị quản trị viên tạm khóa. Trong thời gian này, sản phẩm sẽ bị ẩn và bạn không thể tiếp nhận đơn hàng mới.
                    </p>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">Lý do:</p>
                    <div style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:8px; padding:16px; margin:12px 0 20px 0; color:#991b1b; font-size:14px; line-height:1.6;">
                      %s
                    </div>
                    <p style="color:#475569; line-height:1.6; font-size:15px;">
                      Nếu bạn cho rằng đây là nhầm lẫn hoặc muốn khiếu nại, vui lòng liên hệ <strong>support@vietcommerce.vn</strong> hoặc hotline <strong>1900 1234</strong>.
                    </p>
                    <p style="color:#94a3b8; font-size:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
                      Email này được gửi tự động từ hệ thống VietCommerce Hub.
                    </p>
                  </div>
                </body></html>
                """.formatted(shopName, safeReason);

        send(to, "Shop của bạn đã bị tạm khóa - VietCommerce Hub", html);
    }

    /**
     * OTP 6 số cho seller self-register flow.
     */
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
                      <div style="display:inline-block; background:#eff6ff; border:2px dashed #2563eb; border-radius:12px; padding:18px 36px; font-size:32px; font-weight:900; letter-spacing:8px; color:#1e3a8a; font-family: 'Courier New', monospace;">
                        %s
                      </div>
                    </div>
                    <p style="color:#94a3b8; font-size:12px; margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; line-height:1.6;">
                      Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với người khác.
                      Nếu bạn không yêu cầu, vui lòng bỏ qua email.
                    </p>
                  </div>
                </body></html>
                """.formatted(otp);

        send(to, "Mã xác thực đăng ký - VietCommerce Hub", html);
    }
}
