package payment_service.com.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import payment_service.com.dto.PaymentCallbackRequest;
import payment_service.com.dto.PaymentCallbackResult;
import payment_service.com.dto.PaymentProvider;
import payment_service.com.gateway.PaymentCallbackHandler;

/**
 * Orchestrates payment callback processing across multiple gateway providers.
 *
 * <p>Each incoming callback specifies which provider sent it (explicitly or
 * inferred from the txnRef/params). This service looks up the appropriate
 * {@link PaymentCallbackHandler} and delegates the processing.
 *
 * <p>To add a new callback handler for a provider:
 * <ol>
 *   <li>Create a {@code @Component} that implements {@link PaymentCallbackHandler}.</li>
 * </ol>
 * This service automatically discovers and registers the handler at startup.
 */
@Service
public class ProcessPaymentCallbackService {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentCallbackService.class);

    /** Registry: PaymentProvider → callback handler. Built once at startup. */
    private final Map<PaymentProvider, PaymentCallbackHandler> handlerRegistry;

    /**
     * Spring injects all {@link PaymentCallbackHandler} beans as a list;
     * this constructor converts it into a lookup map keyed by {@link PaymentProvider}.
     */
    public ProcessPaymentCallbackService(List<PaymentCallbackHandler> handlers) {
        this.handlerRegistry = handlers.stream()
                .collect(Collectors.toMap(PaymentCallbackHandler::supports, Function.identity()));
        log.info("Payment callback handlers registered: {}", handlerRegistry.keySet());
    }

    /**
     * Process an incoming callback and update order/payment state.
     *
     * @param request callback payload containing provider, params, source IP
     * @return result indicating success/failure of the payment
     * @throws UnsupportedOperationException if no handler is registered for the provider
     */
    public PaymentCallbackResult processCallback(PaymentCallbackRequest request) {
        PaymentProvider provider = request.getPaymentProvider();
        PaymentCallbackHandler handler = handlerRegistry.get(provider);

        if (handler == null) {
            throw new UnsupportedOperationException(
                    "No callback handler registered for payment provider: " + provider +
                    ". Registered providers: " + handlerRegistry.keySet());
        }

        log.info("Processing callback from {}: sourceIP={}", provider, request.getSourceIpAddress());
        PaymentCallbackResult result = handler.processCallback(request);
        log.info("Callback processed: provider={}, orderId={}, success={}", 
                provider, result.getOrderId(), result.isSuccess());

        return result;
    }
}
