package docker_test.com.utils;

import docker_test.com.dto.AuthenticatedUser;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.repository.ShopRepository;
import docker_test.com.repository.VoucherRepository;
import jakarta.servlet.http.HttpServletRequest;

public final class VoucherAuthorization {
    private static final ShopRepository shopRepository = ShopRepository.Instance();
    private static final VoucherRepository voucherRepository = VoucherRepository.Instance();

    private VoucherAuthorization() {
    }

    public static AuthenticatedUser getAuthUser(HttpServletRequest request) {
        Object authUser = request.getAttribute("authUser");
        return authUser instanceof AuthenticatedUser user ? user : null;
    }

    public static Voucher getVoucher(Long voucherId) {
        if (voucherId == null || voucherId <= 0) {
            return null;
        }

        return voucherRepository.GetById(voucherId.intValue());
    }

    public static boolean isAdmin(AuthenticatedUser user) {
        return "admin".equals(normalizeRole(user));
    }

    public static boolean canManageVoucher(Long voucherId, AuthenticatedUser user) {
        return canManageVoucher(getVoucher(voucherId), user);
    }

    public static boolean canManageVoucher(Voucher voucher, AuthenticatedUser user) {
        if (voucher == null || user == null || user.getId() == null) {
            return false;
        }

        if (isAdmin(user)) {
            return true;
        }

        String issuerType = voucher.getIssuerType() == null
                ? ""
                : voucher.getIssuerType().trim().toUpperCase();
        if (!"SHOP".equals(issuerType) || voucher.getIssuerId() == null) {
            return false;
        }

        String role = normalizeRole(user);
        if (!"seller".equals(role)) {
            return false;
        }

        var shop = shopRepository.GetById(voucher.getIssuerId().intValue());
        return shop != null && shop.getUser_id() == user.getId();
    }

    private static String normalizeRole(AuthenticatedUser user) {
        if (user == null || user.getUserType() == null) {
            return "buyer";
        }

        String value = user.getUserType().trim().toLowerCase();
        if ("admin".equals(value)) {
            return "admin";
        }
        if ("seller".equals(value) || "both".equals(value)) {
            return "seller";
        }
        return "buyer";
    }
}
