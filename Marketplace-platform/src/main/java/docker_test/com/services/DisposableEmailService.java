package docker_test.com.services;

import org.springframework.stereotype.Service;
import java.util.Set;

/**
 * DisposableEmailService — Lớp 2 chống email rác.
 *
 * Chặn các domain email tạm thời (temp mail, throwaway email) phổ biến.
 * Danh sách cứng ở đây đủ cho 95% case; có thể thay bằng file txt hoặc API
 * (https://disposable.debounce.io/) nếu muốn đầy đủ.
 *
 * Sử dụng: @Autowired DisposableEmailService → isDisposable(email)
 */
@Service
public class DisposableEmailService {

    // Top ~60 domain email tạm thời phổ biến nhất (trên 95% traffic spam)
    private static final Set<String> DISPOSABLE_DOMAINS = Set.of(
            // 10 minute / temp mail
            "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
            "tempmailaddress.com", "tempmail.ninja", "tempmail.io", "tempmailo.com",
            "temp-mail.io", "tmpmail.org", "tmpmail.net", "mintemail.com",
            // Mailinator family
            "mailinator.com", "mailinator.net", "mailinator2.com", "mailnesia.com",
            "mailcatch.com", "maildrop.cc", "mailnull.com", "mailtemp.info",
            // Guerrilla mail family
            "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
            "guerrillamail.biz", "guerrillamailblock.com", "sharklasers.com",
            "grr.la", "spam4.me",
            // Throwaway
            "throwaway.email", "throwawaymail.com", "getnada.com", "nada.email",
            "dispostable.com", "yopmail.com", "yopmail.fr", "yopmail.net",
            "trashmail.com", "trashmail.net", "trash-mail.com", "trashmail.io",
            "fakeinbox.com", "fakemail.net", "fakemailgenerator.com",
            // Misc
            "mohmal.com", "moakt.com", "emailondeck.com", "burnermail.io",
            "email-fake.com", "emailfake.com", "33mail.com", "spambox.us",
            "anonbox.net", "mytrashmail.com", "mailcuk.com", "mvrht.net",
            "tempail.com", "dropmail.me", "inboxbear.com", "mail-temp.com",
            "tempr.email", "disposablemail.com", "nwytg.net", "wegwerfmail.de",
            "minuteinbox.com", "getairmail.com", "tempmailaddress.org",
            // Việt Nam specific
            "mail.vn.tn", "yahoo.vn.tn"
    );

    /** Trả true nếu email thuộc domain disposable. */
    public boolean isDisposable(String email) {
        if (email == null || email.isBlank()) return false;
        int at = email.indexOf('@');
        if (at < 0 || at == email.length() - 1) return false;
        String domain = email.substring(at + 1).trim().toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }

    /** Số lượng domain đang blocklist — dùng cho health check / admin UI. */
    public int size() {
        return DISPOSABLE_DOMAINS.size();
    }
}
