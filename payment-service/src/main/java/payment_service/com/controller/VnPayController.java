package payment_service.com.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import payment_service.com.dto.VnPayCreateUrlRequest;
import payment_service.com.dto.VnPayCreateUrlResponse;
import payment_service.com.service.VnPayService;

@RestController
@RequestMapping("/api/payments/vnpay")
public class VnPayController {

    private final VnPayService vnPayService;
    private static final Logger logger = LoggerFactory.getLogger(VnPayController.class);

    public VnPayController(VnPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    @PostMapping("/payment-url")
    public ResponseEntity<
    //VnPayCreateUrlResponse
    String
    > createPaymentUrl(
        @Valid @RequestBody VnPayCreateUrlRequest request,
        HttpServletRequest httpServletRequest
    ) {
    	logger.info("Received request to create VnPay URL for orderId: {}, amount: {}", request.getOrderId(), request.getAmount());
    	
        String forwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
        String fallbackIpAddress = (forwardedFor != null && !forwardedFor.isBlank())
            ? forwardedFor.split(",")[0].trim()
            : httpServletRequest.getRemoteAddr();

        VnPayCreateUrlResponse response = vnPayService.createPaymentUrl(request, fallbackIpAddress);
        logger.info("Generated VnPay URL: {}", response.paymentUrl() );
        String paymentUrl = response.paymentUrl();
        return ResponseEntity.ok(paymentUrl);
    }
    
    @GetMapping("/return")
    public RedirectView handlePaymentReturn(HttpServletRequest request) {
		return new RedirectView("");
	}
    
    
}
