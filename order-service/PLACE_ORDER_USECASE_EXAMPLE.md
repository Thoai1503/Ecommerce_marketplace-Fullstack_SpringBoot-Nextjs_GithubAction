# PlaceOrderUseCase - tai lieu vi du cu the cho order-service

Tai lieu nay chi tap trung vao nghiep vu dat hang (Place Order) theo Clean Architecture, dung boi canh code hien tai cua order-service.

## 1) Muc tieu cua PlaceOrderUseCase

- Nhan yeu cau dat hang tu API.
- Validate du lieu va business rule.
- Tao Order + OrderItem + OrderShipment.
- Luu du lieu theo transaction.
- Phat su kien order created de cac service khac xu ly tiep.
- Tra ket qua don gian cho web adapter.

## 2) Hien trang can refactor

Code hien tai dang tron nhieu tang trong cung mot service:

- [order-service/src/main/java/docker_test/com/service/OrderService.java](order-service/src/main/java/docker_test/com/service/OrderService.java)

Controller hien tai con goi repository truc tiep cho cac endpoint khac, can dong nhat theo huong input port:

- [order-service/src/main/java/docker_test/com/controller/OrderController.java](order-service/src/main/java/docker_test/com/controller/OrderController.java)

## 3) Thiet ke dich cho rieng PlaceOrderUseCase

### 3.1 Package structure toi thieu

```
order-service/src/main/java/docker_test/com/order/
  domain/
    model/
      OrderAggregate.java
      OrderLine.java
      ShipmentDraft.java
    service/
      PlaceOrderDomainService.java
    exception/
      InvalidOrderException.java
      OutOfStockException.java
  application/
    port/
      in/
        PlaceOrderUseCase.java
      out/
        OrderPersistencePort.java
        OrderItemPersistencePort.java
        ShipmentPersistencePort.java
        OrderEventPort.java
    usecase/
      PlaceOrderService.java
    dto/
      PlaceOrderCommand.java
      PlaceOrderResult.java
  adapter/
    in/web/
      PlaceOrderController.java
      dto/
        PlaceOrderRequest.java
        PlaceOrderResponse.java
      mapper/
        PlaceOrderWebMapper.java
    out/persistence/
      OrderPersistenceAdapter.java
      OrderItemPersistenceAdapter.java
      ShipmentPersistenceAdapter.java
    out/messaging/
      KafkaOrderEventAdapter.java
```

### 3.2 Trinh tu xu ly

1. Web adapter map JSON request -> PlaceOrderCommand.
2. Use case validate command va dung domain service de tao aggregate hop le.
3. Use case goi output port de save order, shipments, items.
4. Use case goi output port publish event.
5. Use case tra PlaceOrderResult.
6. Web adapter map PlaceOrderResult -> response HTTP.

## 4) Code mau cu the

### 4.1 Input port

```java
package docker_test.com.order.application.port.in;

import docker_test.com.order.application.dto.PlaceOrderCommand;
import docker_test.com.order.application.dto.PlaceOrderResult;

public interface PlaceOrderUseCase {
    PlaceOrderResult handle(PlaceOrderCommand command);
}
```

### 4.2 Command va Result

```java
package docker_test.com.order.application.dto;

import java.util.List;

public record PlaceOrderCommand(
        Long userId,
        Long addressId,
        Long shippingFee,
        Long discountAmount,
        String paymentMethod,
        Long finalAmount,
        Double totalAmount,
        Recipient recipient,
        List<Item> items,
        List<Shipment> shipments
) {
    public record Recipient(String name, String phone) {}

    public record Item(
            Long productId,
            Long variantId,
            Long shopId,
            String productName,
            String variantName,
            String image,
            Long quantity,
            Double price
    ) {}

    public record Shipment(
            Long shopId,
            Double shippingFee,
            Double totalAmount
    ) {}
}
```

```java
package docker_test.com.order.application.dto;

public record PlaceOrderResult(
        Long orderId,
        String orderNumber,
        String orderStatus
) {}
```

### 4.3 Output ports

```java
package docker_test.com.order.application.port.out;

import docker_test.com.order.domain.model.OrderAggregate;

public interface OrderPersistencePort {
    OrderAggregate saveOrder(OrderAggregate aggregate);
}
```

