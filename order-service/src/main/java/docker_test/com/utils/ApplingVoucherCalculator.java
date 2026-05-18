//package docker_test.com.utils;
//
//import java.util.List;
//
//import docker_test.com.model.OrderItem;
//
//public class ApplingVoucherCalculator {
//
//    public static List<OrderItem> allocatePlatformDiscount(
//            List<OrderItem> items,
//            double platformDiscount
//    ) {
//
//        double total = items.stream()
//                .mapToDouble(OrderItem::getTotalAfterShopVoucher)
//                .sum();
//
//        if (total <= 0 || platformDiscount <= 0) {
//            return items;
//        }
//
//        double allocatedSum = 0;
//
//        for (OrderItem item : items) {
//
//            double ratio =
//                    item.getTotalAfterShopVoucher() / total;
//
//            double raw =
//                    platformDiscount * ratio;
//
//            double allocated =
//                    floor2(raw);
//
//            item.setPlatformVoucherDiscountAmount(
//                    allocated
//            );
//
//            allocatedSum += allocated;
//        }
//
//        double remainder =
//                round2(platformDiscount - allocatedSum);
//
//        OrderItem lastItem =
//                items.get(items.size() - 1);
//
//        lastItem.setPlatformVoucherDiscountAmount(
//                round2(
//                        lastItem.getPlatformVoucherDiscountAmount()
//                                + remainder
//                )
//        );
//
//        calculateUnitPlatformDiscount(items);
//
//        return items;
//    }
//
//    public static List<OrderItem> allocateShopDiscount(
//            List<OrderItem> items,
//            double shopDiscount
//    ) {
//
//        double total = items.stream()
//                .mapToDouble(OrderItem::getTotalPrice)
//                .sum();
//
//        if (total <= 0 || shopDiscount <= 0) {
//            return items;
//        }
//
//        double allocatedSum = 0;
//
//        for (OrderItem item : items) {
//
//            double ratio =
//                    item.getTotalPrice() / total;
//
//            double raw =
//                    shopDiscount * ratio;
//
//            double allocated =
//                    floor2(raw);
//
//            item.setShopVoucherDiscountAmount(
//                    allocated
//            );
//
//            allocatedSum += allocated;
//        }
//
//        double remainder =
//                round2(shopDiscount - allocatedSum);
//
//        OrderItem lastItem =
//                items.get(items.size() - 1);
//
//        lastItem.setShopVoucherDiscountAmount(
//                round2(
//                        lastItem.getShopVoucherDiscountAmount()
//                                + remainder
//                )
//        );
//
//        calculateUnitShopDiscount(items);
//
//        return items;
//    }
//
//    private static void calculateUnitShopDiscount(
//            List<OrderItem> items
//    ) {
//
//        for (OrderItem item : items) {
//
//            if (item.getQuantity() <= 0) {
//                continue;
//            }
//
//            double unitDiscount =
//                    round2(
//                            item.getShopVoucherDiscountAmount()
//                                    / item.getQuantity()
//                    );
//
//            item.setUnitShopVoucherDiscount(
//                    unitDiscount
//            );
//        }
//    }
//
//    private static void calculateUnitPlatformDiscount(
//            List<OrderItem> items
//    ) {
//
//        for (OrderItem item : items) {
//
//            if (item.getQuantity() <= 0) {
//                continue;
//            }
//
//            double unitDiscount = round2(
//                            item.getPlatformVoucherDiscountAmount()
//                                    / item.getQuantity()
//                    );
//
//            item.setUnitPlatformVoucherDiscount(
//                    unitDiscount
//            );
//        }
//    }
//
//    public static double floor2(double value) {
//        return Math.floor(value * 100) / 100;
//    }
//
//    public static double round2(double value) {
//        return Math.round(value * 100.0) / 100.0;
//    }
//}