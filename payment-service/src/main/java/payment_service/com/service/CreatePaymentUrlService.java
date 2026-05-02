package payment_service.com.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import payment_service.com.dto.CreatePaymentUrlRequest;
import payment_service.com.dto.CreatePaymentUrlResult;
import payment_service.com.dto.PaymentProvider;
import payment_service.com.entity.PaymentTransaction;
import payment_service.com.gateway.PaymentGateway;

/**
 * Orchestrates payment URL creation across multiple gateway providers.
 *
 * <p>Uses the Strategy pattern: each {@link PaymentGateway} bean declares which
 * {@link PaymentProvider} it handles via {@link PaymentGateway#supports()}.
 * This service builds a registry at startup and dispatches each request to the
 * correct gateway.
 *
 * <p><b>To add a new payment provider:</b>
 * <ol>
 *   <li>Add a constant to {@link PaymentProvider}.</li>
 *   <li>Create a {@code @Component} that implements {@link PaymentGateway}.</li>
 * </ol>
 * No changes to this class are required.
 */
@Service
public class CreatePaymentUrlService {

    private static final Logger log = LoggerFactory.getLogger(CreatePaymentUrlService.class);
    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** Registry: PaymentProvider → gateway implementation. Built once at startup. */
    private final Map<PaymentProvider, PaymentGateway> gatewayRegistry;
    private final PaymentTransactionService paymentTransactionService;

    /**
     * Spring injects all {@link PaymentGateway} beans as a list; this constructor
     * converts it into a lookup map keyed by {@link PaymentProvider}.
     */
    public CreatePaymentUrlService(List<PaymentGateway> gateways,
                                   PaymentTransactionService paymentTransactionService) {
        this.gatewayRegistry = gateways.stream()
                .collect(Collectors.toMap(PaymentGateway::supports, Function.identity()));
        this.paymentTransactionService = paymentTransactionService;
        log.info("Payment gateways registered: {}", gatewayRegistry.keySet());
    }

    /**
     * Create a payment URL for the provider specified in the request.
     *
     * @param request           unified payment request
     * @param fallbackIpAddress client IP from the HTTP layer (used when request has none)
     * @return result containing the redirect URL and gateway metadata
     * @throws UnsupportedOperationException if no gateway is registered for the provider
     */
    public CreatePaymentUrlResult createUrl(CreatePaymentUrlRequest request, String fallbackIpAddress) {
        PaymentProvider provider = request.getPaymentProvider();
        PaymentGateway gateway = gatewayRegistry.get(provider);

        if (gateway == null) {
            throw new UnsupportedOperationException(
                    "No gateway registered for payment provider: " + provider +
                    ". Registered providers: " + gatewayRegistry.keySet());
        }

        PaymentTransaction transaction = paymentTransactionService
                .findOptionalByOrderId(request.getOrderId())
                .orElseGet(() -> buildNewTransaction(request, provider, fallbackIpAddress));

        transaction.setStatus("PENDING");
        transaction.setFailureReason(null);
        transaction.setGatewayCode(provider.name());
        transaction.setPaymentMethod(provider.name());
        transaction.setIpAddress(fallbackIpAddress);
        paymentTransactionService.createTransaction(transaction);

        log.info("Creating payment URL via {} for orderId={}", provider, request.getOrderId());
        try {
            CreatePaymentUrlResult result = gateway.createPaymentUrl(request, fallbackIpAddress);

            transaction.setTxnCode(result.getTxnRef());
            transaction.setGatewayRefCode(result.getTxnRef());
            transaction.setGatewayOrderId(String.valueOf(request.getOrderId()));
            transaction.setPaymentUrl(result.getPaymentUrl());
            transaction.setStatus("PROCESSING");
            transaction.setGatewayResponseMsg("PAYMENT_URL_CREATED");
            transaction.setExpiredAt(parseGatewayDate(result.getExpireDate()));
            paymentTransactionService.createTransaction(transaction);

            log.info("Payment URL created for orderId={}, txnRef={}", request.getOrderId(), result.getTxnRef());
            return result;
        } catch (Exception ex) {
            transaction.setStatus("FAILED");
            transaction.setFailureReason(trimFailureReason(ex.getMessage()));
            transaction.setGatewayResponseMsg("CREATE_PAYMENT_URL_FAILED");
            paymentTransactionService.createTransaction(transaction);
            throw ex;
        }
    }

    private PaymentTransaction buildNewTransaction(CreatePaymentUrlRequest request,
                                                   PaymentProvider provider,
                                                   String fallbackIpAddress) {
        return PaymentTransaction.builder()
                .txnCode("TMP-" + request.getOrderId() + "-" + System.currentTimeMillis())
                .txnType("ORDER_PAYMENT")
                .refType("ORDER")
                .refId(request.getOrderId())
                .orderId(request.getOrderId())
                .grossAmount(request.getAmount())
                .feeAmount(0L)
                .discountAmount(0L)
                .netAmount(request.getAmount())
                .currency("VND")
                .paymentMethod(provider.name())
                .gatewayCode(provider.name())
                .bankCode(request.getBankCode())
                .status("PROCESSING")
                .initiatedBy("SYSTEM")
                .initiatorId(0L)
                .ipAddress(fallbackIpAddress)
                .note("Create payment URL request")
                .build();
    }

    private LocalDateTime parseGatewayDate(String dateValue) {
        if (dateValue == null || dateValue.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateValue, VNP_DATE_FORMAT);
        } catch (DateTimeParseException ex) {
            log.warn("Cannot parse gateway date '{}': {}", dateValue, ex.getMessage());
            return null;
        }
    }

    private String trimFailureReason(String reason) {
        if (reason == null) {
            return null;
        }
        return reason.length() <= 250 ? reason : reason.substring(0, 250);
    }
}