```java
package docker_test.com.order.application.port.out;

import docker_test.com.order.domain.model.OrderLine;
import java.util.List;

public interface OrderItemPersistencePort {
    void saveAll(Long orderId, List<OrderLine> items);
}
```

```java
package docker_test.com.order.application.port.out;

import docker_test.com.order.domain.model.ShipmentDraft;
import java.util.List;

public interface ShipmentPersistencePort {
    List<ShipmentDraft> saveAll(Long orderId, List<ShipmentDraft> shipments);
}
```

```java
package docker_test.com.order.application.port.out;

import docker_test.com.order.application.dto.PlaceOrderResult;

public interface OrderEventPort {
    void publishOrderCreated(PlaceOrderResult result);
}
```

### 4.4 Domain model rut gon

```java
package docker_test.com.order.domain.model;

import java.util.List;

public record OrderAggregate(
        Long id,
        String orderNumber,
        Long userId,
        Long addressId,
        Long shippingFee,
        Long discountAmount,
        Long finalAmount,
        String paymentMethod,
        String paymentStatus,
        String orderStatus,
        Double totalAmount,
        List<OrderLine> items,
        List<ShipmentDraft> shipments
) {
    public OrderAggregate withIdAndNumber(Long newId, String newOrderNumber) {
        return new OrderAggregate(
                newId,
                newOrderNumber,
                userId,
                addressId,
                shippingFee,
                discountAmount,
                finalAmount,
                paymentMethod,
                paymentStatus,
                orderStatus,
                totalAmount,
                items,
                shipments
        );
    }
}
```

```java
package docker_test.com.order.domain.model;

public record OrderLine(
        Long id,
        Long orderId,
        Long shipmentId,
        Long shopId,
        Long productId,
        Long variantId,
        String productName,
        String variantName,
        String image,
        Long quantity,
        Double price,
        Double totalPrice
) {}
```

```java
package docker_test.com.order.domain.model;

public record ShipmentDraft(
        Long id,
        Long orderId,
        Long shopId,
        String carrierName,
        Double shippingFee,
        Double totalAmount,
        String trackingNumber,
        String shippingStatus
) {}
```

### 4.5 Use case implementation (trong application)

