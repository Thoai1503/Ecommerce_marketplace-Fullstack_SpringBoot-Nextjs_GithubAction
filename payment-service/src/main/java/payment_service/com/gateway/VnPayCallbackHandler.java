package payment_service.com.gateway;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import payment_service.com.config.VnPayProperties;
import payment_service.com.dto.PaymentCallbackRequest;
import payment_service.com.dto.PaymentCallbackResult;
import payment_service.com.dto.PaymentProvider;
import payment_service.com.entity.PaymentTransaction;
import payment_service.com.service.PaymentTransactionService;

/**
 * Handles callbacks (return URLs) from VNPay gateway.
 *
 * <p>VNPay redirects the client to the configured return URL with query parameters:
 * {@code GET /api/payments/return?vnp_Amount=...&vnp_ResponseCode=00&vnp_SecureHash=...}
 *
 * <p>This handler:
 * <ol>
 *   <li>Verifies the signature to prevent spoofing.</li>
 *   <li>Extracts orderId from txnRef.</li>
 *   <li>Maps VNPay response codes to payment status.</li>
 *   <li>Updates the order in the database.</li>
 * </ol>
 */
@Component
public class VnPayCallbackHandler implements PaymentCallbackHandler {

    private static final Logger log = LoggerFactory.getLogger(VnPayCallbackHandler.class);

    private final VnPayProperties vnPayProperties;
    private final PaymentTransactionService paymentTransactionService;

    public VnPayCallbackHandler(VnPayProperties vnPayProperties,
                                PaymentTransactionService paymentTransactionService) {
        this.vnPayProperties = vnPayProperties;
        this.paymentTransactionService = paymentTransactionService;
    }

    @Override
    public PaymentProvider supports() {
        return PaymentProvider.VNPAY;
    }

    @Override
    public PaymentCallbackResult processCallback(PaymentCallbackRequest request) {
        Map<String, String> params = request.getParams();
        String secureHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        log.info("Processing VNPay callback: txnRef={}, responseCode={}", txnRef, responseCode);

        // 1. Verify signature
        if (!verifySecureHash(params, secureHash)) {
            log.error("VNPay secure hash verification failed for txnRef={}", txnRef);
            updateTransactionOnCallback(txnRef, null, "FAILED", responseCode, "Signature verification failed", params);
            return PaymentCallbackResult.builder()
                    .txnRef(txnRef)
                    .success(false)
                    .message("Signature verification failed")
                    .provider(PaymentProvider.VNPAY)
                    .responseCode(responseCode)
                    .build();
        }

        // 2. Extract orderId from txnRef (format: orderId-timestamp-random)
        Long orderId = extractOrderId(txnRef);
        if (orderId == null) {
            log.error("Cannot extract orderId from txnRef={}", txnRef);
            updateTransactionOnCallback(txnRef, null, "FAILED", responseCode, "Invalid txnRef format", params);
            return PaymentCallbackResult.builder()
                    .txnRef(txnRef)
                    .success(false)
                    .message("Invalid txnRef format")
                    .provider(PaymentProvider.VNPAY)
                    .responseCode(responseCode)
                    .build();
        }

        // 3. Determine payment success based on VNPay response code
        boolean paymentSuccess = "00".equals(responseCode);
        String targetStatus = paymentSuccess ? "SUCCESS" : "FAILED";
        String callbackMessage = paymentSuccess ? "Payment successful" : "Payment failed";

        log.info("VNPay callback processed: orderId={}, success={}, responseCode={}", 
                orderId, paymentSuccess, responseCode);

        updateTransactionOnCallback(txnRef, orderId, targetStatus, responseCode, callbackMessage, params);

        return PaymentCallbackResult.builder()
                .orderId(orderId)
                .txnRef(txnRef)
                .success(paymentSuccess)
                .message(callbackMessage)
                .provider(PaymentProvider.VNPAY)
                .responseCode(responseCode)
                .build();
    }

    private void updateTransactionOnCallback(String txnRef,
                                             Long orderId,
                                             String targetStatus,
                                             String responseCode,
                                             String message,
                                             Map<String, String> params) {
        Optional<PaymentTransaction> byTxnCode = paymentTransactionService.findOptionalByTxnCode(txnRef);
        Optional<PaymentTransaction> byOrderId = orderId == null
                ? Optional.empty()
                : paymentTransactionService.findOptionalByOrderId(orderId);

        PaymentTransaction tx = byTxnCode.or(() -> byOrderId).orElse(null);
        if (tx == null) {
            log.warn("No payment transaction found for callback txnRef={}, orderId={}", txnRef, orderId);
            return;
        }

        if (!targetStatus.equalsIgnoreCase(tx.getStatus())) {
            tx = paymentTransactionService.updateStatus(
                    tx.getId(),
                    targetStatus,
                    "VNPay callback code=" + responseCode,
                    "SYSTEM",
                    0L
            );
        }

        tx.setGatewayTxnId(params.get("vnp_TransactionNo"));
        tx.setGatewayRefCode(txnRef);
        tx.setGatewayResponseCode(responseCode);
        tx.setGatewayResponseMsg(message);
        tx.setBankCode(params.get("vnp_BankCode"));
        tx.setCardType(params.get("vnp_CardType"));

        if ("SUCCESS".equalsIgnoreCase(targetStatus)) {
            tx.setCompletedAt(LocalDateTime.now());
            tx.setConfirmedAt(LocalDateTime.now());
            tx.setFailureReason(null);
        } else {
            tx.setFailureReason(trimFailureReason("VNPay response code: " + responseCode));
        }

        paymentTransactionService.createTransaction(tx);
    }

    /**
     * Verify the vnp_SecureHash by rebuilding it from all other params
     * and comparing with the provided hash.
     */
    private boolean verifySecureHash(Map<String, String> params, String providedHash) {
        // Remove the hash and any extra params that shouldn't be part of hash calculation
        Map<String, String> hashParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (!key.equals("vnp_SecureHash") && value != null && !value.isBlank()) {
                hashParams.put(key, value);
            }
        }

        // Rebuild the hash data
        String hashData = buildHashData(hashParams);
        String calculatedHash = hmacSHA512(vnPayProperties.getHashSecret(), hashData);

        return calculatedHash.equalsIgnoreCase(providedHash);
    }

    private String buildHashData(Map<String, String> params) {
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            parts.add(entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }
        return String.join("&", parts);
    }

    /**
     * HMAC-SHA512 signature calculation (matching VNPayService logic).
     */
    private String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder result = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                result.append(String.format("%02x", b & 0xff));
            }
            return result.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot verify VNPay secure hash", ex);
        }
    }

    /**
     * Extract orderId from txnRef.
     * Format: orderId-timestamp-random
     * Example: 123-1650000000000100000
     */
    private Long extractOrderId(String txnRef) {
        if (txnRef == null || txnRef.isBlank()) {
            return null;
        }
        try {
            String[] parts = txnRef.split("-");
            return Long.parseLong(parts[0]);
        } catch (Exception e) {
            log.warn("Failed to parse orderId from txnRef: {}", txnRef, e);
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
