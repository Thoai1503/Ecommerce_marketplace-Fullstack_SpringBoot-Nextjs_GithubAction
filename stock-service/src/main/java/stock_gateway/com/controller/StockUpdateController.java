package stock_gateway.com.controller;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.OrderItem;
import docker_test.com.dto.StockUpdateDTO;
import stock_gateway.com.service.StockQuantityCache;
import stock_gateway.com.service.StockService;

@RestController
@RequestMapping("/api/stock")
public class StockUpdateController {
    
	private final StockService stockService;
	private final StockQuantityCache stockQuantityCache;
	private static final Logger  LOGGER = LoggerFactory.getLogger(StockUpdateController.class);  
	
	public StockUpdateController(StockService stockService, StockQuantityCache stockQuantityCache) {
		this.stockService = stockService;
		this.stockQuantityCache = stockQuantityCache;
	}
	@PostMapping("/update")
	public String updateStock(@RequestBody StockUpdateDTO request) {
		 
		LOGGER.info("Received stock update request: variantId={}, quantity={}", request.getVariantId(), request.getQuantity());
		stockQuantityCache.cacheStockQuantity(request.getVariantId(), request.getQuantity());
		
		stockService.reverseStockUpdate(request.getVariantId(), request.getQuantity());
	    
		// Logic to update stock based on the request
	    // For example, you can call a service to handle the stock update
		LOGGER.info("Stock from cache after update: variantId={}, cachedQuantity={}", request.getVariantId(), stockQuantityCache.getCachedStockQuantity(request.getVariantId()));
	    return "Stock updated successfully for product ID: " + stockQuantityCache.getCachedStockQuantity(request.getVariantId());
	}
	
	
}
