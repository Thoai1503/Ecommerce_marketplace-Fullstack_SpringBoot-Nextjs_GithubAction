package logistic_service.com.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logistics")
public class ShipmentController {
    @GetMapping
    public String greating() {
    	return "Logistic service is running...";
    }
}
