//package docker_test.com.services;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.when;
//
//import java.lang.reflect.Field;
//import java.util.List;
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import docker_test.com.dto.OrderItemSnapshotDTO;
//import docker_test.com.dto.OrderPricingSnapshotDTO;
//import docker_test.com.dto.RefundCalculationResultDTO;
//import docker_test.com.models.refunds.ReturnRequest;
//import docker_test.com.models.refunds.ReturnRequestItem;
//import docker_test.com.models.refunds.ReturnRequestStatus;
//import docker_test.com.repository.RefundRequestRepository;
//
//@ExtendWith(MockitoExtension.class)
//class RefundCalculationServiceTest {
//
//    @Mock
//    private RefundRequestRepository refundRequestRepository;
//
//    @Mock
//    private OrderPricingSnapshotService orderPricingSnapshotService;
//
//    private RefundCalculationService refundCalculationService;
//    
//    private
//
//    @BeforeEach
//    void setUp() {
//        refundCalculationService = new RefundCalculationService(refundRequestRepository, orderPricingSnapshotService,"http://103.90.225.130:8002");
//    }
//
//    @Test
//    void scenario1_voucherStillValid_refundEqualsCurrentReturnedPaidAmount() {
//        ReturnRequest current = buildRequest(
//                1001L,
//                500L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(buildItem(1L, 1, 40.0)));
//
//        stubCurrentRequest(1001L, current);
//        stubSnapshot(500L, List.of(
//                buildSnapshotItem(1L, 2, 80.0),
//                buildSnapshotItem(2L, 1, 20.0)));
//        when(refundRequestRepository.findByOrderIdAndStatusIn(eq(500L), any())).thenReturn(List.of());
//
//        RefundCalculationResultDTO result = refundCalculationService.calculateByReturnRequestId(1001L);
//
//        assertEquals(100.0, result.getCurrentPaidAmount());
//        assertEquals(60.0, result.getRecalculatedAmount());
//        assertEquals(0.0, result.getAlreadyRefundedAmount());
//        assertEquals(40.0, result.getSuggestedRefundAmount());
//    }
//
//    @Test
//    void scenario2_snapshotBasedCalculation_withoutThresholdRevalidation_refundFollowsPaidUnits() {
//        ReturnRequest current = buildRequest(
//                1002L,
//                501L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(buildItem(1L, 1, 30.0)));
//
//        stubCurrentRequest(1002L, current);
//        stubSnapshot(501L, List.of(
//                buildSnapshotItem(1L, 1, 30.0),
//                buildSnapshotItem(2L, 1, 10.0)));
//        when(refundRequestRepository.findByOrderIdAndStatusIn(eq(501L), any())).thenReturn(List.of());
//
//        RefundCalculationResultDTO result = refundCalculationService.calculateByReturnRequestId(1002L);
//
//        assertEquals(40.0, result.getCurrentPaidAmount());
//        assertEquals(10.0, result.getRecalculatedAmount());
//        assertEquals(30.0, result.getSuggestedRefundAmount());
//    }
//
//    @Test
//    void scenario3_partialReturn_onlyReturnedUnitsContributeToRefund() {
//        ReturnRequest current = buildRequest(
//                1003L,
//                502L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(buildItem(10L, 1, 25.0)));
//
//        stubCurrentRequest(1003L, current);
//        stubSnapshot(502L, List.of(buildSnapshotItem(10L, 4, 100.0)));
//        when(refundRequestRepository.findByOrderIdAndStatusIn(eq(502L), any())).thenReturn(List.of());
//
//        RefundCalculationResultDTO result = refundCalculationService.calculateByReturnRequestId(1003L);
//
//        assertEquals(100.0, result.getCurrentPaidAmount());
//        assertEquals(75.0, result.getRecalculatedAmount());
//        assertEquals(25.0, result.getSuggestedRefundAmount());
//    }
//
//    @Test
//    void scenario4_returnEntireShipment_refundAllRemainingPaidAfterPreviousRefund() {
//        ReturnRequest previousRefunded = buildRequest(
//                2001L,
//                503L,
//                ReturnRequestStatus.REFUNDED,
//                30.0,
//                List.of(buildItem(1L, 1, 30.0)));
//
//        ReturnRequest current = buildRequest(
//                2002L,
//                503L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(
//                        buildItem(1L, 1, 30.0),
//                        buildItem(2L, 1, 20.0)));
//
//        stubCurrentRequest(2002L, current);
//        stubSnapshot(503L, List.of(
//                buildSnapshotItem(1L, 2, 60.0),
//                buildSnapshotItem(2L, 1, 20.0)));
//        when(refundRequestRepository.findByOrderIdAndStatusIn(eq(503L), any()))
//                .thenReturn(List.of(previousRefunded));
//
//        RefundCalculationResultDTO result = refundCalculationService.calculateByReturnRequestId(2002L);
//
//        assertEquals(80.0, result.getCurrentPaidAmount());
//        assertEquals(0.0, result.getRecalculatedAmount());
//        assertEquals(30.0, result.getAlreadyRefundedAmount());
//        assertEquals(50.0, result.getSuggestedRefundAmount());
//    }
//
//    @Test
//    void scenario5_multipleReturns_useCumulativeApprovedReturns() {
//        ReturnRequest approvedFirst = buildRequest(
//                3001L,
//                504L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(buildItem(50L, 1, 20.0)));
//
//        ReturnRequest refundedSecond = buildRequest(
//                3002L,
//                504L,
//                ReturnRequestStatus.REFUNDED,
//                20.0,
//                List.of(buildItem(50L, 1, 20.0)));
//
//        ReturnRequest currentThird = buildRequest(
//                3003L,
//                504L,
//                ReturnRequestStatus.APPROVED,
//                0.0,
//                List.of(buildItem(50L, 1, 20.0)));
//
//        stubCurrentRequest(3003L, currentThird);
//        stubSnapshot(504L, List.of(buildSnapshotItem(50L, 4, 80.0)));
//        when(refundRequestRepository.findByOrderIdAndStatusIn(eq(504L), any()))
//                .thenReturn(List.of(approvedFirst, refundedSecond));
//
//        RefundCalculationResultDTO result = refundCalculationService.calculateByReturnRequestId(3003L);
//
//        assertEquals(80.0, result.getCurrentPaidAmount());
//        assertEquals(20.0, result.getRecalculatedAmount());
//        assertEquals(20.0, result.getAlreadyRefundedAmount());
//        assertEquals(40.0, result.getSuggestedRefundAmount());
//    }
//
//    private void stubCurrentRequest(Long requestId, ReturnRequest request) {
//        when(refundRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
//        when(refundRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
//    }
//
//    private void stubSnapshot(Long orderId, List<OrderItemSnapshotDTO> items) {
//        OrderPricingSnapshotDTO snapshot = new OrderPricingSnapshotDTO();
//        snapshot.setId(orderId);
//        snapshot.setFinalAmount(items.stream().mapToDouble(OrderItemSnapshotDTO::getTotalAfterAllVouchers).sum());
//        snapshot.setItems(items);
//        when(orderPricingSnapshotService.getOrderPricingSnapshot(orderId)).thenReturn(snapshot);
//    }
//
//    private ReturnRequest buildRequest(
//            Long id,
//            Long orderId,
//            ReturnRequestStatus status,
//            double refundedAmount,
//            List<ReturnRequestItem> items) {
//        ReturnRequest request = new ReturnRequest();
//        request.setId(id);
//        request.setOrderId(orderId);
//        request.setStatus(status);
//        request.setRefundedAmount(refundedAmount);
//        request.setItems(items);
//        return request;
//    }
//
//    private ReturnRequestItem buildItem(Long orderItemId, int quantity, double requestedAmount) {
//        ReturnRequestItem item = new ReturnRequestItem();
//        setField(item, "orderItemId", orderItemId);
//        setField(item, "quantity", quantity);
//        setField(item, "requestedAmount", requestedAmount);
//        return item;
//    }
//
//    private OrderItemSnapshotDTO buildSnapshotItem(Long id, Integer quantity, Double paidTotal) {
//        OrderItemSnapshotDTO item = new OrderItemSnapshotDTO();
//        item.setId(id);
//        item.setQuantity(quantity);
//        item.setTotalAfterAllVouchers(paidTotal);
//        return item;
//    }
//
//    private void setField(Object target, String fieldName, Object value) {
//        try {
//            Field field = target.getClass().getDeclaredField(fieldName);
//            field.setAccessible(true);
//            field.set(target, value);
//        } catch (ReflectiveOperationException ex) {
//            throw new IllegalStateException("Cannot set field " + fieldName, ex);
//        }
//    }
//}
