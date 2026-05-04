package stock_gateway.com.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service 
public class StockCachingService {
   
	
	Map<String, Long> stockCache = new ConcurrentHashMap<>();
	
	public void cacheStockPrice(String stockSymbol, Long price) {
		stockCache.put(stockSymbol, price);
	}
	
	public Long getCachedStockPrice(String stockSymbol) {
		return stockCache.get(stockSymbol);
	}
	
	
	public void clearCache() {
		stockCache.clear();
	}
	public boolean isStockPriceCached(String stockSymbol) {
		return stockCache.containsKey(stockSymbol);
	}
	
	public Map<String, Long> getAllCachedStockPrices() {
		return new ConcurrentHashMap<>(stockCache);
	}
	public void incrementStockPrice(String stockSymbol, Long increment) {
		stockCache.computeIfPresent(stockSymbol, (key, oldValue) -> oldValue + increment);
	}
	
	
}
