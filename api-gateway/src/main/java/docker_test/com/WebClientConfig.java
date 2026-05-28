// package docker_test.com;

// import io.netty.resolver.dns.DnsNameResolverBuilder;
// import io.netty.resolver.dns.DnsAddressResolverGroup;
// import io.netty.channel.epoll.EpollDatagramChannel;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.client.reactive.ReactorClientHttpConnector;
// import org.springframework.web.reactive.function.client.WebClient;
// import reactor.netty.http.client.HttpClient;
// import java.time.Duration;

// @Configuration
// public class WebClientConfig {

//     @Bean
//     public WebClient webClient() {
//         // Build a dedicated custom DNS resolver with a strict TTL policy
// //        DnsNameResolverBuilder dnsBuilder = new DnsNameResolverBuilder()
// //                .channelFactory(EpollDatagramChannel::new) // Or NioDatagramChannel::new depending on OS
// //                .cacheMaxTimeToLive(Duration.ofSeconds(10))
// //                .cacheNegativeTimeToLive(Duration.ofSeconds(5));

//         // Inject resolver into Netty HttpClient
//         HttpClient httpClient = HttpClient.create()
//                 .resolver(spec -> spec
//                         .cacheMaxTimeToLive(Duration.ofSeconds(10))
//                         .cacheNegativeTimeToLive(Duration.ofSeconds(5))
//                 );
//         return WebClient.builder()
//                 .clientConnector(new ReactorClientHttpConnector(httpClient))
//                 .build();
//     }
// }