```java
package docker_test.com.order.application.usecase;

import docker_test.com.order.application.dto.PlaceOrderCommand;
import docker_test.com.order.application.dto.PlaceOrderResult;
import docker_test.com.order.application.port.in.PlaceOrderUseCase;
import docker_test.com.order.application.port.out.OrderEventPort;
import docker_test.com.order.application.port.out.OrderItemPersistencePort;
import docker_test.com.order.application.port.out.OrderPersistencePort;
import docker_test.com.order.application.port.out.ShipmentPersistencePort;
import docker_test.com.order.domain.exception.InvalidOrderException;
import docker_test.com.order.domain.model.OrderAggregate;
import docker_test.com.order.domain.model.OrderLine;
import docker_test.com.order.domain.model.ShipmentDraft;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PlaceOrderService implements PlaceOrderUseCase {

    private final OrderPersistencePort orderPersistencePort;
    private final ShipmentPersistencePort shipmentPersistencePort;
    private final OrderItemPersistencePort orderItemPersistencePort;
    private final OrderEventPort orderEventPort;

    public PlaceOrderService(
            OrderPersistencePort orderPersistencePort,
            ShipmentPersistencePort shipmentPersistencePort,
            OrderItemPersistencePort orderItemPersistencePort,
            OrderEventPort orderEventPort
    ) {
        this.orderPersistencePort = orderPersistencePort;
        this.shipmentPersistencePort = shipmentPersistencePort;
        this.orderItemPersistencePort = orderItemPersistencePort;
        this.orderEventPort = orderEventPort;
    }

    @Override
    @Transactional
    public PlaceOrderResult handle(PlaceOrderCommand command) {
        validate(command);

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        List<OrderLine> lines = command.items().stream()
                .map(item -> new OrderLine(
                        null,
                        null,
                        null,
                        item.shopId(),
                        item.productId(),
                        item.variantId(),
                        item.productName(),
                        item.variantName(),
                        item.image(),
                        item.quantity(),
                        item.price(),
                        item.price() * item.quantity()
                ))
                .toList();

        List<ShipmentDraft> shipments = command.shipments().stream()
                .map(s -> new ShipmentDraft(
                        null,
                        null,
                        s.shopId(),
                        "LOG",
                        s.shippingFee(),
                        s.totalAmount(),
                        null,
                        "PENDING"
                ))
                .toList();

        OrderAggregate draft = new OrderAggregate(
                null,
                orderNumber,
                command.userId(),
                command.addressId(),
                command.shippingFee(),
                command.discountAmount(),
                command.finalAmount(),
                command.paymentMethod(),
                "PENDING",
                "PENDING",
                command.totalAmount(),
                lines,
                shipments
        );

        OrderAggregate saved = orderPersistencePort.saveOrder(draft);

        List<ShipmentDraft> savedShipments = shipmentPersistencePort.saveAll(saved.id(), saved.shipments());

        List<OrderLine> linkedLines = linkShipmentForItems(saved.id(), lines, savedShipments);
        orderItemPersistencePort.saveAll(saved.id(), linkedLines);

        PlaceOrderResult result = new PlaceOrderResult(saved.id(), saved.orderNumber(), saved.orderStatus());

        // Neu publish loi, throw exception de rollback transaction
        orderEventPort.publishOrderCreated(result);

        return result;
    }

    private void validate(PlaceOrderCommand command) {
        if (command.userId() == null) {
            throw new InvalidOrderException("userId is required");
        }
        if (command.items() == null || command.items().isEmpty()) {
            throw new InvalidOrderException("order items must not be empty");
        }
        if (command.finalAmount() == null || command.finalAmount() < 0) {
            throw new InvalidOrderException("finalAmount is invalid");
        }
    }

    private List<OrderLine> linkShipmentForItems(
            Long orderId,
            List<OrderLine> items,
            List<ShipmentDraft> savedShipments
    ) {
        return items.stream().map(item -> {
            Long shipmentId = savedShipments.stream()
                    .filter(s -> s.shopId().equals(item.shopId()))
                    .findFirst()
                    .map(ShipmentDraft::id)
                    .orElse(null);

            return new OrderLine(
                    item.id(),
                    orderId,
                    shipmentId,
                    item.shopId(),
                    item.productId(),
                    item.variantId(),
                    item.productName(),
                    item.variantName(),
                    item.image(),
                    item.quantity(),
                    item.price(),
                    item.totalPrice()
            );
        }).collect(Collectors.toList());
    }
}
```

### 4.6 Web adapter example

```java
package docker_test.com.order.adapter.in.web;

import docker_test.com.order.application.dto.PlaceOrderCommand;
import docker_test.com.order.application.dto.PlaceOrderResult;
import docker_test.com.order.application.port.in.PlaceOrderUseCase;
import docker_test.com.order.adapter.in.web.dto.PlaceOrderRequest;
import docker_test.com.order.adapter.in.web.dto.PlaceOrderResponse;
import docker_test.com.order.adapter.in.web.mapper.PlaceOrderWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class PlaceOrderController {

    private final PlaceOrderUseCase placeOrderUseCase;

    public PlaceOrderController(PlaceOrderUseCase placeOrderUseCase) {
        this.placeOrderUseCase = placeOrderUseCase;
    }

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        PlaceOrderCommand command = PlaceOrderWebMapper.toCommand(request);
        PlaceOrderResult result = placeOrderUseCase.handle(command);
        PlaceOrderResponse response = PlaceOrderWebMapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### 4.7 Outbound messaging adapter example

```java
package docker_test.com.order.adapter.out.messaging;

import docker_test.com.order.application.dto.PlaceOrderResult;
import docker_test.com.order.application.port.out.OrderEventPort;
import org.springframework.kafka.core.KafkaTemplate;

