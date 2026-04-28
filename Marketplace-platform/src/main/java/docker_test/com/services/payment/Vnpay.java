package docker_test.com.services.payment;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.google.gson.Gson;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import docker_test.com.configs.VnpayConfig;



@Component
public class Vnpay {

	@Autowired
	private VnpayConfig vnPayConfig;
	
	public String createPayment(HttpServletRequest req) throws UnsupportedEncodingException {
		System.out.println("QueryString: " + req.getQueryString());
		 String vnp_Version = "2.1.0";
         String vnp_Command = "pay";
         String vnp_OrderInfo = req.getParameter("orderInfo");
      //   String orderId = req.getParameter("orderId");
         String orderType = req.getParameter("ordertype");
         String bank_c = req.getParameter("bankCode");
         System.out.println("Bank code: " + bank_c);
         System.out.println("Order info: " + vnp_OrderInfo);
         System.out.println("Order type: " + orderType);
         String vnp_TxnRef = vnPayConfig.getRandomNumber(8);
         String vnp_IpAddr = vnPayConfig.getIpAddress(req);
         String vnp_TmnCode = vnPayConfig.getTmnCode();
         String am = req.getParameter("amount");
         System.out.println("Amount = " + am);
         int amount = Integer.parseInt(req.getParameter("amount")) * 100;
         Map vnp_Params = new HashMap<>();
         vnp_Params.put("vnp_Version", vnp_Version); //Phiên bản cũ là 2.0.0, 2.0.1 thay đổi sang 2.1.0
         vnp_Params.put("vnp_Command", vnp_Command);
         vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
         vnp_Params.put("vnp_Amount", String.valueOf(amount));
         vnp_Params.put("vnp_CurrCode", "VND");
         String bank_code = req.getParameter("bankCode");
         System.out.println("Bank code: " + bank_code);
         if (bank_code != null && !bank_code.isEmpty()) {
             vnp_Params.put("vnp_BankCode", bank_code);
         }
         vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
         vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
         vnp_Params.put("vnp_OrderType", orderType);
 
         String locate = req.getParameter("language");
         if (locate != null && !locate.isEmpty()) {
             vnp_Params.put("vnp_Locale", locate);
         } else {
             vnp_Params.put("vnp_Locale", "vn");
         }
         vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
         vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
      // Lưu ý là "GMT+7", không có chữ "Etc/"
         Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("GMT+7"));
 
         SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
         String vnp_CreateDate = formatter.format(cld.getTime());
 
         vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
 
         cld.add(Calendar.MINUTE, 15);
         String vnp_ExpireDate = formatter.format(cld.getTime());
//         vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
//
         //Build data to hash and querystring
         List fieldNames = new ArrayList(vnp_Params.keySet());
         Collections.sort(fieldNames);
         StringBuilder hashData = new StringBuilder();
         StringBuilder query = new StringBuilder();
         Iterator itr = fieldNames.iterator();
         
           
         while (itr.hasNext()) {
             String fieldName = (String) itr.next();
             String fieldValue = (String) vnp_Params.get(fieldName);
             if ((fieldValue != null) && (fieldValue.length() > 0)) {
                 //Build hash data
                 hashData.append(fieldName);
                 hashData.append('=');
                 hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                 //Build query
                 query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                 query.append('=');
                 query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                 if (itr.hasNext()) {
                     query.append('&');
                     hashData.append('&');
                 }
             }
         }
         System.out.println("Hash: "+hashData);

         String queryUrl = query.toString();
         

         
         String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
         queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

         
             
         

         String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;
         System.out.print("Url: "+paymentUrl);
//   		
         return paymentUrl;
	}

    //vui lòng tham khảo thêm tại code demo
    
}
