package stock_gateway.com.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StockQuantityCache {
    private  final Map<Long, Integer> stockQuantityCache = new ConcurrentHashMap<>();
    private static final Logger LOGGER = LoggerFactory.getLogger(StockQuantityCache.class);
    
    public StockQuantityCache() {
    	LOGGER.info("Initialized StockQuantityCache");
    	LOGGER.info("StockQuantityCache is empty: {}", stockQuantityCache.isEmpty());
	}
    
    public void cacheStockQuantity(Long variantId, Integer quantity) {
		if(stockQuantityCache.containsKey(variantId)) {
			stockQuantityCache.computeIfPresent(variantId, (key, oldValue) -> oldValue + quantity);
		} else {
			stockQuantityCache.put(variantId, quantity);
		}
	}

	public Integer getCachedStockQuantity(Long variantId) {
		return stockQuantityCache.get(variantId);
	}

	public void clearCache() {
		stockQuantityCache.clear();
	}
	
	public boolean isStockQuantityCached(Long variantId) {
		return stockQuantityCache.containsKey(variantId);
	}
	
	public Map<Long, Integer> getAllCachedStockQuantities() {
		return new ConcurrentHashMap<>(stockQuantityCache);
	}
}

