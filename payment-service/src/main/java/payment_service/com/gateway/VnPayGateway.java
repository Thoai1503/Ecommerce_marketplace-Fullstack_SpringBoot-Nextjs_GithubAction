package payment_service.com.gateway;

import org.springframework.stereotype.Component;

import payment_service.com.dto.CreatePaymentUrlRequest;
import payment_service.com.dto.CreatePaymentUrlResult;
import payment_service.com.dto.PaymentProvider;
import payment_service.com.dto.VnPayCreateUrlRequest;
import payment_service.com.dto.VnPayCreateUrlResponse;
import payment_service.com.service.VnPayService;

/**
 * PaymentGateway implementation for VNPay.
 *
 * <p>Adapts the unified {@link CreatePaymentUrlRequest} into a
 * {@link VnPayCreateUrlRequest}, delegates to {@link VnPayService},
 * and maps the VNPay-specific response back to {@link CreatePaymentUrlResult}.
 */
@Component
public class VnPayGateway implements PaymentGateway {

    private final VnPayService vnPayService;

    public VnPayGateway(VnPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @Override
    public PaymentProvider supports() {
        return PaymentProvider.VNPAY;
    }

    @Override
    public CreatePaymentUrlResult createPaymentUrl(CreatePaymentUrlRequest request, String fallbackIpAddress) {
        VnPayCreateUrlRequest vnPayRequest = toVnPayRequest(request);
        VnPayCreateUrlResponse response = vnPayService.createPaymentUrl(vnPayRequest, fallbackIpAddress);

        return CreatePaymentUrlResult.builder()
                .paymentUrl(response.paymentUrl())
                .txnRef(response.txnRef())
                .createDate(response.createDate())
                .expireDate(response.expireDate())
                .provider(PaymentProvider.VNPAY)
                .build();
    }

    private VnPayCreateUrlRequest toVnPayRequest(CreatePaymentUrlRequest src) {
        VnPayCreateUrlRequest dest = new VnPayCreateUrlRequest();
        dest.setOrderId(src.getOrderId());
        dest.setAmount(src.getAmount());
        dest.setOrderInfo(src.getOrderInfo());
        dest.setOrderType(src.getOrderType());
        dest.setBankCode(src.getBankCode());
        dest.setLanguage(src.getLanguage());
        dest.setIpAddress(src.getIpAddress());
        return dest;
    }
}
