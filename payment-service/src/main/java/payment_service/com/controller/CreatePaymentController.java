package payment_service.com.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import payment_service.com.dto.CreatePaymentUrlRequest;
import payment_service.com.dto.CreatePaymentUrlResult;
import payment_service.com.dto.PaymentCallbackRequest;
import payment_service.com.dto.PaymentCallbackResult;
import payment_service.com.dto.PaymentProvider;
import payment_service.com.service.CreatePaymentUrlService;
import payment_service.com.service.ProcessPaymentCallbackService;

import java.util.HashMap;
import java.util.Map;

/**
 * Unified payment URL creation and callback handling endpoints.
 *
 * POST /api/payments/create-url
 *
 * The caller specifies which provider to use via the {@code paymentProvider}
 * field in the request body (e.g. "VNPAY", "MOMO").
 * To add a new provider, implement PaymentGateway — no changes needed here.
 */
@RestController
@RequestMapping("/api/payments")
public class CreatePaymentController {

    private static final Logger log = LoggerFactory.getLogger(CreatePaymentController.class);
    private final String frontendBaseUrl;
    
    private final CreatePaymentUrlService createPaymentUrlService;
    private final ProcessPaymentCallbackService processPaymentCallbackService;

    public CreatePaymentController(CreatePaymentUrlService createPaymentUrlService,
                                   ProcessPaymentCallbackService processPaymentCallbackService,
                                   @Value("${return.view-url}") String frontendBaseUrl               
    		) {
        this.createPaymentUrlService = createPaymentUrlService;
        this.processPaymentCallbackService = processPaymentCallbackService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    /**
     * Create a payment redirect URL for the given order.
     *
     * @param request             unified payment request payload
     * @param httpServletRequest  raw HTTP request used to resolve the client IP
     * @return 200 with {@link CreatePaymentUrlResult}, or 400/500 on failure
     */
    @PostMapping("/create-url")
    // The request body contains the payment provider, order ID, amount, and other details needed to create the payment URL.
    public ResponseEntity<String> createPaymentUrl(
            @Valid @RequestBody CreatePaymentUrlRequest request,
            HttpServletRequest httpServletRequest) {

        String fallbackIpAddress = resolveClientIp(httpServletRequest);
        log.info("Create payment URL request: provider={}, orderId={}, amount={}",
                request.getPaymentProvider(), request.getOrderId(), request.getAmount());

        CreatePaymentUrlResult result = createPaymentUrlService.createUrl(request, fallbackIpAddress);

        log.info("Payment URL created: provider={}, orderId={}, txnRef={} , URL={}",
                result.getProvider(), request.getOrderId(), result.getTxnRef(), result.getPaymentUrl());

        return ResponseEntity.ok(result.getPaymentUrl());
    }

    /**
     * Handle payment gateway callbacks (return URLs).
     *
     * <p>Gateway providers (VNPay, MoMo, etc.) redirect the user here after payment
     * with query parameters describing the transaction status.
     *
     * <p>Endpoint: GET /api/payments/return?vnp_Amount=...&vnp_ResponseCode=00&vnp_SecureHash=...
     *
     * @param provider          payment provider (default VNPAY); infer from params if possible
     * @param httpServletRequest raw HTTP request with all query parameters
     * @return JSON result containing orderId, txnRef, success flag, and message
     */
    @GetMapping("/return")
    public RedirectView handlePaymentReturn(
            @RequestParam(value = "provider", required = false, defaultValue = "VNPAY") String provider,
            HttpServletRequest httpServletRequest) {

        PaymentProvider paymentProvider = PaymentProvider.valueOf(provider.toUpperCase());
        String sourceIpAddress = resolveClientIp(httpServletRequest);

        // Extract all query parameters
        Map<String, String> params = new HashMap<>();
        httpServletRequest.getParameterMap().forEach((key, values) -> {
        	System.out.println("Received query parameter: " + key + " = " + String.join(",", values));
            params.put(key, values.length > 0 ? values[0] : "");
        });

        log.info("Payment callback received: provider={}, params_count={}, sourceIP={}",
                paymentProvider, params.size(), sourceIpAddress);
        
        PaymentCallbackRequest callbackRequest = new PaymentCallbackRequest(
                paymentProvider,
                params,
                sourceIpAddress
        );

        PaymentCallbackResult result = processPaymentCallbackService.processCallback(callbackRequest);

        log.info("Payment callback result: orderId={}, success={}", result.getOrderId(), result.isSuccess());
        
        //return new RedirectView("http://localhost:3000/orders/" + result.getOrderId() + "?status=" + (result.isSuccess() ? "success" : "failure"));
        return new RedirectView(frontendBaseUrl + "/orders/" + result.getOrderId() + "?status=" + (result.isSuccess() ? "success" : "failure"));
    }

    private String resolveClientIp(HttpServletRequest httpRequest) {
        String forwardedFor = httpRequest.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return httpRequest.getRemoteAddr();
    }
}

