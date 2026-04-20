package payment_service.com.gateway;

import payment_service.com.dto.CreatePaymentUrlRequest;
import payment_service.com.dto.CreatePaymentUrlResult;
import payment_service.com.dto.PaymentProvider;

/**
 * Strategy interface for payment gateway integrations.
 *
 * <p>To add a new payment provider (e.g. MoMo, ZaloPay):
 * <ol>
 *   <li>Add the provider constant to {@link PaymentProvider}.</li>
 *   <li>Create a Spring {@code @Component} that implements this interface.</li>
 *   <li>Implement {@link #supports()} to return the matching {@code PaymentProvider}.</li>
 *   <li>Implement {@link #createPaymentUrl} with the provider-specific HTTP call.</li>
 * </ol>
 * The new gateway is picked up automatically by {@code CreatePaymentUrlService}
 * — no changes to existing code are required.
 */
public interface PaymentGateway {

    /**
     * @return the {@link PaymentProvider} this implementation handles.
     */
    PaymentProvider supports();

    /**
     * Build and return the redirect URL for the given payment request.
     *
     * @param request          unified payment request payload
     * @param fallbackIpAddress client IP resolved from the HTTP request (used when
     *                          {@code request.getIpAddress()} is blank)
     * @return result containing the payment URL and metadata
     */
    CreatePaymentUrlResult createPaymentUrl(CreatePaymentUrlRequest request, String fallbackIpAddress);
}
