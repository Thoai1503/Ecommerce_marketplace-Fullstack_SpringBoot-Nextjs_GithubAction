package payment_service.com.service;

import payment_service.com.config.VnPayProperties;
import payment_service.com.dto.VnPayCreateUrlRequest;
import payment_service.com.dto.VnPayCreateUrlResponse;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.TimeZone;
import java.util.TreeMap;

@Service
public class VnPayService {

    private static final String VNP_VERSION = "2.1.0";
    private static final String VNP_COMMAND = "pay";

    private final VnPayProperties vnPayProperties;

    public VnPayService(VnPayProperties vnPayProperties) {
        this.vnPayProperties = vnPayProperties;
    }

    public VnPayCreateUrlResponse createPaymentUrl(VnPayCreateUrlRequest request, String fallbackIpAddress) {
        String txnRef = generateTxnRef(request.getOrderId());

        TimeZone timeZone = TimeZone.getTimeZone("GMT+7");
        Calendar calendar = Calendar.getInstance(timeZone);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(timeZone);

        String createDate = formatter.format(calendar.getTime());
        calendar.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(calendar.getTime());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", VNP_VERSION);
        params.put("vnp_Command", VNP_COMMAND);
        params.put("vnp_TmnCode", vnPayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(request.getAmount() * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", request.getOrderInfo());
        params.put("vnp_OrderType", request.getOrderType() == null || request.getOrderType().isBlank() ? "other" : request.getOrderType());
        params.put("vnp_Locale", request.getLanguage() == null || request.getLanguage().isBlank() ? "vn" : request.getLanguage());
        params.put("vnp_ReturnUrl", vnPayProperties.getReturnUrl());
        params.put("vnp_IpAddr", resolveIpAddress(request.getIpAddress(), fallbackIpAddress));
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        if (request.getBankCode() != null && !request.getBankCode().isBlank()) {
            params.put("vnp_BankCode", request.getBankCode());
        }

        String hashData = buildHashData(params);
        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayProperties.getHashSecret(), hashData);

        String paymentUrl = vnPayProperties.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        return new VnPayCreateUrlResponse(paymentUrl, txnRef, createDate, expireDate);
    }

    private String resolveIpAddress(String ipAddressFromRequest, String fallbackIpAddress) {
        if (ipAddressFromRequest != null && !ipAddressFromRequest.isBlank()) {
            return ipAddressFromRequest;
        }
        if (fallbackIpAddress != null && !fallbackIpAddress.isBlank()) {
            return fallbackIpAddress;
        }
        return "127.0.0.1";
    }

    private String buildHashData(Map<String, String> params) {
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isBlank()) {
                parts.add(key + "=" + URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        }
        return String.join("&", parts);
    }

    private String buildQueryString(Map<String, String> params) {
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null && !value.isBlank()) {
                parts.add(URLEncoder.encode(key, StandardCharsets.US_ASCII) + "=" + URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        }
        return String.join("&", parts);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder result = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                result.append(String.format("%02x", b & 0xff));
            }
            return result.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot generate VNPay secure hash", ex);
        }
    }

    private String generateTxnRef(Long orderId) {
        long timestamp = System.currentTimeMillis();
        int randomSuffix = new Random().nextInt(900000) + 100000;
        return orderId + "-" + timestamp + randomSuffix;
    }
}
