# Huong dan refactor order-service theo Clean Architecture

Tai lieu nay tap trung vao code hien tai cua order-service va de xuat lo trinh refactor an toan theo tung pha, han che pha vo API dang chay.

## 1) Muc tieu refactor

- Tach ro business rule khoi framework Spring, JPA, Kafka, Redis, WebClient.
- Giam coupling giua controller, service va repository.
- Dong nhat quy tac xu ly loi, transaction, publish event.
- De test business logic bang unit test khong can boot context Spring.
- De mo rong nghiep vu shipment adjustment, order status workflow ma khong sua nhieu tang.

## 2) Van de hien tai (dua tren code hien co)

1. Controller phu thuoc truc tiep repository, khong di qua use case.

- [order-service/src/main/java/docker_test/com/controller/OrderController.java](order-service/src/main/java/docker_test/com/controller/OrderController.java)

2. Service chua vua business, vua persistence, vua response HTTP (ResponseEntity), vua thao tac cache Redis.

- [order-service/src/main/java/docker_test/com/service/OrderService.java](order-service/src/main/java/docker_test/com/service/OrderService.java)

3. DTO request/response bi dung lam event payload domain va luon cho persistence flow.

- [order-service/src/main/java/docker_test/com/dto/OrderDTO.java](order-service/src/main/java/docker_test/com/dto/OrderDTO.java)
- [order-service/src/main/java/docker_test/com/dto/OrderCreatedEvent.java](order-service/src/main/java/docker_test/com/dto/OrderCreatedEvent.java)

4. Tang messaging co 2 huong khai niem chua thong nhat (OrderEventPublisher va OrderProducer), de gay logic trung lap.

- [order-service/src/main/java/docker_test/com/publisher/OrderEventPublisher.java](order-service/src/main/java/docker_test/com/publisher/OrderEventPublisher.java)
- [order-service/src/main/java/docker_test/com/kafka/OrderProducer.java](order-service/src/main/java/docker_test/com/kafka/OrderProducer.java)

5. Domain model dang dung truc tiep JPA entity, business rule bi khoa chat vao persistence annotation.

- [order-service/src/main/java/docker_test/com/model/Order.java](order-service/src/main/java/docker_test/com/model/Order.java)
- [order-service/src/main/java/docker_test/com/model/OrderShipment.java](order-service/src/main/java/docker_test/com/model/OrderShipment.java)

## 3) Kien truc dich de huong toi

Quy tac phu thuoc:

- Adapter/Infrastructure duoc phep phu thuoc vao Application + Domain.
- Application duoc phep phu thuoc vao Domain.
- Domain khong phu thuoc vao bat ky framework nao.

### Goi y package structure

```
docker_test.com.order
  domain
    model
    service
    event
    exception
  application
    port
      in
      out
    usecase
    dto
    mapper
  adapter
    in
      web
      kafka
    out
      persistence
      messaging
      cache
      logistics
  infrastructure
    config
```

## 4) Mapping tu hien trang sang cau truc moi

- controller -> adapter.in.web
- dto request/response HTTP -> adapter.in.web.dto
- use case interface -> application.port.in
- output port (repository, publisher, cache, external API) -> application.port.out
- orchestration business -> application.usecase
- domain model, domain service, rule validate -> domain
- JPA entity + Spring Data repository + mapper -> adapter.out.persistence
- Kafka publisher/subscriber implementation -> adapter.out.messaging va adapter.in.kafka
- Redis implementation -> adapter.out.cache
- WebClient logistics implementation -> adapter.out.logistics

## 5) Lo trinh refactor de xuat (khong break manh)

### Phase 0: Khoa pham vi va dat ten

- Chot bounded context: Order + Shipment trong order-service.
- Dat ten use case theo hanh vi:
  - PlaceOrderUseCase
  - GetOrderDetailUseCase
  - ApplyShipmentStatusUseCase
  - ConfirmPackagedUseCase

### Phase 1: Tao application core truoc

- Tao cac input port tai application.port.in.
- Tao cac output port tai application.port.out:
  - OrderPersistencePort
  - OrderItemPersistencePort
  - ShipmentPersistencePort
  - OrderEventPort
  - InventoryReservationPort (neu can)
  - LogisticsGatewayPort
- Di chuyen logic tu service sang application.usecase, khong dung ResponseEntity.

Ket qua mong muon:

- Use case tra ve object ket qua typed, nem exception nghiep vu.

### Phase 2: Tach adapter persistence

- Giu Spring Data repository hien tai nhung chuyen vao adapter.out.persistence.jpa.
- Tao mapper giua domain object va JPA entity.
- Use case chi biet output port, khong biet JpaRepository.

Ket qua mong muon:

- Co the doi JPA bang cach luu khac ma khong sua use case.

### Phase 3: Tach adapter messaging va external

