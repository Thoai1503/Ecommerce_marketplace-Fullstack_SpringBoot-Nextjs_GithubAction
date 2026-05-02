package stock_gateway.com.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class StockCachingService {
   
	
	Map<String, Long> stockCache = new ConcurrentHashMap<>();
	
	public void cacheStockPrice(String stockSymbol, Long price) {
		stockCache.put(stockSymbol, price);
	}
	
	public Long getCachedStockPrice(String stockSymbol) {
		return stockCache.get(stockSymbol);
	}
	
	
	
}