public class KafkaOrderEventAdapter implements OrderEventPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String topic;

    public KafkaOrderEventAdapter(KafkaTemplate<String, Object> kafkaTemplate, String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    @Override
    public void publishOrderCreated(PlaceOrderResult result) {
        OrderCreatedIntegrationEvent event = new OrderCreatedIntegrationEvent(
                result.orderId(),
                result.orderNumber(),
                result.orderStatus()
        );

        kafkaTemplate.send(topic, String.valueOf(result.orderId()), event)
                .join();
    }

    public record OrderCreatedIntegrationEvent(
            Long orderId,
            String orderNumber,
            String status
    ) {}
}
```

## 5) Mapping field tu OrderDTO hien tai sang PlaceOrderCommand

- user_id -> userId
- address_id -> addressId
- shipping_fee -> shippingFee
- discount_amount -> discountAmount
- payment_method -> paymentMethod
- final_amount -> finalAmount
- total_price -> totalAmount
- orders_items[] -> items[]
- order_shipment[] -> shipments[]

Khuyen nghi:

- Doi ten field ve camelCase o web request model moi.
- Giu backward compatibility bang @JsonAlias neu can.

## 6) Cau hinh transaction va rollback

- Dat @Transactional tai use case implementation.
- Neu publish event that bai thi nem runtime exception.
- Toan bo save order, shipment, item se rollback.
- Neu can reliability cao hon, ap dung outbox pattern (pha sau).

## 7) Unit test mau cho PlaceOrderUseCase

```java
class PlaceOrderServiceTest {

    private OrderPersistencePort orderPort = mock(OrderPersistencePort.class);
    private ShipmentPersistencePort shipmentPort = mock(ShipmentPersistencePort.class);
    private OrderItemPersistencePort itemPort = mock(OrderItemPersistencePort.class);
    private OrderEventPort eventPort = mock(OrderEventPort.class);

    private PlaceOrderService service = new PlaceOrderService(orderPort, shipmentPort, itemPort, eventPort);

    @Test
    void should_place_order_successfully() {
        PlaceOrderCommand command = TestDataFactory.validCommand();

        when(orderPort.saveOrder(any())).thenReturn(TestDataFactory.savedAggregate());
        when(shipmentPort.saveAll(anyLong(), anyList())).thenReturn(TestDataFactory.savedShipments());

        PlaceOrderResult result = service.handle(command);

        assertNotNull(result.orderId());
        assertEquals("PENDING", result.orderStatus());
        verify(eventPort).publishOrderCreated(result);
    }

    @Test
    void should_throw_when_items_empty() {
        PlaceOrderCommand command = TestDataFactory.commandWithoutItems();

        assertThrows(InvalidOrderException.class, () -> service.handle(command));
        verifyNoInteractions(orderPort, shipmentPort, itemPort, eventPort);
    }
}
```

## 8) Ke hoach cat chuyen an toan tu code cu sang code moi

1. Tao package moi theo structure tren, chua sua endpoint cu.
2. Viet PlaceOrderUseCase + adapter persistence + adapter messaging.
3. Cho controller endpoint POST /api/orders goi use case moi.
4. Giu nguyen GET endpoint trong giai doan chuyen tiep.
5. Chay regression test API place order.
6. Sau khi on dinh, don dep logic cu trong OrderService.

## 9) Checklist rieng cho PlaceOrderUseCase

- [ ] Controller khong phu thuoc repository.
- [ ] Use case khong phu thuoc Spring Data/JPA API.
- [ ] Event payload khong dung lai OrderDTO request cu.
- [ ] Toan bo nghiep vu place order co unit test.
- [ ] Co test rollback khi event publish loi.

## 10) Noi dung ban co the lam ngay

- Tach method placeOrder tu [order-service/src/main/java/docker_test/com/service/OrderService.java](order-service/src/main/java/docker_test/com/service/OrderService.java) sang PlaceOrderService moi trong application layer.
- Tao output port cho 3 nhom: order persistence, shipment persistence, event publishing.
- Sua [order-service/src/main/java/docker_test/com/controller/OrderController.java](order-service/src/main/java/docker_test/com/controller/OrderController.java) de chi goi PlaceOrderUseCase.

Neu ban muon, buoc tiep theo minh co the scaffold luon cac file Java khung (interfaces, command/result, service) de ban paste vao project va chay ngay.
