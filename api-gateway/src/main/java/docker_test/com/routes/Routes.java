package docker_test.com.routes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.function.*;

import static org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions.circuitBreaker;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import java.net.URI;
@Configuration(proxyBeanMethods = false)
public class Routes {
    
//    @Value("${service.product.url}")
//    private String productServiceUrl;

    @Value("${service.order.url}")
    private String orderServiceUrl;
    
    @Value("${service.cart.url}")
    private String cartServiceUrl;
    
    @Value("${service.logistic.url}")
    private String logisticsServiceUrl;
    
    @Value("${service.payment.url}")
    private String paymentServiceUrl;
    
    @Value("${service.stock.url}")
    private String stockServiceUrl;
    
    @Value("${service.marketplace.url}")
    private String marketplaceUrl;    

    @Value("${server.port:8080}")
    private String serverPort;
//    @Value("${service.inventory.url}")
//    private String inventoryServiceUrl;
//
//    @Value("${service.payment.url}")
//    private String paymentServiceUrl;
//
//    @Value("${service.auth.url}")
//    private String authServiceUrl;
    public Routes() {
	System.out.println("Routes bean created");
//	System.out.println("Product Service URL: " + productServiceUrl);
	System.out.println("Order Service URL: " + orderServiceUrl);
    }
    
//    @Bean
//    public RouterFunction<ServerResponse> productServiceRoute() {
//            return route("product_service")
//                            .route(RequestPredicates.path("/api/product/**"), http(productServiceUrl))
//                            .filter(circuitBreaker("productServiceCircuitBreaker",
//                                            URI.create("forward:/fallbackRoute")))
//                            .build();
//    }

    @Bean
    public RouterFunction<ServerResponse> orderServiceRoute() {
            return route("order-service")
                            .route(RequestPredicates.path("/api/orders/**"), http(orderServiceUrl))
//                            .filter(circuitBreaker("orderServiceCircuitBreaker",
//                                            URI.create("forward:/fallbackRoute")))
                            .build();
    }



    
    @Bean
	public RouterFunction<ServerResponse> cartSServiceRoute() {
    			return route("cart-service")
    							.route(RequestPredicates.path("/api/cart/**"), http(cartServiceUrl))
								.filter(circuitBreaker("cartServiceCircuitBreaker",
												URI.create("forward:/fallbackRoute")))
								.build();
    }
    
    @Bean
    public RouterFunction<ServerResponse> logisticServiceRoute() {
			return route("logistic-service")
							.route(RequestPredicates.path("/api/logistics/**"), http(logisticsServiceUrl))
							.filter(circuitBreaker("logisticServiceCircuitBreaker",
											URI.create("forward:/fallbackRoute")))
							.build();
	}
    
    @Bean
    public RouterFunction<ServerResponse> paymentServiceRoute() {
    
    				return route("payment-service")
							.route(RequestPredicates.path("/api/payments/**"), http(paymentServiceUrl))
							.filter(circuitBreaker("paymentServiceCircuitBreaker",
											URI.create("forward:/fallbackRoute")))
							.build();
    				}
    
    @Bean	
    public RouterFunction<ServerResponse> stockServiceRoute() {
    
    				return route("stock-service")
							.route(RequestPredicates.path("/api/stock/**"), http("http://localhost:8084"))
							.filter(circuitBreaker("stockServiceCircuitBreaker",
											URI.create("forward:/fallbackRoute")))
							.build();
    				}
    
				
  @Bean
  public RouterFunction<ServerResponse> defaultRoute() {
	
  				return route("default_route")
							.route(RequestPredicates.all(), http(marketplaceUrl))
							.build();
  }
//		
//  		
//  	
//					}
//  @Bean
//  public RouterFunction<ServerResponse> defaultRoute() {
//	
// 
//	  return route("default-route")
//			  .route(RequestPredicates.path("/**"),
//					   
//                      http("http://localhost:" + serverPort))
//			  .filter(circuitBreaker("defaultServiceCircuitBreaker",
//					  URI.create("forward:/fallbackRoute")))
//			  .build();
//  		
//  	
//					}

    @Bean
    public RouterFunction<ServerResponse> fallbackRoute() {
            return route("fallbackRoute")
                            .GET("/fallbackRoute", request -> ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                                            .body("Service is temporarily unavailable. Please try again later."))
                            .POST("/fallbackRoute", request -> ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                                            .body("Service is temporarily unavailable. Please try again later."))
                            .build();
    }
}
