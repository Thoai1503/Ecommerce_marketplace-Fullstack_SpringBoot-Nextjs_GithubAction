package docker_test.com.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.voucher.CheckoutVoucherCalculationRequest;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationResponse;
import docker_test.com.services.VoucherCheckoutCalculationService;

@RestController
@RequestMapping("/api/voucher-checkout")
public class VoucherCheckoutController {
    private final VoucherCheckoutCalculationService calculationService;

    public VoucherCheckoutController(VoucherCheckoutCalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<CheckoutVoucherCalculationResponse> calculate(
            @RequestBody CheckoutVoucherCalculationRequest request) {
        return ResponseEntity.ok(calculationService.calculate(request));
    }
}
