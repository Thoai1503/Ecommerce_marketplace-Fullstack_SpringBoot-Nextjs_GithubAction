package docker_test.com.controllers;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import docker_test.com.models.VnPayPayload;
import docker_test.com.services.payment.Vnpay;
import jakarta.servlet.http.HttpServletRequest;



@RestController
@RequestMapping("/payment")
public class PaymentController {
	@Autowired
	private Vnpay vnPay ;
	 @PostMapping("")
	    public ResponseEntity<?> create (HttpServletRequest request) throws Exception {
			System.out.println("QueryString: " + request.getQueryString());
			String url = vnPay.createPayment(request);
			   return ResponseEntity.ok(url); 
		}
	 
	 @GetMapping("/vnpay_return")
	    public RedirectView returnVnPay ( HttpServletRequest request) throws Exception {
		 Map<String, String[]> paramMap = request.getParameterMap();
   	  
 	    Map<String, String> fields = new HashMap();
 	    
 	    for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
	        fields.put(entry.getKey(), entry.getValue()[0]);
	    }
 	    String vnp_SecureHash = fields.get("vnp_SecureHash");
 	    
 	    fields.remove("vnp_SecureHash");
 	    var responseCode = String.valueOf(fields.get("vnp_ResponseCode"));
 	    System.out.println("Response code: " + responseCode);
 	    System.out.println("Secure hash: " + vnp_SecureHash);
 	    System.out.println("Fields: " + fields);
 	    String orderId = fields.get("vnp_OrderInfo");
 	    if(responseCode.equals("00")) {
 	    	System.out.println("Payment successful");
 	    	return new RedirectView("http://103.90.225.130:3000/orders/"  + orderId + "?status=success");
 	    }
 	    
 	    
 	    
	       
	           return new RedirectView("http://localhost:3000");
		}
	    
}
