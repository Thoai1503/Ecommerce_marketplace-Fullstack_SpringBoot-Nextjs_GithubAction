package payment_service.com.gateway;

import payment_service.com.dto.PaymentCallbackRequest;
import payment_service.com.dto.PaymentCallbackResult;
import payment_service.com.dto.PaymentProvider;

/**
 * Strategy interface for processing payment callbacks from each provider.
 *
 * <p>Each gateway sends callback data in its own format (different param names,
 * different signatures, different status codes). This interface abstracts those
 * differences so the business logic is independent of the provider.
 *
 * <p>To add a new callback handler:
 * <ol>
 *   <li>Create a Spring {@code @Component} that implements this interface.</li>
 *   <li>Implement {@link #supports()} to return the matching {@code PaymentProvider}.</li>
 *   <li>Implement {@link #processCallback()} to:
 *     <ul>
 *       <li>Verify the signature/hash (to prevent spoofing).</li>
 *       <li>Extract orderId, txnRef, responseCode from the provider's params.</li>
 *       <li>Update the order status in the database.</li>
 *       <li>Publish events (e.g. OrderPaymentCompleted, OrderPaymentFailed).</li>
 *       <li>Return a {@link PaymentCallbackResult} with the outcome.</li>
 *     </ul>
 *   </li>
 * </ol>
 * The orchestrator {@code ProcessPaymentCallbackService} will automatically
 * discover and use the right handler.
 */
public interface PaymentCallbackHandler {

    /**
     * @return the {@link PaymentProvider} this handler processes.
     */
    PaymentProvider supports();

    /**
     * Process an incoming callback and update order/payment state.
     *
     * @param request callback payload
     * @return result indicating success/failure and any error messages
     */
    PaymentCallbackResult processCallback(PaymentCallbackRequest request);
}