- Hop nhat huong publish event: chi giu 1 outbound adapter.
- Event payload dung object rieng cua integration, khong dung OrderDTO request.
- Shipment status consumer (Kafka) la inbound adapter, goi input port.

Ket qua mong muon:

- Loi publish event duoc quan ly ro: retry, dead letter, outbox (neu can).

### Phase 4: Chuan hoa web adapter

- Controller chi lam 4 viec:
  - parse request
  - goi input port
  - map response
  - map exception qua global exception handler
- Loai bo repository injection khoi controller.
- Chuan hoa validation tai request model + application validator.

Ket qua mong muon:

- Controller rat mong, business nam o use case.

### Phase 5: Don dep va bao ve kien truc

- Xoa code legacy trung lap sau khi route moi on dinh.
- Them test kien truc (ArchUnit) de cam vi pham phu thuoc tang.
- Them package-info va naming convention de team follow.

## 6) Mau thiet ke cho use case Place Order

Input port:

```java
public interface PlaceOrderUseCase {
    PlaceOrderResult handle(PlaceOrderCommand command);
}
```

Use case trien khai:

```java
public class PlaceOrderService implements PlaceOrderUseCase {
    private final OrderPersistencePort orderPort;
    private final ShipmentPersistencePort shipmentPort;
    private final OrderEventPort eventPort;

    @Override
    public PlaceOrderResult handle(PlaceOrderCommand command) {
        // 1) validate command va business rule
        // 2) tao aggregate Order
        // 3) luu qua persistence port
        // 4) publish event qua event port
        // 5) tra ve ket qua
    }
}
```

Outbound adapter JPA:

```java
@Component
public class OrderPersistenceAdapter implements OrderPersistencePort {
    private final SpringDataOrderRepository repository;
    private final OrderEntityMapper mapper;

    @Override
    public Order save(Order order) {
        OrderEntity saved = repository.save(mapper.toEntity(order));
        return mapper.toDomain(saved);
    }
}
```

## 7) Quy tac coding de giu dung Clean Architecture

- Khong dung ResponseEntity trong application va domain.
- Khong dung annotation JPA trong domain model.
- Khong cho controller goi repository truc tiep.
- Khong dung DTO HTTP lam message event noi bo.
- Moi outbound dependency phai qua interface port.
- Moi use case co test don vi doc lap.

## 8) Ke hoach test song song khi refactor

1. Golden test cho API hien tai (contract test cho endpoint quan trong).
2. Unit test cho use case moi (khong Spring).
3. Adapter integration test:

- persistence adapter voi Testcontainers Postgres/MySQL
- kafka adapter voi embedded/testcontainer

4. Regression test cho cac luong:

- place order thanh cong
- rollback khi loi publish event
- shipment status update
- order not found

## 9) Ke hoach thuc thi 2 tuan (goi y)

- Ngay 1-2: Tao skeleton package + ports + use case interfaces.
- Ngay 3-5: Refactor PlaceOrder sang use case + persistence adapter.
- Ngay 6-7: Refactor GetOrderDetail + GetOrderItems.
- Ngay 8-9: Refactor ShipmentStatus consumer + publisher.
- Ngay 10: Don dep legacy, bo sung tests, review kien truc.

## 10) Checklist Done Definition

- [ ] Tat ca controller chi phu thuoc input ports.
- [ ] Khong con repository inject truc tiep vao controller.
- [ ] Khong con ResponseEntity trong application service.
- [ ] Tat ca dependency ra ngoai di qua output ports.
- [ ] Co unit test cho moi use case chinh.
- [ ] Co integration test cho persistence va messaging adapters.
- [ ] Co tai lieu package structure cho team onboard.

## 11) Thu tu uu tien refactor trong code hien tai

1. Bat dau tu [order-service/src/main/java/docker_test/com/controller/OrderController.java](order-service/src/main/java/docker_test/com/controller/OrderController.java) de cat direct dependency repository.
2. Tach [order-service/src/main/java/docker_test/com/service/OrderService.java](order-service/src/main/java/docker_test/com/service/OrderService.java) thanh use case + ports.
3. Hop nhat publisher tai [order-service/src/main/java/docker_test/com/publisher/OrderEventPublisher.java](order-service/src/main/java/docker_test/com/publisher/OrderEventPublisher.java), giam logic trung lap tu [order-service/src/main/java/docker_test/com/kafka/OrderProducer.java](order-service/src/main/java/docker_test/com/kafka/OrderProducer.java).
4. Sau cung moi don dep DTO va event model.

---

Neu ban muon, buoc tiep theo minh co the tao san bo khung package + interface port/use case dau tien cho luong Place Order de team co diem khoi dau coding ngay.

Tai lieu vi du rieng cho PlaceOrderUseCase:

- [order-service/PLACE_ORDER_USECASE_EXAMPLE.md](order-service/PLACE_ORDER_USECASE_EXAMPLE.md)
